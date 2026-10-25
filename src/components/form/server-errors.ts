import { getErrorMessage, isApiError } from "@/lib/http/errors"

export interface FormSubmitErrors {
  form?: string
  fields: Record<string, string>
}

/**
 * Converts a failed mutation into the `{ form, fields }` shape TanStack Form
 * expects from an `onSubmitAsync` validator. Field errors only map onto fields
 * the form actually has; anything else becomes a form-level message.
 */
export function toFormErrors(error: unknown, knownFields: readonly string[]): FormSubmitErrors {
  if (!isApiError(error)) return { form: getErrorMessage(error), fields: {} }

  const fields: Record<string, string> = {}
  for (const [name, messages] of Object.entries(error.fieldErrors)) {
    if (knownFields.includes(name) && messages[0]) fields[name] = messages[0]
  }

  const hasMappedFields = Object.keys(fields).length > 0
  return { form: hasMappedFields ? undefined : error.message, fields }
}
