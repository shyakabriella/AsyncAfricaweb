import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
      <span className="max-w-[62%] break-words text-right text-xs font-semibold text-slate-900">
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

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function fetchApplication() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/applications/${id}`,
        {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load application.");
      }

      setApplication(result?.data || null);
    } catch (err) {
      setError(err?.message || "Could not load application.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
        if (result?.errors) {
          const messages = Object.values(result.errors).flat().join("\n");
          throw new Error(messages || result?.message || "Update failed.");
        }
        throw new Error(result?.message || "Update failed.");
      }

      setApplication(result?.data || null);
      setSuccessMessage(successText);
    } catch (err) {
      setError(err?.message || "Could not update application.");
    } finally {
      setStatusLoading(false);
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
      },
      "Application approved successfully."
    );
  }

  function handleReject() {
    patchApplication(
      {
        status: "Rejected",
      },
      "Application rejected successfully."
    );
  }

  function handleReviewed() {
    patchApplication(
      {
        status: "Reviewed",
      },
      "Application marked as reviewed."
    );
  }

  function handleWaitlist() {
    patchApplication(
      {
        status: "Waitlisted",
      },
      "Application moved to waitlist."
    );
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
                    {application?.applicant?.first_name}{" "}
                    {application?.applicant?.last_name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Submitted on {formatDateTime(application?.submitted_at)}
                  </p>
                </div>

                <StatusBadge status={application?.status} />
              </div>

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
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <SectionCard title="Applicant details">
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow
                      label="Full Name"
                      value={`${application?.applicant?.first_name || ""} ${
                        application?.applicant?.last_name || ""
                      }`.trim()}
                    />
                    <InfoRow
                      label="Email"
                      value={application?.applicant?.email}
                    />
                    <InfoRow
                      label="Phone"
                      value={application?.applicant?.phone}
                    />
                    <InfoRow
                      label="Country"
                      value={application?.applicant?.country}
                    />
                    <InfoRow label="City" value={application?.applicant?.city} />
                    <InfoRow
                      label="Gender"
                      value={application?.applicant?.gender}
                    />
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
                      value={application?.program?.title}
                    />
                    <InfoRow
                      label="Program Slug"
                      value={application?.program?.slug}
                    />
                    <InfoRow label="Shift" value={application?.shift?.name} />
                    <InfoRow label="Status" value={application?.status} />
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