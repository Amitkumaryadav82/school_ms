import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Permission as PermissionType, hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

interface PermissionProps {
  children: React.ReactNode;
  permission?: PermissionType;
  permissions?: PermissionType[];
  requireAll?: boolean;
}

const Permission: React.FC<PermissionProps> = ({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = false 
}) => {
  const { user } = useAuth();

  useEffect(() => {
    // Log permission checks
    if (permission) {
      console.log(`🔒 Checking permission "${permission}" for user role: "${user?.role || 'unknown'}"`, {
        hasPermission: user && user.role ? hasPermission(user.role, permission) : false
      });
    }
    
    if (permissions.length > 0) {
      console.log(`🔒 Checking permissions [${permissions.join(', ')}] for user role: "${user?.role || 'unknown'}"`, {
        requireAll,
        hasPermissions: user && user.role
          ? (requireAll 
              ? hasAllPermissions(user.role, permissions)
              : hasAnyPermission(user.role, permissions))
          : false
      });
    }
  }, [user, permission, permissions, requireAll]);

  if (!user) {
    console.warn('⚠️ Permission check failed: No user data available');
    return null;
  }

  if (permission) {
    const isAllowed = user.role ? hasPermission(user.role, permission) : false;
    console.log(`🔑 Permission "${permission}" check result: ${isAllowed ? 'granted ✅' : 'denied ❌'}`);
    if (!isAllowed) {
      return null;
    }
  }

  if (permissions.length > 0) {
    const isAllowed = user.role ? (
      requireAll 
        ? hasAllPermissions(user.role, permissions)
        : hasAnyPermission(user.role, permissions)
    ) : false;
    
    console.log(`🔑 Permissions [${permissions.join(', ')}] check result: ${isAllowed ? 'granted ✅' : 'denied ❌'}`);
    if (!isAllowed) {
      return null;
    }
  }

  return <>{children}</>;
};

export default Permission;