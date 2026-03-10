import { useCallback, useEffect, useMemo, useState } from "react";
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
      : "bg-violet-100 text-violet-700 border-violet-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles}`}
    >
      {status || "Pending"}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <h3 className="mt-2 text-2xl font-black leading-none text-slate-900">
        {value}
      </h3>
    </div>
  );
}

function MobileApplicationCard({
  application,
  onView,
  onDelete,
  deletingId,
}) {
  const fullName = `${application?.applicant?.first_name || ""} ${
    application?.applicant?.last_name || ""
  }`.trim();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900">
            {fullName || "-"}
          </h3>
          <p className="mt-1 truncate text-xs text-slate-500">
            {application?.applicant?.email || "-"}
          </p>
        </div>

        <StatusBadge status={application?.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-400">Program</p>
          <p className="mt-1 font-semibold text-slate-800">
            {application?.program?.title || "-"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Shift</p>
          <p className="mt-1 font-semibold text-slate-800">
            {application?.shift?.name || "-"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Phone</p>
          <p className="mt-1 font-semibold text-slate-800">
            {application?.applicant?.phone || "-"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Submitted</p>
          <p className="mt-1 font-semibold text-slate-800">
            {formatDate(application?.submitted_at)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
        >
          View
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={deletingId === application.id}
          className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deletingId === application.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default function ApplicationReceived() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchApplications = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setPageLoading(true);
        } else {
          setLoading(true);
        }

        setError("");
        setSuccessMessage("");

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
    },
    [search, statusFilter]
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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

  async function handleDelete(applicationId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(applicationId);
      setError("");
      setSuccessMessage("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/applications/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to delete application.");
      }

      setApplications((prev) =>
        prev.filter((item) => String(item.id) !== String(applicationId))
      );
      setSuccessMessage("Application deleted successfully.");
    } catch (err) {
      setError(err?.message || "Could not delete application.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#6050F0]">
              Training Management
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              Applications Received
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review submitted applications, open full details, or delete records.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fetchApplications({ silent: true })}
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              {pageLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Applications" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Accepted" value={stats.accepted} />
          <StatCard label="Rejected" value={stats.rejected} />
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Search applicant
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7A6CF5]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
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

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSearch(searchInput)}
              className="rounded-full bg-[#6050F0] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#7A6CF5] sm:text-sm"
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
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {successMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-base font-black text-slate-900 sm:text-lg">
                Application yuiyuiy
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                View details or delete a record.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
              {applications.length} record(s)
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No applications found.
            </div>
          ) : (
            <>
              <div className="grid gap-3 p-4 md:hidden">
                {applications.map((application) => (
                  <MobileApplicationCard
                    key={application.id}
                    application={application}
                    deletingId={deletingId}
                    onView={() =>
                      navigate(`/dashboard/applications/${application.id}`)
                    }
                    onDelete={() => handleDelete(application.id)}
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[980px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Applicant
                      </th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Program
                      </th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Email
                      </th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Shift
                      </th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Experience
                      </th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Submitted
                      </th>
                      <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
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
                        <td className="px-3 py-3">
                          <div className="max-w-[180px] truncate text-sm font-bold text-slate-900">
                            {application?.applicant?.first_name}{" "}
                            {application?.applicant?.last_name}
                          </div>
                          <div className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                            {application?.applicant?.phone || "-"}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="max-w-[170px] truncate text-sm font-semibold text-slate-800">
                            {application?.program?.title || "-"}
                          </div>
                          <div className="mt-1 max-w-[170px] truncate text-xs text-slate-500">
                            {application?.program?.slug || "-"}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-sm text-slate-700">
                          <div className="max-w-[190px] truncate">
                            {application?.applicant?.email || "-"}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-sm text-slate-700">
                          <div className="max-w-[130px] truncate">
                            {application?.shift?.name || "-"}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-sm text-slate-700">
                          <div className="max-w-[130px] truncate">
                            {application?.experience_level || "-"}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <StatusBadge status={application?.status} />
                        </td>

                        <td className="px-3 py-3 text-sm text-slate-700">
                          {formatDate(application?.submitted_at)}
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/dashboard/applications/${application.id}`
                                );
                              }}
                              className="rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(application.id);
                              }}
                              disabled={deletingId === application.id}
                              className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === application.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}