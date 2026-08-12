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

// Salon Modules
import SalonCalendarPage from './pages/salon/SalonCalendarPage';
import SalonAppointmentsPage from './pages/salon/SalonAppointmentsPage';
import SalonStylistsPage from './pages/salon/SalonStylistsPage';
import SalonServicesPage from './pages/salon/SalonServicesPage';
import SalonBillingPage from './pages/salon/SalonBillingPage';
import SalonMembershipsPage from './pages/salon/SalonMembershipsPage';
import SalonReviewsPage from './pages/salon/SalonReviewsPage';
import SalonReportsPage from './pages/salon/SalonReportsPage';
import SalonCustomersPage from './pages/salon/SalonCustomersPage';

// Restaurant Modules
import PublicBookingPage from './pages/restaurant/PublicBookingPage';
import PublicOrderingPage from './pages/restaurant/PublicOrderingPage';
import RestaurantTablesPage from './pages/restaurant/TablesPage';
import RestaurantReservationsPage from './pages/restaurant/ReservationsPage';
import RestaurantOrdersPOSPage from './pages/restaurant/OrdersPOSPage';
import RestaurantKitchenDisplayPage from './pages/restaurant/KitchenDisplayPage';
import RestaurantMenuPage from './pages/restaurant/MenuPage';
import RestaurantOffersPage from './pages/restaurant/OffersPage';
import RestaurantBillingPage from './pages/restaurant/BillingPage';

// Stationery Modules
import StationeryPOSBillingPage from './pages/stationery/StationeryPOSBillingPage';
import StationeryBillsPage from './pages/stationery/StationeryBillsPage';
import StationeryProductsPage from './pages/stationery/StationeryProductsPage';
import StationeryInventoryPage from './pages/stationery/StationeryInventoryPage';
import StationeryCustomersPage from './pages/stationery/StationeryCustomersPage';
import StationeryVendorsPage from './pages/stationery/StationeryVendorsPage';
import StationerySchoolOrdersPage from './pages/stationery/StationerySchoolOrdersPage';
import StationeryPrintXeroxPage from './pages/stationery/StationeryPrintXeroxPage';
import StationeryReportsPage from './pages/stationery/StationeryReportsPage';
import StationerySettingsPage from './pages/stationery/StationerySettingsPage';

// Standalone Manufacturing Pages
import SuppliersPage from './pages/manufacturing/SuppliersPage';
import RawMaterialsPage from './pages/manufacturing/RawMaterialsPage';
import ProductionOrdersPage from './pages/manufacturing/ProductionOrdersPage';
import MachinesPage from './pages/manufacturing/MachinesPage';
import WarehousePage from './pages/manufacturing/WarehousePage';
import QCPage from './pages/manufacturing/QCPage';

// Demo Modules
import {
  BillOfMaterialsPage,
  QualityControlPage
} from './pages/demoModules/ManufacturingPages';

import {
  RetailBillingPage,
  StockAlertsPage
} from './pages/demoModules/RetailPages';

import {
  AIHairRecommendationPage,
  AIForecastingPage,
  TableReservationAIPage,
  GSTBillingPage,
  IntegrationsHubPage
} from './pages/demoModules/AIFeaturePages';

import { useAuth } from './context/AuthContext';
import { useBusiness } from './context/BusinessContext';

function DynamicBillingPage() {
  const { company } = useBusiness();
  const { activeWorkspace } = useAuth();
  const type = (company?.businessType || activeWorkspace?.businessType || 'general').toLowerCase();

  if (type === 'salon') return <SalonBillingPage />;
  if (type === 'stationery') return <StationeryPOSBillingPage />;
  return <RestaurantBillingPage />;
}

function DynamicPOSPage() {
  const { company } = useBusiness();
  const { activeWorkspace } = useAuth();
  const type = (company?.businessType || activeWorkspace?.businessType || 'general').toLowerCase();

  if (type === 'salon') return <SalonBillingPage />;
  if (type === 'stationery') return <StationeryPOSBillingPage />;
  return <RestaurantOrdersPOSPage />;
}

function DynamicCustomersPage() {
  const { company } = useBusiness();
  const { activeWorkspace } = useAuth();
  const type = (company?.businessType || activeWorkspace?.businessType || 'general').toLowerCase();

  if (type === 'salon') return <SalonCustomersPage />;
  if (type === 'stationery') return <StationeryCustomersPage />;
  return <CustomersPage />;
}

