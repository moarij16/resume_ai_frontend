import { LightbulbIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SuggestionsCard({ suggestions }: { suggestions: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggestions</CardTitle>
        <CardDescription>The quickest wins for a higher score.</CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length ? (
          <ul className="flex flex-col gap-2.5">
            {suggestions.map((suggestion) => (
              <li key={suggestion} className="flex gap-2 text-sm">
                <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Nothing to improve — nice work.</p>
        )}
      </CardContent>
    </Card>
  )
}
