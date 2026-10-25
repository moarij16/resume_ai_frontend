"use client"

import { DownloadIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CopyButton } from "@/components/shared/copy-button"
import { PageHeader } from "@/components/shared/page-header"
import { DetailSkeleton, ErrorState } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useJob } from "@/features/jobs/hooks"
import { useResume } from "@/features/resumes/hooks"
import { formatDateTime } from "@/lib/format"
import type { DownloadFormat, GeneratedDocument, UUID } from "@/types/api"

import { useDeleteDocument, useDocument, useDownloadDocument } from "../hooks"
import { DOCUMENT_TYPES } from "../registry"
import { DocumentTypeBadge } from "./document-type-badge"

const FORMAT_LABELS: Record<DownloadFormat, string> = {
  pdf: "PDF document",
  docx: "Word document (.docx)",
  txt: "Plain text (.txt)",
}

function DocumentSource({ document }: { document: GeneratedDocument }) {
  const { data: resume } = useResume(document.resume)
  const { data: job } = useJob(document.job)
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <DocumentTypeBadge type={document.document_type} />
      {resume ? (
        <Link href={`/resumes/${resume.id}`} className="hover:underline">
          {resume.name}
        </Link>
      ) : null}
      {job ? (
        <>
          <span>for</span>
          <Link href={`/jobs/${job.id}`} className="hover:underline">
            {job.job_title} · {job.company_name}
          </Link>
        </>
      ) : null}
      <span>· {formatDateTime(document.created_at)}</span>
    </span>
  )
}

function DownloadMenu({ document }: { document: GeneratedDocument }) {
  const download = useDownloadDocument()
  const { downloadFormats } = DOCUMENT_TYPES[document.document_type]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={download.isPending}>
          {download.isPending ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : (
            <DownloadIcon data-icon="inline-start" />
          )}
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {downloadFormats.map((format) => (
          <DropdownMenuItem
            key={format}
            onSelect={() => download.mutate({ id: document.id, format })}
          >
            {FORMAT_LABELS[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DocumentDetail({ id }: { id: UUID }) {
  const router = useRouter()
  const { data: document, isPending, error, refetch } = useDocument(id)
  const deleteDocument = useDeleteDocument()

  if (isPending) return <DetailSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />

  const definition = DOCUMENT_TYPES[document.document_type]
  const { Renderer } = definition

  return (
    <>
      <PageHeader
        title={definition.label}
        description={<DocumentSource document={document} />}
        actions={
          <>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label="Delete document">
                  <Trash2Icon />
                </Button>
              }
              title="Delete this document?"
              description="This generated document will be permanently removed."
              confirmLabel="Delete"
              onConfirm={async () => {
                await deleteDocument.mutateAsync(document.id)
                router.replace("/documents")
              }}
            />
            <CopyButton
              value={definition.toPlainText(document.document_content)}
              label="Copy text"
              size="default"
            />
            <DownloadMenu document={document} />
          </>
        }
      />
      <Renderer content={document.document_content} />
    </>
  )
}
