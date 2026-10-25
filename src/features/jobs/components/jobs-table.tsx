"use client"

import { BriefcaseIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { createDataTableColumns, DataTable } from "@/components/shared/data-table"
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states"
import { formatDate } from "@/lib/format"
import type { Job } from "@/types/api"

import { useJobs } from "../hooks"
import { JobFormDialog } from "./job-form-dialog"

const column = createDataTableColumns<Job>()

const columns = column.columns([
  column.accessor("job_title", {
    header: "Title",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  column.accessor("company_name", { header: "Company" }),
  column.accessor("created_at", {
    header: "Added",
    sortFn: "datetime",
    enableGlobalFilter: false,
    cell: (info) => formatDate(info.getValue()),
  }),
])

export function JobsTable() {
  const router = useRouter()
  const { data, isPending, error, refetch } = useJobs()

  if (isPending) return <TableSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!data.length) {
    return (
      <EmptyState
        icon={BriefcaseIcon}
        title="No jobs saved"
        description="Save a job description to match your resume against it and tailor cover letters."
        action={<JobFormDialog />}
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search jobs…"
      onRowClick={(job) => router.push(`/jobs/${job.id}`)}
    />
  )
}
