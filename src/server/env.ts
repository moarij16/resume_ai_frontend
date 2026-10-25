import "server-only"

import { z } from "zod"

const envSchema = z.object({
  DJANGO_API_URL: z.url().default("http://localhost:8000/api/v1"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const env = envSchema.parse(process.env)
