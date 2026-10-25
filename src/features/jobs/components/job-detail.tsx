"use client"

import { GaugeIcon, PencilIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { DetailSkeleton, ErrorState } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RunScanDialog } from "@/features/ats/components/run-scan-dialog"
import { formatDate } from "@/lib/format"
import type { UUID } from "@/types/api"

import { useDeleteJob, useJob } from "../hooks"
import { JobFormDialog } from "./job-form-dialog"

export function JobDetail({ id }: { id: UUID }) {
  const router = useRouter()
  const { data: job, isPending, error, refetch } = useJob(id)
  const deleteJob = useDeleteJob()

  if (isPending) return <DetailSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />

  return (
    <>
      <PageHeader
        title={job.job_title}
        description={`${job.company_name} · Added ${formatDate(job.created_at)}`}
        actions={
          <>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label="Delete job">
                  <Trash2Icon />
                </Button>
              }
              title="Delete this job?"
              description="The job description will be removed. Past scans keep their results."
              confirmLabel="Delete"
              onConfirm={async () => {
                await deleteJob.mutateAsync(job.id)
                router.replace("/jobs")
              }}
            />
            <JobFormDialog
              job={job}
              trigger={
                <Button variant="outline">
                  <PencilIcon data-icon="inline-start" /> Edit
                </Button>
              }
            />
            <RunScanDialog
              jobId={job.id}
              trigger={
                <Button variant="outline">
                  <GaugeIcon data-icon="inline-start" /> Match resume
                </Button>
              }
            />
            <Button asChild>
              <Link href={`/documents/new?type=cover_letter&job=${job.id}`}>
                <SparklesIcon data-icon="inline-start" /> Cover letter
              </Link>
            </Button>
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Job description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.job_description_text}</p>
        </CardContent>
      </Card>
    </>
  )
}
