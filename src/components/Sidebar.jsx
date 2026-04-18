import { NavLink, useNavigate } from "react-router-dom";

function parseStoredUser(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function normalizeRole(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return normalizeRole(
      value?.slug ||
        value?.name ||
        value?.role ||
        value?.title ||
        ""
    );
  }

  const role = String(value).trim().toLowerCase();

  if (role === "administrator") return "admin";
  if (role === "admin") return "admin";
  if (role === "super admin") return "admin";
  if (role === "super_admin") return "admin";
  if (role === "super-admin") return "admin";

  if (role === "chief executive officer") return "ceo";
  if (role === "chief-executive-officer") return "ceo";
  if (role === "chief_executive_officer") return "ceo";
  if (role === "ceo") return "ceo";

  if (role === "trainer") return "trainer";
  if (role === "trainers") return "trainer";

  if (role === "student") return "student";
  if (role === "students") return "student";

  if (role === "agent") return "agent";
  if (role === "agents") return "agent";

  if (role === "school owner") return "school_owner";
  if (role === "school-owner") return "school_owner";
  if (role === "school_owner") return "school_owner";
  if (role === "school owners") return "school_owner";
  if (role === "schoolowners") return "school_owner";
  if (role === "schoolowner") return "school_owner";

  return role;
}

function isKnownRole(role) {
  return [
    "admin",
    "ceo",
    "trainer",
    "student",
    "agent",
    "school_owner",
  ].includes(normalizeRole(role));
}

function getRoleFromUser(user) {
  if (!user) return "";

  const directCandidates = [
    user?.role?.slug,
    user?.role?.name,
    user?.role,
  ];

  for (const item of directCandidates) {
    const found = normalizeRole(item);
    if (isKnownRole(found)) return found;
  }

  const roleArrays = [Array.isArray(user?.roles) ? user.roles : []];
  const foundRoles = [];

  for (const arr of roleArrays) {
    for (const item of arr) {
      const found = normalizeRole(item?.slug || item?.name || item);
      if (isKnownRole(found)) foundRoles.push(found);
    }
  }

  const uniqueRoles = [...new Set(foundRoles)];
  if (uniqueRoles.length === 1) return uniqueRoles[0];

  return "";
}

function getStoredUser() {
  const localUser = parseStoredUser(localStorage.getItem("user"));
  const sessionUser = parseStoredUser(sessionStorage.getItem("user"));
  const localAuthUser = parseStoredUser(localStorage.getItem("auth_user"));
  const sessionAuthUser = parseStoredUser(sessionStorage.getItem("auth_user"));

  if (localUser && Object.keys(localUser).length > 0) return localUser;
  if (sessionUser && Object.keys(sessionUser).length > 0) return sessionUser;
  if (localAuthUser && Object.keys(localAuthUser).length > 0) return localAuthUser;
  if (sessionAuthUser && Object.keys(sessionAuthUser).length > 0) return sessionAuthUser;

  return {};
}

function getStoredRole() {
  const localRole = normalizeRole(localStorage.getItem("role") || "");
  const sessionRole = normalizeRole(sessionStorage.getItem("role") || "");

  if (isKnownRole(sessionRole)) return sessionRole;
  if (isKnownRole(localRole)) return localRole;

  return "";
}

function getPanelLabel(role) {
  switch (normalizeRole(role)) {
    case "admin":
      return "Admin Panel";
    case "ceo":
      return "CEO Panel";
    case "trainer":
      return "Trainer Panel";
    case "student":
      return "Student Panel";
    case "agent":
      return "Agent Panel";
    case "school_owner":
      return "School Owner Panel";
    default:
      return "User Panel";
  }
}

function getDashboardHomePath(role) {
  switch (normalizeRole(role)) {
    case "admin":
      return "/dashboard/admin";
    case "ceo":
      return "/dashboard/ceo";
    case "trainer":
      return "/dashboard/trainer";
    case "student":
      return "/dashboard/student";
    case "agent":
      return "/dashboard/agent";
    case "school_owner":
      return "/dashboard/agents";
    default:
      return "/dashboard";
  }
}

