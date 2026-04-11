import { useEffect, useState } from "react"

type ViewStatus = "loading" | "ready" | "error"

type UseViewStateOptions = {
  delayMs?: number
}

export function useViewState(options?: UseViewStateOptions) {
  const [status, setStatus] = useState<ViewStatus>("loading")

  useEffect(() => {
    if (status !== "loading") {
      return
    }

    const timeout = window.setTimeout(() => {
      setStatus("ready")
    }, options?.delayMs ?? 320)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [options?.delayMs, status])

  return {
    status,
    isLoading: status === "loading",
    isReady: status === "ready",
    isError: status === "error",
    retry: () => setStatus("loading"),
    setError: () => setStatus("error"),
  }
}
