"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { useAppForm } from "@/components/form/form"
import { toFormErrors } from "@/components/form/server-errors"
import { FieldGroup } from "@/components/ui/field"

import { useRegister } from "../hooks"
import { registerSchema, type RegisterValues } from "../schemas"

const FIELDS = ["first_name", "last_name", "email", "password"] as const

const defaultValues: RegisterValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
}

export function RegisterForm() {
  const router = useRouter()
  const register = useRegister()

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: registerSchema,
      onSubmitAsync: async ({ value: { first_name, last_name, email, password } }) => {
        try {
          await register.mutateAsync({ first_name, last_name, email, password })
          return undefined
        } catch (error) {
          return toFormErrors(error, FIELDS)
        }
      },
    },
    onSubmit: () => {
      router.replace("/dashboard")
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
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="first_name">
              {(field) => (
                <field.TextField label="First name" autoComplete="given-name" autoFocus />
              )}
            </form.AppField>
            <form.AppField name="last_name">
              {(field) => <field.TextField label="Last name" autoComplete="family-name" />}
            </form.AppField>
          </div>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                description="At least 8 characters, not entirely numeric."
              />
            )}
          </form.AppField>
          <form.AppField name="confirm_password">
            {(field) => (
              <field.TextField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
              />
            )}
          </form.AppField>
          <form.SubmitButton className="w-full">Create account</form.SubmitButton>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
