import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

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

function statusBadgeClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "present") return "bg-emerald-500/15 text-emerald-300";
  if (value === "late") return "bg-amber-500/15 text-amber-300";
  if (value === "absent") return "bg-rose-500/15 text-rose-300";
  if (value === "excused") return "bg-sky-500/15 text-sky-300";
  return "bg-white/10 text-white/75";
}

function normalizeCurrentUser(item) {
  return {
    id: item?.id || "",
    name: item?.name || "Trainer",
    email: item?.email || "",
    phone: item?.phone || "",
    dailyRate: Number(item?.daily_rate || 0),
    walletBalance: Number(item?.wallet?.balance || 0),
    walletCurrency: item?.wallet?.currency || "RWF",
    walletStatus: item?.wallet?.status || "",
    role:
      item?.role?.slug ||
      item?.roles?.[0]?.slug ||
      item?.role ||
      "",
  };
}

function normalizeAttendanceRow(row, index, fallbackRate = 0, currency = "RWF") {
  return {
    id: row?.id || index + 1,
    date: row?.attendance_date || "",
    trainerId: row?.trainer_id || row?.trainer?.id || "",
    trainerName: row?.trainer?.name || "",
    status: row?.status || "Not Marked",
    dailyRate: Number(row?.daily_rate ?? fallbackRate ?? 0),
    earned: Number(row?.salary_amount || 0),
    isPaid: Boolean(row?.is_paid),
    paidAt: row?.paid_at || null,
    currency,
  };
}

