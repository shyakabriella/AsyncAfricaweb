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
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all");
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
    setApplicationStatusFilter("all");
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
        (item) => [item?.trainer?.name, item?.trainer?.email, item?.status],
        (item) => item?.attendance_date || item?.created_at
      ),
    [data.trainerAttendances, filters]
  );

  const applicationProgramGroups = useMemo(
    () => groupApplicationsByProgram(filteredApplications, data.programs),
    [filteredApplications, data.programs]
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

    const trainerPaid = filteredTrainerAttendances.filter((item) =>
      Boolean(item?.is_paid)
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
        items: applicationProgramGroups,
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
    applicationProgramGroups,
  ]);

  const currentSection = reportSections.find(
    (section) => section.key === activeSection
  );

  const applicationStatuses = useMemo(() => {
    if (activeSection !== "applications" || !selectedItem?.applications) {
      return ["all"];
    }

    return [
      "all",
      ...new Set(
        selectedItem.applications
          .map((item) => normalizeStatus(item?.status))
          .filter(Boolean)
      ),
    ];
  }, [activeSection, selectedItem]);

  const filteredProgramApplications = useMemo(() => {
    if (activeSection !== "applications" || !selectedItem?.applications) return [];

    if (applicationStatusFilter === "all") {
      return selectedItem.applications;
    }

    return selectedItem.applications.filter(
      (item) => normalizeStatus(item?.status) === applicationStatusFilter
    );
  }, [activeSection, selectedItem, applicationStatusFilter]);

  const exportPdf = () => {
    window.print();
  };

  const selectedProgramStats = useMemo(() => {
    if (activeSection !== "applications" || !selectedItem) {
      return {
        price: 0,
        total: 0,
        acceptedCount: 0,
        totalEarned: 0,
      };
    }

    const acceptedCount = toNumber(selectedItem?.statusCounts?.accepted || 0);
    const price = toNumber(selectedItem?.price || 0);

    return {
      price,
      total: toNumber(selectedItem?.count || 0),
      acceptedCount,
      totalEarned: acceptedCount * price,
    };
  }, [activeSection, selectedItem]);

  return (
    <div className="space-y-6 bg-white print:space-y-0">
      <div className="space-y-6 print:hidden">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                AsyncAfrica Report Center
              </p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Reports & Analytics
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Open each report as a card, then open deeper details.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadReport}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              {activeSection === "applications" && selectedItem ? (
                <button
                  type="button"
                  onClick={exportPdf}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </button>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
              className={`rounded-3xl border p-5 text-left shadow-sm transition ${
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

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {currentSection?.title || "Report Details"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {activeSection === "applications" && !selectedItem
                    ? "Click one program card to open the application table."
                    : !selectedItem
                    ? "Click one card below to open full details."
                    : "Detailed opened report information."}
                </p>
              </div>

              {selectedItem ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null);
                    setApplicationStatusFilter("all");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
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
            ) : activeSection === "applications" ? (
              <ApplicationProgramDetail
                group={selectedItem}
                statusFilter={applicationStatusFilter}
                setStatusFilter={setApplicationStatusFilter}
                statuses={applicationStatuses}
                rows={filteredProgramApplications}
                onExport={exportPdf}
                stats={selectedProgramStats}
              />
            ) : (
              <OpenedReport sectionKey={activeSection} item={selectedItem} />
            )}
          </div>
        </div>
      </div>

      {activeSection === "applications" && selectedItem ? (
        <div className="hidden bg-white text-slate-900 print:block">
          <div className="mx-auto w-full max-w-[794px] bg-white px-8 py-8">
            <div className="border-b border-slate-300 pb-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                AsyncAfrica Applications Report
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                {selectedItem?.title || "Program Applications"}
              </h1>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="rounded-xl border border-slate-300 px-3 py-2">
                  <span className="font-semibold">Program Fee:</span>{" "}
                  {formatMoney(selectedProgramStats.price)}
                </div>
                <div className="rounded-xl border border-slate-300 px-3 py-2">
                  <span className="font-semibold">Accepted Students:</span>{" "}
                  {formatNumber(selectedProgramStats.acceptedCount)}
                </div>
                <div className="rounded-xl border border-slate-300 px-3 py-2">
                  <span className="font-semibold">Total Earned:</span>{" "}
                  {formatMoney(selectedProgramStats.totalEarned)}
                </div>
                <div className="rounded-xl border border-slate-300 px-3 py-2">
                  <span className="font-semibold">Status Filter:</span>{" "}
                  {applicationStatusFilter === "all"
                    ? "All"
                    : formatStatusLabel(applicationStatusFilter)}
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-600">
                Printed: <strong>{new Date().toLocaleDateString()}</strong>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-none border border-slate-300">
              <table className="w-full border-collapse text-left text-[11px] text-slate-800">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border border-slate-300 px-2 py-2 font-bold">#</th>
                    <th className="border border-slate-300 px-2 py-2 font-bold">
                      Applicant
                    </th>
                    <th className="border border-slate-300 px-2 py-2 font-bold">
                      Email
                    </th>
                    <th className="border border-slate-300 px-2 py-2 font-bold">
                      Phone
                    </th>
                    <th className="border border-slate-300 px-2 py-2 font-bold">
                      Country
                    </th>
                    <th className="border border-slate-300 px-2 py-2 font-bold">
                      City
                    </th>
                    <th className="border border-slate-300 px-2 py-2 font-bold">
                      Status
                    </th>
                    <th className="border border-slate-300 px-2 py-2 font-bold">
                      Submitted
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProgramApplications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="border border-slate-300 px-2 py-6 text-center"
                      >
                        No applications found for this status.
                      </td>
                    </tr>
                  ) : (
                    filteredProgramApplications.map((item, index) => {
                      const firstName =
                        item?.first_name || item?.applicant?.first_name || "";
                      const lastName =
                        item?.last_name || item?.applicant?.last_name || "";
                      const fullName = `${firstName} ${lastName}`.trim();

                      return (
                        <tr key={item?.id || index} className="align-top">
                          <td className="border border-slate-300 px-2 py-2">
                            {index + 1}
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            {fullName || "-"}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 break-words">
                            {item?.email || item?.applicant?.email || "-"}
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            {item?.phone || item?.applicant?.phone || "-"}
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            {item?.country || item?.applicant?.country || "-"}
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            {item?.city || item?.applicant?.city || "-"}
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            {item?.status || "-"}
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            {formatDate(item?.submitted_at || item?.created_at)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
      {items.map((item, index) => (
        <button
          key={`${sectionKey}-${item?.id || item?.key || index}`}
          type="button"
          onClick={() => onSelect(item)}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          {sectionKey === "programs" && <ProgramCard item={item} />}
          {sectionKey === "applications" && (
            <ApplicationProgramCard item={item} />
          )}
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

function ApplicationProgramCard({ item }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {item?.title || "Unknown Program"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatNumber(item?.count || 0)} applications
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
          Program
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Fee" value={formatMoney(item?.price || 0)} />
        <MiniMetric label="Accepted" value={item?.statusCounts?.accepted || 0} />
        <MiniMetric label="Earned" value={formatMoney(item?.totalEarned || 0)} />
        <MiniMetric label="Pending" value={item?.statusCounts?.pending || 0} />
      </div>

      <p className="text-xs font-medium text-indigo-600">
        Click to open application table
      </p>
    </div>
  );
}

function ApplicationProgramDetail({
  group,
  statusFilter,
  setStatusFilter,
  statuses,
  rows,
  onExport,
  stats,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {group?.title || "Program Applications"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Applications table for this program
            </p>
          </div>

          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <DetailMetric label="Program Fee" value={formatMoney(stats.price)} />
          <DetailMetric label="All Students" value={formatNumber(stats.total)} />
          <DetailMetric
            label="Accepted Students"
            value={formatNumber(stats.acceptedCount)}
          />
          <DetailMetric
            label="Total Earned"
            value={formatMoney(stats.totalEarned)}
          />
          <DetailMetric label="Pending" value={group?.statusCounts?.pending || 0} />
          <DetailMetric label="Rejected" value={group?.statusCounts?.rejected || 0} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        {statuses.map((status) => {
          const count =
            status === "all"
              ? toNumber(group?.count || 0)
              : toNumber(group?.statusCounts?.[status] || 0);

          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                statusFilter === status
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status === "all" ? "All" : formatStatusLabel(status)} ({formatNumber(count)})
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white print:hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-5 py-4 font-bold">#</th>
              <th className="px-5 py-4 font-bold">Applicant</th>
              <th className="px-5 py-4 font-bold">Email</th>
              <th className="px-5 py-4 font-bold">Phone</th>
              <th className="px-5 py-4 font-bold">Country</th>
              <th className="px-5 py-4 font-bold">City</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Submitted</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No applications found for this status.
                </td>
              </tr>
            ) : (
              rows.map((item, index) => {
                const firstName =
                  item?.first_name || item?.applicant?.first_name || "";
                const lastName =
                  item?.last_name || item?.applicant?.last_name || "";
                const fullName = `${firstName} ${lastName}`.trim();

                return (
                  <tr key={item?.id || index}>
                    <td className="px-5 py-4 text-slate-600">{index + 1}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {fullName || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item?.email || item?.applicant?.email || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item?.phone || item?.applicant?.phone || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item?.country || item?.applicant?.country || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item?.city || item?.applicant?.city || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill label={item?.status || "Unknown"} />
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {formatDate(item?.submitted_at || item?.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
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

function groupApplicationsByProgram(applications, programs) {
  const programLookup = createProgramLookup(programs);
  const map = new Map();

  applications.forEach((item) => {
    const rawId =
      item?.program_id ||
      item?.program?.id ||
      item?.program_slug ||
      item?.program?.slug ||
      item?.program_title ||
      item?.program?.title ||
      item?.program?.name ||
      "unknown-program";

    const title =
      item?.program_title ||
      item?.program?.title ||
      item?.program?.name ||
      "Unknown Program";

    const key = String(rawId);

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        key,
        title,
        count: 0,
        applications: [],
        statusCounts: {},
        price: 0,
        totalEarned: 0,
      });
    }

    const group = map.get(key);
    const status = normalizeStatus(item?.status || "unknown");

    group.count += 1;
    group.applications.push(item);
    group.statusCounts[status] = (group.statusCounts[status] || 0) + 1;
  });

  const groups = Array.from(map.values()).map((group) => {
    const matchedProgram =
      programLookup.byId.get(String(group.id)) ||
      programLookup.bySlug.get(String(group.id).toLowerCase()) ||
      programLookup.byTitle.get(normalizeText(group.title));

    const price = toNumber(matchedProgram?.price || 0);
    const acceptedCount = toNumber(group?.statusCounts?.accepted || 0);

    return {
      ...group,
      price,
      acceptedCount,
      totalEarned: acceptedCount * price,
    };
  });

  return groups.sort((a, b) => a.title.localeCompare(b.title));
}

function createProgramLookup(programs) {
  const byId = new Map();
  const bySlug = new Map();
  const byTitle = new Map();

  programs.forEach((program) => {
    if (program?.id !== undefined && program?.id !== null) {
      byId.set(String(program.id), program);
    }

    if (program?.slug) {
      bySlug.set(String(program.slug).toLowerCase(), program);
    }

    const names = [program?.name, program?.title, program?.program_title];
    names.filter(Boolean).forEach((name) => {
      byTitle.set(normalizeText(name), program);
    });
  });

  return { byId, bySlug, byTitle };
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function formatStatusLabel(status) {
  if (!status) return "-";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(toNumber(value));
}

function formatMoney(value, currency = "RWF") {
  return `${formatNumber(value)} ${currency}`;
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