import { createAtsService, type AtsService } from "@/features/ats/api"
import { createAuthService, type AuthService } from "@/features/auth/api"
import { createDocumentsService, type DocumentsService } from "@/features/documents/api"
import { createJobsService, type JobsService } from "@/features/jobs/api"
import { createProfileService, type ProfileService } from "@/features/profile/api"
import { createResumesService, type ResumesService } from "@/features/resumes/api"
import type { HttpClient } from "@/lib/http/client"
import { FetchHttpClient } from "@/lib/http/fetch-client"

export interface Api {
  auth: AuthService
  profile: ProfileService
  resumes: ResumesService
  jobs: JobsService
  ats: AtsService
  documents: DocumentsService
}

/** Composition root: wires each feature service to its transport. */
export function createApi({ data, auth }: { data: HttpClient; auth: HttpClient }): Api {
  return {
    auth: createAuthService(auth),
    profile: createProfileService(data),
    resumes: createResumesService(data),
    jobs: createJobsService(data),
    ats: createAtsService(data),
    documents: createDocumentsService(data),
  }
}

export function createBrowserApi(onUnauthorized: () => void): Api {
  return createApi({
    data: new FetchHttpClient({ baseUrl: "/api/proxy", onUnauthorized }),
    auth: new FetchHttpClient({ baseUrl: "/api/auth" }),
  })
}
