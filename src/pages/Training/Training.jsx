import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

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

function normalizeProgram(item) {
  const title = item?.name || item?.title || "Training Program";
  const description =
    item?.description ||
    item?.intro ||
    "Learn practical and career-ready skills through hands-on training.";

  return {
    id: item?.id || null,
    title,
    slug: item?.slug || makeSlug(title) || String(item?.id || ""),
    description,
    shortDescription:
      description.length > 120
        ? `${description.slice(0, 120).trim()}...`
        : description,
    tag: item?.badge || item?.category || "Training",
    category: item?.category || "General",
    iconKey: item?.icon_key || "",
    status: item?.status || "Draft",
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
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M8.7 16.6 4.1 12l4.6-4.6L7.3 6 1.3 12l6 6 1.4-1.4Zm6.6 0 1.4 1.4 6-6-6-6-1.4 1.4 4.6 4.6-4.6 4.6Z" />
      </svg>
    );
  }

  if (key.includes("network")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
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
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2a3 3 0 0 1 3 3v1.1A5 5 0 0 1 18 11v2a5 5 0 0 1-4 4.9V21h-4v-3.1A5 5 0 0 1 6 13v-2a5 5 0 0 1 3-4.9V5a3 3 0 0 1 3-3Zm-3 9v2a3 3 0 1 0 6 0v-2a3 3 0 1 0-6 0ZM5 10H2v2h3v-2Zm17 0h-3v2h3v-2ZM4.2 5.6 2.8 7l2.1 2.1 1.4-1.4L4.2 5.6Zm15.6 0-2.1 2.1 1.4 1.4L21.2 7l-1.4-1.4Z" />
      </svg>
    );
  }

  if (key.includes("iot")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 1 0-14 0H3a9 9 0 0 1 9-9Zm0 4a5 5 0 0 1 5 5h-2a3 3 0 1 0-6 0H7a5 5 0 0 1 5-5Zm-2 8h4v6h-4v-6Z" />
      </svg>
    );
  }

  if (key.includes("robot")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M9 2h6v2h-2v2.1A6 6 0 0 1 18 12v5a3 3 0 0 1-3 3h-1v2h-4v-2H9a3 3 0 0 1-3-3v-5a6 6 0 0 1 5-5.9V4H9V2Zm-1 9v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a4 4 0 1 0-8 0Zm2 1h2v2h-2v-2Zm4 0h2v2h-2v-2Z" />
      </svg>
    );
  }

  if (key.includes("security") || key.includes("cyber")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2 4 5v6c0 5.2 3.4 10 8 11 4.6-1 8-5.8 8-11V5l-8-3Zm0 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm3 5H9v-1a3 3 0 1 1 6 0v1Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 3 2 8l10 5 10-5-10-5Zm-7 9v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4l-7 3.5L5 12Z" />
    </svg>
  );
}

function getStatusClasses(status) {
  if (status === "Active") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "Draft") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  }

  return "border-slate-400/20 bg-slate-400/10 text-slate-200";
}

