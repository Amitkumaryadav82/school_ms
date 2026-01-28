# School Management System - UI Menu Structure

## 📋 Left-Hand Navigation Menu

Based on the frontend code review, here are all the menu options available in the left-hand navigation:

---

## 🎯 Menu Items for ADMIN Role

When logged in as **ADMIN**, you will see the following menu items:

### 1. 📊 **Dashboard**
- **Icon**: Dashboard icon
- **Path**: `/dashboard`
- **Description**: Main overview and statistics
- **Access**: All roles

### 2. 🎓 **Admissions**
- **Icon**: HowToReg icon
- **Path**: `/admissions`
- **Description**: Manage student admissions and applications
- **Access**: ADMIN, STAFF

### 3. 👥 **Students**
- **Icon**: People icon
- **Path**: `/students`
- **Description**: Manage student records and information
- **Access**: ADMIN, TEACHER, STAFF

### 4. 👔 **Staff**
- **Icon**: People icon
- **Path**: `/staff`
- **Description**: Manage staff members and employees
- **Access**: ADMIN only

### 5. ✅ **Staff Attendance**
- **Icon**: EventAvailable icon
- **Path**: `/staff-attendance`
- **Description**: Track and manage staff attendance
- **Access**: ADMIN, PRINCIPAL, STAFF, LIBRARIAN

### 6. 📝 **Student Attendance**
- **Icon**: EventAvailable icon
- **Path**: `/student-attendance`
- **Description**: Track and manage student attendance
- **Access**: ADMIN, TEACHER

### 7. 📅 **Timetable**
- **Icon**: EventAvailable icon
- **Path**: `/timetable`
- **Description**: Manage class schedules and timetables
- **Access**: ADMIN, PRINCIPAL, TEACHER

### 8. 📚 **Examinations**
- **Icon**: Book icon
- **Path**: `/exams`
- **Description**: Manage exams, blueprints, and question papers
- **Access**: ADMIN, TEACHER, PRINCIPAL

### 9. 📖 **Library**
- **Icon**: MenuBook icon
- **Path**: `/library`
- **Description**: Manage library books and transactions
- **Access**: ADMIN, LIBRARIAN

### 10. 💰 **Fee Management**
- **Icon**: AttachMoney icon
- **Path**: `/fees`
- **Description**: Manage student fees and payments
- **Access**: ADMIN only

---

## 🔒 Menu Items by Role

### ADMIN (Full Access)
✅ Dashboard  
✅ Admissions  
✅ Students  
✅ Staff  
✅ Staff Attendance  
✅ Student Attendance  
✅ Timetable  
✅ Examinations  
✅ Library  
✅ Fee Management  

**Total: 10 menu items**

---

### TEACHER
✅ Dashboard  
✅ Students  
✅ Student Attendance  
✅ Timetable  
✅ Examinations  

**Total: 5 menu items**

---

### STAFF
✅ Dashboard  
✅ Admissions  
✅ Students  
✅ Staff Attendance  

**Total: 4 menu items**

---

### PRINCIPAL
✅ Dashboard  
✅ Staff Attendance  
✅ Timetable  
✅ Examinations  

**Total: 4 menu items**

---

### LIBRARIAN
✅ Dashboard  
✅ Staff Attendance  
✅ Library  

**Total: 3 menu items**

---

### PARENT
✅ Dashboard  

**Total: 1 menu item**

---

### STUDENT
✅ Dashboard  

**Total: 1 menu item**

---

## 🚫 Hidden Menu Items

### Courses (Intentionally Disabled)
The **Courses** menu item is commented out in the code:
```typescript
/* Courses tab hidden per requirement
{ 
  text: 'Courses', 
  icon: <Book />, 
  path: '/consolidated-courses',
  allowedRoles: [ROLES.ADMIN, ROLES.TEACHER]
},*/
```

**Reason**: Per your requirement, the course functionality is kept in the backend but hidden from the UI.

---

## 🎨 UI Features

### Top Navigation Bar
- **Left**: Menu toggle button (mobile), School Management System title
- **Center**: Connection status indicator (shows backend connectivity)
- **Right**: User role badge, username, profile menu

### Profile Menu (Top Right)
- **Logout**: Sign out of the application

### Responsive Design
- **Desktop**: Permanent drawer on the left (240px wide)
- **Mobile**: Collapsible drawer (hamburger menu)

---

## 🔍 What You Should See as ADMIN

When you log in with the admin account, your left-hand menu should display:

```
┌─────────────────────────┐
│ 📊 Dashboard            │
├─────────────────────────┤
│ 🎓 Admissions           │
├─────────────────────────┤
│ 👥 Students             │
├─────────────────────────┤
│ 👔 Staff                │
├─────────────────────────┤
│ ✅ Staff Attendance     │
├─────────────────────────┤
│ 📝 Student Attendance   │
├─────────────────────────┤
│ 📅 Timetable            │
├─────────────────────────┤
│ 📚 Examinations         │
├─────────────────────────┤
│ 📖 Library              │
├─────────────────────────┤
│ 💰 Fee Management       │
└─────────────────────────┘
```

---

## 🐛 Troubleshooting

### If menu items are missing:

1. **Check user role**:
   - Look at the top-right corner for the role badge
   - Should show "ADMIN" for full access

2. **Verify database**:
   ```sql
   SELECT username, role FROM users WHERE username = 'admin';
   ```
   - Should return: `admin | ADMIN`

3. **Check browser console**:
   - Press F12 to open developer tools
   - Look for any JavaScript errors

4. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### If a specific menu item doesn't work:

1. **Check backend API**:
   - Verify the corresponding backend controller exists
   - Check application logs for errors

2. **Check routing**:
   - Verify the route is defined in `App.tsx`

---

## 📝 Notes

- Menu items are **role-based** - users only see what they have access to
- The **Courses** menu is intentionally hidden but backend functionality remains
- All menu items have **hover effects** for better UX
- The **Dashboard** menu item has special refresh behavior when clicked while already on dashboard
- **Connection status indicator** shows real-time backend connectivity

---

## 🔗 Related Files

- **Layout Component**: `frontend/src/components/Layout.tsx`
- **Routing**: `frontend/src/App.tsx`
- **Authentication**: `frontend/src/context/AuthContext.tsx`
- **User Entity**: `backend/school-app/src/main/java/com/school/security/User.java`

---

**Last Updated**: January 27, 2026  
**Current User**: admin (ADMIN role)  
**Expected Menu Items**: 10
