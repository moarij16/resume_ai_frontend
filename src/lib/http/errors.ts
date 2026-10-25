export type FieldErrors = Record<string, string[]>

/** Normalised error for every failed API call, regardless of backend error shape. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors
  readonly code?: string

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
    this.code = code
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get hasFieldErrors() {
    return Object.keys(this.fieldErrors).length > 0
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "The request was invalid.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  413: "That file is too large.",
  429: "Too many requests. Please slow down.",
  503: "The AI service is busy. Please try again.",
}

const NON_FIELD_KEYS = new Set([
  "non_field_errors",
  "detail",
  "error",
  "status_code",
  "code",
  "messages",
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toMessages(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(toMessages)
  if (isRecord(value)) return Object.values(value).flatMap(toMessages)
  return []
}

/**
 * The backend returns several error shapes:
 *  - `{ error: true, status_code, detail: <DRF payload> }` (custom exception handler)
 *  - `{ error: true, detail: "message" }` (ATS scan / upload)
 *  - `{ error: "message" }` (document download)
 *  - raw DRF `{ detail }` or `{ field: [messages] }`
 * This collapses them into a single `ApiError`.
 */
export function toApiError(status: number, body: unknown): ApiError {
  const fallback = STATUS_MESSAGES[status] ?? "Something went wrong. Please try again."

  if (typeof body === "string" && body.trim() && !body.trimStart().startsWith("<")) {
    return new ApiError(status, body)
  }
  if (!isRecord(body)) return new ApiError(status, fallback)

  if (typeof body.error === "string") return new ApiError(status, body.error)

  const payload = "detail" in body && body.error === true ? body.detail : body

  if (typeof payload === "string") return new ApiError(status, payload)
  if (!isRecord(payload)) return new ApiError(status, fallback)

  const code = typeof payload.code === "string" ? payload.code : undefined
  const fieldErrors: FieldErrors = {}
  for (const [key, value] of Object.entries(payload)) {
    if (NON_FIELD_KEYS.has(key)) continue
    const messages = toMessages(value)
    if (messages.length) fieldErrors[key] = messages
  }

  const message =
    (typeof payload.detail === "string" && payload.detail) ||
    toMessages(payload.non_field_errors)[0] ||
    Object.values(fieldErrors)[0]?.[0] ||
    fallback

  return new ApiError(status, message, fieldErrors, code)
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}
