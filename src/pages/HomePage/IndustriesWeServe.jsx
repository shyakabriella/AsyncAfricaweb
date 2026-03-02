import { Link } from "react-router-dom";

const industries = [
  {
    title: "Education",
    description:
      "Supporting schools, universities, and training centers with digital systems, smart labs, networking, and technology skills programs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-6 8.76V16l6 3 6-3v-4.24l-6 3-6-3Z" />
      </svg>
    ),
  },
  {
    title: "Healthcare",
    description:
      "Helping clinics, hospitals, and health organizations improve operations using systems, infrastructure, connectivity, and digital support tools.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M19 8h-3V5h-4v3H9v4h3v3h4v-3h3V8Zm-7 13C6.48 21 2 16.52 2 11s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10Z" />
      </svg>
    ),
  },
  {
    title: "Businesses & SMEs",
    description:
      "Providing modern software, automation, IT support, and infrastructure services that help businesses become more efficient and competitive.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M4 7h16v12H4V7Zm2 2v8h12V9H6ZM9 3h6v2H9V3Z" />
      </svg>
    ),
  },
  {
    title: "Government & Public Institutions",
    description:
      "Delivering digital transformation support, networking, secure systems, and training solutions for public service environments.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2 3 6v2h18V6l-9-4ZM4 10h3v8H4v-8Zm6 0h4v8h-4v-8Zm7 0h3v8h-3v-8ZM2 20h20v2H2v-2Z" />
      </svg>
    ),
  },
  {
    title: "NGOs & Development Programs",
    description:
      "Supporting nonprofit and development initiatives with digital tools, monitoring systems, data platforms, and practical training programs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 21s-6.72-4.35-9.19-8.1C.77 9.82 2.18 5.5 6.17 4.3c2.02-.61 4.18.06 5.83 1.83 1.65-1.77 3.81-2.44 5.83-1.83 3.99 1.2 5.4 5.52 3.36 8.6C18.72 16.65 12 21 12 21Z" />
      </svg>
    ),
  },
  {
    title: "Startups & Innovation Hubs",
    description:
      "Helping startups and innovation communities build products, launch platforms, strengthen infrastructure, and develop future-ready talent.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
      </svg>
    ),
  },
  {
    title: "Hospitality & Tourism",
    description:
      "Providing technology support, digital systems, connectivity, automation, and customer experience tools for hotels and hospitality businesses.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M7 11V7a5 5 0 0 1 10 0v4h2a2 2 0 0 1 2 2v7h-2v-3H5v3H3v-7a2 2 0 0 1 2-2h2Zm2 0h6V7a3 3 0 0 0-6 0v4Z" />
      </svg>
    ),
  },
  {
    title: "Retail & Commerce",
    description:
      "Supporting retail operations with POS systems, inventory tools, network infrastructure, digital payments, and process optimization.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M4 6h17l-1.5 9h-12L6 4H2V2h5l1 2h13a1 1 0 0 1 .98 1.2L21.5 8H8.3l.33 2H20v2H8a1 1 0 0 1-.98-.8L5.1 4H4v2Zm4 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      </svg>
    ),
  },
];

const impactPoints = [
  "Sector-specific digital solutions",
  "Scalable systems and infrastructure",
  "Practical training for different audiences",
  "Technology aligned to real operational needs",
];

export default function IndustriesWeServe() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6050F0]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#7A6CF5]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
            Industries We Serve
          </div>

          <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Technology solutions for{" "}
            <span className="text-[#6050F0]">different sectors</span> and real
            operational needs
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            AsyncAfrica works across multiple industries, helping organizations
            adopt the right technologies, strengthen infrastructure, and build
            digital capacity for growth and innovation.
          </p>
        </div>

        {/* cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {industries.map((industry, index) => (
            <div
              key={industry.title}
              className="group rounded-[28px] border border-slate-200 bg-[#f8f8ff] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:bg-white hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
              style={{
                animation: "fadeUpIndustry 0.8s ease forwards",
                animationDelay: `${index * 0.07}s`,
                opacity: 0,
              }}
            >
              <div className="inline-flex rounded-2xl bg-[#6050F0]/10 p-4 text-[#6050F0] transition duration-300 group-hover:bg-[#6050F0] group-hover:text-white">
                {industry.icon}
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-900">
                {industry.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {industry.description}
              </p>
            </div>
          ))}
        </div>

        {/* lower panel */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] bg-[#0f172a] px-6 py-10 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8b0ff]">
              Sector Impact
            </p>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">
              We adapt technology to the needs of each industry
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              We understand that schools, businesses, NGOs, healthcare
              institutions, and public organizations do not operate in the same
              way. That is why our approach focuses on context, usability, and
              sustainable digital growth.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {impactPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-slate-200"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6050F0]">
              Collaboration
            </p>
            <h3 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
              Looking for technology support in your sector?
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Whether you are a school, startup, healthcare provider, business,
              or institution, AsyncAfrica can help you design, build, and
              implement practical solutions that fit your environment.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Talk to Us
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-7 py-3.5 text-sm font-bold text-slate-800 transition duration-300 hover:border-[#6050F0] hover:text-[#6050F0]"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUpIndustry {
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