import { Link } from "react-router-dom";

const services = [
  {
    title: "Software Development",
    description:
      "Custom web, mobile, desktop, and business systems built to solve real problems and improve operations.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M8.7 16.6 3.1 11l5.6-5.6 1.4 1.4L5.9 11l4.2 4.2-1.4 1.4Zm6.6 0-1.4-1.4 4.2-4.2-4.2-4.2 1.4-1.4 5.6 5.6-5.6 5.6Z" />
      </svg>
    ),
  },
  {
    title: "Networking & Infrastructure",
    description:
      "Reliable network setup, Wi-Fi deployment, cabling, routers, switches, servers, and IT infrastructure support.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3c-4.97 0-9 1.79-9 4v2h18V7c0-2.21-4.03-4-9-4Zm-9 8v3c0 2.21 4.03 4 9 4s9-1.79 9-4v-3c-2.06 1.37-5.52 2-9 2s-6.94-.63-9-2Zm0 6v1c0 2.21 4.03 4 9 4s9-1.79 9-4v-1c-2.06 1.37-5.52 2-9 2s-6.94-.63-9-2Z" />
      </svg>
    ),
  },
  {
    title: "Artificial Intelligence",
    description:
      "AI-powered tools, automation, smart assistants, data intelligence, and modern business solutions for growth.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2a3 3 0 0 1 3 3v1.1a5 5 0 0 1 2.9 2.9H19a3 3 0 1 1 0 6h-1.1a5 5 0 0 1-2.9 2.9V19a3 3 0 1 1-6 0v-1.1A5 5 0 0 1 6.1 15H5a3 3 0 1 1 0-6h1.1A5 5 0 0 1 9 6.1V5a3 3 0 0 1 3-3Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      </svg>
    ),
  },
  {
    title: "IoT Solutions",
    description:
      "Connected devices, monitoring systems, automation platforms, and smart solutions for homes, offices, and industry.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 1 0-14 0H3a9 9 0 0 1 9-9Zm0 4a5 5 0 0 1 5 5h-2a3 3 0 1 0-6 0H7a5 5 0 0 1 5-5Zm-1 6h2v8h-2v-8Z" />
      </svg>
    ),
  },
  {
    title: "Robotics & Automation",
    description:
      "Robotics learning, prototypes, automation systems, and innovation-focused technology for future-ready solutions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M9 2h6v2h-2v2.07A7.002 7.002 0 0 1 19 13v6h2v2H3v-2h2v-6a7.002 7.002 0 0 1 6-6.93V4H9V2Zm-2 9v2h2v-2H7Zm8 0v2h2v-2h-2Zm-6 6h6v-2H9v2Z" />
      </svg>
    ),
  },
  {
    title: "Tech Training & Capacity Building",
    description:
      "Practical training programs in software, networking, AI, IoT, robotics, and digital skills for students and professionals.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-7 9.18V16l7 3.82L19 16v-3.82l-7 3.82-7-3.82Z" />
      </svg>
    ),
  },
];

export default function CoreServices() {
  return (
    <section className="relative overflow-hidden bg-[#f8f8ff] py-20 sm:py-24">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6050F0]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#7A6CF5]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
            Our Core Services
          </div>

          <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Smart technology services built for{" "}
            <span className="text-[#6050F0]">business growth</span> and digital
            transformation
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            AsyncAfrica provides modern IT solutions that help businesses,
            institutions, and innovators build, connect, automate, and grow
            using the right technologies.
          </p>
        </div>

        {/* cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
              style={{
                animation: "fadeUp 0.8s ease forwards",
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="inline-flex rounded-2xl bg-[#6050F0]/10 p-4 text-[#6050F0] transition duration-300 group-hover:bg-[#6050F0] group-hover:text-white">
                {service.icon}
              </div>

              <h3 className="mt-6 text-xl font-black text-slate-900">
                {service.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {service.description}
              </p>

              <div className="mt-6">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6050F0] transition duration-300 hover:gap-3"
                >
                  Learn More
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* bottom CTA */}
        <div className="mt-14 rounded-[32px] bg-[#0f172a] px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a89fff]">
                End-to-End Technology Support
              </p>
              <h3 className="mt-3 text-2xl font-black sm:text-3xl">
                Need a custom solution for your business or institution?
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                We combine technical expertise, innovation, and practical
                implementation to deliver solutions that match your goals.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Request a Consultation
              </Link>

              <Link
                to="/projects"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:border-[#7A6CF5] hover:text-[#c8c1ff]"
              >
                View Projects
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
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