import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Completed",
  "On Hold",
];

function SmallInput({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </label>
      <input
        {...props}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
      />
    </div>
  );
}

function SmallSelect({ label, className = "", children, ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </label>
      <select
        {...props}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
      >
        {children}
      </select>
    </div>
  );
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "In Progress":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "On Hold":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

function getStoredToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

async function apiRequest(url, options = {}) {
  const token = getStoredToken();

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("Unauthenticated. Please login again.");
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

export default function ProgramCurriculumCard({
  program,
  apiBaseUrl = API_BASE_URL,
}) {
  const programId = program?.id;
  const programTitle = program?.title || program?.name || "";

  const [form, setForm] = useState({
    title: "",
    days: "",
    description: "",
    status: "Not Started",
  });

  const [curriculum, setCurriculum] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const totalDays = useMemo(() => {
    return curriculum.reduce((sum, item) => sum + Number(item?.days || 0), 0);
  }, [curriculum]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function buildStatusDrafts(items) {
    const next = {};
    (items || []).forEach((item) => {
      if (item?.id) {
        next[item.id] = item?.status || "Not Started";
      }
    });
    return next;
  }

  async function loadCurriculum() {
    if (!programId) return;

    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(
        `${apiBaseUrl}/programs/${programId}/curriculum`
      );

      const items = response?.data?.curriculum || [];
      setCurriculum(items);
      setStatusDrafts(buildStatusDrafts(items));
    } catch (err) {
      setError(err.message || "Failed to load curriculum.");
      setCurriculum([]);
      setStatusDrafts({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!programId) {
      setCurriculum([]);
      setStatusDrafts({});
      setError("");
      return;
    }

    loadCurriculum();
  }, [programId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!programId) return;

    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const parsedDays = Number(form.days);

    if (!trimmedTitle) {
      setError("Module title is required.");
      return;
    }

    if (!parsedDays || parsedDays < 1) {
      setError("Days must be at least 1.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: trimmedTitle,
        days: parsedDays,
        description: trimmedDescription || null,
        status: form.status || "Not Started",
      };

      const response = await apiRequest(
        `${apiBaseUrl}/programs/${programId}/curriculum`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const items = response?.data?.curriculum || [];
      setCurriculum(items);
      setStatusDrafts(buildStatusDrafts(items));

      setForm({
        title: "",
        days: "",
        description: "",
        status: "Not Started",
      });
    } catch (err) {
      setError(err.message || "Failed to save curriculum.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveStatus(itemId) {
    if (!programId || !itemId) return;

    try {
      setUpdatingId(itemId);
      setError("");

      const status = statusDrafts[itemId] || "Not Started";

      const response = await apiRequest(
        `${apiBaseUrl}/programs/${programId}/curriculum/${itemId}`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );

      const items = response?.data?.curriculum || [];
      setCurriculum(items);
      setStatusDrafts(buildStatusDrafts(items));
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(itemId) {
    if (!programId || !itemId) return;

    try {
      setDeletingId(itemId);
      setError("");

      const response = await apiRequest(
        `${apiBaseUrl}/programs/${programId}/curriculum/${itemId}`,
        {
          method: "DELETE",
        }
      );

      const items = response?.data?.curriculum || [];
      setCurriculum(items);
      setStatusDrafts(buildStatusDrafts(items));
    } catch (err) {
      setError(err.message || "Failed to delete curriculum item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900">
            Program Curriculum
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {programId
              ? `Manage modules for ${programTitle}`
              : "Select a program first"}
          </p>
        </div>

        {programId ? (
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900">
              {curriculum.length}
            </span>{" "}
            modules •{" "}
            <span className="font-bold text-slate-900">{totalDays}</span> days
          </div>
        ) : null}
      </div>

      {!programId ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          Please select a program.
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.55fr_0.9fr_1fr_auto]"
          >
            <SmallInput
              label="Module Title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Introduction to HTML"
            />

            <SmallInput
              label="Days"
              type="number"
              min="1"
              value={form.days}
              onChange={(e) => updateField("days", e.target.value)}
              placeholder="3"
            />

            <SmallSelect
              label="Status"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SmallSelect>

            <SmallInput
              label="Description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Basic structure and tags"
            />

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-xl bg-[#6050F0] px-4 text-sm font-bold text-white transition hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading curriculum...
            </div>
          ) : curriculum.length === 0 ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No curriculum item found.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {curriculum.map((item, index) => (
                <div
                  key={item?.id || index}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {item?.title || "Curriculum Item"}
                      </h4>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {item?.days
                          ? `${item.days} Day${Number(item.days) > 1 ? "s" : ""}`
                          : "Days -"}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(
                          item?.status
                        )}`}
                      >
                        {item?.status || "Not Started"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {item?.description || "-"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      value={
                        statusDrafts[item?.id] ||
                        item?.status ||
                        "Not Started"
                      }
                      onChange={(e) =>
                        setStatusDrafts((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      className="h-10 min-w-[150px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={updatingId === item?.id}
                      onClick={() => handleSaveStatus(item?.id)}
                      className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === item?.id ? "Saving..." : "Save Status"}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === item?.id}
                      onClick={() => handleDelete(item?.id)}
                      className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === item?.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}