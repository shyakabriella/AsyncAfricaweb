import { Link } from "react-router-dom";
import { trainingPrograms } from "../data/trainingData";

export default function Training() {
  return (
    <section className="min-h-screen bg-[#f8f8ff] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
            AsyncAfrica Academy
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
            Practical training for{" "}
            <span className="text-[#6050F0]">future-ready digital skills</span>
          </h1>

          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            AsyncAfrica Academy helps students, professionals, teams, and institutions
            build practical technology skills through courses, corporate training,
            workshops, and bootcamps.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div
            className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
            style={{ animation: "fadeUpTrainingPage 0.8s ease forwards", opacity: 0 }}
          >
            <div className="inline-flex rounded-2xl bg-[#6050F0]/10 px-4 py-2 text-sm font-bold text-[#6050F0]">
              Training Overview
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
              Discover AsyncAfrica Academy and how our training model helps learners
              gain real technology skills for work, innovation, and growth.
            </p>

            <div className="mt-6">
              <Link
                to="/training"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#6050F0] transition duration-300 hover:gap-3"
              >
                Explore Overview
                <span>→</span>
              </Link>
            </div>
          </div>

          {trainingPrograms.map((program, index) => (
            <div
              key={program.slug}
              className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
              style={{
                animation: "fadeUpTrainingPage 0.8s ease forwards",
                animationDelay: `${(index + 1) * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="inline-flex rounded-2xl bg-[#6050F0]/10 px-4 py-2 text-sm font-bold text-[#6050F0]">
                {program.title}
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                {program.shortDescription}
              </p>

              <div className="mt-6">
                <Link
                  to={`/training/${program.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6050F0] transition duration-300 hover:gap-3"
                >
                  Explore Program
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUpTrainingPage {
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