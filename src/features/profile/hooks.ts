"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useApi } from "@/lib/api-context"
import { queryKeys } from "@/lib/query-keys"

import type { ChangePasswordInput, ProfileUpdateInput } from "./api"

export function useMe() {
  const { profile } = useApi()
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: () => profile.me(),
    staleTime: 5 * 60_000,
  })
}

export function useUpdateProfile() {
  const { profile } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => profile.update(input),
    onSuccess: (user) => queryClient.setQueryData(queryKeys.profile.me, user),
    meta: { silent: true, successMessage: "Profile updated." },
  })
}

export function useChangePassword() {
  const { profile } = useApi()
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => profile.changePassword(input),
    meta: { silent: true, successMessage: "Password changed." },
  })
}
