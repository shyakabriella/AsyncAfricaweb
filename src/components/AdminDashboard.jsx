export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Programs",
      value: "24",
      change: "+12%",
      note: "from last month",
      icon: <IconProgram />,
    },
    {
      title: "Internships",
      value: "18",
      change: "+4",
      note: "new this week",
      icon: <IconInternship />,
    },
    {
      title: "Reports",
      value: "126",
      change: "+9%",
      note: "from last period",
      icon: <IconReport />,
    },
    {
      title: "Active Users",
      value: "342",
      change: "+21",
      note: "this week",
      icon: <IconUsers />,
    },
  ];

  const recentRows = [
    {
      date: "Mar 06, 2026",
      code: "PRG-024",
      title: "AI Fundamentals",
      owner: "Admin Team",
      status: "Active",
    },
    {
      date: "Mar 05, 2026",
      code: "INT-011",
      title: "Frontend Internship",
      owner: "Training Office",
      status: "Pending",
    },
    {
      date: "Mar 04, 2026",
      code: "RPT-108",
      title: "Monthly Activity Report",
      owner: "Reports Unit",
      status: "Published",
    },
    {
      date: "Mar 02, 2026",
      code: "PRG-019",
      title: "Networking Essentials",
      owner: "Programs Office",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
              AsyncAfrica Admin
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Track programs, internships, reports, and overall platform
              activity from one customized dashboard.
            </p>
          </div>

          <button className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
            This Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            change={item.change}
            note={item.note}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              Performance & Activity Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Combined view of performance, category activity, and latest
              records.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Live Summary
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Program Performance
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Current performance across training activities
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <IconChart />
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="flex items-center justify-center">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[12px] border-slate-200 bg-white">
                  <div className="absolute inset-0 rounded-full border-[12px] border-transparent border-t-indigo-600 border-r-sky-500 rotate-45" />
                  <div className="text-center">
                    <div className="text-3xl font-black text-slate-900">
                      92%
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Success
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ProgressItem label="Software Development" value={92} />
                <ProgressItem label="Networking" value={78} />
                <ProgressItem label="Artificial Intelligence" value={85} />
                <ProgressItem label="Internship Placement" value={72} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Activity by Category
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Distribution across main dashboard units
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                <IconSpark />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <Bar label="Programs" value={84} />
              <Bar label="Internships" value={68} />
              <Bar label="Reports" value={74} />
              <Bar label="Users" value={58} />
              <Bar label="Settings Updates" value={45} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniInfoCard title="Best Category" value="Programs" />
              <MiniInfoCard title="Lowest Activity" value="Settings" />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              Recent Activity
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest activity from programs, internships, and reports
            </p>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-white text-slate-600">
                <tr className="text-left">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Code</th>
                  <th className="px-6 py-4 font-bold">Title</th>
                  <th className="px-6 py-4 font-bold">Owner</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {recentRows.map((row) => (
                  <Row key={row.code} {...row} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-5 md:hidden">
            {recentRows.map((row) => (
              <MobileRow key={row.code} {...row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, note, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{value}</div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
              {change}
            </span>
            <span className="text-slate-500">{note}</span>
          </div>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniInfoCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </div>
      <div className="mt-2 text-base font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function ProgressItem({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-sky-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Bar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-sky-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Row({ date, code, title, owner, status }) {
  return (
    <tr>
      <td className="px-6 py-4 text-slate-600">{date}</td>
      <td className="px-6 py-4 font-bold text-slate-900">{code}</td>
      <td className="px-6 py-4 text-slate-700">{title}</td>
      <td className="px-6 py-4 text-slate-600">{owner}</td>
      <td className="px-6 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="px-6 py-4">
        <button className="font-bold text-indigo-600 transition hover:text-indigo-800">
          View
        </button>
      </td>
    </tr>
  );
}

function MobileRow({ date, code, title, owner, status }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{code}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Date
          </div>
          <div className="mt-1 text-slate-700">{date}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Owner
          </div>
          <div className="mt-1 text-slate-700">{owner}</div>
        </div>
      </div>

      <button className="mt-4 font-bold text-indigo-600 transition hover:text-indigo-800">
        View
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles =
    status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Published"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${styles}`}
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

function IconInternship() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4h6l1 2h3a2 2 0 0 1 2 2v3H3V8a2 2 0 0 1 2-2h3l1-2Zm12 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6h6v2h6v-2h6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 1.5V9h4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 13h8M8 17h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 11a4 4 0 1 0-8 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 20c1.5-3 4.5-5 8-5s6.5 2 8 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 19V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 19V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        fill="currentColor"
      />
    </svg>
  );
}