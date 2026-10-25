import "server-only"

import { env } from "./env"

/**
 * Builds a Django API URL. Django routes always end with a slash, while Next
 * strips trailing slashes from incoming paths, so we normalise here.
 */
export function djangoUrl(path: string, search = "") {
  const base = env.DJANGO_API_URL.replace(/\/+$/, "")
  const clean = path.replace(/^\/+|\/+$/g, "")
  return `${base}/${clean}/${search}`
}

export function djangoFetch(path: string, init: RequestInit = {}, search = "") {
  return fetch(djangoUrl(path, search), { cache: "no-store", redirect: "manual", ...init })
}

/** Reads a JSON body while tolerating empty or non-JSON responses. */
export async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { error: text.trimStart().startsWith("<") ? response.statusText : text }
  }
}
