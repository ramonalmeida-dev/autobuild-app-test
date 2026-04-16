import type { ReactNode } from "react"
import { Menu } from "lucide-react"
import { NavLink } from "react-router-dom"
import { Toaster } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { appNavItems } from "@/app/navigation"

type AppShellProps = {
  children: ReactNode
  className?: string
}

function ShellBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="size-2 rounded-full bg-primary ring-2 ring-primary/20" aria-hidden />
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">test-app-autobuild</p>
        <p className="text-xs text-muted-foreground">Operação de semijoias</p>
      </div>
    </div>
  )
}

function ShellNav({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav className={cn("flex flex-col gap-1", mobile && "items-stretch")}>
      {appNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "w-full rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              mobile && "px-2"
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("flex min-h-svh bg-background", className)}>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-4 py-4">
          <ShellBrand />
        </div>
        <div className="flex-1 p-3">
          <ShellNav />
        </div>
      </aside>

      <div className="flex min-h-svh flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <ShellBrand />
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="icon-sm">
                  <Menu aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Navegação</SheetTitle>
                  <SheetDescription>Acesso rápido aos módulos operacionais.</SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <ShellNav mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  )
}
