import { cn } from "@/lib/utils"
import { formatScore } from "@/lib/format"

export type ScoreTone = "good" | "fair" | "poor" | "none"

export function scoreTone(value: number | null | undefined): ScoreTone {
  if (typeof value !== "number" || !Number.isFinite(value)) return "none"
  if (value >= 75) return "good"
  if (value >= 50) return "fair"
  return "poor"
}

const TONE_TEXT: Record<ScoreTone, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  fair: "text-amber-600 dark:text-amber-400",
  poor: "text-red-600 dark:text-red-400",
  none: "text-muted-foreground",
}

const TONE_BAR: Record<ScoreTone, string> = {
  good: "bg-emerald-500",
  fair: "bg-amber-500",
  poor: "bg-red-500",
  none: "bg-muted-foreground/30",
}

const TONE_LABEL: Record<ScoreTone, string> = {
  good: "Strong",
  fair: "Needs work",
  poor: "Weak",
  none: "Not available",
}

interface ScoreRingProps {
  value: number | null | undefined
  size?: number
  label?: string
  className?: string
}

/** Circular 0–100 score gauge. */
export function ScoreRing({ value, size = 140, label = "ATS score", className }: ScoreRingProps) {
  const tone = scoreTone(value)
  const stroke = Math.max(8, size / 12)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = typeof value === "number" ? Math.min(100, Math.max(0, value)) : 0

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          role="img"
          aria-label={`${label}: ${formatScore(value)} out of 100`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
            className={cn(
              "stroke-current transition-[stroke-dashoffset] duration-700",
              TONE_TEXT[tone]
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-semibold tabular-nums", TONE_TEXT[tone])}>
            {formatScore(value)}
          </span>
          <span className="text-muted-foreground text-xs">/ 100</span>
        </div>
      </div>
      <span className={cn("text-sm font-medium", TONE_TEXT[tone])}>{TONE_LABEL[tone]}</span>
    </div>
  )
}

/** Labelled horizontal bar for a 0–100 sub-score. */
export function ScoreBar({ label, value }: { label: string; value: number | null | undefined }) {
  const tone = scoreTone(value)
  const width = typeof value === "number" ? Math.min(100, Math.max(0, value)) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className={cn("font-medium tabular-nums", TONE_TEXT[tone])}>
          {formatScore(value)}
        </span>
      </div>
      <div
        className="bg-muted h-2 overflow-hidden rounded-full"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={typeof value === "number" ? Math.round(value) : undefined}
      >
        <div
          className={cn("h-full rounded-full transition-all", TONE_BAR[tone])}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export function ScoreBadge({ value }: { value: number | null | undefined }) {
  const tone = scoreTone(value)
  return (
    <span
      className={cn(
        "inline-flex min-w-10 items-center justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
        TONE_TEXT[tone],
        tone === "good" && "bg-emerald-500/10",
        tone === "fair" && "bg-amber-500/10",
        tone === "poor" && "bg-red-500/10",
        tone === "none" && "bg-muted"
      )}
    >
      {formatScore(value)}
    </span>
  )
}
