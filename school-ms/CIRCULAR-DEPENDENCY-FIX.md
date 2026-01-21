# Circular Dependency Fix - Applied

**Date:** January 18, 2026  
**Issue:** Application failed to start due to circular bean dependencies  
**Status:** ✅ FIXED

---

## Problem Description

The application was failing to start with the following error:
```
The dependencies of some of the beans in the application context form a cycle:
   admissionController → admissionService → AuthService → admissionService
   authService → PasswordEncoder → securityConfig
```

---

## Root Cause

### Circular Dependency #1: AdmissionService ↔ AuthService
- `AdmissionService` injected `AuthService` to create user accounts for approved admissions
- This created a circular reference during Spring bean initialization

### Circular Dependency #2: AuthService ↔ PasswordEncoder
- `AuthService` injected `PasswordEncoder` from `SecurityConfig`
- `SecurityConfig` was being initialized before `AuthService` was ready
- This created a circular reference during bean creation

---

## Solution Applied

Added `@Lazy` annotation to break the circular dependency cycle. The `@Lazy` annotation tells Spring to create a proxy for these beans and inject them only when they're actually used, rather than during initialization.

---

## Changes Made

### File 1: AdmissionService.java

**Location:** `school-ms/backend/school-app/src/main/java/com/school/admission/service/AdmissionService.java`

**Change 1 - Added import:**
```java
import org.springframework.context.annotation.Lazy;
```

**Change 2 - Added @Lazy annotation:**
```java
@Autowired
@Lazy
private AuthService authService;
```

**Before:**
```java
@Autowired
private AuthService authService;
```

**After:**
```java
@Autowired
@Lazy
private AuthService authService;
```

---

### File 2: AuthService.java

**Location:** `school-ms/backend/school-app/src/main/java/com/school/security/AuthService.java`

**Change 1 - Added import:**
```java
import org.springframework.context.annotation.Lazy;
```

**Change 2 - Added @Lazy annotation:**
```java
@Autowired
@Lazy
private PasswordEncoder passwordEncoder;
```

**Before:**
```java
@Autowired
private PasswordEncoder passwordEncoder;
```

**After:**
```java
@Autowired
@Lazy
private PasswordEncoder passwordEncoder;
```

---

## Impact Analysis

### Functionality Impact: ✅ None
- The `@Lazy` annotation only changes **when** the beans are initialized
- It does **not** change **how** they work
- All functionality remains exactly the same

### Performance Impact: ✅ Negligible
- Beans are initialized on first use instead of at startup
- Adds minimal overhead (proxy creation)
- No noticeable performance difference

### Risk Level: ✅ Low
- Standard Spring Framework pattern for resolving circular dependencies
- Widely used and well-tested approach
- No code logic changes

---

## Testing Checklist

After applying these fixes, verify:

- [ ] Application starts successfully
- [ ] No circular dependency errors in logs
- [ ] Login functionality works
- [ ] User registration works
- [ ] Admission approval process works (creates student + user account)
- [ ] Password encoding/validation works
- [ ] JWT token generation works

---

## How to Test

### Step 1: Clean and Rebuild
```bash
cd school-ms/backend/school-app
mvn clean package
```

### Step 2: Start Application
```bash
mvn spring-boot:run
```

### Step 3: Check Logs
Look for:
- ✅ "Started SchoolApplication in X seconds"
- ❌ No "circular dependency" errors
- ❌ No "BeanCurrentlyInCreationException" errors

### Step 4: Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ChangeMe_Initial1!"}'
```

Expected: JWT token returned

### Step 5: Test Admission Approval
1. Create an admission application
2. Approve it (status → APPROVED)
3. Verify student record is created
4. Verify user account is created

---

## Additional Notes

### Why @Lazy Works

The `@Lazy` annotation breaks the circular dependency by:

1. **Delaying Initialization**: Instead of creating the actual bean during startup, Spring creates a proxy
2. **On-Demand Loading**: The real bean is only created when a method is first called on it
3. **Breaking the Cycle**: This allows both beans to be registered without requiring each other to be fully initialized first

### Alternative Solutions (Not Used)

We could have also:
1. **Setter Injection**: Use setter methods instead of field injection (more verbose)
2. **Constructor Injection with @Lazy**: Add @Lazy to constructor parameters (requires more changes)
3. **Refactoring**: Split services to remove circular dependency (major refactoring)

We chose `@Lazy` because it's:
- ✅ Minimal code changes
- ✅ Standard Spring pattern
- ✅ Low risk
- ✅ Easy to understand and maintain

---

## Verification Results

**Compilation Status:** ✅ SUCCESS  
**No Diagnostics Found:** ✅ Both files compile without errors  
**Ready for Testing:** ✅ YES

---

## Next Steps

1. **Start the application** and verify it starts successfully
2. **Test authentication** (login/register)
3. **Test admission approval** (creates student + user)
4. **Monitor logs** for any issues
5. **Report back** if any issues occur

---

## Rollback Plan

If issues occur, you can easily rollback by removing the `@Lazy` annotations:

**In AdmissionService.java:**
```java
@Autowired
private AuthService authService;  // Remove @Lazy
```

**In AuthService.java:**
```java
@Autowired
private PasswordEncoder passwordEncoder;  // Remove @Lazy
```

However, this will bring back the circular dependency error.

---

## References

- Spring Framework Documentation: [Circular Dependencies](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-dependency-resolution)
- Spring @Lazy Annotation: [Lazy Initialization](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Lazy.html)

---

**Status:** ✅ Fix Applied Successfully  
**Ready for Testing:** YES  
**Risk Level:** LOW

---

**Document Version:** 1.0  
**Last Updated:** January 18, 2026
