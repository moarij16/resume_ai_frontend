import { describe, expect, it } from "vitest"

import { DOCUMENT_TYPE_LIST, DOCUMENT_TYPES, isDocumentType } from "./registry"

describe("document registry", () => {
  it("keys every definition by its own type", () => {
    for (const [key, definition] of Object.entries(DOCUMENT_TYPES)) {
      expect(definition.type).toBe(key)
    }
  })

  it("only offers PDF/DOCX where the backend can render them", () => {
    const binary = DOCUMENT_TYPE_LIST.filter((definition) =>
      definition.downloadFormats.some((format) => format !== "txt")
    ).map((definition) => definition.type)
    expect(binary.sort()).toEqual(["resume", "resume_refactor"])
  })

  it("does not let LinkedIn bios take a job", () => {
    expect(DOCUMENT_TYPES.linkedin_bio.usesJob).toBe(false)
  })

  it("guards unknown type strings", () => {
    expect(isDocumentType("cover_letter")).toBe(true)
    expect(isDocumentType("memo")).toBe(false)
    expect(isDocumentType(null)).toBe(false)
  })
})
