import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayouts() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onToggleSidebar={handleToggleSidebar}
          title={getTitle(location.pathname)}
        />

        <main className="relative flex-1 min-w-0 p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

function getTitle(path) {
  if (path === "/dashboard") return "Admin Dashboard";
  if (path.includes("/dashboard/programs")) return "Program Management";
  if (path.includes("/dashboard/internships")) return "Internship Management";
  if (path.includes("/dashboard/users")) return "Users & Roles";
  if (path.includes("/dashboard/inbox")) return "Case Inbox";
  if (path.includes("/dashboard/service-directory")) return "Service Directory";
  if (path.includes("/dashboard/reports")) return "Reports & Statistics";
  if (path.includes("/dashboard/settings")) return "System Settings";
  return "Dashboard";
}