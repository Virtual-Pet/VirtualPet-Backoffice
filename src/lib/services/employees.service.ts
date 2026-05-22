import { api } from "@/lib/api";
import { CreateEmployee, Employee } from "../auth.types";

export const employeesService = {
  // ----------------------------------------------------------------
  // RUTAS PARA EMPLEADOS (Requiere token válido de operario/admin)
  // ----------------------------------------------------------------
  
  async getMe(token: string): Promise<Employee> {
    return api<Employee>("/api/v1/employees/me", {
      method: "GET",
      token,
    });
  },

  // ----------------------------------------------------------------
  // RUTAS PARA ADMINISTRADORES (Requiere ROLE_ADMIN)
  // ----------------------------------------------------------------

  async getAll(token: string): Promise<Employee[]> {
    return api<Employee[]>("/api/v1/admin/employees", {
      method: "GET",
      token,
    });
  },

  async create(data: CreateEmployee, token: string): Promise<Employee> {
    return api<Employee>("/api/v1/admin/employees", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<CreateEmployee>, token: string): Promise<Employee> {
    return api<Employee>(`/api/v1/admin/employees/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  }
};

export default employeesService;