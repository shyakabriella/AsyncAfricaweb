import { Link } from "react-router-dom";
import { servicesData } from "../data/servicesData";

export default function Services() {
  return (
    <section className="min-h-screen bg-[#f8f8ff] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
            Our Services
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
            Technology services built for{" "}
            <span className="text-[#6050F0]">growth, innovation, and impact</span>
          </h1>

          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            AsyncAfrica provides practical IT services that help organizations
            build systems, improve infrastructure, adopt innovation, and grow
            with confidence.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {servicesData.map((service, index) => (
            <div
              key={service.slug}
              className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
              style={{
                animation: "fadeUpService 0.8s ease forwards",
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="inline-flex rounded-2xl bg-[#6050F0]/10 px-4 py-2 text-sm font-bold text-[#6050F0]">
                {service.title}
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                {service.shortDescription}
              </p>

              <div className="mt-6">
                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6050F0] transition duration-300 hover:gap-3"
                >
                  Explore Service
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUpService {
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