export const ROLES = ['Owner', 'Manager', 'Accountant', 'Sales', 'Employee'];

export function can(permissions, resource, action) {
  if (!permissions || !permissions[resource]) return false;
  return permissions[resource].includes(action);
}
