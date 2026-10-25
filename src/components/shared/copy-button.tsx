"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState, type ComponentProps } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface CopyButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
  value: string
  label?: string
}

export function CopyButton({
  value,
  label = "Copy",
  variant = "outline",
  size = "sm",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy to clipboard.")
    }
  }

  return (
    <Button variant={variant} size={size} onClick={copy} {...props}>
      {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
      {label ? (copied ? "Copied" : label) : null}
    </Button>
  )
}
