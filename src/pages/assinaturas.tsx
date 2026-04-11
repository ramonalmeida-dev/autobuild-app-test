import { useMemo, useState } from "react"
import { CreditCard, Repeat } from "lucide-react"

import { PageContainer } from "@/app/layouts/page-container"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockPlans, mockSubscriptions } from "@/data/mock-data"
import { useViewState } from "@/hooks/use-view-state"
import { formatCurrency, formatDate } from "@/lib/format"
import type { StoreSubscription } from "@/types/domain"

export function AssinaturasPage() {
  const view = useViewState()
  const [subscriptions, setSubscriptions] = useState<StoreSubscription[]>(mockSubscriptions)
  const [selectedSubscription, setSelectedSubscription] = useState<StoreSubscription | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState(mockPlans[0]?.id ?? "")

  const mrr = useMemo(() => {
    return subscriptions.reduce((acc, subscription) => {
      const plan = mockPlans.find((item) => item.id === subscription.planoId)
      if (!plan || subscription.status === "cancelada") {
        return acc
      }

      return acc + plan.precoMensal
    }, 0)
  }, [subscriptions])

  const changePlan = () => {
    if (!selectedSubscription) {
      return
    }

    setSubscriptions((prev) =>
      prev.map((item) =>
        item.id === selectedSubscription.id
          ? {
              ...item,
              planoId: selectedPlanId,
              status: "ativa",
            }
          : item
      )
    )

    setSelectedSubscription(null)
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Assinaturas e Planos"
          description="Módulo de fase 2 para controlar cobrança mensal por plano e renovações das lojas."
        />

        <Card>
          <CardContent className="grid gap-3 pt-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">MRR estimado</p>
              <p className="text-lg font-semibold">{formatCurrency(mrr)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Assinaturas ativas</p>
              <p className="text-lg font-semibold">
                {subscriptions.filter((item) => item.status === "ativa").length}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Assinaturas vencendo</p>
              <p className="text-lg font-semibold">
                {subscriptions.filter((item) => item.status === "vencendo").length}
              </p>
            </div>
          </CardContent>
        </Card>

        {view.isLoading ? <LoadingState variant="skeleton" /> : null}
        {view.isError ? (
          <ErrorState
            title="Não foi possível carregar assinaturas"
            description="Recarregue para continuar a gestão de planos."
            onRetry={view.retry}
            retryLabel="Recarregar"
          />
        ) : null}

        {view.isReady ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Planos disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {mockPlans.map((plan) => (
                  <div key={plan.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium">{plan.nome}</p>
                      <Badge variant="outline">
                        <CreditCard className="mr-1 size-3" />
                        Mensal
                      </Badge>
                    </div>
                    <p className="text-xl font-semibold">{formatCurrency(plan.precoMensal)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{plan.descricao}</p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p>Até {plan.limiteRevendedoras} revendedoras</p>
                      <p>Até {plan.limiteUsuarios} utilizadores</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assinaturas de lojas</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <EmptyState title="Sem assinaturas" description="Nenhuma loja assinante no momento." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loja</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Renovação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((subscription) => {
                        const plan = mockPlans.find((planItem) => planItem.id === subscription.planoId)

                        return (
                          <TableRow key={subscription.id}>
                            <TableCell>
                              <p className="font-medium">{subscription.loja}</p>
                              <p className="text-xs text-muted-foreground">
                                {subscription.usuariosAtivos} usuários | {subscription.revendedorasAtivas} revendedoras
                              </p>
                            </TableCell>
                            <TableCell>{plan?.nome ?? "-"}</TableCell>
                            <TableCell>{formatDate(subscription.renovacaoEm)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  subscription.status === "ativa"
                                    ? "secondary"
                                    : subscription.status === "vencendo"
                                      ? "destructive"
                                      : "outline"
                                }
                              >
                                {subscription.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPlanId(subscription.planoId)
                                  setSelectedSubscription(subscription)
                                }}
                              >
                                <Repeat aria-hidden />
                                Alterar plano
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <Dialog
        open={selectedSubscription !== null}
        onOpenChange={(open) => !open && setSelectedSubscription(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar plano da loja</DialogTitle>
            <DialogDescription>{selectedSubscription?.loja}</DialogDescription>
          </DialogHeader>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.nome} - {formatCurrency(plan.precoMensal)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="button" onClick={changePlan}>
              Confirmar alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
