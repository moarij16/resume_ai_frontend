import type { HttpClient } from "@/lib/http/client"
import type { ATSScan, ScanInput, UUID } from "@/types/api"

export interface AtsService {
  history(): Promise<ATSScan[]>
  get(id: UUID): Promise<ATSScan>
  scan(input: ScanInput): Promise<ATSScan>
}

export function createAtsService(http: HttpClient): AtsService {
  return {
    history: () => http.get<ATSScan[]>("ats/history"),
    get: (id) => http.get<ATSScan>(`ats/${id}`),
    scan: ({ resume_id, job_id }) =>
      http.post<ATSScan>("ats/scan", { resume_id, job_id: job_id ?? null }),
  }
}
