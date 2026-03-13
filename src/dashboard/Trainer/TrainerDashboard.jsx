import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  TrendingUp,
  AlertCircle,
  Search,
  UserCheck,
  ClipboardList,
  RefreshCw,
  Filter,
  BookOpen,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const PIE_COLORS = ["#22C55E", "#EF4444", "#F59E0B", "#0EA5E9", "#6050F0"];

function percent(value) {
  return `${Number(value || 0).toFixed(0)}%`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

function normalizeStatus(status) {
  return String(status || "").trim();
}

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("access_token") ||
    ""
  );
}

function parseStoredUser(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function getStoredUser() {
  return parseStoredUser(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      localStorage.getItem("auth_user") ||
      sessionStorage.getItem("auth_user") ||
      "{}"
  );
}

function statusPill(value) {
  switch (normalizeStatus(value)) {
    case "Present":
      return "bg-emerald-50 text-emerald-700";
    case "Absent":
      return "bg-rose-50 text-rose-700";
    case "Late":
      return "bg-amber-50 text-amber-700";
    case "Excused":
      return "bg-blue-50 text-blue-700";
    case "Not Marked":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
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
            {item.value}
          </p>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, note, change, icon: Icon }) {
  const positive = String(change || "").trim().startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {title}
          </p>
          <h3 className="mt-3 text-2xl font-black text-slate-900">{value}</h3>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
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
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

export default function TrainerDashboard() {
  const user = getStoredUser();
  const trainerName = user?.name || "Trainer";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attendanceRows, setAttendanceRows] = useState([]);

  const [filters, setFilters] = useState({
    attendance_date: "",
    shift_ref: "",
    program_id: "",
    search: "",
  });

  const buildUrl = () => {
    const params = new URLSearchParams();

    if (filters.attendance_date) {
      params.append("attendance_date", filters.attendance_date);
    }

    if (filters.shift_ref.trim()) {
      params.append("shift_ref", filters.shift_ref.trim());
    }

    if (filters.program_id.trim()) {
      params.append("program_id", filters.program_id.trim());
    }

    const queryString = params.toString();
    return `${API_BASE_URL}/attendances${queryString ? `?${queryString}` : ""}`;
  };

  const loadAttendance = async (isRefresh = false) => {
    try {
      setErrorMessage("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const response = await fetch(buildUrl(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to load attendance records."
        );
      }

      const rows = Array.isArray(result?.data) ? result.data : [];
      setAttendanceRows(rows);
    } catch (error) {
      setErrorMessage(
        error?.message || "Something went wrong while loading attendance."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    if (!keyword) return attendanceRows;

    return attendanceRows.filter((row) => {
      const application = row?.application || {};
      const program = row?.program || {};
      const markedByUser = row?.markedByUser || {};

      const values = [
        row?.status,
        row?.shift_ref,
        row?.shift_name,
        row?.attendance_date,
        row?.note,
        program?.name,
        program?.title,
        application?.first_name,
        application?.last_name,
        application?.email,
        application?.phone,
        markedByUser?.name,
      ];

      return values
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [attendanceRows, filters.search]);

  const summary = useMemo(() => {
    const total = filteredRows.length;

    const todayDate = new Date().toISOString().slice(0, 10);

    let todayCount = 0;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let notMarked = 0;

    filteredRows.forEach((row) => {
      const status = normalizeStatus(row?.status);

      if ((row?.attendance_date || "").slice(0, 10) === todayDate) {
        todayCount += 1;
      }

      if (status === "Present") present += 1;
      else if (status === "Absent") absent += 1;
      else if (status === "Late") late += 1;
      else if (status === "Excused") excused += 1;
      else if (status === "Not Marked") notMarked += 1;
    });

    const markedTotal = present + absent + late + excused;
    const attendanceRate =
      markedTotal > 0 ? ((present + late + excused) / markedTotal) * 100 : 0;

    return {
      total,
      todayCount,
      present,
      absent,
      late,
      excused,
      notMarked,
      attendanceRate,
    };
  }, [filteredRows]);

  const attendanceTrend = useMemo(() => {
    const grouped = {};

    filteredRows.forEach((row) => {
      const dateKey = (row?.attendance_date || "").slice(0, 10) || "Unknown";
      const status = normalizeStatus(row?.status);

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          name: dateKey,
          total: 0,
          positive: 0,
        };
      }

      grouped[dateKey].total += 1;

      if (["Present", "Late", "Excused"].includes(status)) {
        grouped[dateKey].positive += 1;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-10)
      .map((item) => ({
        name: item.name,
        rate:
          item.total > 0 ? Number(((item.positive / item.total) * 100).toFixed(0)) : 0,
      }));
  }, [filteredRows]);

  const statusDistribution = useMemo(() => {
    const stats = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Excused: 0,
      "Not Marked": 0,
    };

    filteredRows.forEach((row) => {
      const status = normalizeStatus(row?.status);
      if (Object.prototype.hasOwnProperty.call(stats, status)) {
        stats[status] += 1;
      } else {
        stats["Not Marked"] += 1;
      }
    });

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredRows]);

  const programDistribution = useMemo(() => {
    const grouped = {};

    filteredRows.forEach((row) => {
      const programName =
        row?.program?.name ||
        row?.program?.title ||
        `Program ${row?.program_id || "N/A"}`;

      grouped[programName] = (grouped[programName] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, records]) => ({
        name,
        records,
      }))
      .sort((a, b) => b.records - a.records)
      .slice(0, 8);
  }, [filteredRows]);

  const shiftsSummary = useMemo(() => {
    const grouped = {};

    filteredRows.forEach((row) => {
      const key = row?.shift_name || row?.shift_ref || "No Shift";
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [filteredRows]);

  const recentRecords = useMemo(() => {
    return [...filteredRows]
      .sort((a, b) =>
        String(b?.attendance_date || "").localeCompare(
          String(a?.attendance_date || "")
        )
      )
      .slice(0, 12);
  }, [filteredRows]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    loadAttendance();
  };

  const clearFilters = () => {
    setFilters({
      attendance_date: "",
      shift_ref: "",
      program_id: "",
      search: "",
    });

    setTimeout(() => {
      loadAttendance();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#6050F0] p-6 text-white shadow-xl"
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-white/90">
                <UserCheck size={14} /> Trainer Attendance Dashboard
              </div>

              <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                Welcome back, {trainerName}
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
                View attendance records, daily attendance trends, status
                breakdown, program participation, and recent marked attendance
                from your training area.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
                    Attendance Rate
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {percent(summary.attendanceRate)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
                    Today Records
                  </p>
                  <p className="mt-1 text-xl font-black">{summary.todayCount}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">Total Records</p>
                <p className="mt-2 text-3xl font-black">{summary.total}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">Present</p>
                <p className="mt-2 text-3xl font-black">{summary.present}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">Absent</p>
                <p className="mt-2 text-3xl font-black">{summary.absent}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">Late</p>
                <p className="mt-2 text-3xl font-black">{summary.late}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <SectionCard
          title="Attendance Filters"
          subtitle="Filter attendance records from the API route"
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F3F1FF] px-3 py-1.5 text-xs font-bold text-[#6050F0]">
              <Filter size={14} /> API Filters
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Attendance Date
              </label>
              <input
                type="date"
                name="attendance_date"
                value={filters.attendance_date}
                onChange={handleFilterChange}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Shift Ref
              </label>
              <input
                type="text"
                name="shift_ref"
                value={filters.shift_ref}
                onChange={handleFilterChange}
                placeholder="ex: morning"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Program ID
              </label>
              <input
                type="text"
                name="program_id"
                value={filters.program_id}
                onChange={handleFilterChange}
                placeholder="ex: 1"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Search
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="student, program, status..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                type="button"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#6050F0] px-4 text-sm font-bold text-white transition hover:bg-[#4F46E5]"
              >
                <Search size={16} />
                Apply
              </button>

              <button
                onClick={clearFilters}
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Records"
            value={summary.total}
            change="+0"
            note="loaded from API"
            icon={ClipboardList}
          />
          <StatCard
            title="Today Records"
            value={summary.todayCount}
            change="+0"
            note="for today"
            icon={CalendarDays}
          />
          <StatCard
            title="Attendance Rate"
            value={percent(summary.attendanceRate)}
            change="+0%"
            note="present, late, excused"
            icon={TrendingUp}
          />
          <StatCard
            title="Not Marked"
            value={summary.notMarked}
            change="+0"
            note="needs update"
            icon={AlertCircle}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <SectionCard
            title="Attendance Trend"
            subtitle="Daily attendance rate from attendance records"
            action={
              <button
                onClick={() => loadAttendance(true)}
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            }
          >
            <div className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Loading attendance trend...
                </div>
              ) : attendanceTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                  No attendance trend data found.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceTrend}>
                    <defs>
                      <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6050F0" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6050F0" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#6050F0"
                      fill="url(#attendanceFill)"
                      strokeWidth={3}
                      name="Attendance Rate"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Status Distribution"
            subtitle="Attendance status summary"
          >
            <div className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Loading status data...
                </div>
              ) : statusDistribution.every((item) => item.value === 0) ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                  No attendance status data found.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={64}
                      outerRadius={96}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3">
              {statusDistribution.map((item, index) => (
                <div key={item.name} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-xs font-semibold text-slate-600">
                      {item.name}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-black text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
         

          <SectionCard
            title="Shift Summary"
            subtitle="Attendance grouped by shift"
            className="xl:col-span-2"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex min-h-[160px] items-center justify-center text-sm text-slate-500">
                  Loading shift summary...
                </div>
              ) : shiftsSummary.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No shift attendance data found.
                </div>
              ) : (
                shiftsSummary.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Shift
                        </p>
                        <p className="mt-2 text-lg font-black text-slate-900">
                          {item.name}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F1FF] text-[#6050F0]">
                        <Clock3 size={18} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {item.total} attendance record(s)
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Recent Attendance Records"
            subtitle="Latest attendance entries from the backend"
            action={
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F3F1FF] px-3 py-1.5 text-xs font-bold text-[#6050F0]">
                <BookOpen size={14} /> {recentRecords.length} Visible Records
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Student
                    </th>
                    <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Program
                    </th>
                    <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Shift
                    </th>
                    <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Date
                    </th>
                    <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Status
                    </th>
                    <th className="px-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Marked By
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="rounded-2xl bg-slate-50 px-3 py-6 text-center text-sm text-slate-500"
                      >
                        Loading attendance records...
                      </td>
                    </tr>
                  ) : recentRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="rounded-2xl bg-slate-50 px-3 py-6 text-center text-sm text-slate-500"
                      >
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    recentRecords.map((row) => {
                      const fullName = [
                        row?.application?.first_name,
                        row?.application?.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <tr key={row.id} className="bg-slate-50">
                          <td className="rounded-l-2xl px-3 py-4 text-sm font-bold text-slate-900">
                            {fullName || row?.application?.name || "Unknown Student"}
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-600">
                            {row?.program?.name ||
                              row?.program?.title ||
                              `Program ${row?.program_id || "-"}`}
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-600">
                            {row?.shift_name || row?.shift_ref || "-"}
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-600">
                            {formatDate(row?.attendance_date)}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusPill(
                                row?.status
                              )}`}
                            >
                              {row?.status || "-"}
                            </span>
                          </td>
                          <td className="rounded-r-2xl px-3 py-4 text-sm text-slate-600">
                            {row?.markedByUser?.name || "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title="Quick Attendance Focus" subtitle="Main attendance highlights">
              <div className="space-y-3">
                <div className="rounded-2xl bg-[#F6F4FF] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6050F0]">
                        Present
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900">
                        {summary.present}
                      </p>
                    </div>
                    <CheckCircle2 className="text-[#6050F0]" size={20} />
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    Attendance Health
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {percent(summary.attendanceRate)}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Late Records
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {summary.late}
                  </p>
                </div>

                <div className="rounded-2xl bg-rose-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">
                    Absent Records
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {summary.absent}
                  </p>
                </div>
              </div>
            </SectionCard>

            
          </div>
        </div>
      </div>
    </div>
  );
}