import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Listing, User } from '../models';
import { logger } from '../utils/logger';

const router = express.Router();

// GET /api/listings - Get all approved listings (search endpoint)
router.get('/', async (req, res) => {
  try {
    const { status = 'approved', city, make, priceRange } = req.query;
    const { Op } = require('sequelize');
    
    const whereClause: any = { 
      status: 'approved',
      approved: true,
      is_available: true
    };
    
    if (city) {
      whereClause.city = { [Op.iLike]: `%${city}%` };
    }
    
    if (make) {
      whereClause.make = { [Op.iLike]: `%${make}%` };
    }
    
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.toString().split('-').map(Number);
      // Support both pricePerDay and price_per_day field names
      const priceConditions: any[] = [];
      if (minPrice && maxPrice) {
        priceConditions.push(
          { pricePerDay: { [Op.gte]: minPrice, [Op.lte]: maxPrice } },
          { price_per_day: { [Op.gte]: minPrice, [Op.lte]: maxPrice } }
        );
      } else if (minPrice) {
        priceConditions.push(
          { pricePerDay: { [Op.gte]: minPrice } },
          { price_per_day: { [Op.gte]: minPrice } }
        );
      } else if (maxPrice) {
        priceConditions.push(
          { pricePerDay: { [Op.lte]: maxPrice } },
          { price_per_day: { [Op.lte]: maxPrice } }
        );
      }
      if (priceConditions.length > 0) {
        whereClause[Op.or] = [...(whereClause[Op.or] || []), ...priceConditions];
      }
    }

    const listings = await Listing.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'host',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings'
    });
  }
});

// GET /api/listings/host/:uid - Get host's listings
router.get('/host/:uid', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: uid } });
    if (!user) {
      logger.warn(`User not found for Firebase UID: ${uid}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.info(`Fetching listings for host: ${user.id} (Firebase UID: ${uid})`);

    const listings = await Listing.findAll({
      where: { hostId: user.id },
      order: [['createdAt', 'DESC']]
    });

    logger.info(`Found ${listings.length} listings for host ${user.id}`);

    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error: any) {
    logger.error('Error fetching host listings:', {
      error: error.message,
      stack: error.stack,
      uid: req.params.uid
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch host listings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/listings/create - Create a new listing
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { uid, make, model, year, pricePerDay, image, city, description, features, fuelType, transmission, seats, mileage } = req.body;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: uid } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create new listing (default status: pending)
    const listing = await Listing.create({
      hostId: user.id, // UUID, not Number
      make,
      model,
      year,
      pricePerDay,
      image,
      city,
      description,
      features: features ? (Array.isArray(features) ? features : JSON.parse(features)) : [],
      fuelType,
      transmission,
      seats,
      mileage,
      status: 'pending',
      is_available: true,
      approved: false
    });

    // Emit notification to admin room
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-listing', {
        id: listing.id,
        make,
        model,
        hostName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        city,
        createdAt: listing.createdAt
      });
    }

    res.status(201).json({
      success: true,
      data: listing,
      message: 'Listing created successfully and is pending approval'
    });
  } catch (error) {
    logger.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create listing'
    });
  }
});

// GET /api/listings/:id - Get specific listing
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await Listing.findByPk(id, {
      include: [{
        model: User,
        as: 'host',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      }]
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listing'
    });
  }
});

export default router;