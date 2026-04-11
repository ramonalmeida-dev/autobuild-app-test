import { useMemo, useState } from "react"
import { CalendarClock, UserPlus } from "lucide-react"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
  mockProducts,
  mockResellers,
  mockSettlements,
} from "@/data/mock-data"
import { useViewState } from "@/hooks/use-view-state"
import { formatCurrency, formatDate, formatDateTime, formatPercent } from "@/lib/format"
import type {
  CommissionTier,
  ConsignmentLot,
  ConsignmentLotItem,
  Product,
  Reseller,
  Settlement,
} from "@/types/domain"

function getCommissionPercent(tiers: CommissionTier[], grossValue: number) {
  const tier = tiers.find((item) => {
    if (item.metaMaxima === null) {
      return grossValue >= item.metaMinima
    }

    return grossValue >= item.metaMinima && grossValue <= item.metaMaxima
  })

  return tier?.percentual ?? tiers[0]?.percentual ?? 0
}

function getLotGrossValue(lot: ConsignmentLot) {
  return lot.itens.reduce((acc, item) => {
    return acc + item.quantidadeVendida * item.precoUnitario
  }, 0)
}

export function RevendedorasPage() {
  const view = useViewState()
  const [resellers, setResellers] = useState<Reseller[]>(mockResellers)
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [lots, setLots] = useState<ConsignmentLot[]>(mockConsignmentLots)
  const [settlements, setSettlements] = useState<Settlement[]>(mockSettlements)

  const [newResellerName, setNewResellerName] = useState("")
  const [newResellerPhone, setNewResellerPhone] = useState("")
  const [selectedResellerId, setSelectedResellerId] = useState(resellers[0]?.id ?? "")
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "")
  const [lotQuantity, setLotQuantity] = useState("1")
  const [lotDeadline, setLotDeadline] = useState("15")

  const [settlementLot, setSettlementLot] = useState<ConsignmentLot | null>(null)
  const [detailLot, setDetailLot] = useState<ConsignmentLot | null>(null)

  const pendingLots = useMemo(
    () => lots.filter((lot) => lot.status === "pendente_acerto" || lot.status === "atrasado"),
    [lots]
  )

  const createReseller = () => {
    if (!newResellerName.trim()) {
      return
    }

    const newReseller: Reseller = {
      id: `rev-${Date.now()}`,
      nome: newResellerName,
      telefone: newResellerPhone || "(00) 00000-0000",
      status: "ativa",
      metaMensal: 3000,
      prazoPadraoDias: 15,
      comissaoFaixas: [
        { metaMinima: 0, metaMaxima: 1999.99, percentual: 12 },
        { metaMinima: 2000, metaMaxima: 3999.99, percentual: 15 },
        { metaMinima: 4000, metaMaxima: null, percentual: 18 },
      ],
    }

    setResellers((prev) => [newReseller, ...prev])
    setNewResellerName("")
    setNewResellerPhone("")
  }

  const createLot = () => {
    const quantity = Number(lotQuantity)
    const deadlineDays = Number(lotDeadline)
    const product = products.find((item) => item.id === selectedProductId)
    const reseller = resellers.find((item) => item.id === selectedResellerId)

    if (!product || !reseller || quantity <= 0 || product.estoqueAtual < quantity) {
      return
    }

    const today = new Date()
    const deadline = new Date()
    deadline.setDate(today.getDate() + deadlineDays)

    const lotItem: ConsignmentLotItem = {
      productId: product.id,
      sku: product.sku,
      nome: product.nome,
      quantidadeEnviada: quantity,
      quantidadeVendida: 0,
      quantidadeDevolvida: 0,
      precoUnitario: product.precoVarejo,
    }

    const newLot: ConsignmentLot = {
      id: `LOT-${Math.floor(Math.random() * 9000) + 1000}`,
      resellerId: reseller.id,
      dataEnvio: today.toISOString().slice(0, 10),
      prazoPrestacao: deadline.toISOString().slice(0, 10),
      status: "pendente_acerto",
      itens: [lotItem],
    }

    setLots((prev) => [newLot, ...prev])

    setProducts((prev) =>
      prev.map((item) =>
        item.id === selectedProductId
          ? {
              ...item,
              estoqueAtual: item.estoqueAtual - quantity,
            }
          : item
      )
    )

    setLotQuantity("1")
  }

  const confirmSettlement = () => {
    if (!settlementLot) {
      return
    }

    const reseller = resellers.find((item) => item.id === settlementLot.resellerId)
    if (!reseller) {
      return
    }

    const grossValue = getLotGrossValue(settlementLot)
    const commissionPercent = getCommissionPercent(reseller.comissaoFaixas, grossValue)
    const commissionValue = grossValue * (commissionPercent / 100)

    const newSettlement: Settlement = {
      id: `set-${Date.now()}`,
      loteId: settlementLot.id,
      resellerId: reseller.id,
      dataHora: new Date().toISOString(),
      totalBruto: grossValue,
      percentualComissao: commissionPercent,
      valorComissao: commissionValue,
      totalLiquido: grossValue - commissionValue,
    }

    setLots((prev) =>
      prev.map((item) =>
        item.id === settlementLot.id
          ? {
              ...item,
              status: "acertado",
            }
          : item
      )
    )

    setSettlements((prev) => [newSettlement, ...prev])
    setSettlementLot(null)
  }

  const registerReturn = (lot: ConsignmentLot) => {
    const updatedItems = lot.itens.map((item) => {
      const remaining = item.quantidadeEnviada - item.quantidadeVendida - item.quantidadeDevolvida

      if (remaining <= 0) {
        return item
      }

      return {
        ...item,
        quantidadeDevolvida: item.quantidadeDevolvida + remaining,
      }
    })

    setLots((prev) =>
      prev.map((item) =>
        item.id === lot.id
          ? {
              ...item,
              itens: updatedItems,
              status: "acertado",
            }
          : item
      )
    )

    setProducts((prev) => {
      const toRestore = updatedItems.reduce<Record<string, number>>((acc, item) => {
        const original = lot.itens.find((lotItem) => lotItem.productId === item.productId)
        if (!original) {
          return acc
        }

        const restored = item.quantidadeDevolvida - original.quantidadeDevolvida
        if (restored > 0) {
          acc[item.productId] = restored
        }

        return acc
      }, {})

      return prev.map((product) => {
        const restoredAmount = toRestore[product.id] ?? 0
        if (!restoredAmount) {
          return product
        }

        return {
          ...product,
          estoqueAtual: product.estoqueAtual + restoredAmount,
        }
      })
    })
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Revendedoras"
          description="Gerencie cadastro, consignados e acertos com comissão por faixa de meta."
          action={
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button">
                  <UserPlus aria-hidden />
                  Nova revendedora
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar revendedora</DialogTitle>
                  <DialogDescription>
                    Cada revendedora terá painel próprio para registrar vendas do lote consignado.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Input
                    placeholder="Nome completo"
                    value={newResellerName}
                    onChange={(event) => setNewResellerName(event.target.value)}
                  />
                  <Input
                    placeholder="Telefone"
                    value={newResellerPhone}
                    onChange={(event) => setNewResellerPhone(event.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" onClick={createReseller}>
                    Salvar cadastro
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        {view.isLoading ? <LoadingState variant="skeleton" /> : null}
        {view.isError ? (
          <ErrorState
            title="Falha ao carregar revendedoras"
            description="Recarregue para continuar o acompanhamento dos consignados."
            onRetry={view.retry}
            retryLabel="Tentar novamente"
          />
        ) : null}

        {view.isReady ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Painel de revendedoras</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Meta mensal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resellers.map((reseller) => (
                      <TableRow key={reseller.id}>
                        <TableCell className="font-medium">{reseller.nome}</TableCell>
                        <TableCell>{reseller.telefone}</TableCell>
                        <TableCell>{formatCurrency(reseller.metaMensal)}</TableCell>
                        <TableCell>
                          <Badge variant={reseller.status === "ativa" ? "secondary" : "outline"}>
                            {reseller.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Enviar lote consignado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Revendedora</p>
                    <Select value={selectedResellerId} onValueChange={setSelectedResellerId}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resellers
                          .filter((item) => item.status === "ativa")
                          .map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Produto</p>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.sku} - {item.nome} ({item.estoqueAtual})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Quantidade</p>
                      <Input
                        type="number"
                        min={1}
                        value={lotQuantity}
                        onChange={(event) => setLotQuantity(event.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prazo (dias)</p>
                      <Input
                        type="number"
                        min={1}
                        value={lotDeadline}
                        onChange={(event) => setLotDeadline(event.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="button" className="w-full" onClick={createLot}>
                    Aprovar envio e baixar estoque
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lotes consignados</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingLots.length === 0 ? (
                    <EmptyState
                      icon={CalendarClock}
                      title="Sem lotes pendentes"
                      description="Todos os consignados já foram acertados."
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lote</TableHead>
                          <TableHead>Revendedora</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingLots.map((lot) => {
                          const reseller = resellers.find((item) => item.id === lot.resellerId)

                          return (
                            <TableRow key={lot.id}>
                              <TableCell className="font-medium">{lot.id}</TableCell>
                              <TableCell>{reseller?.nome}</TableCell>
                              <TableCell>{formatDate(lot.prazoPrestacao)}</TableCell>
                              <TableCell>
                                <Badge variant={lot.status === "atrasado" ? "destructive" : "secondary"}>
                                  {lot.status === "atrasado" ? "Atrasado" : "Pendente"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setDetailLot(lot)}
                                  >
                                    Ver detalhes
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => registerReturn(lot)}
                                  >
                                    Registrar devolução
                                  </Button>
                                  <Button type="button" size="sm" onClick={() => setSettlementLot(lot)}>
                                    Confirmar acerto
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de acertos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote</TableHead>
                      <TableHead>Revendedora</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Valor comissão</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlements.map((item) => {
                      const reseller = resellers.find((resellerItem) => resellerItem.id === item.resellerId)

                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.loteId}</TableCell>
                          <TableCell>{reseller?.nome ?? "-"}</TableCell>
                          <TableCell>{formatPercent(item.percentualComissao)}</TableCell>
                          <TableCell>{formatCurrency(item.valorComissao)}</TableCell>
                          <TableCell>{formatDateTime(item.dataHora)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <Dialog open={detailLot !== null} onOpenChange={(open) => !open && setDetailLot(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do lote</DialogTitle>
            <DialogDescription>{detailLot?.id}</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Enviado</TableHead>
                <TableHead>Vendido</TableHead>
                <TableHead>Devolvido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailLot?.itens.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>{item.quantidadeEnviada}</TableCell>
                  <TableCell>{item.quantidadeVendida}</TableCell>
                  <TableCell>{item.quantidadeDevolvida}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={settlementLot !== null} onOpenChange={(open) => !open && setSettlementLot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar acerto do lote</DialogTitle>
            <DialogDescription>
              O sistema calcula comissão por faixa sobre o total vendido registado pela revendedora.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {settlementLot?.itens.map((item) => (
              <div key={item.productId} className="flex items-center justify-between rounded-md border p-2">
                <span>{item.nome}</span>
                <span>
                  Vendido: {item.quantidadeVendida} | Total: {formatCurrency(item.quantidadeVendida * item.precoUnitario)}
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={confirmSettlement}>
              Confirmar acerto e comissão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
