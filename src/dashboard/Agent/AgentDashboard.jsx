import { useEffect, useMemo, useState } from "react";

const API_BASE =
  (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/$/, "");

const AGENT_DASHBOARD_ENDPOINT = "/agents/me/dashboard";
const SUCCESS_REFERRAL_STATUSES = ["approved", "paid", "active"];

function parseStoredUser(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function getStoredUser() {
  if (typeof window === "undefined") return {};

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

function getToken() {
  if (typeof window === "undefined") return "";

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

function getHeaders() {
  const token = getToken();

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: getHeaders(),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message || "Request failed.");
  }

  return result;
}

function formatCurrency(amount, currency = "RWF") {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRoleLabel(role) {
  const value = String(role || "").trim();
  if (!value) return "Agent";

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusBadgeClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "active" || value === "approved" || value === "paid") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }

  if (value === "pending") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }

  if (value === "inactive" || value === "rejected" || value === "suspended") {
    return "bg-rose-100 text-rose-700 border border-rose-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function isSuccessfulReferralStatus(status) {
  return SUCCESS_REFERRAL_STATUSES.includes(String(status || "").toLowerCase());
}

function normalizeCurrentUser(item) {
  return {
    id: item?.id || "",
    name: item?.name || "Agent",
    email: item?.email || "",
    phone: item?.phone || "",
    walletBalance: Number(item?.wallet?.balance || 0),
    walletCurrency: item?.wallet?.currency || "RWF",
    walletStatus: item?.wallet?.status || "active",
    role: item?.role?.slug || item?.roles?.[0]?.slug || item?.role || "agent",
    commissionPercentage: Number(
      item?.agent_profile?.commission_percentage || 0
    ),
  };
}

function normalizeAgentStudentRow(row, index, currency = "RWF") {
  return {
    id: row?.referral_id || index + 1,
    studentId: row?.student_id || "",
    studentName: row?.student_name || "Student",
    studentEmail: row?.student_email || "",
    studentPhone: row?.student_phone || "",
    programName: row?.program?.name || "No Program",
    programSlug: row?.program?.slug || "",
    commissionPercentage: Number(row?.commission_percentage || 0),
    commissionAmount: Number(row?.commission_amount || 0),
    currency: row?.currency || currency,
    status: row?.status || "pending",
    registeredAt: row?.registered_at || null,
    createdAt: row?.created_at || null,
  };
}

