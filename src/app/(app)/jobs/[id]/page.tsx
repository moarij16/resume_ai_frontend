import type { Metadata } from "next"
import { Suspense } from "react"

import { DetailSkeleton } from "@/components/shared/states"
import { JobDetail } from "@/features/jobs/components/job-detail"

export const metadata: Metadata = { title: "Job" }

async function JobDetailRoute({ params }: { params: PageProps<"/jobs/[id]">["params"] }) {
  const { id } = await params
  return <JobDetail id={id} />
}

export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <JobDetailRoute params={params} />
    </Suspense>
  )
}
