import React from 'react';
import { Navigate } from 'react-router-dom';

/** Billing redirects to the Membership page (single source of truth). */
export default function SaaSBillingPage() {
  return <Navigate to="/app/membership" replace />;
}
