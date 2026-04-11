export type AppNavItem = {
  to: string
  label: string
}

export const appNavItems: AppNavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/estoque", label: "Estoque" },
  { to: "/pdv", label: "PDV" },
  { to: "/revendedoras", label: "Revendedoras" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/relatorios", label: "Relatórios" },
  { to: "/assinaturas", label: "Assinaturas" },
]
