export type Role = "CUSTOMER" | "EMPLOYEE" | "ADMIN";

export interface UserSummary {
  id: string;
  email: string;
  role: Role;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export interface RegisterEmployeeRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterRiderRequest extends RegisterEmployeeRequest {
  phone: string;
  vehicleType: "MOTO" | "BICI" | "CAMIONETA" | "AUTO";
  licensePlate?: string;
}
