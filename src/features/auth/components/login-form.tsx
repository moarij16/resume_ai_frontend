"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { useAppForm } from "@/components/form/form"
import { toFormErrors } from "@/components/form/server-errors"
import { FieldGroup } from "@/components/ui/field"

import { useLogin } from "../hooks"
import { loginSchema, safeRedirect, type LoginValues } from "../schemas"

const FIELDS = ["email", "password"] as const

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useLogin()

  const form = useAppForm({
    defaultValues: { email: "", password: "" } satisfies LoginValues,
    validators: {
      onChange: loginSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          await login.mutateAsync(value)
          return undefined
        } catch (error) {
          return toFormErrors(error, FIELDS)
        }
      },
    },
    onSubmit: () => {
      router.replace(safeRedirect(searchParams.get("next")))
      router.refresh()
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.FormError />
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                autoFocus
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField label="Password" type="password" autoComplete="current-password" />
            )}
          </form.AppField>
          <form.SubmitButton className="w-full">Sign in</form.SubmitButton>
          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
