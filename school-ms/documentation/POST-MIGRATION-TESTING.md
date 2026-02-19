# Post-Migration Testing Procedure

This document outlines the testing procedure to ensure that the migration from `com.example.schoolms` package to `com.school` package structure has been completed successfully.

## Prerequisites

- All steps in the [FINAL-MIGRATION-CHECKLIST.md](FINAL-MIGRATION-CHECKLIST.md) have been completed
- The `com.example.schoolms` package has been removed using the cleanup script
- The application builds successfully without any compilation errors

## Test Procedure

### 1. Application Startup Test

- [ ] Start the application and verify that it initializes without any errors
- [ ] Check the logs for any exceptions or errors related to missing beans or components

```bash
# From the backend/school-app directory
./mvnw spring-boot:run
```

### 2. Swagger API Documentation Test

- [ ] Open Swagger UI at: http://localhost:8080/swagger-ui.html
- [ ] Verify that all API endpoints are listed correctly
- [ ] Confirm no endpoints are missing from the legacy `com.example.schoolms` package

### 3. Staff Management API Tests

These tests focus on the functionality that was migrated from `com.example.schoolms`:

#### a. Get Staff List

- [ ] Test endpoint: `GET /api/staff`
- [ ] Verify that the response returns a list of staff members
- [ ] Check that all fields are correctly populated

```bash
curl -X GET "http://localhost:8080/api/staff" -H "accept: application/json"
```

#### b. Create New Staff Member

- [ ] Test endpoint: `POST /api/staff`
- [ ] Create a new staff member with all required fields
- [ ] Verify that the staff member is successfully created

```bash
curl -X POST "http://localhost:8080/api/staff" -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phoneNumber":"1234567890","staffType":"TEACHER"}'
```

#### c. Bulk Upload Staff

- [ ] Test endpoint: `POST /api/staff/bulk`
- [ ] Upload a CSV or Excel file containing staff data
- [ ] Verify that staff records are imported correctly

#### d. Get Teacher Details

- [ ] Test endpoint: `GET /api/staff/{id}/teacher-details`
- [ ] Verify that teacher details are returned for staff members with teacher roles
- [ ] Check that all fields are correctly populated

```bash
curl -X GET "http://localhost:8080/api/staff/1/teacher-details" -H "accept: application/json"
```

### 4. Database Verification

- [ ] Connect to the database and verify that all tables are intact
- [ ] Check that no data was lost during the migration
- [ ] Confirm that the tables referenced by the migrated entities have their data

```sql
SELECT COUNT(*) FROM school_staff;
SELECT COUNT(*) FROM teacher_details;
```

### 5. Front-end Integration Test

- [ ] Log in to the front-end application
- [ ] Navigate to the Staff Management section
- [ ] Verify that staff lists load correctly
- [ ] Test creating, editing, and deleting staff records
- [ ] Confirm that there are no console errors related to API calls

### 6. Performance Testing

- [ ] Compare the application's performance before and after the migration
- [ ] Check response times for the main API endpoints
- [ ] Monitor server resource utilization (CPU, memory, database connections)

## Reporting Issues

If any issues are found during testing, please document them with the following information:

1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots or error logs if applicable

Create a GitHub issue with the label `migration-issue` for any problems discovered.

## Test Completion Checklist

Once all tests have been completed successfully, update the following checklist:

- [ ] Application starts without errors
- [ ] All API endpoints function correctly
- [ ] Database data is intact and accessible
- [ ] Front-end application functions correctly
- [ ] Performance is the same or better than before migration

After confirming all items, mark the migration as completed by updating the `MIGRATION-STATUS.md` file.
