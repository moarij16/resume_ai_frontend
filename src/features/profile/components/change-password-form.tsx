"use client"

import { useAppForm } from "@/components/form/form"
import { toFormErrors } from "@/components/form/server-errors"
import { FieldGroup } from "@/components/ui/field"

import { useChangePassword } from "../hooks"
import { changePasswordSchema, type ChangePasswordValues } from "../schemas"

const FIELDS = ["current_password", "new_password"] as const

const defaultValues: ChangePasswordValues = {
  current_password: "",
  new_password: "",
  confirm_password: "",
}

export function ChangePasswordForm() {
  const changePassword = useChangePassword()

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: changePasswordSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          await changePassword.mutateAsync({
            current_password: value.current_password,
            new_password: value.new_password,
          })
          return undefined
        } catch (error) {
          return toFormErrors(error, FIELDS)
        }
      },
    },
    onSubmit: ({ formApi }) => formApi.reset(),
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
          <form.AppField name="current_password">
            {(field) => (
              <field.TextField
                label="Current password"
                type="password"
                autoComplete="current-password"
              />
            )}
          </form.AppField>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="new_password">
              {(field) => (
                <field.TextField label="New password" type="password" autoComplete="new-password" />
              )}
            </form.AppField>
            <form.AppField name="confirm_password">
              {(field) => (
                <field.TextField
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                />
              )}
            </form.AppField>
          </div>
          <div className="flex justify-end">
            <form.SubmitButton>Change password</form.SubmitButton>
          </div>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
