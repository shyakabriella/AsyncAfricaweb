import { Link } from "react-router-dom";

const projects = [
  {
    title: "Custom Business Management System",
    category: "Software Development",
    description:
      "A modern digital system designed to help organizations manage operations, records, workflows, and reporting more efficiently.",
    tags: ["Web App", "Dashboard", "Automation"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M4 5h16v14H4V5Zm2 2v10h12V7H6Zm2 2h4v2H8V9Zm0 4h8v2H8v-2Z" />
      </svg>
    ),
  },
  {
    title: "Network Infrastructure Setup",
    category: "Networking & Infrastructure",
    description:
      "A structured networking project including connectivity design, device configuration, Wi-Fi deployment, and infrastructure optimization.",
    tags: ["LAN/WAN", "Wi-Fi", "Support"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M4 6h16v4H4V6Zm2 6h12v6H6v-6Zm2 2v2h2v-2H8Zm4 0v2h2v-2h-2Z" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Smart Assistant",
    category: "Artificial Intelligence",
    description:
      "An intelligent assistant concept designed to support users through automation, quick information access, and improved service delivery.",
    tags: ["AI", "Automation", "Assistant"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2a3 3 0 0 1 3 3v1.1a5 5 0 0 1 2.9 2.9H19a3 3 0 1 1 0 6h-1.1a5 5 0 0 1-2.9 2.9V19a3 3 0 1 1-6 0v-1.1A5 5 0 0 1 6.1 15H5a3 3 0 1 1 0-6h1.1A5 5 0 0 1 9 6.1V5a3 3 0 0 1 3-3Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      </svg>
    ),
  },
  {
    title: "IoT Monitoring Dashboard",
    category: "IoT Solutions",
    description:
      "A connected monitoring concept for devices and sensors, giving users visibility into real-time information and system activity.",
    tags: ["IoT", "Sensors", "Dashboard"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 1 0-14 0H3a9 9 0 0 1 9-9Zm0 4a5 5 0 0 1 5 5h-2a3 3 0 1 0-6 0H7a5 5 0 0 1 5-5Zm-1 6h2v8h-2v-8Z" />
      </svg>
    ),
  },
  {
    title: "Robotics Learning Prototype",
    category: "Robotics & Innovation",
    description:
      "A practical robotics and automation learning model built to introduce problem solving, control logic, and hardware interaction.",
    tags: ["Robotics", "Prototype", "Learning"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M9 2h6v2h-2v2.07A7.002 7.002 0 0 1 19 13v6h2v2H3v-2h2v-6a7.002 7.002 0 0 1 6-6.93V4H9V2Zm-2 9v2h2v-2H7Zm8 0v2h2v-2h-2Zm-6 6h6v-2H9v2Z" />
      </svg>
    ),
  },
  {
    title: "Technology Training Bootcamp",
    category: "Training & Capacity Building",
    description:
      "A practical training program focused on digital skills, hands-on learning, teamwork, and modern technology exposure for learners.",
    tags: ["Training", "Bootcamp", "Skills"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3 2 8l10 5 10-5-10-5Zm-6 8.76V16l6 3 6-3v-4.24l-6 3-6-3Z" />
      </svg>
    ),
  },
];

export default function ProjectsPreview() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6050F0]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#7A6CF5]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
            Projects & Portfolio
          </div>

          <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            A preview of the{" "}
            <span className="text-[#6050F0]">solutions and ideas</span> we build
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            AsyncAfrica works on practical systems, infrastructure solutions,
            smart technologies, and training programs designed to create real value
            and real digital progress.
          </p>
        </div>

        {/* cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group rounded-[28px] border border-slate-200 bg-[#f8f8ff] p-7 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:bg-white hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
              style={{
                animation: "fadeUpProject 0.8s ease forwards",
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex rounded-2xl bg-[#6050F0]/10 p-4 text-[#6050F0] transition duration-300 group-hover:bg-[#6050F0] group-hover:text-white">
                  {project.icon}
                </div>

                <div className="rounded-full bg-[#7A6CF5]/10 px-3 py-1 text-xs font-bold text-[#6050F0]">
                  {project.category}
                </div>
              </div>

              <h3 className="mt-6 text-xl font-black text-slate-900">
                {project.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {project.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-[#6050F0]/30 hover:bg-[#6050F0]/5 hover:text-[#6050F0]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6050F0] transition duration-300 hover:gap-3"
                >
                  View Details
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* bottom panel */}
        <div className="mt-14 rounded-[32px] bg-[#0f172a] px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8b0ff]">
                Portfolio Growth
              </p>
              <h3 className="mt-3 text-2xl font-black sm:text-3xl">
                We are building solutions that combine technology and impact
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                Our portfolio continues to grow across software, infrastructure,
                training, and emerging technologies. We focus on practical work
                that supports organizations and learners.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                View Portfolio
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:text-[#c8c1ff]"
              >
                Start Your Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUpProject {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}