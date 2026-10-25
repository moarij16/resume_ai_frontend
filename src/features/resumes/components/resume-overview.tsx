import { TagList } from "@/components/shared/tag-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ResumeData } from "@/types/api"

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function yearRange(start: number | null, end: number | null) {
  if (!start && !end) return null
  return `${start ?? "?"} – ${end ?? "Present"}`
}

export function ResumeOverview({ data }: { data: ResumeData | null }) {
  if (!data) {
    return <p className="text-muted-foreground text-sm">This resume has no parsed data.</p>
  }

  const experiences = data.experience?.experiences ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-3">
        <CardContent className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Metric label="Words" value={data.word_count ?? "—"} />
          <Metric label="Pages" value={data.metadata?.page_count ?? "—"} />
          <Metric label="Skills" value={data.detected_skills?.length ?? 0} />
          <Metric
            label="Experience"
            value={data.experience?.total_years ? `${data.experience.total_years} yrs` : "—"}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Experience</CardTitle>
          <CardDescription>Roles detected in your resume.</CardDescription>
        </CardHeader>
        <CardContent>
          {experiences.length ? (
            <ol className="flex flex-col gap-4 border-l pl-4">
              {experiences.map((entry, index) => (
                <li key={`${entry.title}-${entry.company}-${index}`} className="relative">
                  <span className="bg-primary absolute top-1.5 -left-[21px] size-2.5 rounded-full" />
                  <p className="text-sm font-medium">{entry.title ?? "Untitled role"}</p>
                  <p className="text-muted-foreground text-sm">
                    {[entry.company, yearRange(entry.start_year, entry.end_year)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted-foreground text-sm">No roles detected.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>Required and optional sections found.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TagList
            items={data.sections?.required_present ?? []}
            empty="No required sections found."
          />
          <TagList items={data.sections?.optional_present ?? []} variant="outline" empty="" />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Keywords ATS systems will pick up.</CardDescription>
        </CardHeader>
        <CardContent>
          <TagList items={data.detected_skills ?? []} empty="No skills detected." />
        </CardContent>
      </Card>
    </div>
  )
}
