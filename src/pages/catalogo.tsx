import { useMemo, useState } from "react"
import { ExternalLink, ImageIcon, PlusCircle, Search } from "lucide-react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockProducts } from "@/data/mock-data"
import { useViewState } from "@/hooks/use-view-state"
import { formatCurrency } from "@/lib/format"
import type { Product } from "@/types/domain"

const catalogBaseUrl = "https://catalogo.semijoias-plus.app/loja/imperial"

export function CatalogoPage() {
  const view = useViewState()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [search, setSearch] = useState("")
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [nameInput, setNameInput] = useState("")
  const [skuInput, setSkuInput] = useState("")
  const [categoryInput, setCategoryInput] = useState("")
  const [priceInput, setPriceInput] = useState("0")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [imageInput, setImageInput] = useState("")

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

  const createProduct = () => {
    const price = Number(priceInput)
    if (!nameInput.trim() || !skuInput.trim() || !categoryInput.trim() || price <= 0) {
      return
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      nome: nameInput,
      sku: skuInput,
      categoria: categoryInput,
      precoVarejo: price,
      estoqueAtual: 0,
      estoqueMinimo: 0,
      codigoBarras: barcodeInput || `${Date.now()}`,
      imagemUrl:
        imageInput ||
        "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=900&q=80",
      status: "ativo",
    }

    setProducts((prev) => [newProduct, ...prev])
    setNameInput("")
    setSkuInput("")
    setCategoryInput("")
    setPriceInput("0")
    setBarcodeInput("")
    setImageInput("")
  }

  const savePrice = () => {
    if (!editingProduct) {
      return
    }

    const price = Number(priceInput)
    if (price <= 0) {
      return
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === editingProduct.id
          ? {
              ...item,
              precoVarejo: price,
            }
          : item
      )
    )

    setEditingProduct(null)
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Catálogo de Produtos"
          description="Mantenha catálogo com fotos e preços para uso interno e compartilhamento por link."
          action={
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button">
                  <PlusCircle aria-hidden />
                  Novo produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Cadastrar produto no catálogo</DialogTitle>
                  <DialogDescription>
                    Produto disponível para loja e catálogo digital compartilhável.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Nome"
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                  />
                  <Input
                    placeholder="SKU"
                    value={skuInput}
                    onChange={(event) => setSkuInput(event.target.value)}
                  />
                  <Input
                    placeholder="Categoria"
                    value={categoryInput}
                    onChange={(event) => setCategoryInput(event.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Preço"
                    value={priceInput}
                    onChange={(event) => setPriceInput(event.target.value)}
                  />
                  <Input
                    placeholder="Código de barras"
                    value={barcodeInput}
                    onChange={(event) => setBarcodeInput(event.target.value)}
                    className="sm:col-span-2"
                  />
                  <Input
                    placeholder="URL da imagem"
                    value={imageInput}
                    onChange={(event) => setImageInput(event.target.value)}
                    className="sm:col-span-2"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" onClick={createProduct}>
                    Salvar produto
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Catálogo interno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                title="Catálogo indisponível"
                description="Recarregue para acessar os produtos."
                onRetry={view.retry}
                retryLabel="Recarregar"
              />
            ) : null}
            {view.isReady && filteredProducts.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="Sem produtos no catálogo"
                description="Cadastre produtos para começar o compartilhamento digital."
              />
            ) : null}

            {view.isReady && filteredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço varejo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <p className="font-medium">{product.nome}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </TableCell>
                      <TableCell>{product.categoria}</TableCell>
                      <TableCell>{formatCurrency(product.precoVarejo)}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "ativo" ? "secondary" : "outline"}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPriceInput(String(product.precoVarejo))
                              setEditingProduct(product)
                            }}
                          >
                            Editar preço
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setPreviewProduct(product)}>
                            Ver detalhes
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catálogo digital compartilhável</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Link público para clientes finais:</p>
              <p className="text-sm font-medium">{catalogBaseUrl}</p>
            </div>
            <Button type="button" variant="outline">
              <ExternalLink aria-hidden />
              Abrir catálogo público
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewProduct !== null} onOpenChange={(open) => !open && setPreviewProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewProduct?.nome}</DialogTitle>
            <DialogDescription>{previewProduct?.sku}</DialogDescription>
          </DialogHeader>
          {previewProduct ? (
            <div className="space-y-3">
              <img
                src={previewProduct.imagemUrl}
                alt={previewProduct.nome}
                className="h-48 w-full rounded-md object-cover"
              />
              <p className="text-sm">Categoria: {previewProduct.categoria}</p>
              <p className="text-sm">Preço: {formatCurrency(previewProduct.precoVarejo)}</p>
              <p className="text-sm">Código de barras: {previewProduct.codigoBarras}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editingProduct !== null} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar preço de varejo</DialogTitle>
            <DialogDescription>{editingProduct?.nome}</DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={priceInput}
            onChange={(event) => setPriceInput(event.target.value)}
          />
          <DialogFooter>
            <Button type="button" onClick={savePrice}>
              Salvar alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
