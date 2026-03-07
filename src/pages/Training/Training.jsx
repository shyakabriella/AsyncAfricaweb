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

  return {
    id: item?.id || null,
    title,
    slug: item?.slug || makeSlug(title) || String(item?.id || ""),
    description:
      item?.description ||
      item?.intro ||
      "Learn practical and career-ready skills through hands-on training.",
    tag: item?.badge || item?.category || "Training",
    category: item?.category || "",
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

export default function Training() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        @keyframes scrollDot {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(8px);
          }
          100% {
            opacity: 0;
            transform: translateY(16px);
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

        .scroll-dot {
          animation: scrollDot 1.8s infinite;
        }
      `}</style>

      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src="/hero-tech.jpg"
            alt="AsyncAfrica Training"
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
          <div className="mx-auto max-w-4xl text-center">
            <h1
              className="animate-fade-up text-4xl font-black leading-tight sm:text-5xl lg:text-7xl"
              style={{ animationDelay: "0.2s" }}
            >
              Explore Our
              <span className="block bg-gradient-to-r from-[#6050F0] via-[#7A6CF5] to-white bg-clip-text text-transparent">
                Training Programs
              </span>
            </h1>

            <p
              className="animate-fade-up mx-auto mt-6 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg"
              style={{ animationDelay: "0.35s" }}
            >
              Start your journey with AsyncAfrica through practical internship
              and training opportunities in different technology fields. Choose
              your path, build hands-on skills, and grow with real innovation.
            </p>

            <div
              className="animate-fade-up mt-8 flex flex-wrap justify-center gap-3"
              style={{ animationDelay: "0.5s" }}
            >
              {[
                "Real Projects",
                "Professional Mentorship",
                "Hands-on Learning",
                "Career Growth",
                "Innovation",
                "Future Skills",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 backdrop-blur-sm transition hover:border-[#7A6CF5]/40 hover:bg-[#6050F0]/10"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {error ? (
            <div className="mt-12 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-6 py-5 text-center text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-fade-up rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/10" />
                    <div className="h-7 w-24 rounded-full bg-white/10" />
                  </div>
                  <div className="mt-6 h-8 w-2/3 rounded bg-white/10" />
                  <div className="mt-4 h-4 w-full rounded bg-white/10" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
                  <div className="mt-6 h-2 w-full rounded-full bg-white/10" />
                  <div className="mt-6 h-5 w-28 rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {programs.map((item, index) => (
                <Link
                  key={item.id || item.slug}
                  to={`/training/${item.slug}`}
                  className="animate-fade-up group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#7A6CF5]/50 hover:bg-white/[0.08]"
                  style={{ animationDelay: `${0.12 * (index + 1)}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6050F0]/10 via-transparent to-[#7A6CF5]/10 opacity-0 transition duration-500 group-hover:opacity-100" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="animate-glow rounded-2xl bg-[#6050F0]/20 p-4 text-[#7A6CF5]">
                        {getProgramIcon(item.iconKey, item.slug, item.category)}
                      </div>
                      <span className="rounded-full border border-[#7A6CF5]/20 bg-[#6050F0]/10 px-3 py-1 text-xs font-semibold text-[#c9c3ff]">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-gray-300">
                      {item.description}
                    </p>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[#6050F0] to-[#7A6CF5]" />
                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#c9c3ff]">
                      View program
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4 transition group-hover:translate-x-1"
                      >
                        <path d="M13.2 4.8 20.4 12l-7.2 7.2-1.4-1.4 4.8-4.8H3.6v-2h13l-4.8-4.8 1.4-1.4Z" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && programs.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center backdrop-blur-xl">
              <h3 className="text-2xl font-bold text-white">
                No training programs yet
              </h3>
              <p className="mt-3 text-gray-300">
                Training programs will appear here once they are added in the
                system.
              </p>
            </div>
          ) : null}

          <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
            <div className="animate-fade-right max-w-2xl">
              <h2 className="text-3xl font-black text-white sm:text-4xl">
                Learn. Build. Grow.
              </h2>
              <p className="mt-5 text-base leading-8 text-gray-300 sm:text-lg">
                Our programs are designed for students and young professionals
                who want to gain practical skills in technology. Every training
                field gives you a chance to learn from real work and professional
                guidance.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/contact"
                  className="animate-glow inline-flex items-center justify-center rounded-full bg-[#6050F0] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
                >
                  Apply for Training
                </Link>

                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:border-[#7A6CF5] hover:bg-[#6050F0]/10"
                >
                  Explore Services
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative mx-auto h-[500px] w-full max-w-[500px]">
                <div className="animate-fade-left absolute left-12 top-14 w-[360px] rounded-[28px] border border-white/10 bg-white/8 p-6 backdrop-blur-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">AsyncAfrica Academy</p>
                      <h3 className="mt-1 text-xl font-bold text-white">
                        Training Dashboard
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-full w-full"
                      >
                        <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-7 9.18V16l7 3.82L19 16v-3.82l-7 3.82-7-3.82Z" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-black/30 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Enrollment Rate
                        </span>
                        <span className="text-sm font-bold text-[#7A6CF5]">
                          +92%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#6050F0] to-[#7A6CF5]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-black/30 p-4">
                        <p className="text-xs uppercase tracking-wider text-gray-400">
                          Programs
                        </p>
                        <h4 className="mt-2 text-2xl font-black text-white">
                          {String(programCount).padStart(2, "0")}
                        </h4>
                      </div>

                      <div className="rounded-2xl bg-black/30 p-4">
                        <p className="text-xs uppercase tracking-wider text-gray-400">
                          Mentors
                        </p>
                        <h4 className="mt-2 text-2xl font-black text-white">
                          10+
                        </h4>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-black/30 p-4">
                      <p className="text-sm text-gray-300">Top Skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {["Web", "Cloud", "AI", "IoT", "Security"].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#6050F0]/20 px-3 py-1 text-xs font-semibold text-[#c9c3ff]"
                          >
                            {tag}
                          </span>
                        ))}
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
                      <p className="text-xs text-gray-400">Choose your path</p>
                      <h4 className="text-base font-bold text-white">Future Skills</h4>
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
                      <p className="text-xs text-gray-400">Start today</p>
                      <h4 className="text-base font-bold text-white">Join Training</h4>
                    </div>
                  </div>
                </div>

                <div className="absolute right-12 top-10 h-20 w-20 rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 blur-[1px]" />
                <div className="absolute bottom-0 left-16 h-28 w-28 rounded-full bg-[#6050F0]/15 blur-2xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center lg:flex">
          <span className="mb-3 text-xs uppercase tracking-[0.3em] text-gray-400">
            Scroll
          </span>
          <div className="flex h-14 w-8 justify-center rounded-full border border-white/20">
            <div className="scroll-dot mt-2 h-3 w-3 rounded-full bg-[#7A6CF5]" />
          </div>
        </div>
      </section>
    </>
  );
}