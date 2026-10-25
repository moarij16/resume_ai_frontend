"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const NONE = "__none__"

export interface EntityOption {
  value: string
  label: string
  description?: string
}

interface EntitySelectProps {
  id?: string
  value: string | null
  onChange: (value: string | null) => void
  options: EntityOption[]
  placeholder: string
  /** When set, adds an explicit "none" choice that maps to `null`. */
  noneLabel?: string
  disabled?: boolean
  invalid?: boolean
}

/** Select bound to nullable IDs (Radix Select does not allow empty-string values). */
export function EntitySelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  noneLabel,
  disabled,
  invalid,
}: EntitySelectProps) {
  return (
    <Select
      value={value ?? (noneLabel ? NONE : undefined)}
      onValueChange={(next) => onChange(next === NONE ? null : next)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {noneLabel ? <SelectItem value={NONE}>{noneLabel}</SelectItem> : null}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="truncate">{option.label}</span>
            {option.description ? (
              <span className="text-muted-foreground truncate">{option.description}</span>
            ) : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
