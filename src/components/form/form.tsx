"use client"

import { createFormHook, createFormHookContexts, useStore } from "@tanstack/react-form"
import { Loader2Icon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

/** TanStack Form errors may be strings (server) or Standard Schema issues (Zod). */
function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) =>
      typeof error === "string" ? { message: error } : (error as { message?: string })
    )
    .filter((error) => error?.message)
}

interface FieldShellProps {
  label: string
  description?: ReactNode
  children: (props: { id: string; invalid: boolean }) => ReactNode
}

function FieldShell({ label, description, children }: FieldShellProps) {
  const field = useFieldContext<unknown>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const isTouched = useStore(field.store, (state) => state.meta.isTouched)
  const submitAttempts = useStore(field.form.store, (state) => state.submissionAttempts)
  const visibleErrors = isTouched || submitAttempts > 0 ? toFieldErrors(errors) : []
  const invalid = visibleErrors.length > 0
  const id = `field-${field.name}`

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children({ id, invalid })}
      {description && !invalid ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={visibleErrors} />
    </Field>
  )
}

type TextFieldProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "onBlur" | "name"
> & {
  label: string
  description?: ReactNode
}

function TextField({ label, description, ...inputProps }: TextFieldProps) {
  const field = useFieldContext<string>()
  return (
    <FieldShell label={label} description={description}>
      {({ id, invalid }) => (
        <Input
          id={id}
          name={field.name}
          value={field.state.value ?? ""}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={invalid}
          {...inputProps}
        />
      )}
    </FieldShell>
  )
}

type TextareaFieldProps = Omit<
  ComponentProps<typeof Textarea>,
  "value" | "onChange" | "onBlur" | "name"
> & {
  label: string
  description?: ReactNode
}

function TextareaField({ label, description, ...textareaProps }: TextareaFieldProps) {
  const field = useFieldContext<string>()
  return (
    <FieldShell label={label} description={description}>
      {({ id, invalid }) => (
        <Textarea
          id={id}
          name={field.name}
          value={field.state.value ?? ""}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={invalid}
          {...textareaProps}
        />
      )}
    </FieldShell>
  )
}

function SubmitButton({ children, ...props }: ComponentProps<typeof Button>) {
  const form = useFormContext()
  const [canSubmit, isSubmitting] = useStore(form.store, (state) => [
    state.canSubmit,
    state.isSubmitting,
  ])
  return (
    <Button type="submit" disabled={!canSubmit || isSubmitting} {...props}>
      {isSubmitting ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : null}
      {children}
    </Button>
  )
}

/** Renders form-level (non-field) errors, e.g. "Invalid credentials". */
function FormError() {
  const form = useFormContext()
  const error = useStore(form.store, (state) => state.errorMap.onSubmit)
  const message = typeof error === "string" ? error : undefined
  if (!message) return null
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField },
  formComponents: { SubmitButton, FormError },
})
