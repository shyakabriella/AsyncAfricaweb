import { Link, useParams } from "react-router-dom";
import { servicesData } from "../data/servicesData";

export default function ServiceDetails() {
  const { slug } = useParams();
  const service = servicesData.find((item) => item.slug === slug);

  if (!service) {
    return (
      <section className="min-h-screen bg-[#f8f8ff] px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <h1 className="text-3xl font-black text-slate-900">Service not found</h1>
          <p className="mt-4 text-slate-600">
            The service page you are looking for does not exist.
          </p>
          <Link
            to="/services"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:bg-[#7A6CF5]"
          >
            Back to Services
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f8ff] pt-32">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#0f172a] px-6 py-16 text-white sm:px-10 lg:px-14">
          <div className="max-w-4xl">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#c8c1ff] transition hover:text-white"
            >
              ← Back to Services
            </Link>

            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#c8c1ff]">
              {service.title}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {service.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              {service.heroDescription}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Request This Service
              </Link>

              <Link
                to="/projects"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:bg-white/10"
              >
                View Related Projects
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left side */}
          <div className="space-y-8">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">What we offer</h2>
              <div className="mt-6 grid gap-3">
                {service.features.map((item) => (
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
              <h2 className="text-2xl font-black text-slate-900">How we work</h2>
              <div className="mt-6 space-y-4">
                {service.process.map((step, index) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#6050F0]/10 text-sm font-black text-[#6050F0]">
                      {index + 1}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-8">
            <div className="rounded-[28px] bg-gradient-to-br from-[#6050F0] to-[#7A6CF5] p-8 text-white shadow-[0_20px_60px_rgba(96,80,240,0.2)]">
              <h2 className="text-2xl font-black">Benefits</h2>
              <div className="mt-6 grid gap-3">
                {service.benefits.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm font-semibold text-white"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-slate-900">Who this is for</h2>
              <div className="mt-6 grid gap-3">
                {service.audience.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[#0f172a] p-8 text-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8b0ff]">
                Need this service?
              </p>
              <h3 className="mt-3 text-2xl font-black">
                Let’s build the right solution for your needs
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                AsyncAfrica can help you plan, build, and support a solution that
                matches your goals.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:bg-[#7A6CF5]"
                >
                  Contact Us
                </Link>

                <Link
                  to="/training"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:text-[#c8c1ff]"
                >
                  Explore Training
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}