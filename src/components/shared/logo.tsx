import { SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
        <SparklesIcon className="size-4" />
      </span>
      <span className={textClassName}>CareerLift</span>
    </span>
  )
}
