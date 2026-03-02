import { Link, useParams } from "react-router-dom";
import { trainingPrograms } from "../data/trainingData";

export default function TrainingDetails() {
  const { slug } = useParams();
  const program = trainingPrograms.find((item) => item.slug === slug);

  if (!program) {
    return (
      <section className="min-h-screen bg-[#f8f8ff] px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <h1 className="text-3xl font-black text-slate-900">Training page not found</h1>
          <p className="mt-4 text-slate-600">
            The training page you are looking for does not exist.
          </p>
          <Link
            to="/training"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:bg-[#7A6CF5]"
          >
            Back to Training
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f8ff] pt-32">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#0f172a] px-6 py-16 text-white sm:px-10 lg:px-14">
          <div className="max-w-4xl">
            <Link
              to="/training"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#c8c1ff] transition hover:text-white"
            >
              ← Back to Training
            </Link>

            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#c8c1ff]">
              {program.title}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {program.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              {program.heroDescription}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Request This Training
              </Link>

              <Link
                to="/training"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:bg-white/10"
              >
                View All Training
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">What this includes</h2>
              <div className="mt-6 grid gap-3">
                {program.features.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Focus areas</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {program.focusAreas.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[28px] bg-gradient-to-br from-[#6050F0] to-[#7A6CF5] p-8 text-white shadow-[0_20px_60px_rgba(96,80,240,0.2)]">
              <h2 className="text-2xl font-black">Who this is for</h2>
              <div className="mt-6 grid gap-3">
                {program.audience.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm font-semibold text-white"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[#0f172a] p-8 text-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8b0ff]">
                Interested in this training?
              </p>
              <h3 className="mt-3 text-2xl font-black">
                Let’s prepare the right learning path for you
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                AsyncAfrica can help individuals, teams, and institutions gain
                practical digital skills through focused technology training.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:bg-[#7A6CF5]"
                >
                  Contact Us
                </Link>

                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:text-[#c8c1ff]"
                >
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}