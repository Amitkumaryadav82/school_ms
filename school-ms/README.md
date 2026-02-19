# School Management System

A comprehensive school management system built with Spring Boot (backend) and React (frontend).

## Project Structure

```
school-ms/
├── database/                          # Database scripts
│   ├── consolidated_school_database.sql   # Main schema (run this first)
│   ├── dummy_data_seed_india.sql         # Test data with Indian context
│   ├── clean_dummy_data.sql              # Clean test data
│   └── fixes/                            # Temporary fix scripts
│       ├── add-classes-and-subjects.sql
│       ├── fix-teacher-details-schema.sql
│       ├── create-teacher-details-from-staff.sql
│       ├── check-teacher-data.sql
│       └── fix-database-for-substitutions.sql
│
├── documentation/                     # All documentation files
│   ├── QUICK-START-GUIDE.md
│   ├── DEPLOYMENT-SUMMARY.md
│   ├── TIMETABLE-IMPLEMENTATION-COMPLETE.md
│   ├── TEACHER-SUBSTITUTIONS-IMPLEMENTATION.md
│   ├── FIX-TIMETABLE-REQUIREMENTS.md
│   ├── UPDATE-DATABASE-FOR-SUBSTITUTIONS.md
│   └── ... (50+ other documentation files)
│
├── backend/                           # Spring Boot backend
│   └── school-app/                    # Main application
│       ├── src/
│       ├── pom.xml
│       └── target/
│
├── frontend/                          # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── dist/
│
├── DB_Schema/                         # Legacy database schemas
└── docs/                              # Additional documentation

```

## Quick Start

### 1. Database Setup

```powershell
# Create database
createdb -U postgres -p 5435 school_db

# Run main schema
psql -U postgres -d school_db -p 5435 -f database/consolidated_school_database.sql

# Load test data (optional)
psql -U postgres -d school_db -p 5435 -f database/dummy_data_seed_india.sql
```

### 2. Backend Setup

```powershell
cd backend/school-app
mvn clean package -DskipTests
java -jar target/school-app-0.0.1-SNAPSHOT.jar
```

### 3. Frontend Setup

```powershell
cd frontend
npm install
npm run build

# Copy to backend for deployment
robocopy dist ..\backend\school-app\src\main\resources\static /E /PURGE
```

### 4. Access Application

- **URL**: http://localhost:8080
- **Admin Username**: admin
- **Admin Password**: password

## Database Configuration

Default connection settings:
- **Host**: localhost
- **Port**: 5435
- **Database**: school_db
- **Username**: postgres
- **Password**: admin

Update in `backend/school-app/src/main/resources/application.properties` if needed.

## Key Features

- **Staff Management**: Manage teachers, administrators, and other staff
- **Student Management**: Student records, admissions, attendance
- **Timetable Management**: 
  - Requirements configuration
  - Class timetables
  - Teacher substitutions (with smart workload-based suggestions)
- **Attendance Tracking**: Staff and student attendance
- **Fee Management**: Fee structures, payments, receipts
- **Examinations**: Exam configuration, marks entry, report cards
- **Library Management**: Book inventory and issue tracking

## Recent Updates

### Timetable Features
- ✅ Timetable Requirements (configure weekly periods per subject)
- ✅ Teacher Substitutions (smart suggestions based on workload)
- ✅ Classes and Subjects seed data added

### Database Fixes
- ✅ Added `classes` table seed data (Class 1-12)
- ✅ Added `subjects` table seed data (15 subjects)
- ✅ Fixed `teacher_details` schema for substitutions
- ✅ Added `timetable_substitutions` table

## Troubleshooting

### Empty Class Dropdown in Timetable Requirements
Run: `psql -U postgres -d school_db -p 5435 -f database/fixes/add-classes-and-subjects.sql`

### No Teachers in Substitutions Dropdown
Run these in order:
1. `psql -U postgres -d school_db -p 5435 -f database/fixes/fix-teacher-details-schema.sql`
2. `psql -U postgres -d school_db -p 5435 -f database/fixes/create-teacher-details-from-staff.sql`

### Check Teacher Data
Run: `psql -U postgres -d school_db -p 5435 -f database/fixes/check-teacher-data.sql`

## Documentation

All documentation is in the `documentation/` folder:

- **Quick Start**: `QUICK-START-GUIDE.md`
- **Deployment**: `DEPLOYMENT-SUMMARY.md`, `AWS-DEPLOYMENT-GUIDE.md`
- **Features**: 
  - `TIMETABLE-IMPLEMENTATION-COMPLETE.md`
  - `TEACHER-SUBSTITUTIONS-IMPLEMENTATION.md`
  - `STAFF-ATTENDANCE-IMPLEMENTATION.md`
- **Troubleshooting**: `FIX-TIMETABLE-REQUIREMENTS.md`, `UPDATE-DATABASE-FOR-SUBSTITUTIONS.md`

## Technology Stack

- **Backend**: Spring Boot 3.x, Java 17, PostgreSQL
- **Frontend**: React 18, TypeScript, Material-UI
- **Build Tools**: Maven, Vite
- **Database**: PostgreSQL 14+

## License

[Your License Here]

## Support

For issues and questions, refer to the documentation in the `documentation/` folder.
