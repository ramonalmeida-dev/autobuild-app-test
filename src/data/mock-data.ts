import type {
  ConsignmentLot,
  InventoryMovement,
  PdvSale,
  Product,
  Reseller,
  Settlement,
  StoreSubscription,
  SubscriptionPlan,
} from "@/types/domain"

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    sku: "SJ-001",
    nome: "Brinco Argola Veneza",
    categoria: "Brincos",
    precoVarejo: 89.9,
    estoqueAtual: 24,
    estoqueMinimo: 10,
    codigoBarras: "7891000000011",
    imagemUrl:
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80",
    status: "ativo",
  },
  {
    id: "prod-2",
    sku: "SJ-002",
    nome: "Colar Riviera Dourado",
    categoria: "Colares",
    precoVarejo: 159.9,
    estoqueAtual: 7,
    estoqueMinimo: 8,
    codigoBarras: "7891000000028",
    imagemUrl:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
    status: "ativo",
  },
  {
    id: "prod-3",
    sku: "SJ-003",
    nome: "Pulseira Elos Classic",
    categoria: "Pulseiras",
    precoVarejo: 119.9,
    estoqueAtual: 13,
    estoqueMinimo: 6,
    codigoBarras: "7891000000035",
    imagemUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    status: "ativo",
  },
  {
    id: "prod-4",
    sku: "SJ-004",
    nome: "Anel Halo Cristal",
    categoria: "Anéis",
    precoVarejo: 99.9,
    estoqueAtual: 5,
    estoqueMinimo: 5,
    codigoBarras: "7891000000042",
    imagemUrl:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
    status: "ativo",
  },
  {
    id: "prod-5",
    sku: "SJ-005",
    nome: "Conjunto Aurora",
    categoria: "Conjuntos",
    precoVarejo: 249.9,
    estoqueAtual: 9,
    estoqueMinimo: 4,
    codigoBarras: "7891000000059",
    imagemUrl:
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=900&q=80",
    status: "ativo",
  },
]

export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: "mov-1",
    productId: "prod-2",
    tipo: "entrada",
    origem: "fornecedor",
    quantidade: 12,
    dataHora: "2026-04-09T10:00:00",
    responsavel: "Camila Lima",
    observacao: "Compra da coleção abril",
  },
  {
    id: "mov-2",
    productId: "prod-4",
    tipo: "saida",
    origem: "venda_pdv",
    quantidade: 2,
    dataHora: "2026-04-10T16:20:00",
    responsavel: "Thiago Mendes",
  },
  {
    id: "mov-3",
    productId: "prod-1",
    tipo: "saida",
    origem: "consignado_saida",
    quantidade: 6,
    dataHora: "2026-04-08T09:15:00",
    responsavel: "Camila Lima",
    observacao: "Lote LOT-1002",
  },
]

export const mockPdvSales: PdvSale[] = [
  {
    id: "sale-1",
    numero: "PDV-1048",
    itens: [
      {
        productId: "prod-1",
        sku: "SJ-001",
        nome: "Brinco Argola Veneza",
        quantidade: 1,
        precoUnitario: 89.9,
      },
      {
        productId: "prod-3",
        sku: "SJ-003",
        nome: "Pulseira Elos Classic",
        quantidade: 1,
        precoUnitario: 119.9,
      },
    ],
    subtotal: 209.8,
    desconto: 9.8,
    total: 200,
    formaPagamento: "pix",
    dataHora: "2026-04-11T10:30:00",
    atendente: "Thiago Mendes",
  },
  {
    id: "sale-2",
    numero: "PDV-1047",
    itens: [
      {
        productId: "prod-5",
        sku: "SJ-005",
        nome: "Conjunto Aurora",
        quantidade: 1,
        precoUnitario: 249.9,
      },
    ],
    subtotal: 249.9,
    desconto: 0,
    total: 249.9,
    formaPagamento: "cartao",
    dataHora: "2026-04-10T18:10:00",
    atendente: "Camila Lima",
  },
]

