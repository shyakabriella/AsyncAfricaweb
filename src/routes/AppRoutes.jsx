import { Routes, Route, Navigate } from "react-router-dom";

import Layouts from "../components/Layouts";
import DashboardLayouts from "../components/DashboardLayouts";
import AdminDashboard from "../components/AdminDashboard";

import Home from "../pages/Home";
import Login from "../pages/Auth/Login";
import Services from "../pages/Services";
import ServiceDetails from "../pages/ServiceDetails";
import Training from "../pages/Training/Training";
import TrainingDetails from "../pages/Training/TrainingDetails";
import Projects from "../pages/Projects";
import Contact from "../pages/Contact";

import Program from "../dashboard/Program";
import ProgramDetails from "../dashboard/ProgramDetails";
import UsersRoles from "../dashboard/UsersRoles";
import ServiceDirectory from "../dashboard/ServiceDirectory";
import SystemSetting from "../dashboard/SystemSetting";

export default function AppRoutes() {
  return (
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

      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<DashboardLayouts />}>
        <Route index element={<AdminDashboard />} />
        <Route path="programs" element={<Program />} />
        <Route path="programs/:id" element={<ProgramDetails />} />
        <Route path="users" element={<UsersRoles />} />
        <Route path="service-directory" element={<ServiceDirectory />} />
        <Route path="settings" element={<SystemSetting />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}