import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { DetailSkeleton } from "@/components/shared/states"
import { GenerateDocumentForm } from "@/features/documents/components/generate-document-form"

export const metadata: Metadata = { title: "Generate document" }

export default function NewDocumentPage() {
  return (
    <>
      <PageHeader
        title="Generate a document"
        description="Pick a document type, a resume and optionally a target job."
      />
      {/* Reads ?type, ?resume and ?job via useSearchParams. */}
      <Suspense fallback={<DetailSkeleton />}>
        <GenerateDocumentForm />
      </Suspense>
    </>
  )
}
