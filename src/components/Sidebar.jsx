import { NavLink, useNavigate } from "react-router-dom";

function parseStoredUser(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

export default function Sidebar({ open = true, onClose = () => {} }) {
  const navigate = useNavigate();

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("auth_user") ||
    sessionStorage.getItem("auth_user") ||
    "{}";

  const user = parseStoredUser(storedUser);
  const name = user?.name || "Admin User";
  const email = user?.email || "admin@asyncafrica.com";
  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role") ||
    user?.role?.slug ||
    user?.role ||
    "admin";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("remember_email");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");

    navigate("/login", { replace: true });
  };

  const handleMobileClose = () => {
    if (window.innerWidth < 1024) {
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
                  {String(role).toLowerCase() === "admin"
                    ? "Admin Panel"
                    : "User Panel"}
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
            <Item
              to="/dashboard"
              label="Dashboard"
              icon={<IconDashboard />}
              onClick={handleMobileClose}
            />
            <Item
              to="/dashboard/programs"
              label="Program"
              icon={<IconProgram />}
              onClick={handleMobileClose}
            />
            <Item
              to="/dashboard/applications"
              label="Application"
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
              to="/dashboard/reports"
              label="Report"
              icon={<IconReport />}
              onClick={handleMobileClose}
            />
            <Item
              to="/dashboard/settings"
              label="Setting"
              icon={<IconSettings />}
              onClick={handleMobileClose}
            />
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
      end={to === "/dashboard"}
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