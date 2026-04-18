import { useEffect, useMemo, useState } from "react";
import { clearStoredAuth, getAuthState } from "../lib/auth";

const API_BASE =
  (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_APP_API_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");

export default function Report() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const [data, setData] = useState({
    programs: [],
    applications: [],
    agents: [],
    attendances: [],
    trainerAttendances: [],
    trainerSummary: {
      total_records: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      not_marked: 0,
      total_salary: 0,
      total_paid: 0,
      total_unpaid: 0,
    },
  });

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const [
        programsRes,
        applicationsRes,
        agentsRes,
        attendancesRes,
        trainerRes,
      ] = await Promise.all([
        apiGet("/programs"),
        apiGet("/applications?per_page=100"),
        apiGet("/agents"),
        apiGet("/attendances"),
        apiGet("/trainer-attendances"),
      ]);

      setData({
        programs: extractCollection(programsRes),
        applications: extractCollection(applicationsRes),
        agents: extractCollection(agentsRes),
        attendances: extractCollection(attendancesRes),
        trainerAttendances: extractCollection(trainerRes),
        trainerSummary: trainerRes?.summary || {
          total_records: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          not_marked: 0,
          total_salary: 0,
          total_paid: 0,
          total_unpaid: 0,
        },
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const activePrograms = data.programs.filter(
      (item) => normalizeStatus(item?.status) === "active"
    ).length;

    const pendingApplications = data.applications.filter(
      (item) => normalizeStatus(item?.status) === "pending"
    ).length;

    const acceptedApplications = data.applications.filter(
      (item) => normalizeStatus(item?.status) === "accepted"
    ).length;

    const activeAgents = data.agents.filter((item) => {
      if (typeof item?.is_active === "boolean") return item.is_active;
      return normalizeStatus(item?.status) === "active";
    }).length;

    const totalStudentsFromAgents = data.agents.reduce(
      (sum, item) => sum + toNumber(item?.stats?.total_students),
      0
    );

    const totalPaidCommission = data.agents.reduce(
      (sum, item) => sum + toNumber(item?.stats?.total_commission),
      0
    );

    const totalExpectedCommission = data.agents.reduce(
      (sum, item) => sum + toNumber(item?.stats?.expected_commission),
      0
    );

    return {
      totalPrograms: data.programs.length,
      activePrograms,
      totalApplications: data.applications.length,
      pendingApplications,
      acceptedApplications,
      totalAgents: data.agents.length,
      activeAgents,
      totalStudentsFromAgents,
      studentAttendance: data.attendances.length,
      trainerAttendance: data.trainerAttendances.length,
      totalPaidCommission,
      totalExpectedCommission,
      trainerSalary: toNumber(data.trainerSummary?.total_salary),
      trainerUnpaid: toNumber(data.trainerSummary?.total_unpaid),
    };
  }, [data]);

  const filteredPrograms = useMemo(
    () =>
      filterRows(data.programs, filters, (item) => [
        item?.name,
        item?.category,
        item?.status,
        item?.instructor,
      ], (item) => item?.created_at || item?.updated_at || item?.start_date),
    [data.programs, filters]
  );

  const filteredApplications = useMemo(
    () =>
      filterRows(data.applications, filters, (item) => [
        item?.first_name,
        item?.last_name,
        item?.email,
        item?.status,
        item?.program_title,
        item?.program?.title,
        item?.program?.name,
      ], (item) => item?.submitted_at || item?.created_at),
    [data.applications, filters]
  );

  const filteredAgents = useMemo(
    () =>
      filterRows(data.agents, filters, (item) => [
        item?.name,
        item?.email,
        item?.phone,
        item?.status,
      ], (item) => item?.created_at || item?.updated_at),
    [data.agents, filters]
  );

  const filteredAttendances = useMemo(
    () =>
      filterRows(data.attendances, filters, (item) => [
        item?.status,
        item?.shift_name,
        item?.program?.name,
      ], (item) => item?.attendance_date || item?.created_at),
    [data.attendances, filters]
  );

  const filteredTrainerAttendances = useMemo(
    () =>
      filterRows(data.trainerAttendances, filters, (item) => [
        item?.trainer?.name,
        item?.trainer?.email,
        item?.status,
      ], (item) => item?.attendance_date || item?.created_at),
    [data.trainerAttendances, filters]
  );

  const exportPdf = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          .print-hide {
            display: none !important;
          }

          .print-root {
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            break-inside: avoid;
          }

          table {
            width: 100% !important;
            font-size: 12px !important;
          }

          th, td {
            padding: 8px !important;
          }
        }
      `}</style>

      <div className="print-root space-y-6">
        <div className="print-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                AsyncAfrica Report Center
              </p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Reports & Analytics
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                View live reports for programs, applications, agents, student
                attendance, and trainer attendance.
              </p>
            </div>

            <div className="print-hide flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadReport}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={exportPdf}
                className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Export PDF
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="print-hide print-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Search report..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Programs" value={summary.totalPrograms} subtitle={`${summary.activePrograms} Active`} />
          <SummaryCard title="Applications" value={summary.totalApplications} subtitle={`${summary.pendingApplications} Pending`} />
          <SummaryCard title="Agents" value={summary.totalAgents} subtitle={`${summary.activeAgents} Active`} />
          <SummaryCard title="Agent Students" value={summary.totalStudentsFromAgents} subtitle="From referrals" />
          <SummaryCard title="Student Attendance" value={summary.studentAttendance} subtitle="Attendance records" />
          <SummaryCard title="Trainer Attendance" value={summary.trainerAttendance} subtitle="Trainer records" />
          <SummaryCard title="Paid Commission" value={`${formatNumber(summary.totalPaidCommission)} RWF`} subtitle="All agents" />
          <SummaryCard title="Trainer Salary" value={`${formatNumber(summary.trainerSalary)} RWF`} subtitle={`${formatNumber(summary.trainerUnpaid)} RWF unpaid`} />
        </div>

        <ReportSection
          title="Programs Report"
          subtitle="Live programs from the system"
          loading={loading}
          headers={["Name", "Category", "Status", "Instructor", "Students"]}
          rows={filteredPrograms.map((item) => [
            item?.name || "-",
            item?.category || "-",
            item?.status || "-",
            item?.instructor || "-",
            item?.students ?? item?.users_count ?? "-",
          ])}
        />

        <ReportSection
          title="Applications Report"
          subtitle="Applications received from the system"
          loading={loading}
          headers={["Applicant", "Email", "Program", "Status", "Submitted"]}
          rows={filteredApplications.map((item) => [
            `${item?.first_name || item?.applicant?.first_name || ""} ${item?.last_name || item?.applicant?.last_name || ""}`.trim() || "-",
            item?.email || item?.applicant?.email || "-",
            item?.program_title || item?.program?.title || item?.program?.name || "-",
            item?.status || "-",
            formatDate(item?.submitted_at || item?.created_at),
          ])}
        />

        <ReportSection
          title="Agents Report"
          subtitle="Agents and referral performance"
          loading={loading}
          headers={["Agent", "Email", "Students", "Paid Students", "Commission"]}
          rows={filteredAgents.map((item) => [
            item?.name || "-",
            item?.email || "-",
            toNumber(item?.stats?.total_students),
            toNumber(item?.stats?.paid_students),
            `${formatNumber(item?.stats?.total_commission || 0)} RWF`,
          ])}
        />

        <ReportSection
          title="Student Attendance Report"
          subtitle="Attendance records by applications/programs"
          loading={loading}
          headers={["Program", "Date", "Shift", "Status", "Note"]}
          rows={filteredAttendances.map((item) => [
            item?.program?.name || "-",
            formatDate(item?.attendance_date || item?.created_at),
            item?.shift_name || item?.shift_ref || "-",
            item?.status || "-",
            item?.note || "-",
          ])}
        />

        <ReportSection
          title="Trainer Attendance Report"
          subtitle="Trainer attendance and salary summary"
          loading={loading}
          headers={["Trainer", "Date", "Status", "Salary", "Paid"]}
          rows={filteredTrainerAttendances.map((item) => [
            item?.trainer?.name || "-",
            formatDate(item?.attendance_date || item?.created_at),
            item?.status || "-",
            `${formatNumber(item?.salary_amount || 0)} RWF`,
            item?.is_paid ? "Yes" : "No",
          ])}
        />
      </div>
    </>
  );
}

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="print-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </div>
      <div className="mt-3 text-2xl font-black text-slate-900">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}

function ReportSection({ title, subtitle, headers, rows, loading }) {
  return (
    <div className="print-card rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {loading ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          Loading...
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          No data found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="text-left">
                {headers.map((head) => (
                  <th key={head} className="px-6 py-4 font-bold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${index}-${cellIndex}`} className="px-6 py-4 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

async function apiGet(path) {
  const { token } =
    typeof window !== "undefined"
      ? getAuthState()
      : { token: "" };

  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await response.text();
  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = { message: text || "Unable to parse server response." };
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      clearStoredAuth();
    }
    throw new Error(result?.message || "Unauthenticated.");
  }

  if (!response.ok) {
    throw new Error(result?.message || "Request failed.");
  }

  return result;
}

function extractCollection(payload) {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function filterRows(rows, filters, getFields, getDate) {
  const search = (filters.search || "").trim().toLowerCase();
  const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const to = filters.dateTo ? new Date(filters.dateTo) : null;

  return rows.filter((row) => {
    const fields = getFields(row)
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const rowDateValue = getDate(row);
    const rowDate = rowDateValue ? new Date(rowDateValue) : null;

    const matchesSearch = !search || fields.includes(search);

    const matchesFrom =
      !from || !rowDate || rowDate >= new Date(from.setHours(0, 0, 0, 0));

    const matchesTo =
      !to || !rowDate || rowDate <= new Date(to.setHours(23, 59, 59, 999));

    return matchesSearch && matchesFrom && matchesTo;
  });
}

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(toNumber(value));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}