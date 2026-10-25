import type { HttpClient } from "@/lib/http/client"
import type { Job, JobInput, UUID } from "@/types/api"

export interface JobsService {
  list(): Promise<Job[]>
  get(id: UUID): Promise<Job>
  create(input: JobInput): Promise<Job>
  update(id: UUID, input: Partial<JobInput>): Promise<Job>
  remove(id: UUID): Promise<void>
}

export function createJobsService(http: HttpClient): JobsService {
  return {
    list: () => http.get<Job[]>("jobs"),
    get: (id) => http.get<Job>(`jobs/${id}`),
    create: (input) => http.post<Job>("jobs", input),
    update: (id, input) => http.patch<Job>(`jobs/${id}`, input),
    remove: (id) => http.delete(`jobs/${id}`),
  }
}
