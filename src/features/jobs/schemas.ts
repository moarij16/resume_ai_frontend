import { z } from "zod"

export const jobSchema = z.object({
  job_title: z
    .string()
    .trim()
    .min(1, "Job title is required.")
    .max(255, "Keep it under 255 characters."),
  company_name: z
    .string()
    .trim()
    .min(1, "Company is required.")
    .max(255, "Keep it under 255 characters."),
  job_description_text: z
    .string()
    .trim()
    .min(50, "Paste the full job description (at least 50 characters)."),
})

export type JobValues = z.infer<typeof jobSchema>
