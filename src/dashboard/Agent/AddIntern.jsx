import { useEffect, useMemo, useState } from "react";

const TOKEN_KEYS = ["token", "access_token", "auth_token"];
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

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

function normalizeUsers(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data?.users)) return payload.data.users;
  return [];
}

function normalizePrograms(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.programs)) return payload.programs;
  if (Array.isArray(payload?.data?.programs)) return payload.data.programs;
  return [];
}

export default function Addintern() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    program_id: "",
  });

  const loadStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/users?role=student`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load student accounts.");
      }

      setStudents(normalizeUsers(data));
    } catch (err) {
      setError(err.message || "Failed to load student accounts.");
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    setLoadingPrograms(true);

    try {
      const res = await fetch(`${API_BASE}/users-program-options`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load programs.");
      }

      setPrograms(normalizePrograms(data));
    } catch (err) {
      setError(err.message || "Failed to load programs.");
    } finally {
      setLoadingPrograms(false);
    }
  };

  useEffect(() => {
    loadStudents();
    loadPrograms();
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return students;

    return students.filter((student) => {
      return (
        String(student?.name || "").toLowerCase().includes(keyword) ||
        String(student?.email || "").toLowerCase().includes(keyword) ||
        String(student?.phone || "").toLowerCase().includes(keyword)
      );
    });
  }, [students, search]);

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
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
        is_active: form.status === "active",
        role_slug: "student",
        program_ids: form.program_id ? [Number(form.program_id)] : [],
      };

      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        const serverErrors = data?.data || data?.errors;
        const firstError =
          typeof serverErrors === "object" && serverErrors
            ? Object.values(serverErrors)?.flat?.()?.[0]
            : null;

        throw new Error(
          firstError || data?.message || "Failed to create student account."
        );
      }

      setFeedback(
        data?.data?.email_setup_message ||
          "Student account created successfully."
      );

      resetForm();
      await loadStudents();
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
          This page creates and manages student accounts. It uses your user
          controller student endpoints, so all records shown here are student
          accounts.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
          <h2 className="text-lg font-bold text-slate-900">
            Create Student Account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Fill in the student details below.
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
                required
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
                Student Accounts
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                View all students from the student account list.
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student..."
                className="w-full min-w-[220px] rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={loadStudents}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Active
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Loading student accounts...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No student accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                          {student.name || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {student.email || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {student.phone || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {student.status || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              student.is_active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700",
                            ].join(" ")}
                          >
                            {student.is_active ? "Yes" : "No"}
                          </span>
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