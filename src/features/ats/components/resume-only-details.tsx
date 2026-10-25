import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react"

import { TagList } from "@/components/shared/tag-list"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ResumeOnlyScan } from "@/types/api"

import { SuggestionsCard } from "./suggestions-card"

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border p-3">
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}

export function ResumeOnlyDetails({ scan }: { scan: ResumeOnlyScan }) {
  const result = scan.scan_result
  const bullets = result.bullets
  const sections = result.sections

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SuggestionsCard suggestions={scan.suggestions} />

      <Card>
        <CardHeader>
          <CardTitle>Formatting</CardTitle>
          <CardDescription>Issues that can trip up ATS parsers.</CardDescription>
        </CardHeader>
        <CardContent>
          {result.format_warnings?.length ? (
            <ul className="flex flex-col gap-2">
              {result.format_warnings.map((warning) => (
                <li key={warning.message} className="flex items-start gap-2 text-sm">
                  <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <span className="flex-1">{warning.message}</span>
                  <Badge variant={warning.severity === "high" ? "destructive" : "outline"}>
                    {warning.severity}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <CheckCircle2Icon className="size-4 text-emerald-500" /> No formatting issues found.
            </p>
          )}
        </CardContent>
      </Card>

      {bullets ? (
        <Card>
          <CardHeader>
            <CardTitle>Bullet points</CardTitle>
            <CardDescription>
              Strong bullets start with a verb and include a metric.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Total" value={bullets.total_bullets} />
              <Stat label="Action verbs" value={bullets.bullets_with_action_verbs} />
              <Stat label="With metrics" value={bullets.bullets_with_metrics} />
            </div>
            {bullets.weak_bullets?.length ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Bullets to strengthen</p>
                <ul className="text-muted-foreground flex flex-col gap-1.5 text-sm">
                  {bullets.weak_bullets.slice(0, 5).map((bullet) => (
                    <li key={bullet} className="border-l-2 border-amber-500/50 pl-3">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>{result.word_count} words analysed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Sections found</p>
            <TagList items={sections?.section_names ?? []} empty="No sections detected." />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Detected skills</p>
            <TagList items={result.detected_skills ?? []} limit={30} empty="No skills detected." />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
