/**
 * Script to update attendance service imports
 * 
 * Run with:
 *   node scripts/update-imports.js
 * 
 * This script will find all references to teacherAttendanceService and staffAttendanceService
 * and replace them with employeeAttendanceService
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Define the directory to scan
const rootDir = path.resolve(__dirname, '..');

// Function to find all .tsx and .ts files
async function findTsFiles(dir) {
  const files = [];
  const items = await readdir(dir);
  
  for (const item of items) {
    if (item === 'node_modules') continue;
    
    const itemPath = path.join(dir, item);
    const stats = await stat(itemPath);
    
    if (stats.isDirectory()) {
      const subFiles = await findTsFiles(itemPath);
      files.push(...subFiles);
    } else if (itemPath.endsWith('.tsx') || itemPath.endsWith('.ts')) {
      files.push(itemPath);
    }
  }
  
  return files;
}

// Function to update imports in a file
async function updateImports(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Skip if the file is the service file itself
    if (filePath.includes('teacherAttendanceService.ts') || 
        filePath.includes('staffAttendanceService.ts') ||
        filePath.includes('employeeAttendanceService.ts')) {
      return false;
    }
    
    // Replace imports
    let newContent = content;
    let changed = false;
    
    // Replace teacherAttendanceService import with employeeAttendanceService
    if (content.includes('teacherAttendanceService')) {
      newContent = newContent.replace(
        /import\s+\{\s*teacherAttendanceService\s*,?([^}]*)\}\s+from\s+['"]\.\.\/services\/teacherAttendanceService['"];?/g,
        (match, imports) => {
          // Check if there are other imports
          if (imports.trim()) {
            // Map old types to new types
            const importMapping = {
              'TeacherAttendance': 'EmployeeAttendanceDTO',
              'AttendanceStatus': 'EmployeeAttendanceStatus',
              'SchoolHoliday': 'HolidayDTO',
              'BulkAttendanceRequest': 'BulkAttendanceRequest',
              'AttendanceStats': 'MonthlyAttendanceReport'
            };
            
            // Replace old type names with new ones
            let updatedImports = imports;
            for (const [oldType, newType] of Object.entries(importMapping)) {
              updatedImports = updatedImports.replace(new RegExp(oldType, 'g'), newType);
            }
            
            return `import { employeeAttendanceService,${updatedImports}} from '../services/employeeAttendanceService';`;
          } else {
            return `import { employeeAttendanceService } from '../services/employeeAttendanceService';`;
          }
        }
      );
      
      // Replace usage of teacherAttendanceService with employeeAttendanceService
      newContent = newContent.replace(/teacherAttendanceService\./g, 'employeeAttendanceService.');
      
      changed = true;
    }
    
    // Replace staffAttendanceService import with employeeAttendanceService
    if (content.includes('staffAttendanceService')) {
      newContent = newContent.replace(
        /import\s+\{\s*staffAttendanceService\s*,?([^}]*)\}\s+from\s+['"]\.\.\/services\/staffAttendanceService['"];?/g,
        (match, imports) => {
          // Check if there are other imports
          if (imports.trim()) {
            // Map old types to new types
            const importMapping = {
              'StaffAttendance': 'EmployeeAttendanceDTO',
              'StaffAttendanceStatus': 'EmployeeAttendanceStatus',
              'BulkStaffAttendanceRequest': 'BulkAttendanceRequest',
              'StaffAttendanceStats': 'MonthlyAttendanceReport'
            };
            
            // Replace old type names with new ones
            let updatedImports = imports;
            for (const [oldType, newType] of Object.entries(importMapping)) {
              updatedImports = updatedImports.replace(new RegExp(oldType, 'g'), newType);
            }
            
            return `import { employeeAttendanceService,${updatedImports}} from '../services/employeeAttendanceService';`;
          } else {
            return `import { employeeAttendanceService } from '../services/employeeAttendanceService';`;
          }
        }
      );
      
      // Replace usage of staffAttendanceService with employeeAttendanceService
      newContent = newContent.replace(/staffAttendanceService\./g, 'employeeAttendanceService.');
      
      changed = true;
    }
    
    // Replace TeacherAttendance with EmployeeAttendanceDTO
    if (content.includes('TeacherAttendance')) {
      newContent = newContent.replace(/TeacherAttendance/g, 'EmployeeAttendanceDTO');
      changed = true;
    }
    
    // Replace StaffAttendance with EmployeeAttendanceDTO
    if (content.includes('StaffAttendance')) {
      newContent = newContent.replace(/StaffAttendance/g, 'EmployeeAttendanceDTO');
      changed = true;
    }
    
    // Replace AttendanceStatus with EmployeeAttendanceStatus
    if (content.includes('AttendanceStatus')) {
      newContent = newContent.replace(/AttendanceStatus/g, 'EmployeeAttendanceStatus');
      changed = true;
    }
    
    // Replace StaffAttendanceStatus with EmployeeAttendanceStatus
    if (content.includes('StaffAttendanceStatus')) {
      newContent = newContent.replace(/StaffAttendanceStatus/g, 'EmployeeAttendanceStatus');
      changed = true;
    }
    
    // Write back to file if changes were made
    if (changed) {
      await writeFile(filePath, newContent);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
    return false;
  }
}

// Main function to start the update process
async function updateAllFiles() {
  try {
    const files = await findTsFiles(rootDir);
    console.log(`Found ${files.length} TypeScript files to check`);
    
    let changedCount = 0;
    
    for (const file of files) {
      const changed = await updateImports(file);
      if (changed) {
        console.log(`Updated: ${file}`);
        changedCount++;
      }
    }
    
    console.log(`\nUpdated ${changedCount} files successfully`);
  } catch (err) {
    console.error('Error:', err);
  }
}

// Run the script
updateAllFiles();
