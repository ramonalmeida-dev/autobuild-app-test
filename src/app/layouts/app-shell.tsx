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

function ShellNav({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav className={cn("flex items-center gap-1", mobile && "flex-col items-stretch")}> 
      {appNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              mobile && "px-2 py-2"
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
    <div className={cn("flex min-h-svh flex-col bg-background", className)}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-primary ring-2 ring-primary/20" aria-hidden />
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">test-app-autobuild</p>
              <p className="text-xs text-muted-foreground">Operação de semijoias</p>
            </div>
          </div>

          <div className="hidden md:block">
            <ShellNav />
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="icon-sm">
                  <Menu aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
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
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  )
}
