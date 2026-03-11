import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    ""
  );
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function AttendanceBadge({ value }) {
  const current = String(value || "Not Marked").toLowerCase();

  const styles =
    current === "present"
      ? "bg-emerald-100 text-emerald-700"
      : current === "absent"
      ? "bg-rose-100 text-rose-700"
      : current === "late"
      ? "bg-amber-100 text-amber-700"
      : current === "excused"
      ? "bg-sky-100 text-sky-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}
    >
      {value || "Not Marked"}
    </span>
  );
}

function getInternFullName(item) {
  const applicantFirstName = item?.applicant?.first_name || "";
  const applicantLastName = item?.applicant?.last_name || "";
  const applicantName = `${applicantFirstName} ${applicantLastName}`.trim();

  if (applicantName) return applicantName;
  if (item?.applicant?.full_name) return item.applicant.full_name;
  if (item?.full_name) return item.full_name;
  if (item?.name) return item.name;

  return "Unnamed Intern";
}

function getInternShift(item) {
  return (
    item?.shift?.name ||
    item?.assigned_shift?.name ||
    item?.preferred_shift?.name ||
    item?.shiftName ||
    item?.shift_name ||
    item?.shift ||
    item?.assigned_shift ||
    item?.preferred_shift ||
    "Unassigned Shift"
  );
}

function getShiftRef(item) {
  return (
    item?.shift?.id ||
    item?.shift?.slug ||
    item?.shift?.code ||
    item?.shift_ref ||
    item?.shift_id ||
    item?.assigned_shift?.id ||
    item?.preferred_shift?.id ||
    getInternShift(item)
  );
}

function getProgramApplicationId(item) {
  return item?.id || item?.application_id || null;
}

function getAttendanceValue(item) {
  if (Array.isArray(item?.attendances) && item.attendances.length > 0) {
    return item.attendances[0]?.status || "Not Marked";
  }

  return (
    item?.attendance_status ||
    item?.attendance?.status ||
    item?.status_attendance ||
    "Not Marked"
  );
}

function isRealInternRecord(item) {
  const fullName = getInternFullName(item);
  const shiftName = getInternShift(item);

  const hasApplicant =
    !!item?.applicant?.first_name ||
    !!item?.applicant?.last_name ||
    !!item?.applicant?.email ||
    !!item?.applicant?.phone;

  const hasApplicationIdentity =
    !!item?.id || !!item?.application_id || !!item?.student_id || !!item?.applicant_id;

  const hasOwnName =
    fullName &&
    fullName !== "Unnamed Intern" &&
    fullName.trim().toLowerCase() !== String(shiftName || "").trim().toLowerCase();

  return hasApplicant || hasApplicationIdentity || hasOwnName;
}

function makeRowKey(item, index) {
  const applicationId = getProgramApplicationId(item) || `row-${index}`;
  const shiftRef = String(getShiftRef(item) || "no-shift");
  return `${applicationId}__${shiftRef}`;
}

