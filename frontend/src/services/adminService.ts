import { auth } from '../config/firebase';

export interface AdminStats {
  overview: {
    totalUsers: number;
    pendingUsers: number;
    totalVehicles: number;
    pendingVehicles: number;
    totalBookings: number;
    pendingBookings: number;
    totalRevenue: number;
  };
  recentActivity: {
    recentUsers: any[];
    recentVehicles: any[];
  };
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  documentStatus: 'pending' | 'approved' | 'rejected';
  phoneNumber?: string;
  createdAt: string;
}

export interface AdminVehicle {
  id: number;
  title: string;
  make: string;
  model: string;
  year: number;
  status: string;
  location: string;
  pricePerDay: number;
  images?: string[];
  owner?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  declineReason?: string;
}

export class AdminService {
  // Use getApiBaseUrl for consistent API URL handling
  private static getBaseUrl(): string {
    if (import.meta.env.DEV) {
      return '/api/admin';  // Uses Vite proxy to http://localhost:5001/api/admin
    }
    // Dynamic import to avoid circular dependency
    const apiConfig = require('../utils/apiConfig');
    return `${apiConfig.getApiBaseUrl()}/admin`;
  }
  
  private static get baseUrl(): string {
    return this.getBaseUrl();
  }

  private static async getAuthToken(): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Failed to get authentication token');
    }
  }

  static async getStats(): Promise<AdminStats> {
    try {
      const token = await this.getAuthToken();
      
      // Backend exposes GET /admin/dashboard-stats
      const response = await fetch(`${this.baseUrl}/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      const data = await response.json();
      // Backend returns { success: true, data: { ...stats } }
      return data.data || data.stats || data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  static async getUsers(page = 1, limit = 10, status?: string, role?: string) {
    try {
      const token = await this.getAuthToken();
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(role && { role })
      });

      const response = await fetch(`${this.baseUrl}/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async approveUser(userId: number, status: 'approved' | 'rejected', reason?: string) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/users/${userId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async getPendingListings() {
    try {
      const token = await this.getAuthToken();
      console.log('Fetching pending listings from:', `${this.baseUrl}/pending-listings`);
      const response = await fetch(`${this.baseUrl}/pending-listings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Pending listings response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch pending listings:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || errorData.message || 'Failed to fetch pending listings');
      }

      const data = await response.json();
      console.log('Pending listings response data:', data);
      return data.data || data || [];
    } catch (error: any) {
      console.error('Error fetching pending listings:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  static async getVehicles(page = 1, limit = 10, status?: string) {
    try {
      const token = await this.getAuthToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });

      const response = await fetch(`${this.baseUrl}/vehicles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  static async approveListing(listingId: number, status: 'approved' | 'rejected', reason?: string) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/listings/${listingId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update listing status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  static async approveVehicle(vehicleId: number, status: 'approved' | 'declined', reason?: string) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  static async getBookings(page = 1, limit = 10, status?: string) {
    try {
      const token = await this.getAuthToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });

      const response = await fetch(`${this.baseUrl}/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  static async getReviews(page = 1, limit = 10) {
    try {
      const token = await this.getAuthToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${this.baseUrl}/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  static async getDocuments(page = 1, limit = 10, status?: string) {
    try {
      const token = await this.getAuthToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });

      const response = await fetch(`${this.baseUrl}/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  static async getDisputes(page = 1, limit = 10, status?: string) {
    try {
      const token = await this.getAuthToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });

      const response = await fetch(`${this.baseUrl}/disputes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching disputes:', error);
      throw error;
    }
  }

  static async approveBooking(bookingId: string, status: 'approved' | 'declined', reason?: string) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }
}
