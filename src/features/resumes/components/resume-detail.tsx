"use client"

import { GaugeIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { DetailSkeleton, ErrorState } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RunScanDialog } from "@/features/ats/components/run-scan-dialog"
import { ScanHistoryTable } from "@/features/ats/components/scan-history-table"
import { formatDate } from "@/lib/format"
import type { UUID } from "@/types/api"

import { useDeleteResume, useResume } from "../hooks"
import { ResumeEditForm } from "./resume-edit-form"
import { ResumeOverview } from "./resume-overview"

export function ResumeDetail({ id }: { id: UUID }) {
  const router = useRouter()
  const { data: resume, isPending, error, refetch } = useResume(id)
  const deleteResume = useDeleteResume()
  const [tab, setTab] = useState("overview")

  if (isPending) return <DetailSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />

  return (
    <>
      <PageHeader
        title={resume.name}
        description={`Version ${resume.resume_version} · Uploaded ${formatDate(resume.created_at)}`}
        actions={
          <>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label="Delete resume">
                  <Trash2Icon />
                </Button>
              }
              title="Delete this resume?"
              description="The resume will be removed from your workspace. Existing scans and documents are kept."
              confirmLabel="Delete"
              onConfirm={async () => {
                await deleteResume.mutateAsync(resume.id)
                router.replace("/resumes")
              }}
            />
            <RunScanDialog
              resumeId={resume.id}
              trigger={
                <Button variant="outline">
                  <GaugeIcon data-icon="inline-start" /> Scan
                </Button>
              }
            />
            <Button asChild>
              <Link href={`/documents/new?resume=${resume.id}`}>
                <SparklesIcon data-icon="inline-start" /> Generate
              </Link>
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Scans</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <ResumeOverview data={resume.resume_data} />
        </TabsContent>
        <TabsContent value="scans" className="pt-4">
          <ScanHistoryTable resumeId={resume.id} />
        </TabsContent>
        <TabsContent value="edit" className="pt-4">
          <ResumeEditForm
            key={resume.updated_at}
            resume={resume}
            onSaved={() => setTab("overview")}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}