export const mockResellers: Reseller[] = [
  {
    id: "rev-1",
    nome: "Patricia Nogueira",
    telefone: "(81) 99821-4401",
    status: "ativa",
    metaMensal: 3000,
    prazoPadraoDias: 15,
    comissaoFaixas: [
      { metaMinima: 0, metaMaxima: 1999.99, percentual: 12 },
      { metaMinima: 2000, metaMaxima: 3999.99, percentual: 15 },
      { metaMinima: 4000, metaMaxima: null, percentual: 18 },
    ],
  },
  {
    id: "rev-2",
    nome: "Aline Batista",
    telefone: "(81) 98761-5539",
    status: "ativa",
    metaMensal: 5000,
    prazoPadraoDias: 20,
    comissaoFaixas: [
      { metaMinima: 0, metaMaxima: 2499.99, percentual: 10 },
      { metaMinima: 2500, metaMaxima: 4999.99, percentual: 14 },
      { metaMinima: 5000, metaMaxima: null, percentual: 17 },
    ],
  },
  {
    id: "rev-3",
    nome: "Fernanda Monteiro",
    telefone: "(81) 99670-1120",
    status: "pausada",
    metaMensal: 2500,
    prazoPadraoDias: 10,
    comissaoFaixas: [
      { metaMinima: 0, metaMaxima: 1499.99, percentual: 11 },
      { metaMinima: 1500, metaMaxima: 2999.99, percentual: 13 },
      { metaMinima: 3000, metaMaxima: null, percentual: 16 },
    ],
  },
]

export const mockConsignmentLots: ConsignmentLot[] = [
  {
    id: "LOT-1002",
    resellerId: "rev-1",
    dataEnvio: "2026-04-01",
    prazoPrestacao: "2026-04-10",
    status: "atrasado",
    itens: [
      {
        productId: "prod-1",
        sku: "SJ-001",
        nome: "Brinco Argola Veneza",
        quantidadeEnviada: 6,
        quantidadeVendida: 4,
        quantidadeDevolvida: 0,
        precoUnitario: 89.9,
      },
      {
        productId: "prod-3",
        sku: "SJ-003",
        nome: "Pulseira Elos Classic",
        quantidadeEnviada: 3,
        quantidadeVendida: 2,
        quantidadeDevolvida: 0,
        precoUnitario: 119.9,
      },
    ],
  },
  {
    id: "LOT-1003",
    resellerId: "rev-2",
    dataEnvio: "2026-04-07",
    prazoPrestacao: "2026-04-19",
    status: "pendente_acerto",
    itens: [
      {
        productId: "prod-2",
        sku: "SJ-002",
        nome: "Colar Riviera Dourado",
        quantidadeEnviada: 4,
        quantidadeVendida: 1,
        quantidadeDevolvida: 0,
        precoUnitario: 159.9,
      },
      {
        productId: "prod-5",
        sku: "SJ-005",
        nome: "Conjunto Aurora",
        quantidadeEnviada: 2,
        quantidadeVendida: 1,
        quantidadeDevolvida: 0,
        precoUnitario: 249.9,
      },
    ],
  },
]

export const mockSettlements: Settlement[] = [
  {
    id: "set-1",
    loteId: "LOT-1001",
    resellerId: "rev-1",
    dataHora: "2026-03-31T19:40:00",
    totalBruto: 1840,
    percentualComissao: 12,
    valorComissao: 220.8,
    totalLiquido: 1619.2,
  },
]

export const mockPlans: SubscriptionPlan[] = [
  {
    id: "plan-basic",
    nome: "Básico",
    precoMensal: 149,
    limiteRevendedoras: 10,
    limiteUsuarios: 2,
    descricao: "Controle operacional para lojas iniciantes.",
  },
  {
    id: "plan-pro",
    nome: "Pro",
    precoMensal: 289,
    limiteRevendedoras: 40,
    limiteUsuarios: 8,
    descricao: "Ideal para loja com equipe e canal de revendedoras ativo.",
  },
  {
    id: "plan-premium",
    nome: "Premium",
    precoMensal: 499,
    limiteRevendedoras: 120,
    limiteUsuarios: 20,
    descricao: "Escala com regras avançadas e operação consolidada.",
  },
]

export const mockSubscriptions: StoreSubscription[] = [
  {
    id: "sub-1",
    loja: "Semijoias Imperial",
    planoId: "plan-pro",
    status: "ativa",
    usuariosAtivos: 5,
    revendedorasAtivas: 18,
    renovacaoEm: "2026-05-05",
  },
  {
    id: "sub-2",
    loja: "Ateliê Ouro Fino",
    planoId: "plan-basic",
    status: "vencendo",
    usuariosAtivos: 2,
    revendedorasAtivas: 9,
    renovacaoEm: "2026-04-14",
  },
]
