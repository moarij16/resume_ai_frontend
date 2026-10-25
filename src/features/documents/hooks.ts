"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useApi } from "@/lib/api-context"
import { queryKeys } from "@/lib/query-keys"
import type {
  DocumentType,
  DownloadFormat,
  GenerateInput,
  GeneratedDocument,
  UUID,
} from "@/types/api"

export function useDocuments() {
  const { documents } = useApi()
  return useQuery({ queryKey: queryKeys.documents.list(), queryFn: () => documents.list() })
}

export function useDocument(id: UUID) {
  const { documents } = useApi()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documents.get(id),
    initialData: () =>
      queryClient
        .getQueryData<GeneratedDocument[]>(queryKeys.documents.list())
        ?.find((document) => document.id === id),
  })
}

export function useGenerateDocument() {
  const { documents } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, input }: { type: DocumentType; input: GenerateInput }) =>
      documents.generate(type, input),
    onSuccess: (document) => {
      queryClient.setQueryData(queryKeys.documents.detail(document.id), document)
      queryClient.setQueryData<GeneratedDocument[]>(queryKeys.documents.list(), (list) =>
        list ? [document, ...list] : list
      )
    },
    // The generator form renders failures inline with a retry action.
    meta: { silent: true, successMessage: "Document generated." },
  })
}

export function useDeleteDocument() {
  const { documents } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => documents.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<GeneratedDocument[]>(queryKeys.documents.list(), (list) =>
        list?.filter((document) => document.id !== id)
      )
      queryClient.removeQueries({ queryKey: queryKeys.documents.detail(id) })
    },
    meta: { successMessage: "Document deleted." },
  })
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = Object.assign(document.createElement("a"), { href: url, download: filename })
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function useDownloadDocument() {
  const { documents } = useApi()
  return useMutation({
    mutationFn: ({ id, format }: { id: UUID; format: DownloadFormat }) =>
      documents.download(id, format),
    onSuccess: ({ blob, filename }) => saveBlob(blob, filename),
  })
}
