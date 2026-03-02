import { Link } from "react-router-dom";

const innovations = [
  {
    title: "Artificial Intelligence",
    description:
      "We explore and build AI-powered solutions for automation, smart assistance, data insights, and better digital decision-making.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2a3 3 0 0 1 3 3v1.1a5 5 0 0 1 2.9 2.9H19a3 3 0 1 1 0 6h-1.1a5 5 0 0 1-2.9 2.9V19a3 3 0 1 1-6 0v-1.1A5 5 0 0 1 6.1 15H5a3 3 0 1 1 0-6h1.1A5 5 0 0 1 9 6.1V5a3 3 0 0 1 3-3Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      </svg>
    ),
  },
  {
    title: "Internet of Things (IoT)",
    description:
      "We create and support connected systems using sensors, smart monitoring, devices, and real-time data-driven solutions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 1 0-14 0H3a9 9 0 0 1 9-9Zm0 4a5 5 0 0 1 5 5h-2a3 3 0 1 0-6 0H7a5 5 0 0 1 5-5Zm-1 6h2v8h-2v-8Z" />
      </svg>
    ),
  },
  {
    title: "Robotics & Automation",
    description:
      "We promote innovation through robotics, automation systems, control logic, and future-ready technical learning experiences.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M9 2h6v2h-2v2.07A7.002 7.002 0 0 1 19 13v6h2v2H3v-2h2v-6a7.002 7.002 0 0 1 6-6.93V4H9V2Zm-2 9v2h2v-2H7Zm8 0v2h2v-2h-2Zm-6 6h6v-2H9v2Z" />
      </svg>
    ),
  },
  {
    title: "Digital Transformation",
    description:
      "We help organizations modernize their processes, systems, and workflows with practical digital transformation strategies.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
      </svg>
    ),
  },
];

const innovationStats = [
  { value: "AI", label: "Smart Solutions" },
  { value: "IoT", label: "Connected Systems" },
  { value: "R&D", label: "Innovation Focus" },
  { value: "Future", label: "Ready Skills" },
];

export default function InnovationSection() {
  return (
    <section className="relative overflow-hidden bg-[#f8f8ff] py-20 sm:py-24">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6050F0]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#7A6CF5]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left */}
          <div>
            <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
              Innovation & Emerging Technologies
            </div>

            <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Building solutions for a{" "}
              <span className="text-[#6050F0]">smarter digital future</span>
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
              AsyncAfrica is committed to innovation. We do not only focus on
              current technology needs, but also on the emerging technologies
              that are shaping the future of business, education, and society.
            </p>

            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              Through AI, IoT, robotics, automation, and digital transformation,
              we help organizations and learners prepare for the next wave of
              technological change.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Explore Innovation Services
              </Link>

              <Link
                to="/training"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-8 py-4 text-sm font-bold text-slate-800 transition duration-300 hover:border-[#6050F0] hover:text-[#6050F0]"
              >
                Learn Future Skills
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {innovationStats.map((item, index) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-[0_12px_35px_rgba(15,23,42,0.04)]"
                  style={{
                    animation: "fadeUpInnovation 0.8s ease forwards",
                    animationDelay: `${index * 0.08}s`,
                    opacity: 0,
                  }}
                >
                  <div className="text-xl font-black text-[#6050F0]">
                    {item.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="relative">
            <div className="rounded-[32px] bg-[#0f172a] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.1)] sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Emerging Technology Areas
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    Innovation Focus
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-7 w-7"
                  >
                    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
                  </svg>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {innovations.map((item, index) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-300 hover:border-[#7A6CF5]/30 hover:bg-white/10"
                    style={{
                      animation: "fadeUpInnovation 0.8s ease forwards",
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="inline-flex rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                        {item.icon}
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-white">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-[#6050F0]/10 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8c1ff]">
                  Innovation Vision
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                  We aim to be part of Africa’s digital future by building
                  innovative solutions, training future talent, and encouraging
                  practical use of emerging technologies.
                </p>
              </div>
            </div>

            {/* floating card */}
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Future Focus
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                Innovation that creates real impact
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUpInnovation {
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