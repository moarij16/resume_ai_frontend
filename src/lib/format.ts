const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})
const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

export function formatDate(value: string | null | undefined) {
  return value ? dateFormatter.format(new Date(value)) : "—"
}

export function formatDateTime(value: string | null | undefined) {
  return value ? dateTimeFormatter.format(new Date(value)) : "—"
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
]

export function formatRelative(value: string | null | undefined) {
  if (!value) return "—"
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormatter.format(Math.round(seconds / size), unit)
  }
  return "just now"
}

export function formatScore(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value).toString() : "N/A"
}

export function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/^\w/, (char) => char.toUpperCase())
}

export function fullName(user: { first_name?: string; last_name?: string; email: string }) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
}

export function initials(user: { first_name?: string; last_name?: string; email: string }) {
  const parts = [user.first_name, user.last_name].filter(Boolean) as string[]
  const source = parts.length ? parts.map((part) => part[0]) : [user.email[0]]
  return source.join("").slice(0, 2).toUpperCase()
}
