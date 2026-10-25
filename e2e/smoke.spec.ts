import { expect, test } from "@playwright/test"

/**
 * Smoke test against a running Django backend. Provide an existing account:
 *   E2E_EMAIL=you@example.com E2E_PASSWORD=secret npm run test:e2e
 * Optionally E2E_RESUME=path/to/resume.(pdf|docx) to exercise upload + scan.
 */
const email = process.env.E2E_EMAIL
const password = process.env.E2E_PASSWORD
const resumeFile = process.env.E2E_RESUME

test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD to run the smoke test")

test("protected routes redirect to login", async ({ page }) => {
  await page.goto("/resumes")
  await expect(page).toHaveURL(/\/login\?next=%2Fresumes/)
})

test("login → dashboard → resumes → scan → logout", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("/login")
  await page.getByLabel("Email").fill(email!)
  await page.getByLabel("Password").fill(password!)
  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible()

  if (resumeFile) {
    await page.getByRole("button", { name: "Upload resume" }).first().click()
    await page.locator('input[type="file"]').setInputFiles(resumeFile)
    await page.getByRole("button", { name: "Upload & scan" }).click()
    await expect(page).toHaveURL(/\/ats\/[0-9a-f-]+$/, { timeout: 60_000 })
    await expect(page.getByRole("img", { name: /ATS score/ })).toBeVisible()
  }

  await page.getByRole("link", { name: "Resumes" }).first().click()
  await expect(page.getByRole("heading", { name: "Resumes" })).toBeVisible()

  await page.getByRole("link", { name: "ATS scans" }).first().click()
  await expect(page.getByRole("heading", { name: "ATS scans" })).toBeVisible()

  await page.getByRole("link", { name: "Settings" }).first().click()
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible()

  await page.getByRole("button", { name: new RegExp(email!.split("@")[0]) }).click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/login/)

  expect(errors).toEqual([])
})
