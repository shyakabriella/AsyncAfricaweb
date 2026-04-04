import { useMemo, useState } from "react";

function parseStoredUser(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function getStoredUser() {
  const localUser = parseStoredUser(localStorage.getItem("user"));
  const sessionUser = parseStoredUser(sessionStorage.getItem("user"));
  const localAuthUser = parseStoredUser(localStorage.getItem("auth_user"));
  const sessionAuthUser = parseStoredUser(sessionStorage.getItem("auth_user"));

  if (localUser && Object.keys(localUser).length > 0) return localUser;
  if (sessionUser && Object.keys(sessionUser).length > 0) return sessionUser;
  if (localAuthUser && Object.keys(localAuthUser).length > 0) return localAuthUser;
  if (sessionAuthUser && Object.keys(sessionAuthUser).length > 0) return sessionAuthUser;

  return {};
}

function ProgressBar({ value, colorClass = "bg-indigo-600" }) {
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function MiniBarChart({ items }) {
  return (
    <div className="mt-6">
      <div className="flex h-52 items-end gap-3 rounded-3xl bg-slate-50 p-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center justify-end">
            <div className="mb-2 text-xs font-semibold text-slate-700">
              {item.value}
            </div>
            <div
              className={`w-full max-w-[48px] rounded-t-2xl ${item.color}`}
              style={{ height: `${item.value}%`, minHeight: "22px" }}
            />
            <div className="mt-3 text-xs text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const user = useMemo(() => getStoredUser(), []);
  const name = user?.name || "Agent";
  const email = user?.email || "agent@asyncafrica.com";

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Support",
      text: "Hello! Welcome to the agent dashboard. Please follow up with your new leads today.",
      time: "09:10 AM",
      type: "incoming",
    },
    {
      id: 2,
      sender: name,
      text: "Thank you. I am reviewing today’s applications and contacting schools.",
      time: "09:14 AM",
      type: "outgoing",
    },
    {
      id: 3,
      sender: "Manager",
      text: "Good. Please also update the status of interested students before end of day.",
      time: "09:18 AM",
      type: "incoming",
    },
  ]);

  const stats = [
    {
      title: "New Leads",
      value: "24",
      note: "+6 this week",
      progress: 76,
      colorClass: "bg-indigo-600",
      icon: "👥",
    },
    {
      title: "Applications",
      value: "18",
      note: "Pending review",
      progress: 64,
      colorClass: "bg-violet-600",
      icon: "📝",
    },
    {
      title: "Follow Ups",
      value: "12",
      note: "Need action today",
      progress: 58,
      colorClass: "bg-amber-500",
      icon: "📞",
    },
    {
      title: "Success Rate",
      value: "82%",
      note: "Strong performance",
      progress: 82,
      colorClass: "bg-emerald-600",
      icon: "📈",
    },
  ];

  const chartData = [
    { label: "Mon", value: 45, color: "bg-indigo-500" },
    { label: "Tue", value: 60, color: "bg-indigo-500" },
    { label: "Wed", value: 75, color: "bg-violet-500" },
    { label: "Thu", value: 52, color: "bg-sky-500" },
    { label: "Fri", value: 88, color: "bg-emerald-500" },
    { label: "Sat", value: 40, color: "bg-amber-500" },
  ];

  const pipeline = [
    {
      title: "Interested Students",
      value: 34,
      bg: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      title: "Reviewed Applications",
      value: 21,
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
    {
      title: "Approved Cases",
      value: 11,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      title: "Need Attention",
      value: 7,
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
  ];

  const recentTasks = [
    {
      title: "Call Kigali Technical School",
      status: "In Progress",
      statusClass: "bg-blue-100 text-blue-700",
    },
    {
      title: "Review 5 new internship requests",
      status: "Pending",
      statusClass: "bg-amber-100 text-amber-700",
    },
    {
      title: "Send admission details to 3 students",
      status: "Completed",
      statusClass: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Update student follow-up notes",
      status: "In Progress",
      statusClass: "bg-blue-100 text-blue-700",
    },
  ];

  const quickActions = [
    "Add new intern",
    "Check wallet",
    "Review applications",
    "Contact schools",
  ];

  const sendMessage = () => {
    const value = chatInput.trim();
    if (!value) return;

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: name,
        text: value,
        time: "Now",
        type: "outgoing",
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="min-h-[calc(100vh-160px)]">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#7c3aed] p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-white/80">
                Agent Workspace
              </p>
              <h1 className="mt-2 text-2xl font-bold md:text-4xl">
                Welcome back, {name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                This dashboard helps you track leads, applications, follow-ups,
                and daily communication in one place. You can now manage your
                work faster and more clearly.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {quickActions.map((action) => (
                  <div
                    key={action}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid min-w-[280px] gap-4 sm:grid-cols-2 xl:w-[360px] xl:grid-cols-1">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Logged in as
                </p>
                <p className="mt-2 text-lg font-semibold">{name}</p>
                <p className="text-sm text-white/80">{email}</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Today Focus
                </p>
                <p className="mt-2 text-lg font-semibold">Follow-up & Approval</p>
                <p className="text-sm text-white/80">
                  Keep applications updated and answer messages quickly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-slate-900">
                    {card.value}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{card.note}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
                  {card.icon}
                </div>
              </div>

              <ProgressBar value={card.progress} colorClass={card.colorClass} />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Weekly Performance Graphic
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Visual view of your weekly agent activity and progress.
                </p>
              </div>

              <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                Performance Overview
              </div>
            </div>

            <MiniBarChart items={chartData} />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Profile Summary</h2>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                {(name?.[0] || "A").toUpperCase()}
              </div>

              <div>
                <p className="text-base font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">{email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Role
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Agent
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Access
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Agent Dashboard
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-600">
                  Logged In
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">
              Agent Activity Overview
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              This section gives you a clear picture of student interest,
              reviewed applications, approvals, and items that still need your
              attention.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pipeline.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl p-5 ${item.bg}`}
                >
                  <p className="text-sm font-medium text-slate-600">
                    {item.title}
                  </p>
                  <div className={`mt-2 text-3xl font-bold ${item.text}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Agent Note
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Focus first on students who already showed interest, then review
                pending cases, and finally update all notes so the team sees the
                latest status.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Recent Tasks</h2>

            <div className="mt-5 space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {task.title}
                  </p>
                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${task.statusClass}`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Team Chat
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Communicate with support, manager, or your team directly here.
                </p>
              </div>

              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Online
              </div>
            </div>

            <div className="mt-6 h-[360px] overflow-y-auto rounded-3xl bg-slate-50 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "outgoing" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        message.type === "outgoing"
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-800"
                      }`}
                    >
                      <p className="text-xs font-semibold opacity-80">
                        {message.sender}
                      </p>
                      <p className="mt-1 text-sm leading-6">{message.text}</p>
                      <p
                        className={`mt-2 text-[11px] ${
                          message.type === "outgoing"
                            ? "text-white/75"
                            : "text-slate-400"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Write your message here..."
                className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="h-12 rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Chat Related Info
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Support Status
                </p>
                <p className="mt-2 text-sm text-emerald-600">
                  Available now
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Unread Messages
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">03</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Last Team Update
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Please confirm contacted schools and update student records
                  before 5:00 PM.
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-sm font-semibold text-indigo-900">
                  Suggestion
                </p>
                <p className="mt-2 text-sm leading-6 text-indigo-700">
                  Use chat for quick coordination, then update the dashboard
                  status after each follow-up.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}