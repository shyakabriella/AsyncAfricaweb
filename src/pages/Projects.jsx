import { Link } from "react-router-dom";

const projects = [
  {
    title: "Custom Business Management System",
    category: "Software Development",
    description:
      "A digital platform designed to manage workflows, records, reporting, and operations in a more efficient and scalable way.",
    tags: ["Web App", "Dashboard", "Automation"],
  },
  {
    title: "Network Infrastructure Deployment",
    category: "Networking & Infrastructure",
    description:
      "A structured infrastructure setup including routers, switches, Wi-Fi, cabling, and technical configuration for reliable connectivity.",
    tags: ["LAN/WAN", "Wi-Fi", "Support"],
  },
  {
    title: "AI Smart Assistant",
    category: "Artificial Intelligence",
    description:
      "A smart assistant concept built to improve automation, support responses, and digital service efficiency.",
    tags: ["AI", "Automation", "Assistant"],
  },
  {
    title: "IoT Monitoring Platform",
    category: "IoT Solutions",
    description:
      "A connected monitoring solution for smart devices and sensors with dashboard visibility and real-time insights.",
    tags: ["IoT", "Sensors", "Dashboard"],
  },
  {
    title: "Robotics Learning Prototype",
    category: "Robotics & Innovation",
    description:
      "A practical robotics model for technical training, problem solving, and innovation-based learning.",
    tags: ["Robotics", "Prototype", "Learning"],
  },
  {
    title: "Technology Training Bootcamp",
    category: "Training & Capacity Building",
    description:
      "A hands-on training experience focused on digital skills, teamwork, and practical exposure to modern technology.",
    tags: ["Training", "Bootcamp", "Skills"],
  },
];

export default function Projects() {
  return (
    <section className="min-h-screen bg-[#f8f8ff] pt-32">
      {/* hero */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#0f172a] px-6 py-16 text-white sm:px-10 lg:px-14">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#c8c1ff]">
              Projects & Portfolio
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Practical solutions built with{" "}
              <span className="text-[#7A6CF5]">technology and innovation</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              AsyncAfrica works on software systems, infrastructure solutions,
              training programs, and emerging technology ideas designed to
              create real value and support digital growth.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Start Your Project
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:bg-white/10"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* grid */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
                style={{
                  animation: "fadeUpProjectPage 0.8s ease forwards",
                  animationDelay: `${index * 0.08}s`,
                  opacity: 0,
                }}
              >
                <div className="inline-flex rounded-full bg-[#6050F0]/10 px-3 py-1 text-xs font-bold text-[#6050F0]">
                  {project.category}
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-900">
                  {project.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  {project.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* bottom CTA */}
          <div className="mt-14 rounded-[32px] bg-gradient-to-r from-[#6050F0] to-[#7A6CF5] px-6 py-10 text-white sm:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  Build With AsyncAfrica
                </p>
                <h3 className="mt-3 text-2xl font-black sm:text-3xl">
                  Have an idea, project, or digital challenge?
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/85 sm:text-base">
                  Let’s discuss how AsyncAfrica can help you design, build, and
                  support the right technology solution.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#6050F0] transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
                >
                  Talk to Us
                </Link>

                <Link
                  to="/training"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:border-white hover:bg-white/10"
                >
                  Explore Training
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUpProjectPage {
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