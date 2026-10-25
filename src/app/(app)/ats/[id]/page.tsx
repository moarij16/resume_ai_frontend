import type { Metadata } from "next"
import { Suspense } from "react"

import { DetailSkeleton } from "@/components/shared/states"
import { ScanResult } from "@/features/ats/components/scan-result"

export const metadata: Metadata = { title: "Scan result" }

async function ScanResultRoute({ params }: { params: PageProps<"/ats/[id]">["params"] }) {
  const { id } = await params
  return <ScanResult id={id} />
}

export default function ScanPage({ params }: PageProps<"/ats/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ScanResultRoute params={params} />
    </Suspense>
  )
}
