# Quick Start Guide - Database Deployment

## 🚀 Get Your Database Running in 5 Minutes

This guide will help you quickly set up the School Management System database.

---

## Step 1: Install PostgreSQL (If Not Already Installed)

### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (choose PostgreSQL 15.x or 16.x)
3. Remember the password you set for `postgres` user
4. Default port: 5432

### Verify Installation:
```bash
psql --version
```
You should see: `psql (PostgreSQL) 15.x` or similar

---

## Step 2: Create Database

Open Command Prompt or PowerShell:

```bash
# Connect to PostgreSQL
psql -U postgres

# You'll be prompted for password (the one you set during installation)
```

In the PostgreSQL prompt:
```sql
-- Create database
CREATE DATABASE school_db;

-- Verify it was created
\l

-- Exit
\q
```

---

## Step 3: Run the Consolidated Script

Navigate to your project directory:

```bash
cd school-ms

# Execute the script
psql -U postgres -d school_db -f consolidated_school_database.sql
```

**What you'll see:**
- Script will run (takes 10-30 seconds)
- You'll see NOTICE messages at the end showing:
  - Total Tables Created: 45
  - Roles: 6
  - Users: 2
  - Grade Levels: 12
  - Sections: 26
  - Class Sections: 48
  - Staff Roles: 6

---

## Step 4: Verify Database

```bash
# Connect to your database
psql -U postgres -d school_db

# Check tables
\dt

# Check seed data
SELECT * FROM users;
SELECT * FROM roles;
SELECT * FROM grade_levels;

# Exit
\q
```

---

## Step 5: Configure Application

### Update application-dev.properties

Open: `school-ms/backend/school-app/src/main/resources/application-dev.properties`

Change these lines:
```properties
# Comment out or remove H2 configuration
# spring.datasource.url=jdbc:h2:mem:school_db

# Add PostgreSQL configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/school_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# Disable Flyway
spring.flyway.enabled=false

# Don't let Hibernate modify schema
spring.jpa.hibernate.ddl-auto=none
```

---

## Step 6: Start Your Application

```bash
cd school-ms/backend/school-app

# Using Maven
mvn spring-boot:run

# OR using the batch file
cd ../..
start-dev.bat
```

---

## Step 7: Test Login

Once the application starts:

1. Open browser: http://localhost:8080
2. Login with:
   - **Username:** `admin`
   - **Password:** `ChangeMe_Initial1!`

**⚠️ IMPORTANT:** Change this password immediately after first login!

---

## Common Issues & Quick Fixes

### Issue: "psql: command not found"
**Fix:** Add PostgreSQL to your PATH:
- Windows: `C:\Program Files\PostgreSQL\15\bin`

### Issue: "password authentication failed"
**Fix:** Use the correct postgres password you set during installation

### Issue: "database does not exist"
**Fix:** Run Step 2 again to create the database

### Issue: "Application won't start"
**Fix:** Check these:
1. PostgreSQL service is running
2. Database name is correct in application-dev.properties
3. Username/password are correct
4. Port 5432 is not blocked

### Issue: "Tables already exist"
**Fix:** Drop and recreate database:
```sql
psql -U postgres
DROP DATABASE school_db;
CREATE DATABASE school_db;
\q
```
Then run Step 3 again.

---

## What's Next?

### Immediate Actions:
1. ✅ Change default admin passwords
2. ✅ Test all major features
3. ✅ Add your school data

### For Production (AWS):
1. Create RDS PostgreSQL instance
2. Run the same script on RDS
3. Update application-prod.properties
4. Deploy application

---

## Quick Reference

### Database Details:
- **Database Name:** school_db
- **Tables:** 45
- **Default User:** postgres
- **Default Port:** 5432

### Admin Credentials:
- **User 1:** admin / ChangeMe_Initial1!
- **User 2:** admin1 / qwerty

### Seed Data:
- 6 Roles
- 2 Admin Users
- 12 Grade Levels (1-12)
- 26 Sections (A-Z)
- 48 Class Sections
- 6 Staff Roles

---

## Need More Help?

📖 **Detailed Documentation:**
- CONSOLIDATED-SCRIPT-README.md - Full deployment guide
- DATABASE-ANALYSIS-SUMMARY.md - Complete analysis
- AWS-DATABASE-DEPLOYMENT-PLAN.md - AWS deployment details

🔍 **Troubleshooting:**
- Check PostgreSQL logs
- Check application logs
- Verify environment variables
- Ensure services are running

---

**You're all set! 🎉**

Your School Management System database is ready to use.
