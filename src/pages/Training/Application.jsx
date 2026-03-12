import { useEffect, useMemo, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const APPLICATIONS_ENDPOINT =
  import.meta.env.VITE_APPLICATIONS_ENDPOINT || "/applications";
const DEFAULT_MOMO_CODE = import.meta.env.VITE_MOMO_CODE || "";

function parsePossibleJsonArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeOptionArray(value) {
  return parsePossibleJsonArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return {
          value: item,
          label: item,
        };
      }

      if (item && typeof item === "object") {
        const optionValue =
          item.value || item.label || item.name || item.title || "";
        const optionLabel =
          item.label || item.name || item.title || item.value || "";

        if (!optionValue || !optionLabel) return null;

        return {
          value: optionValue,
          label: optionLabel,
        };
      }

      return null;
    })
    .filter(Boolean);
}

function normalizeShift(shift, index = 0) {
  return {
    id: shift?.id ?? `shift_${index + 1}`,
    name: shift?.name || "",
    startTime: shift?.startTime || shift?.start_time || "",
    endTime: shift?.endTime || shift?.end_time || "",
    capacity: Number(shift?.capacity ?? 0),
    filled: Number(
      shift?.filled ?? shift?.enrolled ?? shift?.current_students ?? 0
    ),
    availableSlots: Number(
      shift?.availableSlots ?? shift?.available_slots ?? 0
    ),
    isFull: Boolean(shift?.isFull ?? shift?.is_full ?? false),
    message: shift?.message || "",
  };
}

function getAllShifts(program) {
  const raw = Array.isArray(program?.shifts) ? program.shifts : [];
  return raw.map((shift, index) => normalizeShift(shift, index));
}

function getAvailableShifts(program) {
  return getAllShifts(program).filter((shift) => !shift.isFull);
}

function normalizeProgram(program) {
  if (!program) {
    return {
      id: "",
      title: "",
      slug: "",
      badge: "",
      category: "",
      duration: "",
      level: "",
      format: "",
      intro: "",
      description: "",
      price: 0,
      skills: [],
      tools: [],
      experienceLevels: [],
      shifts: [],
    };
  }

  return {
    id: program?.id || "",
    title: program?.title || program?.name || "",
    slug: program?.slug || "",
    badge: program?.badge || "",
    category: program?.category || "",
    duration: program?.duration || "",
    level: program?.level || "",
    format: program?.format || "",
    intro: program?.intro || "",
    description: program?.description || "",
    price: Number(program?.price || 0),
    skills: normalizeOptionArray(program?.skills),
    tools: normalizeOptionArray(program?.tools),
    experienceLevels: normalizeOptionArray(
      program?.experience_levels || program?.experienceLevels || []
    ),
    shifts: getAllShifts(program),
  };
}

function buildInitialForm(program) {
  const normalizedProgram = normalizeProgram(program);
  const firstOpenShift = normalizedProgram.shifts.find((shift) => !shift.isFull);

  return {
    authProvider: "manual",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    dateOfBirth: "",
    gender: "",

    educationLevel: "",
    schoolName: "",
    fieldOfStudy: "",
    experienceLevel: "",

    selectedShiftId: firstOpenShift?.id || "",
    selectedSkills: [],
    selectedTools: [],

    agreeTerms: false,
    agreeCommunication: true,
  };
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

function formatPriceRWF(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "To be confirmed";
  }

  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount);
}

function splitFullName(fullName = "") {
  const cleaned = String(fullName).trim().replace(/\s+/g, " ");
  if (!cleaned) return { firstName: "", lastName: "" };

  const parts = cleaned.split(" ");

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.slice(-1).join(" "),
  };
}

