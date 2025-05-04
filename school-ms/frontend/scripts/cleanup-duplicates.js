import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source directory
const srcPath = path.resolve(__dirname, '../src');

// Log file for actions taken
const logFile = path.resolve(__dirname, '../cleanup-log.txt');

// File priority order - we'll keep the TypeScript versions and delete others
// when we find files with the same base name
const FILE_PRIORITY = ['.tsx', '.ts', '.jsx', '.js', '.d.ts'];

// Map to track base filenames and their variants
const fileMap = new Map();

// Function to get base name without extension
function getBaseName(filePath) {
  const parsedPath = path.parse(filePath);
  return parsedPath.name;
}

// Recursively scan directory
function scanDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules
      if (file !== 'node_modules') {
        scanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      // Only process our target file types
      if (['.js', '.jsx', '.ts', '.tsx', '.d.ts'].includes(ext)) {
        const baseName = getBaseName(file);
        const relativePath = path.relative(srcPath, directory);
        const baseKey = path.join(relativePath, baseName);
        
        if (!fileMap.has(baseKey)) {
          fileMap.set(baseKey, []);
        }
        
        fileMap.get(baseKey).push({
          path: fullPath,
          extension: ext
        });
      }
    }
  });
}

// Process the directory
console.log('Scanning for duplicate files...');
scanDirectory(srcPath);

// Find duplicates and log them
let logContent = 'Duplicate File Analysis\n';
logContent += '=======================\n\n';
logContent += 'Files with multiple versions:\n\n';

const filesToDelete = [];

// Process each group of files
fileMap.forEach((files, baseKey) => {
  if (files.length > 1) {
    logContent += `${baseKey}:\n`;
    
    // Sort by priority
    files.sort((a, b) => {
      return FILE_PRIORITY.indexOf(a.extension) - FILE_PRIORITY.indexOf(b.extension);
    });
    
    // Keep the highest priority file, mark others for deletion
    const keepFile = files[0];
    logContent += `  KEEP: ${path.basename(keepFile.path)} (${keepFile.extension})\n`;
    
    for (let i = 1; i < files.length; i++) {
      logContent += `  DELETE: ${path.basename(files[i].path)} (${files[i].extension})\n`;
      filesToDelete.push(files[i].path);
    }
    
    logContent += '\n';
  }
});

// Write the log file
fs.writeFileSync(logFile, logContent);

console.log(`Analysis complete. Found ${filesToDelete.length} duplicate files.`);
console.log(`Check ${logFile} for details.`);

// Log information about typescript files without JS versions
logContent = '\n\nComponents missing TypeScript versions:\n\n';
let missingTsCount = 0;

fileMap.forEach((files, baseKey) => {
  if (files.length === 1 && (files[0].extension === '.js' || files[0].extension === '.jsx')) {
    logContent += `${baseKey}${files[0].extension}\n`;
    missingTsCount++;
  }
});

if (missingTsCount > 0) {
  logContent += `\nTotal: ${missingTsCount} files still need TypeScript conversion\n`;
  fs.appendFileSync(logFile, logContent);
  console.log(`Found ${missingTsCount} files still needing TypeScript conversion.`);
}

// After user confirmation - this is the code block that was missing proper implementation
if (process.argv.includes('--delete')) {
  console.log('Deleting duplicate files...');
  
  // Delete files
  filesToDelete.forEach(file => {
    console.log(`Deleting ${file}`);
    try {
      fs.unlinkSync(file);
    } catch (err) {
      console.error(`Error deleting ${file}:`, err.message);
    }
  });
  
  console.log(`Deleted ${filesToDelete.length} files.`);
} else {
  console.log('To delete files, run the script with --delete flag');
}