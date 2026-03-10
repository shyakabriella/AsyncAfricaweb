import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function ProgramModal({
  open,
  onClose,
  onSave,
  editingId,
  formData,
  setFormData,
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose, loading]);

  if (!open) return null;

  const sanitizePrice = (value) => {
    const cleaned = String(value || "")
      .replace(/[^\d.]/g, "")
      .replace(/(\..*?)\..*/g, "$1");

    const [whole, decimal] = cleaned.split(".");
    if (decimal !== undefined) {
      return `${whole}.${decimal.slice(0, 2)}`;
    }

    return whole;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;

    if (name === "students") {
      nextValue = value.replace(/\D/g, "");
    }

    if (name === "price") {
      nextValue = sanitizePrice(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (error) setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result || "",
      }));
    };
    reader.readAsDataURL(file);

    if (error) setError("");
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));

    if (error) setError("");
  };

  const buildErrorMessage = (result) => {
    if (!result) return "Something went wrong.";

    if (result?.errors && typeof result.errors === "object") {
      const messages = Object.values(result.errors)
        .flat()
        .filter(Boolean);

      if (messages.length) {
        return messages.join(" ");
      }
    }

    return result?.message || result?.error || "Request failed.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.category ||
      !formData.duration ||
      !formData.instructor ||
      !formData.startDate ||
      !formData.endDate ||
      formData.price === undefined ||
      formData.price === null ||
      formData.price === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Price cannot be negative.");
      return;
    }

    if (formData.endDate < formData.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      duration: formData.duration,
      level: formData.level || "",
      format: formData.format || "",
      status: formData.status || "Active",
      instructor: formData.instructor,
      students: Number(formData.students || 0),
      price: Number(formData.price || 0),
      start_date: formData.startDate,
      end_date: formData.endDate,
      image: formData.image || "",
      intro: formData.intro || "",
      description: formData.description || "",
      overview: formData.overview || "",
      icon_key: formData.icon_key || "",
      objectives: formData.objectives || [],
      modules: formData.modules || [],
    };

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const url = editingId
      ? `${API_BASE_URL}/programs/${editingId}`
      : `${API_BASE_URL}/programs`;

    const method = editingId ? "PUT" : "POST";

    try {
      setLoading(true);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
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

      const savedProgram = result?.data || result;

      if (onSave) {
        onSave(savedProgram);
      }

      onClose();
    } catch (err) {
      setError(err.message || "Failed to save program.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div
        onClick={!loading ? onClose : undefined}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      <div className="relative z-10 flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {editingId ? "Edit Program" : "Add New Program"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Fill the program information below.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {!editingId ? (
              <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-3.5 py-3 text-sm font-medium text-indigo-700">
                Program code will be generated automatically from the program
                name and year.
              </div>
            ) : null}

            {editingId && formData.code ? (
              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700">
                Current Program Code:{" "}
                <span className="font-bold">{formData.code}</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[240px_1fr]">
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Program Image
                  </label>

                  <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Program preview"
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center px-4 text-center text-sm text-slate-400">
                        Upload a program image
                      </div>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {formData.image ? (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove Image
                  </button>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Basic Information
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Field
                      label="Program Name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      placeholder="Cloud Computing"
                      disabled={loading}
                    />

                    <Field
                      label="Category"
                      name="category"
                      value={formData.category || ""}
                      onChange={handleChange}
                      placeholder="Technology"
                      disabled={loading}
                    />

                    <Field
                      label="Duration"
                      name="duration"
                      value={formData.duration || ""}
                      onChange={handleChange}
                      placeholder="10 Weeks"
                      disabled={loading}
                    />

                    <Field
                      label="Level"
                      name="level"
                      value={formData.level || ""}
                      onChange={handleChange}
                      placeholder="Beginner"
                      disabled={loading}
                    />

                    <Field
                      label="Format"
                      name="format"
                      value={formData.format || ""}
                      onChange={handleChange}
                      placeholder="Online / Hybrid"
                      disabled={loading}
                    />

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status || "Active"}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option>Active</option>
                        <option>Draft</option>
                        <option>Archived</option>
                      </select>
                    </div>

                    <Field
                      label="Instructor"
                      name="instructor"
                      value={formData.instructor || ""}
                      onChange={handleChange}
                      placeholder="Instructor name"
                      disabled={loading}
                    />

                    <Field
                      label="Students"
                      name="students"
                      type="number"
                      min="0"
                      value={formData.students || ""}
                      onChange={handleChange}
                      placeholder="35"
                      disabled={loading}
                    />

                    <Field
                      label="Price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price || ""}
                      onChange={handleChange}
                      placeholder="50000"
                      disabled={loading}
                    />

                    <Field
                      label="Icon Key"
                      name="icon_key"
                      value={formData.icon_key || ""}
                      onChange={handleChange}
                      placeholder="code, shield"
                      disabled={loading}
                    />

                    <DateField
                      label="Start Date"
                      name="startDate"
                      value={formData.startDate || ""}
                      onChange={handleChange}
                      disabled={loading}
                    />

                    <DateField
                      label="End Date"
                      name="endDate"
                      value={formData.endDate || ""}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Content
                  </div>

                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    <TextAreaField
                      label="Intro"
                      name="intro"
                      value={formData.intro || ""}
                      onChange={handleChange}
                      placeholder="Short intro about the program"
                      rows={3}
                      disabled={loading}
                    />

                    <TextAreaField
                      label="Description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      placeholder="Program description"
                      rows={3}
                      disabled={loading}
                    />

                    <div className="xl:col-span-2">
                      <TextAreaField
                        label="Overview"
                        name="overview"
                        value={formData.overview || ""}
                        onChange={handleChange}
                        placeholder="Detailed overview"
                        rows={4}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                  ? "Update Program"
                  : "Save Program"}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function DateField({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type="date"
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}