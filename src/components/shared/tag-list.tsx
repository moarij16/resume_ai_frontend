import { Badge } from "@/components/ui/badge"

interface TagListProps {
  items: string[]
  variant?: "default" | "secondary" | "outline" | "destructive"
  empty?: string
  limit?: number
}

export function TagList({ items, variant = "secondary", empty = "None", limit }: TagListProps) {
  if (!items.length) return <p className="text-muted-foreground text-sm">{empty}</p>
  const visible = limit ? items.slice(0, limit) : items
  const hidden = items.length - visible.length
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((item) => (
        <Badge key={item} variant={variant}>
          {item}
        </Badge>
      ))}
      {hidden > 0 ? <Badge variant="outline">+{hidden} more</Badge> : null}
    </div>
  )
}
