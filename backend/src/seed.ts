/**
 * VeriChain — Bootstrap Admin Seed Script
 * ----------------------------------------
 * Creates a first admin user in MongoDB if one doesn't already exist.
 *
 * Usage:
 *   npm run seed
 *
 * Credentials can be overridden via env vars:
 *   ADMIN_EMAIL=my@email.com ADMIN_PASSWORD=mypassword npm run seed
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User';

// ─── Configurable defaults (override via env vars) ────────────────────────────
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'VeriChain Admin';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@verichain.io';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2026!';
// ──────────────────────────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/verichain';

const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

async function seed() {
  console.log(`\n${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${CYAN}${BOLD}  VeriChain — Admin Bootstrap Seed Script${RESET}`);
  console.log(`${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

  // 1. Connect to MongoDB
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI);
    console.log(`${GREEN}✔ Connected to MongoDB:${RESET} ${MONGO_URI}`);
  } catch (err) {
    console.error(`${RED}✖ Failed to connect to MongoDB:${RESET}`, err);
    process.exit(1);
  }

  // 3. Hash password
  const salt         = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  // 4. Create or Update the admin user (upsert)
  try {
    const admin = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'admin',
        verified: true,
      },
      { upsert: true, new: true }
    );

    console.log(`\n${GREEN}${BOLD}✔ Admin account provisioned successfully!${RESET}`);
    console.log(`\n${BOLD}┌──────────────────────────────────────────┐${RESET}`);
    console.log(`${BOLD}│          Admin Login Credentials          │${RESET}`);
    console.log(`${BOLD}├──────────────────────────────────────────┤${RESET}`);
    console.log(`${BOLD}│${RESET}  Name     : ${CYAN}${BOLD}${admin.name}${RESET}`);
    console.log(`${BOLD}│${RESET}  Email    : ${CYAN}${BOLD}${admin.email}${RESET}`);
    console.log(`${BOLD}│${RESET}  Password : ${CYAN}${BOLD}${ADMIN_PASSWORD}${RESET}`);
    console.log(`${BOLD}│${RESET}  Role     : ${GREEN}${BOLD}admin${RESET}`);
    console.log(`${BOLD}│${RESET}  Verified : ${GREEN}${BOLD}true${RESET}`);
    console.log(`${BOLD}│${RESET}  ID       : ${admin._id}`);
    console.log(`${BOLD}└──────────────────────────────────────────┘${RESET}`);
    console.log(`\n${YELLOW}⚠  Store these credentials securely.${RESET}\n`);
  } catch (err) {
    console.error(`${RED}✖ Failed to create/update admin user:${RESET}`, err);
    await mongoose.disconnect();
    process.exit(1);
  }

  await mongoose.disconnect();
  console.log(`${GREEN}✔ Database connection closed.${RESET}\n`);
  process.exit(0);
}

seed();
