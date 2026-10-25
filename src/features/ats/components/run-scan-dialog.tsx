"use client"

import { GaugeIcon, Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { JobSelect } from "@/features/jobs/components/job-select"
import { ResumeSelect } from "@/features/resumes/components/resume-select"
import type { UUID } from "@/types/api"

import { useRunScan } from "../hooks"

interface RunScanDialogProps {
  resumeId?: UUID
  jobId?: UUID
  trigger?: ReactNode
}

export function RunScanDialog({ resumeId, jobId, trigger }: RunScanDialogProps) {
  const router = useRouter()
  const scan = useRunScan()
  const [open, setOpen] = useState(false)
  const [resume, setResume] = useState<string | null>(resumeId ?? null)
  const [job, setJob] = useState<string | null>(jobId ?? null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!resume) return
    scan.mutate(
      { resume_id: resume, job_id: job },
      {
        onSuccess: (result) => {
          setOpen(false)
          router.push(`/ats/${result.id}`)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !scan.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <GaugeIcon data-icon="inline-start" /> Run ATS scan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Run an ATS scan</DialogTitle>
            <DialogDescription>
              Score a resume on its own, or match it against a saved job description.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="scan-resume">Resume</FieldLabel>
              <ResumeSelect id="scan-resume" value={resume} onChange={setResume} />
            </Field>
            <Field>
              <FieldLabel htmlFor="scan-job">Job description</FieldLabel>
              <JobSelect id="scan-job" value={job} onChange={setJob} />
              <FieldDescription>
                {job
                  ? "Job match: skills, keywords and relevance."
                  : "Resume-only: structure, bullets and formatting."}
              </FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={!resume || scan.isPending}>
              {scan.isPending ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : null}
              {scan.isPending ? "Scanning…" : "Run scan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
