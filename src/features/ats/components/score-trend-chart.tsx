"use client"

import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatDate } from "@/lib/format"
import type { ATSScan } from "@/types/api"

const chartConfig = {
  score: { label: "ATS score", color: "var(--chart-1)" },
} satisfies ChartConfig

/** ATS score over time, oldest to newest. */
export function ScoreTrendChart({ scans, limit = 12 }: { scans: ATSScan[]; limit?: number }) {
  const data = useMemo(
    () =>
      [...scans]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .slice(-limit)
        .map((scan) => ({ date: formatDate(scan.created_at), score: Math.round(scan.ats_score) })),
    [scans, limit]
  )

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <LineChart data={data} margin={{ left: -20, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} width={48} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="score"
          type="monotone"
          stroke="var(--color-score)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
