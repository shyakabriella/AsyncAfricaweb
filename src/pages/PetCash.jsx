import React, { useEffect, useMemo, useState } from "react";

function parseStoredUser(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function normalizeRole(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return normalizeRole(
      value?.slug || value?.name || value?.role || value?.title || ""
    );
  }

  const role = String(value).trim().toLowerCase();

  if (
    ["administrator", "admin", "super admin", "super_admin", "super-admin"].includes(role)
  ) {
    return "admin";
  }

  if (
    [
      "chief executive officer",
      "chief-executive-officer",
      "chief_executive_officer",
      "ceo",
    ].includes(role)
  ) {
    return "ceo";
  }

  if (["trainer", "trainers"].includes(role)) return "trainer";
  if (["student", "students"].includes(role)) return "student";
  if (["agent", "agents"].includes(role)) return "agent";

  if (
    [
      "school owner",
      "school-owner",
      "school_owner",
      "school owners",
      "schoolowners",
      "schoolowner",
    ].includes(role)
  ) {
    return "school_owner";
  }

  return role;
}

function getStoredUser() {
  const localUser = parseStoredUser(localStorage.getItem("user"));
  const sessionUser = parseStoredUser(sessionStorage.getItem("user"));
  const localAuthUser = parseStoredUser(localStorage.getItem("auth_user"));
  const sessionAuthUser = parseStoredUser(sessionStorage.getItem("auth_user"));

  if (localUser && Object.keys(localUser).length > 0) return localUser;
  if (sessionUser && Object.keys(sessionUser).length > 0) return sessionUser;
  if (localAuthUser && Object.keys(localAuthUser).length > 0) return localAuthUser;
  if (sessionAuthUser && Object.keys(sessionAuthUser).length > 0) return sessionAuthUser;

  return {};
}

function getStoredRole() {
  const localRole = normalizeRole(localStorage.getItem("role") || "");
  const sessionRole = normalizeRole(sessionStorage.getItem("role") || "");

  return sessionRole || localRole || "";
}

function getRoleFromUser(user) {
  if (!user) return "";

  const directCandidates = [user?.role?.slug, user?.role?.name, user?.role];

  for (const candidate of directCandidates) {
    const found = normalizeRole(candidate);
    if (found) return found;
  }

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  for (const item of roles) {
    const found = normalizeRole(item?.slug || item?.name || item);
    if (found) return found;
  }

  return "";
}

