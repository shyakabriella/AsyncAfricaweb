import { useEffect, useState } from "react";
import { formatMoney } from "../../services/internshipApi";

function SmallInput({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </label>
      <input
        {...props}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
      />
    </div>
  );
}

function SmallSelect({ label, children, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </label>
      <select
        {...props}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#6050F0]"
      >
        {children}
      </select>
    </div>
  );
}

const initialForm = {
  title: "",
  slug: "",
  duration: "",
  level: "",
  format: "",
  category: "",
  price: "",
  status: "Active",
};

export default function ProgramManagerCard({
  programs,
  selectedProgramId,
  onSelectProgram,
  onCreateProgram,
  onUpdateProgram,
  onDeleteProgram,
  loading,
  saving,
  deletingId,
}) {
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!editingProgramId) {
      setForm(initialForm);
      return;
    }

    const current = programs.find((item) => String(item.id) === String(editingProgramId));
    if (!current) return;

    setForm({
      title: current.title || "",
      slug: current.slug === "-" ? "" : current.slug || "",
      duration: current.duration === "-" ? "" : current.duration || "",
      level: current.level === "-" ? "" : current.level || "",
      format: current.format === "-" ? "" : current.format || "",
      category: current.category === "-" ? "" : current.category || "",
      price: current.price || "",
      status: current.status || "Active",
    });
  }, [editingProgramId, programs]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || null,
      duration: form.duration.trim() || null,
      level: form.level.trim() || null,
      format: form.format.trim() || null,
      category: form.category.trim() || null,
      price: form.price === "" ? null : Number(form.price),
      status: form.status,
    };

    if (!payload.title) return;

    if (editingProgramId) {
      await onUpdateProgram(editingProgramId, payload);
    } else {
      await onCreateProgram(payload);
    }

    setEditingProgramId(null);
    setForm(initialForm);
  }

  function startEdit(program) {
    setEditingProgramId(program.id);
  }

  function cancelEdit() {
    setEditingProgramId(null);
    setForm(initialForm);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900">Program Manager</h3>
          <p className="mt-1 text-xs text-slate-500">
            Create, edit, select, and delete programs.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SmallInput
          label="Program Title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Software Development"
        />
        <SmallInput
          label="Slug"
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
          placeholder="software-development"
        />
        <SmallInput
          label="Duration"
          value={form.duration}
          onChange={(e) => updateField("duration", e.target.value)}
          placeholder="12 Weeks"
        />
        <SmallInput
          label="Level"
          value={form.level}
          onChange={(e) => updateField("level", e.target.value)}
          placeholder="Beginner"
        />
        <SmallInput
          label="Format"
          value={form.format}
          onChange={(e) => updateField("format", e.target.value)}
          placeholder="Online / Onsite"
        />
        <SmallInput
          label="Category"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          placeholder="Technology"
        />
        <SmallInput
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
          placeholder="30000"
        />
        <SmallSelect
          label="Status"
          value={form.status}
          onChange={(e) => updateField("status", e.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Closed">Closed</option>
        </SmallSelect>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 rounded-xl bg-[#6050F0] px-4 text-sm font-bold text-white transition hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : editingProgramId ? "Update" : "Create"}
          </button>

          {editingProgramId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <h4 className="text-sm font-bold text-slate-900">Programs</h4>
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {programs.length} record(s)
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No programs found.</div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto">
            {programs.map((program) => {
              const active = String(selectedProgramId) === String(program.id);

              return (
                <div
                  key={program.id}
                  className={`border-t border-slate-200 px-4 py-3 transition ${
                    active ? "bg-indigo-50/70" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div
                      className="cursor-pointer"
                      onClick={() => onSelectProgram(program.id)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900">
                          {program.title}
                        </h5>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {program.status}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{program.duration}</span>
                        <span>{program.level}</span>
                        <span>{program.format}</span>
                        <span>{formatMoney(program.price)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectProgram(program.id)}
                        className="rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(program)}
                        className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === program.id}
                        onClick={() => onDeleteProgram(program.id)}
                        className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === program.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}