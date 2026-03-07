import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Application from "./Application";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function parseJsonSafely(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function makeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function safeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function safeShiftArray(value) {
  let source = value;

  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      source = [];
    }
  }

  if (!Array.isArray(source)) return [];

  return source
    .map((item, index) => ({
      id: item?.id ?? `shift-${index + 1}`,
      name: item?.name || "",
      startTime: item?.start_time || item?.startTime || "",
      endTime: item?.end_time || item?.endTime || "",
      capacity: Number(item?.capacity ?? item?.volume ?? 0),
      filled: Number(item?.filled ?? 0),
      isFull: Boolean(item?.is_full),
      message: item?.message || "",
      availableSlots:
        item?.available_slots !== undefined
          ? Number(item.available_slots)
          : Math.max(
              Number(item?.capacity ?? item?.volume ?? 0) -
                Number(item?.filled ?? 0),
              0
            ),
    }))
    .filter(
      (item) =>
        item.name ||
        item.startTime ||
        item.endTime ||
        item.capacity > 0
    );
}

function normalizeProgram(item) {
  const title = item?.name || item?.title || "Training Program";

  return {
    id: item?.id || null,
    title,
    slug: item?.slug || makeSlug(title) || String(item?.id || ""),
    badge: item?.badge || item?.category || "Training",
    intro:
      item?.intro ||
      item?.description ||
      "Build strong practical skills through applied learning and real project exposure.",
    overview:
      item?.overview ||
      item?.description ||
      "This program helps learners gain practical understanding and hands-on experience in real work environments.",
    duration: item?.duration || "Not specified",
    level: item?.level || "Not specified",
    format: item?.format || "Not specified",
    category: item?.category || "",
    iconKey: item?.icon_key || "",
    image: item?.image || "",
    skills: safeArray(item?.skills),
    outcomes: safeArray(item?.outcomes),
    tools: safeArray(item?.tools),
    modules: safeArray(item?.modules),
    objectives: safeArray(item?.objectives),
    shifts: safeShiftArray(item?.shifts),
    shiftSummary: item?.shift_summary || null,
  };
}

function getProgramIcon(iconKey, slug, category) {
  const key = String(iconKey || slug || category || "").toLowerCase();

  if (
    key.includes("software") ||
    key.includes("web") ||
    key.includes("development")
  ) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M8.7 16.6 4.1 12l4.6-4.6L7.3 6 1.3 12l6 6 1.4-1.4Zm6.6 0 1.4 1.4 6-6-6-6-1.4 1.4 4.6 4.6-4.6 4.6Z" />
      </svg>
    );
  }

  if (key.includes("network")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M4 6h6V2H4v4Zm10 16h6v-4h-6v4ZM4 22h6v-4H4v4Zm10-8h6v-4h-6v4ZM7 8v3h10V8h2v5h-6v3h-2v-3H5V8h2Z" />
      </svg>
    );
  }

  if (
    key.includes("ai") ||
    key.includes("artificial") ||
    key.includes("intelligence")
  ) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2a3 3 0 0 1 3 3v1.1A5 5 0 0 1 18 11v2a5 5 0 0 1-4 4.9V21h-4v-3.1A5 5 0 0 1 6 13v-2a5 5 0 0 1 3-4.9V5a3 3 0 0 1 3-3Zm-3 9v2a3 3 0 1 0 6 0v-2a3 3 0 1 0-6 0ZM5 10H2v2h3v-2Zm17 0h-3v2h3v-2ZM4.2 5.6 2.8 7l2.1 2.1 1.4-1.4L4.2 5.6Zm15.6 0-2.1 2.1 1.4 1.4L21.2 7l-1.4-1.4Z" />
      </svg>
    );
  }

  if (key.includes("iot")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 1 0-14 0H3a9 9 0 0 1 9-9Zm0 4a5 5 0 0 1 5 5h-2a3 3 0 1 0-6 0H7a5 5 0 0 1 5-5Zm-2 8h4v6h-4v-6Z" />
      </svg>
    );
  }

  if (key.includes("robot")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M9 2h6v2h-2v2.1A6 6 0 0 1 18 12v5a3 3 0 0 1-3 3h-1v2h-4v-2H9a3 3 0 0 1-3-3v-5a6 6 0 0 1 5-5.9V4H9V2Zm-1 9v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a4 4 0 1 0-8 0Zm2 1h2v2h-2v-2Zm4 0h2v2h-2v-2Z" />
      </svg>
    );
  }

  if (key.includes("security") || key.includes("cyber")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2 4 5v6c0 5.2 3.4 10 8 11 4.6-1 8-5.8 8-11V5l-8-3Zm0 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm3 5H9v-1a3 3 0 1 1 6 0v1Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M12 3 2 8l10 5 10-5-10-5Zm-7 9v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4l-7 3.5L5 12Z" />
    </svg>
  );
}

