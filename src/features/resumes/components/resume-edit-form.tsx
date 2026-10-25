"use client"

import { useAppForm } from "@/components/form/form"
import { toFormErrors } from "@/components/form/server-errors"
import { FieldGroup } from "@/components/ui/field"
import type { Resume, ResumeData } from "@/types/api"

import { useUpdateResume } from "../hooks"
import { resumeEditSchema, type ResumeEditValues } from "../schemas"

const FIELDS = ["name", "raw_text"] as const

interface ResumeEditFormProps {
  resume: Resume
  onSaved?: () => void
}

/**
 * Edits the resume name and extracted text. The rest of `resume_data` is
 * preserved: backend scans and generators rely on `raw_text` being present.
 */
export function ResumeEditForm({ resume, onSaved }: ResumeEditFormProps) {
  const update = useUpdateResume(resume.id)

  const form = useAppForm({
    defaultValues: {
      name: resume.name,
      raw_text: resume.resume_data?.raw_text ?? "",
    } satisfies ResumeEditValues,
    validators: {
      onChange: resumeEditSchema,
      onSubmitAsync: async ({ value }) => {
        const resume_data: ResumeData = {
          ...(resume.resume_data ?? {}),
          raw_text: value.raw_text,
          word_count: value.raw_text.split(/\s+/).filter(Boolean).length,
        }
        try {
          await update.mutateAsync({ name: value.name.trim(), resume_data })
          return undefined
        } catch (error) {
          return toFormErrors(error, FIELDS)
        }
      },
    },
    onSubmit: () => onSaved?.(),
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.FormError />
          <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
          <form.AppField name="raw_text">
            {(field) => (
              <field.TextareaField
                label="Resume text"
                description="This is the text ATS scans and AI generators read. Fix parsing mistakes here, then re-scan."
                className="min-h-96 font-mono text-xs"
              />
            )}
          </form.AppField>
          <div className="flex justify-end">
            <form.SubmitButton>Save changes</form.SubmitButton>
          </div>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
