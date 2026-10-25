import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { ResumesTable } from "@/features/resumes/components/resumes-table"
import { UploadResumeDialog } from "@/features/resumes/components/upload-resume-dialog"

export const metadata: Metadata = { title: "Resumes" }

export default function ResumesPage() {
  return (
    <>
      <PageHeader
        title="Resumes"
        description="Upload resumes to analyse, scan and tailor."
        actions={<UploadResumeDialog />}
      />
      <ResumesTable />
    </>
  )
}
