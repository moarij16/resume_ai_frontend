import { describe, expect, it } from "vitest"

import { passwordSchema, registerSchema, safeRedirect } from "./schemas"

describe("passwordSchema", () => {
  it.each([
    ["short", false],
    ["12345678", false],
    ["correct-horse", true],
  ])("validates %s", (password, valid) => {
    expect(passwordSchema.safeParse(password).success).toBe(valid)
  })
})

describe("registerSchema", () => {
  it("flags mismatched confirmation on the confirm field", () => {
    const result = registerSchema.safeParse({
      first_name: "",
      last_name: "",
      email: "a@b.co",
      password: "correct-horse",
      confirm_password: "different",
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(["confirm_password"])
  })
})

describe("safeRedirect", () => {
  it.each([
    ["/resumes/1?tab=edit", "/resumes/1?tab=edit"],
    [null, "/dashboard"],
    ["https://evil.example", "/dashboard"],
    ["//evil.example", "/dashboard"],
    ["/\\evil.example", "/dashboard"],
  ])("maps %s to %s", (input, expected) => {
    expect(safeRedirect(input)).toBe(expected)
  })
})
