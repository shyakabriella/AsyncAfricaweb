import { Link } from "react-router-dom";

const courses = [
  {
    title: "Web Development",
    level: "Beginner to Intermediate",
    duration: "8 Weeks",
    description:
      "Learn how to design and build modern websites and web applications using current development tools and frameworks.",
    topics: ["HTML", "CSS", "JavaScript", "React"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M3 5h18v14H3V5Zm2 2v10h14V7H5Zm2 2h4v2H7V9Zm0 4h6v2H7v-2Z" />
      </svg>
    ),
  },
  {
    title: "Networking Essentials",
    level: "Beginner",
    duration: "6 Weeks",
    description:
      "Build practical knowledge in computer networking, devices, cabling, IP addressing, routing, and infrastructure support.",
    topics: ["LAN/WAN", "Routing", "Switching", "Cabling"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M4 6h16v4H4V6Zm2 6h12v6H6v-6Zm2 2v2h2v-2H8Zm4 0v2h2v-2h-2Z" />
      </svg>
    ),
  },
  {
    title: "Artificial Intelligence",
    level: "Intermediate",
    duration: "8 Weeks",
    description:
      "Understand AI concepts, practical tools, data-driven systems, automation, and intelligent digital solutions.",
    topics: ["AI Basics", "Automation", "ML Concepts", "Tools"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2a3 3 0 0 1 3 3v1.1a5 5 0 0 1 2.9 2.9H19a3 3 0 1 1 0 6h-1.1a5 5 0 0 1-2.9 2.9V19a3 3 0 1 1-6 0v-1.1A5 5 0 0 1 6.1 15H5a3 3 0 1 1 0-6h1.1A5 5 0 0 1 9 6.1V5a3 3 0 0 1 3-3Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      </svg>
    ),
  },
  {
    title: "IoT Fundamentals",
    level: "Intermediate",
    duration: "6 Weeks",
    description:
      "Explore connected devices, sensors, smart systems, monitoring tools, and real-world IoT applications.",
    topics: ["Sensors", "Devices", "Automation", "Dashboards"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 1 0-14 0H3a9 9 0 0 1 9-9Zm0 4a5 5 0 0 1 5 5h-2a3 3 0 1 0-6 0H7a5 5 0 0 1 5-5Zm-1 6h2v8h-2v-8Z" />
      </svg>
    ),
  },
  {
    title: "Robotics Basics",
    level: "Beginner to Intermediate",
    duration: "6 Weeks",
    description:
      "Get introduced to robotics, automation, control logic, and hands-on practical innovation projects.",
    topics: ["Robotics", "Automation", "Control", "Prototyping"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M9 2h6v2h-2v2.07A7.002 7.002 0 0 1 19 13v6h2v2H3v-2h2v-6a7.002 7.002 0 0 1 6-6.93V4H9V2Zm-2 9v2h2v-2H7Zm8 0v2h2v-2h-2Zm-6 6h6v-2H9v2Z" />
      </svg>
    ),
  },
  {
    title: "Cybersecurity Basics",
    level: "Beginner",
    duration: "5 Weeks",
    description:
      "Learn digital safety, cyber risk awareness, system protection, and the foundation of secure technology practices.",
    topics: ["Security", "Awareness", "Protection", "Best Practices"],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 1 4 4v6c0 5.25 3.4 10.17 8 11 4.6-.83 8-5.75 8-11V4l-8-3Zm0 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-1 2h2v4h-2v-4Z" />
      </svg>
    ),
  },
];

export default function FeaturedCourses() {
  return (
    <section className="relative overflow-hidden bg-[#f8f8ff] py-20 sm:py-24">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6050F0]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#7A6CF5]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-[#6050F0]/15 bg-[#6050F0]/8 px-4 py-2 text-sm font-semibold text-[#6050F0]">
            Featured Courses
          </div>

          <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Learn the skills that power{" "}
            <span className="text-[#6050F0]">modern technology</span>
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            Our programs are designed to give learners practical experience,
            confidence, and relevant digital skills for real-world work and innovation.
          </p>
        </div>

        {/* course cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => (
            <div
              key={course.title}
              className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:border-[#6050F0]/25 hover:shadow-[0_24px_60px_rgba(96,80,240,0.12)]"
              style={{
                animation: "fadeUpCourse 0.8s ease forwards",
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex rounded-2xl bg-[#6050F0]/10 p-4 text-[#6050F0] transition duration-300 group-hover:bg-[#6050F0] group-hover:text-white">
                  {course.icon}
                </div>

                <div className="rounded-full bg-[#7A6CF5]/10 px-3 py-1 text-xs font-bold text-[#6050F0]">
                  {course.duration}
                </div>
              </div>

              <h3 className="mt-6 text-xl font-black text-slate-900">
                {course.title}
              </h3>

              <p className="mt-2 text-sm font-semibold text-[#6050F0]">
                {course.level}
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {course.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {course.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-[#6050F0]/30 hover:bg-[#6050F0]/5 hover:text-[#6050F0]"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/training"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6050F0] transition duration-300 hover:gap-3"
                >
                  View Program
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* bottom CTA */}
        <div className="mt-14 rounded-[32px] border border-[#6050F0]/10 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6050F0]">
                Flexible Learning
              </p>
              <h3 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                Want a custom training path for your team or institution?
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                We can organize practical technology training for schools, companies,
                youth programs, and institutions based on your goals.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Request Training
              </Link>

              <Link
                to="/training"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-7 py-3.5 text-sm font-bold text-slate-800 transition duration-300 hover:border-[#6050F0] hover:text-[#6050F0]"
              >
                See All Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUpCourse {
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