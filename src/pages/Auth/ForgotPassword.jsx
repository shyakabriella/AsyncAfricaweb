import { Link } from "react-router-dom";
import { useState } from "react";

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

function getMessage(payload, fallback = "Could not send reset link.") {
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMessage("Email is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getMessage(result, "Could not send reset link."));
      }

      setSuccessMessage(
        result?.message ||
          "If the email exists, a password reset link has been sent."
      );
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
            alt="AsyncAfrica Forgot Password"
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

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-md rounded-[24px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_0_40px_rgba(96,80,240,0.08)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
            <div className="fade-up inline-flex rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9c3ff] sm:px-4 sm:py-2 sm:text-xs">
              Password Recovery
            </div>

            <h1 className="fade-up mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
              Forgot Password?
            </h1>

            <p className="fade-up mt-3 text-sm leading-6 text-gray-300 sm:text-base">
              Enter your email address and we will send you a password reset link.
            </p>

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
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#7A6CF5] focus:bg-black/40 sm:py-3.5"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glow-pulse w-full rounded-full bg-[#6050F0] px-6 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-300">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#c9c3ff] transition hover:text-white"
              >
                Sign in
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
      </section>
    </>
  );
}