// import { getManagerToken } from "./auth.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const profileService = {
  async updateProfile(data: { name: string; lastname: string }) {
    // const token = getManagerToken();
    const res = await fetch(`${API_URL}/api/v1/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error updating profile");
    return res.json();
  },
};