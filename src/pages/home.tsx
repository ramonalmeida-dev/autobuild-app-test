import { Inbox, TrendingUp, Users, Zap } from "lucide-react"
import { toast } from "sonner"

import { PageContainer } from "@/app/layouts/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

const metrics = [
  {
    label: "Active users",
    value: "1,284",
    delta: "+12%",
    icon: Users,
  },
  {
    label: "Throughput",
    value: "98.2%",
    delta: "Stable",
    icon: Zap,
  },
  {
    label: "Growth",
    value: "24%",
    delta: "+4% vs last week",
    icon: TrendingUp,
  },
] as const

export function HomePage() {
  return (
    <PageContainer>
      <div className="space-y-10">
        <PageHeader
          title="Overview"
          description="Monitor key signals and keep work moving. This screen demonstrates layout, typography, and shared UI primitives."
          action={
            <Button
              type="button"
              onClick={() => toast.success("Example toast", { description: "Notifications are wired through Sonner." })}
            >
              Send test toast
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((item) => (
            <Card key={item.label} className="shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {item.value}
                  </CardTitle>
                </div>
                <div className="rounded-md bg-muted p-2 text-muted-foreground">
                  <item.icon className="size-4" aria-hidden />
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="font-normal">
                  {item.delta}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-medium text-foreground">Inbox</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Empty states should feel intentional, not like missing content.
            </p>
          </div>
          <EmptyState
            icon={Inbox}
            title="Nothing queued"
            description="When items arrive, they will appear here. Use this pattern for first-run experiences and zero-data views."
            action={
              <Button type="button" variant="outline" size="sm">
                Configure sources
              </Button>
            }
          />
        </div>
      </div>
    </PageContainer>
  )
}