function getAuthToken() {
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

function normalizeApiBase() {
  const raw =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api";

  const cleaned = String(raw).replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

function buildHeaders(withJson = false) {
  const token = getAuthToken();

  return {
    Accept: "application/json",
    ...(withJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      success: false,
      message: text || "Unexpected server response.",
    };
  }
}

function extractErrorMessage(payload, fallback = "Something went wrong.") {
  if (!payload) return fallback;

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (payload.errors && typeof payload.errors === "object") {
    const firstKey = Object.keys(payload.errors)[0];
    if (firstKey && Array.isArray(payload.errors[firstKey]) && payload.errors[firstKey][0]) {
      return payload.errors[firstKey][0];
    }
  }

  return fallback;
}

function extractCollection(payload) {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value, currency = "RWF") {
  return `${new Intl.NumberFormat().format(toNumber(value))} ${currency}`;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
}

function statusClasses(status) {
  const value = normalizeStatus(status);

  if (value === "approved") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }

  if (value === "rejected") {
    return "bg-rose-100 text-rose-700 border border-rose-200";
  }

  return "bg-amber-100 text-amber-700 border border-amber-200";
}

function isArchivedProgram(program) {
  return normalizeStatus(program?.status) === "archived";
}

function createProgramLookup(programs) {
  const byId = new Map();
  const bySlug = new Map();
  const byTitle = new Map();

  programs.forEach((program) => {
    if (program?.id !== undefined && program?.id !== null) {
      byId.set(String(program.id), program);
    }

    if (program?.slug) {
      bySlug.set(String(program.slug).toLowerCase(), program);
    }

    const names = [program?.name, program?.title, program?.program_title];
    names.filter(Boolean).forEach((name) => {
      byTitle.set(normalizeText(name), program);
    });
  });

  return { byId, bySlug, byTitle };
}

function buildProgramFinancials(programs, applications) {
  const lookup = createProgramLookup(programs);
  const grouped = new Map();

  programs.forEach((program) => {
    if (isArchivedProgram(program)) return;

    grouped.set(String(program.id), {
      id: String(program.id),
      programId: program.id,
      name: program?.name || program?.title || "Program",
      title: program?.name || program?.title || "Program",
      category: program?.category || "",
      status: program?.status || "Active",
      price: toNumber(program?.price || 0),
      acceptedCount: 0,
      totalApplications: 0,
      pendingCount: 0,
      reviewedCount: 0,
      rejectedCount: 0,
      waitlistedCount: 0,
      applications: [],
    });
  });

  applications.forEach((item) => {
    const matchedProgram =
      lookup.byId.get(String(item?.program_id || item?.program?.id || "")) ||
      lookup.bySlug.get(
        normalizeText(item?.program_slug || item?.program?.slug || "")
      ) ||
      lookup.byTitle.get(
        normalizeText(
          item?.program_title ||
            item?.program?.title ||
            item?.program?.name ||
            ""
        )
      );

    if (!matchedProgram || isArchivedProgram(matchedProgram)) return;

    const key = String(matchedProgram.id);
    const group = grouped.get(key);
    if (!group) return;

    const status = normalizeStatus(item?.status);

    group.totalApplications += 1;
    group.applications.push(item);

    if (status === "accepted") group.acceptedCount += 1;
    if (status === "pending") group.pendingCount += 1;
    if (status === "reviewed") group.reviewedCount += 1;
    if (status === "rejected") group.rejectedCount += 1;
    if (status === "waitlisted") group.waitlistedCount += 1;
  });

  return Array.from(grouped.values()).map((group) => {
    const totalEarned = toNumber(group.acceptedCount) * toNumber(group.price);

    return {
      ...group,
      feePerStudent: toNumber(group.price),
      currentBalance: totalEarned,
      totalEarned,
    };
  });
}

function findProgramFinancial(requestItem, programFinancials) {
  return (
    programFinancials.find(
      (program) =>
        String(program.programId) ===
        String(requestItem?.program_id || requestItem?.program?.id || "")
    ) ||
    programFinancials.find(
      (program) =>
        normalizeText(program.name) ===
        normalizeText(
          requestItem?.program?.name ||
            requestItem?.program?.title ||
            requestItem?.program_title ||
            ""
        )
    ) ||
    null
  );
}

function SmallStat({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-900">
        {String(value || "-")}
      </div>
    </div>
  );
}

export default function PetCash() {
  const API_BASE = normalizeApiBase();

  const storedUser = getStoredUser();
  const role = normalizeRole(getStoredRole() || getRoleFromUser(storedUser));
  const canManage = role === "admin" || role === "ceo";
  const currentUserId = storedUser?.id;

  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    mine: false,
  });

  const [form, setForm] = useState({
    program_id: "",
    title: "",
    purpose: "",
    description: "",
    amount: "",
    currency: "RWF",
  });

  useEffect(() => {
    if (!canManage) return;
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  async function loadPage() {
    setLoading(true);
    setLoadingPrograms(true);
    setError("");
    setNotice("");

    try {
      const [programsRes, applicationsRes, requestsRes] = await Promise.all([
        apiGet(`${API_BASE}/programs`),
        apiGet(`${API_BASE}/applications?per_page=100`),
        apiGet(`${API_BASE}/pet-cash-requests`),
      ]);

      const loadedPrograms = extractCollection(programsRes).filter(
        (item) => !isArchivedProgram(item)
      );

      setPrograms(loadedPrograms);
      setApplications(extractCollection(applicationsRes));
      setRequests(extractCollection(requestsRes));
    } catch (err) {
      setError(err?.message || "Failed to load pet cash data.");
      setPrograms([]);
      setApplications([]);
      setRequests([]);
    } finally {
      setLoading(false);
      setLoadingPrograms(false);
    }
  }

  const programFinancials = useMemo(() => {
    return buildProgramFinancials(programs, applications).sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""))
    );
  }, [programs, applications]);

  const selectedProgram = useMemo(() => {
    return (
      programFinancials.find(
        (item) => String(item.programId) === String(form.program_id)
      ) || null
    );
  }, [programFinancials, form.program_id]);

  const topSummary = useMemo(() => {
    return {
      totalPrograms: programFinancials.length,
      totalAccepted: programFinancials.reduce(
        (sum, item) => sum + toNumber(item.acceptedCount),
        0
      ),
      totalApplications: programFinancials.reduce(
        (sum, item) => sum + toNumber(item.totalApplications),
        0
      ),
      totalBalance: programFinancials.reduce(
        (sum, item) => sum + toNumber(item.currentBalance),
        0
      ),
    };
  }, [programFinancials]);

  const requestSummary = useMemo(() => {
    return {
      totalRequests: requests.length,
      pending: requests.filter(
        (item) => normalizeStatus(item?.status) === "pending"
      ).length,
      approved: requests.filter(
        (item) => normalizeStatus(item?.status) === "approved"
      ).length,
      rejected: requests.filter(
        (item) => normalizeStatus(item?.status) === "rejected"
      ).length,
      totalApprovedAmount: requests
        .filter((item) => normalizeStatus(item?.status) === "approved")
        .reduce((sum, item) => sum + toNumber(item?.amount), 0),
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const search = normalizeText(filters.search);
    const wantedStatus = normalizeStatus(filters.status);

    return requests.filter((item) => {
      const rowText = normalizeText(
        [
          item?.title,
          item?.purpose,
          item?.description,
          item?.program?.name,
          item?.program_title,
          item?.requested_by?.name,
          item?.code,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const matchesSearch = !search || rowText.includes(search);
      const matchesStatus =
        !wantedStatus || normalizeStatus(item?.status) === wantedStatus;
      const matchesMine =
        !filters.mine ||
        String(item?.requested_by?.id || "") === String(currentUserId || "");

      return matchesSearch && matchesStatus && matchesMine;
    });
  }, [requests, filters, currentUserId]);

  function resetForm() {
    setForm({
      program_id: "",
      title: "",
      purpose: "",
      description: "",
      amount: "",
      currency: "RWF",
    });
  }

  async function handleCreateRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (!form.program_id) {
        throw new Error("Please select a program.");
      }

      if (!form.title.trim()) {
        throw new Error("Title is required.");
      }

      if (!form.purpose.trim()) {
        throw new Error("Purpose is required.");
      }

      if (!form.amount || toNumber(form.amount) <= 0) {
        throw new Error("Amount must be greater than 0.");
      }

      const response = await fetch(`${API_BASE}/pet-cash-requests`, {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify({
          program_id: Number(form.program_id),
          title: form.title.trim(),
          purpose: form.purpose.trim(),
          description: form.description.trim(),
          amount: toNumber(form.amount),
          currency: form.currency || "RWF",
        }),
      });

      const payload = await readJson(response);

      if (!response.ok || payload.success === false) {
        throw new Error(
          extractErrorMessage(payload, "Failed to create pet cash request.")
        );
      }

      setNotice(payload?.message || "Pet cash request created successfully.");
      resetForm();
      await loadPage();
    } catch (err) {
      setError(err?.message || "Failed to create pet cash request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(item) {
    const approvalNote = window.prompt(
      `Approve request "${item?.title || ""}"?\n\nOptional approval note:`,
      ""
    );

    if (approvalNote === null) return;

    setActionId(item.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/pet-cash-requests/${item.id}/approve`,
        {
          method: "POST",
          headers: buildHeaders(true),
          body: JSON.stringify({
            approval_note: approvalNote,
          }),
        }
      );

      const payload = await readJson(response);

      if (!response.ok || payload.success === false) {
        throw new Error(
          extractErrorMessage(payload, "Failed to approve pet cash request.")
        );
      }

      setNotice(payload?.message || "Pet cash request approved successfully.");
      await loadPage();
    } catch (err) {
      setError(err?.message || "Failed to approve pet cash request.");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(item) {
    const rejectionReason = window.prompt(
      `Reject request "${item?.title || ""}"?\n\nEnter rejection reason:`,
      ""
    );

    if (rejectionReason === null) return;

    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    setActionId(item.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/pet-cash-requests/${item.id}/reject`,
        {
          method: "POST",
          headers: buildHeaders(true),
          body: JSON.stringify({
            rejection_reason: rejectionReason.trim(),
          }),
        }
      );

      const payload = await readJson(response);

      if (!response.ok || payload.success === false) {
        throw new Error(
          extractErrorMessage(payload, "Failed to reject pet cash request.")
        );
      }

      setNotice(payload?.message || "Pet cash request rejected successfully.");
      await loadPage();
    } catch (err) {
      setError(err?.message || "Failed to reject pet cash request.");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete pet cash request "${item?.title || ""}"?`
    );

    if (!confirmed) return;

    setActionId(item.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_BASE}/pet-cash-requests/${item.id}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });

      const payload = await readJson(response);

      if (!response.ok || payload.success === false) {
        throw new Error(
          extractErrorMessage(payload, "Failed to delete pet cash request.")
        );
      }

      setNotice(payload?.message || "Pet cash request deleted successfully.");
      await loadPage();
    } catch (err) {
      setError(err?.message || "Failed to delete pet cash request.");
    } finally {
      setActionId(null);
    }
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-5xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="text-2xl font-extrabold text-slate-900">
            Access denied
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Only admin or CEO can manage pet cash requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                Pet Cash Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-white/85">
                Program balance here now follows the same logic as Report:
                accepted students × program fee.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPage}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              Refresh List
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {notice}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SmallStat
            title="Programs"
            value={topSummary.totalPrograms}
            hint="Non-archived programs"
          />
          <SmallStat
            title="Accepted Students"
            value={topSummary.totalAccepted}
            hint="Counted from applications"
          />
          <SmallStat
            title="Applications"
            value={topSummary.totalApplications}
            hint="Loaded application records"
          />
          <SmallStat
            title="Total Balance"
            value={formatMoney(topSummary.totalBalance)}
            hint="Accepted × fee"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SmallStat
            title="Total Requests"
            value={requestSummary.totalRequests}
            hint="All pet cash requests"
          />
          <SmallStat
            title="Pending"
            value={requestSummary.pending}
            hint="Waiting for decision"
          />
          <SmallStat
            title="Approved"
            value={requestSummary.approved}
            hint="Approved requests"
          />
          <SmallStat
            title="Approved Amount"
            value={formatMoney(requestSummary.totalApprovedAmount)}
            hint="Total approved money"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-slate-900">
                New Pet Cash Request
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create a request linked to a program.
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Program
                </label>
                <select
                  value={form.program_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, program_id: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  disabled={loadingPrograms || submitting}
                >
                  <option value="">
                    {loadingPrograms
                      ? "Loading programs..."
                      : programFinancials.length
                      ? "Select program"
                      : "No available program"}
                  </option>

                  {programFinancials.map((program) => (
                    <option key={program.programId} value={program.programId}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProgram ? (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">
                    Selected Program Balance
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">Program</span>
                      <span>{selectedProgram.name || "-"}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">Fee per student</span>
                      <span>{formatMoney(selectedProgram.price || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">Accepted students</span>
                      <span>{selectedProgram.acceptedCount || 0}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">Current balance</span>
                      <span className="font-extrabold text-indigo-700">
                        {formatMoney(selectedProgram.totalEarned || 0)}
                      </span>
                    </div>

                    <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600">
                      Formula: {selectedProgram.acceptedCount || 0} ×{" "}
                      {formatMoney(selectedProgram.price || 0)} ={" "}
                      <span className="font-bold text-slate-800">
                        {formatMoney(selectedProgram.totalEarned || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Example: Class materials purchase"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Purpose
                </label>
                <textarea
                  rows={3}
                  value={form.purpose}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, purpose: e.target.value }))
                  }
                  placeholder="Why this money is needed"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Extra note or details"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, currency: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Create Request"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Filter Requests
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search and narrow the list.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_180px_auto_auto]">
                <input
                  type="text"
                  placeholder="Search by title, code, purpose..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <label className="flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={filters.mine}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, mine: e.target.checked }))
                    }
                  />
                  Mine only
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      search: "",
                      status: "",
                      mine: false,
                    })
                  }
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Pet Cash Requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and manage all requests.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="p-6 text-sm font-medium text-slate-500">
                  Loading requests...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-6 text-sm font-medium text-slate-500">
                  No pet cash requests found.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredRequests.map((item) => {
                    const isPending =
                      normalizeStatus(item?.status) === "pending";
                    const busy = actionId === item.id;
                    const programData = findProgramFinancial(item, programFinancials);

                    const feePerStudent = toNumber(programData?.price || 0);
                    const acceptedStudents = toNumber(programData?.acceptedCount || 0);
                    const programBalance = toNumber(programData?.totalEarned || 0);
                    const balanceAfter =
                      programBalance - toNumber(item?.amount || 0);

                    return (
                      <div key={item.id} className="p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-extrabold text-slate-900">
                                {item?.title || "Untitled request"}
                              </h3>
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                                  item?.status
                                )}`}
                              >
                                {String(item?.status || "pending").toUpperCase()}
                              </span>
                              {item?.code ? (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  {item.code}
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                              <div>
                                <span className="font-bold text-slate-800">Program:</span>{" "}
                                {item?.program?.name || programData?.name || "-"}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800">Amount:</span>{" "}
                                {formatMoney(item?.amount || 0, item?.currency || "RWF")}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800">Requested by:</span>{" "}
                                {item?.requested_by?.name || "-"}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800">Requested at:</span>{" "}
                                {formatDateTime(item?.requested_at || item?.created_at)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800">Fee per student:</span>{" "}
                                {formatMoney(feePerStudent, item?.currency || "RWF")}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800">Accepted students:</span>{" "}
                                {acceptedStudents}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800">Program balance:</span>{" "}
                                {formatMoney(programBalance, item?.currency || "RWF")}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800">Balance after:</span>{" "}
                                {formatMoney(balanceAfter, item?.currency || "RWF")}
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                                  Purpose
                                </div>
                                <div className="mt-2 text-sm leading-6 text-slate-700">
                                  {item?.purpose || "-"}
                                </div>
                              </div>

                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                                  Extra Details
                                </div>
                                <div className="mt-2 text-sm leading-6 text-slate-700">
                                  {item?.description || "-"}
                                </div>
                              </div>
                            </div>

                            {(item?.approval_note ||
                              item?.rejection_reason ||
                              item?.approved_by?.name ||
                              item?.rejected_by?.name) && (
                              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                                  Decision Details
                                </div>

                                <div className="mt-2 space-y-2 text-sm text-slate-700">
                                  {item?.approved_by?.name ? (
                                    <div>
                                      <span className="font-bold text-slate-800">
                                        Approved by:
                                      </span>{" "}
                                      {item.approved_by.name}{" "}
                                      {item?.approved_at
                                        ? `(${formatDateTime(item.approved_at)})`
                                        : ""}
                                    </div>
                                  ) : null}

                                  {item?.rejected_by?.name ? (
                                    <div>
                                      <span className="font-bold text-slate-800">
                                        Rejected by:
                                      </span>{" "}
                                      {item.rejected_by.name}{" "}
                                      {item?.rejected_at
                                        ? `(${formatDateTime(item.rejected_at)})`
                                        : ""}
                                    </div>
                                  ) : null}

                                  {item?.approval_note ? (
                                    <div>
                                      <span className="font-bold text-slate-800">
                                        Approval note:
                                      </span>{" "}
                                      {item.approval_note}
                                    </div>
                                  ) : null}

                                  {item?.rejection_reason ? (
                                    <div>
                                      <span className="font-bold text-slate-800">
                                        Rejection reason:
                                      </span>{" "}
                                      {item.rejection_reason}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex w-full shrink-0 flex-wrap gap-3 xl:w-auto xl:max-w-[260px] xl:flex-col">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(item)}
                                  disabled={busy}
                                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {busy ? "Working..." : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleReject(item)}
                                  disabled={busy}
                                  className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {busy ? "Working..." : "Reject"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(item)}
                                  disabled={busy}
                                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                                No more action available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function apiGet(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
  });

  const payload = await readJson(response);

  if (!response.ok || payload.success === false) {
    throw new Error(extractErrorMessage(payload, "Request failed."));
  }

  return payload;
}