import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavHeader from "./NavHeader";

export default function Layouts() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyOverflowX = body.style.overflowX;
    const prevRootOverflowX = root?.style.overflowX || "";

    html.style.overflowX = "hidden";
    body.style.overflowX = "hidden";

    if (root) {
      root.style.overflowX = "hidden";
    }

    return () => {
      html.style.overflowX = prevHtmlOverflowX;
      body.style.overflowX = prevBodyOverflowX;

      if (root) {
        root.style.overflowX = prevRootOverflowX;
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-black text-white">
      <NavHeader />

      <main className="min-w-0 flex-1 overflow-x-hidden">
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
                  <Link to="/about" className="transition hover:text-[#7A6CF5]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects"
                    className="transition hover:text-[#7A6CF5]"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="transition hover:text-[#7A6CF5]">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="transition hover:text-[#7A6CF5]"
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
                    className="transition hover:text-[#7A6CF5]"
                  >
                    Software Development
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/networking"
                    className="transition hover:text-[#7A6CF5]"
                  >
                    Networking
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/ai-solutions"
                    className="transition hover:text-[#7A6CF5]"
                  >
                    AI Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/iot-solutions"
                    className="transition hover:text-[#7A6CF5]"
                  >
                    IoT Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/robotics"
                    className="transition hover:text-[#7A6CF5]"
                  >
                    Robotics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/cybersecurity"
                    className="transition hover:text-[#7A6CF5]"
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
                    className="transition hover:text-[#7A6CF5]"
                  >
                    Training Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training/courses"
                    className="transition hover:text-[#7A6CF5]"
                  >
                    Courses
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training/corporate-training"
                    className="transition hover:text-[#7A6CF5]"
                  >
                    Corporate Training
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training/bootcamps"
                    className="transition hover:text-[#7A6CF5]"
                  >
                    Workshops & Bootcamps
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} AsyncAfrica. All rights reserved.</p>
            <p className="text-[#7A6CF5]">Built with innovation for Africa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}