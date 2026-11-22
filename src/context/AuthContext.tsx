import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, AuthUser } from '../api/client';

export type RoleExperience = 'parent' | 'teacher' | 'student' | 'admin';

interface AuthContextType {
  user: AuthUser | null;
  roles: string[];
  activeRole: RoleExperience;
  tenantSubdomain: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    school_name?: string;
    subdomain?: string;
    role?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setActiveRole: (role: RoleExperience) => void;
  setTenantSubdomain: (subdomain: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  roles: [],
  activeRole: 'parent',
  tenantSubdomain: '',
  isAuthenticated: false,
  isLoading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  setActiveRole: () => {},
  setTenantSubdomain: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<RoleExperience>('parent');
  const [tenantSubdomain, setTenantSubdomainState] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setTenantSubdomain = (subdomain: string) => {
    setTenantSubdomainState(subdomain);
    apiClient.setTenant(subdomain);
  };

  const determinePrimaryRole = (userRoles: string[]): RoleExperience => {
    const normalized = (userRoles || []).map(r => (typeof r === 'string' ? r.toLowerCase() : ''));
    if (normalized.some(r => r.includes('admin') || r === 'principal')) return 'admin';
    if (normalized.some(r => r.includes('teacher') || r.includes('faculty') || r.includes('instructor') || r === 'staff')) return 'teacher';
    if (normalized.some(r => r.includes('student'))) return 'student';
    if (normalized.some(r => r.includes('parent') || r.includes('guardian'))) return 'parent';
    return 'parent';
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Clear any previous tenant context before initiating clean email/password authentication
    apiClient.setToken(null);
    apiClient.setTenant(null);

    try {
      const res = await apiClient.login({ email, password });

      if (res.token && res.user) {
        apiClient.setToken(res.token);
        // Authoritative tenant context resolved from authenticated user profile
        if (res.user.tenant && res.user.tenant.subdomain) {
          setTenantSubdomain(res.user.tenant.subdomain);
        }
        setUser(res.user);
        const userRoles = res.roles || [];
        setRoles(userRoles);
        setIsAuthenticated(true);
        setActiveRole(determinePrimaryRole(userRoles));
        setIsLoading(false);

        // Register push notification token in background
        apiClient.registerDeviceToken(`fcm_push_${res.user.id}_${Date.now()}`, 'android').catch(() => {});

        return { success: true };
      }

      setIsLoading(false);
      return {
        success: false,
        message: res.message || res.error || 'The provided credentials do not match our records.',
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        message: err.message || 'Network connection failed. Please check your connection.',
      };
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    school_name?: string;
    subdomain?: string;
    role?: string;
  }) => {
    setIsLoading(true);
    if (payload.subdomain) {
      setTenantSubdomain(payload.subdomain);
    }

    try {
      const res = await apiClient.register(payload);

      if (res.token && res.user) {
        apiClient.setToken(res.token);
        if (res.user.tenant && res.user.tenant.subdomain) {
          setTenantSubdomain(res.user.tenant.subdomain);
        }
        setUser(res.user);
        const userRoles = res.roles || [];
        setRoles(userRoles);
        setIsAuthenticated(true);
        setActiveRole(determinePrimaryRole(userRoles));
        setIsLoading(false);

        // Register push notification token in background
        apiClient.registerDeviceToken(`fcm_push_${res.user.id}_${Date.now()}`, 'android').catch(() => {});

        return { success: true };
      }

      setIsLoading(false);
      return {
        success: false,
        message: res.message || res.error || 'Registration failed.',
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        message: err.message || 'Network connection failed.',
      };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } catch (e) {
      // Proceed with local logout regardless of network
    }
    apiClient.setToken(null);
    apiClient.setTenant(null);
    setUser(null);
    setRoles([]);
    setTenantSubdomainState('');
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        activeRole,
        tenantSubdomain,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        setActiveRole,
        setTenantSubdomain,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
