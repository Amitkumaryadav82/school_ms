# Frontend Deployment Mismatch - Root Cause Analysis

## Problem Summary

**User sees different menu items than expected:**
- **Expected (from current Layout.tsx)**: 10 menu items for ADMIN role
- **Actually seeing**: 7 menu items with old structure

## Root Cause

The frontend code deployed in the JAR file is **outdated** and does not match the current source code in `school-ms/frontend/src/components/Layout.tsx`.

### Evidence

**Deployed Frontend (in JAR):**
- Location: `school-ms/backend/school-app/src/main/resources/static/`
- JavaScript bundle: `assets/index-c302092e.js`
- Contains OLD menu structure with:
  ```javascript
  {text:"Courses",icon:...,path:"/courses",allowedRoles:[...]}
  {text:"Reports",icon:...,path:"/reports",allowedRoles:[...]}
  ```

**Current Source Code:**
- Location: `school-ms/frontend/src/components/Layout.tsx`
- Has Courses commented out: `/* Courses tab hidden per requirement */`
- Does NOT have Reports menu item
- Has 10 menu items: Dashboard, Admissions, Students, Staff, Staff Attendance, Student Attendance, Timetable, Examinations, Library, Fee Management

## Menu Comparison

### Old Frontend (Currently Deployed in JAR)
1. Dashboard
2. Admissions
3. Students
4. Staff
5. **Courses** ← Should be hidden
6. Fee Management
7. **Reports** ← Doesn't exist in current code

**Missing from deployed version:**
- Staff Attendance
- Student Attendance
- Timetable
- Examinations
- Library

### Current Source Code (Not Deployed)
1. Dashboard
2. Admissions
3. Students
4. Staff
5. Staff Attendance
6. Student Attendance
7. Timetable
8. Examinations
9. Library
10. Fee Management

## Why This Happened

Following the `Deployment_Free.md` guide, the deployment process is:

1. Build frontend: `npm run build` (creates `frontend/dist/`)
2. Copy to backend: `robocopy dist backend\school-app\src\main\resources\static /E`
3. Build JAR: `mvn clean package`
4. Deploy JAR to EC2

**The issue:** Step 2 was either:
- Never executed after the latest Layout.tsx changes, OR
- Executed but the JAR was built from an old static folder

## Solution

You need to rebuild and redeploy the frontend with the current Layout.tsx code.

### Option 1: Full Rebuild (Recommended)

```powershell
# From school-ms directory

# Step 1: Build the latest frontend
cd frontend
npm run build

# Step 2: Copy to backend static resources (OVERWRITES old files)
robocopy dist ..\backend\school-app\src\main\resources\static /E /PURGE

# Step 3: Rebuild the JAR
cd ..\backend\school-app
mvn clean package -DskipTests

# Step 4: The new JAR is at:
# school-ms/backend/school-app/target/school-app-1.0.0.jar
```

The `/PURGE` flag ensures old files are removed.

### Option 2: Quick Verification (Check What's Built)

Before deploying, verify the frontend build contains the correct Layout:

```powershell
# After npm run build, check the built JavaScript
cd frontend\dist\assets
# Look for the main JavaScript file (name will have hash)
# Search for "Reports" - it should NOT appear in menu items
# Search for "Staff Attendance" - it SHOULD appear
```

### Option 3: Deploy to EC2

After rebuilding the JAR with the correct frontend:

```powershell
# Upload new JAR to EC2 (replace with your details)
scp -i ~/.ssh/<your-key>.pem `
  backend/school-app/target/school-app-1.0.0.jar `
  ubuntu@<EC2_PUBLIC_IP>:/home/ubuntu/school-app.jar

# SSH and restart
ssh -i ~/.ssh/<your-key>.pem ubuntu@<EC2_PUBLIC_IP>
sudo systemctl restart school-app
sudo systemctl status school-app --no-pager
```

## Verification Steps

After redeployment:

1. **Clear browser cache** (important!)
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Or use Incognito/Private mode

2. **Login and check menu**
   - Should see 10 items (not 7)
   - Should NOT see "Courses" or "Reports"
   - Should see "Staff Attendance", "Student Attendance", "Timetable", "Examinations", "Library"

3. **Check browser console**
   - Press F12 → Console tab
   - Should not see 404 errors for `/reports` route

## Prevention

To avoid this in the future:

1. **Always rebuild frontend before packaging JAR** when Layout.tsx or any frontend code changes
2. **Use a deployment script** that automates all steps:
   ```powershell
   # Create: school-ms/build-and-package.ps1
   cd frontend
   npm run build
   robocopy dist ..\backend\school-app\src\main\resources\static /E /PURGE
   cd ..\backend\school-app
   mvn clean package -DskipTests
   Write-Host "JAR ready at: target/school-app-1.0.0.jar"
   ```

3. **Version your JAR files** with timestamps:
   ```powershell
   $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
   Copy-Item target/school-app-1.0.0.jar "target/school-app-$timestamp.jar"
   ```

## Technical Details

**Frontend Build Process:**
- Vite bundles React app into optimized JavaScript/CSS
- Output: `frontend/dist/` directory
- Contains: `index.html`, `assets/*.js`, `assets/*.css`

**Backend Packaging:**
- Spring Boot serves static files from `src/main/resources/static/`
- Maven packages this into the JAR at build time
- At runtime, Spring Boot serves these files at the root path `/`

**Key Point:** The JAR contains a SNAPSHOT of the static files at the time `mvn package` was run. Changing source code does NOT update the JAR automatically.

## Current Status

- ✅ Source code is correct (Layout.tsx has proper menu structure)
- ❌ Deployed JAR contains old frontend build
- 🔧 **Action Required:** Rebuild frontend → Copy to static → Rebuild JAR → Redeploy

## Questions to Ask User

Before proceeding with the rebuild:

1. **Do you want to rebuild the frontend now with the current Layout.tsx?**
   - This will give you the 10-item menu structure

2. **Are there any other frontend changes you want to include?**
   - We can review other components before rebuilding

3. **Do you want me to create an automated build script?**
   - This will prevent this issue in the future

4. **Should we keep the old JAR as a backup?**
   - Recommended before deploying the new one
