import { useEffect, useMemo, useState } from "react";

/**
 * Admin Case Management Page
 * - List all incidents/cases
 * - Search + filter + status
 * - View case details (modal)
 * - Update status (demo UI)
 *
 * Later you can replace demo cases with API: GET /api/incidents, PATCH /api/incidents/:id
 */

export default function CaseManagement() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [selected, setSelected] = useState(null);

  // demo data (replace with API)
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // load demo cases
  useEffect(() => {
    setLoading(true);
    const demo = [
      {
        id: 1,
        code: "C-002",
        reporter: "Anonymous",
        type: "Domestic Violence",
        district: "Muhanga",
        channel: "USSD",
        urgency: "high",
        status: "open",
        created_at: "2025-05-05 10:15",
        description:
          "Report received via USSD. Victim is requesting immediate support and safety guidance.",
      },
      {
        id: 2,
        code: "C-004",
        reporter: "John Doe",
        type: "Child Abuse",
        district: "Bugesera",
        channel: "Mobile App",
        urgency: "medium",
        status: "pending",
        created_at: "2025-05-03 08:40",
        description:
          "Child abuse suspected. Request for follow-up visit. Awaiting assignment confirmation.",
      },
      {
        id: 3,
        code: "C-006",
        reporter: "Anonymous",
        type: "Sexual Violence",
        district: "Rusizi",
        channel: "Mobile App",
        urgency: "high",
        status: "escalated",
        created_at: "2025-05-02 21:10",
        description:
          "Severe case. Escalated to Isange. Tracking in progress.",
      },
      {
        id: 4,
        code: "C-009",
        reporter: "Jane",
        type: "Domestic Violence",
        district: "Kamonyi",
        channel: "USSD",
        urgency: "low",
        status: "closed",
        created_at: "2025-05-01 14:05",
        description:
          "Case resolved and closed after support was provided and confirmed.",
      },
    ];

    const t = setTimeout(() => {
      setCases(demo);
      setLoading(false);
    }, 350);

    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return cases.filter((c) => {
      const matchesQ =
        !term ||
        c.code.toLowerCase().includes(term) ||
        c.type.toLowerCase().includes(term) ||
        c.district.toLowerCase().includes(term) ||
        c.reporter.toLowerCase().includes(term);

      const matchesStatus = status === "all" || c.status === status;
      const matchesChannel = channel === "all" || c.channel === channel;

      return matchesQ && matchesStatus && matchesChannel;
    });
  }, [cases, q, status, channel]);

  const stats = useMemo(() => {
    const total = cases.length;
    const open = cases.filter((c) => c.status === "open").length;
    const pending = cases.filter((c) => c.status === "pending").length;
    const escalated = cases.filter((c) => c.status === "escalated").length;
    const closed = cases.filter((c) => c.status === "closed").length;
    return { total, open, pending, escalated, closed };
  }, [cases]);

  const updateStatus = (caseId, newStatus) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
    );

    // also update selected if open modal
    setSelected((prev) => (prev?.id === caseId ? { ...prev, status: newStatus } : prev));
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
            Case Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage incidents, assign follow-ups, and track case progress.
          </p>
        </div>

        <button
          className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm"
          onClick={() => alert("Next step: create new case / import from USSD")}
        >
          + New Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MiniStat label="Total" value={stats.total} />
        <MiniStat label="Open" value={stats.open} />
        <MiniStat label="Pending" value={stats.pending} />
        <MiniStat label="Escalated" value={stats.escalated} />
        <MiniStat label="Closed" value={stats.closed} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by code, type, district, reporter..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            >
              <option value="all">All</option>
              <option value="USSD">USSD</option>
              <option value="Mobile App">Mobile App</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="font-extrabold text-slate-900">Cases</div>
          <div className="text-xs text-slate-500 font-semibold">
            Showing {filtered.length} of {cases.length}
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading cases...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="text-left">
                  <th className="p-4 font-bold">Case</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">District</th>
                  <th className="p-4 font-bold">Channel</th>
                  <th className="p-4 font-bold">Urgency</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Created</th>
                  <th className="p-4 font-bold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{c.code}</div>
                      <div className="text-xs text-slate-500">{c.reporter}</div>
                    </td>
                    <td className="p-4 text-slate-700">{c.type}</td>
                    <td className="p-4 text-slate-700">{c.district}</td>
                    <td className="p-4 text-slate-700">{c.channel}</td>
                    <td className="p-4">
                      <UrgencyBadge value={c.urgency} />
                    </td>
                    <td className="p-4">
                      <StatusBadge value={c.status} />
                    </td>
                    <td className="p-4 text-slate-600">{c.created_at}</td>
                    <td className="p-4">
                      <button
                        className="text-teal-700 font-extrabold hover:underline"
                        onClick={() => setSelected(c)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 ? (
                  <tr>
                    <td className="p-6 text-slate-500" colSpan={8}>
                      No cases found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal */}
      {selected ? (
        <CaseModal
          data={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={updateStatus}
        />
      ) : null}
    </div>
  );
}

/* ---------------- Components ---------------- */

function MiniStat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function StatusBadge({ value }) {
  const map = {
    open: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    escalated: "bg-purple-50 text-purple-700 border-purple-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={[
        "px-3 py-1 rounded-full border text-xs font-extrabold capitalize",
        map[value] || "bg-slate-100 text-slate-700 border-slate-200",
      ].join(" ")}
    >
      {value}
    </span>
  );
}

function UrgencyBadge({ value }) {
  const map = {
    low: "bg-slate-100 text-slate-700 border-slate-200",
    medium: "bg-orange-50 text-orange-700 border-orange-200",
    high: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={[
        "px-3 py-1 rounded-full border text-xs font-extrabold capitalize",
        map[value] || "bg-slate-100 text-slate-700 border-slate-200",
      ].join(" ")}
    >
      {value}
    </span>
  );
}

function CaseModal({ data, onClose, onUpdateStatus }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold">Case</div>
            <div className="text-lg font-extrabold text-slate-900">{data.code}</div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 grid place-items-center font-black"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Info label="Reporter" value={data.reporter} />
            <Info label="Type" value={data.type} />
            <Info label="District" value={data.district} />
            <Info label="Channel" value={data.channel} />
            <Info label="Urgency" value={<UrgencyBadge value={data.urgency} />} />
            <Info label="Status" value={<StatusBadge value={data.status} />} />
          </div>

          <div>
            <div className="text-xs font-bold text-slate-700">Description</div>
            <div className="mt-2 text-sm text-slate-700 leading-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
              {data.description}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500 font-semibold">
              Created: {data.created_at}
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-extrabold"
                onClick={() => onUpdateStatus(data.id, "pending")}
              >
                Mark Pending
              </button>
              <button
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-extrabold"
                onClick={() => onUpdateStatus(data.id, "escalated")}
              >
                Escalate
              </button>
              <button
                className="px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-extrabold"
                onClick={() => onUpdateStatus(data.id, "closed")}
              >
                Close Case
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
