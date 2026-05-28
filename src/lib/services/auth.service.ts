import { api } from "@/lib/api";
import type { AuthTokens, User } from "@/lib/auth.types";

interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    return api<AuthTokens>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return api<RefreshResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  async logout(refreshToken: string, token: string): Promise<void> {
    await api<void>("/api/v1/auth/logout", {
      method: "POST",
      token,
      body: JSON.stringify({ refreshToken }),
    });
  },

  async changePassword(
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    token: string
  ): Promise<void> {
    await api<void>("/api/v1/auth/password/change", {
      method: "POST",
      token,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async getMe(token: string): Promise<User> {
    return api<User>("/api/v1/auth/me", { method: "GET", token });
  },

  async updateMe(
    patch: { firstName?: string; lastName?: string },
    token: string
  ): Promise<User> {
    return api<User>("/api/v1/auth/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(patch),
    });
  },
};

export default authService;
