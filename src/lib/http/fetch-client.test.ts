import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { ApiError } from "./errors"
import { FetchHttpClient } from "./fetch-client"

const BASE = "http://localhost/api/proxy"
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledFrame: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("FetchHttpClient", () => {
  it("serialises JSON bodies and query params", async () => {
    server.use(
      http.post(`${BASE}/ats/scan`, async ({ request }) => {
        const url = new URL(request.url)
        return HttpResponse.json({ body: await request.json(), q: url.searchParams.get("q") })
      })
    )
    const client = new FetchHttpClient({ baseUrl: BASE })

    const result = await client.post(
      "ats/scan",
      { resume_id: "1" },
      { query: { q: "x", skip: undefined } }
    )

    expect(result).toEqual({ body: { resume_id: "1" }, q: "x" })
  })

  it("returns undefined for 204 responses", async () => {
    server.use(http.delete(`${BASE}/jobs/1`, () => new HttpResponse(null, { status: 204 })))
    const client = new FetchHttpClient({ baseUrl: BASE })
    await expect(client.delete("jobs/1")).resolves.toBeUndefined()
  })

  it("throws a normalised ApiError and notifies on 401", async () => {
    server.use(
      http.get(`${BASE}/users/me`, () =>
        HttpResponse.json(
          { error: true, status_code: 401, detail: { detail: "Expired" } },
          { status: 401 }
        )
      )
    )
    const onUnauthorized = vi.fn()
    const client = new FetchHttpClient({ baseUrl: BASE, onUnauthorized })

    const error = await client.get("users/me").catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toBe("Expired")
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it("downloads blobs with the server-provided filename", async () => {
    server.use(
      http.get(
        `${BASE}/documents/1/download`,
        () =>
          new HttpResponse("file-bytes", {
            headers: { "Content-Disposition": 'attachment; filename="resume_1.pdf"' },
          })
      )
    )
    const client = new FetchHttpClient({ baseUrl: BASE })

    const { blob, filename } = await client.download("documents/1/download", {
      query: { format: "pdf" },
    })

    expect(filename).toBe("resume_1.pdf")
    expect(await blob.text()).toBe("file-bytes")
  })
})
