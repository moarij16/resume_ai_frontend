"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"

import { Logo } from "@/components/shared/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { MAIN_NAV, SECONDARY_NAV, type NavItem } from "@/config/navigation"

import { UserMenu } from "./user-menu"

function NavMenu({ items, activePath }: { items: NavItem[]; activePath: string | null }) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            tooltip={item.title}
            isActive={
              !!activePath && (activePath === item.href || activePath.startsWith(`${item.href}/`))
            }
          >
            <Link href={item.href} onClick={() => setOpenMobile(false)}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

function ActiveNavMenu({ items }: { items: NavItem[] }) {
  return <NavMenu items={items} activePath={usePathname()} />
}

function NavGroup({ label, items }: { label?: string; items: NavItem[] }) {
  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        {/* The pathname is request data under Cache Components; prerender the menu without an active item. */}
        <Suspense fallback={<NavMenu items={items} activePath={null} />}>
          <ActiveNavMenu items={items} />
        </Suspense>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex h-10 items-center px-2 group-data-[collapsible=icon]:px-0.5"
        >
          <Logo textClassName="group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Workspace" items={MAIN_NAV} />
        <NavGroup items={SECONDARY_NAV} />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