function normalizeGoogleProfile(profile) {
  const fallbackName = splitFullName(
    profile?.name || profile?.fullName || profile?.displayName || ""
  );

  return {
    firstName:
      profile?.firstName ||
      profile?.given_name ||
      profile?.givenName ||
      fallbackName.firstName ||
      "",
    lastName:
      profile?.lastName ||
      profile?.family_name ||
      profile?.familyName ||
      fallbackName.lastName ||
      "",
    email: profile?.email || "",
    phone: profile?.phone || profile?.phoneNumber || "",
    country: profile?.country || "",
    city: profile?.city || "",
  };
}

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google sign-in can only run in the browser.")
    );
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-google-identity="true"]'
    );

    if (existingScript) {
      let tries = 0;

      const timer = window.setInterval(() => {
        tries += 1;

        if (window.google?.accounts?.oauth2) {
          window.clearInterval(timer);
          resolve(window.google);
        }

        if (tries > 50) {
          window.clearInterval(timer);
          reject(new Error("Google sign-in could not be initialized."));
        }
      }, 100);

      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";

    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google);
      } else {
        reject(new Error("Google sign-in is unavailable right now."));
      }
    };

    script.onerror = () => {
      reject(new Error("Could not load Google sign-in."));
    };

    document.head.appendChild(script);
  });
}

async function fetchGoogleUserProfile(accessToken) {
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not fetch your Google profile.");
  }

  const data = await response.json();

  return {
    firstName: data.given_name || "",
    lastName: data.family_name || "",
    email: data.email || "",
    name: data.name || "",
    picture: data.picture || "",
  };
}

async function signInWithGooglePopup(clientId) {
  if (!clientId) {
    throw new Error(
      "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env."
    );
  }

  const google = await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    let finished = false;

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      prompt: "select_account",
      callback: async (tokenResponse) => {
        if (finished) return;

        if (!tokenResponse?.access_token) {
          finished = true;
          reject(new Error("Google sign-in did not return an access token."));
          return;
        }

        try {
          const profile = await fetchGoogleUserProfile(
            tokenResponse.access_token
          );
          finished = true;
          resolve(profile);
        } catch (error) {
          finished = true;
          reject(
            error instanceof Error
              ? error
              : new Error("Google profile could not be loaded.")
          );
        }
      },
      error_callback: (error) => {
        if (finished) return;
        finished = true;

        if (error?.type === "popup_closed") {
          reject(new Error("Google sign-in was cancelled."));
          return;
        }

        if (error?.type === "popup_failed_to_open") {
          reject(
            new Error("Popup failed to open. Please allow popups and try again.")
          );
          return;
        }

        reject(new Error("Google sign-in could not be completed."));
      },
    });

    tokenClient.requestAccessToken();
  });
}

async function submitApplicationToApi(payload) {
  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const endpoint = APPLICATIONS_ENDPOINT.startsWith("/")
    ? APPLICATIONS_ENDPOINT
    : `/${APPLICATIONS_ENDPOINT}`;

  const response = await fetch(`${cleanBaseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (result?.errors && typeof result.errors === "object") {
      const messages = Object.values(result.errors).flat().filter(Boolean);
      throw new Error(
        messages.length ? messages.join("\n") : "Application submission failed."
      );
    }

    throw new Error(result?.message || "Application submission failed.");
  }

  return result;
}

function ModalShell({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-[100dvh] items-center justify-center p-0 sm:p-4">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#080811] text-white shadow-2xl sm:h-auto sm:max-h-[95vh] sm:max-w-[1500px] sm:rounded-[28px]">
          <div className="flex items-center justify-between px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#a8a1f7]">
                Program Application
              </p>
              <h2 className="truncate text-lg font-bold text-white sm:text-xl">
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-white transition hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniBadge({ children, tone = "default" }) {
  const toneClass =
    tone === "primary"
      ? "bg-[#6050F0]/18 text-[#d9d5ff]"
      : tone === "warning"
      ? "bg-yellow-400/18 text-yellow-100"
      : "bg-white/8 text-gray-200";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] px-3 py-2.5">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-white">{value || "-"}</span>
    </div>
  );
}

function Field({ label, error, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[12px] font-medium text-gray-200">
        {label}
      </label>
      <input
        {...props}
        className={`h-11 w-full rounded-2xl bg-white/[0.05] px-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:ring-1 focus:ring-[#7A6CF5] ${
          error ? "ring-1 ring-rose-400/60" : ""
        }`}
      />
      {error ? <p className="mt-1 text-[11px] text-rose-200">{error}</p> : null}
    </div>
  );
}

function SelectField({ label, error, children, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[12px] font-medium text-gray-200">
        {label}
      </label>
      <select
        {...props}
        style={{ colorScheme: "dark" }}
        className={`h-11 w-full rounded-2xl bg-[#111827] px-3 text-sm text-white outline-none transition focus:ring-1 focus:ring-[#7A6CF5] ${
          error ? "ring-1 ring-rose-400/60" : ""
        }`}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-[11px] text-rose-200">{error}</p> : null}
    </div>
  );
}

function ChipToggle({ item, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
        selected
          ? "bg-[#6050F0] text-white"
          : "bg-white/[0.06] text-gray-200 hover:bg-white/[0.1]"
      }`}
    >
      {item.label}
    </button>
  );
}

