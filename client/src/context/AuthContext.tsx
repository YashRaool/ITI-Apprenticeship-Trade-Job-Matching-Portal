import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, setAccessToken } from "../lib/api";

export type AuthUser = { id: string; email: string; role: "student" | "employer" | "admin" };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: "student" | "employer") => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session via cookie
  useEffect(() => {
    api
      .post<{ success: boolean; data: { accessToken: string } }>("/auth/refresh")
      .then(async (r) => {
        setAccessToken(r.data.data.accessToken);
        const me = await api.get<{ success: boolean; data: AuthUser }>("/auth/me");
        setUser(me.data.data);
      })
      .catch(() => {/* no session */})
      .finally(() => setIsLoading(false));
  }, []);

  async function handleTokenResponse(data: { user: AuthUser; accessToken: string }) {
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  const login = async (email: string, password: string) => {
    const r = await api.post<{ success: boolean; data: { user: AuthUser; accessToken: string } }>(
      "/auth/login",
      { email, password }
    );
    await handleTokenResponse(r.data.data);
  };

  const register = async (email: string, password: string, role: "student" | "employer") => {
    const r = await api.post<{ success: boolean; data: { user: AuthUser; accessToken: string } }>(
      "/auth/register",
      { email, password, role }
    );
    await handleTokenResponse(r.data.data);
  };

  const googleLogin = async (idToken: string) => {
    const r = await api.post<{ success: boolean; data: { user: AuthUser; accessToken: string } }>(
      "/auth/google",
      { idToken }
    );
    await handleTokenResponse(r.data.data);
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
