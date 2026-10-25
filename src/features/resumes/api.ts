import type { HttpClient } from "@/lib/http/client"
import type { Resume, ResumeUpdateInput, ResumeUploadResponse, UUID } from "@/types/api"

export interface ResumeReader {
  list(): Promise<Resume[]>
  get(id: UUID): Promise<Resume>
}

export interface ResumeWriter {
  update(id: UUID, input: ResumeUpdateInput): Promise<Resume>
  remove(id: UUID): Promise<void>
}

export interface ResumeUploader {
  upload(file: File, name?: string): Promise<ResumeUploadResponse>
}

export type ResumesService = ResumeReader & ResumeWriter & ResumeUploader

export function createResumesService(http: HttpClient): ResumesService {
  return {
    list: () => http.get<Resume[]>("resumes"),
    get: (id) => http.get<Resume>(`resumes/${id}`),
    update: (id, input) => http.patch<Resume>(`resumes/${id}`, input),
    remove: (id) => http.delete(`resumes/${id}`),
    upload: (file, name) => {
      const form = new FormData()
      form.append("file", file)
      if (name?.trim()) form.append("name", name.trim())
      return http.upload<ResumeUploadResponse>("resumes/upload", form)
    },
  }
}
