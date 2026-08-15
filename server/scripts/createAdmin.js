import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';

dotenv.config();

/**
 * Script to create the first admin user
 * Usage: node scripts/createAdmin.js [username] [password]
 */
const createAdmin = async () => {
  try {
    await connectDB();

    const username = (process.argv[2] || 'admin').trim().toLowerCase();
    const password = process.argv[3] || 'admin123';

    console.log(`Checking if admin user '${username}' already exists...`);
    const existing = await Admin.findOne({ username });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existing) {
      existing.passwordHash = passwordHash;
      await existing.save();
      console.log(`🔒 Existing admin '${username}' password updated successfully!`);
    } else {
      await Admin.create({
        username,
        passwordHash,
      });
      console.log(`✅ Admin user '${username}' created successfully!`);
    }

    console.log(`\n========================================`);
    console.log(`Admin Credentials:`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`========================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
