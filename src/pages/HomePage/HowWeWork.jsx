import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Consultation & Discovery",
    description:
      "We begin by understanding your goals, challenges, and needs so we can recommend the right technology direction.",
  },
  {
    number: "02",
    title: "Analysis & Planning",
    description:
      "We study the requirements, define the solution scope, and prepare a structured implementation plan.",
  },
  {
    number: "03",
    title: "Design & Development",
    description:
      "Our team designs, builds, and configures the systems, platforms, or training programs required for your project.",
  },
  {
    number: "04",
    title: "Testing & Deployment",
    description:
      "We test the solution carefully and deploy it in a way that supports stability, performance, and usability.",
  },
  {
    number: "05",
    title: "Training & Knowledge Transfer",
    description:
      "We help users, teams, or learners understand the solution through hands-on guidance and practical learning.",
  },
  {
    number: "06",
    title: "Support & Continuous Improvement",
    description:
      "We continue supporting our clients and partners with updates, improvements, and technical assistance when needed.",
  },
];

const processPoints = [
  "Client-centered approach",
  "Clear implementation steps",
  "Practical delivery model",
  "Long-term support mindset",
];

export default function HowWeWork() {
  return (
    <section className="relative overflow-hidden bg-[#0b1120] py-20 text-white sm:py-24">
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#6050F0]/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#7A6CF5]/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-[#7A6CF5]/20 bg-[#6050F0]/10 px-4 py-2 text-sm font-semibold text-[#c5bcff]">
            How We Work
          </div>

          <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            A clear process that turns{" "}
            <span className="text-[#7A6CF5]">ideas into impact</span>
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
            At AsyncAfrica, we follow a practical and structured process to make
            sure every service, system, and training program delivers real value.
          </p>
        </div>

        {/* steps */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:border-[#7A6CF5]/30 hover:bg-white/10"
              style={{
                animation: "fadeUpWork 0.8s ease forwards",
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6050F0]/20 text-xl font-black text-[#c9c3ff]">
                {step.number}
              </div>

              <h3 className="mt-6 text-xl font-black text-white">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* lower section */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 px-6 py-10 backdrop-blur-sm sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c5bcff]">
              Process Value
            </p>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">
              We focus on delivery that is practical, scalable, and reliable
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Our workflow is designed to reduce confusion, improve execution,
              and make sure every engagement moves from planning to real results.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {processPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold text-slate-200"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white px-6 py-10 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6050F0]">
              Ready to Begin?
            </p>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">
              Let’s move from concept to implementation
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Whether you need software, infrastructure, training, or innovation
              support, AsyncAfrica is ready to help you start with the right process.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Start a Conversation
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-7 py-3.5 text-sm font-bold text-slate-800 transition duration-300 hover:border-[#6050F0] hover:text-[#6050F0]"
              >
                View Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUpWork {
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