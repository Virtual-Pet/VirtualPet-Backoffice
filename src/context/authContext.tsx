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
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Al cargar la app, verificamos si ya hay un token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("vp_manager_token");
      if (token) {
        try {
          // Buscamos los datos reales del empleado
          const userData = await employeesService.getMe(token);
          const mappedUser = mapEmployeeResponseToUser(userData); // Convertimos la respuesta al formato User
          setUser(mappedUser);
          setToken(token);
        } catch {
          // Si el token expiró o es inválido, limpiamos
          localStorage.removeItem("vp_manager_token");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Lógica central de Login
  const login = async (email: string, pass: string) => {
    // 1. Llamamos al servicio (fetch)
    const { token } = await authService.login(email, pass);
    
    // 2. Guardamos el token
    localStorage.setItem("vp_manager_token", token);
    
    // 3. Obtenemos el perfil del empleado logueado
    const userData = await employeesService.getMe(token);
    
    // 4. Actualizamos el estado global
    const mappedUser = mapEmployeeResponseToUser(userData);
    setUser(mappedUser);
    setToken(token);
    
    // 5. Redireccionamos
    router.push("/orders");
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
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
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