"use client"

import { PlusIcon } from "lucide-react"
import { useState, type ReactNode } from "react"

import { useAppForm } from "@/components/form/form"
import { toFormErrors } from "@/components/form/server-errors"
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
import { FieldGroup } from "@/components/ui/field"
import type { Job } from "@/types/api"

import { useCreateJob, useUpdateJob } from "../hooks"
import { jobSchema, type JobValues } from "../schemas"

const FIELDS = ["job_title", "company_name", "job_description_text"] as const

interface JobFormProps {
  job?: Job
  onSaved: (job: Job) => void
}

function JobForm({ job, onSaved }: JobFormProps) {
  const create = useCreateJob()
  const update = useUpdateJob(job?.id ?? "")

  const form = useAppForm({
    defaultValues: {
      job_title: job?.job_title ?? "",
      company_name: job?.company_name ?? "",
      job_description_text: job?.job_description_text ?? "",
    } satisfies JobValues,
    validators: {
      onChange: jobSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          const saved = job ? await update.mutateAsync(value) : await create.mutateAsync(value)
          onSaved(saved)
          return undefined
        } catch (error) {
          return toFormErrors(error, FIELDS)
        }
      },
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.FormError />
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="job_title">
              {(field) => (
                <field.TextField label="Job title" placeholder="Senior Frontend Engineer" />
              )}
            </form.AppField>
            <form.AppField name="company_name">
              {(field) => <field.TextField label="Company" placeholder="Acme Inc." />}
            </form.AppField>
          </div>
          <form.AppField name="job_description_text">
            {(field) => (
              <field.TextareaField
                label="Job description"
                placeholder="Paste the full job posting…"
                className="max-h-[50vh] min-h-56"
              />
            )}
          </form.AppField>
        </FieldGroup>
        <DialogFooter>
          <form.SubmitButton>{job ? "Save changes" : "Save job"}</form.SubmitButton>
        </DialogFooter>
      </form.AppForm>
    </form>
  )
}

interface JobFormDialogProps {
  job?: Job
  trigger?: ReactNode
  onSaved?: (job: Job) => void
}

export function JobFormDialog({ job, trigger, onSaved }: JobFormDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <PlusIcon data-icon="inline-start" /> Add job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{job ? "Edit job" : "Add a job description"}</DialogTitle>
          <DialogDescription>
            Save a posting to match resumes against it and generate tailored documents.
          </DialogDescription>
        </DialogHeader>
        {/* Remount on open so the form always starts from the latest job values. */}
        {open ? (
          <JobForm
            job={job}
            onSaved={(saved) => {
              setOpen(false)
              onSaved?.(saved)
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
