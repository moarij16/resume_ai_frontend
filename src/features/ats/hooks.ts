"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useApi } from "@/lib/api-context"
import { queryKeys } from "@/lib/query-keys"
import type { ATSScan, ScanInput, UUID } from "@/types/api"

export function useScanHistory() {
  const { ats } = useApi()
  return useQuery({ queryKey: queryKeys.ats.history(), queryFn: () => ats.history() })
}

export function useScan(id: UUID) {
  const { ats } = useApi()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKeys.ats.detail(id),
    queryFn: () => ats.get(id),
    initialData: () =>
      queryClient.getQueryData<ATSScan[]>(queryKeys.ats.history())?.find((scan) => scan.id === id),
  })
}

export function useRunScan() {
  const { ats } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ScanInput) => ats.scan(input),
    onSuccess: (scan) => {
      queryClient.setQueryData(queryKeys.ats.detail(scan.id), scan)
      queryClient.setQueryData<ATSScan[]>(queryKeys.ats.history(), (list) =>
        list ? [scan, ...list] : list
      )
    },
    meta: { successMessage: "Scan complete." },
  })
}
