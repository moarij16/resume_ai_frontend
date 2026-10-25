import { z } from "zod"

/** Mirrors Django's default password validators (length and numeric checks). */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .refine((value) => !/^\d+$/.test(value), "Password can't be entirely numeric.")

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

export const registerSchema = z
  .object({
    first_name: z.string().trim().max(100, "Keep it under 100 characters."),
    last_name: z.string().trim().max(100, "Keep it under 100 characters."),
    email: z.email("Enter a valid email address."),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((value) => value.password === value.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords don't match.",
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>

/** Only allow same-origin relative redirects to prevent open-redirects via `?next=`. */
export function safeRedirect(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback
  }
  return next
}
