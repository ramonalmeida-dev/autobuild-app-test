import { useMemo, useState } from "react"
import { PackagePlus, Search } from "lucide-react"

import { PageContainer } from "@/app/layouts/page-container"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { mockInventoryMovements, mockProducts } from "@/data/mock-data"
import { useViewState } from "@/hooks/use-view-state"
import { formatDateTime } from "@/lib/format"
import type { InventoryMovement, InventoryMovementSource, Product } from "@/types/domain"

const movementSourceLabels: Record<InventoryMovementSource, string> = {
  fornecedor: "Compra de fornecedor",
  producao: "Produção própria",
  ajuste_manual: "Ajuste manual",
  venda_pdv: "Venda PDV",
  consignado_saida: "Saída consignado",
  consignado_devolucao: "Devolução consignado",
}

const stockEntrySources: InventoryMovementSource[] = [
  "fornecedor",
  "producao",
  "ajuste_manual",
  "consignado_devolucao",
]

export function EstoquePage() {
  const view = useViewState()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [movements, setMovements] = useState<InventoryMovement[]>(mockInventoryMovements)
  const [search, setSearch] = useState("")
  const [productId, setProductId] = useState(products[0]?.id ?? "")
  const [quantity, setQuantity] = useState("1")
  const [source, setSource] = useState<InventoryMovementSource>("fornecedor")
  const [minimumInput, setMinimumInput] = useState("0")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim()

    return products.filter((product) => {
      return (
        product.nome.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.categoria.toLowerCase().includes(term)
      )
    })
  }, [products, search])

  const registerMovement = () => {
    const amount = Number(quantity)
    if (!amount || amount <= 0) {
      return
    }

    const target = products.find((item) => item.id === productId)
    if (!target) {
      return
    }

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId,
      tipo: "entrada",
      origem: source,
      quantidade: amount,
      dataHora: new Date().toISOString(),
      responsavel: "Lojista",
      observacao: "Movimentação registrada no painel de estoque",
    }

    setMovements((prev) => [movement, ...prev])
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              estoqueAtual: item.estoqueAtual + amount,
            }
          : item
      )
    )

    setQuantity("1")
  }

  const saveMinimum = () => {
    if (!editingProduct) {
      return
    }

    const newMinimum = Number(minimumInput)
    if (newMinimum < 0 || Number.isNaN(newMinimum)) {
      return
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === editingProduct.id
          ? {
              ...item,
              estoqueMinimo: newMinimum,
            }
          : item
      )
    )

    setEditingProduct(null)
  }

  const selectedMovements = detailsProduct
    ? movements.filter((movement) => movement.productId === detailsProduct.id)
    : []

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Controle de Estoque"
          description="Registe entradas, ajuste mínimos e acompanhe saldos por produto em tempo real."
          action={
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button">
                  <PackagePlus aria-hidden />
                  Nova entrada
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar abastecimento de estoque</DialogTitle>
                  <DialogDescription>
                    Fluxo de abastecimento: compra, produção ou ajuste manual.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Produto</p>
                    <Select value={productId} onValueChange={setProductId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.sku} - {item.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Origem da entrada</p>
                    <Select
                      value={source}
                      onValueChange={(value) => setSource(value as InventoryMovementSource)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stockEntrySources.map((entrySource) => (
                          <SelectItem key={entrySource} value={entrySource}>
                            {movementSourceLabels[entrySource]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Quantidade</p>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={registerMovement}>
                    Confirmar entrada
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        <Card>
          <CardContent className="space-y-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute top-2 left-2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, SKU ou categoria"
                className="pl-8"
              />
            </div>

            {view.isLoading ? <LoadingState variant="skeleton" /> : null}
            {view.isError ? (
              <ErrorState
                title="Não foi possível carregar o estoque"
                description="Atualize a página para tentar novamente."
                onRetry={view.retry}
                retryLabel="Tentar novamente"
              />
            ) : null}

            {view.isReady && filteredProducts.length === 0 ? (
              <EmptyState
                title="Nenhum produto encontrado"
                description="Refine os filtros ou cadastre novos produtos no catálogo."
              />
            ) : null}

            {view.isReady && filteredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estoque mínimo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((item) => {
                    const lowStock = item.estoqueAtual <= item.estoqueMinimo

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.estoqueAtual}</TableCell>
                        <TableCell>{item.estoqueMinimo}</TableCell>
                        <TableCell>
                          <Badge variant={lowStock ? "destructive" : "secondary"}>
                            {lowStock ? "Em alerta" : "Ok"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setMinimumInput(String(item.estoqueMinimo))
                                setEditingProduct(item)
                              }}
                            >
                              Editar mínimo
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setDetailsProduct(item)}
                            >
                              Ver detalhes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editingProduct !== null} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar estoque mínimo</DialogTitle>
            <DialogDescription>{editingProduct?.nome}</DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            min={0}
            value={minimumInput}
            onChange={(event) => setMinimumInput(event.target.value)}
          />
          <DialogFooter>
            <Button type="button" onClick={saveMinimum}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsProduct !== null} onOpenChange={(open) => !open && setDetailsProduct(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de movimentações</DialogTitle>
            <DialogDescription>{detailsProduct?.nome}</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{formatDateTime(movement.dataHora)}</TableCell>
                  <TableCell>{movementSourceLabels[movement.origem]}</TableCell>
                  <TableCell>{movement.quantidade}</TableCell>
                  <TableCell>{movement.responsavel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
