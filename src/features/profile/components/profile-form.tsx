"use client"

import { useAppForm } from "@/components/form/form"
import { toFormErrors } from "@/components/form/server-errors"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { User } from "@/types/api"

import { useUpdateProfile } from "../hooks"
import { profileSchema, type ProfileValues } from "../schemas"

const FIELDS = ["first_name", "last_name"] as const

export function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile()

  const form = useAppForm({
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
    } satisfies ProfileValues,
    validators: {
      onChange: profileSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          await update.mutateAsync(value)
          return undefined
        } catch (error) {
          return toFormErrors(error, FIELDS)
        }
      },
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
          <Field>
            <FieldLabel htmlFor="profile-email">Email</FieldLabel>
            <Input id="profile-email" value={user.email} disabled readOnly />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="first_name">
              {(field) => <field.TextField label="First name" autoComplete="given-name" />}
            </form.AppField>
            <form.AppField name="last_name">
              {(field) => <field.TextField label="Last name" autoComplete="family-name" />}
            </form.AppField>
          </div>
          <div className="flex justify-end">
            <form.SubmitButton>Save profile</form.SubmitButton>
          </div>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
