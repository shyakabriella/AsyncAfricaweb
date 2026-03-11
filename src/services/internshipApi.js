const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function getToken() {
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

function getHeaders(includeJson = true) {
  const token = getToken();

  return {
    Accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(Boolean(options.body)),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationErrors = payload?.errors
      ? Object.values(payload.errors).flat().join("\n")
      : "";

    throw new Error(
      validationErrors
        ? `${payload?.message || "Request failed."}\n${validationErrors}`
        : payload?.message || "Request failed."
    );
  }

  return payload;
}

function safeArray(value) {
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

export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function normalizeProgram(program = {}) {
  return {
    ...program,
    id: program?.id ?? "",
    code: program?.code ?? "",
    slug: program?.slug ?? "",
    name: program?.name ?? "",
    title: program?.title ?? program?.name ?? "",
    badge: program?.badge ?? "",
    category: program?.category ?? "",
    duration: program?.duration ?? "",
    level: program?.level ?? "",
    format: program?.format ?? "",
    status: program?.status ?? "",
    instructor: program?.instructor ?? "TBA",
    students: Number(program?.students ?? 0),
    price: Number(program?.price ?? 0),
    start_date: program?.start_date ?? "",
    end_date: program?.end_date ?? "",
    image: program?.image ?? "",
    intro: program?.intro ?? "",
    description: program?.description ?? "",
    overview: program?.overview ?? "",
    icon_key: program?.icon_key ?? "",
    is_active: Boolean(program?.is_active),
    objectives: safeArray(program?.objectives),
    modules: safeArray(program?.modules),
    skills: safeArray(program?.skills),
    outcomes: safeArray(program?.outcomes),
    tools: safeArray(program?.tools),
    shifts: safeArray(program?.shifts),
    shift_summary: program?.shift_summary ?? {
      total_shifts: 0,
      total_capacity: 0,
      total_filled: 0,
      total_available_slots: 0,
      full_shifts: 0,
      has_full_shift: false,
      notification: "",
    },
  };
}

export async function getPrograms() {
  const payload = await apiRequest("/programs", {
    method: "GET",
  });

  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.map(normalizeProgram);
}

export async function getApplications() {
  const payload = await apiRequest("/applications", {
    method: "GET",
  });

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;

  return [];
}

export async function updateProgram(programId, data) {
  const payload = await apiRequest(`/programs/${programId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return normalizeProgram(payload?.data || {});
}