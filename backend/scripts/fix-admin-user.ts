import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { initializeFirebase, setAdminCustomClaims } from '../src/config/firebase';
import { logger } from '../src/utils/logger';

/**
 * Script to fix admin user authentication
 * This script will:
 * 1. Find admin users in the database
 * 2. Update their role to 'admin' if needed
 * 3. Set Firebase custom claims if Firebase UID is available
 */
async function fixAdminUser() {
  try {
    console.log('🔧 Starting admin user fix...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Initialize Firebase
    try {
      await initializeFirebase();
      console.log('✅ Firebase initialized\n');
    } catch (firebaseError: any) {
      console.log(`⚠️  Could not initialize Firebase: ${firebaseError.message}`);
      console.log('   Custom claims will not be set, but database role will be updated\n');
    }

    // Get admin email from command line or use default
    const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.log('❌ Please provide admin email as argument:');
      console.log('   npm run fix:admin <admin-email>');
      console.log('   OR set ADMIN_EMAIL environment variable\n');
      
      // Show all users
      const allUsers = await User.findAll({
        attributes: ['id', 'email', 'role', 'firebase_uid', 'firstName', 'lastName']
      });
      
      if (allUsers.length > 0) {
        console.log('📋 Available users:');
        allUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (Role: ${user.role}, Firebase UID: ${user.firebase_uid || 'Not set'})`);
        });
        console.log('');
      }
      
      process.exit(1);
    }

    // Find user by email
    let user = await User.findOne({ where: { email: adminEmail } });

    if (!user) {
      console.log(`⚠️  User with email ${adminEmail} not found in database\n`);
      console.log('💡 Creating new admin user...\n');
      
      // Create new admin user
      const { v4: uuidv4 } = require('uuid');
      user = await User.create({
        id: uuidv4(),
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        firebase_uid: undefined, // Will be set when user logs in with Firebase
        display_name: 'Admin User',
        is_email_verified: true,
        is_active: true
      });
      
      console.log(`✅ Created new admin user: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Note: Firebase UID will be set when you login with Firebase\n`);
    }

    console.log(`✅ Found user: ${user.email}`);
    console.log(`   Current role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebase_uid || 'Not set'}\n`);

    // Update role to admin if not already
    if (user.role !== 'admin') {
      console.log('🔄 Updating user role to admin...');
      await user.update({ role: 'admin', isVerified: true });
      console.log('✅ User role updated to admin\n');
    } else {
      console.log('✅ User already has admin role\n');
    }

    // Set Firebase custom claims if Firebase UID exists
    if (user.firebase_uid) {
      try {
        console.log('🔄 Setting Firebase custom claims...');
        await setAdminCustomClaims(user.firebase_uid, {
          admin: true,
          role: 'admin'
        });
        console.log('✅ Firebase custom claims set successfully\n');
      } catch (error: any) {
        console.log(`⚠️  Could not set Firebase custom claims: ${error.message}`);
        console.log('   This might be because:');
        console.log('   - Firebase is not configured');
        console.log('   - Firebase UID is invalid');
        console.log('   - User needs to login with Firebase first\n');
      }
    } else {
      console.log('⚠️  Firebase UID not set for this user');
      console.log('   User needs to:');
      console.log('   1. Login with Firebase authentication');
      console.log('   2. Firebase UID will be automatically saved');
      console.log('   3. Then run this script again to set custom claims\n');
    }

    // Refresh user data
    await user.reload();

    console.log('📋 Final user status:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebase_uid || 'Not set'}`);
    console.log(`   Verified: ${user.isVerified}\n`);

    console.log('✅ Admin user fix completed!\n');
    console.log('🔍 Next steps:');
    console.log('   1. Make sure user logs in with Firebase');
    console.log('   2. If Firebase UID was not set, it will be set on first login');
    console.log('   3. Run this script again to set Firebase custom claims');
    console.log('   4. User should now be able to access admin dashboard\n');

  } catch (error: any) {
    console.error('❌ Error fixing admin user:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  fixAdminUser()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default fixAdminUser;

