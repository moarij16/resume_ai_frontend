import { z } from "zod"

import { passwordSchema } from "@/features/auth/schemas"

export const profileSchema = z.object({
  first_name: z.string().trim().max(100, "Keep it under 100 characters."),
  last_name: z.string().trim().max(100, "Keep it under 100 characters."),
})

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password."),
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords don't match.",
  })
  .refine((value) => value.new_password !== value.current_password, {
    path: ["new_password"],
    message: "Choose a password different from your current one.",
  })

export type ProfileValues = z.infer<typeof profileSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
