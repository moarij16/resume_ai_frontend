import { describe, expect, it } from "vitest"

import {
  linkedInContentSchema,
  linkedInToPlainText,
  parseContent,
  parseCoverLetter,
  resumeContentSchema,
  resumeToPlainText,
} from "./content"

const resumeJson = JSON.stringify({
  summary: "Frontend engineer.",
  experience: [
    { title: "Engineer", company: "Acme", duration: "2020 – 2024", bullets: ["Shipped X"] },
  ],
  education: [{ degree: "BSc", institution: "Uni", year: 2019 }],
  skills: ["TypeScript"],
})

describe("parseContent", () => {
  it("parses structured resume JSON and normalises missing fields", () => {
    const parsed = parseContent(resumeJson, resumeContentSchema)
    expect(parsed.kind).toBe("structured")
    if (parsed.kind !== "structured") return
    expect(parsed.data.education[0].year).toBe("2019")
    expect(parsed.data.improvements_made).toEqual([])
  })

  it("accepts JSON wrapped in markdown code fences", () => {
    const parsed = parseContent("```json\n" + resumeJson + "\n```", resumeContentSchema)
    expect(parsed.kind).toBe("structured")
  })

  it("falls back to raw text when the AI output is not JSON", () => {
    expect(parseContent("Just some text", linkedInContentSchema)).toEqual({
      kind: "raw",
      text: "Just some text",
    })
  })

  it("falls back to raw text when JSON does not match the schema", () => {
    const parsed = parseContent(JSON.stringify({ skills: "not-an-array" }), linkedInContentSchema)
    expect(parsed.kind).toBe("raw")
  })
})

describe("plain-text conversion", () => {
  it("flattens a structured resume", () => {
    const text = resumeToPlainText(resumeJson)
    expect(text).toContain("SUMMARY\nFrontend engineer.")
    expect(text).toContain("Engineer | Acme | 2020 – 2024\n• Shipped X")
    expect(text).toContain("SKILLS\nTypeScript")
  })

  it("flattens a LinkedIn bio", () => {
    const text = linkedInToPlainText(
      JSON.stringify({ headline: "H", summary: "S", skills: ["A", "B"] })
    )
    expect(text).toBe("H\n\nS\n\nSkills: A, B")
  })

  it("extracts full_text from a JSON cover letter, otherwise returns raw", () => {
    expect(parseCoverLetter(JSON.stringify({ full_text: "Dear team" }))).toBe("Dear team")
    expect(parseCoverLetter("Dear team")).toBe("Dear team")
  })
})
