import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { AdminGuard } from "./components/AdminGuard";
import { AuthGuard } from "./components/AuthGuard";
import { LoadingScreen } from "./components/LoadingScreen";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import "./styles.css";

const AdminDashboardPage = lazy(() =>
  import("./pages/AdminDashboardPage").then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const AlbumPage = lazy(() =>
  import("./pages/AlbumPage").then((module) => ({ default: module.AlbumPage })),
);
const CatalogPage = lazy(() =>
  import("./pages/CatalogPage").then((module) => ({ default: module.CatalogPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const DuplicatesPage = lazy(() =>
  import("./pages/DuplicatesPage").then((module) => ({ default: module.DuplicatesPage })),
);
const OpenPackPage = lazy(() =>
  import("./pages/OpenPackPage").then((module) => ({ default: module.OpenPackPage })),
);
const StickerDetailPage = lazy(() =>
  import("./pages/StickerDetailPage").then((module) => ({
    default: module.StickerDetailPage,
  })),
);

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
              <LazyRoute>
                <DashboardPage />
              </LazyRoute>
            </AuthGuard>
          }
        />
        <Route
          path="admin"
          element={
            <AuthGuard>
              <AdminGuard>
                <LazyRoute>
                  <AdminDashboardPage />
                </LazyRoute>
              </AdminGuard>
            </AuthGuard>
          }
        />
        <Route
          path="catalog"
          element={
            <AuthGuard>
              <LazyRoute>
                <CatalogPage />
              </LazyRoute>
            </AuthGuard>
          }
        />
        <Route
          path="album"
          element={
            <AuthGuard>
              <LazyRoute>
                <AlbumPage />
              </LazyRoute>
            </AuthGuard>
          }
        />
        <Route
          path="album/:stickerId"
          element={
            <AuthGuard>
              <LazyRoute>
                <StickerDetailPage />
              </LazyRoute>
            </AuthGuard>
          }
        />
        <Route
          path="duplicates"
          element={
            <AuthGuard>
              <LazyRoute>
                <DuplicatesPage />
              </LazyRoute>
            </AuthGuard>
          }
        />
        <Route
          path="open-pack"
          element={
            <AuthGuard>
              <LazyRoute>
                <OpenPackPage />
              </LazyRoute>
            </AuthGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function LazyRoute({ children }: { readonly children: ReactNode }): React.JSX.Element {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}
