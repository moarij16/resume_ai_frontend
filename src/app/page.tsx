import { redirect } from "next/navigation"

// Unauthenticated visitors are sent to /login by `proxy.ts` before reaching this.
export default function Home() {
  redirect("/dashboard")
}
