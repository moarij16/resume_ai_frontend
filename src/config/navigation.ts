import {
  BriefcaseIcon,
  FileTextIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const MAIN_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Resumes", href: "/resumes", icon: FileTextIcon },
  { title: "Jobs", href: "/jobs", icon: BriefcaseIcon },
  { title: "ATS scans", href: "/ats", icon: GaugeIcon },
  { title: "Documents", href: "/documents", icon: SparklesIcon },
]

export const SECONDARY_NAV: NavItem[] = [
  { title: "Settings", href: "/settings", icon: SettingsIcon },
]
