import { CopyButton } from "@/components/shared/copy-button"
import { TagList } from "@/components/shared/tag-list"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { linkedInContentSchema, parseContent } from "../content"
import { RawTextRenderer } from "./raw-text"
import type { DocumentRendererProps } from "./types"

export function LinkedInRenderer({ content }: DocumentRendererProps) {
  const parsed = parseContent(content, linkedInContentSchema)
  if (parsed.kind === "raw") return <RawTextRenderer content={parsed.text} />
  const { headline, summary, skills, headline_alternatives } = parsed.data

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Headline</CardTitle>
            <CardAction>
              <CopyButton value={headline} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{headline}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardAction>
              <CopyButton value={summary} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            {skills.length ? (
              <CardAction>
                <CopyButton value={skills.join(", ")} />
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            <TagList items={skills} />
          </CardContent>
        </Card>
        {headline_alternatives.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Alternative headlines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {headline_alternatives.map((alt) => (
                  <li key={alt} className="flex items-start justify-between gap-2 text-sm">
                    <span>{alt}</span>
                    <CopyButton
                      value={alt}
                      label=""
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copy headline"
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
