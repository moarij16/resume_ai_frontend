import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { Settings } from "@/features/profile/components/settings"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your account." />
      <Settings />
    </>
  )
}
