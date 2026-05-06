import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PetrolordHSE from '@/components/PetrolordHSE';
import HomePage from '@/pages/HomePage';
import PricingPage from '@/pages/PricingPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import SecurityPage from '@/pages/SecurityPage';
import BenefitPage from '@/pages/BenefitPage';
import SignIn from '@/components/auth/SignIn';
import ForgotPassword from '@/components/auth/ForgotPassword';
import OrganizationSignup from '@/components/auth/OrganizationSignup';
import InvitationAcceptance from '@/components/auth/InvitationAcceptance';
import ConfirmationPage from '@/components/auth/ConfirmationPage';
import RegistrationConfirmation from '@/components/auth/RegistrationConfirmation';
import SetPassword from '@/components/auth/SetPassword';
import AuthCallback from '@/components/auth/AuthCallback';
import SuperAdminBrandingPage from '@/pages/SuperAdminBrandingPage';
import SuiteDashboard from '@/components/suite/SuiteDashboard';
import AdvancedAnalyticsDashboard from '@/components/hse/analytics/AdvancedAnalyticsDashboard';
import SafetyContentAuditor from '@/components/admin/SafetyContentAuditor';
import OrganizationSettings from '@/pages/OrganizationSettings';
import { HSEProvider } from '@/context/HSEContext';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { GlobalUIProvider } from '@/context/GlobalUIContext';
import { GlobalThemeProvider } from '@/context/GlobalThemeContext';
import { RealtimeProvider } from '@/context/RealtimeContext';
import { AIAnalyticsProvider } from '@/context/AIAnalyticsContext';
import { FeatureAccessProvider } from '@/context/FeatureAccessContext';
import { AppStateProvider } from '@/context/AppStateContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import BackgroundSync from '@/components/common/BackgroundSync';
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Helmet>
          <title>Petrolord HSE - Integrated Health, Safety, Security & Environment Platform</title>
          <meta name="description" content="Comprehensive HSE management platform for modern energy enterprises." />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Helmet>
        
        {/* AuthProvider must be high level to check auth status immediately */}
        <AuthProvider>
          <FeatureAccessProvider>
            <AppStateProvider>
              <HSEProvider>
                <GlobalUIProvider>
                  <GlobalThemeProvider>
                    <RealtimeProvider>
                      <AIAnalyticsProvider>
                        <TooltipProvider>
                          <OfflineIndicator />
                          <PWAInstallPrompt />
                          <BackgroundSync />
                          
                          <Routes>
                            {/* ================================================================== */}
                            {/* PUBLIC ROUTES - Accessible without login */}
                            {/* ================================================================== */}
                            
                            <Route path="/" element={<HomePage />} />
                            <Route path="/benefits/:slug" element={<BenefitPage />} />
                            <Route path="/pricing" element={<PricingPage />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                            <Route path="/security" element={<SecurityPage />} />

                            <Route path="/login" element={<SignIn />} />
                            <Route path="/signup" element={<OrganizationSignup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            
                            <Route path="/auth/confirm" element={<ConfirmationPage />} />
                            <Route path="/auth/registration-confirmation" element={<RegistrationConfirmation />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route path="/accept-invite/:token" element={<InvitationAcceptance />} />
                            
                            {/* Set/Update Password Route - Protected by magic link session or auth state */}
                            {/* FIXED: Path updated to match what edge functions redirect to */}
                            <Route path="/auth/reset-password" element={<SetPassword />} />
                            
                            {/* ================================================================== */}
                            {/* PROTECTED ROUTES - Require Authentication via ProtectedRoute */}
                            {/* ================================================================== */}
                            
                            <Route element={<ProtectedRoute />}>
                               <Route path="/dashboard/*" element={<PetrolordHSE />} />
                               <Route path="/dashboard/analytics/advanced" element={<AdvancedAnalyticsDashboard />} />
                               <Route path="/suite/*" element={<SuiteDashboard />} />
                               <Route path="/dashboard/super-admin/branding" element={<SuperAdminBrandingPage />} />
                               <Route path="/organization" element={<OrganizationSettings />} />
                               {/* ADMIN TOOL: Safety Content Auditor */}
                               <Route path="/auditor" element={<SafetyContentAuditor />} />
                            </Route>
                            
                            {/* Catch-all redirect to Home for unknowns */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                          <Toaster />
                        </TooltipProvider>
                      </AIAnalyticsProvider>
                    </RealtimeProvider>
                  </GlobalThemeProvider>
                </GlobalUIProvider>
              </HSEProvider>
            </AppStateProvider>
          </FeatureAccessProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;