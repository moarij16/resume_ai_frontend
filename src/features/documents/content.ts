import { z } from "zod"

/**
 * `document_content` is a string: plain text for cover letters, JSON for the
 * other types. When the AI output can't be parsed the backend stores raw
 * text, so every parser must degrade gracefully.
 */

const text = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((value) => (value == null ? "" : String(value)))
const textList = z
  .array(z.string())
  .nullish()
  .transform((value) => value ?? [])

export const resumeContentSchema = z.object({
  summary: text,
  experience: z
    .array(z.object({ title: text, company: text, duration: text, bullets: textList }))
    .nullish()
    .transform((value) => value ?? []),
  education: z
    .array(z.object({ degree: text, institution: text, year: text }))
    .nullish()
    .transform((value) => value ?? []),
  skills: textList,
  improvements_made: textList,
})

export const linkedInContentSchema = z.object({
  headline: text,
  summary: text,
  skills: textList,
  headline_alternatives: textList,
})

export type ResumeContent = z.infer<typeof resumeContentSchema>
export type LinkedInContent = z.infer<typeof linkedInContentSchema>

export type ParsedContent<T> = { kind: "structured"; data: T } | { kind: "raw"; text: string }

function parseJson(raw: string): unknown {
  // Models sometimes wrap JSON in Markdown code fences.
  const unfenced = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
  try {
    return JSON.parse(unfenced)
  } catch {
    return undefined
  }
}

export function parseContent<T>(raw: string, schema: z.ZodType<T>): ParsedContent<T> {
  const json = parseJson(raw)
  if (json && typeof json === "object") {
    const result = schema.safeParse(json)
    if (result.success) return { kind: "structured", data: result.data }
  }
  return { kind: "raw", text: raw }
}

export function parseCoverLetter(raw: string): string {
  const json = parseJson(raw)
  if (
    json &&
    typeof json === "object" &&
    "full_text" in json &&
    typeof json.full_text === "string"
  ) {
    return json.full_text
  }
  return raw
}

export function resumeToPlainText(raw: string): string {
  const parsed = parseContent(raw, resumeContentSchema)
  if (parsed.kind === "raw") return parsed.text
  const { summary, experience, education, skills } = parsed.data
  const lines: string[] = []
  if (summary) lines.push("SUMMARY", summary, "")
  if (experience.length) {
    lines.push("EXPERIENCE")
    for (const role of experience) {
      lines.push([role.title, role.company, role.duration].filter(Boolean).join(" | "))
      for (const bullet of role.bullets) lines.push(`• ${bullet}`)
      lines.push("")
    }
  }
  if (education.length) {
    lines.push("EDUCATION")
    for (const entry of education) {
      lines.push([entry.degree, entry.institution, entry.year].filter(Boolean).join(" | "))
    }
    lines.push("")
  }
  if (skills.length) lines.push("SKILLS", skills.join(", "))
  return lines.join("\n").trim()
}

export function linkedInToPlainText(raw: string): string {
  const parsed = parseContent(raw, linkedInContentSchema)
  if (parsed.kind === "raw") return parsed.text
  const { headline, summary, skills } = parsed.data
  return [headline, "", summary, "", skills.length ? `Skills: ${skills.join(", ")}` : ""]
    .join("\n")
    .trim()
}
