import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "@/routes/LoginPage";
import DashboardPage from "@/routes/DashboardPage";
import PurchasesListPage from "@/routes/PurchasesListPage";
import PartiesPage from "@/routes/PartiesPage";
import PurchaseDetailsPage from "@/routes/PurchaseDetailsPage";
import CreatePurchasePage from "@/routes/CreatePurchasePage";
import AppShell from "@/components/layout/AppShell";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <AppShell>
                <PurchasesListPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <CreatePurchasePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <PurchaseDetailsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parties"
          element={
            <ProtectedRoute>
              <AppShell>
                <PartiesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
