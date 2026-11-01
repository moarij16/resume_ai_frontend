"use client"

import { Loader2Icon, RotateCcwIcon, SparklesIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { JobSelect } from "@/features/jobs/components/job-select"
import { ResumeSelect } from "@/features/resumes/components/resume-select"
import { useResumes } from "@/features/resumes/hooks"
import { getErrorMessage } from "@/lib/http/errors"
import { cn } from "@/lib/utils"
import type { DocumentType } from "@/types/api"

import { useGenerateDocument } from "../hooks"
import { DOCUMENT_TYPE_LIST, DOCUMENT_TYPES, isDocumentType } from "../registry"

export function GenerateDocumentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const generate = useGenerateDocument()
  const { data: resumes } = useResumes()

  const initialType = searchParams.get("type")
  const [type, setType] = useState<DocumentType>(
    isDocumentType(initialType) ? initialType : "cover_letter"
  )
  const [resumeId, setResumeId] = useState<string | null>(searchParams.get("resume"))
  const [jobId, setJobId] = useState<string | null>(searchParams.get("job"))

  const definition = DOCUMENT_TYPES[type]

  function submit() {
    if (!resumeId) return
    generate.mutate(
      { type, input: { resume_id: resumeId, job_id: definition.usesJob ? jobId : null } },
      { onSuccess: (document) => router.push(`/documents/${document.id}`) }
    )
  }

  if (resumes && !resumes.length) {
    return (
      <Alert>
        <AlertTitle>Upload a resume first</AlertTitle>
        <AlertDescription>Documents are generated from one of your resumes.</AlertDescription>
        <AlertAction>
          <Button asChild size="sm">
            <Link href="/resumes">Go to resumes</Link>
          </Button>
        </AlertAction>
      </Alert>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>What would you like to create?</CardTitle>
          <CardDescription>Generation uses AI and can take up to a minute.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">Document type</FieldLegend>
              <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                {DOCUMENT_TYPE_LIST.map((option) => {
                  const selected = option.type === type
                  return (
                    <button
                      key={option.type}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={generate.isPending}
                      onClick={() => setType(option.type)}
                      className={cn(
                        "focus-visible:ring-ring/50 flex items-start gap-3 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-3 disabled:opacity-50",
                        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <option.icon
                        className={cn(
                          "mt-0.5 size-5 shrink-0",
                          selected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-muted-foreground text-xs">{option.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </FieldSet>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="generate-resume">Resume</FieldLabel>
                <ResumeSelect id="generate-resume" value={resumeId} onChange={setResumeId} />
              </Field>
              {definition.usesJob ? (
                <Field>
                  <FieldLabel htmlFor="generate-job">Target job</FieldLabel>
                  <JobSelect
                    id="generate-job"
                    value={jobId}
                    onChange={setJobId}
                    noneLabel="No specific job"
                  />
                  <FieldDescription>Tailors wording and keywords to the posting.</FieldDescription>
                </Field>
              ) : null}
            </div>

            {generate.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Generation failed</AlertTitle>
                <AlertDescription>
                  {/* The API returns user-facing messages for AI failures (unavailable, busy, failed). */}
                  {getErrorMessage(generate.error)}
                </AlertDescription>
                <AlertAction>
                  <Button type="button" size="sm" variant="outline" onClick={submit}>
                    <RotateCcwIcon data-icon="inline-start" /> Retry
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-3">
          {generate.isPending ? (
            <span className="text-muted-foreground text-sm" aria-live="polite">
              Writing your {definition.label.toLowerCase()}…
            </span>
          ) : null}
          <Button type="submit" disabled={!resumeId || generate.isPending}>
            {generate.isPending ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : (
              <SparklesIcon data-icon="inline-start" />
            )}
            Generate
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
