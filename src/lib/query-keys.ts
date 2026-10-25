import type { UUID } from "@/types/api"

/** Centralised query-key factories so invalidation stays consistent across features. */
export const queryKeys = {
  profile: {
    me: ["profile", "me"] as const,
  },
  resumes: {
    all: ["resumes"] as const,
    list: () => [...queryKeys.resumes.all, "list"] as const,
    detail: (id: UUID) => [...queryKeys.resumes.all, "detail", id] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    list: () => [...queryKeys.jobs.all, "list"] as const,
    detail: (id: UUID) => [...queryKeys.jobs.all, "detail", id] as const,
  },
  ats: {
    all: ["ats"] as const,
    history: () => [...queryKeys.ats.all, "history"] as const,
    detail: (id: UUID) => [...queryKeys.ats.all, "detail", id] as const,
  },
  documents: {
    all: ["documents"] as const,
    list: () => [...queryKeys.documents.all, "list"] as const,
    detail: (id: UUID) => [...queryKeys.documents.all, "detail", id] as const,
  },
}
