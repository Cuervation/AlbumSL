import { Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { AuthGuard } from "./components/AuthGuard";
import { CatalogPage } from "./pages/CatalogPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OpenPackPage } from "./pages/OpenPackPage";
import "./styles.css";

export function App(): React.JSX.Element {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="catalog"
          element={
            <AuthGuard>
              <CatalogPage />
            </AuthGuard>
          }
        />
        <Route
          path="open-pack"
          element={
            <AuthGuard>
              <OpenPackPage />
            </AuthGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
