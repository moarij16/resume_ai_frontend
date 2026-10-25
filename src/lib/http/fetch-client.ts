import type { DownloadedFile, HttpClient, QueryParams, RequestOptions } from "./client"
import { toApiError } from "./errors"

export interface FetchHttpClientConfig {
  baseUrl: string
  fetch?: typeof fetch
  /** Called once the session can no longer be refreshed (401 from the BFF). */
  onUnauthorized?: () => void
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams) {
  const url = `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${url}?${qs}` : url
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function filenameFrom(response: Response, fallback: string) {
  const disposition = response.headers.get("content-disposition") ?? ""
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
  return match ? decodeURIComponent(match[1]) : fallback
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch
  private readonly onUnauthorized?: () => void

  constructor({ baseUrl, fetch: fetchImpl, onUnauthorized }: FetchHttpClientConfig) {
    this.baseUrl = baseUrl
    this.fetchImpl = fetchImpl ?? globalThis.fetch.bind(globalThis)
    this.onUnauthorized = onUnauthorized
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.json<T>("GET", path, undefined, options)
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.json<T>("POST", path, body, options)
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.json<T>("PATCH", path, body, options)
  }

  delete<T = void>(path: string, options?: RequestOptions) {
    return this.json<T>("DELETE", path, undefined, options)
  }

  async upload<T>(path: string, form: FormData, options?: RequestOptions) {
    const response = await this.send("POST", path, { body: form }, options)
    return (await readBody(response)) as T
  }

  async download(path: string, options?: RequestOptions): Promise<DownloadedFile> {
    const response = await this.send("GET", path, {}, options)
    return { blob: await response.blob(), filename: filenameFrom(response, "download") }
  }

  private async json<T>(method: string, path: string, body: unknown, options?: RequestOptions) {
    const init: RequestInit = { headers: { Accept: "application/json" } }
    if (body !== undefined) {
      init.body = JSON.stringify(body)
      init.headers = { ...init.headers, "Content-Type": "application/json" }
    }
    const response = await this.send(method, path, init, options)
    return (await readBody(response)) as T
  }

  private async send(method: string, path: string, init: RequestInit, options?: RequestOptions) {
    const response = await this.fetchImpl(buildUrl(this.baseUrl, path, options?.query), {
      ...init,
      method,
      signal: options?.signal,
      credentials: "same-origin",
    })

    if (!response.ok) {
      if (response.status === 401) this.onUnauthorized?.()
      throw toApiError(response.status, await readBody(response))
    }
    return response
  }
}
