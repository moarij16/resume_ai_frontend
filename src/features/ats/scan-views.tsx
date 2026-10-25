import type { ComponentType } from "react"

import type { ATSScan, ScanMode } from "@/types/api"

import { JdMatchDetails } from "./components/jd-match-details"
import { ResumeOnlyDetails } from "./components/resume-only-details"
import { SCAN_MODE_LABELS } from "./labels"

export interface ScoreItem {
  label: string
  value: number | null | undefined
}

export interface ScanModeView<S extends ATSScan> {
  label: string
  description: string
  breakdown: (scan: S) => ScoreItem[]
  Details: ComponentType<{ scan: S }>
}

type ScanViewRegistry = { [M in ScanMode]: ScanModeView<Extract<ATSScan, { scan_mode: M }>> }

/**
 * One entry per scan mode (Open/Closed): supporting a new backend mode means
 * adding an entry here, not editing the result page.
 */
const SCAN_VIEWS: ScanViewRegistry = {
  resume_only: {
    label: SCAN_MODE_LABELS.resume_only,
    description: "General ATS readiness: structure, keywords, bullets and formatting.",
    breakdown: ({ scan_result: r }) => [
      { label: "Section completeness", value: r.section_completeness },
      { label: "Keyword strength", value: r.keyword_strength },
      { label: "Bullet quality", value: r.bullet_quality },
      { label: "Format compatibility", value: r.format_compatibility },
      { label: "Quantified achievements", value: r.content_quantification },
      // `breakdown.resume_length` is always null (backend key mismatch); read the raw score.
      { label: "Resume length", value: r.resume_length_score },
    ],
    Details: ResumeOnlyDetails,
  },
  jd_match: {
    label: SCAN_MODE_LABELS.jd_match,
    description: "How well this resume matches the selected job description.",
    breakdown: ({ breakdown: b }) => [
      { label: "Skill match", value: b.skill_match },
      { label: "Keyword similarity", value: b.keyword_similarity },
      { label: "Semantic similarity", value: b.semantic_similarity },
      { label: "Experience relevance", value: b.experience_relevance },
    ],
    Details: JdMatchDetails,
  },
}

export function getScanView<S extends ATSScan>(scan: S): ScanModeView<S> {
  return SCAN_VIEWS[scan.scan_mode] as unknown as ScanModeView<S>
}
