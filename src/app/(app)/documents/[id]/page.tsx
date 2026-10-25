import type { Metadata } from "next"
import { Suspense } from "react"

import { DetailSkeleton } from "@/components/shared/states"
import { DocumentDetail } from "@/features/documents/components/document-detail"

export const metadata: Metadata = { title: "Document" }

async function DocumentDetailRoute({ params }: { params: PageProps<"/documents/[id]">["params"] }) {
  const { id } = await params
  return <DocumentDetail id={id} />
}

export default function DocumentPage({ params }: PageProps<"/documents/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DocumentDetailRoute params={params} />
    </Suspense>
  )
}
