import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { JobFormDialog } from "@/features/jobs/components/job-form-dialog"
import { JobsTable } from "@/features/jobs/components/jobs-table"

export const metadata: Metadata = { title: "Jobs" }

export default function JobsPage() {
  return (
    <>
      <PageHeader
        title="Jobs"
        description="Job descriptions you're targeting."
        actions={<JobFormDialog />}
      />
      <JobsTable />
    </>
  )
}
