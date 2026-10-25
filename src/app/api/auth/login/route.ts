import { exchangeCredentials } from "@/server/auth-exchange"

export function POST(request: Request) {
  return exchangeCredentials("users/auth/login", request)
}
