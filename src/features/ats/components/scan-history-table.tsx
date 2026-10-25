"use client"

import { GaugeIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

import { createDataTableColumns, DataTable } from "@/components/shared/data-table"
import { ScoreBadge } from "@/components/shared/score"
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states"
import { useJobs } from "@/features/jobs/hooks"
import { useResumes } from "@/features/resumes/hooks"
import { formatDateTime } from "@/lib/format"
import type { ATSScan, UUID } from "@/types/api"

import { useScanHistory } from "../hooks"
import { SCAN_MODE_LABELS } from "../labels"
import { RunScanDialog } from "./run-scan-dialog"
import { ScanModeBadge } from "./scan-mode-badge"

type ScanRow = ATSScan & {
  resumeName: string
  jobName: string
}

const column = createDataTableColumns<ScanRow>()

const columns = column.columns([
  column.accessor("ats_score", {
    header: "Score",
    enableGlobalFilter: false,
    cell: (info) => <ScoreBadge value={info.getValue()} />,
  }),
  column.accessor((row) => SCAN_MODE_LABELS[row.scan_mode], {
    id: "mode",
    header: "Mode",
    cell: (info) => <ScanModeBadge mode={info.row.original.scan_mode} />,
  }),
  column.accessor("resumeName", { header: "Resume" }),
  column.accessor("jobName", { header: "Job" }),
  column.accessor("created_at", {
    header: "Scanned",
    sortFn: "datetime",
    enableGlobalFilter: false,
    cell: (info) => formatDateTime(info.getValue()),
  }),
])

/** Scan history, optionally scoped to a single resume. */
export function ScanHistoryTable({ resumeId }: { resumeId?: UUID }) {
  const router = useRouter()
  const { data, isPending, error, refetch } = useScanHistory()
  const { data: resumes } = useResumes()
  const { data: jobs } = useJobs()

  const rows = useMemo<ScanRow[]>(() => {
    const resumeNames = new Map(resumes?.map((resume) => [resume.id, resume.name]))
    const jobNames = new Map(jobs?.map((job) => [job.id, `${job.job_title} · ${job.company_name}`]))
    return (data ?? [])
      .filter((scan) => !resumeId || scan.resume === resumeId)
      .map((scan) => ({
        ...scan,
        resumeName: resumeNames.get(scan.resume) ?? "Deleted resume",
        jobName: scan.job ? (jobNames.get(scan.job) ?? "Deleted job") : "—",
      }))
  }, [data, resumes, jobs, resumeId])

  if (isPending) return <TableSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!rows.length) {
    return (
      <EmptyState
        icon={GaugeIcon}
        title="No scans yet"
        description="Run a scan to see how applicant tracking systems read your resume."
        action={<RunScanDialog resumeId={resumeId} />}
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search scans…"
      onRowClick={(scan) => router.push(`/ats/${scan.id}`)}
    />
  )
}
