import type { Accept } from "react-dropzone"
import { z } from "zod"

/** Mirrors the backend's upload validation (`resumes/serializers.py`). */
export const RESUME_MAX_BYTES = 5 * 1024 * 1024
export const RESUME_ACCEPT: Accept = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
}

export const resumeEditSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255, "Keep it under 255 characters."),
  raw_text: z.string().trim().min(50, "Resume text looks too short to analyse."),
})

export type ResumeEditValues = z.infer<typeof resumeEditSchema>

export function defaultResumeName(file: File) {
  return file.name.replace(/\.[^.]+$/, "")
}
