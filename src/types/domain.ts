export type ProductStatus = "ativo" | "inativo"

export type Product = {
  id: string
  sku: string
  nome: string
  categoria: string
  precoVarejo: number
  estoqueAtual: number
  estoqueMinimo: number
  codigoBarras: string
  imagemUrl: string
  status: ProductStatus
}

export type InventoryMovementType = "entrada" | "saida"

export type InventoryMovementSource =
  | "fornecedor"
  | "producao"
  | "ajuste_manual"
  | "venda_pdv"
  | "consignado_saida"
  | "consignado_devolucao"

export type InventoryMovement = {
  id: string
  productId: string
  tipo: InventoryMovementType
  origem: InventoryMovementSource
  quantidade: number
  dataHora: string
  responsavel: string
  observacao?: string
}

export type PaymentMethod = "dinheiro" | "cartao" | "pix"

export type PdvSaleItem = {
  productId: string
  sku: string
  nome: string
  quantidade: number
  precoUnitario: number
}

export type PdvSale = {
  id: string
  numero: string
  itens: PdvSaleItem[]
  subtotal: number
  desconto: number
  total: number
  formaPagamento: PaymentMethod
  dataHora: string
  atendente: string
}

export type CommissionTier = {
  metaMinima: number
  metaMaxima: number | null
  percentual: number
}

export type ResellerStatus = "ativa" | "pausada"

export type Reseller = {
  id: string
  nome: string
  telefone: string
  status: ResellerStatus
  metaMensal: number
  prazoPadraoDias: number
  comissaoFaixas: CommissionTier[]
}

export type ConsignmentLotStatus = "pendente_acerto" | "acertado" | "atrasado"

export type ConsignmentLotItem = {
  productId: string
  sku: string
  nome: string
  quantidadeEnviada: number
  quantidadeVendida: number
  quantidadeDevolvida: number
  precoUnitario: number
}

export type ConsignmentLot = {
  id: string
  resellerId: string
  dataEnvio: string
  prazoPrestacao: string
  status: ConsignmentLotStatus
  itens: ConsignmentLotItem[]
}

export type Settlement = {
  id: string
  loteId: string
  resellerId: string
  dataHora: string
  totalBruto: number
  percentualComissao: number
  valorComissao: number
  totalLiquido: number
}

export type SubscriptionPlan = {
  id: string
  nome: string
  precoMensal: number
  limiteRevendedoras: number
  limiteUsuarios: number
  descricao: string
}

export type StoreSubscriptionStatus = "ativa" | "vencendo" | "cancelada"

export type StoreSubscription = {
  id: string
  loja: string
  planoId: string
  status: StoreSubscriptionStatus
  usuariosAtivos: number
  revendedorasAtivas: number
  renovacaoEm: string
}
