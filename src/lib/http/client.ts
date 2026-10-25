export type QueryParams = Record<string, string | number | boolean | null | undefined>

export interface RequestOptions {
  query?: QueryParams
  signal?: AbortSignal
}

export interface DownloadedFile {
  blob: Blob
  filename: string
}

/**
 * Transport abstraction every feature API depends on (Dependency Inversion).
 * Features never call `fetch` directly, so the transport can be swapped
 * (BFF proxy in the browser, a fake in tests) without touching feature code.
 */
export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>
  delete<T = void>(path: string, options?: RequestOptions): Promise<T>
  upload<T>(path: string, form: FormData, options?: RequestOptions): Promise<T>
  download(path: string, options?: RequestOptions): Promise<DownloadedFile>
}
