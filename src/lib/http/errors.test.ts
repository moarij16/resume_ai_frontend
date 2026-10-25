import { describe, expect, it } from "vitest"

import { toApiError } from "./errors"

describe("toApiError", () => {
  it("unwraps DRF validation errors from the custom exception handler", () => {
    const error = toApiError(400, {
      error: true,
      status_code: 400,
      detail: { email: ["An account with this email already exists."] },
    })

    expect(error.status).toBe(400)
    expect(error.message).toBe("An account with this email already exists.")
    expect(error.fieldErrors).toEqual({ email: ["An account with this email already exists."] })
  })

  it("reads a nested DRF detail message and code", () => {
    const error = toApiError(401, {
      error: true,
      status_code: 401,
      detail: {
        detail: "Given token not valid for any token type",
        code: "token_not_valid",
        messages: [{}],
      },
    })

    expect(error.message).toBe("Given token not valid for any token type")
    expect(error.code).toBe("token_not_valid")
    expect(error.isUnauthorized).toBe(true)
    expect(error.hasFieldErrors).toBe(false)
  })

  it("handles `{ error: true, detail: string }` from scan/upload endpoints", () => {
    expect(toApiError(400, { error: true, detail: "Resume has no text." }).message).toBe(
      "Resume has no text."
    )
  })

  it("handles `{ error: string }` from the download endpoint", () => {
    expect(toApiError(400, { error: "PDF is only available for resumes." }).message).toBe(
      "PDF is only available for resumes."
    )
  })

  it("uses non_field_errors as the message", () => {
    const error = toApiError(400, { non_field_errors: ["Passwords do not match."] })
    expect(error.message).toBe("Passwords do not match.")
    expect(error.fieldErrors).toEqual({})
  })

  it("falls back to a status message for HTML or empty bodies", () => {
    expect(toApiError(503, "<!doctype html><h1>Server Error</h1>").message).toMatch(/AI service/)
    expect(toApiError(500, undefined).message).toMatch(/Something went wrong/)
  })
})
