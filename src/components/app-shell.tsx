import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookMarked,
  BrainCircuit,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  NotebookPen,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

const NAV = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Study Room", url: "/study-room", icon: BrainCircuit },
  { title: "Notes", url: "/notes", icon: NotebookPen },
  { title: "PYQs", url: "/pyqs", icon: FileQuestion },
  { title: "Mock Tests", url: "/mock-tests", icon: BookMarked },
  { title: "Revision", url: "/revision", icon: RotateCcw },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "AI Mentor", url: "/mentor", icon: MessageSquareQuote },
] as const;

function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-gradient text-sidebar-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate font-display text-lg leading-none">UPSC AI Mentor</span>
            <span className="block truncate text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
              Adaptive CSE prep
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => supabase.auth.signOut()}
              tooltip={user?.email ?? "Sign out"}
            >
              <LogOut className="size-4 shrink-0" />
              <span className="truncate">{user?.email ?? "Sign out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-3 py-3 sm:flex sm:px-6 sm:py-4">
              <SidebarTrigger className="shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-display text-xl leading-tight sm:text-2xl">{title}</h1>
                {subtitle ? (
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
                ) : null}
              </div>
              {actions ? (
                <div className="col-span-2 flex flex-wrap gap-2 sm:col-auto">{actions}</div>
              ) : null}
            </div>
          </header>
          <main className="flex-1 px-3 py-5 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
