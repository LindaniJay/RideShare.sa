import { initializeFirebase, getFirestore } from '../src/config/firebase';
import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { logger } from '../src/utils/logger';

/**
 * Script to update Firestore role directly
 * This is useful when Firestore is out of sync with the database
 */
async function updateFirestoreRole() {
  try {
    console.log('🔄 Starting Firestore role update...\n');

    // Initialize Firebase
    await initializeFirebase();
    console.log('✅ Firebase initialized\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get email or Firebase UID from command line
    const identifier = process.argv[2];
    if (!identifier) {
      console.log('❌ Please provide user email or Firebase UID as argument:');
      console.log('   npm run update:firestore-role <email-or-uid>\n');
      process.exit(1);
    }

    // Try to find user by email or Firebase UID
    let user = await User.findOne({ 
      where: { 
        [require('sequelize').Op.or]: [
          { email: identifier },
          { firebase_uid: identifier }
        ]
      } 
    });

    let firebaseUid: string;
    
    if (!user) {
      // If not found in database, assume identifier is Firebase UID
      console.log(`⚠️  User not found in database for: ${identifier}`);
      console.log(`   Assuming ${identifier} is a Firebase UID\n`);
      firebaseUid = identifier;
    } else {
      if (!user.firebase_uid) {
        console.log(`⚠️  User ${user.email} does not have a Firebase UID in database`);
        console.log(`   If you know the Firebase UID, you can pass it directly\n`);
        // Try to use identifier as Firebase UID if it looks like one
        if (identifier.length > 20) {
          firebaseUid = identifier;
          console.log(`   Using provided identifier as Firebase UID: ${firebaseUid}\n`);
        } else {
          console.log(`❌ Cannot proceed without Firebase UID\n`);
          process.exit(1);
        }
      } else {
        firebaseUid = user.firebase_uid;
      }
    }

    const databaseRole = user ? user.role : 'admin'; // Default to admin if not in database
    const userEmail = user ? user.email : identifier;
    
    if (user) {
      console.log(`✅ Found user: ${user.email}`);
      console.log(`   Database role: ${user.role}`);
      console.log(`   Firebase UID: ${firebaseUid}\n`);
    } else {
      console.log(`⚠️  User not in database, will update Firestore only`);
      console.log(`   Firebase UID: ${firebaseUid}`);
      console.log(`   Will set role to: ${databaseRole}\n`);
    }

    // Update Firestore
    const firestore = getFirestore();
    if (!firestore) {
      console.log('❌ Firestore not initialized\n');
      process.exit(1);
    }

    const userRef = firestore.collection('users').doc(firebaseUid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('⚠️  User document does not exist in Firestore');
      console.log('   Creating new document...\n');
      
      await userRef.set({
        uid: firebaseUid,
        email: userEmail,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        role: databaseRole.toLowerCase(), // Store lowercase
        phone: user?.phone_number || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Created new Firestore document\n');
    } else {
      console.log('✅ User document exists in Firestore');
      console.log('   Updating role...\n');
      
      await userRef.update({
        role: databaseRole.toLowerCase(), // Store lowercase
        updatedAt: new Date()
      });
      
      console.log('✅ Firestore role updated\n');
    }

    // Verify update
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    
    console.log('📋 Firestore document after update:');
    console.log(`   Email: ${updatedData?.email}`);
    console.log(`   Role: ${updatedData?.role}`);
    console.log(`   UID: ${updatedData?.uid}\n`);

    console.log('✅ Firestore role update completed!\n');
    console.log('🔍 Next steps:');
    console.log('   1. User should log out and log back in');
    console.log('   2. Frontend will now read the correct role from Firestore\n');

  } catch (error: any) {
    console.error('❌ Error updating Firestore role:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  updateFirestoreRole()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default updateFirestoreRole;

