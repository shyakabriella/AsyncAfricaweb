import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const PAGE_SIZE = 5;
const API_FETCH_PAGE_SIZE = 100;

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    ""
  );
}

function normalizeText(value) {
  return String(value || "").trim();
}

function getApplicantName(application) {
  const first = normalizeText(application?.applicant?.first_name);
  const last = normalizeText(application?.applicant?.last_name);
  return `${first} ${last}`.trim() || "Unknown Applicant";
}

function getProgramId(application) {
  return (
    application?.program?.id ||
    application?.program_id ||
    application?.program?.slug ||
    application?.program?.code ||
    "unassigned"
  );
}

function getProgramTitle(application) {
  return (
    normalizeText(application?.program?.title) ||
    normalizeText(application?.program?.name) ||
    normalizeText(application?.program_name) ||
    "Unassigned Program"
  );
}

function getProgramMeta(application) {
  return (
    normalizeText(application?.program?.slug) ||
    normalizeText(application?.program?.code) ||
    normalizeText(application?.program?.category) ||
    "No code"
  );
}

function getShiftId(application) {
  return (
    application?.shift?.id ||
    application?.shift_id ||
    normalizeText(application?.shift?.name).toLowerCase() ||
    "unassigned-shift"
  );
}

function getShiftTitle(application) {
  return normalizeText(application?.shift?.name) || "Unassigned Shift";
}

function matchesSearch(application, search) {
  const query = normalizeText(search).toLowerCase();
  if (!query) return true;

  const haystack = [
    getApplicantName(application),
    getProgramTitle(application),
    getShiftTitle(application),
    application?.status,
    application?.applicant?.email,
    application?.applicant?.phone,
  ]
    .map((item) => normalizeText(item).toLowerCase())
    .join(" ");

  return haystack.includes(query);
}

function matchesStatus(application, statusFilter) {
  if (!statusFilter) return true;

  return (
    normalizeText(application?.status).toLowerCase() ===
    normalizeText(statusFilter).toLowerCase()
  );
}

function uniqueApplicationsById(rows) {
  const map = new Map();

  rows.forEach((item) => {
    const id = String(item?.id ?? "");
    if (!id) return;
    map.set(id, item);
  });

  return Array.from(map.values());
}

