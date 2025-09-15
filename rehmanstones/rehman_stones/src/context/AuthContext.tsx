// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "user" | "admin";
export type User = { name: string; email: string; role: Role };

type LoginArgs = { email: string; password: string };
type SignupArgs = { name: string; email: string; password: string };

type AuthContextType = {
  user: User | null;
  login: (args: LoginArgs) => Promise<void>;
  signup: (args: SignupArgs) => Promise<void>;
  logout: () => Promise<void> | void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

const LS_USER = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_USER) || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [user]);

  function inferRole(email: string): Role {
    // simple/demo rule — tweak as you like:
    // 1) exact admin email, or
    // 2) any @rehmanstones.com email is admin
    if (/^admin@/i.test(email) || /@rehmanstones\.com$/i.test(email)) {
      return "admin";
    }
    return "user";
  }

  function niceNameFromEmail(email: string) {
    const base = email.split("@")[0].replace(/\./g, " ");
    return base
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");
  }

  const login = async ({ email }: LoginArgs) => {
    const role = inferRole(email);
    const name = niceNameFromEmail(email);
    setUser({ name, email, role });
  };

  const signup = async ({ name, email }: SignupArgs) => {
    const role = inferRole(email);
    setUser({ name, email, role });
  };

  const logout = async () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
