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
  login: (email: string, password: string, subdomain?: string) => Promise<{ success: boolean; message?: string }>;
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
  bypassLoginForDemo: (role: RoleExperience) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  roles: [],
  activeRole: 'parent',
  tenantSubdomain: 'atlantichall',
  isAuthenticated: false,
  isLoading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  setActiveRole: () => {},
  setTenantSubdomain: () => {},
  bypassLoginForDemo: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<RoleExperience>('parent');
  const [tenantSubdomain, setTenantSubdomainState] = useState<string>('atlantichall');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setTenantSubdomain = (subdomain: string) => {
    setTenantSubdomainState(subdomain);
    apiClient.setTenant(subdomain);
  };

  const determinePrimaryRole = (userRoles: string[]): RoleExperience => {
    if (userRoles.includes('parent') || userRoles.includes('guardian')) return 'parent';
    if (userRoles.includes('teacher') || userRoles.includes('faculty')) return 'teacher';
    if (userRoles.includes('student')) return 'student';
    return 'parent';
  };

  const login = async (email: string, password: string, subdomain?: string) => {
    setIsLoading(true);
    if (subdomain) {
      setTenantSubdomain(subdomain);
    }

    try {
      const res = await apiClient.login({ email, password });

      if (res.token && res.user) {
        apiClient.setToken(res.token);
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
        message: res.message || res.error || 'Authentication failed. Please check credentials.',
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        message: err.message || 'Network connection failed.',
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
    setUser(null);
    setRoles([]);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const bypassLoginForDemo = (role: RoleExperience) => {
    setUser({
      id: 'demo-user-1',
      name: role === 'parent' ? 'Chief Adeleke' : role === 'teacher' ? 'Dr. Grace Okon' : 'Kehinde Adeleke',
      email: `${role}.demo@atlantichall.org`,
      phone: '+2348012345678',
      tenant_id: 'tenant-1',
      tenant: {
        id: 'tenant-1',
        name: 'Atlantic Hall College',
        subdomain: 'atlantichall',
      },
    });
    setRoles([role]);
    setActiveRole(role);
    setIsAuthenticated(true);
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
        bypassLoginForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
