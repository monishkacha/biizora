/**
 * RBAC — roles and default permission matrix.
 * New roles added without removing legacy Accountant / Sales.
 */

export const ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'Employee',
  'Cashier',
  'Receptionist',
  'Viewer',
  // Legacy (preserved for existing memberships)
  'Accountant',
  'Sales',
];

const FULL = ['read', 'write', 'delete'];
const RW = ['read', 'write'];
const R = ['read'];
const NONE = [];

/** Default permission matrix by role */
export const ROLE_PERMISSIONS = {
  Owner: {
    customers: FULL,
    products: FULL,
    invoices: FULL,
    expenses: FULL,
    members: FULL,
    settings: RW,
    reports: R,
    billing: RW,
    feedback: RW,
    support: RW,
    admin: FULL,
  },
  Admin: {
    customers: FULL,
    products: FULL,
    invoices: FULL,
    expenses: FULL,
    members: FULL,
    settings: RW,
    reports: R,
    billing: R,
    feedback: RW,
    support: RW,
    admin: RW,
  },
  Manager: {
    customers: FULL,
    products: FULL,
    invoices: FULL,
    expenses: RW,
    members: RW,
    settings: RW,
    reports: R,
    billing: R,
    feedback: RW,
    support: RW,
    admin: NONE,
  },
  Employee: {
    customers: R,
    products: R,
    invoices: R,
    expenses: R,
    members: R,
    settings: R,
    reports: NONE,
    billing: NONE,
    feedback: RW,
    support: R,
    admin: NONE,
  },
  Cashier: {
    customers: RW,
    products: R,
    invoices: RW,
    expenses: R,
    members: NONE,
    settings: R,
    reports: NONE,
    billing: NONE,
    feedback: R,
    support: R,
    admin: NONE,
  },
  Receptionist: {
    customers: RW,
    products: R,
    invoices: R,
    expenses: NONE,
    members: R,
    settings: R,
    reports: NONE,
    billing: NONE,
    feedback: RW,
    support: R,
    admin: NONE,
  },
  Viewer: {
    customers: R,
    products: R,
    invoices: R,
    expenses: R,
    members: R,
    settings: R,
    reports: R,
    billing: NONE,
    feedback: R,
    support: R,
    admin: NONE,
  },
  Accountant: {
    customers: R,
    products: R,
    invoices: RW,
    expenses: FULL,
    members: R,
    settings: R,
    reports: R,
    billing: R,
    feedback: RW,
    support: R,
    admin: NONE,
  },
  Sales: {
    customers: RW,
    products: R,
    invoices: RW,
    expenses: R,
    members: R,
    settings: R,
    reports: R,
    billing: NONE,
    feedback: RW,
    support: R,
    admin: NONE,
  },
};

export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.Employee;
}

export function hasPermission(permissions, resource, action) {
  if (!permissions || !permissions[resource]) return false;
  return permissions[resource].includes(action);
}

/** Parse "resource.action" permission strings from module defs */
export function hasPermissionString(permissions, permissionString) {
  if (!permissionString) return true;
  const [resource, action] = String(permissionString).split('.');
  return hasPermission(permissions, resource, action);
}
