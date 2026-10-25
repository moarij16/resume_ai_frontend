"use client"

import { SparklesIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

import { createDataTableColumns, DataTable } from "@/components/shared/data-table"
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { useJobs } from "@/features/jobs/hooks"
import { useResumes } from "@/features/resumes/hooks"
import { formatDateTime } from "@/lib/format"
import type { GeneratedDocument } from "@/types/api"

import { useDocuments } from "../hooks"
import { DOCUMENT_TYPES } from "../registry"
import { DocumentTypeBadge } from "./document-type-badge"

type DocumentRow = GeneratedDocument & { resumeName: string; jobName: string }

const column = createDataTableColumns<DocumentRow>()

const columns = column.columns([
  column.accessor((row) => DOCUMENT_TYPES[row.document_type].label, {
    id: "type",
    header: "Type",
    cell: (info) => <DocumentTypeBadge type={info.row.original.document_type} />,
  }),
  column.accessor("resumeName", { header: "Resume" }),
  column.accessor("jobName", { header: "Job" }),
  column.accessor("created_at", {
    header: "Created",
    sortFn: "datetime",
    enableGlobalFilter: false,
    cell: (info) => formatDateTime(info.getValue()),
  }),
])

export function DocumentsTable() {
  const router = useRouter()
  const { data, isPending, error, refetch } = useDocuments()
  const { data: resumes } = useResumes()
  const { data: jobs } = useJobs()

  const rows = useMemo<DocumentRow[]>(() => {
    const resumeNames = new Map(resumes?.map((resume) => [resume.id, resume.name]))
    const jobNames = new Map(jobs?.map((job) => [job.id, `${job.job_title} · ${job.company_name}`]))
    return (data ?? []).map((document) => ({
      ...document,
      resumeName: document.resume ? (resumeNames.get(document.resume) ?? "Deleted resume") : "—",
      jobName: document.job ? (jobNames.get(document.job) ?? "Deleted job") : "—",
    }))
  }, [data, resumes, jobs])

  if (isPending) return <TableSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!rows.length) {
    return (
      <EmptyState
        icon={SparklesIcon}
        title="No documents yet"
        description="Generate a cover letter, LinkedIn profile or an improved resume with AI."
        action={
          <Button asChild>
            <Link href="/documents/new">Generate a document</Link>
          </Button>
        }
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search documents…"
      onRowClick={(document) => router.push(`/documents/${document.id}`)}
    />
  )
}
