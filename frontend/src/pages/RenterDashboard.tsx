import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/apiConfig';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import StatusBadge from '../components/StatusBadge';
import OptimizedImage from '../components/OptimizedImage';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { containerVariants, itemVariants, dashboardCardVariants } from '../utils/motionVariants';
import { toast } from 'react-hot-toast';
// Icons are handled by the Icon component

// Import components directly to avoid dynamic import issues
import DocumentUpload from '../components/DocumentUpload';
import SavedVehicles from '../components/SavedVehicles';
import DocumentExpiryReminder from '../components/DocumentExpiryReminder';
import Promotions from '../components/Promotions';
import RentalCalculator from '../components/RentalCalculator';
import RealTimeMessaging from '../components/RealTimeMessaging';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ProfileSettings from '../components/ProfileSettings';
import ApprovalRequests from '../components/ApprovalRequests';
import ApprovalRequestForm from '../components/ApprovalRequestForm';

// Booking interface
interface Booking {
  id: number;
  renterId: number;
  listingId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: number;
    make: string;
    model: string;
    year: number;
    pricePerDay: number;
    image: string;
    city: string;
    host?: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
  };
}

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'stripe' | 'payfast';
  bookingId: string;
  createdAt: string;
}

const RenterDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalFormType, setApprovalFormType] = useState<'DocumentVerification' | 'ProfileVerification' | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchDashboardData();
      
      // Set up polling for real-time updates every 30 seconds
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000);
      
      // Listen for booking updates
      const handleBookingCreated = (event?: CustomEvent) => {
        fetchDashboardData();
        if (event?.detail?.booking) {
          toast.success('New booking confirmed!');
        }
      };
      
      const handleBookingUpdated = () => {
        fetchDashboardData();
      };
      
      window.addEventListener('bookingCreated', handleBookingCreated as EventListener);
      window.addEventListener('bookingUpdated', handleBookingUpdated);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('bookingCreated', handleBookingCreated as EventListener);
        window.removeEventListener('bookingUpdated', handleBookingUpdated);
      };
    }
  }, [user?.uid]);

  const fetchDashboardData = async () => {
    try {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Get user's Firebase token
      const token = await user.getIdToken();
      const API_BASE_URL = getApiBaseUrl();
      
      // Fetch bookings from unified endpoint (returns bookings where user is renter or host)
      const response = await fetch(`${API_BASE_URL}/bookings/unified?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      const data = await response.json();
      
      if (data.success) {
        // Filter to only show bookings where user is the renter
        const renterBookings = (data.data || []).filter((booking: any) => {
          // Check if booking.renterId matches user.id (UUID) or if renter object exists
          return booking.renterId === user.id || 
                 booking.renter?.id === user.id ||
                 String(booking.renterId) === String(user.id);
        });
        
        setBookings(renterBookings);
        
        // Convert bookings to payments for display
        const bookingPayments = renterBookings.map((booking: any) => ({
          id: `payment_${booking.id}`,
          amount: booking.totalPrice || booking.total_price || 0,
          status: (booking.paymentStatus === 'paid' || booking.payment_status === 'paid' ? 'completed' : 'pending') as 'pending' | 'completed' | 'failed' | 'refunded',
          method: (booking.paymentMethod || booking.payment_method || 'stripe') as 'stripe' | 'payfast',
          bookingId: booking.bookingId || booking.booking_id || booking.id.toString(),
          createdAt: booking.createdAt || booking.created_at
        }));
        setPayments(bookingPayments);
      } else {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.message || 'Failed to load dashboard data');
      setBookings([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch additional data for different tabs
  const fetchTabData = async (tab: string) => {
    if (!user?.uid) return;
    
    try {
      const token = await user.getIdToken();
      const API_BASE_URL = getApiBaseUrl();
      
      switch (tab) {
        case 'payments':
          // Fetch payment history
          const paymentsResponse = await fetch(`${API_BASE_URL}/payments/user/${user.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            if (paymentsData.success) {
              setPayments(paymentsData.data || []);
            }
          }
          break;
          
        case 'notifications':
          // Fetch notifications
          const notificationsResponse = await fetch(`${API_BASE_URL}/notifications`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (notificationsResponse.ok) {
            const notificationsData = await notificationsResponse.json();
            // Handle notifications data
            console.log('Notifications:', notificationsData.data);
          }
          break;
          
        case 'support':
          // Fetch support tickets
          const supportResponse = await fetch(`${API_BASE_URL}/support/tickets`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (supportResponse.ok) {
            const supportData = await supportResponse.json();
            // Handle support tickets
            console.log('Support tickets:', supportData.data);
          }
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleSubmitApprovalRequest = (type: 'DocumentVerification' | 'ProfileVerification') => {
    setApprovalFormType(type);
    setShowApprovalForm(true);
  };

  const handleApprovalSuccess = () => {
    setShowApprovalForm(false);
    setApprovalFormType(null);
    // Optionally refresh data or show success message
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      if (!user?.uid) return;
      
      const token = await user.getIdToken();
      const API_BASE_URL = getApiBaseUrl();
      
      // Use unified endpoint for cancellation
      const response = await fetch(`${API_BASE_URL}/bookings/unified/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Booking cancelled successfully');
        fetchDashboardData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to cancel booking');
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchTabData(tab);
  };

  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart' },
    { id: 'account', label: 'Account', icon: 'User' },
    { id: 'search', label: 'Search & Browse', icon: 'Search' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'payments', label: 'Payments', icon: 'CreditCard' },
    { id: 'communication', label: 'Messages', icon: 'MessageCircle' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'saved', label: 'Saved', icon: 'Heart' },
    { id: 'calculator', label: 'Calculator', icon: 'Calculator' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'promotions', label: 'Promotions', icon: 'Gift' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'support', label: 'Support', icon: 'HelpCircle' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
    { id: 'approvals', label: 'Approval Requests', icon: 'Clock' },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="page-background">
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-green-800/20 to-green-700/20 backdrop-blur-sm"></div>
      <motion.div 
        className="relative min-h-screen p-4 lg:p-8 space-y-6 lg:space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
      {/* Hero Header */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-6 lg:space-y-0"
        variants={itemVariants}
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white font-heading text-shadow-lg">Renter Dashboard</h1>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-white/80 text-lg font-body">Welcome back, {user?.name || 'User'}!</p>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                ✓ Verified
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Real-time notifications component would go here */}
          <GlassButton
            onClick={() => navigate('/search')}
            variant="primary"
            size="md"
            icon={<Icon name="Search" size="sm" />}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Find Vehicles</span>
            <span className="sm:hidden">Search</span>
          </GlassButton>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        className="flex flex-wrap gap-2"
        variants={itemVariants}
      >
        {navigationTabs.map((tab, index) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassButton
              onClick={() => handleTabChange(tab.id)}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              size="sm"
              icon={<Icon name={tab.icon} size="sm" />}
              className={activeTab === tab.id ? 'shadow-glow' : ''}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </GlassButton>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <motion.div 
          variants={dashboardCardVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard
            level={3}
            hover
            animated
            className="relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Icon name="Car" size="lg" className="text-green-400" />
                </div>
                <span className="text-xs text-green-400 font-medium">+12%</span>
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1">Active Bookings</h3>
              <div className="text-3xl font-bold text-white mb-1 font-heading">{activeBookings.length}</div>
              <p className="text-white/60 text-xs">Current rentals</p>
            </div>
          </GlassCard>
        </motion.div>
        
        <motion.div 
          variants={dashboardCardVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard
            level={3}
            hover
            animated
            className="relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Icon name="DollarSign" size="lg" className="text-green-400" />
                </div>
                <span className="text-xs text-green-400 font-medium">+8%</span>
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1">Wallet Balance</h3>
              <div className="text-3xl font-bold text-white mb-1 font-heading">R{totalSpent.toLocaleString()}</div>
              <p className="text-white/60 text-xs">Available funds</p>
            </div>
          </GlassCard>
        </motion.div>
        
        <motion.div 
          variants={dashboardCardVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard
            level={3}
            hover
            animated
            className="relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <Icon name="Heart" size="lg" className="text-red-400" />
                </div>
                <span className="text-xs text-red-400 font-medium">+3</span>
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1">Favorites</h3>
              <div className="text-3xl font-bold text-white mb-1 font-heading">0</div>
              <p className="text-white/60 text-xs">Saved vehicles</p>
            </div>
          </GlassCard>
        </motion.div>
        
        <motion.div 
          variants={dashboardCardVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard
            level={3}
            hover
            animated
            className="relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Icon name="MessageCircle" size="lg" className="text-purple-400" />
                </div>
                <span className="text-xs text-purple-400 font-medium">2</span>
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1">Messages</h3>
              <div className="text-3xl font-bold text-white mb-1 font-heading">0</div>
              <p className="text-white/60 text-xs">Unread messages</p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
              variants={itemVariants}
            >
              <motion.div variants={dashboardCardVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  title="Active Bookings"
                  subtitle="Current rentals"
                  icon={<Icon name="Car" size="md" className="text-primary-400" />}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-white mb-2 font-heading">{activeBookings.length}</div>
                  <div className="text-white/70 text-sm font-body">Active now</div>
                </GlassCard>
              </motion.div>
              
              <motion.div variants={dashboardCardVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  title="Total Spent"
                  subtitle="All time spending"
                  icon={<Icon name="DollarSign" size="md" className="text-accent-400" />}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-white mb-2 font-heading">R{totalSpent.toLocaleString()}</div>
                  <div className="text-white/70 text-sm font-body">Lifetime total</div>
                </GlassCard>
              </motion.div>
              
              <motion.div variants={dashboardCardVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  title="Saved Vehicles"
                  subtitle="Your favorites"
                  icon={<Icon name="Heart" size="md" className="text-red-400" />}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-white mb-2 font-heading">0</div>
                  <div className="text-white/70 text-sm font-body">Saved vehicles</div>
                </GlassCard>
              </motion.div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              variants={itemVariants}
            >
              <motion.div variants={dashboardCardVariants}>
                <GlassCard 
                  level={3}
                  hover
                  animated
                  title="Recent Bookings" 
                  icon={<Icon name="Calendar" size="md" className="text-primary-400" />}
                >
                  <div className="space-y-3">
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Icon name="Calendar" size="lg" className="text-white/50 mx-auto mb-4" />
                        <p className="text-white/70">No bookings yet</p>
                        <p className="text-white/50 text-sm">Start by searching for vehicles</p>
                      </div>
                    ) : (
                      bookings.slice(0, 3).map((booking, index) => (
                        <motion.div 
                          key={booking.id} 
                          className="flex items-center space-x-3 p-3 glass-2 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <OptimizedImage 
                            src={booking.listing?.image || '/placeholder-car.jpg'}
                            alt={`${booking.listing?.make} ${booking.listing?.model}`}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-medium font-body">
                              {booking.listing?.make} {booking.listing?.model} ({booking.listing?.year})
                            </h4>
                            <p className="text-white/70 text-sm font-body">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-white/60 text-xs font-body">
                              R{booking.totalPrice} • {booking.listing?.city}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <StatusBadge status={booking.status} />
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div variants={dashboardCardVariants}>
                <GlassCard 
                  level={3}
                  hover
                  animated
                  title="Quick Actions" 
                  icon={<Icon name="Zap" size="md" className="text-accent-400" />}
                >
                  <div className="space-y-3">
                    <GlassButton
                      onClick={() => navigate('/search')}
                      variant="primary"
                      size="md"
                      icon={<Icon name="Search" size="sm" />}
                      className="w-full"
                    >
                      Search Vehicles
                    </GlassButton>
                    <GlassButton
                      onClick={() => setActiveTab('calculator')}
                      variant="accent"
                      size="md"
                      icon={<Icon name="Calculator" size="sm" />}
                      className="w-full"
                    >
                      Calculate Rental Cost
                    </GlassButton>
                    <GlassButton
                      onClick={() => setActiveTab('saved')}
                      variant="secondary"
                      size="md"
                      icon={<Icon name="Heart" size="sm" />}
                      className="w-full"
                    >
                      View Saved Vehicles
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <ProfileSettings />
        )}

        {/* Search & Browse Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <GlassCard title="Vehicle Search & Discovery" icon="Search">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="Enter city or area"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Vehicle Type</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">All Types</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="convertible">Convertible</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigate('/search')}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Search Vehicles
                </button>
              </div>
            </GlassCard>

            <GlassCard title="Browse by Category" icon="Grid">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Economy', 'Luxury', 'SUV', 'Convertible'].map((category) => (
                  <button
                    key={category}
                    onClick={() => navigate('/search')}
                    className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center"
                  >
                    <Icon name="Car" size="lg" className="mx-auto mb-2 text-green-400" />
                    <span className="text-white font-medium">{category}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <GlassCard title="Booking Management" icon="Calendar">
              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="Calendar" size="lg" className="text-white/50 mx-auto mb-4" />
                    <p className="text-white/70">No bookings yet</p>
                    <p className="text-white/50 text-sm">Start by searching for vehicles</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{booking.listing?.make} {booking.listing?.model}</h4>
                        <p className="text-white/70 text-sm">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={booking.status} />
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
            
            {/* Workflow Tracker for Active Bookings */}
            {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length > 0 && (
              <GlassCard title="Booking Workflow Status" icon="Clock">
                <div className="space-y-4">
                  {bookings
                    .filter(b => b.status === 'pending' || b.status === 'confirmed')
                    .slice(0, 2) // Show max 2 active bookings
                    .map((booking) => (
                      <div key={booking.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <OptimizedImage 
                            src={'/placeholder-car.jpg'}
                            alt={'Vehicle'}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="text-white font-medium">Vehicle</h4>
                            <p className="text-white/70 text-sm">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-center py-4">
                          <p className="text-white/70 text-sm">Booking workflow tracker would be implemented here</p>
                        </div>
                      </div>
                    ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <GlassCard title="Payment Methods" icon="CreditCard">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Stripe Payment</h4>
                    <p className="text-white/70 text-sm mb-3">Secure credit card processing</p>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Setup Stripe
                    </button>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Payfast</h4>
                    <p className="text-white/70 text-sm mb-3">South African payment gateway</p>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Setup Payfast
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
            <GlassCard title="Payment History" icon="CreditCard">
              <div className="space-y-3">
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="CreditCard" size="lg" className="text-white/50 mx-auto mb-4" />
                    <p className="text-white/70">No payment history</p>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">R{payment.amount}</p>
                        <p className="text-white/70 text-sm">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={payment.status} />
                        <p className="text-white/70 text-sm capitalize">{payment.method}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <RealTimeMessaging />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {/* Saved Vehicles Tab */}
        {activeTab === 'saved' && (
          <SavedVehicles userId={user?.id || '0'} />
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <GlassCard title="Rental Cost Calculator" icon="Calculator">
              <RentalCalculator 
                basePrice={500}
                onCalculate={(total, breakdown) => {
                  console.log('Calculated total:', total, breakdown);
                }}
              />
            </GlassCard>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentUpload 
              label="Upload Document"
              name="document"
              onChange={() => {}}
            />
            <DocumentExpiryReminder userId={user?.id || '0'} />
            
            {/* Document Verification Request */}
            <GlassCard title="Document Verification" icon="FileText">
              <div className="space-y-4">
                <p className="text-white/70 text-sm">
                  Submit your documents for verification to access premium features and improve your booking success rate.
                </p>
                <button
                  onClick={() => handleSubmitApprovalRequest('DocumentVerification')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Icon name="Upload" size="sm" />
                  <span>Request Document Verification</span>
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <Promotions userId={user?.id || '0'} />
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <GlassCard title="Booking Reports" icon="FileText">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Monthly Summary</h4>
                    <p className="text-white/70 text-sm mb-3">View your monthly booking activity and spending</p>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Generate Report
                    </button>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Annual Report</h4>
                    <p className="text-white/70 text-sm mb-3">Complete yearly booking and spending analysis</p>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard title="Spending Analysis" icon="TrendingUp">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">R{totalSpent.toLocaleString()}</div>
                    <div className="text-white/70 text-sm">Total Spent</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">{bookings.length}</div>
                    <div className="text-white/70 text-sm">Total Bookings</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">R{bookings.length > 0 ? (totalSpent / bookings.length).toFixed(0) : 0}</div>
                    <div className="text-white/70 text-sm">Avg per Booking</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <GlassCard title="Notification Settings" icon="Bell">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Booking Updates</h4>
                    <p className="text-white/70 text-sm">Get notified when your booking status changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Promotional Offers</h4>
                    <p className="text-white/70 text-sm">Receive notifications about special deals and discounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">System Updates</h4>
                    <p className="text-white/70 text-sm">Important platform updates and maintenance notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <GlassCard title="Help Center" icon="HelpCircle">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">FAQ</h4>
                    <p className="text-white/70 text-sm mb-3">Find answers to common questions</p>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Browse FAQ
                    </button>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Contact Support</h4>
                    <p className="text-white/70 text-sm mb-3">Get help from our support team</p>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Open Ticket
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard title="Support Tickets" icon="MessageSquare">
              <div className="space-y-3">
                <div className="text-center py-8">
                  <Icon name="MessageSquare" size="lg" className="text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">No support tickets yet</p>
                  <p className="text-white/50 text-sm">Create a ticket if you need help</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <GlassCard title="Account Settings" icon="Settings">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white/50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+27 XX XXX XXXX"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Preferred Language</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="en">English</option>
                      <option value="af">Afrikaans</option>
                      <option value="zu">Zulu</option>
                      <option value="xh">Xhosa</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard title="Privacy & Security" icon="Shield">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                    <p className="text-white/70 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Enable 2FA
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Data Export</h4>
                    <p className="text-white/70 text-sm">Download a copy of your data</p>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Export Data
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Approval Requests Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <ApprovalRequests userRole="renter" />
            
            {/* Profile Verification Request */}
            <GlassCard title="Profile Verification" icon="User">
              <div className="space-y-4">
                <p className="text-white/70 text-sm">
                  Get your profile verified to build trust with hosts and increase your booking success rate.
                </p>
                <button
                  onClick={() => handleSubmitApprovalRequest('ProfileVerification')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Icon name="UserCheck" size="sm" />
                  <span>Request Profile Verification</span>
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Approval Request Form Modal */}
      {showApprovalForm && approvalFormType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <ApprovalRequestForm
              requestType={approvalFormType}
              entityId={parseInt(user?.id || '0')}
              submittedBy="renter"
              onSuccess={handleApprovalSuccess}
              onCancel={() => {
                setShowApprovalForm(false);
                setApprovalFormType(null);
              }}
            />
          </div>
        </div>
      )}
      </motion.div>
    </div>
  );
};

export default RenterDashboard;
