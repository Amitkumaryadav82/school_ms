import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source: built frontend files
const sourcePath = path.resolve(__dirname, '../dist');

// Destination: Spring Boot static resources folder
const destinationPath = path.resolve(__dirname, '../../backend/school-app/src/main/resources/static');

// Ensure the destination directory exists
fs.ensureDirSync(destinationPath);

// First, clean the destination directory
console.log(`Cleaning ${destinationPath}...`);
fs.emptyDirSync(destinationPath);

// Copy the files
console.log(`Copying from ${sourcePath} to ${destinationPath}...`);
try {
  fs.copySync(sourcePath, destinationPath, { overwrite: true });
  console.log('Frontend build files successfully copied to Spring Boot static directory!');
} catch (err) {
  console.error('Error occurred during copy operation:', err);
  process.exit(1);
}

// Create a .gitkeep file to ensure the static directory is tracked by Git
fs.writeFileSync(path.join(destinationPath, '.gitkeep'), '');

console.log('Done!');