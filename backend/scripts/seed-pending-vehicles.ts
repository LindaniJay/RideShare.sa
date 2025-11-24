import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { Listing } from '../src/models/Listing';
import { v4 as uuidv4 } from 'uuid';

const mockVehicles = [
  {
    make: 'Toyota',
    model: 'Corolla Cross',
    year: 2023,
    pricePerDay: 450,
    city: 'Cape Town',
    status: 'pending' as const,
    description: 'Spacious and modern Toyota Corolla Cross perfect for family trips. Features advanced safety technology and excellent fuel economy.',
    features: ['Air Conditioning', 'Bluetooth', 'USB Port', 'GPS Navigation', 'Backup Camera', 'Apple CarPlay'],
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    mileage: 8500,
    vehicle_type: 'suv',
    color: 'Pearl White',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop'
    ]
  },
  {
    make: 'BMW',
    model: '3 Series',
    year: 2022,
    pricePerDay: 1200,
    city: 'Johannesburg',
    status: 'pending' as const,
    description: 'Luxury BMW 3 Series with premium interior and cutting-edge technology. Perfect for business executives and special occasions.',
    features: ['Leather Seats', 'Sunroof', 'Navigation', 'Backup Camera', 'Heated Seats', 'Premium Sound', 'Wireless Charging'],
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    mileage: 12000,
    vehicle_type: 'luxury',
    color: 'Mineral Grey',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop'
    ]
  },
  {
    make: 'Ford',
    model: 'Ranger',
    year: 2022,
    pricePerDay: 650,
    city: 'Durban',
    status: 'pending' as const,
    description: 'Rugged Ford Ranger with 4x4 capability. Ideal for outdoor adventures, work projects, and off-road excursions.',
    features: ['4x4', 'Air Conditioning', 'Bluetooth', 'Towing Package', 'Off-road Package', 'USB Port'],
    fuelType: 'diesel',
    transmission: 'manual',
    seats: 5,
    mileage: 25000,
    vehicle_type: 'truck',
    color: 'Race Red',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop'
    ]
  },
  {
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2023,
    pricePerDay: 1500,
    city: 'Cape Town',
    status: 'pending' as const,
    description: 'Elegant Mercedes-Benz C-Class with premium features and sophisticated design. Perfect for luxury travel and business meetings.',
    features: ['Leather Seats', 'Sunroof', 'Navigation', 'Backup Camera', 'Premium Sound', 'Wireless Charging', 'Ambient Lighting'],
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    mileage: 5000,
    vehicle_type: 'luxury',
    color: 'Obsidian Black',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
    ]
  },
  {
    make: 'Volkswagen',
    model: 'Polo',
    year: 2023,
    pricePerDay: 350,
    city: 'Pretoria',
    status: 'pending' as const,
    description: 'Compact and efficient Volkswagen Polo. Great for city driving, fuel-efficient, and easy to park.',
    features: ['Air Conditioning', 'Bluetooth', 'USB Port', 'Touchscreen', 'Parking Sensors'],
    fuelType: 'petrol',
    transmission: 'manual',
    seats: 5,
    mileage: 12000,
    vehicle_type: 'car',
    color: 'Tornado Red',
    image: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
    ]
  },
  {
    make: 'Toyota',
    model: 'Hilux',
    year: 2022,
    pricePerDay: 750,
    city: 'Port Elizabeth',
    status: 'pending' as const,
    description: 'Legendary Toyota Hilux - the ultimate workhorse. Perfect for construction, farming, and off-road adventures.',
    features: ['4x4', 'Air Conditioning', 'Bluetooth', 'Towing Package', 'Off-road Package', 'USB Port', 'GPS'],
    fuelType: 'diesel',
    transmission: 'manual',
    seats: 5,
    mileage: 35000,
    vehicle_type: 'truck',
    color: 'Super White',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop'
    ]
  },
  {
    make: 'Audi',
    model: 'Q5',
    year: 2023,
    pricePerDay: 1100,
    city: 'Johannesburg',
    status: 'pending' as const,
    description: 'Premium Audi Q5 SUV with quattro all-wheel drive. Spacious interior and advanced technology features.',
    features: ['Leather Seats', 'Sunroof', 'Navigation', 'Backup Camera', 'Premium Sound', 'Quattro AWD', 'Wireless Charging'],
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    mileage: 8000,
    vehicle_type: 'suv',
    color: 'Navarra Blue',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop'
    ]
  },
  {
    make: 'Hyundai',
    model: 'Tucson',
    year: 2023,
    pricePerDay: 550,
    city: 'Durban',
    status: 'pending' as const,
    description: 'Modern Hyundai Tucson with spacious interior and advanced safety features. Perfect for family trips.',
    features: ['Air Conditioning', 'Bluetooth', 'USB Port', 'GPS Navigation', 'Backup Camera', 'Apple CarPlay', 'Android Auto'],
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    mileage: 15000,
    vehicle_type: 'suv',
    color: 'Phantom Black',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop'
    ]
  }
];

