"use client"

import { FileTextIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { createDataTableColumns, DataTable } from "@/components/shared/data-table"
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import type { Resume } from "@/types/api"

import { useResumes } from "../hooks"
import { UploadResumeDialog } from "./upload-resume-dialog"

const column = createDataTableColumns<Resume>()

const columns = column.columns([
  column.accessor("name", {
    header: "Name",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  column.accessor((resume) => resume.resume_data?.metadata?.file_type ?? "", {
    id: "type",
    header: "Type",
    cell: (info) =>
      info.getValue() ? <Badge variant="secondary">{info.getValue().toUpperCase()}</Badge> : "—",
  }),
  column.accessor((resume) => resume.resume_data?.detected_skills?.length ?? 0, {
    id: "skills",
    header: "Skills",
    enableGlobalFilter: false,
  }),
  column.accessor((resume) => resume.resume_data?.word_count ?? 0, {
    id: "words",
    header: "Words",
    enableGlobalFilter: false,
  }),
  column.accessor("created_at", {
    header: "Uploaded",
    sortFn: "datetime",
    enableGlobalFilter: false,
    cell: (info) => formatDate(info.getValue()),
  }),
])

export function ResumesTable() {
  const router = useRouter()
  const { data, isPending, error, refetch } = useResumes()

  if (isPending) return <TableSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!data.length) {
    return (
      <EmptyState
        icon={FileTextIcon}
        title="No resumes yet"
        description="Upload a PDF or DOCX to get an instant ATS score and AI-powered suggestions."
        action={<UploadResumeDialog />}
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search resumes…"
      onRowClick={(resume) => router.push(`/resumes/${resume.id}`)}
    />
  )
}
