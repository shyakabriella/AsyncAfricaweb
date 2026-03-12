import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Layouts from "../components/Layouts";
import DashboardLayouts from "../components/DashboardLayouts";
import AdminDashboard from "../components/AdminDashboard";
import CustomerChatWidget from "../components/support/CustomerChatWidget";

import Home from "../pages/Home";
import Login from "../pages/Auth/Login";
import Services from "../pages/Services";
import ServiceDetails from "../pages/ServiceDetails";
import Training from "../pages/Training/Training";
import TrainingDetails from "../pages/Training/TrainingDetails";
import ApplicationReceived from "../pages/Training/ApplicationReceived";
import ApplicationDetails from "../pages/Training/ApplicationDetails";
import Wallet from "../pages/Training/Wallet";
import Projects from "../pages/Projects";
import Contact from "../pages/Contact";

import Program from "../dashboard/Program";
import ProgramDetails from "../dashboard/ProgramDetails";
import User from "../dashboard/User";
import ServiceDirectory from "../dashboard/ServiceDirectory";
import SystemSetting from "../dashboard/SystemSetting";
import Internaship from "../dashboard/Internaship";
import CeoDashboard from "../dashboard/ceo/CeoDashboard";
import TrainerDashboard from "../dashboard/Trainer/TrainerDashboard";

import {
  getAuthState,
  getDashboardPathByRole,
  normalizeRole,
  isKnownRole,
} from "../lib/auth";

function RequireAuth({ children }) {
  const location = useLocation();
  const { token, role } = getAuthState();

  if (!token || !isKnownRole(role)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { token, role } = getAuthState();

  if (token && isKnownRole(role)) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return children;
}

function RequireRole({ allowedRoles = [], children }) {
  const { token, role } = getAuthState();
  const normalizedAllowedRoles = allowedRoles.map((item) =>
    normalizeRole(item)
  );

  if (!token || !isKnownRole(role)) {
    return <Navigate to="/login" replace />;
  }

  if (!normalizedAllowedRoles.includes(role)) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return children;
}

function DashboardIndexRedirect() {
  const { token, role } = getAuthState();

  if (!token || !isKnownRole(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPathByRole(role)} replace />;
}

export default function AppRoutes() {
  const location = useLocation();

  const hideChatWidget =
    location.pathname === "/login" ||
    location.pathname.startsWith("/dashboard");

  return (
    <>
      <Routes>
        <Route path="/" element={<Layouts />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetails />} />
          <Route path="training" element={<Training />} />
          <Route path="training/:slug" element={<TrainingDetails />} />
          <Route path="projects" element={<Projects />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayouts />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardIndexRedirect />} />

          <Route
            path="admin"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <AdminDashboard />
              </RequireRole>
            }
          />

          <Route
            path="ceo"
            element={
              <RequireRole allowedRoles={["ceo"]}>
                <CeoDashboard />
              </RequireRole>
            }
          />

          <Route
            path="trainer"
            element={
              <RequireRole allowedRoles={["trainer"]}>
                <TrainerDashboard />
              </RequireRole>
            }
          />

          <Route
            path="programs"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <Program />
              </RequireRole>
            }
          />

          <Route
            path="programs/:id"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <ProgramDetails />
              </RequireRole>
            }
          />

          <Route
            path="applications"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <ApplicationReceived />
              </RequireRole>
            }
          />

          <Route
            path="applications/:id"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <ApplicationDetails />
              </RequireRole>
            }
          />

          <Route
            path="internaship"
            element={
              <RequireRole allowedRoles={["admin", "trainer"]}>
                <Internaship />
              </RequireRole>
            }
          />

          <Route
            path="internship"
            element={<Navigate to="/dashboard/internaship" replace />}
          />

          <Route
            path="wallet"
            element={
              <RequireRole allowedRoles={["trainer"]}>
                <Wallet />
              </RequireRole>
            }
          />

          <Route
            path="users"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <User />
              </RequireRole>
            }
          />

          <Route
            path="service-directory"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <ServiceDirectory />
              </RequireRole>
            }
          />

          <Route
            path="settings"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <SystemSetting />
              </RequireRole>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!hideChatWidget ? <CustomerChatWidget /> : null}
    </>
  );
}