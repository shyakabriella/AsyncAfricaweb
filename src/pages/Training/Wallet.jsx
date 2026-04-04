import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

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
  const stored =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("auth_user") ||
    sessionStorage.getItem("auth_user") ||
    "{}";

  return parseStoredUser(stored);
}

function getToken() {
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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getHeaders(),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result?.success === false) {
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

function getStatusBadgeClass(status) {
  const value = String(status || "").toLowerCase();

  if (["active", "approved", "paid"].includes(value)) {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20";
  }

  if (value === "pending") {
    return "bg-amber-500/15 text-amber-300 border border-amber-500/20";
  }

  if (["inactive", "rejected", "suspended"].includes(value)) {
    return "bg-rose-500/15 text-rose-300 border border-rose-500/20";
  }

  return "bg-white/10 text-white/75 border border-white/10";
}

function isSuccessfulReferralStatus(status) {
  return SUCCESS_REFERRAL_STATUSES.includes(String(status || "").toLowerCase());
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

function normalizeCurrentUser(item) {
  return {
    id: item?.id || "",
    name: item?.name || "Agent",
    email: item?.email || "",
    phone: item?.phone || "",
    walletBalance: Number(item?.wallet?.balance || 0),
    walletCurrency: item?.wallet?.currency || "RWF",
    walletStatus: item?.wallet?.status || "",
    role:
      item?.role?.slug ||
      item?.roles?.[0]?.slug ||
      item?.role ||
      "agent",
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
    programPrice: Number(
      row?.program?.price ?? row?.program_price ?? row?.amount_paid ?? 0
    ),
    amountPaid: Number(row?.amount_paid || 0),
    commissionPercentage: Number(row?.commission_percentage || 0),
    commissionAmount: Number(row?.commission_amount || 0),
    currency: row?.currency || currency,
    status: row?.status || "Pending",
    registeredAt: row?.registered_at || null,
    createdAt: row?.created_at || null,
  };
}

function StatCard({ title, value, note }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(96,80,240,0.08)]">
      <p className="text-sm font-medium text-[#A7A9BE]">{title}</p>
      <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
        {value}
      </h3>
      {note ? (
        <p className="mt-2 text-sm leading-6 text-white/65">{note}</p>
      ) : null}
    </div>
  );
}

