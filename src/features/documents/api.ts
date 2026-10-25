import type { DownloadedFile, HttpClient } from "@/lib/http/client"
import type {
  DocumentType,
  DownloadFormat,
  GenerateInput,
  GeneratedDocument,
  UUID,
} from "@/types/api"

/** Backend generation endpoint per document type; a new type fails to compile until mapped. */
const GENERATE_PATHS: Record<DocumentType, string> = {
  cover_letter: "documents/cover-letter",
  linkedin_bio: "documents/linkedin",
  resume_refactor: "documents/refactor",
  resume: "documents/generate",
}

export interface DocumentsService {
  list(): Promise<GeneratedDocument[]>
  get(id: UUID): Promise<GeneratedDocument>
  remove(id: UUID): Promise<void>
  generate(type: DocumentType, input: GenerateInput): Promise<GeneratedDocument>
  download(id: UUID, format: DownloadFormat): Promise<DownloadedFile>
}

export function createDocumentsService(http: HttpClient): DocumentsService {
  return {
    list: () => http.get<GeneratedDocument[]>("documents"),
    get: (id) => http.get<GeneratedDocument>(`documents/${id}`),
    remove: (id) => http.delete(`documents/${id}`),
    generate: (type, { resume_id, job_id }) =>
      http.post<GeneratedDocument>(
        GENERATE_PATHS[type],
        job_id ? { resume_id, job_id } : { resume_id }
      ),
    download: (id, format) => http.download(`documents/${id}/download`, { query: { format } }),
  }
}
