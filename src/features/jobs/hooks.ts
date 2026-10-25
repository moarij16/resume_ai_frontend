"use client"

import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useApi } from "@/lib/api-context"
import { queryKeys } from "@/lib/query-keys"
import type { Job, JobInput, UUID } from "@/types/api"

export function useJobs() {
  const { jobs } = useApi()
  return useQuery({ queryKey: queryKeys.jobs.list(), queryFn: () => jobs.list() })
}

export function useJob(id: UUID | null | undefined) {
  const { jobs } = useApi()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKeys.jobs.detail(id ?? ""),
    queryFn: id ? () => jobs.get(id) : skipToken,
    initialData: () =>
      queryClient.getQueryData<Job[]>(queryKeys.jobs.list())?.find((job) => job.id === id),
  })
}

export function useCreateJob() {
  const { jobs } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: JobInput) => jobs.create(input),
    onSuccess: (job) => {
      queryClient.setQueryData(queryKeys.jobs.detail(job.id), job)
      queryClient.setQueryData<Job[]>(queryKeys.jobs.list(), (list) =>
        list ? [job, ...list] : list
      )
    },
    meta: { silent: true, successMessage: "Job saved." },
  })
}

export function useUpdateJob(id: UUID) {
  const { jobs } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<JobInput>) => jobs.update(id, input),
    onSuccess: (job) => {
      queryClient.setQueryData(queryKeys.jobs.detail(id), job)
      queryClient.setQueryData<Job[]>(queryKeys.jobs.list(), (list) =>
        list?.map((item) => (item.id === id ? job : item))
      )
    },
    meta: { silent: true, successMessage: "Job updated." },
  })
}

export function useDeleteJob() {
  const { jobs } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => jobs.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Job[]>(queryKeys.jobs.list(), (list) =>
        list?.filter((job) => job.id !== id)
      )
      queryClient.removeQueries({ queryKey: queryKeys.jobs.detail(id) })
    },
    meta: { successMessage: "Job deleted." },
  })
}
