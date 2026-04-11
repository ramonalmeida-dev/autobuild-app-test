import { BrowserRouter } from "react-router-dom"

import { AppShell } from "@/app/layouts/app-shell"
import { AppRouter } from "@/router"

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRouter />
      </AppShell>
    </BrowserRouter>
  )
}