async function seedPendingVehicles() {
  try {
    console.log('🚗 Starting to seed pending vehicles for presentation...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get or create a host user
    let hostUser = await User.findOne({ where: { role: 'host' } });
    
    if (!hostUser) {
      console.log('⚠️  No host user found. Creating a mock host user...');
      hostUser = await User.create({
        id: uuidv4(),
        firstName: 'Demo',
        lastName: 'Host',
        email: `demo-host-${Date.now()}@example.com`,
        role: 'host',
        isVerified: true,
        firebase_uid: `demo-host-${Date.now()}`,
        phone_number: '+27 82 123 4567'
      });
      console.log(`✅ Created demo host user: ${hostUser.email}\n`);
    } else {
      console.log(`✅ Using existing host user: ${hostUser.email}\n`);
    }

    // Create pending vehicles
    const createdVehicles = [];
    for (const vehicleData of mockVehicles) {
      try {
        const listing = await Listing.create({
          hostId: hostUser.id,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          pricePerDay: vehicleData.pricePerDay,
          image: vehicleData.image,
          city: vehicleData.city,
          status: 'pending', // Important: Set to pending for admin approval
          description: vehicleData.description,
          features: vehicleData.features,
          fuelType: vehicleData.fuelType,
          transmission: vehicleData.transmission,
          seats: vehicleData.seats,
          mileage: vehicleData.mileage,
          vehicle_type: vehicleData.vehicle_type,
          color: vehicleData.color,
          images: vehicleData.images,
          approved: false,
          is_available: false, // Not available until approved
          price_per_day: vehicleData.pricePerDay,
          minimum_rental_days: 1
        });

        createdVehicles.push(listing);
        console.log(`✅ Created pending vehicle: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} - R${vehicleData.pricePerDay}/day in ${vehicleData.city}`);
      } catch (error: any) {
        console.error(`❌ Failed to create vehicle ${vehicleData.make} ${vehicleData.model}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully created ${createdVehicles.length} pending vehicles!\n`);
    console.log('📋 Summary:');
    console.log(`   - Total vehicles: ${createdVehicles.length}`);
    console.log(`   - Status: All set to "pending" for admin approval`);
    console.log(`   - Host: ${hostUser.email}\n`);
    console.log('🔍 Next steps:');
    console.log('   1. Log in as admin');
    console.log('   2. Go to Admin Dashboard');
    console.log('   3. Approve the pending vehicles');
    console.log('   4. After approval, vehicles will appear in search results');
    console.log('   5. Renters can then book these vehicles\n');

    // Show pending vehicles count
    const pendingCount = await Listing.count({ where: { status: 'pending' } });
    console.log(`📊 Total pending vehicles in database: ${pendingCount}\n`);

  } catch (error: any) {
    console.error('❌ Error seeding pending vehicles:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  seedPendingVehicles()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default seedPendingVehicles;