function DynamicMembershipPage() {
  const { company } = useBusiness();
  const { activeWorkspace } = useAuth();
  const type = (company?.businessType || activeWorkspace?.businessType || 'general').toLowerCase();

  if (type === 'salon') return <SalonMembershipsPage />;
  return <MembershipPage />;
}

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
                  <Route path="/order" element={<PublicOrderingPage />} />

                  {/* Top-Level Stationery Billing Shortcut */}
                  <Route path="/stationery/billing" element={<AppLayout><StationeryPOSBillingPage /></AppLayout>} />

                  <Route path="/app" element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="pending" element={<DynamicMembershipPage />} />
                    <Route path="membership" element={<DynamicMembershipPage />} />
                    <Route path="memberships" element={<DynamicMembershipPage />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                    <Route path="admin" element={<SuperAdminPage />} />
                    <Route path="invoices" element={<InvoiceListPage />} />
                    <Route path="invoices/new" element={<InvoiceCreatePage />} />
                    <Route path="customers" element={<DynamicCustomersPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="expenses" element={<ExpensePage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="ai-suite" element={<AIPowerSuitePage />} />
                    <Route path="migration" element={<MigrationCenterPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="billing" element={<DynamicBillingPage />} />
                    <Route path="pos" element={<DynamicPOSPage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="activity" element={<ActivityLogPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="support" element={<SupportPage />} />

                    {/* Salon Dedicated Routes */}
                    <Route path="appointments" element={<SalonAppointmentsPage />} />
                    <Route path="calendar" element={<SalonCalendarPage />} />
                    <Route path="stylists" element={<SalonStylistsPage />} />
                    <Route path="services" element={<SalonServicesPage />} />
                    <Route path="memberships" element={<SalonMembershipsPage />} />
                    <Route path="reviews" element={<SalonReviewsPage />} />
                    <Route path="customer-history" element={<SalonCustomersPage />} />
                    <Route path="walk-ins" element={<SalonAppointmentsPage />} />
                    <Route path="queue" element={<SalonAppointmentsPage />} />
                    <Route path="stylist" element={<SalonStylistsPage />} />
                    <Route path="commission" element={<SalonStylistsPage />} />

                    {/* Stationery Dedicated Routes */}
                    <Route path="stationery/billing" element={<StationeryPOSBillingPage />} />
                    <Route path="stationery/bills" element={<StationeryBillsPage />} />
                    <Route path="stationery/products" element={<StationeryProductsPage />} />
                    <Route path="stationery/inventory" element={<StationeryInventoryPage />} />
                    <Route path="stationery/customers" element={<StationeryCustomersPage />} />
                    <Route path="stationery/vendors" element={<StationeryVendorsPage />} />
                    <Route path="stationery/school-orders" element={<StationerySchoolOrdersPage />} />
                    <Route path="stationery/print-xerox" element={<StationeryPrintXeroxPage />} />
                    <Route path="stationery/reports" element={<StationeryReportsPage />} />
                    <Route path="stationery/settings" element={<StationerySettingsPage />} />

                    {/* Salon Dedicated Routes */}
                    <Route path="calendar" element={<SalonCalendarPage />} />
                    <Route path="appointments" element={<SalonAppointmentsPage />} />
                    <Route path="stylists" element={<SalonStylistsPage />} />
                    <Route path="services" element={<SalonServicesPage />} />
                    <Route path="memberships" element={<SalonMembershipsPage />} />
                    <Route path="reviews" element={<SalonReviewsPage />} />
                    <Route path="salon-reports" element={<SalonReportsPage />} />

                    {/* Restaurant Routes */}
                    <Route path="tables" element={<RestaurantTablesPage />} />
                    <Route path="reservations" element={<RestaurantReservationsPage />} />
                    <Route path="kitchen" element={<RestaurantKitchenDisplayPage />} />
                    <Route path="orders" element={<RestaurantOrdersPOSPage />} />
                    <Route path="menu" element={<RestaurantMenuPage />} />
                    <Route path="offers" element={<RestaurantOffersPage />} />
                    {/* Manufacturing Routes */}
                    <Route path="production-orders" element={<ProductionOrdersPage />} />
                    <Route path="bom" element={<BillOfMaterialsPage />} />
                    <Route path="machines" element={<MachinesPage />} />
                    <Route path="maintenance" element={<MachinesPage />} />
                    <Route path="warehouse" element={<WarehousePage />} />
                    <Route path="qc" element={<QCPage />} />
                    <Route path="raw-materials" element={<RawMaterialsPage />} />
                    <Route path="finished-goods" element={<ProductionOrdersPage />} />
                    <Route path="production-reports" element={<ProductionOrdersPage />} />

                    {/* Retail Routes */}
                    <Route path="retail-billing" element={<RetailBillingPage />} />
                    <Route path="stock-alerts" element={<StockAlertsPage />} />
                    <Route path="suppliers" element={<SuppliersPage />} />
                    <Route path="sales" element={<RetailBillingPage />} />
                    <Route path="sales-reports" element={<ReportsPage />} />
                    <Route path="wholesale" element={<RetailBillingPage />} />
                    <Route path="school-orders" element={<StationerySchoolOrdersPage />} />
                    <Route path="bulk-pricing" element={<RetailBillingPage />} />

                    {/* AI & Integration Features */}
                    <Route path="gst-billing" element={<GSTBillingPage />} />
                    <Route path="vehicle-tracking" element={<IntegrationsHubPage />} />
                    <Route path="repair-center" element={<IntegrationsHubPage />} />
                    <Route path="medicine-expiry" element={<StockAlertsPage />} />
                    <Route path="purchase-approval" element={<SuppliersPage />} />
                    <Route path="ai-forecasting" element={<AIForecastingPage />} />
                    <Route path="ai-hair" element={<AIHairRecommendationPage />} />
                    <Route path="reservation-ai" element={<TableReservationAIPage />} />
                    <Route path="amazon-sync" element={<IntegrationsHubPage />} />
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
