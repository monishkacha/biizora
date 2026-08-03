export const ROLES = ['Owner', 'Manager', 'Accountant', 'Sales', 'Employee'];

/** Default permission matrix by role */
export const ROLE_PERMISSIONS = {
  Owner: {
    customers: ['read', 'write', 'delete'],
    products: ['read', 'write', 'delete'],
    invoices: ['read', 'write', 'delete'],
    expenses: ['read', 'write', 'delete'],
    members: ['read', 'write', 'delete'],
    settings: ['read', 'write'],
    reports: ['read'],
    billing: ['read', 'write'],
    feedback: ['read', 'write'],
    support: ['read', 'write'],
  },
  Manager: {
    customers: ['read', 'write', 'delete'],
    products: ['read', 'write', 'delete'],
    invoices: ['read', 'write', 'delete'],
    expenses: ['read', 'write'],
    members: ['read', 'write'],
    settings: ['read', 'write'],
    reports: ['read'],
    billing: ['read'],
    feedback: ['read', 'write'],
    support: ['read', 'write'],
  },
  Accountant: {
    customers: ['read'],
    products: ['read'],
    invoices: ['read', 'write'],
    expenses: ['read', 'write', 'delete'],
    members: ['read'],
    settings: ['read'],
    reports: ['read'],
    billing: ['read'],
    feedback: ['read', 'write'],
    support: ['read'],
  },
  Sales: {
    customers: ['read', 'write'],
    products: ['read'],
    invoices: ['read', 'write'],
    expenses: ['read'],
    members: ['read'],
    settings: ['read'],
    reports: ['read'],
    billing: [],
    feedback: ['read', 'write'],
    support: ['read'],
  },
  Employee: {
    customers: ['read'],
    products: ['read'],
    invoices: ['read'],
    expenses: ['read'],
    members: ['read'],
    settings: ['read'],
    reports: [],
    billing: [],
    feedback: ['read', 'write'],
    support: ['read'],
  },
};

export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.Employee;
}

export function hasPermission(permissions, resource, action) {
  if (!permissions || !permissions[resource]) return false;
  return permissions[resource].includes(action);
}
