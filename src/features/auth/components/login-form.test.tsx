import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Api } from "@/lib/api"
import { ApiProvider } from "@/lib/api-context"
import { ApiError } from "@/lib/http/errors"
import type { User } from "@/types/api"

import { LoginForm } from "./login-form"

const replace = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("next=/resumes"),
}))

const user: User = {
  id: "u1",
  email: "ada@example.com",
  first_name: "Ada",
  last_name: "Lovelace",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  last_login: null,
}

/** The form depends only on the `Api` abstraction, so a fake is injected (DIP). */
function renderWithApi(auth: Partial<Api["auth"]>) {
  const api = { auth } as Api
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <LoginForm />
      </ApiProvider>
    </QueryClientProvider>
  )
}

async function fillAndSubmit() {
  const actor = userEvent.setup()
  await actor.type(screen.getByLabelText("Email"), "ada@example.com")
  await actor.type(screen.getByLabelText("Password"), "secret-pass")
  await actor.click(screen.getByRole("button", { name: "Sign in" }))
}

describe("LoginForm", () => {
  beforeEach(() => replace.mockReset())

  it("signs in and follows the safe ?next= redirect", async () => {
    const login = vi.fn(async () => user)
    renderWithApi({ login })

    await fillAndSubmit()

    expect(login).toHaveBeenCalledWith({ email: "ada@example.com", password: "secret-pass" })
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/resumes"))
  })

  it("shows the backend error as a form-level message", async () => {
    const login = vi.fn(async () => {
      throw new ApiError(401, "No active account found with the given credentials")
    })
    renderWithApi({ login })

    await fillAndSubmit()

    expect(
      await screen.findByText("No active account found with the given credentials")
    ).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("validates the email before calling the API", async () => {
    const login = vi.fn()
    renderWithApi({ login })
    const actor = userEvent.setup()

    await actor.type(screen.getByLabelText("Email"), "not-an-email")
    await actor.type(screen.getByLabelText("Password"), "x")
    await actor.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })
})
