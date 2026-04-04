import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
import {
  getAuthState,
  getDashboardPathByRole,
  normalizeRole,
  isKnownRole,
} from "../lib/auth";

function getBaseDashboardTitle(role) {
  switch (normalizeRole(role)) {
    case "admin":
      return "Admin Dashboard";
    case "ceo":
      return "CEO Dashboard";
    case "trainer":
      return "Trainer Dashboard";
    case "student":
      return "Student Dashboard";
    case "agent":
      return "Agent Dashboard";
    case "school_owner":
      return "School Owner Dashboard";
    default:
      return "Dashboard";
  }
}

function getTitle(path, role) {
  const normalizedRole = normalizeRole(role);

  if (
    path === "/dashboard" ||
    path === "/dashboard/admin" ||
    path === "/dashboard/ceo" ||
    path === "/dashboard/trainer" ||
    path === "/dashboard/student" ||
    path === "/dashboard/agent" ||
    path === "/dashboard/agents"
  ) {
    return getBaseDashboardTitle(normalizedRole);
  }

  if (path.includes("/dashboard/programs")) {
    return normalizedRole === "trainer"
      ? "Training Programs"
      : "Program Management";
  }

  if (
    path.includes("/dashboard/internaship") ||
    path.includes("/dashboard/internship")
  ) {
    return "Internship Management";
  }

  if (path.includes("/dashboard/agent/addintern")) {
    return "Add Intern";
  }

  if (path.includes("/dashboard/wallet")) {
    return "Wallet";
  }

  if (path.includes("/dashboard/applications")) {
    return "Applications";
  }

  if (path.includes("/dashboard/users")) {
    return "Users & Roles";
  }

  if (path.includes("/dashboard/service-directory")) {
    return "Service Directory";
  }

  if (path.includes("/dashboard/settings")) {
    return "System Settings";
  }

  if (path.includes("/dashboard/agents")) {
    return "Agent Management";
  }

  if (path.includes("/dashboard/agent")) {
    return "Agent Dashboard";
  }

  return getBaseDashboardTitle(normalizedRole);
}

function isAdminAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/admin" ||
    path === "/dashboard/agents" ||
    path.startsWith("/dashboard/programs") ||
    path.startsWith("/dashboard/applications") ||
    path.startsWith("/dashboard/internaship") ||
    path.startsWith("/dashboard/internship") ||
    path.startsWith("/dashboard/users") ||
    path.startsWith("/dashboard/service-directory") ||
    path.startsWith("/dashboard/settings")
  );
}

function isTrainerAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/trainer" ||
    path.startsWith("/dashboard/internaship") ||
    path.startsWith("/dashboard/internship") ||
    path.startsWith("/dashboard/wallet")
  );
}

function isCeoAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/ceo" ||
    path === "/dashboard/agents"
  );
}

function isStudentAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/student" ||
    path.startsWith("/dashboard/internaship") ||
    path.startsWith("/dashboard/internship")
  );
}

function isAgentAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/agent" ||
    path.startsWith("/dashboard/agent/addintern") ||
    path.startsWith("/dashboard/wallet")
  );
}

function isSchoolOwnerAllowedPath(path) {
  return path === "/dashboard" || path === "/dashboard/agents";
}

function isAllowedPathForRole(path, role) {
  switch (normalizeRole(role)) {
    case "admin":
      return isAdminAllowedPath(path);
    case "ceo":
      return isCeoAllowedPath(path);
    case "trainer":
      return isTrainerAllowedPath(path);
    case "student":
      return isStudentAllowedPath(path);
    case "agent":
      return isAgentAllowedPath(path);
    case "school_owner":
      return isSchoolOwnerAllowedPath(path);
    default:
      return false;
  }
}

export default function DashboardLayouts() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { token, role: currentRole } = getAuthState();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const handleScreenChange = (event) => {
      setSidebarOpen(event.matches);
    };

    setSidebarOpen(media.matches);

    if (media.addEventListener) {
      media.addEventListener("change", handleScreenChange);
    } else {
      media.addListener(handleScreenChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleScreenChange);
      } else {
        media.removeListener(handleScreenChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const pageTitle = useMemo(() => {
    return getTitle(location.pathname, currentRole);
  }, [location.pathname, currentRole]);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    }
  };

  if (!token || !isKnownRole(currentRole)) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowedPathForRole(location.pathname, currentRole)) {
    return <Navigate to={getDashboardPathByRole(currentRole)} replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={currentRole}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onToggleSidebar={handleToggleSidebar}
          title={pageTitle}
          role={currentRole}
        />

        <main className="relative min-w-0 flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}