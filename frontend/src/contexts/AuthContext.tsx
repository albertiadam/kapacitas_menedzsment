import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
export type UserRole = 'manager' | 'pm';

interface User {
  username: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isManager: boolean;
  isPM: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    if (username === 'manager' && password === 'password') {
      setUser({ username: 'manager', role: 'manager', name: 'Manager Admin' });
      return true;
    }
    if (username === 'pm' && password === 'password') {
      setUser({ username: 'pm', role: 'pm', name: 'Project Manager' });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isManager: user?.role === 'manager',
      isPM: user?.role === 'pm',
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
