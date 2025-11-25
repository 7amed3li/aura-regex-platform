import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

// 1. تعريف نوع المستخدم (مطابق للباك اند الجديد)
export interface User {
  id: string;
  email: string;
  username?: string;
  role: "USER" | "ADMIN";
  status: string;
  createdAt: string;
  lastSignedIn?: string;
}

// 2. تعريف شكل البيانات
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// استخدام الرابط المباشر مؤقتاً لضمان العمل
const API_URL = "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.warn("Session expired");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth Check Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("تم تسجيل الخروج");
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}