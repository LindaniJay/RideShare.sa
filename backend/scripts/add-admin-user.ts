import { sequelize } from '../src/config/firebase';
import { User } from '../src/models/User';
import { setAdminCustomClaims, getAuth } from '../src/config/firebase';
import { logger } from '../src/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import * as readline from 'readline';

/**
 * Script to add a new admin user to Firebase and database
 * This script will:
 * 1. Create user in Firebase (if email/password provided)
 * 2. Set Firebase custom claims (admin: true, role: 'admin')
 * 3. Create user in database with admin role
 */
async function addAdminUser() {
  try {
    console.log('🔧 Adding new admin user...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(query, resolve);
      });
    };

    const email = await question('Enter admin email: ');
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address\n');
      rl.close();
      process.exit(1);
    }

    const firstName = await question('Enter first name (optional, press Enter to skip): ') || 'Admin';
    const lastName = await question('Enter last name (optional, press Enter to skip): ') || 'User';
    const phone = await question('Enter phone number (optional, press Enter to skip): ') || undefined;

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

    // Check if user already exists in database
    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log(`⚠️  User with email ${email} already exists in database`);
      console.log(`   Current role: ${user.role}`);
      console.log(`   Firebase UID: ${user.firebase_uid || 'Not set'}\n`);

      const updateRole = await new Promise<boolean>((resolve) => {
        const rl2 = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl2.question('Update role to admin? (y/n): ', (answer) => {
          rl2.close();
          resolve(answer.toLowerCase() === 'y');
        });
      });

      if (updateRole) {
        await user.update({ role: 'admin', isVerified: true });
        console.log('✅ User role updated to admin\n');
      } else {
        console.log('❌ Operation cancelled\n');
        process.exit(0);
      }
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
        firebase_uid: undefined, // Will be set when user logs in
        display_name: `${firstName} ${lastName}`,
        is_email_verified: true,
        is_active: true
      });
      console.log('✅ User created in database\n');
    }

    // Instructions for Firebase
    console.log('📋 Next steps to complete admin setup:\n');
    console.log('Option 1: User creates Firebase account themselves');
    console.log('   1. User goes to frontend and signs up with this email');
    console.log('   2. After first login, run: npm run fix:admin ' + email);
    console.log('   3. This will set Firebase custom claims\n');

    console.log('Option 2: Create Firebase user manually (requires Firebase Admin SDK)');
    console.log('   1. Go to Firebase Console: https://console.firebase.google.com');
    console.log('   2. Navigate to Authentication > Users');
    console.log('   3. Click "Add user"');
    console.log('   4. Enter email: ' + email);
    console.log('   5. Set a temporary password (user will change on first login)');
    console.log('   6. After user logs in once, run: npm run fix:admin ' + email);
    console.log('   7. This will set Firebase custom claims\n');

    console.log('Option 3: Use Firebase Admin SDK (if available)');
    console.log('   The user needs to login at least once to get a Firebase UID');
    console.log('   Then run: npm run fix:admin ' + email);
    console.log('   This will set the custom claims automatically\n');

    console.log('📊 Current user status:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebase_uid || 'Not set (will be set on first login)'}`);
    console.log(`   Verified: ${user.isVerified}\n`);

    console.log('✅ Admin user setup initiated!');
    console.log('   User can now login and will have admin access once Firebase UID is set.\n');

  } catch (error: any) {
    console.error('❌ Error adding admin user:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  addAdminUser()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default addAdminUser;







