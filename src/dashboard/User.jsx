import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  X,
  Trash2,
  Power,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function getToken() {
  return (
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

function getHeaders(isJson = true) {
  const token = getToken();

  return {
    ...(isJson
      ? {
          "Content-Type": "application/json",
          Accept: "application/json",
        }
      : {
          Accept: "application/json",
        }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function extractValidationErrors(result) {
  if (result?.data && typeof result.data === "object" && !Array.isArray(result.data)) {
    return result.data;
  }

  if (result?.errors && typeof result.errors === "object" && !Array.isArray(result.errors)) {
    return result.errors;
  }

  return {};
}

function getFirstValidationMessage(validation) {
  const values = Object.values(validation || {});
  for (const value of values) {
    if (Array.isArray(value) && value.length) return value[0];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(options.body ? true : false),
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validation = extractValidationErrors(result);
    const firstValidationMessage = getFirstValidationMessage(validation);

    const message =
      firstValidationMessage ||
      result?.message ||
      result?.error ||
      "Request failed.";

    const error = new Error(message);
    error.status = response.status;
    error.validation = validation;
    error.result = result;
    throw error;
  }

  return result;
}

async function getProgramOptions() {
  const endpoints = ["/users-program-options", "/programs"];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      return await apiRequest(endpoint);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Could not load programs.");
}

function normalizeRoleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "ceo") return "CEO";
  if (role === "trainer") return "Trainer";
  if (role === "student") return "Student";
  return role || "Unknown";
}

function roleBadgeClass(role) {
  if (role === "admin") return "bg-violet-500/15 text-violet-200";
  if (role === "ceo") return "bg-amber-500/15 text-amber-200";
  if (role === "trainer") return "bg-emerald-500/15 text-emerald-200";
  if (role === "student") return "bg-sky-500/15 text-sky-200";
  return "bg-white/10 text-white";
}

function statusBadgeClass(status) {
  if (status === "active") return "bg-emerald-500/15 text-emerald-200";
  if (status === "suspended") return "bg-amber-500/15 text-amber-200";
  return "bg-rose-500/15 text-rose-200";
}

function normalizePrograms(programs) {
  if (!Array.isArray(programs)) return [];
  return programs.map((program) => ({
    id: program?.id,
    name: program?.name || program?.title || "Untitled Program",
    slug: program?.slug || "",
  }));
}

function normalizeUser(item) {
  const roleSlug =
    item?.role?.slug ||
    item?.role?.name?.toLowerCase() ||
    item?.roles?.[0]?.slug ||
    item?.roles?.[0]?.name?.toLowerCase() ||
    item?.role ||
    "student";

  const nameParts = String(item?.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    id: item?.id,
    firstName: item?.first_name || nameParts[0] || "",
    lastName:
      item?.last_name ||
      (nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""),
    fullName:
      item?.name ||
      `${item?.first_name || ""} ${item?.last_name || ""}`.trim() ||
      "Unnamed User",
    email: item?.email || "",
    phone: item?.phone || "",
    role: roleSlug,
    status: item?.status || (item?.is_active ? "active" : "inactive"),
    createdAt:
      item?.created_at?.slice?.(0, 10) ||
      item?.createdAt ||
      new Date().toISOString().slice(0, 10),
    programs: normalizePrograms(item?.programs || []),
  };
}

function StatCard({ title, value, icon, note }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[26px] border border-white/10 bg-[#0d1020] p-5 shadow-[0_0_30px_rgba(96,80,240,0.10)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
          <p className="mt-2 text-xs text-white/45">{note}</p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#6050F0]/15 text-[#8d83ff]">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function Modal({ open, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0B0B14] shadow-2xl"
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function User() {
  const [users, setUsers] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "student",
    status: "active",
    programIds: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      setPageError("");

      const [usersRes, programsRes] = await Promise.all([
        apiRequest("/users"),
        getProgramOptions(),
      ]);

      const rawUsers = Array.isArray(usersRes?.data)
        ? usersRes.data
        : Array.isArray(usersRes?.data?.data)
        ? usersRes.data.data
        : Array.isArray(usersRes)
        ? usersRes
        : [];

      const rawPrograms = Array.isArray(programsRes?.data)
        ? programsRes.data
        : Array.isArray(programsRes?.data?.data)
        ? programsRes.data.data
        : Array.isArray(programsRes)
        ? programsRes
        : [];

      setUsers(rawUsers.map(normalizeUser));
      setProgramOptions(
        rawPrograms.map((program) => ({
          id: program?.id,
          name: program?.name || program?.title || "Untitled Program",
        }))
      );
    } catch (error) {
      setPageError(error.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullText =
        `${user.fullName} ${user.email} ${user.phone} ${user.programs
          .map((p) => p.name)
          .join(" ")}`.toLowerCase();

      const matchesSearch = fullText.includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ? true : user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      trainers: users.filter((u) => u.role === "trainer").length,
      students: users.filter((u) => u.role === "student").length,
    };
  }, [users]);

  function resetForm() {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "student",
      status: "active",
      programIds: [],
    });
    setErrors({});
  }

  function openCreateModal() {
    resetForm();
    setSuccessMessage("");
    setOpenModal(true);
  }

  function closeCreateModal() {
    setOpenModal(false);
    resetForm();
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "", submit: "" }));
  }

  function toggleProgram(programId) {
    setForm((prev) => {
      const exists = prev.programIds.includes(programId);

      return {
        ...prev,
        programIds: exists
          ? prev.programIds.filter((id) => id !== programId)
          : [...prev.programIds, programId],
      };
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email";
    }

    const emailExists =
      form.email.trim() &&
      users.some(
        (u) => String(u.email || "").toLowerCase() === form.email.trim().toLowerCase()
      );

    if (emailExists) {
      nextErrors.email = "This email already exists";
    }

    const phoneValue = form.phone.trim();
    const phoneExists =
      phoneValue &&
      users.some((u) => String(u.phone || "").trim() === phoneValue);

    if (phoneExists) {
      nextErrors.phone = "This phone already exists";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleCreateUser(e) {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setErrors((prev) => ({ ...prev, submit: "" }));
      setSuccessMessage("");

      const payload = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role_slug: form.role,
        status: form.status,
        program_ids: form.programIds,
      };

      const result = await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const createdUser = normalizeUser(result?.data?.user || result?.data || {});
      const emailMessage =
        result?.data?.email_setup_message ||
        result?.email_setup_message ||
        "User created successfully. Account setup email has been sent.";

      setUsers((prev) => [createdUser, ...prev]);
      closeCreateModal();
      setSuccessMessage(emailMessage);
    } catch (error) {
      const validation = error?.validation || {};
      const nextErrors = {};

      if (validation?.name?.[0]) {
        nextErrors.firstName = validation.name[0];
      }
      if (validation?.email?.[0]) {
        nextErrors.email = validation.email[0];
      }
      if (validation?.phone?.[0]) {
        nextErrors.phone = validation.phone[0];
      }
      if (validation?.role_slug?.[0]) {
        nextErrors.role = validation.role_slug[0];
      }
      if (validation?.program_ids?.[0]) {
        nextErrors.programIds = validation.program_ids[0];
      }

      nextErrors.submit = error.message || "Could not create user.";

      setErrors(nextErrors);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(id) {
    try {
      setActionLoadingId(id);

      const result = await apiRequest(`/users/${id}/toggle-status`, {
        method: "POST",
      });

      const updatedStatus =
        result?.data?.status || result?.status || result?.data?.user?.status;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                status:
                  updatedStatus ||
                  (user.status === "active" ? "inactive" : "active"),
              }
            : user
        )
      );
    } catch (error) {
      alert(error.message || "Could not update status.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function deleteUser(id) {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;

    try {
      setActionLoadingId(id);
      await apiRequest(`/users/${id}`, {
        method: "DELETE",
      });

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      alert(error.message || "Could not delete user.");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(96,80,240,0.18),rgba(10,12,22,0.96))] p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b7afff]">
                Admin Control
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                User Management
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Create, manage, activate, and assign users to programs from one clean dashboard.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#6050F0] px-5 text-sm font-bold text-white transition hover:bg-[#7567ff]"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
          </div>
        </motion.div>

        {successMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Success</p>
                <p className="mt-1">{successMessage}</p>
              </div>
            </div>
          </motion.div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.total}
            note="All registered users"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Admins"
            value={stats.admins}
            note="System administrators"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <StatCard
            title="Trainers"
            value={stats.trainers}
            note="Training staff"
            icon={<Briefcase className="h-5 w-5" />}
          />
          <StatCard
            title="Students"
            value={stats.students}
            note="Learners and applicants"
            icon={<GraduationCap className="h-5 w-5" />}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[28px] border border-white/10 bg-[#0d1020] p-4 md:p-5"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone or program..."
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#6050F0]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-[#6050F0]"
            >
              <option value="all" className="bg-[#0B0B14]">All Roles</option>
              <option value="admin" className="bg-[#0B0B14]">Admin</option>
              <option value="ceo" className="bg-[#0B0B14]">CEO</option>
              <option value="trainer" className="bg-[#0B0B14]">Trainer</option>
              <option value="student" className="bg-[#0B0B14]">Student</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-[#6050F0]"
            >
              <option value="all" className="bg-[#0B0B14]">All Status</option>
              <option value="active" className="bg-[#0B0B14]">Active</option>
              <option value="inactive" className="bg-[#0B0B14]">Inactive</option>
              <option value="suspended" className="bg-[#0B0B14]">Suspended</option>
            </select>
          </div>
        </motion.div>

        {pageError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {pageError}
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1020]"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr className="text-xs uppercase tracking-[0.18em] text-white/45">
                  <th className="px-4 py-4 font-semibold">User</th>
                  <th className="px-4 py-4 font-semibold">Contact</th>
                  <th className="px-4 py-4 font-semibold">Role</th>
                  <th className="px-4 py-4 font-semibold">Programs</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Created</th>
                  <th className="px-4 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-sm text-white/55">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length ? (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-white/6 text-sm last:border-b-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-white">{user.fullName}</p>
                          <p className="mt-1 text-xs text-white/45">ID: {user.id}</p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/75">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{user.email || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/55">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{user.phone || "-"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass(user.role)}`}>
                          {normalizeRoleLabel(user.role)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {user.programs?.length ? (
                          <div className="flex max-w-[260px] flex-wrap gap-2">
                            {user.programs.slice(0, 2).map((program) => (
                              <span
                                key={program.id}
                                className="rounded-full bg-[#6050F0]/15 px-2.5 py-1 text-xs font-semibold text-[#d8d3ff]"
                              >
                                {program.name}
                              </span>
                            ))}
                            {user.programs.length > 2 ? (
                              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/75">
                                +{user.programs.length - 2} more
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-white/40">No program</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-white/70">{user.createdAt}</td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleStatus(user.id)}
                            disabled={actionLoadingId === user.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-white transition hover:bg-[#6050F0] disabled:opacity-50"
                            title="Toggle status"
                          >
                            <Power className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteUser(user.id)}
                            disabled={actionLoadingId === user.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-white transition hover:bg-rose-500 disabled:opacity-50"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-sm text-white/55">
                      No users found for the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Modal open={openModal}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#b7afff]">
              Create Platform User
            </p>
            <h2 className="mt-1 text-xl font-black text-white">New User</h2>
          </div>

          <button
            type="button"
            onClick={closeCreateModal}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleCreateUser} className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
          <div className="mb-4 rounded-2xl border border-[#6050F0]/25 bg-[#6050F0]/10 px-4 py-3 text-sm text-[#e5e1ff]">
            A secure setup email with password reset link will be sent to this user's email.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FieldBlock
              label="First Name"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              error={errors.firstName}
              placeholder="John"
            />

            <FieldBlock
              label="Last Name"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              error={errors.lastName}
              placeholder="Doe"
            />

            <FieldBlock
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              error={errors.email}
              placeholder="john@example.com"
            />

            <FieldBlock
              label="Phone (optional)"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              error={errors.phone}
              placeholder="+2507..."
            />

            <SelectBlock
              label="Role"
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
            >
              <option value="admin" className="bg-[#0B0B14]">Admin</option>
              <option value="ceo" className="bg-[#0B0B14]">CEO</option>
              <option value="trainer" className="bg-[#0B0B14]">Trainer</option>
              <option value="student" className="bg-[#0B0B14]">Student</option>
            </SelectBlock>

            <SelectBlock
              label="Status"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option value="active" className="bg-[#0B0B14]">Active</option>
              <option value="inactive" className="bg-[#0B0B14]">Inactive</option>
              <option value="suspended" className="bg-[#0B0B14]">Suspended</option>
            </SelectBlock>

            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <BookOpen className="h-4 w-4" />
                Assign Program(s)
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                {programOptions.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {programOptions.map((program) => {
                      const checked = form.programIds.includes(program.id);

                      return (
                        <label
                          key={program.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                            checked
                              ? "border-[#6050F0] bg-[#6050F0]/10 text-white"
                              : "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProgram(program.id)}
                            className="h-4 w-4 rounded border-white/20 bg-transparent"
                          />
                          <span className="truncate">{program.name}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-white/50">No programs available.</p>
                )}
              </div>
            </div>
          </div>

          {errors.submit ? (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {errors.submit}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-2xl bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#6050F0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7567ff] disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FieldBlock({ label, error, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        {...props}
        className={`h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#6050F0] ${
          error ? "border-rose-400/70" : ""
        }`}
      />
      {error ? <p className="mt-1 text-xs text-rose-200">{error}</p> : null}
    </div>
  );
}

function SelectBlock({ label, children, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </label>
      <select
        {...props}
        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[#6050F0]"
      >
        {children}
      </select>
    </div>
  );
}