function ProgramCard({ item, expanded, onToggle }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#7A6CF5]/40 hover:bg-white/[0.08]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#6050F0]/10 via-transparent to-[#7A6CF5]/10 opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#6050F0]/15 p-3 text-[#c9c3ff]">
              {getProgramIcon(item.iconKey, item.slug, item.category)}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                {item.category}
              </p>
              <h3 className="mt-1 line-clamp-1 text-base font-bold text-white sm:text-lg">
                {item.title}
              </h3>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
              item.status
            )}`}
          >
            {item.status}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#7A6CF5]/20 bg-[#6050F0]/10 px-2.5 py-1 text-[11px] font-semibold text-[#d9d5ff]">
            {item.tag}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
            Career Ready
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-300">
          {expanded ? item.description : item.shortDescription}
        </p>

        {expanded ? (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-gray-200">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-gray-400">
                Category
              </span>
              <span className="mt-1 block font-medium">{item.category}</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-gray-200">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-gray-400">
                Status
              </span>
              <span className="mt-1 block font-medium">{item.status}</span>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-[#7A6CF5]/40 hover:bg-[#6050F0]/10"
          >
            {expanded ? "Show less" : "Show more"}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M12 15.5 5 8.5l1.4-1.4 5.6 5.6 5.6-5.6L19 8.5l-7 7Z" />
            </svg>
          </button>

          <Link
            to={`/training/${item.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#6050F0] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#7A6CF5]"
          >
            View
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M13.2 4.8 20.4 12l-7.2 7.2-1.4-1.4 4.8-4.8H3.6v-2h13l-4.8-4.8 1.4-1.4Z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Training() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadPrograms() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/programs`, {
          headers: {
            Accept: "application/json",
          },
        });

        const text = await response.text();
        const result = parseJsonSafely(text);

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load programs.");
        }

        const items = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        const normalized = items.map(normalizeProgram);

        if (!ignore) {
          setPrograms(normalized);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Failed to load programs.");
          setPrograms([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPrograms();

    return () => {
      ignore = true;
    };
  }, []);

  const programCount = useMemo(() => programs.length, [programs]);
  const activeCount = useMemo(
    () => programs.filter((item) => item.status === "Active").length,
    [programs]
  );
  const categoryCount = useMemo(
    () => new Set(programs.map((item) => item.category).filter(Boolean)).size,
    [programs]
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05060b] text-white">
      <div className="absolute inset-0">
        <img
          src="/hero-tech.jpg"
          alt="AsyncAfrica Training"
          className="h-full w-full object-cover object-center opacity-15"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,108,245,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(96,80,240,0.14),transparent_32%)]" />
      </div>

      <div className="absolute left-[-70px] top-20 h-60 w-60 rounded-full bg-[#6050F0]/20 blur-3xl" />
      <div className="absolute bottom-0 right-[-60px] h-72 w-72 rounded-full bg-[#7A6CF5]/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[#7A6CF5]/20 bg-[#6050F0]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d7d2ff]">
              AsyncAfrica Training Hub
            </span>

            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-6xl">
              Explore Our
              <span className="block bg-gradient-to-r from-[#6050F0] via-[#8d82ff] to-white bg-clip-text text-transparent">
                Training Programs
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
              Start your journey with AsyncAfrica through practical internship
              and training opportunities in technology.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {[
                "Real Projects",
                "Mentorship",
                "Hands-on Learning",
                "Career Growth",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-200"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7A6CF5]"
              >
                Apply for Training
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-[#7A6CF5] hover:bg-[#6050F0]/10"
              >
                Explore Services
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Programs
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {String(programCount).padStart(2, "0")}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Active
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {String(activeCount).padStart(2, "0")}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Categories
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {String(categoryCount).padStart(2, "0")}
              </h3>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-10 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-center text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Available Programs
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Compact view with quick details. Click <span className="font-semibold text-gray-200">Show more</span> to see extra information.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="h-11 w-11 rounded-xl bg-white/10" />
                  <div className="h-6 w-16 rounded-full bg-white/10" />
                </div>
                <div className="mt-4 h-5 w-2/3 rounded bg-white/10" />
                <div className="mt-3 h-4 w-full rounded bg-white/10" />
                <div className="mt-2 h-4 w-4/5 rounded bg-white/10" />
                <div className="mt-4 h-8 w-28 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {programs.map((item) => (
              <ProgramCard
                key={item.id || item.slug}
                item={item}
                expanded={expandedCard === (item.id || item.slug)}
                onToggle={() =>
                  setExpandedCard((prev) =>
                    prev === (item.id || item.slug) ? null : item.id || item.slug
                  )
                }
              />
            ))}
          </div>
        )}

        {!loading && !error && programs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-10 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white">No training programs yet</h3>
            <p className="mt-3 text-sm leading-7 text-gray-300">
              Training programs will appear here once they are added in the system.
            </p>
          </div>
        ) : null}

        <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:p-6">
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Learn. Build. Grow.
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-300 sm:text-base">
              Our programs are designed for students and young professionals who
              want to gain practical skills in technology.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Practical learning experience",
                "Mentorship from professionals",
                "Career-focused training paths",
                "Useful technology skills",
              ].map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Quick Snapshot
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  Training Dashboard
                </h3>
              </div>
              <div className="rounded-2xl bg-[#6050F0]/15 p-3 text-[#c9c3ff]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-7 9.18V16l7 3.82L19 16v-3.82l-7 3.82-7-3.82Z" />
                </svg>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-300">Enrollment Readiness</span>
                <span className="font-bold text-[#c9c3ff]">92%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#6050F0] to-[#7A6CF5]" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400">
                  Mentors
                </p>
                <h4 className="mt-2 text-xl font-black text-white">10+</h4>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400">
                  Focus
                </p>
                <h4 className="mt-2 text-xl font-black text-white">Future Skills</h4>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-gray-300">Top Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Web", "Cloud", "AI", "IoT", "Security"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#6050F0]/15 px-3 py-1 text-xs font-semibold text-[#d7d2ff]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
