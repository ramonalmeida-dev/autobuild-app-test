import { Navigate, Route, Routes } from "react-router-dom"

import { AssinaturasPage } from "@/pages/assinaturas"
import { CatalogoPage } from "@/pages/catalogo"
import { DashboardPage } from "@/pages/dashboard"
import { EstoquePage } from "@/pages/estoque"
import { PdvPage } from "@/pages/pdv"
import { RelatoriosPage } from "@/pages/relatorios"
import { RevendedorasPage } from "@/pages/revendedoras"

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/estoque" element={<EstoquePage />} />
      <Route path="/pdv" element={<PdvPage />} />
      <Route path="/revendedoras" element={<RevendedorasPage />} />
      <Route path="/catalogo" element={<CatalogoPage />} />
      <Route path="/relatorios" element={<RelatoriosPage />} />
      <Route path="/assinaturas" element={<AssinaturasPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
