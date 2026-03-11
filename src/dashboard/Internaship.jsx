import { useEffect, useMemo, useState } from "react";

import ProgramInternsCard from "../components/internship/ProgramInternsCard";
import ProgramCurriculumCard from "../components/internship/ProgramCurriculumCard";

import {
  getApplications,
  getPrograms,
  normalizeProgram,
  updateProgram,
} from "../services/internshipApi";

function StatCard({ label, value, tone = "default" }) {
  const toneClass =
    tone === "primary"
      ? "bg-indigo-50 text-indigo-700"
      : tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warning"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-50 text-slate-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <div
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xl font-black ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

function safeArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function getCurriculumTitle(item, index) {
  if (typeof item === "string") return item;

  if (item && typeof item === "object") {
    return (
      item.title ||
      item.name ||
      item.label ||
      item.module ||
      item.topic ||
      `Module ${index + 1}`
    );
  }

  return `Module ${index + 1}`;
}

function getCurriculumDescription(item) {
  if (item && typeof item === "object") {
    return item.description || item.details || item.content || "";
  }

  return "";
}

function buildCurriculum(program) {
  const modules = safeArray(program?.modules);

  return modules.map((item, index) => ({
    id: `module-${index}`,
    title: getCurriculumTitle(item, index),
    description: getCurriculumDescription(item),
    order: index + 1,
  }));
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function isEnrolledApplication(application) {
  const status = normalizeStatus(application?.status);

  return ["accepted", "approved", "reviewed"].includes(status);
}

function applicationMatchesProgram(application, program) {
  if (!application || !program) return false;

  const appProgramId = String(
    application?.program_id || application?.program?.id || ""
  ).trim();

  const selectedProgramId = String(program?.id || "").trim();

  if (appProgramId && selectedProgramId && appProgramId === selectedProgramId) {
    return true;
  }

  const appProgramSlug = String(
    application?.program?.slug || application?.program_slug || ""
  )
    .trim()
    .toLowerCase();

  const selectedProgramSlug = String(program?.slug || "")
    .trim()
    .toLowerCase();

  if (appProgramSlug && selectedProgramSlug && appProgramSlug === selectedProgramSlug) {
    return true;
  }

  const appProgramName = String(
    application?.program?.title ||
      application?.program?.name ||
      application?.program_name ||
      ""
  )
    .trim()
    .toLowerCase();

  const selectedProgramName = String(program?.name || program?.title || "")
    .trim()
    .toLowerCase();

  if (appProgramName && selectedProgramName && appProgramName === selectedProgramName) {
    return true;
  }

  return false;
}

function buildProgramInterns(applications, program) {
  if (!program) return [];

  return safeArray(applications).filter(
    (application) =>
      applicationMatchesProgram(application, program) &&
      isEnrolledApplication(application)
  );
}

function getCurriculumInputValue(payload) {
  if (typeof payload === "string") {
    return payload.trim();
  }

  if (payload && typeof payload === "object") {
    return String(
      payload.title ||
        payload.name ||
        payload.label ||
        payload.module ||
        payload.topic ||
        payload.description ||
        ""
    ).trim();
  }

  return "";
}

export default function Internaship() {
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [savingCurriculum, setSavingCurriculum] = useState(false);
  const [deletingCurriculumId, setDeletingCurriculumId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedProgram = useMemo(() => {
    return (
      programs.find((item) => String(item.id) === String(selectedProgramId)) ||
      null
    );
  }, [programs, selectedProgramId]);

  const curriculum = useMemo(() => {
    return buildCurriculum(selectedProgram);
  }, [selectedProgram]);

  const interns = useMemo(() => {
    return buildProgramInterns(applications, selectedProgram);
  }, [applications, selectedProgram]);

  const stats = useMemo(() => {
    const totalInterns = safeArray(applications).filter(isEnrolledApplication).length;

    const totalCurriculum = programs.reduce((sum, program) => {
      return sum + safeArray(program?.modules).length;
    }, 0);

    const totalShifts = programs.reduce((sum, program) => {
      return sum + safeArray(program?.shifts).length;
    }, 0);

    return {
      totalPrograms: programs.length,
      totalInterns,
      totalCurriculum,
      totalShifts,
    };
  }, [programs, applications]);

  async function loadInitialData() {
    try {
      setPageLoading(true);
      setError("");
      setSuccessMessage("");

      const [programRows, applicationRows] = await Promise.all([
        getPrograms(),
        getApplications(),
      ]);

      const normalizedRows = Array.isArray(programRows)
        ? programRows.map((item) => normalizeProgram(item))
        : [];

      setPrograms(normalizedRows);
      setApplications(Array.isArray(applicationRows) ? applicationRows : []);

      setSelectedProgramId((currentSelectedId) => {
        if (
          currentSelectedId &&
          normalizedRows.some(
            (item) => String(item.id) === String(currentSelectedId)
          )
        ) {
          return currentSelectedId;
        }

        return normalizedRows.length > 0 ? String(normalizedRows[0].id) : "";
      });
    } catch (err) {
      setError(err?.message || "Could not load internship page.");
      setPrograms([]);
      setApplications([]);
      setSelectedProgramId("");
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function handleCreateCurriculum(payload) {
    if (!selectedProgramId || !selectedProgram) return;

    const newModuleValue = getCurriculumInputValue(payload);

    if (!newModuleValue) {
      setError("Please provide a curriculum title.");
      return;
    }

    try {
      setSavingCurriculum(true);
      setError("");
      setSuccessMessage("");

      const existingModules = safeArray(selectedProgram?.modules);
      const nextModules = [...existingModules, newModuleValue];

      const updated = normalizeProgram(
        await updateProgram(selectedProgramId, {
          modules: nextModules,
        })
      );

      setPrograms((prev) =>
        prev.map((item) =>
          String(item.id) === String(selectedProgramId) ? updated : item
        )
      );

      setSuccessMessage("Curriculum item added successfully.");
    } catch (err) {
      setError(err?.message || "Could not add curriculum item.");
    } finally {
      setSavingCurriculum(false);
    }
  }

  async function handleDeleteCurriculum(itemId) {
    if (!selectedProgramId || !selectedProgram || !itemId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this curriculum item?"
    );

    if (!confirmed) return;

    try {
      setDeletingCurriculumId(itemId);
      setError("");
      setSuccessMessage("");

      const existingModules = safeArray(selectedProgram?.modules);
      const indexToDelete =
        typeof itemId === "string" && itemId.startsWith("module-")
          ? Number(itemId.replace("module-", ""))
          : Number(itemId);

      const nextModules = existingModules.filter(
        (_, index) => index !== indexToDelete
      );

      const updated = normalizeProgram(
        await updateProgram(selectedProgramId, {
          modules: nextModules,
        })
      );

      setPrograms((prev) =>
        prev.map((item) =>
          String(item.id) === String(selectedProgramId) ? updated : item
        )
      );

      setSuccessMessage("Curriculum item deleted successfully.");
    } catch (err) {
      setError(err?.message || "Could not delete curriculum item.");
    } finally {
      setDeletingCurriculumId(null);
    }
  }

  function handleAttendanceChange(payload) {
    console.log("Attendance changed:", payload);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#6050F0]">
              Internship Management
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              Internaship Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Manage programs, see enrolled interns, and control curriculum
              from one page.
            </p>
          </div>

          <button
            type="button"
            onClick={loadInitialData}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
          >
            Refresh
          </button>
        </div>

        {successMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 whitespace-pre-line rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Programs"
            value={stats.totalPrograms}
            tone="primary"
          />
          <StatCard
            label="Current Interns"
            value={stats.totalInterns}
            tone="success"
          />
          <StatCard
            label="Curriculum Items"
            value={stats.totalCurriculum}
            tone="warning"
          />
          <StatCard label="Program Shifts" value={stats.totalShifts} />
        </div>

        {pageLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading internship dashboard...
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Select Program
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400"
                  >
                    {programs.length === 0 ? (
                      <option value="">No programs available</option>
                    ) : (
                      programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Instructor
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {selectedProgram?.instructor || "TBA"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Status
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {selectedProgram?.status || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Duration
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {selectedProgram?.duration || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedProgram ? (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedProgram.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedProgram.intro ||
                      selectedProgram.description ||
                      selectedProgram.overview ||
                      "No program description available."}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <ProgramCurriculumCard
                  program={selectedProgram}
                  curriculum={curriculum}
                  loading={false}
                  saving={savingCurriculum}
                  deletingId={deletingCurriculumId}
                  onCreateCurriculum={handleCreateCurriculum}
                  onDeleteCurriculum={handleDeleteCurriculum}
                />
              </div>

              <div className="space-y-5">
                <ProgramInternsCard
                  program={selectedProgram}
                  interns={interns}
                  loading={false}
                  onAttendanceChange={handleAttendanceChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}