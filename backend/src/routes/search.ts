import express from 'express';
import { Listing, User, EnhancedVehicle } from '../models';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/search - Search for available vehicles
router.get('/', async (req, res) => {
  try {
    const { 
      location, 
      make, 
      type, 
      minPrice, 
      maxPrice, 
      startDate, 
      endDate,
      fuelType,
      transmission,
      seats
    } = req.query;
    
    const whereClause: any = { 
      status: 'approved',
      approved: true,
      is_available: true
    };
    
    // Apply filters
    if (location) {
      whereClause.city = { [require('sequelize').Op.iLike]: `%${location}%` };
    }
    
    if (make) {
      whereClause.make = { [require('sequelize').Op.iLike]: `%${make}%` };
    }
    
    if (type) {
      whereClause.model = { [require('sequelize').Op.iLike]: `%${type}%` };
    }
    
    if (minPrice) {
      whereClause[require('sequelize').Op.or] = [
        { pricePerDay: { [require('sequelize').Op.gte]: parseFloat(minPrice.toString()) } },
        { price_per_day: { [require('sequelize').Op.gte]: parseFloat(minPrice.toString()) } }
      ];
    }
    
    if (maxPrice) {
      const priceCondition = {
        [require('sequelize').Op.or]: [
          { pricePerDay: { [require('sequelize').Op.lte]: parseFloat(maxPrice.toString()) } },
          { price_per_day: { [require('sequelize').Op.lte]: parseFloat(maxPrice.toString()) } }
        ]
      };
      if (whereClause[require('sequelize').Op.or]) {
        whereClause[require('sequelize').Op.and] = [
          whereClause[require('sequelize').Op.or],
          priceCondition
        ];
        delete whereClause[require('sequelize').Op.or];
      } else {
        whereClause[require('sequelize').Op.or] = priceCondition[require('sequelize').Op.or];
      }
    }
    
    if (fuelType) {
      whereClause.fuelType = fuelType;
    }
    
    if (transmission) {
      whereClause.transmission = transmission;
    }
    
    if (seats) {
      whereClause.seats = { [require('sequelize').Op.gte]: parseInt(seats.toString()) };
    }

    // Get approved listings from both Listing and EnhancedVehicle tables
    const [listings, enhancedVehicles] = await Promise.all([
      Listing.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'host',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number'],
          required: false
        }],
        order: [['createdAt', 'DESC']]
      }),
      EnhancedVehicle.findAll({
        where: {
          listingStatus: 'approved',
          is_available: true,
          ...(whereClause.make && { make: { [Op.iLike]: whereClause.make[Op.iLike] } }),
          ...(whereClause.fuelType && { fuel_type: whereClause.fuelType }),
          ...(whereClause.transmission && { transmission: whereClause.transmission }),
          ...(whereClause.seats && { seats: { [Op.gte]: whereClause.seats[Op.gte] } })
        },
        include: [{
          model: User,
          as: 'host',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number'],
          required: false
        }],
        order: [['createdAt', 'DESC']]
      })
    ]);

    // Convert EnhancedVehicles to Listing format for consistency
    const convertedEnhancedVehicles = enhancedVehicles
      .map((vehicle: any) => {
        // Extract city from location (can be JSON or string)
        let city = 'Unknown';
        if (vehicle.location) {
          if (typeof vehicle.location === 'string') {
            try {
              const loc = JSON.parse(vehicle.location);
              city = loc.city || 'Unknown';
            } catch {
              city = vehicle.location;
            }
          } else if (vehicle.location.city) {
            city = vehicle.location.city;
          }
        }

        // Filter by city if location filter was provided
        if (whereClause.city) {
          const searchCity = whereClause.city[Op.iLike]?.replace(/%/g, '').toLowerCase() || '';
          if (searchCity && !city.toLowerCase().includes(searchCity)) {
            return null; // Filter out this vehicle
          }
        }

        return {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          pricePerDay: vehicle.price_per_day || 0,
          price_per_day: vehicle.price_per_day,
          image: vehicle.cover_image || vehicle.coverImage || '',
          city: city,
          description: vehicle.description || `${vehicle.make} ${vehicle.model}`,
          features: vehicle.features || [],
          fuelType: vehicle.fuel_type,
          transmission: vehicle.transmission,
          seats: vehicle.seats,
          mileage: vehicle.mileage,
          status: 'approved',
          host: vehicle.host,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt
        };
      })
      .filter((v: any) => v !== null); // Remove filtered out vehicles

    // Combine both types of listings
    const allListings = [...listings, ...convertedEnhancedVehicles];

    // If date filters are provided, check availability
    let availableListings = allListings;
    if (startDate && endDate) {
      const start = new Date(startDate.toString());
      const end = new Date(endDate.toString());
      
      // Check for conflicting bookings
      const { Booking } = require('../models');
      const conflictingBookings = await Booking.findAll({
        where: {
          status: { [Op.in]: ['pending', 'confirmed', 'active'] },
          [Op.or]: [
            {
              start_date: { [Op.between]: [start, end] }
            },
            {
              end_date: { [Op.between]: [start, end] }
            },
            {
              [Op.and]: [
                { start_date: { [Op.lte]: start } },
                { end_date: { [Op.gte]: end } }
              ]
            }
          ]
        },
        attributes: ['listing_id', 'vehicle_id']
      });
      
      const conflictingListingIds = conflictingBookings
        .map((b: any) => b.listing_id || b.vehicle_id)
        .filter((id: any) => id !== null);
      availableListings = allListings.filter(listing => listing && !conflictingListingIds.includes(listing.id));
    }

    res.json({
      success: true,
      data: availableListings,
      count: availableListings.length,
      filters: {
        location,
        make,
        type,
        minPrice,
        maxPrice,
        startDate,
        endDate
      }
    });
  } catch (error) {
    logger.error('Error searching listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search listings'
    });
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.toString().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get unique makes and models
    const makes = await Listing.findAll({
      where: {
        status: 'approved',
        make: { [require('sequelize').Op.iLike]: `%${q}%` }
      },
      attributes: ['make'],
      group: ['make'],
      limit: 5
    });

    const models = await Listing.findAll({
      where: {
        status: 'approved',
        model: { [require('sequelize').Op.iLike]: `%${q}%` }
      },
      attributes: ['model'],
      group: ['model'],
      limit: 5
    });

    const cities = await Listing.findAll({
      where: {
        status: 'approved',
        city: { [require('sequelize').Op.iLike]: `%${q}%` }
      },
      attributes: ['city'],
      group: ['city'],
      limit: 5
    });

    const suggestions = [
      ...makes.map(item => ({ type: 'make', value: item.make })),
      ...models.map(item => ({ type: 'model', value: item.model })),
      ...cities.map(item => ({ type: 'city', value: item.city }))
    ];

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    logger.error('Error getting search suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions'
    });
  }
});

export default router;
