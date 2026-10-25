import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { RunScanDialog } from "@/features/ats/components/run-scan-dialog"
import { ScanHistoryTable } from "@/features/ats/components/scan-history-table"

export const metadata: Metadata = { title: "ATS scans" }

export default function AtsPage() {
  return (
    <>
      <PageHeader
        title="ATS scans"
        description="See how applicant tracking systems score your resumes."
        actions={<RunScanDialog />}
      />
      <ScanHistoryTable />
    </>
  )
}
