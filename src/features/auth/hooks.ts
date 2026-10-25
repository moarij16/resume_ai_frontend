"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { useApi } from "@/lib/api-context"
import { queryKeys } from "@/lib/query-keys"
import type { User } from "@/types/api"

import type { LoginInput, RegisterInput } from "./api"

function useStoreSessionUser() {
  const queryClient = useQueryClient()
  return (user: User) => {
    queryClient.clear()
    queryClient.setQueryData(queryKeys.profile.me, user)
  }
}

export function useLogin() {
  const { auth } = useApi()
  const storeUser = useStoreSessionUser()
  return useMutation({
    mutationFn: (input: LoginInput) => auth.login(input),
    onSuccess: storeUser,
    meta: { silent: true },
  })
}

export function useRegister() {
  const { auth } = useApi()
  const storeUser = useStoreSessionUser()
  return useMutation({
    mutationFn: (input: RegisterInput) => auth.register(input),
    onSuccess: storeUser,
    meta: { silent: true },
  })
}

export function useLogout() {
  const { auth } = useApi()
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: () => auth.logout(),
    onSettled: () => {
      queryClient.clear()
      router.replace("/login")
      router.refresh()
    },
  })
}