export default function Wallet() {
  const storedUser = getStoredUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [currentUser, setCurrentUser] = useState({
    id: storedUser?.id || "",
    name: storedUser?.name || "Trainer",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    dailyRate: Number(storedUser?.daily_rate || 0),
    walletBalance: Number(storedUser?.wallet?.balance || 0),
    walletCurrency: storedUser?.wallet?.currency || "RWF",
    walletStatus: storedUser?.wallet?.status || "",
    role:
      storedUser?.role?.slug ||
      storedUser?.roles?.[0]?.slug ||
      storedUser?.role ||
      "",
  });

  const [rows, setRows] = useState([]);
  const [reportSummary, setReportSummary] = useState({
    total_records: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    not_marked: 0,
    total_salary: 0,
    total_paid: 0,
    total_unpaid: 0,
  });

  async function loadWallet(isRefresh = false) {
    try {
      setPageError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const meResponse = await apiRequest("/me");
      const meData = normalizeCurrentUser(meResponse?.data || {});
      setCurrentUser(meData);

      if (!meData?.id) {
        throw new Error("Authenticated user not found.");
      }

      const attendanceResponse = await apiRequest(
        `/trainer-attendances?trainer_id=${encodeURIComponent(meData.id)}`
      );

      const rawRows = Array.isArray(attendanceResponse?.data)
        ? attendanceResponse.data
        : Array.isArray(attendanceResponse?.data?.data)
        ? attendanceResponse.data.data
        : [];

      const normalizedRows = rawRows.map((item, index) =>
        normalizeAttendanceRow(
          item,
          index,
          meData.dailyRate,
          meData.walletCurrency || "RWF"
        )
      );

      setRows(normalizedRows);
      setReportSummary(
        attendanceResponse?.summary || {
          total_records: normalizedRows.length,
          present: normalizedRows.filter(
            (item) => String(item.status).toLowerCase() === "present"
          ).length,
          absent: normalizedRows.filter(
            (item) => String(item.status).toLowerCase() === "absent"
          ).length,
          late: normalizedRows.filter(
            (item) => String(item.status).toLowerCase() === "late"
          ).length,
          excused: normalizedRows.filter(
            (item) => String(item.status).toLowerCase() === "excused"
          ).length,
          not_marked: normalizedRows.filter(
            (item) => String(item.status).toLowerCase() === "not marked"
          ).length,
          total_salary: normalizedRows.reduce(
            (sum, item) => sum + Number(item.earned || 0),
            0
          ),
          total_paid: normalizedRows
            .filter((item) => item.isPaid)
            .reduce((sum, item) => sum + Number(item.earned || 0), 0),
          total_unpaid: normalizedRows
            .filter((item) => !item.isPaid)
            .reduce((sum, item) => sum + Number(item.earned || 0), 0),
        }
      );
    } catch (error) {
      setPageError(error.message || "Could not load wallet data.");
      setRows([]);
      setReportSummary({
        total_records: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        not_marked: 0,
        total_salary: 0,
        total_paid: 0,
        total_unpaid: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadWallet();
  }, []);

  const summary = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const thisMonthRows = rows.filter((item) => {
      const date = new Date(item.date);
      if (Number.isNaN(date.getTime())) return false;

      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    const thisMonthEarned = thisMonthRows.reduce(
      (sum, item) => sum + Number(item.earned || 0),
      0
    );

    const thisMonthDays = thisMonthRows.length;

    const paidRows = rows.filter((item) => item.isPaid);
    const unpaidRows = rows.filter((item) => !item.isPaid);

    return {
      totalEarned: Number(reportSummary.total_salary || 0),
      paidAmount: Number(reportSummary.total_paid || 0),
      unpaidAmount: Number(reportSummary.total_unpaid || 0),
      currentBalance: Number(currentUser.walletBalance || 0),
      thisMonthEarned,
      thisMonthDays,
      servedDays: Number(reportSummary.present || 0) + Number(reportSummary.late || 0),
      averageRate:
        rows.length > 0
          ? Math.round(
              rows.reduce((sum, item) => sum + Number(item.dailyRate || 0), 0) /
                rows.length
            )
          : Number(currentUser.dailyRate || 0),
      paidRows: paidRows.length,
      unpaidRows: unpaidRows.length,
    };
  }, [rows, reportSummary, currentUser.walletBalance, currentUser.dailyRate]);

  const currency = currentUser.walletCurrency || "RWF";

  return (
    <div className="min-h-screen bg-[#070811] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(96,80,240,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#A7A9BE]">
                Trainer Wallet
              </p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                Welcome, {currentUser?.name || "Trainer"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/65">
                This page shows your trainer wallet, your attendance earnings,
                and unpaid salary generated from your recorded attendance.
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
            title="Wallet Balance"
            value={formatCurrency(summary.currentBalance, currency)}
            note={currentUser.walletStatus || "Wallet"}
            icon={<IconWallet />}
          />
          <StatCard
            title="Unpaid Salary"
            value={formatCurrency(summary.unpaidAmount, currency)}
            note={`${summary.unpaidRows} unpaid attendance record(s)`}
            icon={<IconMoney />}
          />
          <StatCard
            title="Paid Salary"
            value={formatCurrency(summary.paidAmount, currency)}
            note={`${summary.paidRows} paid attendance record(s)`}
            icon={<IconCalendar />}
          />
          <StatCard
            title="Current Rate / Day"
            value={formatCurrency(currentUser.dailyRate, currency)}
            note="Trainer daily rate"
            icon={<IconRate />}
          />
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Attendance Earnings History</h2>
                <p className="text-sm text-white/60">
                  Salary generated from your trainer attendance
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/45">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Rate</th>
                    <th className="px-3 py-2">Earned</th>
                    <th className="px-3 py-2">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="rounded-2xl bg-white/[0.03] px-3 py-6 text-center text-sm text-white/65"
                      >
                        Loading wallet data...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="rounded-2xl bg-white/[0.03] px-3 py-6 text-center text-sm text-white/65"
                      >
                        No attendance salary records found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((item) => (
                      <tr
                        key={item.id}
                        className="rounded-2xl bg-white/[0.03] text-sm"
                      >
                        <td className="rounded-l-2xl px-3 py-3">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                              statusBadgeClass(item.status),
                            ].join(" ")}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {formatCurrency(item.dailyRate, currency)}
                        </td>
                        <td className="px-3 py-3 font-semibold text-[#B7B2FF]">
                          {formatCurrency(item.earned, currency)}
                        </td>
                        <td className="rounded-r-2xl px-3 py-3">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              item.isPaid
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-amber-500/15 text-amber-300",
                            ].join(" ")}
                          >
                            {item.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-bold">Payment Summary</h2>

              <div className="mt-4 space-y-3">
                <SummaryRow
                  label="Total Generated Salary"
                  value={formatCurrency(summary.totalEarned, currency)}
                />
                <SummaryRow
                  label="Already Paid"
                  value={formatCurrency(summary.paidAmount, currency)}
                />
                <SummaryRow
                  label="Still Unpaid"
                  value={formatCurrency(summary.unpaidAmount, currency)}
                />
                <SummaryRow
                  label="Wallet Balance"
                  value={formatCurrency(summary.currentBalance, currency)}
                  strong
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#6050F0]/15 to-[#7A6CF5]/10 p-5">
              <h2 className="text-lg font-bold">How it works</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <p>
                  1. Trainer attendance is recorded every day.
                </p>
                <p>
                  2. Salary is calculated from your attendance status and your{" "}
                  <span className="font-bold">daily rate</span>.
                </p>
                <p>
                  3. Paid salary increases your{" "}
                  <span className="font-bold">wallet balance</span>.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-bold">This Month</h2>
              <p className="mt-2 text-3xl font-extrabold text-white">
                {formatCurrency(summary.thisMonthEarned, currency)}
              </p>
              <p className="mt-2 text-sm text-white/60">
                Generated from {summary.thisMonthDays} attendance record(s) this month.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-bold">Attendance Summary</h2>
              <div className="mt-4 space-y-3">
                <SummaryRow label="Present + Late Days" value={summary.servedDays} />
                <SummaryRow
                  label="Average Rate / Day"
                  value={formatCurrency(summary.averageRate, currency)}
                />
                <SummaryRow
                  label="Wallet Status"
                  value={currentUser.walletStatus || "No wallet"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, note, icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(96,80,240,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <h3 className="mt-2 text-2xl font-extrabold text-white">{value}</h3>
          <p className="mt-2 text-xs text-white/50">{note}</p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#6050F0]/15 text-[#C8C3FF]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-white/65">{label}</span>
      <span
        className={
          strong
            ? "text-sm font-extrabold text-white"
            : "text-sm font-semibold text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}

function IconMoney() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1H6a2 2 0 0 0-2 2V8Z"
        fill="currentColor"
        opacity="0.65"
      />
      <path
        d="M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Z"
        fill="currentColor"
      />
      <circle cx="16.5" cy="14" r="1.5" fill="#070811" />
    </svg>
  );
}

function IconRate() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v18M8.5 7.5C8.5 6.1 9.84 5 11.5 5h1c1.93 0 3.5 1.34 3.5 3s-1.57 3-3.5 3h-1c-1.66 0-3 1.1-3 2.5S9.84 16 11.5 16h1c1.93 0 3.5-1.34 3.5-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}