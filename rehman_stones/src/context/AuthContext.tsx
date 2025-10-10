// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react"; // <-- type-only

export type Role = "user" | "admin";
export type User = { name: string; email: string; role: Role };

type LoginArgs = { email: string; password: string };
type SignupArgs = { name: string; email: string; password: string };

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  login: (args: LoginArgs) => Promise<void>;
  signup: (args: SignupArgs) => Promise<void>;
  logout: () => Promise<void> | void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

const LS_USER = "auth_user";

const ADMIN_EMAILS = new Set<string>(["admin@rehmanstones.com"]);
const ADMIN_DOMAIN = "rehmanstones.com";

function inferRole(email: string): Role {
  const e = email.trim().toLowerCase();
  if (ADMIN_EMAILS.has(e)) return "admin";
  if (e.endsWith(`@${ADMIN_DOMAIN}`)) return "admin";
  return "user";
}

function nameFromEmail(email: string) {
  const base = email.split("@")[0].replace(/[._-]+/g, " ");
  return base
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function readUser(): User | null {
  try {
    const raw = localStorage.getItem(LS_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
function writeUser(u: User | null) {
  if (!u) localStorage.removeItem(LS_USER);
  else localStorage.setItem(LS_USER, JSON.stringify(u));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readUser());

  useEffect(() => writeUser(user), [user]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_USER) setUser(readUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async ({ email }: LoginArgs) => {
    const role = inferRole(email);
    const name = nameFromEmail(email);
    setUser({ name, email, role });
  };

  const signup = async ({ name, email }: SignupArgs) => {
    const role = inferRole(email);
    setUser({ name: name?.trim() || nameFromEmail(email), email, role });
  };

  const logout = async () => setUser(null);

  const value: AuthContextType = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", login, signup, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
