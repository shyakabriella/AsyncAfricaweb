import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
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
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const PIE_COLORS = ["#22C55E", "#EF4444", "#F59E0B", "#0EA5E9", "#6050F0"];

function getTodayDateLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function percent(value) {
  return `${Number(value || 0).toFixed(0)}%`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value === "present") return "Present";
  if (value === "absent") return "Absent";
  if (value === "late") return "Late";
  if (value === "excused") return "Excused";
  if (value === "not marked") return "Not Marked";

  return "Not Marked";
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

  const heading = label || payload?.[0]?.name || "Details";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-bold text-slate-900">{heading}</p>
      <div className="mt-1 space-y-1">
        {payload.map((item, index) => (
          <p key={`${item.name}-${index}`} className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{item.name}:</span>{" "}
            {item.value}
          </p>
        ))}
      </div>
    </div>
  );
}

function CompactStatCard({ title, value, note, icon: Icon, tone = "violet" }) {
  const toneMap = {
    violet: "bg-[#F3F1FF] text-[#6050F0]",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-black leading-none text-slate-900">
            {value}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">{note}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneMap[tone]}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
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
    attendance_date: getTodayDateLocal(),
    shift_ref: "",
    program_id: "",
    search: "",
  });

  const buildUrl = (activeFilters = filters) => {
    const params = new URLSearchParams();

    if (activeFilters.attendance_date) {
      params.append("attendance_date", activeFilters.attendance_date);
    }

    if (activeFilters.shift_ref.trim()) {
      params.append("shift_ref", activeFilters.shift_ref.trim());
    }

    if (activeFilters.program_id.trim()) {
      params.append("program_id", activeFilters.program_id.trim());
    }

    const queryString = params.toString();
    return `${API_BASE_URL}/attendances${queryString ? `?${queryString}` : ""}`;
  };

  const loadAttendance = async (isRefresh = false, activeFilters = filters) => {
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

      const response = await fetch(buildUrl(activeFilters), {
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
    const initialFilters = {
      attendance_date: getTodayDateLocal(),
      shift_ref: "",
      program_id: "",
      search: "",
    };

    setFilters(initialFilters);
    loadAttendance(false, initialFilters);
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
        application?.name,
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

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let notMarked = 0;

    filteredRows.forEach((row) => {
      const status = normalizeStatus(row?.status);

      if (status === "Present") present += 1;
      else if (status === "Absent") absent += 1;
      else if (status === "Late") late += 1;
      else if (status === "Excused") excused += 1;
      else notMarked += 1;
    });

    const markedTotal = present + absent + late + excused;
    const attendanceRate =
      markedTotal > 0 ? ((present + late + excused) / markedTotal) * 100 : 0;

    const completionRate = total > 0 ? (markedTotal / total) * 100 : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      notMarked,
      markedTotal,
      attendanceRate,
      completionRate,
    };
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

  const shiftsSummary = useMemo(() => {
    const grouped = {};

    filteredRows.forEach((row) => {
      const key = row?.shift_name || row?.shift_ref || "No Shift";
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [filteredRows]);

  const recentRecords = useMemo(() => {
    return [...filteredRows]
      .sort((a, b) => {
        const dateCompare = String(b?.attendance_date || "").localeCompare(
          String(a?.attendance_date || "")
        );

        if (dateCompare !== 0) return dateCompare;

        return Number(b?.id || 0) - Number(a?.id || 0);
      })
      .slice(0, 8);
  }, [filteredRows]);

  const selectedDateLabel = useMemo(() => {
    return filters.attendance_date
      ? formatDate(filters.attendance_date)
      : "All dates";
  }, [filters.attendance_date]);

  const maxShiftValue = useMemo(() => {
    return Math.max(...shiftsSummary.map((item) => item.total), 0);
  }, [shiftsSummary]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    loadAttendance(false, filters);
  };

  const clearFilters = () => {
    const nextFilters = {
      attendance_date: getTodayDateLocal(),
      shift_ref: "",
      program_id: "",
      search: "",
    };

    setFilters(nextFilters);
    loadAttendance(false, nextFilters);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 p-3 md:p-4">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#6050F0] p-4 text-white shadow-xl md:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/90">
                <UserCheck size={13} /> Daily Trainer Attendance
              </div>

              <h1 className="mt-3 text-2xl font-black leading-tight md:text-3xl">
                Welcome back, {trainerName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-white/80">
                This dashboard is now focused on daily attendance. It opens with
                today&apos;s records by default, so each new day starts fresh.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs backdrop-blur-sm">
                <p className="text-white/70">Viewing Date</p>
                <p className="mt-1 font-bold">{selectedDateLabel}</p>
              </div>

              <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs backdrop-blur-sm">
                <p className="text-white/70">Attendance Rate</p>
                <p className="mt-1 font-bold">{percent(summary.attendanceRate)}</p>
              </div>

              <button
                onClick={() => loadAttendance(true, filters)}
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-100"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        <Panel
          title="Attendance Filters"
          subtitle="Daily-first filters. Clear will return to today."
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F3F1FF] px-3 py-1.5 text-[11px] font-bold text-[#6050F0]">
              <Filter size={13} /> Compact Filters
            </div>
          }
        >
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Attendance Date
              </label>
              <input
                type="date"
                name="attendance_date"
                value={filters.attendance_date}
                onChange={handleFilterChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Shift Ref
              </label>
              <input
                type="text"
                name="shift_ref"
                value={filters.shift_ref}
                onChange={handleFilterChange}
                placeholder="ex: morning"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Program ID
              </label>
              <input
                type="text"
                name="program_id"
                value={filters.program_id}
                onChange={handleFilterChange}
                placeholder="ex: 1"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Search
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="student, status..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                type="button"
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#6050F0] px-3 text-sm font-bold text-white transition hover:bg-[#4F46E5]"
              >
                <Search size={15} />
                Apply
              </button>

              <button
                onClick={clearFilters}
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
        </Panel>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <CompactStatCard
            title="Active Records"
            value={summary.total}
            note={`Loaded for ${selectedDateLabel}`}
            icon={ClipboardList}
            tone="violet"
          />
          <CompactStatCard
            title="Marked Complete"
            value={`${summary.markedTotal}/${summary.total}`}
            note={`${percent(summary.completionRate)} of records marked`}
            icon={CheckCircle2}
            tone="emerald"
          />
          <CompactStatCard
            title="Attendance Rate"
            value={percent(summary.attendanceRate)}
            note="Present + Late + Excused"
            icon={TrendingUp}
            tone="blue"
          />
          <CompactStatCard
            title="Pending Marking"
            value={summary.notMarked}
            note="Needs action before the day closes"
            icon={AlertCircle}
            tone="amber"
          />
        </div>

        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.55fr_0.95fr]">
          <Panel
            title="Recent Attendance Records"
            subtitle="Compact daily table for the selected date"
            className="flex min-h-0 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    <th className="px-3 pb-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Student
                    </th>
                    <th className="px-3 pb-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Program
                    </th>
                    <th className="px-3 pb-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Shift
                    </th>
                    <th className="px-3 pb-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Date
                    </th>
                    <th className="px-3 pb-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Status
                    </th>
                    <th className="px-3 pb-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Marked By
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="rounded-xl bg-slate-50 px-3 py-5 text-center text-sm text-slate-500"
                      >
                        Loading attendance records...
                      </td>
                    </tr>
                  ) : recentRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="rounded-xl bg-slate-50 px-3 py-5 text-center text-sm text-slate-500"
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
                          <td className="rounded-l-xl px-3 py-3 text-sm font-bold text-slate-900">
                            {fullName || row?.application?.name || "Unknown Student"}
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-600">
                            {row?.program?.name ||
                              row?.program?.title ||
                              `Program ${row?.program_id || "-"}`}
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-600">
                            {row?.shift_name || row?.shift_ref || "-"}
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-600">
                            {formatDate(row?.attendance_date)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusPill(
                                row?.status
                              )}`}
                            >
                              {normalizeStatus(row?.status)}
                            </span>
                          </td>
                          <td className="rounded-r-xl px-3 py-3 text-sm text-slate-600">
                            {row?.markedByUser?.name || "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid min-h-0 gap-3 xl:grid-rows-[1fr_auto]">
            <Panel
              title="Status Distribution"
              subtitle="Daily status breakdown"
              className="flex min-h-0 flex-col"
            >
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="h-52 min-h-0">
                  {loading ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      Loading status data...
                    </div>
                  ) : statusDistribution.every((item) => item.value === 0) ? (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                      No status data found.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={72}
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

                <div className="grid content-start gap-2">
                  {statusDistribution.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-black text-slate-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="Shift Summary" subtitle="Top shifts for selected date">
              {loading ? (
                <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-500">
                  Loading shift summary...
                </div>
              ) : shiftsSummary.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                  No shift attendance data found.
                </div>
              ) : (
                <div className="space-y-3">
                  {shiftsSummary.map((item) => {
                    const width =
                      maxShiftValue > 0 ? (item.total / maxShiftValue) * 100 : 0;

                    return (
                      <div key={item.name} className="rounded-xl bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3F1FF] text-[#6050F0]">
                              <Clock3 size={15} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.total} record(s)
                              </p>
                            </div>
                          </div>

                          <span className="text-sm font-black text-slate-900">
                            {item.total}
                          </span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-[#6050F0]"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}