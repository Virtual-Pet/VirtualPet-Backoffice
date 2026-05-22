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