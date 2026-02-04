# School Management System - Database Setup Guide

This guide explains how to set up the database for the Indian School Management System.

## Files Overview

### Core Database Files

1. **`consolidated_school_database.sql`** - Main database schema
   - Creates all tables, indexes, triggers, and constraints
   - Includes seed data for users, roles, and basic configuration
   - Run this FIRST on a fresh database

2. **`dummy_data_seed_india.sql`** - Indian school dummy data
   - Includes database structure fixes
   - Contains realistic Indian school test data
   - Run this AFTER the consolidated schema

3. **`clean_dummy_data.sql`** - Data cleanup script
   - Removes all dummy/test data
   - Preserves core configuration (users, roles, etc.)
   - Use this to clean data before loading fresh dummy data

## Setup Instructions

### Initial Setup (Fresh Database)

```bash
# Step 1: Create the database schema
psql -U postgres -d school_db -p 5435 -f consolidated_school_database.sql

# Step 2: Load Indian dummy data
psql -U postgres -d school_db -p 5435 -f dummy_data_seed_india.sql
```

### Reset Dummy Data

```bash
# Step 1: Clean existing dummy data
psql -U postgres -d school_db -p 5435 -f clean_dummy_data.sql

# Step 2: Load fresh dummy data
psql -U postgres -d school_db -p 5435 -f dummy_data_seed_india.sql
```

## Database Configuration

- **Host**: localhost
- **Port**: 5435
- **Database**: school_db
- **Username**: postgres
- **Password**: admin

## Default Admin Credentials

After running the consolidated schema:
- **Username**: admin
- **Password**: password

## Dummy Data Contents

The `dummy_data_seed_india.sql` includes:

### Database Fixes
- Gender enum values (MALE/FEMALE)
- Payments table structure
- Payment schedules table structure
- Late fees table structure

### Indian School Data
- **10 Staff Members** - Teachers, Principal, Admin staff with Indian names
- **18 Students** - Across grades 1-12 with Indian names and addresses
- **4 Admission Applications** - Sample pending/approved/rejected applications
- **30 Days of Attendance** - Both staff and student attendance records
- **16 Indian Holidays** - Republic Day, Independence Day, Diwali, etc.

### Fee Management
- **12 Fee Structures** - One for each grade (₹25,000 - ₹45,000)
- **18 Student Fee Assignments** - All students assigned to their grade's fee structure
- **48 Payment Schedules** - Quarterly installments for all grades
- **36 Late Fee Rules** - 7, 15, and 30-day penalties for all grades
- **20 Fee Payments** - Sample completed payments
- **48 Additional Fees** - Exam fees, library fees, computer lab fees, annual day fees

### Transport
- **5 Transport Routes** - Delhi-based routes (₹5,500 - ₹7,000)

## Currency

All amounts are in **Indian Rupees (₹)**

## Notes

- The dummy data script is idempotent - safe to run multiple times
- Use `clean_dummy_data.sql` before reloading to avoid duplicates
- All dates use Indian calendar holidays
- Phone numbers use Indian 10-digit format
- Addresses use Indian cities and pin codes

## Troubleshooting

### If you see gender enum errors:
The dummy data script automatically fixes this. Just run it.

### If Fee Management tab shows errors:
The dummy data script includes all necessary table structure fixes.

### If you need to start fresh:
```bash
# Drop and recreate database
psql -U postgres -p 5435 -c "DROP DATABASE IF EXISTS school_db;"
psql -U postgres -p 5435 -c "CREATE DATABASE school_db;"

# Then run setup steps above
```

## File Locations

All database scripts are in the `school-ms/` directory:
- `consolidated_school_database.sql`
- `dummy_data_seed_india.sql`
- `clean_dummy_data.sql`
- `DATABASE_SETUP_README.md` (this file)
