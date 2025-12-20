import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import EditorRoute from "./routes/EditorRoute";
import DocsRoute from "./routes/DocsRoute";
import LoginRoute from "./routes/LoginRoute";
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
      <Route path="/" element={<Navigate to="/docs" replace />} />
      <Route path="/docs" element={<DocsRoute />} />
      <Route path="/editor" element={<EditorRoute />} />
      <Route path="/docs/:graphId" element={<EditorRoute />} />
      <Route path="/share/:token" element={<ShareRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/signup" element={<SignupRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
