"use client"

import { EntitySelect } from "@/components/shared/entity-select"
import { formatDate } from "@/lib/format"

import { useResumes } from "../hooks"

interface ResumeSelectProps {
  id?: string
  value: string | null
  onChange: (value: string | null) => void
  invalid?: boolean
}

export function ResumeSelect({ id, value, onChange, invalid }: ResumeSelectProps) {
  const { data = [], isPending } = useResumes()
  return (
    <EntitySelect
      id={id}
      value={value}
      onChange={onChange}
      invalid={invalid}
      disabled={isPending}
      placeholder={
        isPending ? "Loading resumes…" : data.length ? "Select a resume" : "No resumes yet"
      }
      options={data.map((resume) => ({
        value: resume.id,
        label: resume.name,
        description: formatDate(resume.created_at),
      }))}
    />
  )
}
