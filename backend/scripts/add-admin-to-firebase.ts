import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { initializeFirebase, getAuth, setAdminCustomClaims } from '../src/config/firebase';
import { logger } from '../src/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import * as readline from 'readline';

/**
 * Script to add a new admin user to Firebase and database
 * This script will:
 * 1. Create user in Firebase with email/password
 * 2. Set Firebase custom claims (admin: true, role: 'admin')
 * 3. Create user in database with admin role
 * 4. Link Firebase UID to database user
 */
async function addAdminToFirebase() {
  try {
    console.log('🔧 Adding new admin user to Firebase and database...\n');

    // Initialize Firebase
    await initializeFirebase();
    console.log('✅ Firebase initialized\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get user input from command line arguments or prompt
    let email: string;
    let password: string;
    let firstName: string;
    let lastName: string;
    let phone: string | undefined;

    if (process.argv[2] && process.argv[3]) {
      // Command line arguments provided
      email = process.argv[2];
      password = process.argv[3];
      firstName = process.argv[4] || 'Admin';
      lastName = process.argv[5] || 'User';
      phone = process.argv[6] || undefined;
      
      console.log('📋 Admin user details from arguments:');
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${firstName} ${lastName}`);
      console.log(`   Phone: ${phone || 'Not provided'}\n`);
    } else {
      // Interactive mode
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const question = (query: string): Promise<string> => {
        return new Promise((resolve) => {
          rl.question(query, resolve);
        });
      };

      email = await question('Enter admin email: ');
      if (!email || !email.includes('@')) {
        console.log('❌ Invalid email address\n');
        console.log('Usage: npm run add:admin <email> <password> [firstName] [lastName] [phone]\n');
        rl.close();
        process.exit(1);
      }

      password = await question('Enter password (min 6 characters): ');
      if (!password || password.length < 6) {
        console.log('❌ Password must be at least 6 characters\n');
        rl.close();
        process.exit(1);
      }

      firstName = await question('Enter first name (optional, press Enter to skip): ') || 'Admin';
      lastName = await question('Enter last name (optional, press Enter to skip): ') || 'User';
      phone = await question('Enter phone number (optional, press Enter to skip): ') || undefined;

      console.log('\n📋 Admin user details:');
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${firstName} ${lastName}`);
      console.log(`   Phone: ${phone || 'Not provided'}\n`);

      const confirm = await question('Create this admin user? (y/n): ');
      if (confirm.toLowerCase() !== 'y') {
        console.log('❌ Cancelled\n');
        rl.close();
        process.exit(0);
      }

      rl.close();
    }

    const auth = getAuth();

    // Check if user already exists in Firebase
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
      console.log(`⚠️  User with email ${email} already exists in Firebase`);
      console.log(`   Firebase UID: ${firebaseUser.uid}\n`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create it
        console.log('🔥 Creating user in Firebase...');
        firebaseUser = await auth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: true,
          disabled: false
        });
        console.log(`✅ Firebase user created: ${firebaseUser.uid}\n`);
      } else {
        throw error;
      }
    }

    // Set admin custom claims in Firebase
    console.log('🔐 Setting Firebase custom claims (admin: true, role: admin)...');
    try {
      await auth.setCustomUserClaims(firebaseUser.uid, {
        admin: true,
        role: 'admin'
      });
      console.log('✅ Firebase custom claims set successfully\n');
    } catch (error: any) {
      console.log(`⚠️  Could not set Firebase custom claims: ${error.message}`);
      console.log('   You may need to set them manually in Firebase Console\n');
    }

    // Check if user exists in database
    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log(`⚠️  User with email ${email} already exists in database`);
      console.log(`   Current role: ${user.role}`);
      console.log(`   Firebase UID: ${user.firebase_uid || 'Not set'}\n`);

      // Update user
      await user.update({
        role: 'admin',
        isVerified: true,
        firebase_uid: firebaseUser.uid,
        firstName,
        lastName,
        phone_number: phone,
        display_name: `${firstName} ${lastName}`,
        is_email_verified: true,
        is_active: true
      });
      console.log('✅ User updated in database\n');
    } else {
      // Create new user in database
      console.log('📝 Creating user in database...');
      user = await User.create({
        id: uuidv4(),
        email,
        firstName,
        lastName,
        phone_number: phone,
        role: 'admin',
        isVerified: true,
        firebase_uid: firebaseUser.uid,
        display_name: `${firstName} ${lastName}`,
        is_email_verified: true,
        is_active: true
      });
      console.log('✅ User created in database\n');
    }

    // Refresh user data
    await user.reload();

    console.log('📊 Final admin user status:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebase_uid}`);
    console.log(`   Verified: ${user.isVerified}\n`);

    console.log('🎉 Admin user added successfully!\n');
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);
    console.log('🔍 Next steps:');
    console.log('   1. User can now login at the frontend');
    console.log('   2. They will have full admin access');
    console.log('   3. They should change their password after first login\n');

  } catch (error: any) {
    console.error('❌ Error adding admin user:', error);
    if (error.code) {
      console.error(`   Firebase Error Code: ${error.code}`);
    }
    if (error.message) {
      console.error(`   Error Message: ${error.message}`);
    }
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  addAdminToFirebase()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default addAdminToFirebase;

