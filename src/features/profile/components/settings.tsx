"use client"

import { DetailSkeleton, ErrorState } from "@/components/shared/states"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format"

import { useMe } from "../hooks"
import { ChangePasswordForm } from "./change-password-form"
import { ProfileForm } from "./profile-form"

export function Settings() {
  const { data: user, isPending, error, refetch } = useMe()

  if (isPending) return <DetailSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />

  return (
    <div className="grid max-w-3xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your name appears on generated resumes. Member since {formatDate(user.created_at)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm key={user.id} user={user} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Use at least 8 characters that aren&apos;t all numbers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