export default function Wallet() {
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
    walletStatus: storedUser?.wallet?.status || "",
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
    total_amount_paid: 0,
    total_commission: 0,
  });

  async function loadWallet(isRefresh = false) {
    try {
      setPageError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [meResponse, agentDashboardResponse] = await Promise.all([
        apiRequest("/me"),
        apiRequest(AGENT_DASHBOARD_ENDPOINT),
      ]);

      const meData = normalizeCurrentUser(meResponse?.data || {});
      const data = agentDashboardResponse?.data || {};

      const wallet = data?.wallet || {};
      const agentWallet = data?.agent?.wallet || {};
      const statsData = data?.stats || {};
      const students = Array.isArray(data?.students) ? data.students : [];

      const walletBalance = Number(
        wallet?.balance ?? agentWallet?.balance ?? meData.walletBalance ?? 0
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

      const role = data?.agent?.role?.slug || meData.role || "agent";

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
        total_amount_paid: Number(statsData?.total_amount_paid || 0),
        total_commission: Number(statsData?.total_commission || 0),
      });

      setRows(
        students.map((item, index) =>
          normalizeAgentStudentRow(item, index, walletCurrency)
        )
      );
    } catch (error) {
      setPageError(error?.message || "Could not load wallet data.");
      setRows([]);
      setStats({
        total_students: 0,
        total_amount_paid: 0,
        total_commission: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadWallet(false);
  }, []);

  const summary = useMemo(() => {
    const successfulRows = rows.filter((item) =>
      isSuccessfulReferralStatus(item.status)
    );

    const averageCommission =
      rows.length > 0
        ? rows.reduce(
            (sum, item) => sum + Number(item.commissionPercentage || 0),
            0
          ) / rows.length
        : Number(currentUser.commissionPercentage || 0);

    return {
      currentBalance: Number(currentUser.walletBalance || 0),
      totalStudents: Number(stats.total_students || 0),
      totalCommission: Number(stats.total_commission || 0),
      successfulStudents: successfulRows.length,
      averageCommission: Math.round(averageCommission * 100) / 100,
    };
  }, [rows, stats, currentUser.walletBalance, currentUser.commissionPercentage]);

  const currency = currentUser.walletCurrency || "RWF";

  return (
    <div className="min-h-screen bg-[#070811] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(96,80,240,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#A7A9BE]">
                Agent Wallet
              </p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                Welcome, {currentUser?.name || "Agent"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/65">
                This page shows only the logged-in agent referral summary and
                commission information.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-[#6050F0]/30 bg-[#6050F0]/10 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-[#B7B2FF]">
                  Wallet Balance
                </div>
                <div className="mt-1 text-2xl font-extrabold text-white">
                  {formatCurrency(summary.currentBalance, currency)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadWallet(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/[0.06] px-4 text-sm font-bold text-white transition hover:bg-white/[0.10] disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {pageError ? (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {pageError}
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Registered Students"
            value={summary.totalStudents}
            note="Students registered under this agent"
          />

          <StatCard
            title="Total Commission"
            value={formatCurrency(summary.totalCommission, currency)}
            note="Commission earned from registered students"
          />

          <StatCard
            title="Commission Percentage"
            value={`${summary.averageCommission}%`}
            note="Allowed commission for this agent"
          />

          <StatCard
            title="Approved Students"
            value={summary.successfulStudents}
            note="Referrals already approved or paid"
          />
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 xl:col-span-2">
            <h2 className="text-lg font-bold text-white">
              Agent Commission Summary
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              This section shows the logged-in agent details and commission
              summary.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-[#A7A9BE]">Agent Name</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {currentUser.name || "Agent"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-[#A7A9BE]">Wallet Status</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {currentUser.walletStatus || "active"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-[#A7A9BE]">Email</p>
                <p className="mt-2 break-all text-sm font-semibold text-white">
                  {currentUser.email || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-[#A7A9BE]">Phone</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {currentUser.phone || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold text-white">Quick View</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-[#A7A9BE]">Role</p>
                <p className="mt-2 text-base font-bold text-white">
                  {formatRoleLabel(currentUser.role)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-[#A7A9BE]">Default Commission</p>
                <p className="mt-2 text-base font-bold text-white">
                  {currentUser.commissionPercentage || 0}%
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-[#A7A9BE]">Currency</p>
                <p className="mt-2 text-base font-bold text-white">
                  {currency}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold text-white">
              Students Registered by Agent
            </h2>
            <p className="mt-1 text-sm text-white/65">
              This table shows the selected program, commission percentage,
              commission earned, and current referral status.
            </p>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-white/70">
              Loading wallet data...
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-white/70">
              No students registered under this agent yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-white/[0.03]">
                  <tr className="text-xs uppercase tracking-[0.14em] text-[#A7A9BE]">
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Program</th>
                    <th className="px-5 py-4 font-semibold">Commission %</th>
                    <th className="px-5 py-4 font-semibold">Commission</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Registered</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-white/10 text-sm text-white/85"
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="font-semibold text-white">
                          {row.studentName}
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          {row.studentEmail || row.studentPhone || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="font-medium text-white">
                          {row.programName}
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          {row.programSlug || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top font-semibold text-white">
                        {row.commissionPercentage}%
                      </td>

                      <td className="px-5 py-4 align-top font-semibold text-[#B7B2FF]">
                        {formatCurrency(row.commissionAmount, row.currency)}
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                            row.status
                          )}`}
                        >
                          {row.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top text-white/70">
                        {formatDate(row.registeredAt || row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}