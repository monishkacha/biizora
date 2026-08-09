import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { ThemeProvider } from './context/ThemeContext';
import { CommandPaletteProvider } from './context/CommandPaletteContext';
import { NotificationProvider } from './context/NotificationContext';

import LandingHome from './pages/LandingHome';
import FeaturesPage from './pages/FeaturesPage';
import AIFeaturesPage from './pages/AIFeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import SupportPage from './pages/SupportPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceCreatePage from './pages/InvoiceCreatePage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import ExpensePage from './pages/ExpensePage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIPowerSuitePage from './pages/AIPowerSuitePage';
import PaymentsPage from './pages/PaymentsPage';
import SaaSBillingPage from './pages/SaaSBillingPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import TeamPage from './pages/TeamPage';
import ActivityLogPage from './pages/ActivityLogPage';
import MigrationCenterPage from './pages/MigrationCenterPage';
import MembershipPage from './pages/MembershipPage';
import SuperAdminPage from './pages/admin/SuperAdminPage';
import ModulePlaceholderPage from './pages/ModulePlaceholderPage';
import SalonCalendarPage from './pages/salon/SalonCalendarPage';
import SalonAppointmentsPage from './pages/salon/SalonAppointmentsPage';
import SalonStylistsPage from './pages/salon/SalonStylistsPage';
import SalonServicesPage from './pages/salon/SalonServicesPage';
import SalonBillingPage from './pages/salon/SalonBillingPage';
import SalonMembershipsPage from './pages/salon/SalonMembershipsPage';
import SalonReviewsPage from './pages/salon/SalonReviewsPage';
import SalonReportsPage from './pages/salon/SalonReportsPage';
import PublicBookingPage from './pages/salon/PublicBookingPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BusinessProvider>
          <NotificationProvider>
            <CommandPaletteProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingHome />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/ai-features" element={<AIFeaturesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/book" element={<PublicBookingPage />} />

                  <Route path="/app" element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="pending" element={<MembershipPage />} />
                    <Route path="membership" element={<MembershipPage />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                    <Route path="admin" element={<SuperAdminPage />} />
                    <Route path="invoices" element={<InvoiceListPage />} />
                    <Route path="invoices/new" element={<InvoiceCreatePage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="expenses" element={<ExpensePage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="ai-suite" element={<AIPowerSuitePage />} />
                    <Route path="migration" element={<MigrationCenterPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="billing" element={<SaaSBillingPage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="activity" element={<ActivityLogPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="support" element={<SupportPage />} />
                    {/* Industry / plugin module shells — configuration-driven */}
                    <Route path="appointments" element={<SalonAppointmentsPage />} />
                    <Route path="calendar" element={<SalonCalendarPage />} />
                    <Route path="stylists" element={<SalonStylistsPage />} />
                    <Route path="services" element={<SalonServicesPage />} />
                    <Route path="memberships" element={<SalonMembershipsPage />} />
                    <Route path="reviews" element={<SalonReviewsPage />} />
                    <Route path="staff-schedule" element={<ModulePlaceholderPage title="Staff Schedule" />} />
                    <Route path="packages" element={<ModulePlaceholderPage title="Packages" />} />
                    <Route path="loyalty" element={<ModulePlaceholderPage title="Loyalty" />} />
                    <Route path="customer-history" element={<ModulePlaceholderPage title="Customer History" />} />
                    <Route path="walk-ins" element={<ModulePlaceholderPage title="Walk-ins" />} />
                    <Route path="queue" element={<ModulePlaceholderPage title="Queue" />} />
                    <Route path="stylist" element={<ModulePlaceholderPage title="Stylist Dashboard" />} />
                    <Route path="commission" element={<ModulePlaceholderPage title="Commission" />} />
                    <Route path="product-inventory" element={<ModulePlaceholderPage title="Product Inventory" />} />
                    <Route path="before-after" element={<ModulePlaceholderPage title="Before After Photos" />} />
                    <Route path="revenue-analytics" element={<ModulePlaceholderPage title="Revenue Analytics" />} />
                    <Route path="tables" element={<ModulePlaceholderPage title="Tables" />} />
                    <Route path="reservations" element={<ModulePlaceholderPage title="Reservations" />} />
                    <Route path="kitchen" element={<ModulePlaceholderPage title="Kitchen Display" />} />
                    <Route path="orders" element={<ModulePlaceholderPage title="Orders" />} />
                    <Route path="takeaway" element={<ModulePlaceholderPage title="Takeaway" />} />
                    <Route path="delivery" element={<ModulePlaceholderPage title="Delivery" />} />
                    <Route path="menu" element={<ModulePlaceholderPage title="Menu" />} />
                    <Route path="recipe-costing" element={<ModulePlaceholderPage title="Recipe Costing" />} />
                    <Route path="ingredients" element={<ModulePlaceholderPage title="Ingredients" />} />
                    <Route path="waste" element={<ModulePlaceholderPage title="Waste Tracking" />} />
                    <Route path="chef" element={<ModulePlaceholderPage title="Chef Dashboard" />} />
                    <Route path="peak-hours" element={<ModulePlaceholderPage title="Peak Hour Analytics" />} />
                    <Route path="barcode" element={<ModulePlaceholderPage title="Barcode" />} />
                    <Route path="pos" element={<ModulePlaceholderPage title="POS" />} />
                    <Route path="returns" element={<ModulePlaceholderPage title="Returns" />} />
                    <Route path="purchase-orders" element={<ModulePlaceholderPage title="Purchase Orders" />} />
                    <Route path="discount-rules" element={<ModulePlaceholderPage title="Discount Rules" />} />
                    <Route path="offers" element={<ModulePlaceholderPage title="Offers" />} />
                    <Route path="gst-billing" element={<ModulePlaceholderPage title="GST Billing" />} />
                    <Route path="stock-alerts" element={<ModulePlaceholderPage title="Stock Alerts" />} />
                    <Route path="raw-materials" element={<ModulePlaceholderPage title="Raw Materials" />} />
                    <Route path="production-orders" element={<ModulePlaceholderPage title="Production Orders" />} />
                    <Route path="bom" element={<ModulePlaceholderPage title="Bill Of Materials" />} />
                    <Route path="machines" element={<ModulePlaceholderPage title="Machines" />} />
                    <Route path="maintenance" element={<ModulePlaceholderPage title="Maintenance" />} />
                    <Route path="warehouse" element={<ModulePlaceholderPage title="Warehouse" />} />
                    <Route path="qc" element={<ModulePlaceholderPage title="QC" />} />
                    <Route path="finished-goods" element={<ModulePlaceholderPage title="Finished Goods" />} />
                    <Route path="production-reports" element={<ModulePlaceholderPage title="Production Reports" />} />
                    <Route path="retail-billing" element={<ModulePlaceholderPage title="Retail Billing" />} />
                    <Route path="wholesale" element={<ModulePlaceholderPage title="Wholesale" />} />
                    <Route path="school-orders" element={<ModulePlaceholderPage title="School Orders" />} />
                    <Route path="bulk-pricing" element={<ModulePlaceholderPage title="Bulk Pricing" />} />
                    <Route path="sales-reports" element={<ModulePlaceholderPage title="Sales Reports" />} />
                    <Route path="suppliers" element={<ModulePlaceholderPage title="Suppliers" />} />
                    <Route path="sales" element={<ModulePlaceholderPage title="Sales" />} />
                    <Route path="vehicle-tracking" element={<ModulePlaceholderPage title="Vehicle Tracking" description="Custom feature enabled for this tenant only." />} />
                    <Route path="repair-center" element={<ModulePlaceholderPage title="Repair Center" />} />
                    <Route path="medicine-expiry" element={<ModulePlaceholderPage title="Medicine Expiry" />} />
                    <Route path="purchase-approval" element={<ModulePlaceholderPage title="Purchase Approval" />} />
                    <Route path="ai-forecasting" element={<ModulePlaceholderPage title="AI Forecasting" />} />
                    <Route path="ai-hair" element={<ModulePlaceholderPage title="AI Hair Recommendation" />} />
                    <Route path="reservation-ai" element={<ModulePlaceholderPage title="Table Reservation AI" />} />
                    <Route path="amazon-sync" element={<ModulePlaceholderPage title="Amazon Sync" />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CommandPaletteProvider>
          </NotificationProvider>
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
