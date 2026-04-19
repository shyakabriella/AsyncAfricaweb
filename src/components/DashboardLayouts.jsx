import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Mail, PhoneCall, X } from "lucide-react";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
import {
  getAuthState,
  getDashboardPathByRole,
  normalizeRole,
  isKnownRole,
} from "../lib/auth";

const MAIL_POPUP_URL = "https://mail.asyncafrica.com:8443/SOGo/";

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
    path === "/dashboard/agent"
  ) {
    return getBaseDashboardTitle(normalizedRole);
  }

  if (path === "/dashboard/phone" || path === "/dashboard/call") {
    return "Web Phone";
  }

  if (path === "/dashboard/agents") {
    return "Agent Management";
  }

  if (path.startsWith("/dashboard/agents/")) {
    return "Agent Details";
  }

  if (path.includes("/dashboard/intakes")) {
    return "Intake Management";
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

  if (
    path.includes("/dashboard/report") ||
    path.includes("/dashboard/reports")
  ) {
    return "Reports";
  }

  if (path.includes("/dashboard/pet-cash")) {
    return "Pet Cash Management";
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
    path === "/dashboard/phone" ||
    path === "/dashboard/call" ||
    path.startsWith("/dashboard/agents") ||
    path.startsWith("/dashboard/intakes") ||
    path.startsWith("/dashboard/programs") ||
    path.startsWith("/dashboard/applications") ||
    path.startsWith("/dashboard/internaship") ||
    path.startsWith("/dashboard/internship") ||
    path.startsWith("/dashboard/users") ||
    path.startsWith("/dashboard/service-directory") ||
    path.startsWith("/dashboard/settings") ||
    path.startsWith("/dashboard/report") ||
    path.startsWith("/dashboard/reports") ||
    path.startsWith("/dashboard/pet-cash")
  );
}

function isTrainerAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/trainer" ||
    path === "/dashboard/phone" ||
    path === "/dashboard/call" ||
    path.startsWith("/dashboard/internaship") ||
    path.startsWith("/dashboard/internship") ||
    path.startsWith("/dashboard/wallet")
  );
}

function isCeoAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/ceo" ||
    path === "/dashboard/phone" ||
    path === "/dashboard/call" ||
    path.startsWith("/dashboard/agents") ||
    path.startsWith("/dashboard/intakes") ||
    path.startsWith("/dashboard/programs") ||
    path.startsWith("/dashboard/applications") ||
    path.startsWith("/dashboard/internaship") ||
    path.startsWith("/dashboard/internship") ||
    path.startsWith("/dashboard/users") ||
    path.startsWith("/dashboard/service-directory") ||
    path.startsWith("/dashboard/settings") ||
    path.startsWith("/dashboard/report") ||
    path.startsWith("/dashboard/reports") ||
    path.startsWith("/dashboard/pet-cash")
  );
}

function isStudentAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/student" ||
    path === "/dashboard/phone" ||
    path === "/dashboard/call" ||
    path.startsWith("/dashboard/internaship") ||
    path.startsWith("/dashboard/internship")
  );
}

function isAgentAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/agent" ||
    path === "/dashboard/phone" ||
    path === "/dashboard/call" ||
    path.startsWith("/dashboard/agent/addintern") ||
    path.startsWith("/dashboard/wallet")
  );
}

function isSchoolOwnerAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/phone" ||
    path === "/dashboard/call" ||
    path.startsWith("/dashboard/agents")
  );
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
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const mailPopupRef = useRef(null);

  const { token, role: currentRole } = getAuthState();
  const normalizedRole = normalizeRole(currentRole);
  const canUseEmailPopup =
    normalizedRole === "admin" || normalizedRole === "ceo";
  const isPhonePage =
    location.pathname === "/dashboard/phone" ||
    location.pathname === "/dashboard/call";

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

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowEmailModal(false);
      }
    };

    if (showEmailModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showEmailModal]);

  const pageTitle = useMemo(() => {
    return getTitle(location.pathname, currentRole);
  }, [location.pathname, currentRole]);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    }
  };

  const handleConfirmOpenEmail = () => {
    if (typeof window === "undefined") return;

    const width = 1300;
    const height = 850;
    const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
    const top = Math.max(0, Math.floor((window.screen.height - height) / 2));

    const features = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      "resizable=yes",
      "scrollbars=yes",
      "toolbar=no",
      "menubar=no",
      "status=no",
      "location=yes",
    ].join(",");

    if (mailPopupRef.current && !mailPopupRef.current.closed) {
      mailPopupRef.current.location.href = MAIL_POPUP_URL;
      mailPopupRef.current.focus();
    } else {
      mailPopupRef.current = window.open(
        MAIL_POPUP_URL,
        "asyncafrica_mail_popup",
        features
      );

      if (mailPopupRef.current) {
        mailPopupRef.current.focus();
      } else {
        alert(
          "Popup was blocked. Please allow popups for this site, then try again."
        );
      }
    }

    setShowEmailModal(false);
  };

  const handleOpenPhonePage = () => {
    navigate("/dashboard/phone");
  };

  if (!token || !isKnownRole(currentRole)) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowedPathForRole(location.pathname, currentRole)) {
    return <Navigate to={getDashboardPathByRole(currentRole)} replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 print:block print:bg-white">
      <div className="print:hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role={currentRole}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <Header
            onToggleSidebar={handleToggleSidebar}
            title={pageTitle}
            role={currentRole}
          />
        </div>

        <main className="relative min-w-0 flex-1 p-4 md:p-6 print:p-0">
          <div className="mx-auto w-full max-w-[1600px] print:max-w-none">
            <Outlet />
          </div>
        </main>

        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
          {canUseEmailPopup && (
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              title="Open Email"
              aria-label="Open Email"
              className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#115e59] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2"
            >
              <Mail className="h-5 w-5" />
              <span className="hidden sm:inline">Email</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenPhonePage}
            title="Open Web Phone"
            aria-label="Open Web Phone"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isPhonePage
                ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300"
                : "bg-[#1d4ed8] hover:bg-[#1e40af] focus:ring-[#60a5fa]"
            }`}
          >
            <PhoneCall className="h-5 w-5" />
            <span className="hidden sm:inline">
              {isPhonePage ? "Phone Open" : "Call"}
            </span>
          </button>
        </div>

        {showEmailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 print:hidden">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close email modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
                <Mail className="h-7 w-7 text-teal-700" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Open Async Africa Email
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Click <span className="font-semibold">Open Email</span> to access
                the mailbox in a popup window.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOpenEmail}
                  className="rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#115e59]"
                >
                  Open Email
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}