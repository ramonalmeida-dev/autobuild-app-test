import { AlertTriangle, Boxes, HandCoins, ReceiptText } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { PageContainer } from "@/app/layouts/page-container"
import { KpiCard } from "@/components/domain/kpi-card"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockConsignmentLots, mockPdvSales, mockProducts } from "@/data/mock-data"
import { useViewState } from "@/hooks/use-view-state"
import { formatCurrency } from "@/lib/format"

export function DashboardPage() {
  const navigate = useNavigate()
  const view = useViewState()

  const vendasHoje = mockPdvSales
    .filter((sale) => sale.dataHora.startsWith("2026-04-11"))
    .reduce((acc, sale) => acc + sale.total, 0)

  const itensEmAlerta = mockProducts.filter(
    (product) => product.estoqueAtual <= product.estoqueMinimo
  )

  const lotesPendentes = mockConsignmentLots.filter(
    (lot) => lot.status === "pendente_acerto" || lot.status === "atrasado"
  )

  const totalConsignadoEmAberto = lotesPendentes.reduce((acc, lot) => {
    const valorLote = lot.itens.reduce((lotAcc, item) => {
      const qtdAberta = item.quantidadeEnviada - item.quantidadeVendida - item.quantidadeDevolvida
      return lotAcc + Math.max(qtdAberta, 0) * item.precoUnitario
    }, 0)

    return acc + valorLote
  }, 0)

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Operacional"
          description="Acompanhe vendas, alertas de estoque e consignados pendentes de acerto da sua loja."
        />

        {view.isLoading ? <LoadingState variant="skeleton" /> : null}

        {view.isError ? (
          <ErrorState
            title="Falha ao carregar indicadores"
            description="Tente novamente para atualizar os dados operacionais."
            onRetry={view.retry}
            retryLabel="Recarregar"
          />
        ) : null}

        {view.isReady ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Vendas de hoje"
                value={formatCurrency(vendasHoje)}
                helper="Total de vendas fechadas no PDV"
                icon={ReceiptText}
              />
              <KpiCard
                label="Itens em alerta"
                value={`${itensEmAlerta.length}`}
                helper="Produtos com estoque no mínimo"
                icon={AlertTriangle}
              />
              <KpiCard
                label="Lotes pendentes"
                value={`${lotesPendentes.length}`}
                helper="Consignados aguardando acerto"
                icon={Boxes}
              />
              <KpiCard
                label="Consignado em aberto"
                value={formatCurrency(totalConsignadoEmAberto)}
                helper="Valor em peças ainda não acertadas"
                icon={HandCoins}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Alertas ativos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {itensEmAlerta.length === 0 && lotesPendentes.length === 0 ? (
                    <EmptyState
                      title="Sem alertas no momento"
                      description="A operação está equilibrada."
                    />
                  ) : null}

                  {itensEmAlerta.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Estoque atual {item.estoqueAtual} | Mínimo {item.estoqueMinimo}
                        </p>
                      </div>
                      <Badge variant="destructive">Repor</Badge>
                    </div>
                  ))}

                  {lotesPendentes.map((lot) => (
                    <div
                      key={lot.id}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">Lote {lot.id}</p>
                        <p className="text-xs text-muted-foreground">
                          Prazo de prestação: {new Date(lot.prazoPrestacao).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant={lot.status === "atrasado" ? "destructive" : "secondary"}>
                        {lot.status === "atrasado" ? "Atrasado" : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button type="button" className="w-full justify-start" onClick={() => navigate("/pdv")}>
                    Abrir venda no PDV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/estoque")}
                  >
                    Registrar entrada de estoque
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/revendedoras")}
                  >
                    Confirmar acerto de revendedora
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </PageContainer>
  )
}
