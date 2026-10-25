import type { HttpClient } from "@/lib/http/client"
import type { AuthResponse, User } from "@/types/api"

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  first_name?: string
  last_name?: string
}

export interface AuthService {
  login(input: LoginInput): Promise<User>
  register(input: RegisterInput): Promise<User>
  logout(): Promise<void>
}

/** Talks to the Next.js BFF auth routes (`/api/auth/*`), which own the JWT cookies. */
export function createAuthService(http: HttpClient): AuthService {
  return {
    login: async (input) => (await http.post<AuthResponse>("login", input)).user,
    register: async (input) => (await http.post<AuthResponse>("register", input)).user,
    logout: () => http.post<void>("logout"),
  }
}
