import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_ENDPOINT ||
  "http://127.0.0.1:8000/api";

const TOKEN_KEYS = ["token", "auth_token", "access_token"];

function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) return fromLocal;

    const fromSession = sessionStorage.getItem(key);
    if (fromSession) return fromSession;
  }
  return "";
}

function extractErrorMessage(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error?.message) return error.message;

  if (error?.errors && typeof error.errors === "object") {
    const firstKey = Object.keys(error.errors)[0];
    const firstValue = error.errors[firstKey];

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return firstValue[0];
    }

    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return fallback;
}

async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw data || { message: "Request failed." };
  }

  return data;
}

function buildAgentFormData(form) {
  const fd = new FormData();

  fd.append("name", form.name || "");
  fd.append("email", form.email || "");
  fd.append("phone", form.phone || "");
  fd.append("commission_percentage", form.commission_percentage || "0");
  fd.append("status", form.status || "active");
  fd.append("is_active", form.is_active ? "1" : "0");

  if (form.image instanceof File) {
    fd.append("image", form.image);
  }

  return fd;
}

function currencyAmount(value, currency = "RWF") {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function AgentAvatar({ agent }) {
  const image =
    agent?.image_url ||
    agent?.profile?.image_url ||
    agent?.agent_profile?.image_url ||
    "";

  if (image) {
    return (
      <img
        src={image}
        alt={agent?.name || "Agent"}
        className="h-12 w-12 rounded-2xl object-cover ring-2 ring-[#ede9fe]"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
      {(agent?.name?.[0] || "A").toUpperCase()}
    </div>
  );
}

function StatCard({ label, value, subValue, accent = "violet" }) {
  const accentClasses = {
    violet: "from-violet-500 to-indigo-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    sky: "from-sky-500 to-cyan-500",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 h-2 w-20 rounded-full bg-gradient-to-r ${
          accentClasses[accent] || accentClasses.violet
        }`}
      />
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
      {subValue ? <div className="mt-1 text-sm text-slate-500">{subValue}</div> : null}
    </div>
  );
}

function AgentCard({ agent, onEdit, onToggle, onOpen, disabled }) {
  const isActive = Boolean(agent?.is_active);
  const walletCurrency = agent?.wallet?.currency || "RWF";
  const totalStudents = Number(agent?.stats?.total_students || 0);
  const totalCommission = Number(agent?.stats?.total_commission || 0);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(agent)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(agent);
        }
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-100"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <AgentAvatar agent={agent} />

          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900">
              {agent?.name || "Unnamed Agent"}
            </h3>
            <div className="mt-1 space-y-1 text-sm text-slate-600">
              <div className="truncate">{agent?.email || "No email"}</div>
              <div>{agent?.phone || "No phone"}</div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                {isActive ? "Active" : "Inactive"}
              </span>

              <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                {Number(agent?.commission_percentage || 0)}% Commission
              </span>

              <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                Click to open details
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onOpen(agent)}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            View Details
          </button>

          <button
            type="button"
            onClick={() => onEdit(agent)}
            className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onToggle(agent)}
            disabled={disabled}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
              isActive
                ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
            ].join(" ")}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Wallet Balance
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {currencyAmount(agent?.wallet?.balance || 0, walletCurrency)}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Students
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {totalStudents}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total Commission
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {currencyAmount(totalCommission, walletCurrency)}
          </div>
        </div>
      </div>
    </div>
  );
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  commission_percentage: "0",
  status: "active",
  is_active: true,
  image: null,
};

export default function AgentPage() {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingAgent, setEditingAgent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [previewUrl, setPreviewUrl] = useState("");

  const filteredAgents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;

    return agents.filter((agent) => {
      const haystack = [
        agent?.name,
        agent?.email,
        agent?.phone,
        String(agent?.commission_percentage ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [agents, search]);

  const totals = useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter((item) => item?.is_active).length;
    const totalStudents = agents.reduce(
      (sum, item) => sum + Number(item?.stats?.total_students || 0),
      0
    );
    const totalCommission = agents.reduce(
      (sum, item) => sum + Number(item?.stats?.total_commission || 0),
      0
    );

    return {
      totalAgents,
      activeAgents,
      totalStudents,
      totalCommission,
    };
  }, [agents]);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (!form.image) {
      setPreviewUrl(editingAgent?.image_url || "");
      return;
    }

    const objectUrl = URL.createObjectURL(form.image);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.image, editingAgent]);

  async function fetchAgents() {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/agents");
      setAgents(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to load agents."));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingAgent(null);
    setPreviewUrl("");
  }

  function handleChange(event) {
    const { name, value, type, checked, files } = event.target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        image: files?.[0] || null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEdit(agent) {
    setEditingAgent(agent);
    setError("");
    setMessage("");

    setForm({
      name: agent?.name || "",
      email: agent?.email || "",
      phone: agent?.phone || "",
      commission_percentage: String(agent?.commission_percentage ?? 0),
      status: agent?.status || (agent?.is_active ? "active" : "inactive"),
      is_active: Boolean(agent?.is_active),
      image: null,
    });

    setPreviewUrl(agent?.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOpen(agent) {
    if (!agent?.id) return;

    navigate(`/dashboard/agents/${agent.id}`, {
      state: { agent },
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const body = buildAgentFormData(form);

      if (editingAgent?.id) {
        body.append("_method", "PATCH");
        await apiRequest(`/agents/${editingAgent.id}`, {
          method: "POST",
          body,
        });
        setMessage("Agent updated successfully.");
      } else {
        await apiRequest("/agents", {
          method: "POST",
          body,
        });
        setMessage("Agent created successfully.");
      }

      resetForm();
      await fetchAgents();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to save agent."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(agent) {
    if (!agent?.id) return;

    setTogglingId(agent.id);
    setError("");
    setMessage("");

    const nextActive = !Boolean(agent?.is_active);

    try {
      await apiRequest(`/agents/${agent.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_active: nextActive,
          status: nextActive ? "active" : "inactive",
        }),
      });

      setMessage(
        nextActive
          ? "Agent activated successfully."
          : "Agent deactivated successfully."
      );

      await fetchAgents();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to change agent status."));
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Agent Management
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Manage all agents
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
                Create agents, update their profile, set commission percentage,
                and open each agent card to see registered students and detail
                performance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setMessage("");
                setError("");
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
            >
              New Agent
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Agents"
            value={totals.totalAgents}
            accent="violet"
          />
          <StatCard
            label="Active Agents"
            value={totals.activeAgents}
            accent="emerald"
          />
          <StatCard
            label="Students Referred"
            value={totals.totalStudents}
            accent="sky"
          />
          <StatCard
            label="Total Commission"
            value={currencyAmount(totals.totalCommission, "RWF")}
            accent="amber"
          />
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editingAgent ? "Edit Agent" : "Add New Agent"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill the agent information below.
                </p>
              </div>

              {editingAgent ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-3xl bg-slate-100">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Agent preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-400">
                      {(form.name?.[0] || "A").toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Agent Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-violet-700"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="agent@email.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+250..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Commission %
                  </label>
                  <input
                    name="commission_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.commission_percentage}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Agent account is active
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editingAgent
                  ? "Update Agent"
                  : "Create Agent"}
              </button>
            </form>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  All Agents
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Click an agent card to open the registered students page.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="min-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />

                <button
                  type="button"
                  onClick={fetchAgents}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="h-5 w-40 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-56 rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-32 rounded bg-slate-200" />
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="h-20 rounded-2xl bg-slate-200" />
                      <div className="h-20 rounded-2xl bg-slate-200" />
                      <div className="h-20 rounded-2xl bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-600">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                      fill="currentColor"
                    />
                    <path
                      d="M4 20a8 8 0 0 1 16 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  No agents found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Add your first agent or change your search text.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 2xl:grid-cols-2">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="relative">
                    {togglingId === agent.id ? (
                      <div className="absolute right-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
                        Updating...
                      </div>
                    ) : null}
                    <AgentCard
                      agent={agent}
                      onEdit={handleEdit}
                      onToggle={handleToggle}
                      onOpen={handleOpen}
                      disabled={togglingId === agent.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}