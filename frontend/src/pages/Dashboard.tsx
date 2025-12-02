import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RealTimeAdminDashboard from './RealTimeAdminDashboard';
import RenterDashboard from './RenterDashboard';
import ModernHostDashboard from '../components/ModernHostDashboard';
import AdminQuickActions from '../components/admin/AdminQuickActions';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<'renter' | 'host' | 'admin'>('renter');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determine user's actual role - handle case sensitivity
  const userRole = user?.role?.toLowerCase() as 'renter' | 'host' | 'admin';
  const isAdmin = userRole === 'admin' || user?.role?.toLowerCase() === 'admin';

  // Determine which dashboard to show based on URL path
  const getDashboardType = () => {
    const path = location.pathname;
    if (path.includes('/host')) return 'host';
    if (path.includes('/renter')) return 'renter';
    if (path.includes('/admin')) return 'admin';
    return userRole || 'renter'; // fallback to user role
  };

  const dashboardType = getDashboardType();

  // Initialize active role based on current URL or user role
  React.useEffect(() => {
    if (!user) return; // Wait for user to load
    
    if (isAdmin) {
      const path = location.pathname;
      if (path.includes('/admin')) {
        setActiveRole('admin');
      } else if (path.includes('/host')) {
        setActiveRole('host');
      } else if (path.includes('/renter')) {
        setActiveRole('renter');
      } else {
        // Default to user's actual role
        setActiveRole(userRole || 'renter');
      }
    } else {
      // Non-admin users should be redirected if they try to access admin routes
      if (location.pathname.includes('/admin')) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, isAdmin, userRole, navigate, user]);

  // Prevent rendering if user is not loaded yet
  if (!user) {
    return (
      <div className="page-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Admin can switch between different role views
  const handleRoleSwitch = (role: 'renter' | 'host' | 'admin') => {
    setIsTransitioning(true);
    setActiveRole(role);
    // Update URL to reflect the role switch
    if (role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } else {
      navigate(`/dashboard/${role}`, { replace: true });
    }
    // Reset transition state after a short delay
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="page-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300 text-sm lg:text-base">Welcome to your dashboard!</p>
          
          {/* Role Switcher - Only for Admin users */}
          {isAdmin && (
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-2">
              <button
                onClick={() => handleRoleSwitch('renter')}
                className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                  activeRole === 'renter'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Renter View
              </button>
              <button
                onClick={() => handleRoleSwitch('host')}
                className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                  activeRole === 'host'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Host View
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                  activeRole === 'admin'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Admin Panel
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {isTransitioning ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Switching dashboard...</span>
            </div>
          ) : isAdmin ? (
            // Admin users can switch between views
            <>
              {activeRole === 'renter' && <RenterDashboard />}
              {activeRole === 'host' && <ModernHostDashboard />}
              {activeRole === 'admin' && (
                <div className="space-y-6">
                  <AdminQuickActions />
                  <RealTimeAdminDashboard />
                </div>
              )}
            </>
          ) : (
            // Regular users see dashboard based on URL path or their role
            <>
              {dashboardType === 'renter' && <RenterDashboard />}
              {dashboardType === 'host' && <ModernHostDashboard />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;