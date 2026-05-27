"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { employeesService } from "@/lib/services/employees.service";
import { mapEmployeeResponseToUser, User } from "@/lib/auth.types";

// Definimos qué expone nuestro contexto
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  mustChangePassword: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const router = useRouter();
  const PASSWORD_CHANGE_FLAG = "vp_manager_force_password_change";

  const setForcePasswordFlag = (value: boolean) => {
    setMustChangePassword(value);
    if (value) {
      localStorage.setItem(PASSWORD_CHANGE_FLAG, "1");
    } else {
      localStorage.removeItem(PASSWORD_CHANGE_FLAG);
    }
  };

  const fetchProfile = async (sessionToken: string) => {
    const userData = await employeesService.getMe(sessionToken);
    const mappedUser = mapEmployeeResponseToUser(userData);
    setUser(mappedUser);
    return mappedUser;
  };

  const refreshUser = async () => {
    if (!token) throw new Error("No token available");
    setForcePasswordFlag(false);
    await fetchProfile(token);
  };

  // Al cargar la app, verificamos si ya hay un token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("vp_manager_token");
      const forcePassword = localStorage.getItem(PASSWORD_CHANGE_FLAG) === "1";
      if (token) {
        setToken(token);
        if (forcePassword) {
          setMustChangePassword(true);
          setLoading(false);
          return;
        }

        try {
          await fetchProfile(token);
        } catch {
          localStorage.removeItem("vp_manager_token");
          localStorage.removeItem(PASSWORD_CHANGE_FLAG);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Lógica central de Login
  const login = async (email: string, pass: string) => {
    const response = await authService.login(email, pass);
    const { accessToken, user } = response;
    const forcePasswordChange = user?.forcePasswordChange;

    localStorage.setItem("vp_manager_token", accessToken);
    setToken(accessToken);
    setForcePasswordFlag(Boolean(forcePasswordChange));

    if (forcePasswordChange) {
      setUser(null);
      return true;
    }

    await fetchProfile(accessToken);
    return false;
  };

  // Lógica central de Logout
  const logout = () => {
    localStorage.removeItem("vp_manager_token");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, mustChangePassword, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook para usar en cualquier componente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}