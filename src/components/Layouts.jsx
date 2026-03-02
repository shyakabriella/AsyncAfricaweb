import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavHeader from "./NavHeader";

export default function Layouts() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white">
      <NavHeader />

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-xl font-bold text-[#6050F0]">AsyncAfrica</h3>
              <p className="mt-3 text-sm leading-6 text-gray-300">
                Empowering Africa through technology, innovation, software
                solutions, networking, AI, IoT, robotics, and professional
                training.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link to="/about" className="hover:text-[#7A6CF5] transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-[#7A6CF5] transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
                Services
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link
                    to="/services/software-development"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Software Development
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/networking"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Networking
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/ai-solutions"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    AI Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/iot-solutions"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    IoT Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/robotics"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Robotics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/cybersecurity"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Cybersecurity
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
                Training
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link
                    to="/training"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Training Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training/courses"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Courses
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training/corporate-training"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Corporate Training
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training/bootcamps"
                    className="hover:text-[#7A6CF5] transition"
                  >
                    Workshops & Bootcamps
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} AsyncAfrica. All rights reserved.</p>
            <p className="text-[#7A6CF5]">Built with innovation for Africa 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  );
}