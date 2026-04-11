import { Loader2 } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type LoadingStateProps = {
  variant?: "spinner" | "skeleton"
  message?: string
  className?: string
}

export function LoadingState({
  variant = "spinner",
  message,
  className,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-9 w-full max-w-md" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className
      )}
    >
      <Loader2 className="size-8 animate-spin" aria-hidden />
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  )
}
