import { Routes, Route, Navigate } from "react-router-dom";
import { DocsLayout } from "./routes/DocsLayout";
import { DocsPage } from "./routes/DocsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/docs" replace />} />
      <Route path="/docs" element={<DocsLayout />}>
        <Route index element={<DocsPage />} />
        <Route path="*" element={<DocsPage />} />
      </Route>
    </Routes>
  );
}
