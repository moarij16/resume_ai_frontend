import type { DocumentRendererProps } from "./types"

export function RawTextRenderer({ content }: DocumentRendererProps) {
  return <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
}
