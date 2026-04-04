import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_ENDPOINT ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const TOKEN_KEYS = ["token", "auth_token", "access_token"];
const SUCCESS_REFERRAL_STATUSES = ["approved", "paid", "active"];

function getStoredToken() {
  if (typeof window === "undefined") return "";

  for (const key of TOKEN_KEYS) {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) return fromLocal;

    const fromSession = sessionStorage.getItem(key);
    if (fromSession) return fromSession;
  }

  return "";
}

function getHeaders() {
  const token = getStoredToken();

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
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }

  if (["pending"].includes(value)) {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }

  if (["inactive", "rejected", "suspended"].includes(value)) {
    return "bg-rose-100 text-rose-700 border border-rose-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function normalizeAgent(item = {}) {
  return {
    id: item?.id || "",
    name: item?.name || "Agent",
    email: item?.email || "",
    phone: item?.phone || "",
    status: item?.status || "active",
    isActive: Boolean(item?.is_active),
    createdAt: item?.created_at || null,
    walletBalance: Number(item?.wallet?.balance || 0),
    walletCurrency: item?.wallet?.currency || "RWF",
    walletStatus: item?.wallet?.status || "active",
    commissionPercentage: Number(
      item?.profile?.commission_percentage || item?.agent_profile?.commission_percentage || 0
    ),
    imageUrl: item?.profile?.image_url || item?.agent_profile?.image_url || "",
  };
}

function normalizeStudentRow(row, index, currency = "RWF") {
  return {
    id: row?.referral_id || row?.id || index + 1,
    studentId: row?.student_id || row?.student?.id || "",
    studentName: row?.student_name || row?.student?.name || "Student",
    studentEmail: row?.student_email || row?.student?.email || "",
    studentPhone: row?.student_phone || row?.student?.phone || "",
    programName: row?.program?.name || "No Program",
    programSlug: row?.program?.slug || "",
    amountPaid: Number(row?.amount_paid || 0),
    commissionPercentage: Number(row?.commission_percentage || 0),
    commissionAmount: Number(row?.commission_amount || 0),
    currency: row?.currency || currency,
    status: row?.status || "pending",
    registeredAt: row?.registered_at || row?.created_at || null,
    createdAt: row?.created_at || null,
  };
}

function SummaryCard({ label, value, note }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
      {note ? <p className="mt-2 text-sm text-slate-600">{note}</p> : null}
    </div>
  );
}

function AgentAvatar({ agent }) {
  if (agent?.imageUrl) {
    return (
      <img
        src={agent.imageUrl}
        alt={agent?.name || "Agent"}
        className="h-16 w-16 rounded-3xl object-cover ring-4 ring-white/20"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-2xl font-bold text-white">
      {(agent?.name?.[0] || "A").toUpperCase()}
    </div>
  );
}

export default function AgentPageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState(normalizeAgent());
  const [stats, setStats] = useState({
    total_students: 0,
    approved_students: 0,
    pending_students: 0,
    total_amount_paid: 0,
    total_commission: 0,
    expected_commission: 0,
  });
  const [rows, setRows] = useState([]);

  async function loadDetail(isRefresh = false) {
    try {
      setPageError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const detail = await apiRequest(`/agents/${id}/dashboard`);
      const payload = detail?.data || {};
      const detailAgent = payload?.agent || {};
      const detailStats = payload?.stats || {};
      const detailRows = Array.isArray(payload?.students) ? payload.students : [];

      const normalizedAgent = normalizeAgent({
        ...detailAgent,
        wallet: payload?.wallet || detailAgent?.wallet,
      });

      setAgent(normalizedAgent);
      setStats({
        total_students: Number(detailStats?.total_students || 0),
        approved_students: Number(detailStats?.approved_students || 0),
        pending_students: Number(detailStats?.pending_students || 0),
        total_amount_paid: Number(detailStats?.total_amount_paid || 0),
        total_commission: Number(detailStats?.total_commission || 0),
        expected_commission: Number(detailStats?.expected_commission || 0),
      });
      setRows(
        detailRows.map((row, index) =>
          normalizeStudentRow(row, index, normalizedAgent.walletCurrency)
        )
      );
    } catch (error) {
      setPageError(error?.message || "Could not load agent details.");
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadDetail(false);
    }
  }, [id]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) => {
      return [
        row?.studentName,
        row?.studentEmail,
        row?.studentPhone,
        row?.programName,
        row?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [rows, search]);

  const approvedCount = useMemo(() => {
    return rows.filter((row) =>
      SUCCESS_REFERRAL_STATUSES.includes(String(row?.status || "").toLowerCase())
    ).length;
  }, [rows]);

  if (!id) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        Agent id is missing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <AgentAvatar agent={agent} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Agent Details
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {agent.name || "Agent"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
                This page shows the selected agent profile and all students registered under this agent.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/90">
                <span>{agent.email || "No email"}</span>
                <span>•</span>
                <span>{agent.phone || "No phone"}</span>
                <span>•</span>
                <span>{agent.commissionPercentage}% commission</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Back
            </button>
            <Link
              to="/dashboard/agents"
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              All Agents
            </Link>
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
          onClick={() => loadDetail(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Registered Students"
          value={stats.total_students}
          note="All students under this agent"
        />
        <SummaryCard
          label="Pending Students"
          value={stats.pending_students}
          note="Waiting for admin approval"
        />
        <SummaryCard
          label="Approved Students"
          value={stats.approved_students || approvedCount}
          note="Approved / paid students"
        />
        <SummaryCard
          label="Total Commission"
          value={formatCurrency(stats.total_commission, agent.walletCurrency)}
          note={`Expected pending: ${formatCurrency(
            stats.expected_commission,
            agent.walletCurrency
          )}`}
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Registered Students</h2>
            <p className="mt-1 text-sm text-slate-500">
              View all students registered by this agent.
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, email, phone, program..."
            className="w-full max-w-md rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor" />
                <path
                  d="M4 20a8 8 0 0 1 16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">No registered students found</h3>
            <p className="mt-2 text-sm text-slate-500">
              This agent has no students yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Program
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Commission
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-slate-900">{row.studentName}</div>
                        <div className="mt-1 text-sm text-slate-500">{row.studentEmail || "No email"}</div>
                        <div className="text-sm text-slate-500">{row.studentPhone || "No phone"}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="font-medium text-slate-900">{row.programName}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          Amount paid: {formatCurrency(row.amountPaid, row.currency)}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            row.status
                          )}`}
                        >
                          {row.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="font-medium text-slate-900">
                          {formatCurrency(row.commissionAmount, row.currency)}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {row.commissionPercentage}%
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-600">
                        {formatDate(row.registeredAt || row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}