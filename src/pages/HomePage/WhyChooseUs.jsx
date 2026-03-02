import { Link } from "react-router-dom";

const reasons = [
  {
    title: "Innovative Technology Solutions",
    description:
      "We build modern solutions using the latest technologies to help businesses and institutions work smarter and grow faster.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
      </svg>
    ),
  },
  {
    title: "Practical Industry Expertise",
    description:
      "Our work focuses on real-world implementation, combining technical knowledge with practical business and organizational needs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2 1 7l11 5 9-4.09V17h2V7L12 2Zm-7 9.18V16l7 3.82 7-3.82v-4.82l-7 3.82-7-3.82Z" />
      </svg>
    ),
  },
  {
    title: "Training with Real Skills",
    description:
      "We do not only teach theory. We focus on hands-on learning that prepares students, professionals, and teams for real opportunities.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3 2 8l10 5 8.16-4.08V15H22V8L12 3Zm-6 8.76V16l6 3 6-3v-4.24l-6 3-6-3Z" />
      </svg>
    ),
  },
  {
    title: "Customized Client Approach",
    description:
      "Every organization is different. We design solutions and services based on your goals, challenges, and long-term vision.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
      </svg>
    ),
  },
  {
    title: "Future-Focused Innovation",
    description:
      "From AI and IoT to robotics and automation, we help clients and learners prepare for the technology of tomorrow.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M11 2h2v3h-2V2Zm6.36 1.64 1.41 1.41-2.12 2.12-1.41-1.41 2.12-2.12ZM20 11h3v2h-3v-2ZM7.05 5.17 4.93 3.05l1.41-1.41 2.12 2.12-1.41 1.41ZM1 11h3v2H1v-2Zm11  -4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z" />
      </svg>
    ),
  },
  {
    title: "Reliable Support & Growth Partnership",
    description:
      "We aim to build long-term relationships by supporting our clients and trainees beyond the first project or training session.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 1 3 5v6c0 5.25 3.66 10.16 9 11 5.34-.84 9-5.75 9-11V5l-9-4Zm-1 14-4-4 1.41-1.41L11 12.17l5.59-5.58L18 8l-7 7Z" />
      </svg>
    ),
  },
];

const miniStats = [
  { value: "Client-Focused", label: "Approach" },
  { value: "Hands-On", label: "Training Model" },
  { value: "Future-Ready", label: "Technology Vision" },
  { value: "Scalable", label: "Solutions" },
];

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6050F0]/10 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#7A6CF5]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* top heading */}
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
              Why Choose AsyncAfrica
            </div>

            <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              We combine{" "}
              <span className="text-[#6050F0]">technology, innovation,</span>{" "}
              and practical impact
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              AsyncAfrica is not only focused on delivering services. We are
              focused on solving problems, building skills, and helping Africa
              move forward through reliable and future-ready technology.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-[#0f172a] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.1)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8b0ff]">
              Our Promise
            </p>
            <h3 className="mt-4 text-2xl font-black">
              Delivering value through smart digital transformation
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Whether you need a technology solution, modern infrastructure, or
              professional training, we work to deliver results that are
              practical, scalable, and meaningful.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {miniStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="text-sm font-bold text-[#7A6CF5]">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* reasons grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className="group rounded-[28px] border border-slate-200 bg-[#f8f8ff] p-7 shadow-[0_12px_40px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:bg-white hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
              style={{
                animation: "fadeUpWhy 0.8s ease forwards",
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="inline-flex rounded-2xl bg-[#6050F0]/10 p-4 text-[#6050F0] transition duration-300 group-hover:bg-[#6050F0] group-hover:text-white">
                {reason.icon}
              </div>

              <h3 className="mt-6 text-xl font-black text-slate-900">
                {reason.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* bottom CTA */}
        <div className="mt-14 rounded-[32px] bg-gradient-to-r from-[#6050F0] to-[#7A6CF5] px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Let’s Build Something Great
              </p>
              <h3 className="mt-3 text-2xl font-black sm:text-3xl">
                Ready to work with a modern and innovative IT partner?
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/85 sm:text-base">
                We are ready to support your business, institution, or learning
                journey with modern solutions and practical technology services.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#6050F0] transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
              >
                Talk to Our Team
              </Link>

              <Link
                to="/training"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:border-white hover:bg-white/10"
              >
                Join Training
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUpWhy {
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