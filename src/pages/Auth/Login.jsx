import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function getRoleSlug(payload) {
  const roleSources = [
    payload?.role?.slug,
    payload?.role,
    payload?.user?.role?.slug,
    payload?.user?.role,
    payload?.user?.roles?.[0]?.slug,
    payload?.user?.roles?.[0]?.name,
    payload?.data?.role?.slug,
    payload?.data?.role,
    payload?.data?.user?.role?.slug,
    payload?.data?.user?.role,
    payload?.data?.user?.roles?.[0]?.slug,
    payload?.data?.user?.roles?.[0]?.name,
  ];

  const foundRole = roleSources.find(Boolean);

  return foundRole ? String(foundRole).toLowerCase() : "";
}

function getToken(payload) {
  return (
    payload?.token ||
    payload?.access_token ||
    payload?.data?.token ||
    payload?.data?.access_token ||
    payload?.authorisation?.token ||
    payload?.authorization?.token ||
    ""
  );
}

function getUser(payload) {
  return payload?.user || payload?.data?.user || payload?.data || null;
}

function getMessage(payload) {
  return (
    payload?.message ||
    payload?.error ||
    payload?.data?.message ||
    "Login failed. Please try again."
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      let result = {};
      const text = await response.text();

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = { message: text || "Unable to read server response." };
      }

      if (!response.ok) {
        throw new Error(getMessage(result));
      }

      const token = getToken(result);
      const user = getUser(result);
      const roleSlug = getRoleSlug(result);

      if (token) {
        localStorage.setItem("token", token);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (roleSlug) {
        localStorage.setItem("role", roleSlug);
      }

      if (formData.remember) {
        localStorage.setItem("remember_email", formData.email);
      } else {
        localStorage.removeItem("remember_email");
      }

      if (roleSlug === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong during login.");
    } finally {
      setLoading(false);
    }
  };

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
            src="/hero-tech.jpg"
            alt="AsyncAfrica Login"
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

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="mx-auto w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                <div
                  className="animate-fade-up inline-flex rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9c3ff]"
                  style={{ animationDelay: "0.1s" }}
                >
                  Secure Access
                </div>

                <h1
                  className="animate-fade-up mt-6 text-3xl font-black leading-tight text-white sm:text-4xl"
                  style={{ animationDelay: "0.2s" }}
                >
                  Welcome Back
                </h1>

                <p
                  className="animate-fade-up mt-4 text-sm leading-7 text-gray-300 sm:text-base"
                  style={{ animationDelay: "0.3s" }}
                >
                  Sign in to continue to your AsyncAfrica dashboard and manage
                  your services, training, and digital projects.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="animate-fade-up mt-8 space-y-5"
                  style={{ animationDelay: "0.4s" }}
                >
                  {errorMessage && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5"
                        >
                          <path d="M4 5h16a2 2 0 0 1 2 2v.4l-10 6.25L2 7.4V7a2 2 0 0 1 2-2Zm18 4.25V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.25l9.47 5.92a1 1 0 0 0 1.06 0L22 9.25Z" />
                        </svg>
                      </span>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#7A6CF5] focus:bg-black/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5"
                        >
                          <path d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V6Zm2 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
                        </svg>
                      </span>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-12 pr-14 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#7A6CF5] focus:bg-black/40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                      >
                        {showPassword ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                          >
                            <path d="M12 5c5.23 0 9.27 3.11 11 7-1.06 2.39-2.91 4.4-5.3 5.7l1.42 1.42-1.41 1.41-14-14 1.41-1.41 2.15 2.15A12.6 12.6 0 0 1 12 5Zm0 14c-5.23 0-9.27-3.11-11-7a12.76 12.76 0 0 1 4.37-5.16l1.46 1.46A5 5 0 0 0 12 17a4.9 4.9 0 0 0 2.7-.8l1.55 1.55A12.5 12.6 0 0 1 12 19Zm0-4a3 3 0 0 1-3-3c0-.35.06-.69.18-1.01l3.83 3.83c-.32.12-.66.18-1.01.18Zm2.82-1.99-3.83-3.83c.32-.12.66-.18 1.01-.18a3 3 0 0 1 3 3c0 .35-.06.69-.18 1.01Z" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                          >
                            <path d="M12 5c5.23 0 9.27 3.11 11 7-1.73 3.89-5.77 7-11 7S2.73 15.89 1 12c1.73-3.89 5.77-7 11-7Zm0 2C8.32 7 5.39 9.06 3.73 12 5.39 14.94 8.32 17 12 17s6.61-2.06 8.27-5C18.61 9.06 15.68 7 12 7Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        name="remember"
                        type="checkbox"
                        checked={formData.remember}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-white/20 bg-black/30 text-[#6050F0] focus:ring-[#6050F0]"
                      />
                      Remember me
                    </label>

                    <Link
                      to="/contact"
                      className="font-medium text-[#c9c3ff] transition hover:text-white"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="animate-glow w-full rounded-full bg-[#6050F0] px-6 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                <div
                  className="animate-fade-up mt-8 text-center text-sm text-gray-300"
                  style={{ animationDelay: "0.5s" }}
                >
                  Need help accessing your account?{" "}
                  <Link
                    to="/contact"
                    className="font-semibold text-[#c9c3ff] transition hover:text-white"
                  >
                    Contact support
                  </Link>
                </div>

                <div
                  className="animate-fade-up mt-6 text-center"
                  style={{ animationDelay: "0.6s" }}
                >
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 transition hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="m10.83 12 4.59-4.59L14 6l-6 6 6 6 1.41-1.41L10.83 12Z" />
                    </svg>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto flex min-h-[260px] w-full max-w-[520px] items-center lg:min-h-[580px]">
                <div className="w-full">
                  <div className="animate-fade-left max-w-2xl">
                    <div className="inline-flex rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9c3ff]">
                      AsyncAfrica Portal
                    </div>

                    <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-5xl">
                      Manage Your
                      <span className="block bg-gradient-to-r from-[#6050F0] via-[#7A6CF5] to-white bg-clip-text text-transparent">
                        Digital Journey
                      </span>
                    </h2>

                    <p className="mt-6 max-w-2xl text-sm leading-8 text-gray-300 sm:text-base">
                      Access your dashboard to follow projects, training,
                      services, and opportunities with a modern and secure
                      experience built for growth.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {[
                        "Secure Access",
                        "Mobile Friendly",
                        "Project Tracking",
                        "Training Portal",
                      ].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 backdrop-blur-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-10 hidden lg:block">
                    <div className="relative mx-auto h-[360px] w-full max-w-[460px]">
                      <div className="animate-fade-left absolute left-14 top-10 w-[320px] rounded-[28px] border border-white/10 bg-white/8 p-6 backdrop-blur-xl">
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-300">User Center</p>
                            <h3 className="mt-1 text-xl font-bold text-white">
                              Account Summary
                            </h3>
                          </div>
                          <div className="h-12 w-12 rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-full w-full"
                            >
                              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                            </svg>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-2xl bg-black/30 p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm text-gray-300">
                                Access Status
                              </span>
                              <span className="text-sm font-bold text-[#7A6CF5]">
                                Active
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-[#6050F0] to-[#7A6CF5]" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-black/30 p-4">
                              <p className="text-xs uppercase tracking-wider text-gray-400">
                                Projects
                              </p>
                              <h4 className="mt-2 text-2xl font-black text-white">
                                12+
                              </h4>
                            </div>

                            <div className="rounded-2xl bg-black/30 p-4">
                              <p className="text-xs uppercase tracking-wider text-gray-400">
                                Training
                              </p>
                              <h4 className="mt-2 text-2xl font-black text-white">
                                08
                              </h4>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-black/30 p-4">
                            <p className="text-sm text-gray-300">
                              Portal Features
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {["Secure", "Fast", "Modern", "Responsive"].map(
                                (tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-[#6050F0]/20 px-3 py-1 text-xs font-semibold text-[#c9c3ff]"
                                  >
                                    {tag}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="animate-float absolute left-0 top-0 w-56 rounded-3xl border border-white/10 bg-[#0f0f18]/80 p-5 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-6 w-6"
                            >
                              <path d="M12 2 1 21h22L12 2Zm0 4.8L19.53 19H4.47L12 6.8ZM11 10v4h2v-4h-2Zm0 6v2h2v-2h-2Z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              Protected access
                            </p>
                            <h4 className="text-base font-bold text-white">
                              Secure Login
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div
                        className="animate-float absolute bottom-8 right-0 w-60 rounded-3xl border border-white/10 bg-[#0f0f18]/80 p-5 backdrop-blur-xl"
                        style={{ animationDelay: "1.2s" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-[#7A6CF5]/20 p-3 text-[#7A6CF5]">
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-6 w-6"
                            >
                              <path d="M4 6h16v2H4V6Zm0 5h10v2H4v-2Zm0 5h16v2H4v-2Z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              Built for all screens
                            </p>
                            <h4 className="text-base font-bold text-white">
                              Mobile Ready
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="absolute right-10 top-8 h-20 w-20 rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 blur-[1px]" />
                      <div className="absolute bottom-0 left-12 h-28 w-28 rounded-full bg-[#6050F0]/15 blur-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}