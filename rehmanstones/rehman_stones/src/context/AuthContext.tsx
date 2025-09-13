import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; name: string; email: string };
type Credentials = { email: string; password: string };
type SignupInput = Credentials & { name: string };

type AuthContextType = {
  user: User | null;
  login: (c: Credentials) => Promise<void>;
  signup: (s: SignupInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "auth-users-v1"; // demo storage for users
const SESSION_KEY = "auth-session-v1"; // current user id

type StoredUser = User & { password: string }; // DEMO ONLY (plain text)

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // restore session
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return;
    const u = readUsers().find((u) => u.id === id);
    if (u) setUser({ id: u.id, name: u.name, email: u.email });
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      async login({ email, password }) {
        const u = readUsers().find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (!u || u.password !== password)
          throw new Error("Invalid email or password");
        localStorage.setItem(SESSION_KEY, u.id);
        setUser({ id: u.id, name: u.name, email: u.email });
      },
      async signup({ name, email, password }) {
        const users = readUsers();
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Email already registered");
        }
        const id = `U-${Date.now()}`;
        users.push({ id, name, email, password }); // DEMO ONLY – store hashed on backend
        writeUsers(users);
        localStorage.setItem(SESSION_KEY, id);
        setUser({ id, name, email });
      },
      logout() {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
