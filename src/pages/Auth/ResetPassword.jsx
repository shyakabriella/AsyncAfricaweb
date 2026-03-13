import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function getValidationMessage(payload) {
  const bag = payload?.data || payload?.errors;

  if (bag && typeof bag === "object") {
    for (const value of Object.values(bag)) {
      if (Array.isArray(value) && value.length) return value[0];
      if (typeof value === "string" && value.trim()) return value;
    }
  }

  return "";
}

function getMessage(payload, fallback = "Could not reset password.") {
  return (
    getValidationMessage(payload) ||
    payload?.message ||
    payload?.error ||
    payload?.data?.message ||
    fallback
  );
}

async function parseResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "Unable to read server response.",
    };
  }
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token || !email) {
      setErrorMessage("Invalid or incomplete reset link.");
      return;
    }

    if (!formData.password || !formData.password_confirmation) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getMessage(result, "Could not reset password."));
      }

      setSuccessMessage(
        result?.message || "Password has been reset successfully."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
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
            alt="AsyncAfrica Reset Password"
            className="bg-zoom h-full w-full object-cover object-center opacity-15"
          />
          <div className="absolute inset-0 bg-black/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,108,245,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(96,80,240,0.10),transparent_34%)]" />
        </div>

        <div className="pointer-events-none absolute left-[-60px] top-10 h-36 w-36 rounded-full bg-[#6050F0]/20 blur-3xl sm:h-52 sm:w-52" />
        <div className="pointer-events-none absolute bottom-0 right-[-60px] h-40 w-40 rounded-full bg-[#7A6CF5]/20 blur-3xl sm:h-56 sm:w-56" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-md rounded-[24px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_0_40px_rgba(96,80,240,0.08)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
            <div className="fade-up inline-flex rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9c3ff] sm:px-4 sm:py-2 sm:text-xs">
              Secure Password Setup
            </div>

            <h1 className="fade-up mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
              Set Your Password
            </h1>

            <p className="fade-up mt-3 text-sm leading-6 text-gray-300 sm:text-base">
              Create a new password for your account.
            </p>

            {email ? (
              <p className="mt-2 text-sm text-[#c9c3ff] break-all">
                {email}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="fade-up mt-6 space-y-4">
              {errorMessage && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {successMessage}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  New Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pr-16 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#7A6CF5] focus:bg-black/40 sm:py-3.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    name="password_confirmation"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pr-16 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#7A6CF5] focus:bg-black/40 sm:py-3.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                  >
                    {showPasswordConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glow-pulse w-full rounded-full bg-[#6050F0] px-6 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Saving..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-300">
              Back to{" "}
              <Link
                to="/login"
                className="font-semibold text-[#c9c3ff] transition hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}