export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  role: ROLES;
  name: string;
  lastname: string;
  type?: Employee
}

export interface Employee {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: ROLES;
  legajo: string;
  warehouse: number;
}

export interface CreateEmployee {
  name: string;
  lastname: string;
  email: string;
  temporaryPassword: string;
  role: ROLES;
  legajo: string;
  warehouseId: number;
}
export type UpdateEmployee = Partial<Omit<Employee, "id">>;

export type ROLES = "ROLE_ADMIN" | "ROLE_EMPLOYEE";

export interface EmployeeApiResponse {
  id: string;
  email: string;
  name: string;
  lastname: string;
  legajo: string;
  role: string;
  warehouseId: number;
  active: boolean;
  createdAt: string;
}

export const mapEmployeeResponseToUser = (data: EmployeeApiResponse): User => {
  
  // 1. Construimos el perfil de empleado
  const employeeData: Employee = {
    id: data.id,
    name: data.name,
    lastname: data.lastname,
    email: data.email,
    role: data.role as ROLES, // Casteamos el string al Enum
    legajo: data.legajo,
    warehouse: data.warehouseId // Renombramos la propiedad como querías
  };

  // 2. Construimos y retornamos el usuario global
  return {
    id: data.id,
    email: data.email,
    role: data.role as ROLES,
    name: data.name,
    lastname: data.lastname,
    type: employeeData // Anidamos el perfil
  };
};