import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDateTimeLocal(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeOptionValues(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return String(
          item.value || item.label || item.name || item.title || ""
        ).trim();
      }
      return "";
    })
    .filter(Boolean);
}

function normalizeShiftOptions(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((shift, index) => {
      if (!shift || typeof shift !== "object") return null;

      return {
        id: String(shift.id || `shift_${index + 1}`),
        name: shift.name || "",
        start_time: shift.start_time || shift.startTime || "",
        end_time: shift.end_time || shift.endTime || "",
        capacity: Number(shift.capacity || shift.volume || 0),
        filled: Number(
          shift.filled || shift.enrolled || shift.current_students || 0
        ),
        available_slots:
          shift.available_slots !== undefined
            ? Number(shift.available_slots)
            : Math.max(
                Number(shift.capacity || shift.volume || 0) -
                  Number(shift.filled || shift.enrolled || shift.current_students || 0),
                0
              ),
        is_full: Boolean(
          shift.is_full ||
            shift.isFull ||
            (Number(shift.capacity || shift.volume || 0) > 0 &&
              Number(shift.filled || shift.enrolled || shift.current_students || 0) >=
                Number(shift.capacity || shift.volume || 0))
        ),
      };
    })
    .filter(Boolean);
}

function normalizeProgram(program) {
  if (!program || typeof program !== "object") return null;

  return {
    id: program.id,
    title: program.title || program.name || "Untitled Program",
    slug: program.slug || "",
    skills: normalizeOptionValues(program.skills || []),
    tools: normalizeOptionValues(program.tools || []),
    experience_levels: normalizeOptionValues(program.experience_levels || []),
    shifts: normalizeShiftOptions(program.shifts || []),
  };
}

function getApplicantFullName(application) {
  return `${application?.applicant?.first_name || ""} ${
    application?.applicant?.last_name || ""
  }`.trim();
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="max-w-[62%] break-words text-right text-xs font-semibold text-slate-900 whitespace-pre-wrap">
        {value || "-"}
      </span>
    </div>
  );
}

