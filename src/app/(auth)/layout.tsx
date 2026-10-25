import Link from "next/link"

import { Logo } from "@/components/shared/logo"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <Link href="/" className="w-fit">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="bg-primary text-primary-foreground relative hidden flex-col justify-end overflow-hidden p-10 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(1_0_0/0.12),transparent_60%)]" />
        <blockquote className="relative flex max-w-md flex-col gap-3">
          <p className="text-2xl leading-snug font-medium">
            Beat the applicant tracking systems. Tailor every application in minutes.
          </p>
          <footer className="text-sm opacity-70">
            ATS scoring · Job matching · AI cover letters, LinkedIn bios and resume rewrites
          </footer>
        </blockquote>
      </div>
    </div>
  )
}
