import { FileTextIcon, IdCardIcon, MailIcon, WandSparklesIcon, type LucideIcon } from "lucide-react"
import type { ComponentType } from "react"

import type { DocumentType, DownloadFormat } from "@/types/api"

import { linkedInToPlainText, parseCoverLetter, resumeToPlainText } from "./content"
import { CoverLetterRenderer } from "./renderers/cover-letter"
import { LinkedInRenderer } from "./renderers/linkedin"
import { ResumeRenderer } from "./renderers/resume"
import type { DocumentRendererProps } from "./renderers/types"

export interface DocumentTypeDefinition {
  type: DocumentType
  label: string
  description: string
  icon: LucideIcon
  /** Whether a job description can tailor this document. */
  usesJob: boolean
  /** Backend renders PDF/DOCX only for resume-shaped documents. */
  downloadFormats: DownloadFormat[]
  Renderer: ComponentType<DocumentRendererProps>
  toPlainText: (content: string) => string
}

/**
 * Single registry of document types (Open/Closed): adding a type means adding
 * an entry here — the list, generator wizard and detail page read from it.
 */
export const DOCUMENT_TYPES: Record<DocumentType, DocumentTypeDefinition> = {
  cover_letter: {
    type: "cover_letter",
    label: "Cover letter",
    description: "A tailored cover letter, ideally matched to a saved job.",
    icon: MailIcon,
    usesJob: true,
    downloadFormats: ["txt"],
    Renderer: CoverLetterRenderer,
    toPlainText: parseCoverLetter,
  },
  resume_refactor: {
    type: "resume_refactor",
    label: "Resume rewrite",
    description: "Rewrites your resume with stronger bullets and ATS keywords.",
    icon: WandSparklesIcon,
    usesJob: true,
    downloadFormats: ["pdf", "docx", "txt"],
    Renderer: ResumeRenderer,
    toPlainText: resumeToPlainText,
  },
  resume: {
    type: "resume",
    label: "New resume",
    description: "Generates a fresh, ATS-friendly resume from your existing one.",
    icon: FileTextIcon,
    usesJob: true,
    downloadFormats: ["pdf", "docx", "txt"],
    Renderer: ResumeRenderer,
    toPlainText: resumeToPlainText,
  },
  linkedin_bio: {
    type: "linkedin_bio",
    label: "LinkedIn profile",
    description: "Headline, About section and skills for your LinkedIn profile.",
    icon: IdCardIcon,
    usesJob: false,
    downloadFormats: ["txt"],
    Renderer: LinkedInRenderer,
    toPlainText: linkedInToPlainText,
  },
}

export const DOCUMENT_TYPE_LIST = Object.values(DOCUMENT_TYPES)

export function isDocumentType(value: string | null | undefined): value is DocumentType {
  return !!value && value in DOCUMENT_TYPES
}
