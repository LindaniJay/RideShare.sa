import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Car, 
  User, 
  DollarSign, 
  Download, 
  TrendingUp,
  Users,
  Activity,
  Calendar,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';
import { useAuth } from '../context/AuthContext';

interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  price_per_day: number;
  location: any;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  images: string[];
  features: string[];
  host: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    is_verified?: boolean;
  };
  created_at: string;
  updated_at?: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'renter' | 'host' | 'admin';
  is_verified: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  last_login_at?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalHosts: number;
  totalListings?: number;
  totalVehicles: number;
  pendingListings?: number;
  pendingVehicles: number;
  approvedVehicles: number;
  rejectedVehicles: number;
  totalBookings: number;
  pendingBookings?: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageBookingValue: number;
  userGrowthRate: number;
  vehicleGrowthRate: number;
  bookingGrowthRate: number;
}

interface AdminStatsOverview {
  totalUsers?: number;
  pendingUsers?: number;
  totalListings?: number;
  totalVehicles?: number;
  pendingVehicles?: number;
  pendingListings?: number;
  totalBookings?: number;
  pendingBookings?: number;
  activeBookings?: number;
  totalRevenue?: number;
}

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'users' | 'bookings' | 'analytics' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalHosts: 0,
    totalListings: 0,
    totalVehicles: 0,
    pendingListings: 0,
    pendingVehicles: 0,
    approvedVehicles: 0,
    rejectedVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageBookingValue: 0,
    userGrowthRate: 0,
    vehicleGrowthRate: 0,
    bookingGrowthRate: 0
  });

  // Filter states
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch pending listings for approval
      try {
        const { AdminService } = await import('../services/adminService');
        const listingsData = await AdminService.getPendingListings();
        console.log('Pending listings data:', listingsData);
        
        if (listingsData && Array.isArray(listingsData) && listingsData.length > 0) {
          // Transform listings to vehicles format
          const transformedVehicles = listingsData.map((listing: any) => ({
            id: listing.id.toString(),
            title: `${listing.make} ${listing.model} ${listing.year}`,
            make: listing.make,
            model: listing.model,
            year: listing.year,
            vehicle_type: listing.vehicle_type || listing.type || 'car',
            price_per_day: listing.price_per_day || listing.pricePerDay || 0,
            location: listing.location || { city: listing.city || 'Unknown' },
            status: listing.status || 'pending',
            rejection_reason: listing.rejection_reason,
            images: listing.images ? (Array.isArray(listing.images) ? listing.images : [listing.images]) : (listing.image ? [listing.image] : []),
            features: listing.features ? (Array.isArray(listing.features) ? listing.features : JSON.parse(listing.features || '[]')) : [],
            host: listing.host ? {
              id: listing.host.id.toString(),
              first_name: listing.host.firstName || listing.host.first_name,
              last_name: listing.host.lastName || listing.host.last_name,
              email: listing.host.email,
              phone: listing.host.phone_number || listing.host.phone,
              is_verified: listing.host.isVerified || listing.host.is_verified || false
            } : {
              id: '0',
              first_name: 'Unknown',
              last_name: 'Host',
              email: 'unknown@example.com',
              is_verified: false
            },
            created_at: listing.createdAt || listing.created_at || new Date().toISOString(),
            updated_at: listing.updatedAt || listing.updated_at
          }));
          setVehicles(transformedVehicles);
          console.log(`✅ Loaded ${transformedVehicles.length} pending vehicles`);
        } else {
          console.log('No pending listings found or empty array');
          setVehicles([]);
        }
      } catch (error: any) {
        console.error('Error fetching pending listings:', error);
        console.error('Error details:', error);
        toast.error(error.message || 'Failed to load pending listings');
        setVehicles([]); // Set empty array on error
      }

      // Fetch dashboard stats using AdminService
      try {
        const { AdminService } = await import('../services/adminService');
        const statsInfo = await AdminService.getStats();
        if (statsInfo) {
          // Handle both response structures
          const overview: AdminStatsOverview = statsInfo.overview || statsInfo || {};
          const totalListings = overview.totalListings ?? 0;
          const pendingListings = overview.pendingListings ?? 0;
          const totalBookings = overview.totalBookings ?? 0;
          const totalRevenue = overview.totalRevenue ?? 0;
          setStats({
            totalUsers: overview.totalUsers || 0,
            totalHosts: 0, // Will calculate from users
            totalListings,
            totalVehicles: totalListings || overview.totalVehicles || 0,
            pendingListings,
            pendingVehicles: pendingListings || overview.pendingVehicles || 0,
            approvedVehicles: 0, // Calculate from vehicles array
            rejectedVehicles: 0, // Calculate from vehicles array
            totalBookings,
            activeBookings: overview.activeBookings || overview.pendingBookings || 0,
            totalRevenue,
            monthlyRevenue: 0, // Calculate from revenue data
            averageBookingValue: totalBookings > 0 && totalRevenue > 0 
              ? totalRevenue / totalBookings 
              : 0,
            userGrowthRate: 0, // Would need historical data
            vehicleGrowthRate: 0, // Would need historical data
            bookingGrowthRate: 0 // Would need historical data
          });
        }
      } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        toast.error(error.message || 'Failed to load dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle vehicle approval/rejection
  const handleVehicleAction = async (vehicleId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const { AdminService } = await import('../services/adminService');
      
      // Use AdminService to approve listing
      const response = await AdminService.approveListing(
        parseInt(vehicleId), 
        action === 'approve' ? 'approved' : 'rejected',
        reason
      );

      if (response.success !== false) {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        
        setShowApprovalModal(false);
        setSelectedVehicle(null);
        setRejectionReason('');
        
        toast.success(`Vehicle ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        fetchDashboardData(); // Refresh stats
      } else {
        toast.error(response.error || 'Failed to update vehicle status');
      }
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      toast.error('Error updating vehicle status');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('AdminDashboard: Starting logout process');
      await logout();
      console.log('AdminDashboard: Logout successful, navigating to home');
      // Force navigation to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if logout fails, try to navigate away
      window.location.href = '/';
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <GlassButton 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </GlassButton>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/70">Welcome back, {user?.name || user?.email || 'Admin'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <GlassButton 
            variant="outline" 
            onClick={fetchDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </GlassButton>
          <GlassButton variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </GlassButton>
          <GlassButton>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </GlassButton>
          <GlassButton 
            variant="outline"
            onClick={handleLogout}
            className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Exit Admin
          </GlassButton>
        </div>
      </div>

      {/* Navigation Tabs */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="flex border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'vehicles', label: 'Vehicles', icon: Car },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
                    <p className="text-white/60 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-green-400 text-xs">+{stats.userGrowthRate}% this month</p>
            </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
                    <p className="text-white/60 text-sm">Total Vehicles</p>
                    <p className="text-2xl font-bold text-white">{stats.totalVehicles}</p>
                    <p className="text-green-400 text-xs">+{stats.vehicleGrowthRate}% this month</p>
            </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
                    <p className="text-white/60 text-sm">Active Bookings</p>
                    <p className="text-2xl font-bold text-white">{stats.activeBookings}</p>
                    <p className="text-green-400 text-xs">+{stats.bookingGrowthRate}% this month</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
                    <p className="text-white/60 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">R{stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-green-400 text-xs">+12.5% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Pending Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Pending Vehicle Approvals</h3>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                    {stats.pendingVehicles} pending
                  </span>
                </div>
                <div className="space-y-3">
                  {vehicles.slice(0, 3).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{vehicle.title}</p>
                          <p className="text-white/60 text-sm">{vehicle.host.first_name} {vehicle.host.last_name}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setApprovalAction('approve');
                            setShowApprovalModal(true);
                          }}
                          className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setApprovalAction('reject');
                            setShowApprovalModal(true);
                          }}
                          className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {vehicles.length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-white/70">No pending vehicle approvals</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <Activity className="w-5 h-5 text-white/60" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">Vehicle "Toyota Corolla" approved</p>
                      <p className="text-white/60 text-xs">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">New user registration</p>
                      <p className="text-white/60 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">New booking created</p>
                      <p className="text-white/60 text-xs">10 minutes ago</p>
            </div>
          </div>
          </div>
        </GlassCard>
      </div>
          </motion.div>
        )}

        {activeTab === 'vehicles' && (
          <motion.div
            key="vehicles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Vehicle Filters */}
      <GlassCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <GlassInput
                    placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              icon="Search"
            />
          </div>
          <div className="flex gap-2">
                  {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setVehicleFilter(filter as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        vehicleFilter === filter
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
                  ))}
          </div>
        </div>
      </GlassCard>

            {/* Vehicles Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Vehicle</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Host</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Price</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Status</th>
                      <th className="px-6 py-4 text-left text-white/60 font-medium">Created</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
                    {vehicles.map((vehicle) => (
                <motion.tr
                        key={vehicle.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-white/60" />
                      </div>
                      <div>
                              <p className="text-white font-medium">{vehicle.title}</p>
                              <p className="text-white/60 text-sm">{vehicle.year} • {vehicle.vehicle_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                            <p className="text-white font-medium">{vehicle.host.first_name} {vehicle.host.last_name}</p>
                            <p className="text-white/60 text-sm">{vehicle.host.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                          <p className="text-white font-medium">R{vehicle.price_per_day}</p>
                      <p className="text-white/60 text-sm">per day</p>
                  </td>
                  <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'approved' ? 'text-green-400 bg-green-500/20' :
                            vehicle.status === 'rejected' ? 'text-red-400 bg-red-500/20' :
                            'text-yellow-400 bg-yellow-500/20'
                          }`}>
                            {vehicle.status}
                          </span>
                  </td>
                  <td className="px-6 py-4">
                          <p className="text-white/80 text-sm">{new Date(vehicle.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                                setSelectedVehicle(vehicle);
                                // Show vehicle details in a simple alert for now
                                alert(`Vehicle: ${vehicle.title}\nHost: ${vehicle.host.first_name} ${vehicle.host.last_name}\nPrice: R${vehicle.price_per_day}/day\nStatus: ${vehicle.status}`);
                        }}
                        className="w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Eye className="w-4 h-4 text-blue-400" />
                      </button>
                            {vehicle.status === 'pending' && (
                        <>
                          <button
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setApprovalAction('approve');
                                    setShowApprovalModal(true);
                                  }}
                            className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setApprovalAction('reject');
                                    setShowApprovalModal(true);
                                  }}
                            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

              {vehicles.length === 0 && (
          <div className="p-12 text-center">
            <Car className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No vehicles found</h3>
                  <p className="text-white/60">No vehicles match your current filters</p>
          </div>
        )}
      </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {approvalAction === 'approve' ? 'Approve Vehicle' : 'Reject Vehicle'}
              </h3>
              
              <div className="mb-4">
                <p className="text-white/70 mb-2">
                  {approvalAction === 'approve' 
                    ? `Are you sure you want to approve "${selectedVehicle.title}"?`
                    : `Are you sure you want to reject "${selectedVehicle.title}"?`
                  }
                </p>
                
                {approvalAction === 'reject' && (
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Rejection Reason (Optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                      <button
                        onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedVehicle(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVehicleAction(selectedVehicle.id, approvalAction, rejectionReason)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    approvalAction === 'approve'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                      </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
