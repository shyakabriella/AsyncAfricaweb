import { Link } from "react-router-dom";

const trainingAreas = [
  "Web Development",
  "Mobile App Development",
  "Networking Essentials",
  "Artificial Intelligence",
  "IoT Fundamentals",
  "Robotics Basics",
  "Cybersecurity",
  "UI/UX Design",
];

const audiences = [
  {
    title: "Students",
    description:
      "Helping students gain practical digital skills that prepare them for internships, jobs, and innovation.",
  },
  {
    title: "Professionals",
    description:
      "Upskilling working professionals with modern technology knowledge and practical hands-on experience.",
  },
  {
    title: "Organizations",
    description:
      "Supporting companies, schools, and institutions with customized corporate and team-based training.",
  },
];

export default function TrainingOverview() {
  return (
    <section className="relative overflow-hidden bg-[#0b1120] py-20 text-white sm:py-24">
      {/* Background effects */}
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#6050F0]/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#7A6CF5]/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left side */}
          <div>
            <div className="inline-flex rounded-full border border-[#7A6CF5]/20 bg-[#6050F0]/10 px-4 py-2 text-sm font-semibold text-[#c5bcff]">
              AsyncAfrica Academy
            </div>

            <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Building digital skills for the{" "}
              <span className="text-[#7A6CF5]">next generation</span>
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">
              AsyncAfrica Academy provides practical and future-ready training in
              technology fields that matter today. We help learners build real
              skills in software, networking, AI, IoT, robotics, cybersecurity,
              and other modern digital areas.
            </p>

            <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
              Our goal is to prepare students, professionals, and organizations
              with knowledge that can be applied in real work, real business,
              and real innovation.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/training"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Explore Training
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:bg-white/10"
              >
                Request Corporate Training
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {audiences.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                  style={{
                    animation: "fadeUpTraining 0.8s ease forwards",
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="relative">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Learning Areas
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    Practical Training Programs
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-7 w-7"
                  >
                    <path d="M12 3 2 8l10 5 10-5-10-5Zm-6 8.76V16l6 3 6-3v-4.24l-6 3-6-3Z" />
                  </svg>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {trainingAreas.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-[#111827]/80 px-4 py-4 text-sm font-semibold text-slate-200 transition duration-300 hover:border-[#7A6CF5]/40 hover:bg-[#6050F0]/10 hover:text-white"
                    style={{
                      animation: "fadeUpTraining 0.8s ease forwards",
                      animationDelay: `${index * 0.07}s`,
                      opacity: 0,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-[#6050F0]/10 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8c1ff]">
                  Training Model
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-black/20 p-4">
                    <div className="text-lg font-black text-white">Hands-On</div>
                    <p className="mt-1 text-sm text-slate-300">
                      Practical projects and exercises
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/20 p-4">
                    <div className="text-lg font-black text-white">Flexible</div>
                    <p className="mt-1 text-sm text-slate-300">
                      Individual, group, and corporate training
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/20 p-4">
                    <div className="text-lg font-black text-white">Future-Ready</div>
                    <p className="mt-1 text-sm text-slate-300">
                      Skills aligned with modern technology
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* floating card */}
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-white/10 bg-[#111827] px-5 py-4 shadow-xl sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Mission
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                Empowering people through practical technology education
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUpTraining {
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