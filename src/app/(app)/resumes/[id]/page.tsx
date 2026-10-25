import type { Metadata } from "next"
import { Suspense } from "react"

import { DetailSkeleton } from "@/components/shared/states"
import { ResumeDetail } from "@/features/resumes/components/resume-detail"

export const metadata: Metadata = { title: "Resume" }

async function ResumeDetailRoute({ params }: { params: PageProps<"/resumes/[id]">["params"] }) {
  const { id } = await params
  return <ResumeDetail id={id} />
}

export default function ResumePage({ params }: PageProps<"/resumes/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ResumeDetailRoute params={params} />
    </Suspense>
  )
}
