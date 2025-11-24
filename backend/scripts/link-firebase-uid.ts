import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { logger } from '../src/utils/logger';

/**
 * Script to link Firebase UID to database user
 */
async function linkFirebaseUid() {
  try {
    console.log('🔗 Linking Firebase UID to database user...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get email and Firebase UID from command line
    const email = process.argv[2];
    const firebaseUid = process.argv[3];

    if (!email || !firebaseUid) {
      console.log('❌ Please provide email and Firebase UID:');
      console.log('   npm run link:firebase-uid <email> <firebase-uid>\n');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`❌ User with email ${email} not found in database\n`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email}`);
    console.log(`   Current Firebase UID: ${user.firebase_uid || 'Not set'}`);
    console.log(`   New Firebase UID: ${firebaseUid}\n`);

    // Update Firebase UID
    await user.update({ firebase_uid: firebaseUid });
    console.log('✅ Firebase UID linked successfully\n');

    // Reload user to verify
    await user.reload();
    console.log('📋 Updated user:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebase_uid}\n`);

  } catch (error: any) {
    console.error('❌ Error linking Firebase UID:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  linkFirebaseUid()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default linkFirebaseUid;