export default function ProgramInternsCard({
  program,
  interns,
  loading,
  onAttendanceChange,
}) {
  const [attendanceDate, setAttendanceDate] = useState(getTodayDate());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [savingMap, setSavingMap] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const realInterns = useMemo(() => {
    return Array.isArray(interns) ? interns.filter(isRealInternRecord) : [];
  }, [interns]);

  useEffect(() => {
    const nextMap = {};

    realInterns.forEach((item, index) => {
      const rowKey = makeRowKey(item, index);
      nextMap[rowKey] = getAttendanceValue(item);
    });

    setAttendanceMap(nextMap);
  }, [realInterns]);

  useEffect(() => {
    async function fetchSavedAttendance() {
      if (!program?.id) return;

      try {
        setLoadingAttendance(true);
        setError("");

        const token = getAuthToken();

        const query = new URLSearchParams({
          program_id: String(program.id),
          attendance_date: attendanceDate,
        });

        const response = await fetch(
          `${API_BASE_URL.replace(/\/+$/, "")}/attendances?${query.toString()}`,
          {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load attendance.");
        }

        const rows = Array.isArray(result?.data) ? result.data : [];

        setAttendanceMap((prev) => {
          const next = { ...prev };

          rows.forEach((attendance) => {
            const applicationId = String(attendance?.program_application_id || "");
            const shiftRef = String(attendance?.shift_ref || "no-shift");
            const rowKey = `${applicationId}__${shiftRef}`;
            next[rowKey] = attendance?.status || "Not Marked";
          });

          return next;
        });
      } catch (err) {
        setError(err?.message || "Could not load saved attendance.");
      } finally {
        setLoadingAttendance(false);
      }
    }

    fetchSavedAttendance();
  }, [program?.id, attendanceDate]);

  const groupedInterns = useMemo(() => {
    const groups = {};

    realInterns.forEach((item, index) => {
      const shiftName = getInternShift(item);
      const key = shiftName || "Unassigned Shift";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push({
        ...item,
        _rowKey: makeRowKey(item, index),
      });
    });

    return Object.entries(groups);
  }, [realInterns]);

  async function handleAttendanceUpdate(rowKey, value, item) {
    const applicationId = getProgramApplicationId(item);

    if (!applicationId) {
      setError("Missing application id for this intern.");
      return;
    }

    const payload = {
      program_application_id: applicationId,
      program_id: program?.id || item?.program_id || item?.program?.id || null,
      shift_ref: String(getShiftRef(item) || ""),
      shift_name: String(getInternShift(item) || ""),
      attendance_date: attendanceDate,
      status: value,
      note: null,
    };

    const previousValue = attendanceMap[rowKey] || "Not Marked";

    setAttendanceMap((prev) => ({
      ...prev,
      [rowKey]: value,
    }));

    setSavingMap((prev) => ({
      ...prev,
      [rowKey]: true,
    }));

    setError("");
    setSuccessMessage("");

    try {
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/attendances`,
        {
          method: "POST",
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
          throw new Error(messages || result?.message || "Failed to save attendance.");
        }

        throw new Error(result?.message || "Failed to save attendance.");
      }

      const savedStatus = result?.data?.status || value;

      setAttendanceMap((prev) => ({
        ...prev,
        [rowKey]: savedStatus,
      }));

      setSuccessMessage("Attendance saved successfully.");

      if (typeof onAttendanceChange === "function") {
        onAttendanceChange({
          intern: item,
          attendance: savedStatus,
          attendanceDate,
          response: result?.data || null,
        });
      }
    } catch (err) {
      setAttendanceMap((prev) => ({
        ...prev,
        [rowKey]: previousValue,
      }));
      setError(err?.message || "Could not save attendance.");
    } finally {
      setSavingMap((prev) => ({
        ...prev,
        [rowKey]: false,
      }));
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900">
            Enrolled Interns
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {program
              ? `Attendance list for ${program.name || program.title}`
              : "Select a program first"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400"
          />

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {realInterns.length} intern(s)
          </span>
        </div>
      </div>

      {successMessage ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 whitespace-pre-line rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!program ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          Please select a program.
        </div>
      ) : loading ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          Loading interns...
        </div>
      ) : loadingAttendance ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          Loading attendance...
        </div>
      ) : realInterns.length === 0 ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No enrolled interns found for this program.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {groupedInterns.map(([shiftName, shiftInterns]) => (
            <div
              key={shiftName}
              className="overflow-hidden rounded-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    {shiftName}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {shiftInterns.length} intern(s) in this shift
                  </p>
                </div>
              </div>

              <div className="hidden grid-cols-[1.3fr_1fr] bg-white px-4 py-3 md:grid">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Intern Name
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Attendance
                </div>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {shiftInterns.map((item) => {
                  const fullName = getInternFullName(item);
                  const currentAttendance =
                    attendanceMap[item._rowKey] || "Not Marked";
                  const isSaving = !!savingMap[item._rowKey];

                  return (
                    <div
                      key={item._rowKey}
                      className="border-t border-slate-200 px-4 py-3"
                    >
                      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr] md:items-center">
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {fullName}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <AttendanceBadge value={currentAttendance} />

                          <select
                            value={currentAttendance}
                            disabled={isSaving}
                            onChange={(e) =>
                              handleAttendanceUpdate(
                                item._rowKey,
                                e.target.value,
                                item
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="Not Marked">Not Marked</option>
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Absent">Absent</option>
                            <option value="Excused">Excused</option>
                          </select>

                          {isSaving ? (
                            <span className="text-[11px] font-medium text-slate-500">
                              Saving...
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}