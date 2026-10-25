import { describe, expect, it, vi } from "vitest"

import { forwardWithRefresh } from "./forward"
import { createDedupedRefresher } from "./token-refresher"

const ok = () => new Response("{}", { status: 200 })
const unauthorized = () => new Response("{}", { status: 401 })
const rotated = { access: "new-access", refresh: "new-refresh" }

describe("forwardWithRefresh", () => {
  it("forwards with the current access token without refreshing", async () => {
    const send = vi.fn(async () => ok())
    const refresh = vi.fn()

    const result = await forwardWithRefresh({ access: "a", refresh: "r" }, { send, refresh })

    expect(result).toMatchObject({ kind: "ok", rotated: null })
    expect(send).toHaveBeenCalledWith("a")
    expect(refresh).not.toHaveBeenCalled()
  })

  it("refreshes first when the access cookie has expired", async () => {
    const send = vi.fn(async () => ok())
    const refresh = vi.fn(async () => rotated)

    const result = await forwardWithRefresh({ refresh: "r" }, { send, refresh })

    expect(result).toMatchObject({ kind: "ok", rotated })
    expect(refresh).toHaveBeenCalledWith("r")
    expect(send).toHaveBeenCalledWith("new-access")
  })

  it("refreshes and retries once on a 401", async () => {
    const send = vi.fn().mockResolvedValueOnce(unauthorized()).mockResolvedValueOnce(ok())
    const refresh = vi.fn(async () => rotated)

    const result = await forwardWithRefresh({ access: "stale", refresh: "r" }, { send, refresh })

    expect(result).toMatchObject({ kind: "ok", rotated })
    expect(send).toHaveBeenNthCalledWith(1, "stale")
    expect(send).toHaveBeenNthCalledWith(2, "new-access")
  })

  it("does not loop when the retried request is still unauthorized", async () => {
    const send = vi.fn(async () => unauthorized())
    const refresh = vi.fn(async () => rotated)

    const result = await forwardWithRefresh({ access: "stale", refresh: "r" }, { send, refresh })

    expect(result.kind).toBe("ok")
    expect(send).toHaveBeenCalledTimes(2)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it("reports an expired session when refresh fails", async () => {
    const send = vi.fn(async () => unauthorized())
    const refresh = vi.fn(async () => null)

    expect(await forwardWithRefresh({ access: "stale", refresh: "r" }, { send, refresh })).toEqual({
      kind: "expired",
    })
  })

  it("reports an expired session when there are no tokens", async () => {
    const send = vi.fn()
    expect(await forwardWithRefresh({}, { send, refresh: vi.fn() })).toEqual({ kind: "expired" })
    expect(send).not.toHaveBeenCalled()
  })
})

describe("createDedupedRefresher", () => {
  it("shares one in-flight refresh between concurrent callers", async () => {
    const refresh = vi.fn(async () => rotated)
    const deduped = createDedupedRefresher(refresh)

    const results = await Promise.all([deduped("r"), deduped("r"), deduped("r")])

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(results).toEqual([rotated, rotated, rotated])
  })

  it("serves late callers the rotated pair instead of reusing the blacklisted token", async () => {
    const refresh = vi.fn(async () => rotated)
    const deduped = createDedupedRefresher(refresh)

    await deduped("r")
    expect(await deduped("r")).toEqual(rotated)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it("expires cached results after the TTL", async () => {
    vi.useFakeTimers()
    const refresh = vi.fn(async () => rotated)
    const deduped = createDedupedRefresher(refresh, 1000)

    await deduped("r")
    vi.advanceTimersByTime(1001)
    await deduped("r")

    expect(refresh).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it("resolves to null when the refresh throws", async () => {
    const deduped = createDedupedRefresher(async () => {
      throw new Error("network")
    })
    expect(await deduped("r")).toBeNull()
  })
})
