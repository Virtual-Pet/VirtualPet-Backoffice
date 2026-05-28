import { api } from "@/lib/api";
import type { RegisterEmployeeRequest, UserSummary } from "@/lib/auth.types";

export const employeesService = {
  async registerEmployee(
    data: RegisterEmployeeRequest,
    token: string
  ): Promise<UserSummary> {
    return api<UserSummary>("/api/v1/auth/register/employee", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },
};

export default employeesService;
