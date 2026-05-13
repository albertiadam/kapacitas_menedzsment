import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { API_BASE_URL } from '@/api/config';

export type UserRole = 'manager' | 'employee';

interface User {
  username: string;
  role: UserRole;
  name: string;
  employeeId: number | null;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isManager: boolean;
  isEmployee: boolean;
  employeeId: number | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      setUser({
        username,
        role: data.role,
        name: data.name,
        employeeId: data.employee_id ?? null,
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isManager: user?.role === 'manager',
      isEmployee: user?.role === 'employee',
      employeeId: user?.employeeId ?? null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
