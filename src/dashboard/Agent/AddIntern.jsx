import { useEffect, useMemo, useState } from "react";

const TOKEN_KEYS = ["token", "access_token", "auth_token"];
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const AGENT_DASHBOARD_ENDPOINT = "/agents/me/dashboard";
const AGENT_REGISTER_STUDENT_ENDPOINT = "/agents/register-student";
const PROGRAM_OPTIONS_ENDPOINT = "/users-program-options";

function getStoredToken() {
  if (typeof window === "undefined") return "";

  for (const key of TOKEN_KEYS) {
    const localValue = localStorage.getItem(key);
    if (localValue) return localValue;

    const sessionValue = sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;
  }

  return "";
}

function getAuthHeaders() {
  const token = getStoredToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result?.success === false) {
    const serverErrors = result?.data || result?.errors;
    const firstError =
      typeof serverErrors === "object" && serverErrors
        ? Object.values(serverErrors)?.flat?.()?.[0]
        : null;

    throw new Error(firstError || result?.message || "Request failed.");
  }

  return result;
}

function normalizePrograms(payload) {
  const programs = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.programs)
    ? payload.programs
    : Array.isArray(payload?.data?.programs)
    ? payload.data.programs
    : [];

  return programs.map((program) => ({
    id: program?.id ?? "",
    name: program?.name || "Unnamed Program",
    slug: program?.slug || "",
    category: program?.category || "",
    duration: program?.duration || "",
    start_date: program?.start_date || null,
    end_date: program?.end_date || null,
    price: Number(program?.price || 0),
  }));
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
    return "bg-emerald-100 text-emerald-700";
  }

  if (value === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (["inactive", "rejected", "suspended"].includes(value)) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function normalizeStudentRow(row, index, priceMap) {
  const programId = row?.program?.id ?? row?.program_id ?? "";
  const matchedProgramPrice =
    programId !== "" && Object.prototype.hasOwnProperty.call(priceMap, String(programId))
      ? Number(priceMap[String(programId)] || 0)
      : null;

  const fallbackProgramPrice = Number(
    row?.program?.price ?? row?.program_price ?? row?.amount_paid ?? 0
  );

  const finalProgramPrice =
    matchedProgramPrice !== null && matchedProgramPrice > 0
      ? matchedProgramPrice
      : fallbackProgramPrice;

  return {
    id: row?.referral_id || index + 1,
    referralId: row?.referral_id || index + 1,
    studentId: row?.student_id || "",
    studentName: row?.student_name || "Student",
    studentEmail: row?.student_email || "",
    studentPhone: row?.student_phone || "",
    programId,
    programName: row?.program?.name || "No Program",
    programSlug: row?.program?.slug || "",
    programPrice: finalProgramPrice,
    amountPaid: Number(row?.amount_paid || 0),
    commissionPercentage: Number(row?.commission_percentage || 0),
    commissionAmount: Number(row?.commission_amount || 0),
    currency: row?.currency || "RWF",
    status: row?.status || "pending",
    registeredAt: row?.registered_at || row?.created_at || null,
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

export default function Addintern() {
  const [rawStudents, setRawStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [agentCommission, setAgentCommission] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    program_id: "",
    notes: "",
  });

  const programPriceMap = useMemo(() => {
    return programs.reduce((acc, program) => {
      acc[String(program.id)] = Number(program.price || 0);
      return acc;
    }, {});
  }, [programs]);

  const students = useMemo(() => {
    return rawStudents.map((row, index) =>
      normalizeStudentRow(row, index, programPriceMap)
    );
  }, [rawStudents, programPriceMap]);

  const totals = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        acc.total_students += 1;
        acc.total_program_amount += Number(student.programPrice || 0);
        acc.total_commission += Number(student.commissionAmount || 0);
        return acc;
      },
      {
        total_students: 0,
        total_program_amount: 0,
        total_commission: 0,
      }
    );
  }, [students]);

  const loadPrograms = async () => {
    setLoadingPrograms(true);

    try {
      const data = await apiRequest(PROGRAM_OPTIONS_ENDPOINT);
      setPrograms(normalizePrograms(data));
    } catch (err) {
      setError(err.message || "Failed to load programs.");
    } finally {
      setLoadingPrograms(false);
    }
  };

  const loadStudents = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await apiRequest(AGENT_DASHBOARD_ENDPOINT);
      const payload = data?.data || {};
      const rows = Array.isArray(payload?.students) ? payload.students : [];

      setRawStudents(rows);
      setAgentCommission(
        Number(payload?.agent?.profile?.commission_percentage || 0)
      );
    } catch (err) {
      setError(err.message || "Failed to load students.");
      setRawStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    Promise.all([loadStudents(false), loadPrograms()]);
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return students;

    return students.filter((student) => {
      return (
        String(student?.studentName || "").toLowerCase().includes(keyword) ||
        String(student?.studentEmail || "").toLowerCase().includes(keyword) ||
        String(student?.studentPhone || "").toLowerCase().includes(keyword) ||
        String(student?.programName || "").toLowerCase().includes(keyword)
      );
    });
  }, [students, search]);

  const selectedProgram = useMemo(() => {
    return programs.find(
      (program) => String(program.id) === String(form.program_id)
    );
  }, [programs, form.program_id]);

  const expectedCommission = useMemo(() => {
    const programPrice = Number(selectedProgram?.price || 0);
    return Math.round(((programPrice * agentCommission) / 100) * 100) / 100;
  }, [selectedProgram, agentCommission]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      status: "active",
      program_id: "",
      notes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        status: form.status,
        is_active: form.status === "active",
        program_id: Number(form.program_id),
        notes: form.notes.trim() || null,
      };

      const data = await apiRequest(AGENT_REGISTER_STUDENT_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const createdReferral = data?.data?.referral || {};
      const createdProgram = createdReferral?.program || {};
      const commissionValue = Number(createdReferral?.commission_amount || 0);
      const currency = createdReferral?.currency || "RWF";

      setFeedback(
        `Student created under this agent successfully. Program: ${
          createdProgram?.name || "Selected Program"
        }. Commission added: ${formatCurrency(commissionValue, currency)}.`
      );

      resetForm();
      await loadStudents(true);
    } catch (err) {
      setError(err.message || "Failed to create student account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#7c3aed] p-6 text-white shadow-xl">
        <p className="text-sm font-medium text-white/80">Agent Workspace</p>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">Add Intern</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85">
          This page now uses the selected program price and the program price
          list to display the correct total program amount for this agent.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="My Students"
          value={totals.total_students}
          note="Only students registered under this agent"
        />
        <SummaryCard
          label="Total Program Amount"
          value={formatCurrency(totals.total_program_amount, "RWF")}
          note="Calculated from program prices, not backend total_amount_paid"
        />
        <SummaryCard
          label="Total Commission"
          value={formatCurrency(totals.total_commission, "RWF")}
          note="Wallet amount earned from agent referrals"
        />
        <SummaryCard
          label="Default Commission"
          value={`${agentCommission}%`}
          note="Commission percentage set by admin"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
          <h2 className="text-lg font-bold text-slate-900">
            Register Student Under Agent
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            When you select a program, the system uses that program price to
            calculate agent commission automatically.
          </p>

          {feedback ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedback}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="Enter student email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="Enter student phone"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Program
              </label>
              <select
                name="program_id"
                value={form.program_id}
                onChange={handleChange}
                required
                disabled={loadingPrograms}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingPrograms ? "Loading programs..." : "Select program"}
                </option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                    {program.category ? ` - ${program.category}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-900">
                Program Price
              </p>
              <p className="mt-1 text-lg font-bold text-indigo-700">
                {formatCurrency(Number(selectedProgram?.price || 0), "RWF")}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Agent %
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {agentCommission}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Expected Commission
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {formatCurrency(expectedCommission, "RWF")}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="Optional notes"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loadingPrograms}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Create Student"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Students Registered Under This Agent
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                This list shows only referrals created by the logged-in agent.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or program..."
                className="w-full min-w-[220px] rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => loadStudents(true)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Program
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Program Fee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Commission %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Commission
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Registered
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Loading students...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No students registered under this agent yet.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          <div className="font-semibold text-slate-900">
                            {student.studentName}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {student.studentEmail || student.studentPhone || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          <div className="font-medium text-slate-900">
                            {student.programName}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {student.programSlug || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                          {formatCurrency(student.programPrice, student.currency)}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                          {student.commissionPercentage}%
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-indigo-700">
                          {formatCurrency(student.commissionAmount, student.currency)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              getStatusBadgeClass(student.status),
                            ].join(" ")}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {formatDate(student.registeredAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}