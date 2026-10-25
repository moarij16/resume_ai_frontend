import type { HttpClient } from "@/lib/http/client"
import type { User } from "@/types/api"

export interface ProfileUpdateInput {
  first_name?: string
  last_name?: string
}

export interface ChangePasswordInput {
  current_password: string
  new_password: string
}

export interface ProfileService {
  me(): Promise<User>
  update(input: ProfileUpdateInput): Promise<User>
  changePassword(input: ChangePasswordInput): Promise<void>
}

export function createProfileService(http: HttpClient): ProfileService {
  return {
    me: () => http.get<User>("users/me"),
    update: (input) => http.patch<User>("users/me/update", input),
    changePassword: (input) => http.post<void>("users/me/change-password", input),
  }
}
