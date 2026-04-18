import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  FolderOpen,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
  ClipboardList,
  CalendarCheck2,
  BadgeDollarSign,
} from "lucide-react";
import { clearStoredAuth, getAuthState } from "../lib/auth";

const API_BASE =
  (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_APP_API_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");

export default function Report() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("programs");
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const [data, setData] = useState({
    programs: [],
    applications: [],
    agents: [],
    attendances: [],
    trainerAttendances: [],
    trainerSummary: {
      total_records: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      not_marked: 0,
      total_salary: 0,
      total_paid: 0,
      total_unpaid: 0,
    },
  });

  useEffect(() => {
    loadReport();
  }, []);

  useEffect(() => {
    setSelectedItem(null);
  }, [activeSection]);

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const [
        programsRes,
        applicationsRes,
        agentsRes,
        attendancesRes,
        trainerRes,
      ] = await Promise.all([
        apiGet("/programs"),
        apiGet("/applications?per_page=100"),
        apiGet("/agents"),
        apiGet("/attendances"),
        apiGet("/trainer-attendances"),
      ]);

      setData({
        programs: extractCollection(programsRes),
        applications: extractCollection(applicationsRes),
        agents: extractCollection(agentsRes),
        attendances: extractCollection(attendancesRes),
        trainerAttendances: extractCollection(trainerRes),
        trainerSummary: trainerRes?.summary || {
          total_records: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          not_marked: 0,
          total_salary: 0,
          total_paid: 0,
          total_unpaid: 0,
        },
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }

  const filteredPrograms = useMemo(
    () =>
      filterRows(
        data.programs,
        filters,
        (item) => [
          item?.name,
          item?.category,
          item?.status,
          item?.instructor,
        ],
        (item) => item?.created_at || item?.updated_at || item?.start_date
      ),
    [data.programs, filters]
  );

  const filteredApplications = useMemo(
    () =>
      filterRows(
        data.applications,
        filters,
        (item) => [
          item?.first_name,
          item?.last_name,
          item?.email,
          item?.status,
          item?.program_title,
          item?.program?.title,
          item?.program?.name,
        ],
        (item) => item?.submitted_at || item?.created_at
      ),
    [data.applications, filters]
  );

  const filteredAgents = useMemo(
    () =>
      filterRows(
        data.agents,
        filters,
        (item) => [item?.name, item?.email, item?.phone, item?.status],
        (item) => item?.created_at || item?.updated_at
      ),
    [data.agents, filters]
  );

  const filteredAttendances = useMemo(
    () =>
      filterRows(
        data.attendances,
        filters,
        (item) => [
          item?.status,
          item?.shift_name,
          item?.shift_ref,
          item?.program?.name,
        ],
        (item) => item?.attendance_date || item?.created_at
      ),
    [data.attendances, filters]
  );

  const filteredTrainerAttendances = useMemo(
    () =>
      filterRows(
        data.trainerAttendances,
        filters,
        (item) => [
          item?.trainer?.name,
          item?.trainer?.email,
          item?.status,
        ],
        (item) => item?.attendance_date || item?.created_at
      ),
    [data.trainerAttendances, filters]
  );

  const reportSections = useMemo(() => {
    const activePrograms = filteredPrograms.filter(
      (item) => normalizeStatus(item?.status) === "active"
    ).length;

    const pendingApplications = filteredApplications.filter(
      (item) => normalizeStatus(item?.status) === "pending"
    ).length;

    const activeAgents = filteredAgents.filter((item) => {
      if (typeof item?.is_active === "boolean") return item.is_active;
      return normalizeStatus(item?.status) === "active";
    }).length;

    const studentPresent = filteredAttendances.filter(
      (item) => normalizeStatus(item?.status) === "present"
    ).length;

    const trainerPaid = filteredTrainerAttendances.filter(
      (item) => Boolean(item?.is_paid)
    ).length;

    return [
      {
        key: "programs",
        title: "Programs Report",
        subtitle: `${activePrograms} active programs`,
        count: filteredPrograms.length,
        icon: <FolderOpen className="h-5 w-5" />,
        items: filteredPrograms,
      },
      {
        key: "applications",
        title: "Applications Report",
        subtitle: `${pendingApplications} pending applications`,
        count: filteredApplications.length,
        icon: <ClipboardList className="h-5 w-5" />,
        items: filteredApplications,
      },
      {
        key: "agents",
        title: "Agents Report",
        subtitle: `${activeAgents} active agents`,
        count: filteredAgents.length,
        icon: <Users className="h-5 w-5" />,
        items: filteredAgents,
      },
      {
        key: "attendance",
        title: "Student Attendance",
        subtitle: `${studentPresent} present records`,
        count: filteredAttendances.length,
        icon: <CalendarCheck2 className="h-5 w-5" />,
        items: filteredAttendances,
      },
      {
        key: "trainerAttendance",
        title: "Trainer Attendance",
        subtitle: `${trainerPaid} paid trainer records`,
        count: filteredTrainerAttendances.length,
        icon: <BadgeDollarSign className="h-5 w-5" />,
        items: filteredTrainerAttendances,
      },
    ];
  }, [
    filteredPrograms,
    filteredApplications,
    filteredAgents,
    filteredAttendances,
    filteredTrainerAttendances,
  ]);

  const currentSection = reportSections.find(
    (section) => section.key === activeSection
  );

  const exportPdf = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          .print-hide {
            display: none !important;
          }

          .print-root {
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="print-root space-y-6">
        <div className="print-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                AsyncAfrica Report Center
              </p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Reports & Analytics
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Open each report as a card, then click again to view detailed
                information.
              </p>
            </div>

            <div className="print-hide flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadReport}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <button
                type="button"
                onClick={exportPdf}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="print-hide print-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search report..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {reportSections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className={`print-card rounded-3xl border p-5 text-left shadow-sm transition ${
                activeSection === section.key
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                  {section.icon}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {formatNumber(section.count)}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  {section.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{section.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="print-card rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {currentSection?.title || "Report Details"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {!selectedItem
                    ? "Click one card below to open full details."
                    : "Detailed opened report information."}
                </p>
              </div>

              {selectedItem ? (
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="print-hide inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : null}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading report...
              </div>
            ) : !currentSection ? (
              <div className="py-16 text-center text-sm text-slate-500">
                No report section selected.
              </div>
            ) : !selectedItem ? (
              <SectionGrid
                sectionKey={currentSection.key}
                items={currentSection.items}
                onSelect={setSelectedItem}
              />
            ) : (
              <OpenedReport sectionKey={activeSection} item={selectedItem} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SectionGrid({ sectionKey, items, onSelect }) {
  if (!items.length) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        No data found for this report.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <button
          key={`${sectionKey}-${item?.id || Math.random()}`}
          type="button"
          onClick={() => onSelect(item)}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          {sectionKey === "programs" && <ProgramCard item={item} />}
          {sectionKey === "applications" && <ApplicationCard item={item} />}
          {sectionKey === "agents" && <AgentCard item={item} />}
          {sectionKey === "attendance" && <AttendanceCard item={item} />}
          {sectionKey === "trainerAttendance" && (
            <TrainerAttendanceCard item={item} />
          )}
        </button>
      ))}
    </div>
  );
}

function ProgramCard({ item }) {
  const totalCapacity = toNumber(item?.shift_summary?.total_capacity);
  const totalFilled = toNumber(item?.shift_summary?.total_filled);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {item?.name || "Untitled Program"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {item?.category || "No category"}
          </p>
        </div>
        <StatusPill label={item?.status || "Unknown"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Students" value={item?.students ?? item?.users_count ?? 0} />
        <MiniMetric
          label="Slots"
          value={`${formatNumber(totalFilled)}/${formatNumber(totalCapacity)}`}
        />
      </div>

      <p className="text-xs font-medium text-indigo-600">
        Click to open program report
      </p>
    </div>
  );
}

function ApplicationCard({ item }) {
  const fullName = `${item?.first_name || item?.applicant?.first_name || ""} ${
    item?.last_name || item?.applicant?.last_name || ""
  }`.trim();

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {fullName || "Applicant"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {item?.program_title || item?.program?.title || item?.program?.name || "-"}
          </p>
        </div>
        <StatusPill label={item?.status || "Unknown"} />
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
        <div>{item?.email || item?.applicant?.email || "-"}</div>
        <div>{formatDate(item?.submitted_at || item?.created_at)}</div>
      </div>

      <p className="text-xs font-medium text-indigo-600">
        Click to open application report
      </p>
    </div>
  );
}

function AgentCard({ item }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {item?.name || "Agent"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{item?.email || "-"}</p>
        </div>
        <StatusPill label={item?.status || (item?.is_active ? "active" : "inactive")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Students" value={item?.stats?.total_students || 0} />
        <MiniMetric
          label="Commission"
          value={`${formatNumber(item?.stats?.total_commission || 0)} RWF`}
        />
      </div>

      <p className="text-xs font-medium text-indigo-600">
        Click to open agent report
      </p>
    </div>
  );
}

function AttendanceCard({ item }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {item?.program?.name || "Attendance Record"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(item?.attendance_date || item?.created_at)}
          </p>
        </div>
        <StatusPill label={item?.status || "Unknown"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Shift" value={item?.shift_name || item?.shift_ref || "-"} />
        <MiniMetric label="Note" value={item?.note || "-"} />
      </div>

      <p className="text-xs font-medium text-indigo-600">
        Click to open attendance report
      </p>
    </div>
  );
}

function TrainerAttendanceCard({ item }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {item?.trainer?.name || "Trainer"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(item?.attendance_date || item?.created_at)}
          </p>
        </div>
        <StatusPill label={item?.is_paid ? "Paid" : item?.status || "Unknown"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniMetric
          label="Salary"
          value={`${formatNumber(item?.salary_amount || 0)} RWF`}
        />
        <MiniMetric label="Status" value={item?.status || "-"} />
      </div>

      <p className="text-xs font-medium text-indigo-600">
        Click to open trainer report
      </p>
    </div>
  );
}

function OpenedReport({ sectionKey, item }) {
  if (sectionKey === "programs") {
    const totalCapacity = toNumber(item?.shift_summary?.total_capacity);
    const totalFilled = toNumber(item?.shift_summary?.total_filled);
    const fullShifts = toNumber(item?.shift_summary?.full_shifts);

    return (
      <DetailedWrap title={item?.name || "Program Report"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailMetric label="Category" value={item?.category || "-"} />
          <DetailMetric label="Status" value={item?.status || "-"} />
          <DetailMetric label="Instructor" value={item?.instructor || "-"} />
          <DetailMetric label="Students" value={item?.students ?? item?.users_count ?? 0} />
          <DetailMetric label="Capacity" value={formatNumber(totalCapacity)} />
          <DetailMetric label="Filled" value={formatNumber(totalFilled)} />
          <DetailMetric label="Full Shifts" value={formatNumber(fullShifts)} />
          <DetailMetric label="Price" value={item?.price ? `${formatNumber(item.price)} RWF` : "-"} />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-base font-extrabold text-slate-900">
            Program Overview
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {item?.overview || item?.intro || item?.description || "No description available."}
          </p>
        </div>
      </DetailedWrap>
    );
  }

  if (sectionKey === "applications") {
    const fullName = `${item?.first_name || item?.applicant?.first_name || ""} ${
      item?.last_name || item?.applicant?.last_name || ""
    }`.trim();

    return (
      <DetailedWrap title={fullName || "Application Report"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailMetric label="Program" value={item?.program_title || item?.program?.title || item?.program?.name || "-"} />
          <DetailMetric label="Status" value={item?.status || "-"} />
          <DetailMetric label="Email" value={item?.email || item?.applicant?.email || "-"} />
          <DetailMetric label="Phone" value={item?.phone || item?.applicant?.phone || "-"} />
          <DetailMetric label="Country" value={item?.country || item?.applicant?.country || "-"} />
          <DetailMetric label="City" value={item?.city || item?.applicant?.city || "-"} />
          <DetailMetric label="Experience" value={item?.experience_level || "-"} />
          <DetailMetric label="Submitted" value={formatDate(item?.submitted_at || item?.created_at)} />
        </div>
      </DetailedWrap>
    );
  }

  if (sectionKey === "agents") {
    return (
      <DetailedWrap title={item?.name || "Agent Report"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailMetric label="Email" value={item?.email || "-"} />
          <DetailMetric label="Phone" value={item?.phone || "-"} />
          <DetailMetric label="Status" value={item?.status || (item?.is_active ? "active" : "inactive")} />
          <DetailMetric label="Students" value={item?.stats?.total_students || 0} />
          <DetailMetric label="Paid Students" value={item?.stats?.paid_students || 0} />
          <DetailMetric label="Not Paid Students" value={item?.stats?.not_paid_students || 0} />
          <DetailMetric
            label="Commission"
            value={`${formatNumber(item?.stats?.total_commission || 0)} RWF`}
          />
          <DetailMetric
            label="Expected"
            value={`${formatNumber(item?.stats?.expected_commission || 0)} RWF`}
          />
        </div>
      </DetailedWrap>
    );
  }

  if (sectionKey === "attendance") {
    return (
      <DetailedWrap title={item?.program?.name || "Attendance Report"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailMetric label="Date" value={formatDate(item?.attendance_date || item?.created_at)} />
          <DetailMetric label="Status" value={item?.status || "-"} />
          <DetailMetric label="Shift Name" value={item?.shift_name || "-"} />
          <DetailMetric label="Shift Ref" value={item?.shift_ref || "-"} />
          <DetailMetric label="Program" value={item?.program?.name || "-"} />
          <DetailMetric label="Marked By" value={item?.markedByUser?.name || item?.marked_by_user?.name || "-"} />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-base font-extrabold text-slate-900">Note</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {item?.note || "No note added."}
          </p>
        </div>
      </DetailedWrap>
    );
  }

  if (sectionKey === "trainerAttendance") {
    return (
      <DetailedWrap title={item?.trainer?.name || "Trainer Report"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailMetric label="Trainer" value={item?.trainer?.name || "-"} />
          <DetailMetric label="Email" value={item?.trainer?.email || "-"} />
          <DetailMetric label="Date" value={formatDate(item?.attendance_date || item?.created_at)} />
          <DetailMetric label="Status" value={item?.status || "-"} />
          <DetailMetric label="Daily Rate" value={`${formatNumber(item?.daily_rate || 0)} RWF`} />
          <DetailMetric label="Salary" value={`${formatNumber(item?.salary_amount || 0)} RWF`} />
          <DetailMetric label="Paid" value={item?.is_paid ? "Yes" : "No"} />
          <DetailMetric label="Phone" value={item?.trainer?.phone || "-"} />
        </div>
      </DetailedWrap>
    );
  }

  return null;
}

function DetailedWrap({ title, children }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">Opened detailed report view</p>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 truncate text-sm font-bold text-slate-900">
        {String(value || "-")}
      </div>
    </div>
  );
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-900">
        {String(value || "-")}
      </div>
    </div>
  );
}

function StatusPill({ label }) {
  const status = normalizeStatus(label);

  let styles = "bg-slate-100 text-slate-700";

  if (["active", "accepted", "present", "paid", "reviewed"].includes(status)) {
    styles = "bg-emerald-100 text-emerald-700";
  } else if (["pending", "late", "draft", "not paid", "not_paid"].includes(status)) {
    styles = "bg-amber-100 text-amber-700";
  } else if (["rejected", "inactive", "absent", "quit"].includes(status)) {
    styles = "bg-rose-100 text-rose-700";
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles}`}>
      {label}
    </span>
  );
}

async function apiGet(path) {
  const { token } =
    typeof window !== "undefined"
      ? getAuthState()
      : { token: "" };

  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await response.text();
  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = { message: text || "Unable to parse server response." };
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      clearStoredAuth();
    }
    throw new Error(result?.message || "Unauthenticated.");
  }

  if (!response.ok) {
    throw new Error(result?.message || "Request failed.");
  }

  return result;
}

function extractCollection(payload) {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function filterRows(rows, filters, getFields, getDate) {
  const search = (filters.search || "").trim().toLowerCase();
  const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
  const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;

  return rows.filter((row) => {
    const text = getFields(row).filter(Boolean).join(" ").toLowerCase();
    const rowDateValue = getDate(row);
    const rowDate = rowDateValue ? new Date(rowDateValue) : null;

    const matchesSearch = !search || text.includes(search);
    const matchesFrom = !from || !rowDate || rowDate >= from;
    const matchesTo = !to || !rowDate || rowDate <= to;

    return matchesSearch && matchesFrom && matchesTo;
  });
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(toNumber(value));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}