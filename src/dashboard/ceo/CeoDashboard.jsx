import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Briefcase,
  Users,
  DollarSign,
  GraduationCap,
  MessageSquare,
  Clock3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Activity,
  Bell,
  ArrowUpRight,
  Search,
} from "lucide-react";

const defaultRevenueTrend = [
  { name: "Jan", revenue: 4200, target: 5000 },
  { name: "Feb", revenue: 5100, target: 5200 },
  { name: "Mar", revenue: 6100, target: 5600 },
  { name: "Apr", revenue: 7400, target: 6200 },
  { name: "May", revenue: 8300, target: 7000 },
  { name: "Jun", revenue: 9700, target: 7600 },
];

const defaultApplicationsTrend = [
  { name: "Week 1", applications: 24 },
  { name: "Week 2", applications: 38 },
  { name: "Week 3", applications: 46 },
  { name: "Week 4", applications: 59 },
  { name: "Week 5", applications: 63 },
  { name: "Week 6", applications: 71 },
];

const defaultProgramPerformance = [
  { name: "Software Dev", students: 120 },
  { name: "UI/UX", students: 74 },
  { name: "Data Analytics", students: 63 },
  { name: "Digital Marketing", students: 51 },
  { name: "Cybersecurity", students: 44 },
];

const defaultApplicationStatus = [
  { name: "Pending", value: 34 },
  { name: "Approved", value: 58 },
  { name: "Paid", value: 47 },
  { name: "Rejected", value: 9 },
];

const defaultSupportChats = [
  {
    id: 1,
    name: "Alice Mukamana",
    topic: "Payment confirmation",
    message: "I submitted my payment yesterday. Can you confirm my application status?",
    status: "Open",
    time: "2 min ago",
    priority: "High",
  },
  {
    id: 2,
    name: "Jean Claude",
    topic: "Internship schedule",
    message: "When will the next internship intake officially start?",
    status: "Waiting",
    time: "7 min ago",
    priority: "Medium",
  },
  {
    id: 3,
    name: "Divine Uwase",
    topic: "Certificate request",
    message: "I completed the training. Please guide me on certificate collection.",
    status: "Resolved",
    time: "18 min ago",
    priority: "Low",
  },
  {
    id: 4,
    name: "Eric Nshimiye",
    topic: "Program details",
    message: "Can I switch from evening to weekend shift after approval?",
    status: "Open",
    time: "25 min ago",
    priority: "Medium",
  },
];

const defaultActivities = [
  {
    id: 1,
    title: "12 new applications received",
    subtitle: "Across all active training programs",
    time: "Today, 08:45",
    type: "growth",
  },
  {
    id: 2,
    title: "3 support chats need urgent response",
    subtitle: "Two payment issues and one schedule request",
    time: "Today, 09:10",
    type: "alert",
  },
  {
    id: 3,
    title: "Software Development program reached 92% capacity",
    subtitle: "Weekend shift is nearly full",
    time: "Today, 10:05",
    type: "warning",
  },
  {
    id: 4,
    title: "Revenue target exceeded this month",
    subtitle: "Current revenue is 18% above target",
    time: "Today, 11:20",
    type: "success",
  },
];

const defaultTopPrograms = [
  {
    id: 1,
    title: "Software Development",
    students: 120,
    revenue: 12800,
    completionRate: 88,
    health: "Strong",
  },
  {
    id: 2,
    title: "UI/UX Design",
    students: 74,
    revenue: 8100,
    completionRate: 82,
    health: "Stable",
  },
  {
    id: 3,
    title: "Data Analytics",
    students: 63,
    revenue: 7200,
    completionRate: 79,
    health: "Stable",
  },
  {
    id: 4,
    title: "Digital Marketing",
    students: 51,
    revenue: 5400,
    completionRate: 73,
    health: "Needs Attention",
  },
];

const PIE_COLORS = ["#6050F0", "#22C55E", "#F59E0B", "#EF4444"];

