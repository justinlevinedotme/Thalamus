import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import BillingRoute from "./routes/BillingRoute";
import DocsRoute from "./routes/DocsRoute";
import EditorRoute from "./routes/EditorRoute";
import ForgotPasswordRoute from "./routes/ForgotPasswordRoute";
import LandingRoute from "./routes/LandingRoute";
import LoginRoute from "./routes/LoginRoute";
import ProfileRoute from "./routes/ProfileRoute";
import ResetPasswordRoute from "./routes/ResetPasswordRoute";
import ShareRoute from "./routes/ShareRoute";
import SignupRoute from "./routes/SignupRoute";
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
      <Route path="/docs" element={<DocsRoute />} />
      <Route path="/editor" element={<EditorRoute />} />
      <Route path="/docs/:graphId" element={<EditorRoute />} />
      <Route path="/share/:token" element={<ShareRoute />} />
      <Route path="/billing" element={<BillingRoute />} />
      <Route path="/profile" element={<ProfileRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/signup" element={<SignupRoute />} />
      <Route path="/verify-email" element={<VerifyEmailRoute />} />
      <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
      <Route path="/reset-password" element={<ResetPasswordRoute />} />
      <Route path="/unsubscribe" element={<UnsubscribeRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
