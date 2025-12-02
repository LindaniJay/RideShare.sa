import express from 'express';
import { z } from 'zod';
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { Booking } from '../models/Booking';
import { Listing } from '../models/Listing';
import { EnhancedVehicle } from '../models/EnhancedVehicle';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'bookings', 'documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) and PDF files are allowed'));
    }
  }
});

const router = express.Router();

// Unified booking schema
const createBookingSchema = z.object({
  vehicleId: z.string().or(z.number()).transform(val => String(val)),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  totalPrice: z.number().positive().optional(),
  specialRequests: z.string().optional(),
  pickupLocation: z.string().optional(),
  returnLocation: z.string().optional(),
  paymentMethod: z.string().optional()
});

const updateBookingSchema = z.object({
  status: z.enum(['pending', 'approved', 'active', 'completed', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
  specialRequests: z.string().optional()
});

// GET /api/bookings/unified - Get user's bookings
router.get('/unified', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { status, limit = 50, offset = 0 } = req.query;

    const whereClause: any = {
      [Op.or]: [
        { renterId: userId },
        { hostId: userId }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Listing,
          as: 'listing',
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
            }
          ]
        },
        {
          model: User,
          as: 'renter',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
        }
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: bookings,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: bookings.length
      }
    });

  } catch (error) {
    logger.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// POST /api/bookings/unified - Create new booking (with optional document uploads)
router.post('/unified', 
  authenticateToken,
  documentUpload.fields([
    { name: 'driverLicense', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 },
    { name: 'selfieVerification', maxCount: 1 }
  ]),
  async (req: AuthenticatedRequest, res) => {
  const transaction = await Booking.sequelize!.transaction();
  
  try {
    const validatedData = createBookingSchema.parse(req.body);
    const userId = req.user!.id;

    // Convert dates to proper format
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    // Validate dates
    if (startDate >= endDate) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    if (startDate < new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Start date cannot be in the past'
      });
    }

    // Find and validate vehicle/listing - check both Listing and EnhancedVehicle models
    let vehicle = await Listing.findByPk(validatedData.vehicleId, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      transaction
    });

    let vehicleType = 'listing';
    let hostId: string;
    let pricePerDay: number;

    // If not found in Listing, check EnhancedVehicle
    if (!vehicle) {
      const enhancedVehicle = await EnhancedVehicle.findByPk(validatedData.vehicleId, {
        include: [
          {
            model: User,
            as: 'host',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        transaction
      });

      if (!enhancedVehicle) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }

      // Check if enhanced vehicle is approved
      if (enhancedVehicle.listingStatus !== 'approved') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Vehicle is not available for booking'
        });
      }

      vehicleType = 'enhanced';
      hostId = enhancedVehicle.hostId;
      pricePerDay = enhancedVehicle.pricePerDay || 0;
      // Store enhanced vehicle for later use
      vehicle = enhancedVehicle as any;
    } else {
      // Check if listing is approved
      if (vehicle.status !== 'approved') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Vehicle is not available for booking'
        });
      }

      hostId = vehicle.hostId;
      pricePerDay = vehicle.pricePerDay || 0;
    }

    // Check for date conflicts
    const existingBooking = await Booking.findOne({
      where: {
        vehicleId: validatedData.vehicleId,
        status: { [Op.in]: ['pending', 'approved', 'confirmed', 'active'] },
        [Op.or]: [
          {
            startDate: { [Op.between]: [startDate, endDate] }
          },
          {
            endDate: { [Op.between]: [startDate, endDate] }
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } }
            ]
          }
        ]
      },
      transaction
    });

    if (existingBooking) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        error: 'Vehicle is not available for the selected dates'
      });
    }

    // Calculate pricing if not provided
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = pricePerDay * days;
    const serviceFee = Math.round(basePrice * 0.1); // 10% service fee
    const insuranceFee = Math.round(basePrice * 0.05); // 5% insurance fee
    const totalPrice = validatedData.totalPrice || (basePrice + serviceFee + insuranceFee);

    // Create booking
    const booking = await Booking.create({
      bookingId: uuidv4(),
      renterId: userId, // UUID, not parseInt
      hostId: hostId, // UUID from vehicle
      vehicleId: parseInt(validatedData.vehicleId),
      listingId: parseInt(validatedData.vehicleId),
      startDate: startDate,
      endDate: endDate,
      totalPrice: totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: validatedData.specialRequests,
      pickup_location: validatedData.pickupLocation,
      return_location: validatedData.returnLocation,
      paymentMethod: validatedData.paymentMethod
    }, { transaction });

    // Fetch the created booking with relations
    // Include both Listing and EnhancedVehicle models
    const createdBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Listing,
          as: 'listing',
          required: false, // Make it optional since it might be an EnhancedVehicle
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: EnhancedVehicle,
          as: 'vehicle',
          required: false, // Make it optional since it might be a Listing
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'renter',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      transaction
    });
    
    // Attach the appropriate vehicle data to the listing field for consistency
    if (createdBooking) {
      if (vehicleType === 'enhanced' && createdBooking.vehicle) {
        // For EnhancedVehicle, attach it as listing for API consistency
        (createdBooking as any).listing = createdBooking.vehicle;
      } else if (!createdBooking.listing && vehicleType === 'enhanced') {
        // Fallback: fetch EnhancedVehicle separately if not included
        const enhancedVehicle = await EnhancedVehicle.findByPk(validatedData.vehicleId, {
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ],
          transaction
        });
        
        if (enhancedVehicle) {
          (createdBooking as any).listing = enhancedVehicle;
        }
      }
    }

    await transaction.commit();

    // Emit real-time notification to host
    const io = req.app.get('io');
    if (io && hostId) {
      const vehicleTitle = vehicleType === 'enhanced' 
        ? `${(vehicle as any).make} ${(vehicle as any).model}`
        : `${(vehicle as any).make} ${(vehicle as any).model}`;
        
      io.to(`user-${hostId}`).emit('new-booking', {
        id: booking.id,
        booking_id: booking.bookingId,
        renterName: `${req.user!.firstName || ''} ${req.user!.lastName || ''}`.trim() || 'User',
        vehicleTitle: vehicleTitle,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: totalPrice,
        createdAt: booking.createdAt
      });
    }

    logger.info(`New booking created: ${booking.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        booking: createdBooking,
        pricing: {
          basePrice,
          serviceFee,
          insuranceFee,
          totalPrice,
          days
        }
      },
      message: 'Booking created successfully'
    });

  } catch (error) {
    await transaction.rollback();
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking data',
        details: error.errors
      });
    }

    logger.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
});

// PATCH /api/bookings/unified/:id - Update booking
router.patch('/unified/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user!.id;
    const validatedData = updateBookingSchema.parse(req.body);

    // Find booking
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Listing,
          as: 'listing',
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check permissions (renter, host, or admin)
    const isRenter = booking.renterId === userId; // UUID comparison
    const isHost = booking.hostId === userId; // UUID comparison
    const isAdmin = req.user!.role === 'admin';

    if (!isRenter && !isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
    }

    // Update booking
    await booking.update(validatedData);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      const notificationData = {
        bookingId: booking.id,
        status: validatedData.status || booking.status,
        updatedBy: req.user!.firstName || 'User',
        timestamp: new Date().toISOString()
      };

      // Notify both renter and host
      io.to(`user-${booking.renterId}`).emit('booking-updated', notificationData);
      if (booking.hostId) {
        io.to(`user-${booking.hostId}`).emit('booking-updated', notificationData);
      }
    }

    logger.info(`Booking ${bookingId} updated by user ${userId}`);

    res.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid update data',
        details: error.errors
      });
    }

    logger.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking'
    });
  }
});

// GET /api/bookings/unified/:id - Get specific booking
router.get('/unified/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user!.id;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Listing,
          as: 'listing',
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
            }
          ]
        },
        {
          model: User,
          as: 'renter',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check permissions
    const isRenter = booking.renterId === userId; // UUID comparison
    const isHost = booking.hostId === userId; // UUID comparison
    const isAdmin = req.user!.role === 'admin';

    if (!isRenter && !isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    logger.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    });
  }
});

// DELETE /api/bookings/unified/:id - Cancel booking
router.delete('/unified/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user!.id;

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check permissions (renter or admin)
    const isRenter = booking.renterId === userId; // UUID comparison
    const isAdmin = req.user!.role === 'admin';

    if (!isRenter && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    // Only allow cancellation if booking is pending or approved
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel booking in current status'
      });
    }

    // Update booking status
    await booking.update({
      status: 'cancelled',
      paymentStatus: booking.paymentStatus === 'paid' ? 'refunded' : 'pending'
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      const notificationData = {
        bookingId: booking.id,
        status: 'cancelled',
        cancelledBy: req.user!.firstName || 'User',
        timestamp: new Date().toISOString()
      };

      io.to(`user-${booking.renterId}`).emit('booking-cancelled', notificationData);
      if (booking.hostId) {
        io.to(`user-${booking.hostId}`).emit('booking-cancelled', notificationData);
      }
    }

    logger.info(`Booking ${bookingId} cancelled by user ${userId}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    logger.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
});

// GET /api/bookings/unavailable/:listingId - Get unavailable dates for a listing
router.get('/unavailable/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;

    // Find all bookings for this listing that are not cancelled
    const bookings = await Booking.findAll({
      where: {
        listingId: parseInt(listingId),
        status: { [Op.notIn]: ['cancelled', 'completed'] }
      },
      attributes: ['startDate', 'endDate']
    });

    // Generate list of unavailable dates
    const unavailableDates: string[] = [];
    bookings.forEach((booking: any) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const current = new Date(start);
      
      while (current <= end) {
        unavailableDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    // Remove duplicates and sort
    const uniqueDates = [...new Set(unavailableDates)].sort();

    res.json({
      success: true,
      dates: uniqueDates,
      count: uniqueDates.length
    });

  } catch (error) {
    logger.error('Error fetching unavailable dates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unavailable dates'
    });
  }
});

export default router;
