import { Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { AuthGuard } from "./components/AuthGuard";
import { AlbumPage } from "./pages/AlbumPage";
import { CatalogPage } from "./pages/CatalogPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DuplicatesPage } from "./pages/DuplicatesPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OpenPackPage } from "./pages/OpenPackPage";
import { StickerDetailPage } from "./pages/StickerDetailPage";
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
          path="album"
          element={
            <AuthGuard>
              <AlbumPage />
            </AuthGuard>
          }
        />
        <Route
          path="album/:stickerId"
          element={
            <AuthGuard>
              <StickerDetailPage />
            </AuthGuard>
          }
        />
        <Route
          path="duplicates"
          element={
            <AuthGuard>
              <DuplicatesPage />
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
