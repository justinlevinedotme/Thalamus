/**
 * @file App.tsx
 * @description Root application component that defines all routes using React Router.
 * Initializes authentication state on mount and provides route configuration for
 * the landing page, editor, authentication flows, /me hub, and user account pages.
 */

import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AuthRoute from "./routes/AuthRoute";
import BillingRoute from "./routes/BillingRoute";
import EditorRoute from "./routes/EditorRoute";
import ForgotPasswordRoute from "./routes/ForgotPasswordRoute";
import LandingRoute from "./routes/LandingRoute";
import MeLayoutRoute from "./routes/MeLayoutRoute";
import NotFoundRoute from "./routes/NotFoundRoute";
import ProfileRoute from "./routes/ProfileRoute";
import ResetPasswordRoute from "./routes/ResetPasswordRoute";
import ShareRoute from "./routes/ShareRoute";
import UnsubscribeRoute from "./routes/UnsubscribeRoute";
import VerifyEmailRoute from "./routes/VerifyEmailRoute";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />

      {/* /me hub - centralized workspace and account management */}
      <Route path="/me" element={<MeLayoutRoute />}>
        {/* Default /me to /me/files */}
        <Route index element={<Navigate to="/me/files" replace />} />
        {/* Workspace routes - to be implemented */}
        <Route path="files" element={<div>Files (coming soon)</div>} />
        <Route path="saved-nodes" element={<div>Saved Nodes (coming soon)</div>} />
        <Route path="templates" element={<div>Templates (coming soon)</div>} />
        <Route path="shared-links" element={<div>Shared Links (coming soon)</div>} />
        {/* Account routes - to be implemented */}
        <Route path="account/general" element={<div>General (coming soon)</div>} />
        <Route path="account/billing" element={<div>Billing (coming soon)</div>} />
        <Route path="account/security" element={<div>Security (coming soon)</div>} />
        <Route path="account/connections" element={<div>Connections (coming soon)</div>} />
        <Route path="account/privacy" element={<div>Data & Privacy (coming soon)</div>} />
      </Route>

      {/* Editor routes */}
      <Route path="/editor" element={<EditorRoute />} />
      <Route path="/editor/:graphId" element={<EditorRoute />} />

      {/* Share route */}
      <Route path="/share/:token" element={<ShareRoute />} />

      {/* Legacy routes - redirect to /me */}
      <Route path="/billing" element={<BillingRoute />} />
      <Route path="/profile" element={<ProfileRoute />} />

      {/* /docs is now 404 (reserved for future documentation) */}
      <Route path="/docs" element={<NotFoundRoute />} />
      <Route path="/docs/*" element={<NotFoundRoute />} />

      {/* Auth routes */}
      <Route path="/login" element={<AuthRoute />} />
      <Route path="/signup" element={<AuthRoute />} />
      <Route path="/verify-email" element={<VerifyEmailRoute />} />
      <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
      <Route path="/reset-password" element={<ResetPasswordRoute />} />
      <Route path="/unsubscribe" element={<UnsubscribeRoute />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}
