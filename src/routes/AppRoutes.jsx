import { Routes, Route, Navigate } from "react-router-dom";

import Layouts from "../components/Layouts";
import DashboardLayouts from "../components/DashboardLayouts";
import AdminDashboard from "../components/AdminDashboard";

// Public pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Services from "../pages/Services";
import ServiceDetails from "../pages/ServiceDetails";
import Training from "../pages/Training";
import TrainingDetails from "../pages/TrainingDetails";
import Projects from "../pages/Projects";
import Contact from "../pages/Contact";

// Dashboard pages
import CaseManagement from "../dashboard/CaseManagement";
import UsersRoles from "../dashboard/UsersRoles";
import CaseInbox from "../dashboard/CaseInbox";
import CaseFollowUp from "../dashboard/CaseFollowUp";
import Appointments from "../dashboard/Appointments";
import ServiceDirectory from "../dashboard/ServiceDirectory";
import ReportStatistic from "../dashboard/ReportStatistic";
import SystemSetting from "../dashboard/SystemSetting";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/" element={<Layouts />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:slug" element={<ServiceDetails />} />
        <Route path="training" element={<Training />} />
        <Route path="training/:slug" element={<TrainingDetails />} />
        <Route path="projects" element={<Projects />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayouts />}>
        <Route index element={<AdminDashboard />} />
        <Route path="cases" element={<CaseManagement />} />
        <Route path="users" element={<UsersRoles />} />
        <Route path="inbox" element={<CaseInbox />} />
        <Route path="follow-up" element={<CaseFollowUp />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="service-directory" element={<ServiceDirectory />} />
        <Route path="reports" element={<ReportStatistic />} />
        <Route path="settings" element={<SystemSetting />} />
      </Route>

      {/* Not found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}