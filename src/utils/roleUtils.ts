/**
 * Role Utilities
 * Map backend roles to app roles (similar to web app)
 */

export type AppRole = 'user' | 'staff';

/**
 * Map backend role to app role
 * Similar to mapRoleToAppRole in web app
 */
export const mapRoleToAppRole = (role?: string): AppRole => {
  if (!role) {
    return 'user';
  }

  let r = role.trim().toUpperCase();

  // Remove ROLE_ prefix if present
  if (r.startsWith('ROLE_')) {
    r = r.substring(5);
  }

  // Map to app roles (only user and staff)
  if (['STAFF'].includes(r)) {
    return 'staff';
  }
  if (['USER'].includes(r)) {
    return 'user';
  }

  // Default to user for admin/office roles
  return 'user';
};

/**
 * Get primary role from roles array
 */
export const getUserRole = (roles?: string[]): AppRole => {
  if (!roles || roles.length === 0) {
    return 'user';
  }

  // Check for staff first, then default to user
  for (const role of roles) {
    const appRole = mapRoleToAppRole(role);
    if (appRole === 'staff') {
      return 'staff';
    }
  }

  return 'user';
};

/**
 * Check if user has staff role
 */
export const isStaffRole = (roles?: string[]): boolean => {
  if (!roles || roles.length === 0) {
    return false;
  }
  return roles.some(role => {
    const r = role
      .trim()
      .toUpperCase()
      .replace(/^ROLE_/, '');
    return ['STAFF'].includes(r);
  });
};
