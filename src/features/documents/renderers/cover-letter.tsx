import { parseCoverLetter } from "../content"
import type { DocumentRendererProps } from "./types"

export function CoverLetterRenderer({ content }: DocumentRendererProps) {
  return (
    <article className="bg-card mx-auto max-w-2xl rounded-lg border p-8 font-serif text-[0.95rem] leading-7 whitespace-pre-wrap shadow-sm md:p-12">
      {parseCoverLetter(content)}
    </article>
  )
}
