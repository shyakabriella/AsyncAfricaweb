import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgramModal from "./ProgramModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const emptyForm = {
  code: "",
  name: "",
  category: "",
  duration: "",
  level: "",
  format: "",
  status: "Active",
  instructor: "",
  students: "",
  startDate: "",
  endDate: "",
  image: "",
  intro: "",
  description: "",
  overview: "",
  icon_key: "",
  objectives: [],
  modules: [],
  skills: [],
  outcomes: [],
  tools: [],
};

function safeArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeProgram(item) {
  return {
    id: item.id,
    code: item.code || "",
    name: item.name || "",
    category: item.category || "",
    duration: item.duration || "",
    level: item.level || "",
    format: item.format || "",
    status: item.status || "Active",
    instructor: item.instructor || "",
    students: Number(item.students || 0),
    startDate: item.start_date || item.startDate || "",
    endDate: item.end_date || item.endDate || "",
    image: item.image || "",
    intro: item.intro || "",
    description: item.description || "",
    overview: item.overview || "",
    icon_key: item.icon_key || "",
    objectives: safeArray(item.objectives),
    modules: safeArray(item.modules),
    skills: safeArray(item.skills),
    outcomes: safeArray(item.outcomes),
    tools: safeArray(item.tools),
  };
}

function formatDateLabel(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function Program() {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const buildHeaders = () => ({
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const buildErrorMessage = (result) => {
    if (!result) return "Something went wrong.";

    if (result?.errors && typeof result.errors === "object") {
      const messages = Object.values(result.errors).flat().filter(Boolean);
      if (messages.length) return messages.join(" ");
    }

    return result?.message || result?.error || "Request failed.";
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await fetch(`${API_BASE_URL}/programs`, {
        method: "GET",
        headers: buildHeaders(),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = { message: text || "Unable to read server response." };
      }

      if (!response.ok) {
        throw new Error(buildErrorMessage(result));
      }

      const rows = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];

      setPrograms(rows.map(normalizeProgram));
    } catch (error) {
      setPageError(error.message || "Failed to load programs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const categories = useMemo(() => {
    const values = [
      ...new Set(programs.map((item) => item.category).filter(Boolean)),
    ];
    return ["All", ...values];
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return programs.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.instructor.toLowerCase().includes(keyword) ||
        item.level.toLowerCase().includes(keyword) ||
        item.format.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" ? true : item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ? true : item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [programs, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: programs.length,
      active: programs.filter((item) => item.status === "Active").length,
      draft: programs.filter((item) => item.status === "Draft").length,
      archived: programs.filter((item) => item.status === "Archived").length,
    };
  }, [programs]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (program) => {
    setEditingId(program.id);
    setFormData({
      code: program.code || "",
      name: program.name || "",
      category: program.category || "",
      duration: program.duration || "",
      level: program.level || "",
      format: program.format || "",
      status: program.status || "Active",
      instructor: program.instructor || "",
      students: String(program.students ?? ""),
      startDate: program.startDate || "",
      endDate: program.endDate || "",
      image: program.image || "",
      intro: program.intro || "",
      description: program.description || "",
      overview: program.overview || "",
      icon_key: program.icon_key || "",
      objectives: safeArray(program.objectives),
      modules: safeArray(program.modules),
      skills: safeArray(program.skills),
      outcomes: safeArray(program.outcomes),
      tools: safeArray(program.tools),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this program?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = { message: text || "Unable to read server response." };
      }

      if (!response.ok) {
        throw new Error(buildErrorMessage(result));
      }

      setPrograms((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(error.message || "Failed to delete program.");
    }
  };

  const handleSave = (savedProgram) => {
    const normalizedProgram = normalizeProgram(savedProgram);

    if (editingId) {
      setPrograms((prev) =>
        prev.map((item) => (item.id === editingId ? normalizedProgram : item))
      );
    } else {
      setPrograms((prev) => [normalizedProgram, ...prev]);
    }

    resetForm();
  };

  const openDetails = (program) => {
    navigate(`/dashboard/programs/${program.id}`, {
      state: { program },
    });
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4 overflow-hidden">
      {pageError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {pageError}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Program Management
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Manage Programs
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, edit, search and manage training programs from one place.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={fetchPrograms}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add Program
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Total Programs"
          value={stats.total}
          icon={<IconProgram />}
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={<IconActive />}
        />
        <StatCard title="Draft" value={stats.draft} icon={<IconDraft />} />
        <StatCard
          title="Archived"
          value={stats.archived}
          icon={<IconArchive />}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_0.8fr_0.8fr_auto]">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, code, instructor, level, or format"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400"
            >
              <option>All</option>
              <option>Active</option>
              <option>Draft</option>
              <option>Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setCategoryFilter("All");
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 xl:w-auto"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Registered Programs
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {filteredPrograms.length} result
              {filteredPrograms.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="text-xs font-medium text-slate-500">
            Click a row to open details
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {loading ? (
            <div className="grid h-full place-items-center text-sm font-medium text-slate-500">
              Loading programs...
            </div>
          ) : filteredPrograms.length ? (
            <div className="min-w-[1200px]">
              <div className="grid grid-cols-[1.15fr_0.7fr_0.65fr_0.65fr_0.65fr_0.55fr_0.75fr_0.8fr_0.95fr_0.75fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <div>Program</div>
                <div>Category</div>
                <div>Duration</div>
                <div>Level</div>
                <div>Format</div>
                <div>Status</div>
                <div>Instructor</div>
                <div>Students</div>
                <div>Start Date</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredPrograms.map((item) => (
                  <ProgramRow
                    key={item.id}
                    item={item}
                    onOpen={openDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-6">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                No programs found.
              </div>
            </div>
          )}
        </div>
      </div>

      <ProgramModal
        open={showModal}
        onClose={resetForm}
        onSave={handleSave}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}

function ProgramRow({ item, onOpen, onEdit, onDelete }) {
  return (
    <div
      onClick={() => onOpen(item)}
      className="grid cursor-pointer grid-cols-[1.15fr_0.7fr_0.65fr_0.65fr_0.65fr_0.55fr_0.75fr_0.8fr_0.95fr_0.75fr] gap-3 px-4 py-3 transition hover:bg-slate-50"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-slate-500">
                {getInitials(item.name)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {item.name}
            </div>
            <div className="truncate text-xs text-slate-500">{item.code}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center text-sm text-slate-700">
        {item.category || "-"}
      </div>

      <div className="flex items-center text-sm text-slate-700">
        {item.duration || "-"}
      </div>

      <div className="flex items-center text-sm text-slate-700">
        {item.level || "-"}
      </div>

      <div className="flex items-center text-sm text-slate-700">
        {item.format || "-"}
      </div>

      <div className="flex items-center">
        <StatusBadge status={item.status} />
      </div>

      <div className="flex items-center text-sm text-slate-700">
        <span className="truncate">{item.instructor || "-"}</span>
      </div>

      <div className="flex items-center text-sm font-medium text-slate-700">
        {item.students}
      </div>

      <div className="flex items-center text-sm text-slate-700">
        {formatDateLabel(item.startDate)}
      </div>

      <div
        className="flex items-center justify-end gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(item)}
          className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </div>
          <div className="mt-1.5 text-2xl font-semibold text-slate-900">
            {value}
          </div>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles =
    status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Draft"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

function IconProgram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3 2 8l10 5 8-4v6h2V8L12 3Zm-6 8.5V16l6 3 6-3v-4.5l-6 3-6-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconActive() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDraft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 17V5A2.5 2.5 0 0 1 9 2.5h8A2.5 2.5 0 0 1 19.5 5v14"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 4h18v3H3V4Zm6 8h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}