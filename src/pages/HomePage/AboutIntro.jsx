import { Link } from "react-router-dom";

export default function AboutIntro() {
  const highlights = [
    "Software Development",
    "Networking & Infrastructure",
    "Artificial Intelligence",
    "IoT Solutions",
    "Robotics & Automation",
    "Professional Tech Training",
  ];

  const stats = [
    { value: "01", label: "Technology Company" },
    { value: "06+", label: "Core Technology Areas" },
    { value: "24/7", label: "Innovation Mindset" },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-20 text-slate-900 sm:py-24">
      {/* background decoration */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6050F0]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#7A6CF5]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* left */}
          <div>
            <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
              About AsyncAfrica
            </div>

            <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              A modern technology company building{" "}
              <span className="text-[#6050F0]">digital solutions</span> and
              empowering innovation in Africa
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
              <span className="font-semibold text-slate-900">AsyncAfrica</span>{" "}
              is an IT company focused on delivering practical and innovative
              digital solutions for businesses, institutions, and individuals.
              We work across software development, networking, artificial
              intelligence, IoT, robotics, and modern technology training.
            </p>

            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              Our mission is to help organizations grow with technology while
              also preparing young people and professionals with the skills
              needed for the future digital economy.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Learn More About Us
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-7 py-3.5 text-sm font-bold text-slate-800 transition duration-300 hover:border-[#6050F0] hover:text-[#6050F0]"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* right */}
          <div className="relative">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Our Focus Areas
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">
                    Technology + Skills + Innovation
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#6050F0]/10 p-3 text-[#6050F0]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-7 w-7"
                  >
                    <path d="M12 2 2 7l10 5 10-5-10-5Zm-7 9 7 3.5L19 11v6l-7 3.5L5 17v-6Z" />
                  </svg>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition duration-300 hover:border-[#6050F0]/30 hover:bg-[#6050F0]/5 hover:text-[#6050F0]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-[#0f172a] px-4 py-5 text-white"
                  >
                    <div className="text-2xl font-black text-[#7A6CF5]">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* floating small card */}
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-[#6050F0]/10 bg-white px-5 py-4 shadow-lg sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Vision
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                Building Africa’s Digital Future
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}