import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import BillingRoute from "./routes/BillingRoute";
import DocsRoute from "./routes/DocsRoute";
import EditorRoute from "./routes/EditorRoute";
import LandingRoute from "./routes/LandingRoute";
import LoginRoute from "./routes/LoginRoute";
import ProfileRoute from "./routes/ProfileRoute";
import ShareRoute from "./routes/ShareRoute";
import SignupRoute from "./routes/SignupRoute";
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
