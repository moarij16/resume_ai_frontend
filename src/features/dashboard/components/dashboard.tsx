"use client"

import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileTextIcon,
  GaugeIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { ScoreRing } from "@/components/shared/score"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RunScanDialog } from "@/features/ats/components/run-scan-dialog"
import { ScanModeBadge } from "@/features/ats/components/scan-mode-badge"
import { ScoreTrendChart } from "@/features/ats/components/score-trend-chart"
import { useScanHistory } from "@/features/ats/hooks"
import { DocumentTypeBadge } from "@/features/documents/components/document-type-badge"
import { useDocuments } from "@/features/documents/hooks"
import { useJobs } from "@/features/jobs/hooks"
import { useMe } from "@/features/profile/hooks"
import { UploadResumeDialog } from "@/features/resumes/components/upload-resume-dialog"
import { useResumes } from "@/features/resumes/hooks"
import { formatRelative } from "@/lib/format"

interface StatCardProps {
  title: string
  value: number | undefined
  href: string
  icon: LucideIcon
}

function StatCard({ title, value, href, icon: Icon }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3"
    >
      <Card className="group-hover:bg-muted/40 transition-colors">
        <CardHeader>
          <CardDescription>{title}</CardDescription>
          <CardAction>
            <Icon className="text-muted-foreground size-4" />
          </CardAction>
          <CardTitle className="text-3xl tabular-nums">
            {value === undefined ? <Skeleton className="h-9 w-12" /> : value}
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  )
}

function Greeting() {
  const { data: user } = useMe()
  const name = user?.first_name
  return <>{name ? `Welcome back, ${name}` : "Welcome back"}</>
}

export function Dashboard() {
  const resumes = useResumes()
  const jobs = useJobs()
  const scans = useScanHistory()
  const documents = useDocuments()

  const latestScan = scans.data?.[0]
  const recentDocuments = documents.data?.slice(0, 5) ?? []

  return (
    <>
      <PageHeader
        title={<Greeting />}
        description="Here's how your job search toolkit is looking."
        actions={
          <>
            <RunScanDialog
              trigger={
                <Button variant="outline">
                  <GaugeIcon data-icon="inline-start" /> Run scan
                </Button>
              }
            />
            <UploadResumeDialog />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Resumes"
          value={resumes.data?.length}
          href="/resumes"
          icon={FileTextIcon}
        />
        <StatCard title="Saved jobs" value={jobs.data?.length} href="/jobs" icon={BriefcaseIcon} />
        <StatCard title="ATS scans" value={scans.data?.length} href="/ats" icon={GaugeIcon} />
        <StatCard
          title="Documents"
          value={documents.data?.length}
          href="/documents"
          icon={SparklesIcon}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Latest score</CardTitle>
            <CardDescription>
              {latestScan ? formatRelative(latestScan.created_at) : "No scans yet"}
            </CardDescription>
            {latestScan ? (
              <CardAction>
                <ScanModeBadge mode={latestScan.scan_mode} />
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {scans.isPending ? (
              <Skeleton className="size-36 rounded-full" />
            ) : latestScan ? (
              <>
                <ScoreRing value={latestScan.ats_score} />
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/ats/${latestScan.id}`}>
                    View details <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Upload a resume to get your first ATS score.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score trend</CardTitle>
            <CardDescription>Your ATS scores across recent scans.</CardDescription>
          </CardHeader>
          <CardContent>
            {scans.isPending ? (
              <Skeleton className="h-56 w-full" />
            ) : (scans.data?.length ?? 0) > 1 ? (
              <ScoreTrendChart scans={scans.data ?? []} />
            ) : (
              <p className="text-muted-foreground flex h-56 items-center justify-center text-sm">
                Run at least two scans to see a trend.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent documents</CardTitle>
          <CardDescription>Your latest AI-generated documents.</CardDescription>
          <CardAction>
            <Button size="sm" asChild>
              <Link href="/documents/new">
                <SparklesIcon data-icon="inline-start" /> Generate
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {documents.isPending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : recentDocuments.length ? (
            <ul className="divide-y">
              {recentDocuments.map((document) => (
                <li key={document.id}>
                  <Link
                    href={`/documents/${document.id}`}
                    className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-4 rounded-md px-2 py-3"
                  >
                    <DocumentTypeBadge type={document.document_type} />
                    <span className="text-muted-foreground text-sm">
                      {formatRelative(document.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No documents yet — generate a tailored cover letter in under a minute.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
