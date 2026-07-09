import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config = () => ({});

// Clean process environment
delete process.env.JWT_SECRET;

console.log('Testing server startup without JWT_SECRET...');

try {
  // Import the server module which should throw an error on load
  require('../server');
  console.error('FAIL: Server started successfully without JWT_SECRET!');
  process.exit(1);
} catch (error: any) {
  console.log('SUCCESS: Server failed to start with error:', error.message);
  if (error.message.includes('FATAL ERROR: JWT_SECRET environment variable is missing')) {
    console.log('Verification passed: Error message is correct.');
    process.exit(0);
  } else {
    console.error('FAIL: Error message is incorrect:', error.message);
    process.exit(1);
  }
}
