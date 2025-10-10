// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react"; // <-- type-only
import toast from "react-hot-toast";

export type Role = "user" | "admin";
export type User = { 
  id: string;
  name: string; 
  email: string; 
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  profilePicture?: string;
  createdAt: string;
};

type LoginArgs = { email: string; password: string };
type SignupArgs = { name: string; email: string; password: string; phone?: string };

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  login: (args: LoginArgs) => Promise<boolean>;
  signup: (args: SignupArgs) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  updateProfile: () => {},
});

const LS_USER = "auth_user";
const LS_USERS_DB = "users_database"; // Store all registered users

const ADMIN_EMAILS = new Set<string>(["admin@rehmanstones.com"]);
const ADMIN_DOMAIN = "rehmanstones.com";

// Default admin credentials
const DEFAULT_ADMIN = {
  email: "admin@rehmanstones.com",
  password: "admin123",
  user: {
    id: "admin_001",
    name: "Admin",
    email: "admin@rehmanstones.com",
    role: "admin" as Role,
    phone: "",
    address: "",
    city: "",
    profilePicture: "",
    createdAt: new Date().toISOString(),
  }
};

// Simple user database helpers
function getUsersDB(): { [email: string]: { password: string; user: User } } {
  try {
    return JSON.parse(localStorage.getItem(LS_USERS_DB) || "{}");
  } catch {
    return {};
  }
}

function saveUsersDB(db: { [email: string]: { password: string; user: User } }) {
  localStorage.setItem(LS_USERS_DB, JSON.stringify(db));
}

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

  const login = async ({ email, password }: LoginArgs): Promise<boolean> => {
    const emailLower = email.trim().toLowerCase();
    
    // Check for default admin credentials
    if (emailLower === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      setUser(DEFAULT_ADMIN.user);
      toast.success(`Welcome back, Admin!`);
      return true;
    }
    
    const db = getUsersDB();
    const userRecord = db[emailLower];
    
    if (!userRecord) {
      toast.error("Account not found. Please sign up first.");
      return false;
    }
    
    if (userRecord.password !== password) {
      toast.error("Incorrect password. Please try again.");
      return false;
    }
    
    setUser(userRecord.user);
    toast.success(`Welcome back, ${userRecord.user.name}!`);
    return true;
  };

  const signup = async ({ name, email, password, phone }: SignupArgs): Promise<boolean> => {
    const db = getUsersDB();
    const emailLower = email.trim().toLowerCase();
    
    if (db[emailLower]) {
      toast.error("Email already registered. Please login instead.");
      return false;
    }
    
    const role = inferRole(emailLower);
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: emailLower,
      role,
      phone: phone || "",
      address: "",
      city: "",
      profilePicture: "",
      createdAt: new Date().toISOString(),
    };
    
    db[emailLower] = {
      password,
      user: newUser,
    };
    
    saveUsersDB(db);
    setUser(newUser);
    toast.success(`Welcome to Rehman Stones, ${newUser.name}!`);
    return true;
  };

  const logout = () => {
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Update in database too
    const db = getUsersDB();
    if (db[user.email]) {
      db[user.email].user = updatedUser;
      saveUsersDB(db);
    }
    
    toast.success("Profile updated successfully");
  };

  const value: AuthContextType = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", login, signup, logout, updateProfile }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
