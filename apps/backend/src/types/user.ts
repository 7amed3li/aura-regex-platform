// client/src/types/user.ts
// ده الشكل الحقيقي للـ user اللي بيجي من الـ backend في response

export interface FrontendUser {
  id: string;
  email: string;
  username?: string | null;
  role: "USER" | "ADMIN";
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSignedIn?: string;
  loginMethod?: string;
}

// نوع للـ payload في الـ JWT (للـ backend بس)
export interface UserPayload {
  id: string;
  role: "USER" | "ADMIN";
}