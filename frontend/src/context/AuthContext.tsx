import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { firebaseAuthService, User } from '../services/firebaseAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string, phone: string, role: 'Renter' | 'Host') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
      setUser(user);
      
      // Only set loading to false after initial load
      if (initialLoad) {
        setInitialLoad(false);
        setLoading(false);
      } else {
        // For subsequent auth changes, don't show loading
        setLoading(false);
      }
      
      // Get current pathname at the time of auth state change
      const currentPath = window.location.pathname;
      
      if (user) {
        // User is logged in - check role and navigate accordingly
        const userRole = user.role?.toLowerCase();
        console.log('AuthContext: User logged in', { role: userRole, pathname: currentPath });
        
        if (userRole === 'admin') {
          console.log('AuthContext: Admin user detected, role:', user.role);
          // Navigate to admin dashboard if not already on an admin page
          if (!currentPath.startsWith('/admin') && !currentPath.startsWith('/admin-dashboard')) {
            console.log('AuthContext: Navigating admin user to admin dashboard');
            navigate('/admin-dashboard', { replace: true });
          }
        } else if (!currentPath.startsWith('/admin') && !currentPath.includes('admin')) {
          // Only navigate if not already on dashboard, home, or other valid routes
          const validRoutes = ['/dashboard', '/home', '/search', '/vehicle', '/checkout', '/about', '/contact', '/faq', '/pricing'];
          const isOnValidRoute = validRoutes.some(route => currentPath.startsWith(route)) || currentPath === '/';
          
          if (!isOnValidRoute && !currentPath.startsWith('/dashboard')) {
            console.log('AuthContext: Regular user detected, navigating to dashboard');
            navigate('/dashboard', { replace: true });
          }
        }
      } else {
        // User is logged out - navigate to platform home page only if not already there
        // Don't redirect if on public pages (landing, login, signup)
        const publicRoutes = ['/', '/login', '/signup', '/register', '/home'];
        const isOnPublicRoute = publicRoutes.includes(currentPath) || currentPath.startsWith('/home');
        
        if (!isOnPublicRoute) {
          console.log('AuthContext: User logged out, navigating to platform home');
          navigate('/home', { replace: true });
        }
      }
    });

    return unsubscribe;
  }, [navigate, initialLoad]);

  const signup = async (email: string, password: string, firstName: string, lastName: string, phone: string, role: 'Renter' | 'Host') => {
    // Don't set loading for auth operations to avoid UI flicker
    try {
      await firebaseAuthService.signupUser({ email, password, firstName, lastName, phone, role });
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    // Don't set loading for auth operations to avoid UI flicker
    try {
      await firebaseAuthService.loginUser({ email, password });
      // Navigation will be handled by the auth state change listener
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Don't set loading for logout to avoid UI flicker
    try {
      await firebaseAuthService.logoutUser();
      // Navigation will be handled by the auth state change listener
    } catch (error) {
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseAuthService.sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    sendPasswordResetEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
