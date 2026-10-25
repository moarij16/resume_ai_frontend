import { TagList } from "@/components/shared/tag-list"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ActionableRecommendation, JdMatchScan, Severity } from "@/types/api"

import { SEVERITY_ORDER } from "../labels"
import { SuggestionsCard } from "./suggestions-card"

const SEVERITY_VARIANT: Record<Severity, "destructive" | "default" | "secondary" | "outline"> = {
  CRITICAL: "destructive",
  HIGH: "destructive",
  MEDIUM: "default",
  LOW: "outline",
}

function Recommendation({ rec }: { rec: ActionableRecommendation }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={SEVERITY_VARIANT[rec.severity]}>{rec.severity.toLowerCase()}</Badge>
        <span className="text-sm font-medium">{rec.title}</span>
        {rec.estimated_impact_pct ? (
          <span className="text-muted-foreground ml-auto text-xs">
            ~+{Math.round(rec.estimated_impact_pct)}% impact
          </span>
        ) : null}
      </div>
      {rec.actions.length ? (
        <ul className="text-muted-foreground ml-4 list-disc text-sm">
          {rec.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function JdMatchDetails({ scan }: { scan: JdMatchScan }) {
  const result = scan.scan_result
  const recommendations = [...(result.actionable_recommendations ?? [])].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )
  const density = Object.entries(result.keyword_density ?? {})

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>How your skills line up with the job description.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Missing ({scan.missing_keywords.length})</p>
            <TagList
              items={scan.missing_keywords}
              variant="destructive"
              empty="No critical gaps."
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Matched ({result.matched_skills?.length ?? 0})</p>
            <TagList
              items={result.matched_skills ?? []}
              limit={30}
              empty="No matching skills found."
            />
          </div>
        </CardContent>
      </Card>

      <SuggestionsCard suggestions={scan.suggestions} />

      {recommendations.length ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Action plan</CardTitle>
            <CardDescription>Prioritised by severity and estimated impact.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 md:grid-cols-2">
              {recommendations.map((rec) => (
                <Recommendation key={rec.title} rec={rec} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {density.length ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Keyword density</CardTitle>
            <CardDescription>Aim for the optimal range without keyword stuffing.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Mentions</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Optimal</TableHead>
                  <TableHead>Suggestion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {density.map(([keyword, info]) => (
                  <TableRow key={keyword}>
                    <TableCell className="font-medium">
                      {keyword}
                      {info.is_overstuffed ? (
                        <Badge variant="destructive" className="ml-2">
                          overused
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{info.mention_count}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {info.current_density_pct}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {info.optimal_density_pct}%
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs whitespace-normal">
                      {info.suggestion}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
