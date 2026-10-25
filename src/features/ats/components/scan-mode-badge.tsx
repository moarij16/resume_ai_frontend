import { Badge } from "@/components/ui/badge"
import type { ScanMode } from "@/types/api"

import { SCAN_MODE_LABELS } from "../labels"

export function ScanModeBadge({ mode }: { mode: ScanMode }) {
  return (
    <Badge variant={mode === "jd_match" ? "default" : "secondary"}>{SCAN_MODE_LABELS[mode]}</Badge>
  )
}