function getDefaultName(role) {
  switch (normalizeRole(role)) {
    case "admin":
      return "Admin User";
    case "ceo":
      return "CEO User";
    case "trainer":
      return "Trainer User";
    case "student":
      return "Student User";
    case "agent":
      return "Agent User";
    case "school_owner":
      return "School Owner";
    default:
      return "User";
  }
}

function getDefaultEmail(role) {
  switch (normalizeRole(role)) {
    case "admin":
      return "admin@asyncafrica.com";
    case "ceo":
      return "ceo@asyncafrica.com";
    case "trainer":
      return "trainer@asyncafrica.com";
    case "student":
      return "student@asyncafrica.com";
    case "agent":
      return "agent@asyncafrica.com";
    case "school_owner":
      return "schoolowner@asyncafrica.com";
    default:
      return "user@asyncafrica.com";
  }
}

export default function Sidebar({ open = true, onClose = () => {} }) {
  const navigate = useNavigate();

  const user = getStoredUser();
  const roleFromStorage = getStoredRole();
  const roleFromUser = getRoleFromUser(user);
  const role = normalizeRole(roleFromStorage || roleFromUser || "");

  const name = user?.name || getDefaultName(role);
  const email = user?.email || getDefaultEmail(role);

  const isTrainer = role === "trainer";
  const isCeo = role === "ceo";
  const isAdmin = role === "admin";
  const isStudent = role === "student";
  const isAgent = role === "agent";
  const isSchoolOwner = role === "school_owner";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("role");
    localStorage.removeItem("remember_email");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  const handleMobileClose = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 bg-[#0B0B14]/95 text-white backdrop-blur-xl",
          "transition-transform duration-300 ease-out",
          "lg:sticky lg:top-0 lg:z-30 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,108,245,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(96,80,240,0.14),transparent_30%)]" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#6050F0] to-[#7A6CF5] shadow-[0_0_30px_rgba(96,80,240,0.25)]">
                <img
                  src="/log.png"
                  alt="AsyncAfrica"
                  className="h-7 w-7 object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold">
                  AsyncAfrica
                </div>
                <div className="text-[11px] text-white/65">
                  {getPanelLabel(role)}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
              type="button"
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          </div>

          <nav className="space-y-1 px-2 py-3">
            {isTrainer ? (
              <>
                <Item
                  to="/dashboard/trainer"
                  label="Dashboard"
                  icon={<IconDashboard />}
                  onClick={handleMobileClose}
                />
                <Item
                  to="/dashboard/internaship"
                  label="Internship"
                  icon={<IconInternship />}
                  onClick={handleMobileClose}
                />
                <Item
                  to="/dashboard/wallet"
                  label="Wallet"
                  icon={<IconWallet />}
                  onClick={handleMobileClose}
                />
              </>
            ) : isStudent ? (
              <>
                <Item
                  to={getDashboardHomePath(role)}
                  label="Dashboard"
                  icon={<IconDashboard />}
                  onClick={handleMobileClose}
                />
                <Item
                  to="/dashboard/internaship"
                  label="Internship"
                  icon={<IconInternship />}
                  onClick={handleMobileClose}
                />
              </>
            ) : isAgent ? (
              <>
                <Item
                  to="/dashboard/agent"
                  label="Dashboard"
                  icon={<IconDashboard />}
                  onClick={handleMobileClose}
                />
                <Item
                  to="/dashboard/wallet"
                  label="Wallet"
                  icon={<IconWallet />}
                  onClick={handleMobileClose}
                />
                <Item
                  to="/dashboard/agent/addintern"
                  label="Add Intern"
                  icon={<IconUsers />}
                  onClick={handleMobileClose}
                />
              </>
            ) : isSchoolOwner ? (
              <>
                <Item
                  to="/dashboard/agents"
                  label="Dashboard"
                  icon={<IconDashboard />}
                  onClick={handleMobileClose}
                />
              </>
            ) : (
              <>
                <Item
                  to={getDashboardHomePath(role)}
                  label="Dashboard"
                  icon={<IconDashboard />}
                  onClick={handleMobileClose}
                />

                {isAdmin && (
                  <>
                    <Item
                      to="/dashboard/users"
                      label="Users"
                      icon={<IconUsers />}
                      onClick={handleMobileClose}
                    />
                    <Item
                      to="/dashboard/agents"
                      label="Agents"
                      icon={<IconAgent />}
                      onClick={handleMobileClose}
                    />
                    <Item
                      to="/dashboard/programs"
                      label="Programs"
                      icon={<IconProgram />}
                      onClick={handleMobileClose}
                    />
                    <Item
                      to="/dashboard/applications"
                      label="Applications"
                      icon={<IconApplication />}
                      onClick={handleMobileClose}
                    />
                    <Item
                      to="/dashboard/internaship"
                      label="Internship"
                      icon={<IconInternship />}
                      onClick={handleMobileClose}
                    />
                    <Item
                      to="/dashboard/report"
                      label="Report"
                      icon={<IconReport />}
                      onClick={handleMobileClose}
                    />
                    <Item
                      to="/dashboard/settings"
                      label="Settings"
                      icon={<IconSettings />}
                      onClick={handleMobileClose}
                    />
                  </>
                )}

                {isCeo && (
                  <>
                    <Item
                      to="/dashboard/agents"
                      label="Agents"
                      icon={<IconAgent />}
                      onClick={handleMobileClose}
                    />
                    <Item
                      to="/dashboard/report"
                      label="Report"
                      icon={<IconReport />}
                      onClick={handleMobileClose}
                    />
                  </>
                )}
              </>
            )}
          </nav>

          <div className="mt-auto border-t border-white/10 p-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#6050F0] to-[#7A6CF5] text-sm font-extrabold shadow-[0_0_20px_rgba(122,108,245,0.25)]">
                  {(name?.[0] || "A").toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">{name}</div>
                  <div className="truncate text-[11px] text-white/65">
                    {email}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-bold text-white transition hover:border-[#6050F0] hover:bg-[#6050F0]"
                title="Logout"
                type="button"
              >
                <IconLogout />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Item({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      end={
        to === "/dashboard" ||
        to === "/dashboard/admin" ||
        to === "/dashboard/ceo" ||
        to === "/dashboard/trainer" ||
        to === "/dashboard/student" ||
        to === "/dashboard/agent" ||
        to === "/dashboard/agents"
      }
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-[#6050F0] to-[#7A6CF5] text-white shadow-[0_0_24px_rgba(96,80,240,0.25)]"
            : "text-white/80 hover:bg-white/10 hover:text-white",
        ].join(" ")
      }
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 transition group-hover:bg-white/10">
        {icon}
      </span>

      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-9h7V4h-7v7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M8 14c-3.2 0-5.5 1.8-5.5 4v1h11v-1c0-2.2-2.3-4-5.5-4Zm8 0c-.6 0-1.2.07-1.75.2 1.1.84 1.75 1.95 1.75 3.3v1H22v-.8c0-2.1-2.3-3.7-6-3.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconAgent() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M4 20a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 7h3M19.5 5.5v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconProgram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3 2 8l10 5 8-4v6h2V8L12 3Zm-6 8.5V16l6 3 6-3v-4.5l-6 3-6-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconApplication() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 8h8M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInternship() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4h6l1 2h3a2 2 0 0 1 2 2v3H3V8a2 2 0 0 1 2-2h3l1-2Zm12 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6h6v2h6v-2h6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1H6a2 2 0 0 0-2 2V7Z"
        fill="currentColor"
        opacity="0.65"
      />
      <path
        d="M4 10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7Z"
        fill="currentColor"
      />
      <circle cx="16.5" cy="13.5" r="1.5" fill="#0B0B14" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 1.5V9h4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 13h8M8 17h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.2-2-3.5-2.2.6a8 8 0 0 0-1.7-1l-.3-2.3H10.7l-.3 2.3a8 8 0 0 0-1.7 1l-2.2-.6-2 3.5 2 1.2a7.9 7.9 0 0 0 .1 2l-2 1.2 2 3.5 2.2-.6a8 8 0 0 0 1.7 1l.3 2.3h3.6l.3-2.3a8 8 0 0 0 1.7-1l2.2.6 2-3.5-2-1.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 12H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 4v16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}