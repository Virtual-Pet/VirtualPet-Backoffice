import { api } from "@/lib/api";
import { User, LoginResponse } from "@/lib/auth.types"; // Asumiendo que tenés estos tipos exportados

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return api<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async refresh(token: string): Promise<LoginResponse> {
    return api<LoginResponse>("/api/v1/auth/refresh", {
      method: "POST",
      token, // Lo mandamos en la cabecera usando tu wrapper api()
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api<{ message: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async changePassword(password: string, token: string): Promise<{ message: string }> {
    return api<{ message: string }>("/api/v1/auth/change-password", {
      method: "POST",
      token, // JWT actual del usuario que está forzado a cambiar la clave
      body: JSON.stringify({ password }),
    });
  },
};

export default authService;