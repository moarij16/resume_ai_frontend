"use client"

import { EntitySelect } from "@/components/shared/entity-select"

import { useJobs } from "../hooks"

interface JobSelectProps {
  id?: string
  value: string | null
  onChange: (value: string | null) => void
  noneLabel?: string
}

export function JobSelect({
  id,
  value,
  onChange,
  noneLabel = "No job (general analysis)",
}: JobSelectProps) {
  const { data = [], isPending } = useJobs()
  return (
    <EntitySelect
      id={id}
      value={value}
      onChange={onChange}
      disabled={isPending}
      noneLabel={noneLabel}
      placeholder={isPending ? "Loading jobs…" : "Select a job"}
      options={data.map((job) => ({
        value: job.id,
        label: job.job_title,
        description: job.company_name,
      }))}
    />
  )
}
