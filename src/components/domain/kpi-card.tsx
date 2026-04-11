import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type KpiCardProps = {
  label: string
  value: string
  helper?: string
  icon: LucideIcon
}

export function KpiCard({ label, value, helper, icon: Icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-2xl">{value}</CardTitle>
        </div>
        <div className="rounded-md bg-muted p-2 text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </div>
      </CardHeader>
      {helper ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}
