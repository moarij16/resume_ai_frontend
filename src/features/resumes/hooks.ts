"use client"

import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useApi } from "@/lib/api-context"
import { queryKeys } from "@/lib/query-keys"
import type { Resume, ResumeUpdateInput, UUID } from "@/types/api"

export function useResumes() {
  const { resumes } = useApi()
  return useQuery({ queryKey: queryKeys.resumes.list(), queryFn: () => resumes.list() })
}

export function useResume(id: UUID | null | undefined) {
  const { resumes } = useApi()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKeys.resumes.detail(id ?? ""),
    queryFn: id ? () => resumes.get(id) : skipToken,
    initialData: () =>
      queryClient
        .getQueryData<Resume[]>(queryKeys.resumes.list())
        ?.find((resume) => resume.id === id),
  })
}

export function useUploadResume() {
  const { resumes } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) => resumes.upload(file, name),
    onSuccess: ({ resume, ats_scan }) => {
      queryClient.setQueryData(queryKeys.resumes.detail(resume.id), resume)
      queryClient.setQueryData(queryKeys.ats.detail(ats_scan.id), ats_scan)
      void queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.ats.all })
    },
    meta: { successMessage: "Resume uploaded and scanned." },
  })
}

export function useUpdateResume(id: UUID) {
  const { resumes } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ResumeUpdateInput) => resumes.update(id, input),
    onSuccess: (resume) => {
      queryClient.setQueryData(queryKeys.resumes.detail(id), resume)
      queryClient.setQueryData<Resume[]>(queryKeys.resumes.list(), (list) =>
        list?.map((item) => (item.id === id ? resume : item))
      )
    },
    meta: { successMessage: "Resume saved." },
  })
}

export function useDeleteResume() {
  const { resumes } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => resumes.remove(id),
    onSuccess: (_data, id) => {
      // The backend soft-deletes but still lists the row; drop it from the cache
      // instead of refetching so it disappears for the user.
      queryClient.setQueryData<Resume[]>(queryKeys.resumes.list(), (list) =>
        list?.filter((resume) => resume.id !== id)
      )
      queryClient.removeQueries({ queryKey: queryKeys.resumes.detail(id) })
    },
    meta: { successMessage: "Resume deleted." },
  })
}
