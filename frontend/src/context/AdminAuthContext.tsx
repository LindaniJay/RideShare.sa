import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthService, AdminUser } from '../services/adminAuthService';

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshClaims: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to admin auth state changes
    const unsubscribe = adminAuthService.onAuthStateChange((admin) => {
      console.log('AdminAuthContext: Auth state changed:', admin);
      setAdmin(admin);
      setLoading(false);
      
      // Only navigate if we're not already on the correct page
      const currentPath = window.location.pathname;
      
      if (admin && currentPath !== '/admin-dashboard') {
        // Navigate to admin dashboard after successful login
        console.log('AdminAuthContext: Navigating to admin dashboard');
        navigate('/admin-dashboard', { replace: true });
      } else if (!admin && currentPath.startsWith('/admin')) {
        // Admin is logged out - navigate to platform home page only if on admin pages
        console.log('AdminAuthContext: Admin logged out, navigating to platform home');
        navigate('/home', { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('AdminAuthContext: Attempting login for:', email);
      await adminAuthService.loginAdmin({ email, password });
      console.log('AdminAuthContext: Login successful');
      // Navigation will be handled by the auth state change listener
    } catch (error) {
      console.error('AdminAuthContext: Login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await adminAuthService.logoutAdmin();
      // Navigation will be handled by the auth state change listener
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const refreshClaims = async () => {
    try {
      const success = await adminAuthService.refreshAdminClaims();
      return success;
    } catch (error) {
      console.error('AdminAuthContext: Failed to refresh claims:', error);
      return false;
    }
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    refreshClaims,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
