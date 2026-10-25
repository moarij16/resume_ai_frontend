"use client"

import { FileTextIcon, SparklesIcon } from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { ScoreBar, ScoreRing } from "@/components/shared/score"
import { DetailSkeleton, ErrorState } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useJob } from "@/features/jobs/hooks"
import { useResume } from "@/features/resumes/hooks"
import { formatDateTime } from "@/lib/format"
import type { ATSScan, UUID } from "@/types/api"

import { useScan } from "../hooks"
import { getScanView } from "../scan-views"
import { RunScanDialog } from "./run-scan-dialog"
import { ScanModeBadge } from "./scan-mode-badge"

function ScanSubject({ scan }: { scan: ATSScan }) {
  const { data: resume } = useResume(scan.resume)
  const { data: job } = useJob(scan.job)
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <ScanModeBadge mode={scan.scan_mode} />
      <Link href={`/resumes/${scan.resume}`} className="hover:underline">
        {resume?.name ?? "Resume"}
      </Link>
      {scan.job ? (
        <>
          <span>vs</span>
          <Link href={`/jobs/${scan.job}`} className="hover:underline">
            {job ? `${job.job_title} · ${job.company_name}` : "Job"}
          </Link>
        </>
      ) : null}
      <span>· {formatDateTime(scan.created_at)}</span>
    </span>
  )
}

export function ScanResult({ id }: { id: UUID }) {
  const { data: scan, isPending, error, refetch } = useScan(id)

  if (isPending) return <DetailSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />

  const view = getScanView(scan)
  const { Details } = view

  return (
    <>
      <PageHeader
        title="ATS scan result"
        description={<ScanSubject scan={scan} />}
        actions={
          <>
            <RunScanDialog
              resumeId={scan.resume}
              jobId={scan.job ?? undefined}
              trigger={<Button variant="outline">Re-scan</Button>}
            />
            <Button asChild>
              <Link
                href={`/documents/new?type=resume_refactor&resume=${scan.resume}${scan.job ? `&job=${scan.job}` : ""}`}
              >
                <SparklesIcon data-icon="inline-start" /> Improve with AI
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{view.label}</CardTitle>
          <CardDescription>{view.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <ScoreRing value={scan.ats_score} size={160} />
          <div className="grid gap-4 sm:grid-cols-2">
            {view.breakdown(scan).map((item) => (
              <ScoreBar key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Details scan={scan} />

      <div className="flex justify-center">
        <Button variant="ghost" asChild>
          <Link href={`/resumes/${scan.resume}`}>
            <FileTextIcon data-icon="inline-start" /> View resume
          </Link>
        </Button>
      </div>
    </>
  )
}