function MultiBadgeList({ title, items = [], badgeClassName = "" }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-900">{title}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {Array.isArray(items) && items.length ? (
          items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClassName}`}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-500">-</span>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-base font-black text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EditField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[#6050F0] text-white"
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function getPatchErrorMessage(result, fallback) {
  if (result?.errors && typeof result.errors === "object") {
    const values = Object.values(result.errors).flat();
    if (values.length) return values.join("\n");
  }

  return result?.message || fallback;
}

function ApplicationDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editError, setEditError] = useState("");

  const [form, setForm] = useState({
    auth_provider: "",
    program_id: "",
    shift_id: "",
    experience_level: "",
    selected_skills: [],
    selected_tools: [],

    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    date_of_birth: "",
    gender: "",

    education_level: "",
    school_name: "",
    field_of_study: "",

    agree_terms: true,
    agree_communication: true,

    status: "Pending",
    admin_note: "",
    submitted_at: "",
  });

  const forceEditMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("mode") === "edit";
  }, [location.search]);

  async function fetchPrograms() {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/programs`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result?.message || "Failed to load programs.");
    }

    const rows = Array.isArray(result?.data?.data)
      ? result.data.data
      : Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
      ? result
      : [];

    return rows.map(normalizeProgram).filter(Boolean);
  }

  function fillFormFromApplication(row) {
    setForm({
      auth_provider: row?.auth_provider || "",
      program_id: row?.program?.id ? String(row.program.id) : "",
      shift_id: row?.shift?.id ? String(row.shift.id) : "",
      experience_level: row?.experience_level || "",
      selected_skills: Array.isArray(row?.selected_skills) ? row.selected_skills : [],
      selected_tools: Array.isArray(row?.selected_tools) ? row.selected_tools : [],

      first_name: row?.applicant?.first_name || "",
      last_name: row?.applicant?.last_name || "",
      email: row?.applicant?.email || "",
      phone: row?.applicant?.phone || "",
      country: row?.applicant?.country || "",
      city: row?.applicant?.city || "",
      date_of_birth: row?.applicant?.date_of_birth || "",
      gender: row?.applicant?.gender || "",

      education_level: row?.background?.education_level || "",
      school_name: row?.background?.school_name || "",
      field_of_study: row?.background?.field_of_study || "",

      agree_terms: Boolean(row?.consents?.agree_terms),
      agree_communication: Boolean(row?.consents?.agree_communication),

      status: row?.status || "Pending",
      admin_note: row?.admin_note || "",
      submitted_at: toDateTimeLocal(row?.submitted_at),
    });
  }

  async function fetchApplicationAndPrograms() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const token = getAuthToken();

      const [applicationResponse, programsResult] = await Promise.all([
        fetch(`${API_BASE_URL.replace(/\/+$/, "")}/applications/${id}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }),
        fetchPrograms().catch(() => []),
      ]);

      const applicationResult = await applicationResponse.json().catch(() => ({}));

      if (!applicationResponse.ok) {
        throw new Error(applicationResult?.message || "Failed to load application.");
      }

      const row = applicationResult?.data || null;
      setApplication(row);
      setPrograms(programsResult);
      fillFormFromApplication(row);

      if (forceEditMode) {
        setEditMode(true);
      }
    } catch (err) {
      setError(err?.message || "Could not load application.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplicationAndPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, forceEditMode]);

  const currentProgram = useMemo(() => {
    const selected = programs.find(
      (program) => String(program?.id) === String(form.program_id)
    );

    if (selected) return selected;

    return normalizeProgram(application?.program);
  }, [programs, application, form.program_id]);

  useEffect(() => {
    if (!editMode || !currentProgram) return;

    setForm((prev) => {
      const allowedSkills = currentProgram.skills || [];
      const allowedTools = currentProgram.tools || [];
      const allowedExperience = currentProgram.experience_levels || [];
      const allowedShifts = currentProgram.shifts || [];

      const nextSkills = prev.selected_skills.filter((item) =>
        allowedSkills.includes(item)
      );
      const nextTools = prev.selected_tools.filter((item) =>
        allowedTools.includes(item)
      );
      const nextExperience = allowedExperience.includes(prev.experience_level)
        ? prev.experience_level
        : "";
      const shiftExists = allowedShifts.some(
        (shift) => String(shift.id) === String(prev.shift_id)
      );

      return {
        ...prev,
        selected_skills: nextSkills,
        selected_tools: nextTools,
        experience_level: nextExperience,
        shift_id: shiftExists ? prev.shift_id : "",
      };
    });
  }, [currentProgram, editMode]);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayValue(key, value) {
    setForm((prev) => {
      const exists = prev[key].includes(value);

      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      };
    });
  }

  async function patchApplication(payload, successText) {
    try {
      setStatusLoading(true);
      setError("");
      setSuccessMessage("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/applications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getPatchErrorMessage(result, "Update failed."));
      }

      const updatedRow = result?.data || null;
      setApplication(updatedRow);
      fillFormFromApplication(updatedRow);
      setSuccessMessage(successText);
      setEditMode(false);
      setEditError("");
    } catch (err) {
      setError(err?.message || "Could not update application.");
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleSaveUpdate(e) {
    e.preventDefault();

    try {
      setUpdateLoading(true);
      setEditError("");
      setError("");
      setSuccessMessage("");

      const token = getAuthToken();

      const payload = {
        auth_provider: form.auth_provider || null,
        program_id: form.program_id ? Number(form.program_id) : null,
        shift_id: form.shift_id || null,
        experience_level: form.experience_level || null,
        selected_skills: form.selected_skills,
        selected_tools: form.selected_tools,

        applicant: {
          first_name: form.first_name || null,
          last_name: form.last_name || null,
          email: form.email || null,
          phone: form.phone || null,
          country: form.country || null,
          city: form.city || null,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
        },

        background: {
          education_level: form.education_level || null,
          school_name: form.school_name || null,
          field_of_study: form.field_of_study || null,
        },

        consents: {
          agree_terms: Boolean(form.agree_terms),
          agree_communication: Boolean(form.agree_communication),
        },

        status: form.status,
        admin_note: form.admin_note || null,
        submitted_at: fromDateTimeLocal(form.submitted_at),
      };

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/applications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getPatchErrorMessage(result, "Update failed."));
      }

      const updatedRow = result?.data || null;
      setApplication(updatedRow);
      fillFormFromApplication(updatedRow);
      setSuccessMessage("Application updated successfully.");
      setEditMode(false);
    } catch (err) {
      setEditError(err?.message || "Could not update application.");
    } finally {
      setUpdateLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      setError("");
      setSuccessMessage("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/applications/${id}`,
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

      navigate("/dashboard/applications");
    } catch (err) {
      setError(err?.message || "Could not delete application.");
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleApprove() {
    patchApplication(
      {
        status: "Accepted",
        admin_note: form.admin_note || application?.admin_note || null,
      },
      "Application approved successfully."
    );
  }

  function handleReject() {
    patchApplication(
      {
        status: "Rejected",
        admin_note: form.admin_note || application?.admin_note || null,
      },
      "Application rejected successfully."
    );
  }

  function handleReviewed() {
    patchApplication(
      {
        status: "Reviewed",
        admin_note: form.admin_note || application?.admin_note || null,
      },
      "Application marked as reviewed."
    );
  }

  function handleWaitlist() {
    patchApplication(
      {
        status: "Waitlisted",
        admin_note: form.admin_note || application?.admin_note || null,
      },
      "Application moved to waitlist."
    );
  }

  function handleStartEdit() {
    setEditMode(true);
    setEditError("");
    fillFormFromApplication(application);
  }

  function handleCancelEdit() {
    setEditMode(false);
    setEditError("");
    fillFormFromApplication(application);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#6050F0]">
              Application Review
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              Application Details
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/applications")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              Back
            </button>

            {!editMode ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 sm:text-sm"
              >
                Edit / Update
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="rounded-full bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 whitespace-pre-line rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading application details...
          </div>
        ) : !application ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Application not found.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#6050F0]">
                    Applicant
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
                    {getApplicantFullName(application)}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Submitted on {formatDateTime(application?.submitted_at)}
                  </p>
                </div>

                <StatusBadge status={application?.status} />
              </div>

              {!editMode ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={handleApprove}
                    className="rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  >
                    {statusLoading ? "Processing..." : "Approve"}
                  </button>

                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={handleReject}
                    className="rounded-full bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  >
                    {statusLoading ? "Processing..." : "Reject"}
                  </button>

                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={handleReviewed}
                    className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  >
                    Reviewed
                  </button>

                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={handleWaitlist}
                    className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  >
                    Waitlist
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveUpdate} className="mt-5 space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-5 xl:grid-cols-2">
                    <SectionCard title="Program & status">
                      <div className="grid gap-4 md:grid-cols-2">
                        <EditField label="Program">
                          <select
                            value={form.program_id}
                            onChange={(e) => updateForm("program_id", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          >
                            <option value="">Select program</option>
                            {programs.map((program) => (
                              <option key={program.id} value={program.id}>
                                {program.title}
                              </option>
                            ))}
                          </select>
                        </EditField>

                        <EditField label="Shift">
                          <select
                            value={form.shift_id}
                            onChange={(e) => updateForm("shift_id", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          >
                            <option value="">No shift</option>
                            {(currentProgram?.shifts || []).map((shift) => (
                              <option key={shift.id} value={shift.id}>
                                {shift.name}
                                {shift.capacity
                                  ? ` (${shift.filled}/${shift.capacity})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </EditField>

                        <EditField label="Experience Level">
                          <select
                            value={form.experience_level}
                            onChange={(e) =>
                              updateForm("experience_level", e.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          >
                            <option value="">Select level</option>
                            {(currentProgram?.experience_levels || []).map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </EditField>

                        <EditField label="Status">
                          <select
                            value={form.status}
                            onChange={(e) => updateForm("status", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Waitlisted">Waitlisted</option>
                          </select>
                        </EditField>

                        <EditField label="Auth Provider">
                          <input
                            type="text"
                            value={form.auth_provider}
                            onChange={(e) =>
                              updateForm("auth_provider", e.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="Submitted At">
                          <input
                            type="datetime-local"
                            value={form.submitted_at}
                            onChange={(e) =>
                              updateForm("submitted_at", e.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>
                      </div>
                    </SectionCard>

                    <SectionCard title="Applicant details">
                      <div className="grid gap-4 md:grid-cols-2">
                        <EditField label="First Name">
                          <input
                            type="text"
                            value={form.first_name}
                            onChange={(e) => updateForm("first_name", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="Last Name">
                          <input
                            type="text"
                            value={form.last_name}
                            onChange={(e) => updateForm("last_name", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="Email">
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => updateForm("email", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="Phone">
                          <input
                            type="text"
                            value={form.phone}
                            onChange={(e) => updateForm("phone", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="Country">
                          <input
                            type="text"
                            value={form.country}
                            onChange={(e) => updateForm("country", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="City">
                          <input
                            type="text"
                            value={form.city}
                            onChange={(e) => updateForm("city", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="Date of Birth">
                          <input
                            type="date"
                            value={form.date_of_birth}
                            onChange={(e) =>
                              updateForm("date_of_birth", e.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="Gender">
                          <input
                            type="text"
                            value={form.gender}
                            onChange={(e) => updateForm("gender", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>
                      </div>
                    </SectionCard>

                    <SectionCard title="Academic background">
                      <div className="grid gap-4 md:grid-cols-2">
                        <EditField label="Education Level">
                          <input
                            type="text"
                            value={form.education_level}
                            onChange={(e) =>
                              updateForm("education_level", e.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <EditField label="School / Institution">
                          <input
                            type="text"
                            value={form.school_name}
                            onChange={(e) =>
                              updateForm("school_name", e.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                          />
                        </EditField>

                        <div className="md:col-span-2">
                          <EditField label="Field of Study">
                            <input
                              type="text"
                              value={form.field_of_study}
                              onChange={(e) =>
                                updateForm("field_of_study", e.target.value)
                              }
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#7A6CF5]"
                            />
                          </EditField>
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard title="Selections & admin note">
                      <div className="space-y-4">
                        <EditField label="Selected Skills">
                          <div className="flex flex-wrap gap-2">
                            {(currentProgram?.skills || []).length ? (
                              currentProgram.skills.map((skill) => (
                                <ToggleChip
                                  key={skill}
                                  active={form.selected_skills.includes(skill)}
                                  onClick={() =>
                                    toggleArrayValue("selected_skills", skill)
                                  }
                                >
                                  {skill}
                                </ToggleChip>
                              ))
                            ) : (
                              <span className="text-sm text-slate-500">
                                No skills available for this program.
                              </span>
                            )}
                          </div>
                        </EditField>

                        <EditField label="Selected Tools">
                          <div className="flex flex-wrap gap-2">
                            {(currentProgram?.tools || []).length ? (
                              currentProgram.tools.map((tool) => (
                                <ToggleChip
                                  key={tool}
                                  active={form.selected_tools.includes(tool)}
                                  onClick={() =>
                                    toggleArrayValue("selected_tools", tool)
                                  }
                                >
                                  {tool}
                                </ToggleChip>
                              ))
                            ) : (
                              <span className="text-sm text-slate-500">
                                No tools available for this program.
                              </span>
                            )}
                          </div>
                        </EditField>

                        <EditField label="Admin Note">
                          <textarea
                            value={form.admin_note}
                            onChange={(e) =>
                              updateForm("admin_note", e.target.value)
                            }
                            rows={5}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7A6CF5]"
                            placeholder="Write note for this application..."
                          />
                        </EditField>
                      </div>
                    </SectionCard>

                    <SectionCard title="Consents">
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.agree_terms}
                            onChange={(e) =>
                              updateForm("agree_terms", e.target.checked)
                            }
                          />
                          Agree Terms
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.agree_communication}
                            onChange={(e) =>
                              updateForm("agree_communication", e.target.checked)
                            }
                          />
                          Agree Communication
                        </label>
                      </div>
                    </SectionCard>
                  </div>

                  {editError ? (
                    <div className="whitespace-pre-line rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {editError}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="rounded-full bg-[#6050F0] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                    >
                      {updateLoading ? "Updating..." : "Save Full Update"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={updateLoading}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <SectionCard title="Applicant details">
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow
                      label="Full Name"
                      value={getApplicantFullName(application)}
                    />
                    <InfoRow label="Email" value={application?.applicant?.email} />
                    <InfoRow label="Phone" value={application?.applicant?.phone} />
                    <InfoRow label="Country" value={application?.applicant?.country} />
                    <InfoRow label="City" value={application?.applicant?.city} />
                    <InfoRow label="Gender" value={application?.applicant?.gender} />
                    <InfoRow
                      label="Date of Birth"
                      value={application?.applicant?.date_of_birth}
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Academic background">
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow
                      label="Education Level"
                      value={application?.background?.education_level}
                    />
                    <InfoRow
                      label="School / Institution"
                      value={application?.background?.school_name}
                    />
                    <InfoRow
                      label="Field of Study"
                      value={application?.background?.field_of_study}
                    />
                    <InfoRow
                      label="Experience Level"
                      value={application?.experience_level}
                    />
                  </div>
                </SectionCard>
              </div>

              <div className="space-y-5">
                <SectionCard title="Program selection">
                  <div className="grid gap-3">
                    <InfoRow
                      label="Program"
                      value={application?.program?.title || application?.program?.name}
                    />
                    <InfoRow label="Program Slug" value={application?.program?.slug} />
                    <InfoRow label="Shift" value={application?.shift?.name} />
                    <InfoRow label="Status" value={application?.status} />
                    <InfoRow label="Auth Provider" value={application?.auth_provider} />
                    <InfoRow label="Admin Note" value={application?.admin_note} />
                  </div>

                  <div className="mt-4 grid gap-4">
                    <MultiBadgeList
                      title="Selected Skills"
                      items={application?.selected_skills || []}
                      badgeClassName="bg-indigo-100 text-indigo-700"
                    />

                    <MultiBadgeList
                      title="Selected Tools"
                      items={application?.selected_tools || []}
                      badgeClassName="bg-emerald-100 text-emerald-700"
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Consent and timeline">
                  <div className="grid gap-3">
                    <InfoRow
                      label="Agree Terms"
                      value={application?.consents?.agree_terms ? "Yes" : "No"}
                    />
                    <InfoRow
                      label="Agree Communication"
                      value={
                        application?.consents?.agree_communication ? "Yes" : "No"
                      }
                    />
                    <InfoRow
                      label="Submitted At"
                      value={formatDateTime(application?.submitted_at)}
                    />
                    <InfoRow
                      label="Current Status"
                      value={application?.status}
                    />
                    <InfoRow
                      label="Updated At"
                      value={formatDateTime(application?.updated_at)}
                    />
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationDetails;