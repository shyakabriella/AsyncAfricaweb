import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const PRESENT_STATUSES = ["present", "attended", "completed", "served"];

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

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.attendance)) return value.attendance;
  if (Array.isArray(value?.records)) return value.records;
  if (Array.isArray(value?.wallet)) return value.wallet;
  return [];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
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

function isServedStatus(status) {
  return PRESENT_STATUSES.includes(String(status || "").toLowerCase());
}

function normalizeAttendanceRow(row, index, defaultRate = 5000) {
  const status = String(
    row?.status ||
      row?.attendance_status ||
      row?.state ||
      row?.attendance?.status ||
      "present"
  ).toLowerCase();

  const date =
    row?.attendance_date ||
    row?.date ||
    row?.served_date ||
    row?.work_date ||
    row?.created_at ||
    row?.updated_at ||
    "";

  const dailyRate = Number(
    row?.daily_rate ??
      row?.amount_per_day ??
      row?.rate ??
      row?.program?.daily_rate ??
      row?.program_rate ??
      defaultRate
  );

  const program =
    row?.program?.name ||
    row?.program_name ||
    row?.training_name ||
    row?.title ||
    "Training Service";

  const shift =
    row?.shift_name || row?.shift || row?.session || row?.period || "Day Shift";

  const earned = isServedStatus(status) ? dailyRate : 0;

  return {
    id: row?.id || index + 1,
    date,
    program,
    shift,
    status,
    dailyRate,
    earned,
  };
}

async function tryMany(endpoints, options) {
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
      if (!res.ok) continue;
      const data = await res.json();
      return data;
    } catch {
      // ignore and try next
    }
  }

  return null;
}

const fallbackRows = [
  {
    id: 1,
    date: "2026-03-01",
    program: "Web Development",
    shift: "Morning Shift",
    status: "present",
    dailyRate: 5000,
    earned: 5000,
  },
  {
    id: 2,
    date: "2026-03-03",
    program: "Web Development",
    shift: "Morning Shift",
    status: "present",
    dailyRate: 5000,
    earned: 5000,
  },
  {
    id: 3,
    date: "2026-03-05",
    program: "UI/UX Training",
    shift: "Afternoon Shift",
    status: "present",
    dailyRate: 6000,
    earned: 6000,
  },
  {
    id: 4,
    date: "2026-03-06",
    program: "UI/UX Training",
    shift: "Afternoon Shift",
    status: "absent",
    dailyRate: 6000,
    earned: 0,
  },
  {
    id: 5,
    date: "2026-03-08",
    program: "Software Testing",
    shift: "Day Shift",
    status: "present",
    dailyRate: 5500,
    earned: 5500,
  },
  {
    id: 6,
    date: "2026-03-10",
    program: "Software Testing",
    shift: "Day Shift",
    status: "present",
    dailyRate: 5500,
    earned: 5500,
  },
];

export default function Wallet() {
  const user = getStoredUser();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [dailyRate, setDailyRate] = useState(
    Number(
      user?.daily_rate ||
        user?.rate ||
        user?.amount_per_day ||
        user?.wallet_rate ||
        5000
    )
  );

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      setLoading(true);

      const token = getToken();
      const headers = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const walletResponse = await tryMany(
        ["/trainer/wallet", "/wallet", "/trainer/earnings"],
        { headers }
      );

      const attendanceResponse = await tryMany(
        [
          "/trainer/attendance",
          "/attendance",
          "/trainer/attendance-history",
          "/trainer/internship-attendance",
        ],
        { headers }
      );

      if (!active) return;

      let normalizedRows = [];
      let resolvedPaidAmount = 0;
      let resolvedRate = dailyRate;

      if (walletResponse) {
        resolvedPaidAmount = Number(
          walletResponse?.paid_amount ||
            walletResponse?.data?.paid_amount ||
            walletResponse?.wallet?.paid_amount ||
            0
        );

        resolvedRate = Number(
          walletResponse?.daily_rate ||
            walletResponse?.data?.daily_rate ||
            walletResponse?.wallet?.daily_rate ||
            resolvedRate
        );
      }

      const attendanceRows = toArray(attendanceResponse);
      if (attendanceRows.length > 0) {
        normalizedRows = attendanceRows.map((item, index) =>
          normalizeAttendanceRow(item, index, resolvedRate)
        );
      } else {
        const walletRows = toArray(walletResponse);
        if (walletRows.length > 0) {
          normalizedRows = walletRows.map((item, index) =>
            normalizeAttendanceRow(item, index, resolvedRate)
          );
        }
      }

      if (normalizedRows.length === 0) {
        normalizedRows = fallbackRows;
      }

      setRows(normalizedRows);
      setPaidAmount(resolvedPaidAmount);
      setDailyRate(resolvedRate || 5000);
      setLoading(false);
    }

    loadWallet();

    return () => {
      active = false;
    };
  }, [dailyRate]);

  const summary = useMemo(() => {
    const servedRows = rows.filter((item) => isServedStatus(item.status));
    const totalEarned = servedRows.reduce(
      (sum, item) => sum + Number(item.earned || 0),
      0
    );

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const thisMonthRows = servedRows.filter((item) => {
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
    const servedDays = servedRows.length;
    const averageRate =
      servedRows.length > 0
        ? Math.round(totalEarned / servedRows.length)
        : Number(dailyRate || 0);

    const availableBalance = totalEarned - Number(paidAmount || 0);

    return {
      servedDays,
      totalEarned,
      thisMonthEarned,
      thisMonthDays,
      averageRate,
      availableBalance,
    };
  }, [rows, paidAmount, dailyRate]);

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
                Welcome, {user?.name || "Trainer"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/65">
                This page shows how much the trainer deserves according to the
                number of days served. The formula is:
                <span className="ml-1 font-semibold text-white">
                  Served Days × Daily Rate
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-[#6050F0]/30 bg-[#6050F0]/10 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-[#B7B2FF]">
                Available Balance
              </div>
              <div className="mt-1 text-2xl font-extrabold text-white">
                {formatCurrency(summary.availableBalance)}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Earned"
            value={formatCurrency(summary.totalEarned)}
            note="All served days"
            icon={<IconMoney />}
          />
          <StatCard
            title="Served Days"
            value={summary.servedDays}
            note="Attendance counted as present"
            icon={<IconCalendar />}
          />
          <StatCard
            title="This Month"
            value={formatCurrency(summary.thisMonthEarned)}
            note={`${summary.thisMonthDays} served days this month`}
            icon={<IconWallet />}
          />
          <StatCard
            title="Average Rate / Day"
            value={formatCurrency(summary.averageRate)}
            note="Calculated from served days"
            icon={<IconRate />}
          />
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Service Earnings History</h2>
                <p className="text-sm text-white/60">
                  Amount earned for each day served
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/45">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Program</th>
                    <th className="px-3 py-2">Shift</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Rate</th>
                    <th className="px-3 py-2">Earned</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="rounded-2xl bg-white/[0.03] px-3 py-6 text-center text-sm text-white/65"
                      >
                        Loading wallet data...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="rounded-2xl bg-white/[0.03] px-3 py-6 text-center text-sm text-white/65"
                      >
                        No wallet data found.
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
                        <td className="px-3 py-3">{item.program}</td>
                        <td className="px-3 py-3">{item.shift}</td>
                        <td className="px-3 py-3">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                              isServedStatus(item.status)
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-rose-500/15 text-rose-300",
                            ].join(" ")}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {formatCurrency(item.dailyRate)}
                        </td>
                        <td className="rounded-r-2xl px-3 py-3 font-bold text-[#B7B2FF]">
                          {formatCurrency(item.earned)}
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
                  label="Total Earned"
                  value={formatCurrency(summary.totalEarned)}
                />
                <SummaryRow
                  label="Paid Amount"
                  value={formatCurrency(paidAmount)}
                />
                <SummaryRow
                  label="Current Balance"
                  value={formatCurrency(summary.availableBalance)}
                  strong
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#6050F0]/15 to-[#7A6CF5]/10 p-5">
              <h2 className="text-lg font-bold">How it works</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <p>
                  1. Every day marked as <span className="font-bold">present</span>{" "}
                  is counted as a served day.
                </p>
                <p>
                  2. The served day is multiplied by the{" "}
                  <span className="font-bold">daily rate</span>.
                </p>
                <p>
                  3. The result becomes the trainer wallet amount.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-bold">Current Rate</h2>
              <p className="mt-2 text-3xl font-extrabold text-white">
                {formatCurrency(dailyRate)}
              </p>
              <p className="mt-2 text-sm text-white/60">
                This is the daily amount used to calculate earnings.
              </p>
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
      <span className={strong ? "text-sm font-extrabold text-white" : "text-sm font-semibold text-white"}>
        {value}
      </span>
    </div>
  );
}

function IconMoney() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
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