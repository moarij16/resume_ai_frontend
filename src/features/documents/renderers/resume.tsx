import { CheckCircle2Icon } from "lucide-react"

import { TagList } from "@/components/shared/tag-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { parseContent, resumeContentSchema } from "../content"
import { RawTextRenderer } from "./raw-text"
import type { DocumentRendererProps } from "./types"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-muted-foreground border-b pb-1 text-xs font-semibold tracking-widest uppercase">
      {children}
    </h2>
  )
}

/** Structured resume view shared by "resume" and "resume_refactor" documents. */
export function ResumeRenderer({ content }: DocumentRendererProps) {
  const parsed = parseContent(content, resumeContentSchema)
  if (parsed.kind === "raw") return <RawTextRenderer content={parsed.text} />
  const { summary, experience, education, skills, improvements_made } = parsed.data

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <article className="bg-card flex flex-col gap-6 rounded-lg border p-6 shadow-sm md:p-10 lg:col-span-2">
        {summary ? (
          <section className="flex flex-col gap-2">
            <SectionTitle>Summary</SectionTitle>
            <p className="text-sm leading-relaxed">{summary}</p>
          </section>
        ) : null}
        {experience.length ? (
          <section className="flex flex-col gap-4">
            <SectionTitle>Experience</SectionTitle>
            {experience.map((role, index) => (
              <div key={`${role.title}-${index}`} className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-sm font-semibold">
                    {role.title}
                    {role.company ? (
                      <span className="text-muted-foreground font-normal"> · {role.company}</span>
                    ) : null}
                  </p>
                  {role.duration ? (
                    <span className="text-muted-foreground text-xs">{role.duration}</span>
                  ) : null}
                </div>
                <ul className="ml-4 list-disc text-sm leading-relaxed">
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ) : null}
        {education.length ? (
          <section className="flex flex-col gap-2">
            <SectionTitle>Education</SectionTitle>
            {education.map((entry, index) => (
              <div
                key={`${entry.degree}-${index}`}
                className="flex flex-wrap justify-between gap-x-4 text-sm"
              >
                <span>
                  <span className="font-semibold">{entry.degree}</span>
                  {entry.institution ? (
                    <span className="text-muted-foreground"> · {entry.institution}</span>
                  ) : null}
                </span>
                {entry.year ? (
                  <span className="text-muted-foreground text-xs">{entry.year}</span>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}
        {skills.length ? (
          <section className="flex flex-col gap-2">
            <SectionTitle>Skills</SectionTitle>
            <TagList items={skills} />
          </section>
        ) : null}
      </article>

      {improvements_made.length ? (
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>What changed</CardTitle>
            <CardDescription>Improvements the AI made.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5">
              {improvements_made.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
