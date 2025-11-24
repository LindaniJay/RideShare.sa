import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { initializeFirebase, getFirestore, setAdminCustomClaims } from '../src/config/firebase';
import { logger } from '../src/utils/logger';

/**
 * Script to sync Firestore user role with database role
 * This script will:
 * 1. Find user in database
 * 2. Update Firestore document to match database role
 * 3. Set Firebase custom claims if user is admin
 */
async function syncFirestoreRole() {
  try {
    console.log('🔄 Starting Firestore role sync...\n');

    // Initialize Firebase
    await initializeFirebase();
    console.log('✅ Firebase initialized\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get user email from command line
    const userEmail = process.argv[2];
    
    if (!userEmail) {
      console.log('❌ Please provide user email as argument:');
      console.log('   npm run sync:firestore-role <user-email>\n');
      process.exit(1);
    }

    // Find user in database
    const user = await User.findOne({ where: { email: userEmail } });
    
    if (!user) {
      console.log(`❌ User with email ${userEmail} not found in database\n`);
      process.exit(1);
    }

    console.log(`✅ Found user in database: ${user.email}`);
    console.log(`   Database role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebase_uid || 'Not set'}\n`);

    if (!user.firebase_uid) {
      console.log('⚠️  Firebase UID not set. User needs to login with Firebase first.\n');
      process.exit(1);
    }

    // Get Firestore instance
    const firestore = getFirestore();
    if (!firestore) {
      console.log('❌ Firestore not initialized\n');
      process.exit(1);
    }

    // Update Firestore document
    const firestoreRef = firestore.collection('users').doc(user.firebase_uid);
    const firestoreDoc = await firestoreRef.get();

    if (!firestoreDoc.exists) {
      console.log('⚠️  Firestore document does not exist. Creating it...\n');
      
      // Create Firestore document with database data
      await firestoreRef.set({
        uid: user.firebase_uid,
        id: user.firebase_uid,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone_number || '',
        phoneNumber: user.phone_number || '',
        role: user.role.toLowerCase(), // Store lowercase in Firestore
        approvalStatus: 'approved',
        createdAt: user.created_at || new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Firestore document created\n');
    } else {
      const currentData = firestoreDoc.data();
      console.log(`📋 Current Firestore role: ${currentData?.role || 'Not set'}`);
      
      // Update role in Firestore to match database
      await firestoreRef.update({
        role: user.role.toLowerCase(), // Store lowercase in Firestore
        updatedAt: new Date()
      });
      
      console.log(`✅ Firestore role updated to: ${user.role.toLowerCase()}\n`);
    }

    // Set Firebase custom claims if user is admin
    if (user.role === 'admin') {
      try {
        console.log('🔄 Setting Firebase custom claims for admin...');
        await setAdminCustomClaims(user.firebase_uid, {
          admin: true,
          role: 'admin'
        });
        console.log('✅ Firebase custom claims set successfully\n');
      } catch (error: any) {
        console.log(`⚠️  Could not set Firebase custom claims: ${error.message}\n`);
      }
    }

    // Verify the update
    const updatedDoc = await firestoreRef.get();
    const updatedData = updatedDoc.data();
    
    console.log('📋 Final status:');
    console.log(`   Database role: ${user.role}`);
    console.log(`   Firestore role: ${updatedData?.role || 'Not set'}`);
    console.log(`   Firebase UID: ${user.firebase_uid}\n`);

    console.log('✅ Firestore role sync completed!\n');
    console.log('🔍 Next steps:');
    console.log('   1. User should logout and login again');
    console.log('   2. Frontend will read the updated role from Firestore');
    console.log('   3. User should now be redirected to the correct dashboard\n');

  } catch (error: any) {
    console.error('❌ Error syncing Firestore role:', error);
    logger.error('Error syncing Firestore role:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  syncFirestoreRole()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default syncFirestoreRole;







