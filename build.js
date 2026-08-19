const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Determine if we are in root or in frontend directory
if (fs.existsSync(path.join(__dirname, 'frontend', 'package.json'))) {
  console.log('[Build] Building from workspace root...');
  execSync('npm --prefix frontend install --include=dev', { stdio: 'inherit' });
  execSync('npm --prefix frontend run build', { stdio: 'inherit' });
  
  // Ensure both ./dist and ./frontend/dist exist for any Vercel outputDirectory setting
  const srcDist = path.join(__dirname, 'frontend', 'dist');
  const destDist = path.join(__dirname, 'dist');
  if (fs.existsSync(srcDist)) {
    fs.cpSync(srcDist, destDist, { recursive: true, force: true });
  }
} else {
  console.log('[Build] Building from frontend directory...');
  execSync('npm install --include=dev', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
}
console.log('[Build] Build completed successfully.');