function ShiftCard({ shift, active, onSelect }) {
  return (
    <label
      className={`block rounded-2xl p-3 transition ${
        shift.isFull
          ? "cursor-not-allowed bg-white/[0.03] opacity-70"
          : active
          ? "bg-[#6050F0]/12 ring-1 ring-[#7A6CF5]"
          : "cursor-pointer bg-white/[0.05] hover:bg-white/[0.08]"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="selectedShift"
          value={shift.id}
          checked={active}
          disabled={shift.isFull}
          onChange={onSelect}
          className="mt-1 h-4 w-4"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-white">{shift.name}</p>

            <div className="flex flex-wrap gap-2">
              {shift.capacity > 0 ? (
                <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-gray-200">
                  Cap: {shift.capacity}
                </span>
              ) : null}
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  shift.isFull
                    ? "bg-rose-500/20 text-rose-200"
                    : "bg-emerald-500/20 text-emerald-200"
                }`}
              >
                {shift.isFull
                  ? "Full"
                  : `${Math.max(shift.availableSlots, 0)} left`}
              </span>
            </div>
          </div>

          {shift.message ? (
            <p className="mt-1 text-[11px] text-gray-400">{shift.message}</p>
          ) : null}
        </div>
      </div>
    </label>
  );
}

function MomoIcon() {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src="/momo.png"
        alt="MoMo"
        onError={() => setFailed(true)}
        className="h-9 w-9 rounded-xl bg-white p-1 object-contain"
      />
    );
  }

  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400/20 text-yellow-200">
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M16 12h.01"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M4.8 9.5h14.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function Application({
  open,
  onClose,
  program,
  onSubmit,
  onGoogleApply,
  momoCode,
}) {
  const normalizedProgram = useMemo(() => normalizeProgram(program), [program]);
  const resolvedMomoCode = momoCode || DEFAULT_MOMO_CODE;

  const [form, setForm] = useState(buildInitialForm(normalizedProgram));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [googleMessage, setGoogleMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedPayload, setSubmittedPayload] = useState(null);

  const allShifts = useMemo(
    () => getAllShifts(normalizedProgram),
    [normalizedProgram]
  );

  const availableShifts = useMemo(
    () => getAvailableShifts(normalizedProgram),
    [normalizedProgram]
  );

  const skills = useMemo(
    () => normalizedProgram.skills || [],
    [normalizedProgram]
  );

  const tools = useMemo(
    () => normalizedProgram.tools || [],
    [normalizedProgram]
  );

  const experienceLevels = useMemo(
    () => normalizedProgram.experienceLevels || [],
    [normalizedProgram]
  );

  const selectedShift = useMemo(() => {
    return allShifts.find(
      (shift) => String(shift.id) === String(form.selectedShiftId)
    );
  }, [allShifts, form.selectedShiftId]);

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setSubmitError("");
    setGoogleMessage("");
    setSubmittedPayload(null);
    setForm(buildInitialForm(normalizedProgram));
  }, [open, normalizedProgram]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (onGoogleApply) return;
    if (!GOOGLE_CLIENT_ID) return;

    loadGoogleIdentityScript().catch(() => {});
  }, [open, onGoogleApply]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function toggleArrayValue(name, value) {
    setForm((prev) => {
      const current = Array.isArray(prev[name]) ? prev[name] : [];
      const exists = current.includes(value);

      return {
        ...prev,
        [name]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!form.country.trim()) nextErrors.country = "Country is required.";
    if (!form.educationLevel) nextErrors.educationLevel = "Education level is required.";
    if (!form.schoolName.trim()) nextErrors.schoolName = "School is required.";

    if (experienceLevels.length > 0 && !form.experienceLevel) {
      nextErrors.experienceLevel = "Select experience level.";
    }

    if (availableShifts.length > 0 && !form.selectedShiftId) {
      nextErrors.selectedShiftId = "Choose an available shift.";
    }

    if (!form.agreeTerms) {
      nextErrors.agreeTerms = "You must agree before submitting.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleGooglePrefill() {
    setGoogleMessage("");
    setSubmitError("");

    const handler =
      typeof onGoogleApply === "function"
        ? onGoogleApply
        : GOOGLE_CLIENT_ID
        ? () => signInWithGooglePopup(GOOGLE_CLIENT_ID)
        : null;

    if (!handler) {
      setGoogleMessage(
        "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file or pass an onGoogleApply handler."
      );
      return;
    }

    try {
      setGoogleLoading(true);

      const googleProfile = await handler();
      if (!googleProfile) return;

      const profile = normalizeGoogleProfile(googleProfile);

      setForm((prev) => ({
        ...prev,
        authProvider: "google",
        firstName: profile.firstName || prev.firstName,
        lastName: profile.lastName || prev.lastName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        country: profile.country || prev.country,
        city: profile.city || prev.city,
      }));

      setGoogleMessage("Google account connected successfully.");
    } catch (error) {
      setGoogleMessage(
        error?.message || "Google sign-in could not be completed."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      auth_provider: form.authProvider,
      program_id: normalizedProgram.id || null,
      shift_id: form.selectedShiftId || null,
      experience_level: form.experienceLevel || null,
      selected_skills: form.selectedSkills,
      selected_tools: form.selectedTools,
      applicant: {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        city: form.city.trim(),
        date_of_birth: form.dateOfBirth || null,
        gender: form.gender || null,
      },
      background: {
        education_level: form.educationLevel,
        school_name: form.schoolName.trim(),
        field_of_study: form.fieldOfStudy.trim(),
      },
      consents: {
        agree_terms: form.agreeTerms,
        agree_communication: form.agreeCommunication,
      },
      submitted_at: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      setSubmitError("");

      if (typeof onSubmit === "function") {
        await onSubmit(payload);
      } else {
        await submitApplicationToApi(payload);
      }

      setSubmittedPayload(payload);
    } catch (error) {
      setSubmitError(
        error?.message || "Application could not be submitted right now."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={submittedPayload ? "Application Submitted" : "Apply for Program"}
    >
      {submittedPayload ? (
        <div className="mx-auto grid max-w-5xl gap-4">
          <div className="rounded-[26px] bg-emerald-500/10 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-200">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-black text-white sm:text-2xl">
                  Application received
                </h3>
                <p className="mt-2 text-sm leading-6 text-emerald-100/90">
                  Your application has been successfully received, it will be
                  validated and approved after payment within 2 days.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryLine
                label="Applicant"
                value={`${submittedPayload.applicant.first_name} ${submittedPayload.applicant.last_name}`}
              />
              <SummaryLine
                label="Email"
                value={submittedPayload.applicant.email}
              />
              <SummaryLine label="Program" value={normalizedProgram.title} />
              <SummaryLine
                label="Price"
                value={formatPriceRWF(normalizedProgram.price)}
              />
              <SummaryLine
                label="Shift"
                value={selectedShift ? selectedShift.name : "Will be assigned later"}
              />
            </div>
          </div>

          <div className="rounded-[26px] bg-yellow-400/10 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <MomoIcon />
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-100/80">
                  Payment Information
                </p>
                <h4 className="text-lg font-bold text-white">Pay with MoMo</h4>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SummaryLine
                label="Program Price"
                value={formatPriceRWF(normalizedProgram.price)}
              />
              <SummaryLine
                label="MoMo Code"
                value={resolvedMomoCode || "Payment code will be shared soon"}
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-200">
              Please complete payment using the MoMo code above. After payment,
              your application will be validated and approved within 2 days.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedPayload(null);
                  setForm(buildInitialForm(normalizedProgram));
                }}
                className="rounded-full bg-white/6 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[300px_1fr]">
          <aside className="rounded-[26px] bg-white/[0.04] p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#a8a1f7]">
              Applying For
            </p>

            <h3 className="mt-2 text-2xl font-black text-white">
              {normalizedProgram.title || "Training Program"}
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {normalizedProgram.badge ? (
                <MiniBadge tone="primary">{normalizedProgram.badge}</MiniBadge>
              ) : null}
              {normalizedProgram.category ? (
                <MiniBadge>{normalizedProgram.category}</MiniBadge>
              ) : null}
              {normalizedProgram.duration ? (
                <MiniBadge>{normalizedProgram.duration}</MiniBadge>
              ) : null}
              {normalizedProgram.level ? (
                <MiniBadge>Level {normalizedProgram.level}</MiniBadge>
              ) : null}
              {normalizedProgram.format ? (
                <MiniBadge>{normalizedProgram.format}</MiniBadge>
              ) : null}
              {normalizedProgram.price > 0 ? (
                <MiniBadge tone="warning">
                  {formatPriceRWF(normalizedProgram.price)}
                </MiniBadge>
              ) : null}
            </div>

            {normalizedProgram.intro ? (
              <p className="mt-4 text-sm leading-6 text-gray-300">
                {normalizedProgram.intro}
              </p>
            ) : null}

            {normalizedProgram.description ? (
              <p className="mt-3 text-sm leading-6 text-gray-400">
                {normalizedProgram.description}
              </p>
            ) : null}

            <div className="mt-5 grid gap-2">
              <SummaryLine
                label="Category"
                value={normalizedProgram.category || "-"}
              />
              <SummaryLine
                label="Duration"
                value={normalizedProgram.duration || "-"}
              />
              <SummaryLine
                label="Level"
                value={normalizedProgram.level || "-"}
              />
              <SummaryLine
                label="Format"
                value={normalizedProgram.format || "-"}
              />
              <SummaryLine
                label="Price"
                value={formatPriceRWF(normalizedProgram.price)}
              />
            </div>

            <div className="mt-5 rounded-[22px] bg-yellow-400/10 p-4">
              <div className="flex items-center gap-3">
                <MomoIcon />
                <div>
                  <p className="text-xs font-bold text-white">Payment code</p>
                  <p className="text-sm text-yellow-100">
                    {resolvedMomoCode || "Will be shared soon"}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-[26px] bg-white/[0.04] p-4 sm:p-5">
            {submitError ? (
              <div className="mb-4 whitespace-pre-line rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {submitError}
              </div>
            ) : null}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-white sm:text-2xl">
                  Personal and academic details
                </h3>
                <p className="mt-1 text-sm text-gray-300">
                  Compact single-page form. On large screens, fields are shown in
                  a 6-column layout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGooglePrefill}
                disabled={googleLoading}
                className="inline-flex h-11 items-center justify-center gap-3 rounded-2xl bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.4 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12Z"
                  />
                </svg>
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </button>
            </div>

            {googleMessage ? (
              <div className="mb-4 rounded-2xl bg-[#6050F0]/12 px-4 py-3 text-sm text-[#ddd9ff]">
                {googleMessage}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
              <Field
                label="First Name"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                error={errors.firstName}
                placeholder="John"
              />

              <Field
                label="Last Name"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                error={errors.lastName}
                placeholder="Doe"
              />

              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
              />

              <Field
                label="Phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                error={errors.phone}
                placeholder="+250 7xx xxx xxx"
              />

              <Field
                label="Country"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                error={errors.country}
                placeholder="Rwanda"
              />

              <Field
                label="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Kigali"
              />

              <Field
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
              />

              <SelectField
                label="Gender"
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
              >
                <option value="" className="bg-[#111827] text-white">
                  Select
                </option>
                <option value="Male" className="bg-[#111827] text-white">
                  Male
                </option>
                <option value="Female" className="bg-[#111827] text-white">
                  Female
                </option>
                <option
                  value="Prefer not to say"
                  className="bg-[#111827] text-white"
                >
                  Prefer not to say
                </option>
              </SelectField>

              <SelectField
                label="Education"
                value={form.educationLevel}
                onChange={(e) => updateField("educationLevel", e.target.value)}
                error={errors.educationLevel}
              >
                <option value="" className="bg-[#111827] text-white">
                  Select
                </option>
                <option value="High School" className="bg-[#111827] text-white">
                  High School/TVET
                </option>
                <option value="Certificate" className="bg-[#111827] text-white">
                  Certificate
                </option>
                <option value="Diploma" className="bg-[#111827] text-white">
                  Diploma
                </option>
                <option
                  value="Bachelor's Degree"
                  className="bg-[#111827] text-white"
                >
                  Bachelor's Degree
                </option>
              </SelectField>

              <Field
                label="School / Institution"
                value={form.schoolName}
                onChange={(e) => updateField("schoolName", e.target.value)}
                error={errors.schoolName}
                placeholder="Your school"
              />

              <Field
                label="Field of Study"
                value={form.fieldOfStudy}
                onChange={(e) => updateField("fieldOfStudy", e.target.value)}
                placeholder="Computer Science"
              />

              {experienceLevels.length ? (
                <SelectField
                  label="Experience"
                  value={form.experienceLevel}
                  onChange={(e) => updateField("experienceLevel", e.target.value)}
                  error={errors.experienceLevel}
                >
                  <option value="" className="bg-[#111827] text-white">
                    Select
                  </option>
                  {experienceLevels.map((level) => (
                    <option
                      key={level.value}
                      value={level.value}
                      className="bg-[#111827] text-white"
                    >
                      {level.label}
                    </option>
                  ))}
                </SelectField>
              ) : (
                <div className="hidden xl:block" />
              )}
            </div>

            {skills.length ? (
              <div className="mt-5 rounded-[22px] bg-white/[0.04] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <ChipToggle
                      key={skill.value}
                      item={skill}
                      selected={form.selectedSkills.includes(skill.value)}
                      onToggle={() =>
                        toggleArrayValue("selectedSkills", skill.value)
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {tools.length ? (
              <div className="mt-4 rounded-[22px] bg-white/[0.04] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Tools</p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <ChipToggle
                      key={tool.value}
                      item={tool}
                      selected={form.selectedTools.includes(tool.value)}
                      onToggle={() =>
                        toggleArrayValue("selectedTools", tool.value)
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-4 rounded-[22px] bg-white/[0.04] p-4">
              <p className="mb-3 text-sm font-semibold text-white">
                Choose a shift
              </p>

              {allShifts.length ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {allShifts.map((shift) => {
                    const active =
                      String(form.selectedShiftId) === String(shift.id);

                    return (
                      <ShiftCard
                        key={shift.id}
                        shift={shift}
                        active={active}
                        onSelect={() => updateField("selectedShiftId", shift.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-sm text-gray-400">
                  No shift has been configured for this program yet. You can
                  continue and the admin team can assign you later.
                </div>
              )}

              {errors.selectedShiftId ? (
                <p className="mt-2 text-[11px] text-rose-200">
                  {errors.selectedShiftId}
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-[22px] bg-white/[0.04] p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => updateField("agreeTerms", e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm leading-6 text-gray-300">
                    I confirm that the information provided is correct and I
                    agree to submit this application.
                  </span>
                </label>

                {errors.agreeTerms ? (
                  <p className="mt-2 text-[11px] text-rose-200">
                    {errors.agreeTerms}
                  </p>
                ) : null}

                <label className="mt-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.agreeCommunication}
                    onChange={(e) =>
                      updateField("agreeCommunication", e.target.checked)
                    }
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm leading-6 text-gray-300">
                    I agree to receive updates about my application.
                  </span>
                </label>
              </div>

              <div className="rounded-[22px] bg-yellow-400/10 p-4">
                <div className="flex items-center gap-3">
                  <MomoIcon />
                  <div>
                    <p className="text-sm font-bold text-white">Payment</p>
                    <p className="text-xs text-yellow-100/90">
                      Pay after submitting
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <SummaryLine
                    label="Price"
                    value={formatPriceRWF(normalizedProgram.price)}
                  />
                  <SummaryLine
                    label="MoMo Code"
                    value={resolvedMomoCode || "Will be shared soon"}
                  />
                  <SummaryLine
                    label="Shift"
                    value={selectedShift ? selectedShift.name : "No shift selected"}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Compact responsive single-page form
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#6050F0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          </section>
        </form>
      )}
    </ModalShell>
  );
}