function formatTime(value) {
  if (!value) return "--:--";
  const parts = String(value).split(":");
  if (parts.length < 2) return value;
  return `${String(parts[0]).padStart(2, "0")}:${String(parts[1]).padStart(
    2,
    "0"
  )}`;
}

function totalShiftCapacity(shifts) {
  return (shifts || []).reduce(
    (sum, shift) => sum + Number(shift?.capacity || 0),
    0
  );
}

function hasOpenShift(shifts) {
  if (!Array.isArray(shifts) || !shifts.length) return true;
  return shifts.some((shift) => !shift.isFull);
}

export default function TrainingDetails() {
  const { slug } = useParams();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadProgram() {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        const response = await fetch(`${API_BASE_URL}/programs`, {
          headers: {
            Accept: "application/json",
          },
        });

        const text = await response.text();
        const result = parseJsonSafely(text);

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load program.");
        }

        const items = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        const normalized = items.map(normalizeProgram);

        const matched = normalized.find(
          (item) =>
            String(item.slug).toLowerCase() === String(slug).toLowerCase()
        );

        if (!matched) {
          if (!ignore) {
            setNotFound(true);
            setProgram(null);
          }
          return;
        }

        if (!ignore) {
          setProgram(matched);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Failed to load program.");
          setProgram(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadProgram();
    }

    return () => {
      ignore = true;
    };
  }, [slug]);

  const programIcon = useMemo(() => {
    return getProgramIcon(program?.iconKey, program?.slug, program?.category);
  }, [program]);

  const canApply = useMemo(() => {
    return hasOpenShift(program?.shifts || []);
  }, [program]);

  if (!slug) {
    return <Navigate to="/training" replace />;
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeRight {
          0% {
            opacity: 0;
            transform: translateX(-40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeLeft {
          0% {
            opacity: 0;
            transform: translateX(40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes floatY {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(96, 80, 240, 0.0);
          }
          50% {
            box-shadow: 0 0 30px rgba(96, 80, 240, 0.35);
          }
        }

        @keyframes zoomBg {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.9s ease forwards;
        }

        .animate-fade-right {
          animation: fadeRight 0.9s ease forwards;
        }

        .animate-fade-left {
          animation: fadeLeft 0.9s ease forwards;
        }

        .animate-float {
          animation: floatY 4s ease-in-out infinite;
        }

        .animate-glow {
          animation: pulseGlow 3.5s ease-in-out infinite;
        }

        .animate-bg {
          animation: zoomBg 12s ease-in-out infinite alternate;
        }
      `}</style>

      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src={program?.image || "/hero-tech.jpg"}
            alt={program?.title || "Training Program"}
            className="animate-bg h-full w-full object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-[#6050F0]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,108,245,0.25),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(96,80,240,0.2),transparent_35%)]" />
        </div>

        <div className="absolute left-[-80px] top-40 h-72 w-72 rounded-full bg-[#6050F0]/20 blur-3xl" />
        <div className="absolute bottom-10 right-[-60px] h-80 w-80 rounded-full bg-[#7A6CF5]/20 blur-3xl" />
        <div className="absolute right-[20%] top-[15%] h-20 w-20 rounded-full bg-[#6050F0]/30 blur-2xl" />

        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid min-h-[60vh] place-items-center">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center backdrop-blur-xl">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#7A6CF5]" />
                <h2 className="mt-5 text-2xl font-bold text-white">
                  Loading program...
                </h2>
                <p className="mt-2 text-sm text-gray-300">
                  Please wait while we load the program details.
                </p>
              </div>
            </div>
          ) : notFound ? (
            <div className="grid min-h-[60vh] place-items-center">
              <div className="max-w-xl rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center backdrop-blur-xl">
                <h2 className="text-3xl font-black text-white">
                  Program not found
                </h2>
                <p className="mt-3 text-base leading-7 text-gray-300">
                  We could not find the training program you are looking for.
                </p>
                <div className="mt-6">
                  <Link
                    to="/training"
                    className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-6 py-3 text-sm font-bold text-white transition duration-300 hover:bg-[#7A6CF5]"
                  >
                    Back to Training
                  </Link>
                </div>
              </div>
            </div>
          ) : error && !program ? (
            <div className="grid min-h-[60vh] place-items-center">
              <div className="max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 px-8 py-10 text-center backdrop-blur-xl">
                <h2 className="text-3xl font-black text-white">
                  Unable to load program
                </h2>
                <p className="mt-3 text-base leading-7 text-gray-200">{error}</p>
                <div className="mt-6">
                  <Link
                    to="/training"
                    className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-6 py-3 text-sm font-bold text-white transition duration-300 hover:bg-[#7A6CF5]"
                  >
                    Back to Training
                  </Link>
                </div>
              </div>
            </div>
          ) : program ? (
            <>
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="max-w-3xl">
                  <div
                    className="animate-fade-up inline-flex rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 px-4 py-2 text-sm font-semibold text-[#c9c3ff]"
                    style={{ animationDelay: "0.1s" }}
                  >
                    {program.badge}
                  </div>

                  <h1
                    className="animate-fade-up mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-7xl"
                    style={{ animationDelay: "0.2s" }}
                  >
                    {program.title}
                    <span className="block bg-gradient-to-r from-[#6050F0] via-[#7A6CF5] to-white bg-clip-text text-transparent">
                      Training Program
                    </span>
                  </h1>

                  <p
                    className="animate-fade-up mt-6 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg"
                    style={{ animationDelay: "0.35s" }}
                  >
                    {program.intro}
                  </p>

                  <div
                    className="animate-fade-up mt-8 flex flex-col gap-4 sm:flex-row"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowApplicationModal(true)}
                      disabled={!canApply}
                      className={`animate-glow inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-bold text-white transition duration-300 ${
                        canApply
                          ? "bg-[#6050F0] hover:-translate-y-1 hover:bg-[#7A6CF5]"
                          : "cursor-not-allowed bg-slate-700 opacity-60"
                      }`}
                    >
                      {canApply ? "Apply Now" : "Application Closed"}
                    </button>

                    <Link
                      to="/training"
                      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:border-[#7A6CF5] hover:bg-[#6050F0]/10"
                    >
                      Back to Training
                    </Link>
                  </div>

                  {!canApply ? (
                    <p className="mt-4 text-sm text-rose-200">
                      All shifts for this program are currently full.
                    </p>
                  ) : null}

                  <div
                    className="animate-fade-up mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4"
                    style={{ animationDelay: "0.65s" }}
                  >
                    <InfoCard label="Duration" value={program.duration} />
                    <InfoCard label="Level" value={program.level} />
                    <InfoCard label="Format" value={program.format} />
                    <InfoCard
                      label="Shifts"
                      value={String(program.shifts.length || 0)}
                    />
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <div className="relative mx-auto h-[560px] w-full max-w-[520px]">
                    <div className="animate-fade-left absolute left-10 top-14 w-[360px] rounded-[28px] border border-white/10 bg-white/8 p-6 backdrop-blur-xl">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">AsyncAfrica Academy</p>
                          <h3 className="mt-1 text-xl font-bold text-white">
                            Program Overview
                          </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                          {programIcon}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl bg-black/30 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-gray-300">Program Strength</span>
                            <span className="text-sm font-bold text-[#7A6CF5]">+90%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-[#6050F0] to-[#7A6CF5]" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-2xl bg-black/30 p-4">
                            <p className="text-xs uppercase tracking-wider text-gray-400">
                              Skills
                            </p>
                            <h4 className="mt-2 text-2xl font-black text-white">
                              {program.skills.length}
                            </h4>
                          </div>

                          <div className="rounded-2xl bg-black/30 p-4">
                            <p className="text-xs uppercase tracking-wider text-gray-400">
                              Outcomes
                            </p>
                            <h4 className="mt-2 text-2xl font-black text-white">
                              {program.outcomes.length}
                            </h4>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-black/30 p-4">
                          <p className="text-sm text-gray-300">Main Tools</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {program.tools.length ? (
                              program.tools.map((tool) => (
                                <span
                                  key={tool}
                                  className="rounded-full bg-[#6050F0]/20 px-3 py-1 text-xs font-semibold text-[#c9c3ff]"
                                >
                                  {tool}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">
                                No tools listed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="animate-float absolute left-0 top-0 w-60 rounded-3xl border border-white/10 bg-[#0f0f18]/80 p-5 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                            <path d="M12 2 1 21h22L12 2Zm0 4.8L19.53 19H4.47L12 6.8ZM11 10v4h2v-4h-2Zm0 6v2h2v-2h-2Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Professional Path</p>
                          <h4 className="text-base font-bold text-white">Future Ready</h4>
                        </div>
                      </div>
                    </div>

                    <div
                      className="animate-float absolute bottom-14 right-2 w-64 rounded-3xl border border-white/10 bg-[#0f0f18]/80 p-5 backdrop-blur-xl"
                      style={{ animationDelay: "1.2s" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#7A6CF5]/20 p-3 text-[#7A6CF5]">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                            <path d="M4 6h16v2H4V6Zm0 5h10v2H4v-2Zm0 5h16v2H4v-2Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Join now</p>
                          <h4 className="text-base font-bold text-white">Start Learning</h4>
                        </div>
                      </div>
                    </div>

                    <div className="absolute right-12 top-10 h-20 w-20 rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 blur-[1px]" />
                    <div className="absolute bottom-0 left-16 h-28 w-28 rounded-full bg-[#6050F0]/15 blur-2xl" />
                  </div>
                </div>
              </div>

              <div className="mt-20 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="animate-fade-right rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                  <h2 className="text-3xl font-black text-white">About this program</h2>
                  <p className="mt-5 text-base leading-8 text-gray-300">
                    {program.overview}
                  </p>

                  <h3 className="mt-10 text-2xl font-bold text-white">
                    What you will learn
                  </h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {program.skills.length ? (
                      program.skills.map((skill) => (
                        <div
                          key={skill}
                          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-gray-200"
                        >
                          {skill}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-gray-400">
                        No skills available yet.
                      </div>
                    )}
                  </div>

                  {program.objectives.length ? (
                    <>
                      <h3 className="mt-10 text-2xl font-bold text-white">
                        Program objectives
                      </h3>
                      <div className="mt-6 space-y-4">
                        {program.objectives.map((objective) => (
                          <div
                            key={objective}
                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                          >
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7A6CF5]" />
                            <p className="text-sm leading-7 text-gray-200">
                              {objective}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}

                  {program.modules.length ? (
                    <>
                      <h3 className="mt-10 text-2xl font-bold text-white">
                        Modules
                      </h3>
                      <div className="mt-6 flex flex-wrap gap-3">
                        {program.modules.map((module, index) => (
                          <span
                            key={`${module}-${index}`}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200"
                          >
                            {module}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="animate-fade-left rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                  <h2 className="text-3xl font-black text-white">Program outcomes</h2>
                  <div className="mt-6 space-y-4">
                    {program.outcomes.length ? (
                      program.outcomes.map((outcome) => (
                        <div
                          key={outcome}
                          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                        >
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7A6CF5]" />
                          <p className="text-sm leading-7 text-gray-200">
                            {outcome}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-gray-400">
                        No outcomes available yet.
                      </div>
                    )}
                  </div>

                  <div className="mt-10">
                    <h3 className="text-2xl font-bold text-white">Tools used</h3>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {program.tools.length ? (
                        program.tools.map((tool) => (
                          <span
                            key={tool}
                            className="rounded-full bg-[#6050F0]/20 px-4 py-2 text-sm font-semibold text-[#c9c3ff]"
                          >
                            {tool}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">
                          No tools available yet.
                        </span>
                      )}
                    </div>
                  </div>

                  {program.shifts.length ? (
                    <div className="mt-10 rounded-[24px] border border-white/10 bg-black/20 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-bold text-white">
                          Available shifts
                        </h3>
                        <span className="rounded-full bg-[#6050F0]/20 px-3 py-1 text-xs font-semibold text-[#c9c3ff]">
                          Total capacity: {totalShiftCapacity(program.shifts)}
                        </span>
                      </div>

                      {program.shiftSummary?.notification ? (
                        <p className="mt-3 text-sm text-gray-300">
                          {program.shiftSummary.notification}
                        </p>
                      ) : null}

                      <div className="mt-5 space-y-3">
                        {program.shifts.map((shift) => (
                          <div
                            key={shift.id}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h4 className="text-base font-bold text-white">
                                  {shift.name || "Shift"}
                                </h4>
                                <p className="mt-1 text-sm text-gray-300">
                                  {formatTime(shift.startTime)} -{" "}
                                  {formatTime(shift.endTime)}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-gray-200">
                                  Capacity: {shift.capacity}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    shift.isFull
                                      ? "bg-rose-500/20 text-rose-200"
                                      : "bg-emerald-500/20 text-emerald-200"
                                  }`}
                                >
                                  {shift.isFull ? "Shift is full" : "Available"}
                                </span>
                              </div>
                            </div>

                            {shift.message ? (
                              <p className="mt-3 text-sm text-gray-300">
                                {shift.message}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-10 rounded-[24px] border border-[#7A6CF5]/20 bg-[#6050F0]/10 p-6">
                    <h3 className="text-xl font-bold text-white">Ready to begin?</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-300">
                      Take the next step and start your application for this
                      program.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setShowApplicationModal(true)}
                        disabled={!canApply}
                        className={`animate-glow inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white transition duration-300 ${
                          canApply
                            ? "bg-[#6050F0] hover:bg-[#7A6CF5]"
                            : "cursor-not-allowed bg-slate-700 opacity-60"
                        }`}
                      >
                        {canApply ? "Apply for This Program" : "Shift Full"}
                      </button>
                      <Link
                        to="/training"
                        className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:bg-[#6050F0]/10"
                      >
                        All Training Programs
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Application
                open={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                program={program}
              />
            </>
          ) : (
            <Navigate to="/training" replace />
          )}
        </div>
      </section>
    </>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-md">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
    </div>
  );
}