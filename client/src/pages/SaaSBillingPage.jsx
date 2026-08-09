import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SalonBillingPage from './salon/SalonBillingPage';

/** Billing redirects to the Membership page, except for Salon POS billing. */
export default function SaaSBillingPage() {
  const { activeWorkspace } = useAuth();
  if (activeWorkspace?.businessType === 'salon') {
    return <SalonBillingPage />;
  }
  return <Navigate to="/app/membership" replace />;
}