function buildApplicationsUrl(page = 1, perPage = API_FETCH_PAGE_SIZE) {
  const base = `${API_BASE_URL.replace(/\/+$/, "")}/applications`;
  const url = new URL(base);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  return url.toString();
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

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <h3 className="mt-2 text-2xl font-black leading-none text-slate-900">
        {value}
      </h3>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ProgramSummaryCard({ program, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${
        active
          ? "border-[#6050F0] bg-[#f4f2ff] ring-2 ring-[#6050F0]/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-slate-900">
            {program.title}
          </h3>
          <p className="mt-1 truncate text-xs text-slate-500">
            {program.meta}
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
          {program.total}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {program.shiftCount} shift(s)
        </span>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
          {program.pending} pending
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          {program.accepted} accepted
        </span>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
          {program.rejected} rejected
        </span>
      </div>
    </button>
  );
}

function MobileApplicantCard({
  application,
  onView,
  onEdit,
  onDelete,
  deletingId,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-sm font-bold text-slate-900">
          {getApplicantName(application)}
        </h3>

        <StatusBadge status={application?.status} />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        {getProgramTitle(application)} • {getShiftTitle(application)}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onView}
          className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
        >
          View
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={deletingId === application.id}
          className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deletingId === application.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-500">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage <= 1}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="rounded-lg bg-[#6050F0] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ShiftSection({
  shiftGroup,
  navigate,
  deletingId,
  handleDelete,
  openEditModal,
  isMobile = false,
  onPreviousPage,
  onNextPage,
}) {
  if (isMobile) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              {shiftGroup.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {shiftGroup.totalItems} applicant(s)
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
            {shiftGroup.totalItems}
          </span>
        </div>

        <div className="grid gap-3 p-3">
          {shiftGroup.pagedApplications.map((application) => (
            <MobileApplicantCard
              key={application.id}
              application={application}
              deletingId={deletingId}
              onView={() => navigate(`/dashboard/applications/${application.id}`)}
              onEdit={() => openEditModal(application)}
              onDelete={() => handleDelete(application.id)}
            />
          ))}
        </div>

        {shiftGroup.totalPages > 1 ? (
          <PaginationControls
            currentPage={shiftGroup.currentPage}
            totalPages={shiftGroup.totalPages}
            onPrevious={() => onPreviousPage(shiftGroup.id)}
            onNext={() => onNextPage(shiftGroup.id)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <h3 className="text-sm font-black text-slate-900">{shiftGroup.title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Applicants enrolled in this shift
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
          {shiftGroup.totalItems} applicant(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-white">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Applicant
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {shiftGroup.pagedApplications.map((application) => (
              <tr
                key={application.id}
                onClick={() => navigate(`/dashboard/applications/${application.id}`)}
                className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <div className="truncate text-sm font-bold text-slate-900">
                    {getApplicantName(application)}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={application?.status} />
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/applications/${application.id}`);
                      }}
                      className="rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(application);
                      }}
                      className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"
                    >
                      Edit
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
                      {deletingId === application.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shiftGroup.totalPages > 1 ? (
        <PaginationControls
          currentPage={shiftGroup.currentPage}
          totalPages={shiftGroup.totalPages}
          onPrevious={() => onPreviousPage(shiftGroup.id)}
          onNext={() => onNextPage(shiftGroup.id)}
        />
      ) : null}
    </div>
  );
}

function EditApplicationModal({
  open,
  application,
  form,
  setForm,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  if (!open || !application) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-black text-slate-900">Update Application</h2>
          <p className="mt-1 text-sm text-slate-500">
            Change the application status directly from this page.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Applicant
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {getApplicantName(application)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {getProgramTitle(application)} • {getShiftTitle(application)}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
            >
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Waitlisted">Waitlisted</option>
            </select>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#6050F0] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ApplicationReceived() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeProgramId, setActiveProgramId] = useState("");
  const [shiftPages, setShiftPages] = useState({});
  const [editingApplication, setEditingApplication] = useState(null);
  const [editModalError, setEditModalError] = useState("");
  const [editForm, setEditForm] = useState({
    status: "Pending",
  });

  const fetchApplications = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setPageLoading(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccessMessage("");

      const token = getAuthToken();
      let currentPage = 1;
      let lastPage = 1;
      let backendTotal = 0;
      const collectedRows = [];

      do {
        const response = await fetch(
          buildApplicationsUrl(currentPage, API_FETCH_PAGE_SIZE),
          {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load applications.");
        }

        const pageRows = Array.isArray(result?.data?.data)
          ? result.data.data
          : Array.isArray(result?.data)
          ? result.data
          : [];

        collectedRows.push(...pageRows);

        if (result?.data && !Array.isArray(result.data)) {
          currentPage = Number(result.data.current_page || currentPage);
          lastPage = Number(result.data.last_page || 1);
          backendTotal = Number(result.data.total || 0);
        } else {
          lastPage = 1;
          backendTotal = pageRows.length;
        }

        currentPage += 1;
      } while (currentPage <= lastPage);

      const uniqueRows = uniqueApplicationsById(collectedRows);

      setApplications(uniqueRows);
      setTotalApplications(backendTotal || uniqueRows.length);
    } catch (err) {
      setError(err?.message || "Could not load applications.");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const groupedPrograms = useMemo(() => {
    const map = new Map();

    applications.forEach((application) => {
      const id = String(getProgramId(application));
      const title = getProgramTitle(application);
      const meta = getProgramMeta(application);
      const shiftId = String(getShiftId(application));

      if (!map.has(id)) {
        map.set(id, {
          id,
          title,
          meta,
          applications: [],
          total: 0,
          pending: 0,
          accepted: 0,
          rejected: 0,
          reviewed: 0,
          waitlisted: 0,
          shifts: new Set(),
        });
      }

      const group = map.get(id);
      group.applications.push(application);
      group.total += 1;
      group.shifts.add(shiftId);

      const status = normalizeText(application?.status).toLowerCase();
      if (status === "pending") group.pending += 1;
      if (status === "accepted") group.accepted += 1;
      if (status === "rejected") group.rejected += 1;
      if (status === "reviewed") group.reviewed += 1;
      if (status === "waitlisted") group.waitlisted += 1;
    });

    return Array.from(map.values())
      .map((program) => ({
        ...program,
        shiftCount: program.shifts.size,
      }))
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return a.title.localeCompare(b.title);
      });
  }, [applications]);

  useEffect(() => {
    if (!groupedPrograms.length) {
      setActiveProgramId("");
      return;
    }

    const exists = groupedPrograms.some(
      (program) => String(program.id) === String(activeProgramId)
    );

    if (!exists) {
      setActiveProgramId(String(groupedPrograms[0].id));
    }
  }, [groupedPrograms, activeProgramId]);

  const selectedProgram = useMemo(() => {
    return (
      groupedPrograms.find(
        (program) => String(program.id) === String(activeProgramId)
      ) || null
    );
  }, [groupedPrograms, activeProgramId]);

  useEffect(() => {
    setShiftPages({});
  }, [activeProgramId, search, statusFilter]);

  const filteredSelectedApplications = useMemo(() => {
    const rows = selectedProgram?.applications || [];

    return rows.filter(
      (application) =>
        matchesSearch(application, search) &&
        matchesStatus(application, statusFilter)
    );
  }, [selectedProgram, search, statusFilter]);

  const shiftGroups = useMemo(() => {
    const map = new Map();

    filteredSelectedApplications.forEach((application) => {
      const id = String(getShiftId(application));
      const title = getShiftTitle(application);

      if (!map.has(id)) {
        map.set(id, {
          id,
          title,
          applications: [],
        });
      }

      map.get(id).applications.push(application);
    });

    return Array.from(map.values())
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((group) => {
        const totalItems = group.applications.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
        const requestedPage = Number(shiftPages[group.id] || 1);
        const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
        const start = (currentPage - 1) * PAGE_SIZE;
        const pagedApplications = group.applications.slice(
          start,
          start + PAGE_SIZE
        );

        return {
          ...group,
          totalItems,
          totalPages,
          currentPage,
          pagedApplications,
        };
      });
  }, [filteredSelectedApplications, shiftPages]);

  const overallStats = useMemo(() => {
    const pending = applications.filter(
      (item) => normalizeText(item.status).toLowerCase() === "pending"
    ).length;
    const accepted = applications.filter(
      (item) => normalizeText(item.status).toLowerCase() === "accepted"
    ).length;
    const rejected = applications.filter(
      (item) => normalizeText(item.status).toLowerCase() === "rejected"
    ).length;

    return {
      total: totalApplications || applications.length,
      loaded: applications.length,
      pending,
      accepted,
      rejected,
      programs: groupedPrograms.length,
    };
  }, [applications, groupedPrograms, totalApplications]);

  function openEditModal(application) {
    setEditingApplication(application);
    setEditForm({
      status: normalizeText(application?.status) || "Pending",
    });
    setEditModalError("");
    setError("");
    setSuccessMessage("");
  }

  function closeEditModal() {
    setEditingApplication(null);
    setEditForm({ status: "Pending" });
    setEditModalError("");
  }

  async function handleUpdateApplication(e) {
    e.preventDefault();

    if (!editingApplication?.id) return;

    try {
      setEditSaving(true);
      setEditModalError("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/applications/${editingApplication.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            status: editForm.status,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to update application.");
      }

      const updatedRow =
        result?.data && !Array.isArray(result.data) ? result.data : null;

      setApplications((prev) =>
        prev.map((item) =>
          String(item.id) === String(editingApplication.id)
            ? updatedRow
              ? { ...item, ...updatedRow }
              : { ...item, status: editForm.status }
            : item
        )
      );

      setSuccessMessage("Application updated successfully.");
      closeEditModal();
    } catch (err) {
      setEditModalError(err?.message || "Could not update application.");
    } finally {
      setEditSaving(false);
    }
  }

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
      setTotalApplications((prev) => Math.max(0, Number(prev || 0) - 1));
      setSuccessMessage("Application deleted successfully.");
    } catch (err) {
      setError(err?.message || "Could not delete application.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleApplyFilters() {
    setSearch(searchInput);
  }

  function handleResetFilters() {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setShiftPages({});
  }

  function handlePreviousShiftPage(shiftId) {
    setShiftPages((prev) => ({
      ...prev,
      [shiftId]: Math.max(1, Number(prev[shiftId] || 1) - 1),
    }));
  }

  function handleNextShiftPage(shiftId) {
    const group = shiftGroups.find((item) => String(item.id) === String(shiftId));
    const maxPage = group?.totalPages || 1;

    setShiftPages((prev) => ({
      ...prev,
      [shiftId]: Math.min(maxPage, Number(prev[shiftId] || 1) + 1),
    }));
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
              Applications by Program & Shift
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Click a program on the left, then applicants are split into the
              existing shifts. Each shift shows 5 applicants per page.
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

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Applications"
            value={overallStats.total}
            hint={`Loaded ${overallStats.loaded} record(s)`}
          />
          <StatCard
            label="Programs"
            value={overallStats.programs}
            hint="Programs with applicants"
          />
          <StatCard
            label="Pending"
            value={overallStats.pending}
            hint="Awaiting review"
          />
          <StatCard
            label="Accepted"
            value={overallStats.accepted}
            hint="Approved applicants"
          />
          <StatCard
            label="Selected Program"
            value={selectedProgram?.total || 0}
            hint={selectedProgram?.title || "No program selected"}
          />
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Search applicant in selected program
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by applicant name, email, phone or shift..."
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
              onClick={handleApplyFilters}
              className="rounded-full bg-[#6050F0] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#7A6CF5] sm:text-sm"
            >
              Filter
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
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

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading applications...
          </div>
        ) : groupedPrograms.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No applications found.
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Programs
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Select a program to view its applicants
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                  {groupedPrograms.length}
                </span>
              </div>

              <div className="space-y-3">
                {groupedPrograms.map((program) => (
                  <ProgramSummaryCard
                    key={program.id}
                    program={program}
                    active={String(program.id) === String(activeProgramId)}
                    onClick={() => setActiveProgramId(String(program.id))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900 sm:text-lg">
                      {selectedProgram?.title || "Program Applicants"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {selectedProgram?.meta || "Selected program"} •{" "}
                      {shiftGroups.length} shift section(s)
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                      {selectedProgram?.total || 0} total in program
                    </span>
                    <span className="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
                      {filteredSelectedApplications.length} shown
                    </span>
                  </div>
                </div>
              </div>

              {shiftGroups.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                  No applicants found for this program with the current filter.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:hidden">
                    {shiftGroups.map((shiftGroup) => (
                      <ShiftSection
                        key={shiftGroup.id}
                        shiftGroup={shiftGroup}
                        navigate={navigate}
                        deletingId={deletingId}
                        handleDelete={handleDelete}
                        openEditModal={openEditModal}
                        isMobile
                        onPreviousPage={handlePreviousShiftPage}
                        onNextPage={handleNextShiftPage}
                      />
                    ))}
                  </div>

                  <div className="hidden gap-4 md:grid">
                    {shiftGroups.map((shiftGroup) => (
                      <ShiftSection
                        key={shiftGroup.id}
                        shiftGroup={shiftGroup}
                        navigate={navigate}
                        deletingId={deletingId}
                        handleDelete={handleDelete}
                        openEditModal={openEditModal}
                        onPreviousPage={handlePreviousShiftPage}
                        onNextPage={handleNextShiftPage}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <EditApplicationModal
        open={Boolean(editingApplication)}
        application={editingApplication}
        form={editForm}
        setForm={setEditForm}
        saving={editSaving}
        error={editModalError}
        onClose={closeEditModal}
        onSubmit={handleUpdateApplication}
      />
    </div>
  );
}