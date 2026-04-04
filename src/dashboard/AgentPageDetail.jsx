import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_ENDPOINT ||
  "http://127.0.0.1:8000/api";

const TOKEN_KEYS = ["token", "auth_token", "access_token"];
const SUCCESS_STATUSES = ["approved", "paid", "active", "accepted"];

function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) return fromLocal;

    const fromSession = sessionStorage.getItem(key);
    if (fromSession) return fromSession;
  }
  return "";
}

async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw data || { message: "Request failed." };
  }

  return data;
}

function extractErrorMessage(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error?.message) return error.message;

  if (error?.errors && typeof error.errors === "object") {
    const firstKey = Object.keys(error.errors)[0];
    const firstValue = error.errors[firstKey];

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return firstValue[0];
    }

    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return fallback;
}

function currencyAmount(value, currency = "RWF") {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusClasses(status) {
  const value = String(status || "").toLowerCase();

  if (["approved", "paid", "active", "accepted"].includes(value)) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (["pending", "reviewed", "waiting"].includes(value)) {
    return "bg-amber-100 text-amber-700";
  }

  if (["inactive", "rejected", "declined", "suspended"].includes(value)) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function normalizeAgent(data = {}) {
  const source = data?.agent && typeof data.agent === "object" ? data.agent : data;

  return {
    id: source?.id || data?.id || "",
    name: source?.name || data?.name || "Agent",
    email: source?.email || data?.email || "",
    phone: source?.phone || data?.phone || "",
    commission_percentage: Number(
      source?.commission_percentage ??
        source?.agent_profile?.commission_percentage ??
        source?.profile?.commission_percentage ??
        data?.commission_percentage ??
        0
    ),
    is_active: Boolean(source?.is_active ?? data?.is_active ?? true),
    status:
      source?.status ||
      data?.status ||
      (source?.is_active || data?.is_active ? "active" : "inactive"),
    image_url:
      source?.image_url ||
      source?.profile?.image_url ||
      source?.agent_profile?.image_url ||
      data?.image_url ||
      "",
    wallet: {
      balance: Number(
        source?.wallet?.balance ??
          data?.wallet?.balance ??
          source?.wallet_balance ??
          data?.wallet_balance ??
          0
      ),
      currency:
        source?.wallet?.currency ||
        data?.wallet?.currency ||
        source?.currency ||
        data?.currency ||
        "RWF",
      status: source?.wallet?.status || data?.wallet?.status || "active",
    },
    stats: {
      total_students: Number(
        data?.stats?.total_students ??
          source?.stats?.total_students ??
          source?.total_students ??
          0
      ),
      total_commission: Number(
        data?.stats?.total_commission ??
          source?.stats?.total_commission ??
          source?.total_commission ??
          0
      ),
    },
  };
}

function normalizeStudent(student, index, defaultCurrency = "RWF") {
  const referral =
    student?.referred_by_agent ||
    student?.referredByAgent ||
    student?.referral ||
    student;

  return {
    id:
      referral?.referral_id ||
      referral?.id ||
      student?.referral_id ||
      student?.student_id ||
      student?.id ||
      index + 1,
    studentId: student?.student_id || student?.id || referral?.student_user_id || "",
    studentName:
      student?.student_name ||
      student?.name ||
      [student?.first_name, student?.last_name].filter(Boolean).join(" ") ||
      "Student",
    studentEmail: student?.student_email || student?.email || "",
    studentPhone: student?.student_phone || student?.phone || "",
    programName:
      referral?.program?.name ||
      student?.program?.name ||
      student?.program_name ||
      student?.program_title ||
      student?.programs?.[0]?.name ||
      "No Program",
    commissionAmount: Number(
      referral?.commission_amount ?? student?.commission_amount ?? 0
    ),
    commissionPercentage: Number(
      referral?.commission_percentage ?? student?.commission_percentage ?? 0
    ),
    status: String(
      referral?.status || student?.status || "pending"
    ).toLowerCase(),
    currency: referral?.currency || student?.currency || defaultCurrency,
    registeredAt:
      referral?.registered_at ||
      student?.registered_at ||
      student?.submitted_at ||
      student?.created_at ||
      null,
  };
}

function pickStudentsFromPayload(payload, defaultCurrency, selectedAgentId) {
  if (!payload) return [];

  const possibleArrays = [
    payload?.students,
    payload?.referrals,
    payload?.data?.students,
    payload?.data?.referrals,
    payload?.agent?.students,
    payload?.agent?.referrals,
    Array.isArray(payload?.data) ? payload.data : null,
    Array.isArray(payload) ? payload : null,
  ];

  const firstArray = possibleArrays.find((item) => Array.isArray(item));
  if (!firstArray) return [];

  let rows = firstArray;

  if (selectedAgentId) {
    rows = rows.filter((item) => {
      const referral = item?.referred_by_agent || item?.referredByAgent || item?.referral || item;
      const agentUserId = referral?.agent_user_id || referral?.agentUserId || item?.agent_user_id;

      if (agentUserId == null || agentUserId === "") {
        return true;
      }

      return String(agentUserId) === String(selectedAgentId);
    });
  }

  return rows.map((item, index) => normalizeStudent(item, index, defaultCurrency));
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

export default function AgentPageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedAgent = location.state?.agent || null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState(normalizeAgent(passedAgent || {}));
  const [students, setStudents] = useState([]);

  async function loadPage(isRefresh = false) {
    if (!id) {
      setError("Agent id is missing.");
      setLoading(false);
      return;
    }

    setError("");
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const results = {
      agent: null,
      dashboard: null,
      students: null,
      users: null,
    };

    try {
      try {
        results.agent = await apiRequest(`/agents/${id}`);
      } catch {}

      try {
        results.dashboard = await apiRequest(`/agents/${id}/dashboard`);
      } catch {}

      try {
        results.students = await apiRequest(`/agents/${id}/students`);
      } catch {}

      try {
        results.users = await apiRequest(`/users?role=student`);
      } catch {}

      if (!results.agent && !results.dashboard && !results.students && !results.users && !passedAgent) {
        throw new Error("Could not load this agent detail page.");
      }

      const mergedAgent = normalizeAgent({
        ...(passedAgent || {}),
        ...(results.agent?.data || {}),
        ...(results.dashboard?.data || {}),
      });

      const defaultCurrency = mergedAgent?.wallet?.currency || "RWF";

      let mergedStudents = [];
      for (const payload of [
        results.agent?.data,
        results.dashboard?.data,
        results.students?.data,
        results.students,
        results.users?.data,
        results.users,
      ]) {
        const rows = pickStudentsFromPayload(payload, defaultCurrency, id);
        if (rows.length > 0) {
          mergedStudents = rows;
          break;
        }
      }

      const computedStats = {
        total_students:
          Number(
            results.dashboard?.data?.stats?.total_students ??
              results.agent?.data?.stats?.total_students ??
              mergedAgent?.stats?.total_students ??
              mergedStudents.length
          ) || mergedStudents.length,
        total_commission:
          Number(
            results.dashboard?.data?.stats?.total_commission ??
              results.agent?.data?.stats?.total_commission ??
              mergedAgent?.stats?.total_commission ??
              mergedStudents.reduce(
                (sum, item) => sum + Number(item.commissionAmount || 0),
                0
              )
          ) || 0,
      };

      setAgent({
        ...mergedAgent,
        stats: computedStats,
      });
      setStudents(mergedStudents);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to load agent details."));
      setStudents([]);
      if (passedAgent) {
        setAgent(normalizeAgent(passedAgent));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPage(false);
  }, [id]);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return students;

    return students.filter((student) => {
      const haystack = [
        student?.studentName,
        student?.studentEmail,
        student?.studentPhone,
        student?.programName,
        student?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [students, search]);

  const summary = useMemo(() => {
    const pendingStudents = students.filter(
      (item) => String(item.status || "").toLowerCase() === "pending"
    ).length;

    const approvedStudents = students.filter((item) =>
      SUCCESS_STATUSES.includes(String(item.status || "").toLowerCase())
    ).length;

    const totalCommission =
      Number(agent?.stats?.total_commission || 0) ||
      students.reduce((sum, item) => sum + Number(item.commissionAmount || 0), 0);

    return {
      totalStudents:
        Number(agent?.stats?.total_students || 0) || students.length,
      pendingStudents,
      approvedStudents,
      totalCommission,
    };
  }, [agent, students]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate("/dashboard/agents")}
                className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                ← Back to Agents
              </button>

              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Agent Detail
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {agent?.name || "Agent"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-white/85 sm:text-base">
                This page shows the selected agent profile and all students
                registered under this agent.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Email
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {agent?.email || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Phone
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {agent?.phone || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Commission
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {Number(agent?.commission_percentage || 0)}%
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Wallet Balance
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {currencyAmount(
                    agent?.wallet?.balance || 0,
                    agent?.wallet?.currency || "RWF"
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Registered Students"
              value={summary.totalStudents}
              note="All students under this agent"
            />
            <SummaryCard
              label="Pending Students"
              value={summary.pendingStudents}
              note="Waiting for admin approval"
            />
            <SummaryCard
              label="Approved Students"
              value={summary.approvedStudents}
              note="Approved / paid / active students"
            />
            <SummaryCard
              label="Total Commission"
              value={currencyAmount(
                summary.totalCommission,
                agent?.wallet?.currency || "RWF"
              )}
              note="Total earned commission"
            />
          </div>

          <button
            type="button"
            onClick={() => loadPage(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Registered Students
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View all students registered by this agent.
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student, email, phone, program..."
              className="min-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5"
                >
                  <div className="h-4 w-56 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-40 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-600">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 19C7 16.7909 8.79086 15 11 15H13C15.2091 15 17 16.7909 17 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No registered students found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                This agent has no students yet, or the backend does not expose a
                direct student-detail endpoint. This page now also checks the
                users endpoint and filters students by referral agent.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Student
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Program
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Registered
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Commission
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="rounded-2xl bg-slate-50 shadow-sm"
                    >
                      <td className="rounded-l-2xl px-4 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {student.studentName}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {student.studentEmail || "-"}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {student.studentPhone || "-"}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top text-sm font-medium text-slate-700">
                        {student.programName || "-"}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            student.status
                          )}`}
                        >
                          {student.status || "pending"}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top text-sm text-slate-700">
                        {formatDate(student.registeredAt)}
                      </td>

                      <td className="rounded-r-2xl px-4 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {currencyAmount(
                            student.commissionAmount || 0,
                            student.currency || agent?.wallet?.currency || "RWF"
                          )}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {Number(student.commissionPercentage || 0)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}