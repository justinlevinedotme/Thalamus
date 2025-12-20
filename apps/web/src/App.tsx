import { Navigate, Route, Routes } from "react-router-dom";

import EditorRoute from "./routes/EditorRoute";

export default function App() {
  return (
    <Routes>
      <Route path=\"/\" element={<EditorRoute />} />
      <Route path=\"*\" element={<Navigate to=\"/\" replace />} />
    </Routes>
  );
}
