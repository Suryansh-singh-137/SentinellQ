"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, loginApi, getMeApi } from "@/lib/api";

export type UserRole = "analyst" | "customer";

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    emailOrUsername: string,
    password: string,
    roleHint?: UserRole
  ) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  quickLogin: (targetRole: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (targetRole: UserRole) => Promise<void>;
}

export const DEMO_USERS_MAP: Record<UserRole, AuthUser & { password: string }> = {
  analyst: {
    id: "usr-analyst-001",
    username: "analyst",
    email: "analyst@sentineliq.ai",
    password: "analyst123",
    full_name: "Elena Vance (Lead Risk Analyst)",
    role: "analyst",
    customer_id: null,
    permissions: [
      "dashboard:view",
      "cases:investigate",
      "cases:action",
      "mule:graph",
      "loans:restructure",
      "governance:manage",
    ],
  },
  customer: {
    id: "usr-cust-001",
    username: "customer",
    email: "customer@sentineliq.ai",
    password: "customer123",
    full_name: "Aarav Sharma",
    role: "customer",
    customer_id: "CUST-001",
    permissions: [
      "shop:view",
      "shop:checkout",
      "transactions:history",
      "step_up:confirm",
    ],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "sentineliq_auth_token";
const USER_KEY = "sentineliq_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Rehydrate from localStorage
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // By default, initialize with a guest state or default analyst demo if desired
      }
    } catch (e) {
      console.error("Auth rehydration error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } catch (e) {}
  };

  const login = async (
    emailOrUsername: string,
    password: string,
    roleHint?: UserRole
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    try {
      // 1. Attempt FastAPI backend authentication
      try {
        const res = await loginApi(emailOrUsername, password, roleHint);
        saveSession(res.access_token, res.user);
        return { success: true, role: res.user.role };
      } catch (backendErr: any) {
        // 2. Resilient fallback: check demo credentials
        const query = emailOrUsername.trim().toLowerCase();
        let matched: (typeof DEMO_USERS_MAP)[UserRole] | null = null;

        for (const roleKey of ["analyst", "customer"] as UserRole[]) {
          const candidate = DEMO_USERS_MAP[roleKey];
          if (
            candidate.username.toLowerCase() === query ||
            candidate.email.toLowerCase() === query
          ) {
            matched = candidate;
            break;
          }
        }

        if (matched) {
          if (password === matched.password) {
            const fallbackToken = `mock-jwt-token-${matched.role}-${Date.now()}`;
            const { password: _, ...userOnly } = matched;
            saveSession(fallbackToken, userOnly);
            return { success: true, role: matched.role };
          } else {
            return {
              success: false,
              error: "Invalid password. Use analyst123 or customer123 for demo accounts.",
            };
          }
        }

        const msg =
          backendErr?.response?.data?.detail ||
          "User not found. Use 'analyst@sentineliq.ai' or 'customer@sentineliq.ai'.";
        return { success: false, error: msg };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (targetRole: UserRole) => {
    const account = DEMO_USERS_MAP[targetRole];
    await login(account.email, account.password, targetRole);
  };

  const switchRole = async (targetRole: UserRole) => {
    await quickLogin(targetRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLogin,
        logout,
        switchRole,
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