function formatMoney(value) {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString()}`;
}

function StatCard({ title, value, change, icon: Icon, note }) {
  const positive = String(change || "").trim().startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <h3 className="mt-3 text-2xl font-black text-slate-900">{value}</h3>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {change}
            </span>
            <span className="text-xs text-slate-500">{note}</span>
          </div>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F1FF] text-[#6050F0]">
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
}

function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-bold text-slate-900">{label}</p>
      <div className="mt-1 space-y-1">
        {payload.map((item) => (
          <p key={item.name} className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{item.name}:</span>{" "}
            {typeof item.value === "number" && item.name.toLowerCase().includes("revenue")
              ? formatMoney(item.value)
              : item.value}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function CeoDashboard({
  summary,
  revenueTrend = defaultRevenueTrend,
  applicationsTrend = defaultApplicationsTrend,
  programPerformance = defaultProgramPerformance,
  applicationStatus = defaultApplicationStatus,
  supportChats = defaultSupportChats,
  activities = defaultActivities,
  topPrograms = defaultTopPrograms,
  ceoName = "CEO",
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const dashboardSummary = {
    totalRevenue: summary?.totalRevenue ?? 48500,
    activePrograms: summary?.activePrograms ?? 12,
    totalStudents: summary?.totalStudents ?? 352,
    openChats: summary?.openChats ?? 19,
    pendingApplications: summary?.pendingApplications ?? 34,
    completionRate: summary?.completionRate ?? 84,
  };

  const filteredChats = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return supportChats;

    return supportChats.filter((item) => {
      return [item.name, item.topic, item.message, item.status, item.priority]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [searchTerm, supportChats]);

  const urgentChats = supportChats.filter(
    (item) => item.status === "Open" || item.priority === "High"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#6050F0] p-6 text-white shadow-xl"
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-white/90">
                <Activity size={14} /> Executive Overview
              </div>
              <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                Welcome back, {ceoName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
                Here is your real-time executive view of revenue, student growth,
                program health, applications, and support conversations.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
                    Revenue this period
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {formatMoney(dashboardSummary.totalRevenue)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
                    Completion rate
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {dashboardSummary.completionRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">Pending Applications</p>
                <p className="mt-2 text-3xl font-black">{dashboardSummary.pendingApplications}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">Urgent Chats</p>
                <p className="mt-2 text-3xl font-black">{urgentChats}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">Active Programs</p>
                <p className="mt-2 text-3xl font-black">{dashboardSummary.activePrograms}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">Students</p>
                <p className="mt-2 text-3xl font-black">{dashboardSummary.totalStudents}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatMoney(dashboardSummary.totalRevenue)}
            change="+18.4%"
            note="vs last month"
            icon={DollarSign}
          />
          <StatCard
            title="Active Programs"
            value={dashboardSummary.activePrograms}
            change="+2"
            note="new this month"
            icon={Briefcase}
          />
          <StatCard
            title="Total Students"
            value={dashboardSummary.totalStudents}
            change="+12.6%"
            note="enrollment growth"
            icon={Users}
          />
          <StatCard
            title="Open Support Chats"
            value={dashboardSummary.openChats}
            change="+4"
            note="need attention"
            icon={MessageSquare}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <SectionCard
            title="Revenue Performance"
            subtitle="Monthly actual revenue compared with target"
            action={
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <TrendingUp size={14} /> Growing
              </div>
            }
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6050F0" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6050F0" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#94A3B8"
                    fillOpacity={0}
                    strokeWidth={2}
                    name="Target"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6050F0"
                    fill="url(#revenueFill)"
                    strokeWidth={3}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Application Status"
            subtitle="Distribution of current application pipeline"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={applicationStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={66}
                    outerRadius={96}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {applicationStatus.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3">
              {applicationStatus.map((item, index) => (
                <div key={item.name} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                  </div>
                  <p className="mt-2 text-lg font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
          <SectionCard
            title="Application Growth"
            subtitle="Weekly incoming applications"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#6050F0"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Applications"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Program Popularity"
            subtitle="Students per program"
            className="xl:col-span-2"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="students" fill="#6050F0" radius={[12, 12, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title="Support Chat Overview"
            subtitle="Recent support conversations with live-style activity"
            action={
              <div className="relative w-full max-w-xs">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chat, topic, student..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
                />
              </div>
            }
          >
            <div className="space-y-3">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{chat.name}</h4>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                          {chat.topic}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            chat.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-700"
                              : chat.status === "Waiting"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {chat.status}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            chat.priority === "High"
                              ? "bg-rose-50 text-rose-700"
                              : chat.priority === "Medium"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {chat.priority}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{chat.message}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 size={14} />
                      {chat.time}
                    </div>
                  </div>
                </div>
              ))}

              {filteredChats.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No support chat matched your search.
                </div>
              ) : null}
            </div>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard
              title="Live Activity Feed"
              subtitle="Important events that need executive visibility"
            >
              <div className="space-y-3">
                {activities.map((item) => {
                  const icon =
                    item.type === "success" ? (
                      <CheckCircle2 size={18} />
                    ) : item.type === "alert" ? (
                      <Bell size={18} />
                    ) : item.type === "warning" ? (
                      <AlertCircle size={18} />
                    ) : (
                      <TrendingUp size={18} />
                    );

                  const iconClass =
                    item.type === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : item.type === "alert"
                      ? "bg-rose-50 text-rose-700"
                      : item.type === "warning"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-blue-700";

                  return (
                    <div key={item.id} className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-400">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Quick Focus"
              subtitle="Immediate areas for review"
            >
              <div className="space-y-3">
                <div className="rounded-2xl bg-[#F6F4FF] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6050F0]">
                        Open support backlog
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900">{dashboardSummary.openChats}</p>
                    </div>
                    <ArrowUpRight className="text-[#6050F0]" size={20} />
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    Completion rate
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {dashboardSummary.completionRate}%
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Pending approvals
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {dashboardSummary.pendingApplications}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        <SectionCard
          title="Top Program Summary"
          subtitle="Revenue, enrollment, and completion insight by program"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Program
                  </th>
                  <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Students
                  </th>
                  <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Revenue
                  </th>
                  <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Completion
                  </th>
                  <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Health
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPrograms.map((program) => (
                  <tr key={program.id} className="rounded-2xl bg-slate-50">
                    <td className="rounded-l-2xl px-3 py-4 text-sm font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECE9FF] text-[#6050F0]">
                          <GraduationCap size={18} />
                        </div>
                        {program.title}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-600">{program.students}</td>
                    <td className="px-3 py-4 text-sm font-semibold text-slate-900">
                      {formatMoney(program.revenue)}
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-600">{program.completionRate}%</td>
                    <td className="rounded-r-2xl px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          program.health === "Strong"
                            ? "bg-emerald-50 text-emerald-700"
                            : program.health === "Stable"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {program.health}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
