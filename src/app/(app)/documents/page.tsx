import { SparklesIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { DocumentsTable } from "@/features/documents/components/documents-table"

export const metadata: Metadata = { title: "Documents" }

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Documents"
        description="AI-generated cover letters, LinkedIn profiles and resumes."
        actions={
          <Button asChild>
            <Link href="/documents/new">
              <SparklesIcon data-icon="inline-start" /> Generate
            </Link>
          </Button>
        }
      />
      <DocumentsTable />
    </>
  )
}
