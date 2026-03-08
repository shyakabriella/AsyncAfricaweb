import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    ""
  );
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusBadge({ status }) {
  const current = String(status || "Pending").toLowerCase();

  const styles =
    current === "accepted"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : current === "rejected"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : current === "reviewed"
      ? "bg-sky-100 text-sky-700 border-sky-200"
      : current === "waitlisted"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {status || "Pending"}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
    </div>
  );
}

export default function ApplicationReceived() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function fetchApplications({ silent = false } = {}) {
    try {
      if (silent) {
        setPageLoading(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getAuthToken();

      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter) params.append("status", statusFilter);

      const url = `${API_BASE_URL.replace(/\/+$/, "")}/applications${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load applications.");
      }

      const rows = Array.isArray(result?.data?.data)
        ? result.data.data
        : Array.isArray(result?.data)
        ? result.data
        : [];

      setApplications(rows);
    } catch (err) {
      setError(err?.message || "Could not load applications.");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(
      (item) => String(item.status).toLowerCase() === "pending"
    ).length;
    const accepted = applications.filter(
      (item) => String(item.status).toLowerCase() === "accepted"
    ).length;
    const rejected = applications.filter(
      (item) => String(item.status).toLowerCase() === "rejected"
    ).length;

    return { total, pending, accepted, rejected };
  }, [applications]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[#6050F0]">
              Training Management
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Applications Received
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Review all submitted applications and open full details for
              approval or rejection.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fetchApplications({ silent: true })}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {pageLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Applications" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Accepted" value={stats.accepted} />
          <StatCard label="Rejected" value={stats.rejected} />
        </div>

        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Search applicant
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7A6CF5]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
              >
                <option value="">All status</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Waitlisted">Waitlisted</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSearch(searchInput)}
              className="rounded-full bg-[#6050F0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#7A6CF5]"
            >
              Filter
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setStatusFilter("");
              }}
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Application List
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Click any row to open full details.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {applications.length} record(s)
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Applicant
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Program
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Email
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Shift
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Experience
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Submitted
                    </th>
                    <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      onClick={() =>
                        navigate(`/dashboard/applications/${application.id}`)
                      }
                      className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">
                          {application?.applicant?.first_name}{" "}
                          {application?.applicant?.last_name}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {application?.applicant?.phone || "-"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800">
                          {application?.program?.title || "-"}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {application?.program?.slug || "-"}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {application?.applicant?.email || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {application?.shift?.name || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {application?.experience_level || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={application?.status} />
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {formatDate(application?.submitted_at)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/dashboard/applications/${application.id}`
                              );
                            }}
                            className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            View
                          </button>
                        </div>
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