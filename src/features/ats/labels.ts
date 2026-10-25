import type { ScanMode, Severity } from "@/types/api"

export const SCAN_MODE_LABELS: Record<ScanMode, string> = {
  resume_only: "Resume only",
  jd_match: "Job match",
}

export const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