function ProgressBar({ value, colorClass = "bg-indigo-600" }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function MiniBarChart({ items }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="mt-6">
      <div className="flex h-56 items-end gap-3 rounded-3xl bg-slate-50 p-4">
        {items.map((item) => {
          const height = Math.max((item.value / maxValue) * 100, item.value > 0 ? 18 : 6);

          return (
            <div
              key={item.label}
              className="flex flex-1 flex-col items-center justify-end"
            >
              <div className="mb-2 text-xs font-semibold text-slate-700">
                {item.value}
              </div>
              <div
                className={`w-full max-w-[52px] rounded-t-2xl ${item.color}`}
                style={{ height: `${height}%` }}
              />
              <div className="mt-3 text-xs text-slate-500">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ title, value, note, icon, progress, colorClass = "bg-indigo-600" }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
          <p className="mt-2 text-sm text-slate-600">{note}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
          {icon}
        </div>
      </div>

      <ProgressBar value={progress} colorClass={colorClass} />
    </div>
  );
}

export default function AgentDashboard() {
  const storedUser = getStoredUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");

  const [currentUser, setCurrentUser] = useState({
    id: storedUser?.id || "",
    name: storedUser?.name || "Agent",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    walletBalance: Number(storedUser?.wallet?.balance || 0),
    walletCurrency: storedUser?.wallet?.currency || "RWF",
    walletStatus: storedUser?.wallet?.status || "active",
    role:
      storedUser?.role?.slug ||
      storedUser?.roles?.[0]?.slug ||
      storedUser?.role ||
      "agent",
    commissionPercentage: Number(
      storedUser?.agent_profile?.commission_percentage || 0
    ),
  });

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({
    total_students: 0,
    total_commission: 0,
  });

  async function loadDashboard(isRefresh = false) {
    try {
      setPageError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [meResponse, dashboardResponse] = await Promise.all([
        apiRequest("/me"),
        apiRequest(AGENT_DASHBOARD_ENDPOINT),
      ]);

      const meData = normalizeCurrentUser(meResponse?.data || {});
      const data = dashboardResponse?.data || {};

      const wallet = data?.wallet || {};
      const agentWallet = data?.agent?.wallet || {};
      const statsData = data?.stats || {};
      const students = Array.isArray(data?.students) ? data.students : [];

      const walletBalance = Number(
        wallet?.balance ??
          agentWallet?.balance ??
          meData.walletBalance ??
          0
      );

      const walletCurrency =
        wallet?.currency ||
        agentWallet?.currency ||
        meData.walletCurrency ||
        "RWF";

      const walletStatus =
        wallet?.status ||
        agentWallet?.status ||
        meData.walletStatus ||
        "active";

      const commissionPercentage = Number(
        data?.agent?.profile?.commission_percentage ??
          meData.commissionPercentage ??
          0
      );

      const role =
        data?.agent?.role?.slug ||
        meData.role ||
        "agent";

      setCurrentUser((prev) => ({
        ...prev,
        ...meData,
        role,
        walletBalance,
        walletCurrency,
        walletStatus,
        commissionPercentage,
      }));

      setStats({
        total_students: Number(statsData?.total_students || 0),
        total_commission: Number(statsData?.total_commission || 0),
      });

      setRows(
        students.map((item, index) =>
          normalizeAgentStudentRow(item, index, walletCurrency)
        )
      );
    } catch (error) {
      setPageError(error?.message || "Could not load dashboard data.");
      setRows([]);
      setStats({
        total_students: 0,
            total_commission: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard(false);
  }, []);

  const summary = useMemo(() => {
    const successfulRows = rows.filter((item) =>
      isSuccessfulReferralStatus(item.status)
    );

    const pendingRows = rows.filter(
      (item) => String(item.status || "").toLowerCase() === "pending"
    );

    const thisMonth = new Date();
    const thisMonthRows = rows.filter((item) => {
      const rawDate = item.registeredAt || item.createdAt;
      if (!rawDate) return false;

      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return false;

      return (
        d.getMonth() === thisMonth.getMonth() &&
        d.getFullYear() === thisMonth.getFullYear()
      );
    });

    const averageCommission =
      rows.length > 0
        ? rows.reduce(
            (sum, item) => sum + Number(item.commissionPercentage || 0),
            0
          ) / rows.length
        : Number(currentUser.commissionPercentage || 0);

    const conversionRate =
      Number(stats.total_students || 0) > 0
        ? (successfulRows.length / Number(stats.total_students || 1)) * 100
        : 0;

    return {
      currentBalance: Number(currentUser.walletBalance || 0),
      totalStudents: Number(stats.total_students || 0),
      totalCommission: Number(stats.total_commission || 0),
      thisMonthStudents: thisMonthRows.length,
      thisMonthCommission: thisMonthRows.reduce(
        (sum, item) => sum + Number(item.commissionAmount || 0),
        0
      ),
      approvedStudents: successfulRows.length,
      pendingStudents: pendingRows.length,
      averageCommission: Math.round(averageCommission * 100) / 100,
      conversionRate: Math.round(conversionRate),
    };
  }, [rows, stats, currentUser.walletBalance, currentUser.commissionPercentage]);

  const weeklyChartData = useMemo(() => {
    const days = [];
    const base = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);

      const label = d.toLocaleDateString("en-GB", { weekday: "short" });

      const count = rows.filter((item) => {
        const rawDate = item.registeredAt || item.createdAt;
        if (!rawDate) return false;

        const rowDate = new Date(rawDate);
        if (Number.isNaN(rowDate.getTime())) return false;

        return (
          rowDate.getDate() === d.getDate() &&
          rowDate.getMonth() === d.getMonth() &&
          rowDate.getFullYear() === d.getFullYear()
        );
      }).length;

      days.push({
        label,
        value: count,
        color:
          i === 0
            ? "bg-emerald-500"
            : i <= 2
            ? "bg-indigo-500"
            : "bg-violet-500",
      });
    }

    return days;
  }, [rows]);

  const topPrograms = useMemo(() => {
    const grouped = rows.reduce((acc, row) => {
      const key = row.programName || "No Program";

      if (!acc[key]) {
        acc[key] = {
          name: row.programName || "No Program",
          count: 0,
          commission: 0,
        };
      }

      acc[key].count += 1;
      acc[key].commission += Number(row.commissionAmount || 0);

      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.count - a.count || b.commission - a.commission)
      .slice(0, 5);
  }, [rows]);

  const recentStudents = useMemo(() => {
    return [...rows]
      .sort((a, b) => {
        const aDate = new Date(a.registeredAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.registeredAt || b.createdAt || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 6);
  }, [rows]);

  const cardStats = [
    {
      title: "Total Registered Students",
      value: summary.totalStudents,
      note: `${summary.thisMonthStudents} this month`,
      progress:
        summary.totalStudents > 0
          ? Math.min(100, Math.round((summary.thisMonthStudents / summary.totalStudents) * 100))
          : 0,
      colorClass: "bg-indigo-600",
      icon: "👨‍🎓",
    },
    {
      title: "Total Commission",
      value: formatCurrency(summary.totalCommission, currentUser.walletCurrency),
      note: `${summary.thisMonthCommission ? formatCurrency(summary.thisMonthCommission, currentUser.walletCurrency) : formatCurrency(0, currentUser.walletCurrency)} this month`,
      progress: Math.min(100, Math.round(summary.averageCommission)),
      colorClass: "bg-emerald-600",
      icon: "📈",
    },
    {
      title: "Commission Percentage",
      value: `${currentUser.commissionPercentage || 0}%`,
      note: "Default commission set by admin",
      progress: Math.min(100, Math.round(currentUser.commissionPercentage || 0)),
      colorClass: "bg-violet-600",
      icon: "💰",
    },
    {
      title: "Approved Students",
      value: summary.approvedStudents,
      note: `${summary.pendingStudents} pending students`,
      progress: Math.min(100, summary.conversionRate),
      colorClass: "bg-amber-500",
      icon: "✅",
    },
  ];

  const quickActions = [
    "Register student",
    "Open wallet",
    "Check recent referrals",
    "Review program performance",
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-50">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#7c3aed] p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-white/80">
                Agent Workspace
              </p>
              <h1 className="mt-2 text-2xl font-bold md:text-4xl">
                Welcome back, {currentUser.name || "Agent"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                This dashboard now shows real agent information from your system:
                your students, commissions, wallet balance, and recent
                registration activity.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {quickActions.map((action) => (
                  <div
                    key={action}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid min-w-[280px] gap-4 sm:grid-cols-2 xl:w-[360px] xl:grid-cols-1">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Logged in as
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {currentUser.name || "Agent"}
                </p>
                <p className="text-sm text-white/80">
                  {currentUser.email || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Wallet Balance
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(
                    summary.currentBalance,
                    currentUser.walletCurrency || "RWF"
                  )}
                </p>
                <p className="text-sm text-white/80">
                  Default commission: {currentUser.commissionPercentage || 0}%
                </p>
              </div>
            </div>
          </div>
        </section>

        {pageError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {pageError}
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cardStats.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Weekly Student Registrations
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Real registrations made by this agent in the last 7 days.
                </p>
              </div>

              <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                Live Overview
              </div>
            </div>

            <MiniBarChart items={weeklyChartData} />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Profile Summary</h2>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                {(currentUser.name?.[0] || "A").toUpperCase()}
              </div>

              <div>
                <p className="text-base font-semibold text-slate-900">
                  {currentUser.name || "Agent"}
                </p>
                <p className="text-sm text-slate-500">
                  {currentUser.email || "-"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Role
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatRoleLabel(currentUser.role)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Phone
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {currentUser.phone || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Wallet Status
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-600">
                  {currentUser.walletStatus || "active"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">
              Referral Activity Overview
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              This section summarizes real student referral performance for this
              agent based on current data from the system.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-indigo-50 p-5">
                <p className="text-sm font-medium text-slate-600">
                  Approved / Paid Students
                </p>
                <div className="mt-2 text-3xl font-bold text-indigo-700">
                  {summary.approvedStudents}
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 p-5">
                <p className="text-sm font-medium text-slate-600">
                  Pending Students
                </p>
                <div className="mt-2 text-3xl font-bold text-amber-700">
                  {summary.pendingStudents}
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-sm font-medium text-slate-600">
                  This Month Commission
                </p>
                <div className="mt-2 text-3xl font-bold text-emerald-700">
                  {formatCurrency(
                    summary.thisMonthCommission,
                    currentUser.walletCurrency
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-violet-50 p-5">
                <p className="text-sm font-medium text-slate-600">
                  This Month Students
                </p>
                <div className="mt-2 text-3xl font-bold text-violet-700">
                  {summary.thisMonthStudents}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Performance Note
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Approved students and commission totals now come from the actual agent
                referral records, so this section changes automatically whenever
                new students are registered or their status changes.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Top Programs</h2>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Loading programs...
                </div>
              ) : topPrograms.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  No program data yet.
                </div>
              ) : (
                topPrograms.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.count} student{item.count === 1 ? "" : "s"}
                        </p>
                      </div>

                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {formatCurrency(item.commission, currentUser.walletCurrency)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Registered Students
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Latest students registered under this agent.
                </p>
              </div>

              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {recentStudents.length} shown
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Program</th>
                    <th className="px-4 py-3 font-semibold">Commission</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Registered</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Loading dashboard data...
                      </td>
                    </tr>
                  ) : recentStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No students registered under this agent yet.
                      </td>
                    </tr>
                  ) : (
                    recentStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-4 py-4 align-top">
                          <div className="font-semibold text-slate-900">
                            {student.studentName}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {student.studentEmail || student.studentPhone || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-slate-900">
                            {student.programName}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {student.programSlug || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-indigo-700">
                          {formatCurrency(student.commissionAmount, student.currency)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              student.status
                            )}`}
                          >
                            {student.status || "pending"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {formatDate(student.registeredAt || student.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Quick View</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Wallet Balance
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    summary.currentBalance,
                    currentUser.walletCurrency
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Total Students
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {summary.totalStudents}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Total Commission
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    summary.totalCommission,
                    currentUser.walletCurrency
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-sm font-semibold text-indigo-900">
                  Suggestion
                </p>
                <p className="mt-2 text-sm leading-6 text-indigo-700">
                  Focus on pending students first, then move them to approved
                  status after payment confirmation so wallet and dashboard stay
                  updated correctly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}