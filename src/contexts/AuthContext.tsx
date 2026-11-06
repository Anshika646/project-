import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { AuthUser, DemoAccount } from '../types/auth.types';
import { authService } from '../services/authService';
import { UserRole } from '../types/database.types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  demoAccounts: DemoAccount[];
  login: (email: string, password?: string) => Promise<void>;
  loginAsDemo: (demoId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  const demoAccounts = authService.getDemoAccounts();

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        startTransition(() => {
          setUser(currentUser);
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Auth initialization error:', err);
        startTransition(() => {
          setIsLoading(false);
        });
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.login(email, password);
      startTransition(() => {
        setUser(loggedIn);
        setIsLoading(false);
      });
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const loginAsDemo = async (demoId: string) => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.loginAsDemo(demoId);
      startTransition(() => {
        setUser(loggedIn);
        setIsLoading(false);
      });
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    await authService.logout();
    startTransition(() => {
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isLoading,
        demoAccounts,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
