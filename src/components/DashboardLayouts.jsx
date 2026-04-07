import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
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
const MICROSIP_PROTOCOL = "callto:"; // change to "sip:" if your PC is configured that way

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

  if (path === "/dashboard/agents") {
    return "Agent Management";
  }

  if (path.startsWith("/dashboard/agents/")) {
    return "Agent Details";
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

  if (path.includes("/dashboard/agent")) {
    return "Agent Dashboard";
  }

  return getBaseDashboardTitle(normalizedRole);
}

function isAdminAllowedPath(path) {
  return (
    path === "/dashboard" ||
    path === "/dashboard/admin" ||
    path.startsWith("/dashboard/agents") ||
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
    path.startsWith("/dashboard/agents")
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
  return path === "/dashboard" || path.startsWith("/dashboard/agents");
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

function sanitizePhoneValue(value) {
  return value.replace(/[^\d+#*+@._-]/g, "").trim();
}

export default function DashboardLayouts() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [dialNumber, setDialNumber] = useState("");
  const mailPopupRef = useRef(null);
  const phoneInputRef = useRef(null);

  const { token, role: currentRole } = getAuthState();
  const normalizedRole = normalizeRole(currentRole);
  const isAdmin = normalizedRole === "admin";

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
        setShowPhoneModal(false);
      }
    };

    const shouldLockBody = showEmailModal || showPhoneModal;

    if (shouldLockBody) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showEmailModal, showPhoneModal]);

  useEffect(() => {
    if (showPhoneModal && phoneInputRef.current) {
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 50);
    }
  }, [showPhoneModal]);

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

  const handleOpenMicroSIP = () => {
    if (typeof window === "undefined") return;

    const cleanedNumber = sanitizePhoneValue(dialNumber);

    if (!cleanedNumber) {
      alert("Please enter a phone number or SIP extension.");
      return;
    }

    const microsipUrl = `${MICROSIP_PROTOCOL}${cleanedNumber}`;

    const link = document.createElement("a");
    link.href = microsipUrl;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowPhoneModal(false);
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

        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
          {isAdmin && (
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
            onClick={() => setShowPhoneModal(true)}
            title="Open MicroSIP"
            aria-label="Open MicroSIP"
            className="inline-flex items-center gap-2 rounded-full bg-[#1d4ed8] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:ring-offset-2"
          >
            <PhoneCall className="h-5 w-5" />
            <span className="hidden sm:inline">Call</span>
          </button>
        </div>

        {showEmailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
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

        {showPhoneModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close phone modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <PhoneCall className="h-7 w-7 text-blue-700" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Open MicroSIP Call
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enter a phone number or SIP extension, then click{" "}
                <span className="font-semibold">Call with MicroSIP</span>.
              </p>

              <div className="mt-5">
                <label
                  htmlFor="microsip-number"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Number or SIP extension
                </label>
                <input
                  ref={phoneInputRef}
                  id="microsip-number"
                  type="text"
                  value={dialNumber}
                  onChange={(e) => setDialNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleOpenMicroSIP();
                    }
                  }}
                  placeholder="e.g. 1001 or +2507xxxxxxxx"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleOpenMicroSIP}
                  className="rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e40af]"
                >
                  Call with MicroSIP
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}