// Production Service Imports (available for use)
// import { bookingService } from './services/productionBookingService';
// import { listingService } from './services/productionListingService';
// import { apiClient } from './services/productionApiClient';

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ToastProvider';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { FullPageLoading } from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Search = lazy(() => import('./pages/Search'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const UnifiedCheckout = lazy(() => import('./pages/UnifiedCheckout'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
// Import Dashboard directly to avoid dynamic import issues
import Dashboard from './pages/Dashboard';
const RealTimeAdminDashboard = lazy(() => import('./pages/RealTimeAdminDashboard'));
import AdminDashboard from './components/AdminDashboard';
const FAQ = lazy(() => import('./pages/FAQ'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));

import './index.css';

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
      gcTime: 30 * 60 * 1000, // 30 minutes - increased for better caching
      retry: 1, // Reduced retries for faster failure handling
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent unnecessary refetches
      refetchOnReconnect: false, // Prevent refetch on reconnect
    },
    mutations: {
      retry: 1, // Reduced retries for mutations
    },
  },
});

// Component to handle redirects from landing page
function RedirectHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect');
    if (redirectPath) {
      sessionStorage.removeItem('redirect');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);
  
  return null;
}

function App() {
  // Global error handler for message channel errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Suppress "message channel closed" errors as they're typically from browser extensions
      if (event.message && (
        event.message.includes('message channel closed') ||
        event.message.includes('listener indicated an asynchronous response')
      )) {
        event.preventDefault();
        event.stopPropagation();
        console.warn('Suppressed browser extension error:', event.message);
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress "message channel closed" promise rejections
      if (event.reason && event.reason.message && (
        event.reason.message.includes('message channel closed') ||
        event.reason.message.includes('listener indicated an asynchronous response')
      )) {
        event.preventDefault();
        event.stopPropagation();
        console.warn('Suppressed browser extension promise rejection:', event.reason.message);
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
            <ErrorBoundary>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <RedirectHandler />
                <AuthProvider>
                  <ThemeProvider>
              <div className="App">
                <Suspense fallback={<FullPageLoading text="Loading RideShare SA..." />}>
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/home" element={<Layout><Home /></Layout>} />
                        <Route path="/search" element={<Layout><Search /></Layout>} />
                        <Route path="/vehicle/:id" element={<Layout><VehicleDetail /></Layout>} />
                        <Route path="/checkout/:listingId" element={
                          <ProtectedRoute>
                            <Layout><UnifiedCheckout /></Layout>
                          </ProtectedRoute>
                        } />
                        <Route path="/about" element={<Layout><About /></Layout>} />
                        <Route path="/contact" element={<Layout><Contact /></Layout>} />
                        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
                        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/register" element={<Signup />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/dashboard/*" element={
                          <ProtectedRoute>
                            <Layout><Dashboard /></Layout>
                          </ProtectedRoute>
                        } />
                        <Route path="/admin-dashboard/*" element={
                          <AdminProtectedRoute>
                            <AdminDashboard />
                          </AdminProtectedRoute>
                        } />
                        <Route path="/legacy-admin-dashboard" element={<RealTimeAdminDashboard />} />
                        <Route path="*" element={<Layout><NotFound /></Layout>} />
                      </Routes>
                    </Suspense>
                  </div>
                </ThemeProvider>
              </AuthProvider>
              </Router>
            </ErrorBoundary>
        </ToastProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
