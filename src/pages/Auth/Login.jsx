import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  clearStoredAuth,
  extractRole,
  getAuthState,
  getDashboardPathByRole,
  isKnownRole,
} from "../../lib/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

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
  return payload?.user || payload?.data?.user || null;
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

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remember_email") || "";

    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        remember: true,
      }));
    }

    const { token, role } = getAuthState();

    if (token && isKnownRole(role)) {
      navigate(getDashboardPathByRole(role), { replace: true });
      return;
    }

    if (token && !isKnownRole(role)) {
      clearStoredAuth();
    }
  }, [navigate]);

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

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
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
          email,
          password,
        }),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {
          message: text || "Unable to read server response.",
        };
      }

      if (!response.ok) {
        throw new Error(getMessage(result));
      }

      const token = getToken(result);
      const user = getUser(result);

      const roleFromPayload = extractRole(result);
      const roleFromUser = extractRole(user);
      const roleSlug = roleFromPayload || roleFromUser;

      if (!token) {
        throw new Error("Login succeeded but token was not returned.");
      }

      if (!isKnownRole(roleSlug)) {
        throw new Error(
          "Login succeeded, but a single valid role could not be resolved."
        );
      }

      clearStoredAuth();

      const storage = formData.remember ? localStorage : sessionStorage;

      storage.setItem("token", token);
      storage.setItem("auth_token", token);
      storage.setItem("access_token", token);
      storage.setItem("role", roleSlug);

      if (user) {
        const serializedUser = JSON.stringify(user);
        storage.setItem("user", serializedUser);
        storage.setItem("auth_user", serializedUser);
      } else {
        storage.removeItem("user");
        storage.removeItem("auth_user");
      }

      if (formData.remember) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }

      navigate(getDashboardPathByRole(roleSlug), { replace: true });
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
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 0 rgba(96, 80, 240, 0);
          }
          50% {
            box-shadow: 0 0 22px rgba(96, 80, 240, 0.22);
          }
        }

        @keyframes softZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.03);
          }
        }

        .fade-up {
          animation: fadeUp 0.7s ease forwards;
        }

        .glow-pulse {
          animation: glowPulse 3.4s ease-in-out infinite;
        }

        .bg-zoom {
          animation: softZoom 16s ease-in-out infinite alternate;
        }
      `}</style>

      <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#05060B] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/hero-tech.jpg"
            alt="AsyncAfrica Login"
            className="bg-zoom h-full w-full object-cover object-center opacity-15"
          />
          <div className="absolute inset-0 bg-black/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,108,245,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(96,80,240,0.10),transparent_34%)]" />
        </div>

        <div className="pointer-events-none absolute left-[-60px] top-10 h-36 w-36 rounded-full bg-[#6050F0]/20 blur-3xl sm:h-52 sm:w-52" />
        <div className="pointer-events-none absolute bottom-0 right-[-60px] h-40 w-40 rounded-full bg-[#7A6CF5]/20 blur-3xl sm:h-56 sm:w-56" />

        <div className="absolute inset-0 opacity-[0.05]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl items-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:gap-10">
            <div className="order-1">
              <div className="mx-auto w-full max-w-md rounded-[24px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_0_40px_rgba(96,80,240,0.08)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
                <div className="fade-up inline-flex rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9c3ff] sm:px-4 sm:py-2 sm:text-xs">
                  Secure Access
                </div>

                <h1 className="fade-up mt-4 text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
                  Welcome Back
                </h1>

                <p className="fade-up mt-3 text-sm leading-6 text-gray-300 sm:text-base">
                  Sign in to continue to your AsyncAfrica dashboard.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                  {["Secure", "Fast", "Mobile Friendly"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] text-gray-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="fade-up mt-6 space-y-4">
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
                        autoComplete="email"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#7A6CF5] focus:bg-black/40 sm:py-3.5"
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
                        autoComplete="current-password"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-12 pr-14 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#7A6CF5] focus:bg-black/40 sm:py-3.5"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                        aria-label={showPassword ? "Hide password" : "Show password"}
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

                  <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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
                    className="glow-pulse w-full rounded-full bg-[#6050F0] px-6 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                <div className="mt-5 text-center text-sm text-gray-300">
                  Need help accessing your account?{" "}
                  <Link
                    to="/contact"
                    className="font-semibold text-[#c9c3ff] transition hover:text-white"
                  >
                    Contact support
                  </Link>
                </div>

                <div className="mt-4 text-center">
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

            <div className="order-2 hidden lg:block">
              <div className="mx-auto w-full max-w-xl">
                <div className="fade-up rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(96,80,240,0.07)] backdrop-blur-xl sm:p-8">
                  <div className="inline-flex rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c9c3ff]">
                    AsyncAfrica Portal
                  </div>

                  <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                    Manage Your
                    <span className="block bg-gradient-to-r from-[#6050F0] via-[#7A6CF5] to-white bg-clip-text text-transparent">
                      Digital Journey
                    </span>
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-gray-300 sm:text-base">
                    Access your dashboard to follow projects, training,
                    services, and opportunities with a modern and secure
                    experience built for growth.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {[
                      "Secure Access",
                      "Mobile Friendly",
                      "Project Tracking",
                      "Training Portal",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-gray-200"
                      >
                        {item}
                      </span>
                    ))}
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