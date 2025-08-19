export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STAFF: 'STAFF',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
  PRINCIPAL: 'PRINCIPAL',
} as const;

export type Role = keyof typeof ROLES;

export const PERMISSIONS = {
  CREATE_STUDENT: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  EDIT_STUDENT: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  DELETE_STUDENT: [ROLES.ADMIN] as Role[],
  VIEW_STUDENT: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.PARENT, ROLES.STUDENT] as Role[],
    CREATE_TEACHER: [ROLES.ADMIN] as Role[],
  EDIT_TEACHER: [ROLES.ADMIN] as Role[],
  DELETE_TEACHER: [ROLES.ADMIN] as Role[],
  VIEW_TEACHER: [ROLES.ADMIN, ROLES.STAFF, ROLES.STUDENT] as Role[],
  
  MANAGE_STAFF: [ROLES.ADMIN, ROLES.PRINCIPAL] as Role[], // Staff management (incl. teacher mappings) allowed for Admin and Principal
  
  CREATE_COURSE: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  EDIT_COURSE: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  DELETE_COURSE: [ROLES.ADMIN] as Role[],
  VIEW_COURSE: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.STUDENT] as Role[],
    // Course management permissions
  MANAGE_ENROLLMENTS: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  VIEW_ENROLLMENTS: [ROLES.ADMIN, ROLES.STAFF, ROLES.TEACHER] as Role[],
  MANAGE_ASSIGNMENTS: [ROLES.ADMIN, ROLES.TEACHER] as Role[],  MANAGE_SCHEDULE: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  
  MANAGE_ATTENDANCE: [ROLES.ADMIN, ROLES.TEACHER] as Role[],
  VIEW_ATTENDANCE: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.PARENT, ROLES.STUDENT] as Role[],
  MANAGE_EXAMS: [ROLES.ADMIN, ROLES.TEACHER] as Role[],
  VIEW_EXAM_RESULTS: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.PARENT, ROLES.STUDENT] as Role[],
  
  MANAGE_GRADES: [ROLES.ADMIN, ROLES.TEACHER] as Role[],
  
  MANAGE_FEES: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  VIEW_FEES: [ROLES.ADMIN, ROLES.STAFF, ROLES.PARENT, ROLES.STUDENT] as Role[],
  
  MANAGE_ADMISSIONS: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  VIEW_ADMISSIONS: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  
  SEND_MESSAGE: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF] as Role[],
  VIEW_MESSAGE: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.PARENT, ROLES.STUDENT] as Role[],
  
  VIEW_ADMIN_DASHBOARD: [ROLES.ADMIN, ROLES.STAFF] as Role[],
  VIEW_TEACHER_DASHBOARD: [ROLES.TEACHER] as Role[],
  VIEW_STUDENT_DASHBOARD: [ROLES.STUDENT] as Role[],
  VIEW_PARENT_DASHBOARD: [ROLES.PARENT] as Role[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const hasPermission = (userRole: Role | string, permission: Permission): boolean => {
  if (!userRole || !permission) return false;
  // Add null check and handle type casting more safely
  const allowedRoles = PERMISSIONS[permission] || [];
  // Check if userRole is a valid role
  const validRoles = Object.values(ROLES);
  if (!validRoles.includes(userRole as any)) return false;
  
  return allowedRoles.includes(userRole as any);
};

export const hasAnyPermission = (userRole: Role | string, permissions: Permission[]): boolean => {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: Role | string, permissions: Permission[]): boolean => {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(userRole, permission));
};