import { useMemo, useState } from "react"
import { Download, Filter } from "lucide-react"

import { PageContainer } from "@/app/layouts/page-container"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  mockConsignmentLots,
  mockPdvSales,
  mockProducts,
  mockResellers,
  mockSettlements,
} from "@/data/mock-data"
import { useViewState } from "@/hooks/use-view-state"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format"

const periodLabels = {
  hoje: "Hoje",
  semana: "Últimos 7 dias",
  mes: "Mês atual",
} as const

type Period = keyof typeof periodLabels

export function RelatoriosPage() {
  const view = useViewState()
  const [period, setPeriod] = useState<Period>("mes")
  const [resellerFilter, setResellerFilter] = useState("todas")

  const filteredSales = useMemo(() => {
    if (period === "hoje") {
      return mockPdvSales.filter((sale) => sale.dataHora.startsWith("2026-04-11"))
    }

    if (period === "semana") {
      return mockPdvSales.filter((sale) => new Date(sale.dataHora) >= new Date("2026-04-04"))
    }

    return mockPdvSales
  }, [period])

  const filteredSettlements = useMemo(() => {
    if (resellerFilter === "todas") {
      return mockSettlements
    }

    return mockSettlements.filter((item) => item.resellerId === resellerFilter)
  }, [resellerFilter])

  const totalSales = filteredSales.reduce((acc, sale) => acc + sale.total, 0)
  const totalSettlements = filteredSettlements.reduce((acc, item) => acc + item.totalLiquido, 0)
  const lowStock = mockProducts.filter((item) => item.estoqueAtual <= item.estoqueMinimo)

  const consignadoAberto = mockConsignmentLots
    .filter((item) => item.status !== "acertado")
    .reduce((acc, lot) => {
      return (
        acc +
        lot.itens.reduce((lotAcc, item) => {
          const remaining = item.quantidadeEnviada - item.quantidadeVendida - item.quantidadeDevolvida
          return lotAcc + Math.max(0, remaining) * item.precoUnitario
        }, 0)
      )
    }, 0)

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Relatórios"
          description="Visualize desempenho de vendas, estoque crítico e resultados de acerto com revendedoras."
          action={
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  <Download aria-hidden />
                  Exportar relatório
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exportar relatório consolidado</DialogTitle>
                  <DialogDescription>
                    O ficheiro inclui vendas PDV, consignado e alerta de estoque do período selecionado.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="button">Gerar arquivo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        <Card>
          <CardContent className="grid gap-3 pt-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Vendas no período</p>
              <p className="text-lg font-semibold">{formatCurrency(totalSales)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Acertos líquidos</p>
              <p className="text-lg font-semibold">{formatCurrency(totalSettlements)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Consignado em aberto</p>
              <p className="text-lg font-semibold">{formatCurrency(consignadoAberto)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Produtos em alerta</p>
              <p className="text-lg font-semibold">{lowStock.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Período</p>
              <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Últimos 7 dias</SelectItem>
                  <SelectItem value="mes">Mês atual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1 text-xs text-muted-foreground">Revendedora</p>
              <Select value={resellerFilter} onValueChange={setResellerFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {mockResellers.map((reseller) => (
                    <SelectItem key={reseller.id} value={reseller.id}>
                      {reseller.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {view.isLoading ? <LoadingState variant="skeleton" /> : null}
        {view.isError ? (
          <ErrorState
            title="Relatórios indisponíveis"
            description="Tente novamente em alguns instantes."
            onRetry={view.retry}
            retryLabel="Recarregar"
          />
        ) : null}

        {view.isReady ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vendas PDV ({periodLabels[period]})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSales.length === 0 ? (
                  <EmptyState
                    icon={Filter}
                    title="Sem vendas no filtro atual"
                    description="Escolha outro período para visualizar resultados."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Venda</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Atendente</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.numero}</TableCell>
                          <TableCell>{formatDateTime(sale.dataHora)}</TableCell>
                          <TableCell>{sale.atendente}</TableCell>
                          <TableCell>{formatCurrency(sale.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acertos de revendedoras</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSettlements.length === 0 ? (
                  <EmptyState
                    icon={Filter}
                    title="Sem acertos no filtro"
                    description="Selecione outra revendedora para análise."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lote</TableHead>
                        <TableHead>Revendedora</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Líquido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSettlements.map((item) => {
                        const reseller = mockResellers.find((resellerItem) => resellerItem.id === item.resellerId)

                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.loteId}</TableCell>
                            <TableCell>{reseller?.nome ?? "-"}</TableCell>
                            <TableCell>{formatCurrency(item.valorComissao)}</TableCell>
                            <TableCell>{formatCurrency(item.totalLiquido)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {view.isReady ? (
          <Card>
            <CardHeader>
              <CardTitle>Produtos com estoque crítico</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <EmptyState title="Sem alertas de estoque" description="Nenhum produto abaixo do mínimo." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Saldo atual</TableHead>
                      <TableHead>Mínimo</TableHead>
                      <TableHead>Última venda</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.estoqueAtual}</TableCell>
                        <TableCell>{item.estoqueMinimo}</TableCell>
                        <TableCell>{formatDate("2026-04-10")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </PageContainer>
  )
}
