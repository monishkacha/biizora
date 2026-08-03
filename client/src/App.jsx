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
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  <Route path="/app" element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                    <Route path="invoices" element={<InvoiceListPage />} />
                    <Route path="invoices/new" element={<InvoiceCreatePage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="expenses" element={<ExpensePage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="ai-suite" element={<AIPowerSuitePage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="billing" element={<SaaSBillingPage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="activity" element={<ActivityLogPage />} />
                    <Route path="settings" element={<SettingsPage />} />
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
