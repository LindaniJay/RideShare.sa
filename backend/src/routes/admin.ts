import express from 'express';
import { Op } from 'sequelize';
import { authenticateAdmin } from '../middleware/adminAuth';
// Op import for Sequelize operators
import { Listing, Booking, User, Notification } from '../models';
import { setAdminCustomClaims } from '../config/firebase';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/admin/dashboard-stats - Get admin dashboard statistics
router.get('/dashboard-stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalListings = await Listing.count();
    const totalBookings = await Booking.count();
    const pendingListings = await Listing.count({ where: { status: 'pending' } });
    
    // Count active bookings using Sequelize Op operator
    const activeBookings = await Booking.count({ 
      where: { 
        status: { [Op.in]: ['confirmed', 'active', 'pending'] }
      } 
    });
    
    // Calculate total revenue from completed bookings with paid status
    const revenueResult = await Booking.findOne({
      where: { 
        paymentStatus: 'paid',
        status: { [Op.in]: ['completed', 'confirmed'] }
      },
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('total_price')), 'totalRevenue']
      ],
      raw: true
    });
    
    const totalRevenue = (revenueResult as any)?.totalRevenue || 0;

    // Count pending users (handle case where approval_status might not exist)
    let pendingUsers = 0;
    try {
      pendingUsers = await User.count({ where: { approval_status: 'pending' } });
    } catch (error) {
      // If approval_status column doesn't exist, default to 0
      logger.warn('Could not count pending users:', error);
    }

    // Count pending bookings
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });

    // Return data in format expected by frontend
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          pendingUsers,
          totalVehicles: totalListings,
          pendingVehicles: pendingListings,
          totalBookings,
          pendingBookings,
          activeBookings,
          totalRevenue: parseFloat(totalRevenue.toString())
        },
        recentActivity: {
          recentUsers: [],
          recentVehicles: []
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching dashboard stats:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/pending-listings - Get all pending listings
router.get('/pending-listings', authenticateAdmin, async (req, res) => {
  try {
    logger.info('Fetching pending listings...');
    
    // First, try to get listings without include to see if basic query works
    let listings;
    try {
      listings = await Listing.findAll({
        where: { status: 'pending' },
        order: [['createdAt', 'ASC']],
        raw: false
      });
    } catch (queryError: any) {
      logger.error('Error in basic Listing.findAll:', queryError);
      throw queryError;
    }

    logger.info(`Found ${listings.length} pending listings`);

    // Now fetch host information separately if needed
    const listingsData = await Promise.all(
      listings.map(async (listing: any) => {
        const listingJson = listing.toJSON();
        
        // Try to get host information if hostId exists
        if (listing.hostId) {
          try {
            const host = await User.findByPk(listing.hostId, {
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number']
            });
            if (host) {
              listingJson.host = {
                id: host.id,
                firstName: host.firstName,
                lastName: host.lastName,
                email: host.email,
                phone_number: host.phone_number
              };
            }
          } catch (hostError: any) {
            logger.warn(`Could not fetch host for listing ${listing.id}:`, hostError.message);
            listingJson.host = null;
          }
        }
        
        return listingJson;
      })
    );

    logger.info(`Processed ${listingsData.length} listings with host data`);

    res.json({
      success: true,
      data: listingsData,
      count: listingsData.length
    });
  } catch (error: any) {
    logger.error('Error fetching pending listings:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending listings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isVerified', 'createdAt', 'firebase_uid'],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// PUT /api/admin/listings/:id/approve - Approve a listing
router.put('/listings/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    logger.info(`Approving listing ${id} with status: ${status || 'approved'}`);
    
    const listing = await Listing.findByPk(id, {
      include: [{
        model: User,
        as: 'host',
        required: false
      }]
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    const newStatus = status || 'approved';
    if (listing.status !== 'pending' && newStatus === 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Listing is not pending approval'
      });
    }

    // Update listing status
    const updateData: any = { 
      status: newStatus,
      approved: newStatus === 'approved',
      is_available: newStatus === 'approved'
    };
    
    // If approving, also ensure the listing is marked as available
    if (newStatus === 'approved') {
      updateData.approved = true;
      updateData.is_available = true;
      updateData.status = 'approved';
    } else if (newStatus === 'rejected') {
      updateData.approved = false;
      updateData.is_available = false;
      updateData.status = 'rejected';
      if (reason) {
        updateData.rejection_reason = reason;
      }
    }
    
    await listing.update(updateData);

    logger.info(`Listing ${id} updated to status: ${newStatus}, approved: ${updateData.approved}, available: ${updateData.is_available}`);

    // Create notification for host (if hostId exists)
    try {
      if (listing.hostId) {
        await Notification.create({
          userId: listing.hostId,
          message: newStatus === 'approved' 
            ? `Your ${listing.make} ${listing.model} listing has been approved!`
            : `Your ${listing.make} ${listing.model} listing has been rejected. ${reason || ''}`,
          type: newStatus === 'approved' ? 'listing_approved' : 'listing_rejected',
          isRead: false
        });
      }
    } catch (notifError: any) {
      logger.warn('Could not create notification:', notifError?.message);
      // Don't fail the request if notification creation fails
    }

    // Emit notification to host
    try {
      const io = req.app.get('io');
      if (io && listing.hostId) {
        io.to(`user-${listing.hostId}`).emit('listing-approved', {
          id: listing.id,
          make: listing.make,
          model: listing.model,
          message: newStatus === 'approved' ? 'Your listing has been approved!' : 'Your listing has been rejected.',
          status: newStatus
        });
      }
    } catch (ioError: any) {
      logger.warn('Could not emit socket notification:', ioError?.message);
    }

    res.json({
      success: true,
      data: listing,
      message: `Listing ${newStatus} successfully`
    });
  } catch (error: any) {
    logger.error('Error approving listing:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      error: 'Failed to approve listing',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/admin/listings/:id/reject - Reject a listing
router.put('/listings/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const listing = await Listing.findByPk(id, {
      include: [{
        model: User,
        as: 'host'
      }]
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    if (listing.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Listing is not pending approval'
      });
    }

    // Update listing status
    await listing.update({ status: 'rejected' });

    // Create notification for host
    await Notification.create({
      userId: listing.hostId,
      message: `Your ${listing.make} ${listing.model} listing was rejected. ${reason || 'Please review the requirements and try again.'}`,
      type: 'approval',
      isRead: false
    });

    // Emit notification to host
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${listing.hostId}`).emit('listing-rejected', {
        id: listing.id,
        make: listing.make,
        model: listing.model,
        message: 'Your listing was rejected. Please review the requirements and try again.'
      });
    }

    res.json({
      success: true,
      data: listing,
      message: 'Listing rejected successfully'
    });
  } catch (error) {
    logger.error('Error rejecting listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject listing'
    });
  }
});

// POST /api/admin/create-admin - Create a new admin user (super admin only)
router.post('/create-admin', authenticateAdmin, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, firstName, and lastName are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user in database
    const adminUser = await User.create({
      email,
      firstName,
      lastName,
      role: 'admin',
      isVerified: true,
      password_hash: passwordHash,
      firebase_uid: undefined // Will be set when they first login with Firebase
    });

    // Set Firebase custom claims (this will be done when they first login)
    // For now, we'll create a placeholder that will be updated on first login

    logger.info(`Admin user created: ${email} by admin ${(req as any).admin?.email}`);

    res.json({
      success: true,
      data: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role
      },
      message: 'Admin user created successfully. They can now login with their credentials.'
    });
  } catch (error) {
    logger.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin user'
    });
  }
});

// POST /api/admin/set-firebase-claims - Set Firebase custom claims for admin user
router.post('/set-firebase-claims', authenticateAdmin, async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        error: 'Firebase UID is required'
      });
    }

    // Set admin custom claims
    await setAdminCustomClaims(firebaseUid, {
      admin: true,
      role: 'admin'
    });

    // Update user in database with Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (user && user.role === 'admin') {
      // User is already in database and is admin
      logger.info(`Firebase custom claims set for admin: ${user.email}`);
    }

    res.json({
      success: true,
      message: 'Firebase custom claims set successfully'
    });
  } catch (error) {
    logger.error('Error setting Firebase custom claims:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set Firebase custom claims'
    });
  }
});

export default router;