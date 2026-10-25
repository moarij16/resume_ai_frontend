/**
 * DTOs mirroring the Django REST serializers (`/api/v1/*`).
 * Keep these in sync with the backend; they are the single source of truth
 * for response shapes across the frontend.
 */

export type UUID = string
export type ISODateString = string

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface User {
  id: UUID
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  created_at: ISODateString
  last_login: ISODateString | null
}

export interface AuthResponse {
  user: User
}

// ---------------------------------------------------------------------------
// Resumes
// ---------------------------------------------------------------------------

export interface ResumeSection {
  name: string
  start: number
  end: number
  content: string
}

export interface SkillDetail {
  mentions: number
  contexts: string[]
  estimated_years: number | null
  proficiency_signals: string[]
  weighted_score: number
}

export interface BulletStats {
  total_bullets: number
  bullets_with_action_verbs: number
  bullets_with_metrics: number
  weak_bullets: string[]
  strong_bullets: string[]
  avg_bullet_length: number
  achievement_patterns?: Record<"percentage" | "dollar" | "time" | "scale", string[]>
  impact_verb_count?: number
}

export interface ExperienceEntry {
  title: string | null
  company: string | null
  start_year: number | null
  end_year: number | null
  duration_years: number | null
}

export interface ResumeData {
  /** Required by every AI/ATS service on the backend — never drop it on PATCH. */
  raw_text: string
  word_count?: number
  metadata?: {
    file_type: "pdf" | "docx"
    page_count: number
    has_images: boolean
    has_tables: boolean
    encoding_issues: string[]
  }
  sections?: {
    sections: ResumeSection[]
    section_names: string[]
    required_present: string[]
    optional_present: string[]
  }
  detected_skills?: string[]
  skills_detail?: Record<string, SkillDetail>
  bullets?: BulletStats
  experience?: {
    experiences: ExperienceEntry[]
    total_years: number
    employment_gaps: unknown[]
  }
}

export interface Resume {
  id: UUID
  name: string
  resume_version: number
  resume_data: ResumeData | null
  original_file_url: string | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface ResumeUploadResponse {
  resume: Resume
  ats_scan: ATSScan
}

export interface ResumeUpdateInput {
  name?: string
  resume_data?: ResumeData
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export interface Job {
  id: UUID
  job_title: string
  company_name: string
  job_description_text: string
  parsed_keywords: unknown
  created_at: ISODateString
  updated_at: ISODateString
}

export interface JobInput {
  job_title: string
  company_name: string
  job_description_text: string
}

// ---------------------------------------------------------------------------
// ATS
// ---------------------------------------------------------------------------

export type ScanMode = "resume_only" | "jd_match"
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

export interface FormatWarning {
  message: string
  severity: "low" | "medium" | "high"
}

export interface ResumeOnlyBreakdown {
  section_completeness: number | null
  keyword_strength: number | null
  bullet_quality: number | null
  format_compatibility: number | null
  content_quantification: number | null
  /** Always null due to a backend key mismatch; prefer `scan_result.resume_length_score`. */
  resume_length: number | null
}

export interface ResumeOnlyResult {
  quality_score: number
  section_completeness: number
  keyword_strength: number
  bullet_quality: number
  format_compatibility: number
  content_quantification: number
  resume_length_score: number
  word_count: number
  sections: ResumeData["sections"]
  format_warnings: FormatWarning[]
  bullets: BulletStats
  detected_skills: string[]
  skills_detail: Record<string, SkillDetail>
  recommendations: string[]
}

export interface JdMatchBreakdown {
  skill_match: number
  keyword_similarity: number
  semantic_similarity: number
  experience_relevance: number
}

export interface ActionableRecommendation {
  severity: Severity
  title: string
  actions: string[]
  estimated_impact_pct?: number
}

export interface KeywordDensity {
  current_density_pct: number
  optimal_density_pct: number
  mention_count: number
  is_overstuffed: boolean
  suggestion: string
  safe_locations: string[]
}

export interface JdMatchResult {
  ats_score: number
  breakdown: JdMatchBreakdown
  experience_relevance_detail?: {
    combined_score: number
    title_match: number
    recency_weight: number
    progression_score: number
  }
  matched_skills: string[]
  missing_critical_skills: string[]
  matched_keywords: Record<string, number>
  recommendations: string[]
  actionable_recommendations: ActionableRecommendation[]
  keyword_density: Record<string, KeywordDensity>
  skills_detail: Record<string, SkillDetail>
}

interface ATSScanBase {
  id: UUID
  ats_score: number
  missing_keywords: string[]
  suggestions: string[]
  resume: UUID
  job: UUID | null
  created_at: ISODateString
}

export interface ResumeOnlyScan extends ATSScanBase {
  scan_mode: "resume_only"
  breakdown: ResumeOnlyBreakdown
  scan_result: ResumeOnlyResult
}

export interface JdMatchScan extends ATSScanBase {
  scan_mode: "jd_match"
  breakdown: JdMatchBreakdown
  scan_result: JdMatchResult
}

export type ATSScan = ResumeOnlyScan | JdMatchScan

export interface ScanInput {
  resume_id: UUID
  job_id?: UUID | null
}

// ---------------------------------------------------------------------------
// Generated documents
// ---------------------------------------------------------------------------

export type DocumentType = "resume" | "cover_letter" | "linkedin_bio" | "resume_refactor"
export type DownloadFormat = "pdf" | "docx" | "txt"

export interface GeneratedDocument {
  id: UUID
  document_type: DocumentType
  /** Plain text (cover letter) or a JSON string (resume types, LinkedIn bio). */
  document_content: string
  file_url: string | null
  resume: UUID | null
  job: UUID | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface GenerateInput {
  resume_id: UUID
  job_id?: UUID | null
}
