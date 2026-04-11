import { useMemo, useState } from "react"
import { Barcode, Minus, Plus, Search, ShoppingCart } from "lucide-react"

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
import { mockPdvSales, mockProducts } from "@/data/mock-data"
import { useViewState } from "@/hooks/use-view-state"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { PaymentMethod, PdvSale, PdvSaleItem, Product } from "@/types/domain"

type CartItem = {
  productId: string
  sku: string
  nome: string
  precoUnitario: number
  quantidade: number
}

const paymentLabels: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  pix: "Pix",
}

export function PdvPage() {
  const view = useViewState()
  const [search, setSearch] = useState("")
  const [barcode, setBarcode] = useState("")
  const [discount, setDiscount] = useState("0")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix")
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [sales, setSales] = useState<PdvSale[]>(mockPdvSales)
  const [cart, setCart] = useState<CartItem[]>([])
  const [receiptSale, setReceiptSale] = useState<PdvSale | null>(null)

  const availableProducts = useMemo(() => {
    const term = search.toLowerCase().trim()

    return products.filter((product) => {
      if (!term) {
        return product.estoqueAtual > 0
      }

      return (
        product.estoqueAtual > 0 &&
        (product.nome.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          product.codigoBarras.includes(term))
      )
    })
  }, [products, search])

  const subtotal = cart.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0)
  const discountValue = Math.min(Number(discount) || 0, subtotal)
  const total = subtotal - discountValue

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
              }
            : item
        )
      }

      return [
        ...prev,
        {
          productId: product.id,
          sku: product.sku,
          nome: product.nome,
          precoUnitario: product.precoVarejo,
          quantidade: 1,
        },
      ]
    })
  }

  const updateItemQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantidade: item.quantidade + delta,
              }
            : item
        )
        .filter((item) => item.quantidade > 0)
    )
  }

  const scanByBarcode = () => {
    const found = products.find((product) => product.codigoBarras === barcode.trim())
    if (found && found.estoqueAtual > 0) {
      addToCart(found)
      setBarcode("")
    }
  }

  const finalizeSale = () => {
    if (cart.length === 0 || total <= 0) {
      return
    }

    const saleItems: PdvSaleItem[] = cart.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      nome: item.nome,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
    }))

    const sale: PdvSale = {
      id: `sale-${sales.length + 1}`,
      numero: `PDV-${String(sales.length + 1049).padStart(4, "0")}`,
      itens: saleItems,
      subtotal,
      desconto: discountValue,
      total,
      formaPagamento: paymentMethod,
      dataHora: new Date().toISOString(),
      atendente: "Operador PDV",
    }

    setProducts((prev) =>
      prev.map((product) => {
        const sold = cart.find((item) => item.productId === product.id)
        if (!sold) {
          return product
        }

        return {
          ...product,
          estoqueAtual: Math.max(0, product.estoqueAtual - sold.quantidade),
        }
      })
    )

    setSales((prev) => [sale, ...prev])
    setReceiptSale(sale)
    setCart([])
    setDiscount("0")
    setPaymentMethod("pix")
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Ponto de Venda (PDV)"
          description="Registre vendas, aplique desconto e processe pagamento com baixa automática no estoque."
        />

        {view.isLoading ? <LoadingState variant="skeleton" /> : null}
        {view.isError ? (
          <ErrorState
            title="Falha ao carregar o PDV"
            description="Tente novamente para continuar as vendas."
            onRetry={view.retry}
            retryLabel="Recarregar"
          />
        ) : null}

        {view.isReady ? (
          <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Produtos disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-2 left-2 size-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar por nome, SKU ou código"
                      className="pl-8"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Barcode className="pointer-events-none absolute top-2 left-2 size-4 text-muted-foreground" />
                      <Input
                        value={barcode}
                        onChange={(event) => setBarcode(event.target.value)}
                        placeholder="Leitura de código de barras"
                        className="pl-8"
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={scanByBarcode}>
                      Ler
                    </Button>
                  </div>
                </div>

                {availableProducts.length === 0 ? (
                  <EmptyState
                    title="Sem produtos encontrados"
                    description="Ajuste os filtros ou reponha estoque para continuar as vendas."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <p className="font-medium">{product.nome}</p>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                          </TableCell>
                          <TableCell>{formatCurrency(product.precoVarejo)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{product.estoqueAtual} un.</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button type="button" size="sm" onClick={() => addToCart(product)}>
                              Adicionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Carrinho e checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.length === 0 ? (
                  <EmptyState
                    icon={ShoppingCart}
                    title="Carrinho vazio"
                    description="Adicione produtos para iniciar o atendimento no PDV."
                  />
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between rounded-md border border-border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.nome}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.precoUnitario)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() => updateItemQuantity(item.productId, -1)}
                          >
                            <Minus aria-hidden />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantidade}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() => updateItemQuantity(item.productId, 1)}
                          >
                            <Plus aria-hidden />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 rounded-md border border-border p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Desconto (R$)</p>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={discount}
                      onChange={(event) => setDiscount(event.target.value)}
                    />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Forma de pagamento</p>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="pix">Pix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desconto</span>
                      <span>{formatCurrency(discountValue)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Button type="button" className="w-full" onClick={finalizeSale}>
                    Concluir venda
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {view.isReady ? (
          <Card>
            <CardHeader>
              <CardTitle>Últimas vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.numero}</TableCell>
                      <TableCell>{formatDateTime(sale.dataHora)}</TableCell>
                      <TableCell>{paymentLabels[sale.formaPagamento]}</TableCell>
                      <TableCell>{formatCurrency(sale.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Dialog open={receiptSale !== null} onOpenChange={(open) => !open && setReceiptSale(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprovante emitido</DialogTitle>
            <DialogDescription>Venda registada com baixa automática de estoque.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Venda:</span> {receiptSale?.numero}
            </p>
            <p>
              <span className="text-muted-foreground">Data:</span>{" "}
              {receiptSale ? formatDateTime(receiptSale.dataHora) : ""}
            </p>
            <p>
              <span className="text-muted-foreground">Pagamento:</span>{" "}
              {receiptSale ? paymentLabels[receiptSale.formaPagamento] : ""}
            </p>
            <p className="font-semibold">
              <span className="text-muted-foreground">Total:</span>{" "}
              {receiptSale ? formatCurrency(receiptSale.total) : ""}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setReceiptSale(null)}>
              Fechar recibo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
