import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const servicesMenu = [
  { name: "Software Development", href: "/services/software-development" },
  { name: "Networking & Infrastructure", href: "/services/networking" },
  { name: "AI Solutions", href: "/services/ai-solutions" },
  { name: "IoT Solutions", href: "/services/iot-solutions" },
  { name: "Robotics", href: "/services/robotics" },
  { name: "Cybersecurity", href: "/services/cybersecurity" },
  { name: "IT Consulting", href: "/services/it-consulting" },
];

const trainingMenu = [
  { name: "Training Overview", href: "/training" },
  // { name: "Courses", href: "/training/courses" },
  // { name: "Corporate Training", href: "/training/corporate-training" },
  // { name: "Workshops & Bootcamps", href: "/training/bootcamps" },
];

const mainLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

function ChevronIcon({ open = false, dark = false }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""} ${
        dark ? "text-slate-800" : "text-current"
      }`}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon({ dark = false }) {
  return (
    <svg
      className={`h-6 w-6 ${dark ? "text-slate-900" : "text-white"}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 7H20M4 12H20M4 17H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ dark = false }) {
  return (
    <svg
      className={`h-6 w-6 ${dark ? "text-slate-900" : "text-white"}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4 text-[#6050F0]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 text-[#6050F0]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4 text-[#6050F0]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4a2 2 0 0 0-2 2v.01l10 6.49 10-6.5V6a2 2 0 0 0-2-2Zm0 4.43-7.47 4.86a1 1 0 0 1-1.06 0L4 8.43V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.43Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-4 w-4 text-[#6050F0]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

export default function NavHeader() {
  const location = useLocation();
  const pathname = location.pathname;
  const navRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileTrainingOpen, setMobileTrainingOpen] = useState(false);

  const isHome = pathname === "/";
  const transparentMode = isHome && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 70);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setTrainingOpen(false);
    setMobileServicesOpen(false);
    setMobileTrainingOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setServicesOpen(false);
        setTrainingOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const linkBaseClass = transparentMode
    ? "text-white hover:text-[#8e82ff]"
    : "text-slate-800 hover:text-[#6050F0]";

  const buttonTextColor = transparentMode ? "text-white" : "text-slate-800";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* TOP BAR - only before scroll on home */}
      <div
        className={`hidden overflow-hidden bg-white/95 text-slate-700 backdrop-blur-md transition-all duration-500 md:block ${
          transparentMode
            ? "max-h-14 translate-y-0 border-b border-slate-200/80 opacity-100"
            : "max-h-0 -translate-y-full border-b-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-6 text-[13px]">
            <a href="#location" className="flex items-center gap-2 transition hover:text-[#6050F0]">
              <PinIcon />
              <span>Find Our  Location</span>
            </a>

            <a href="tel:+250123456789" className="flex items-center gap-2 transition hover:text-[#6050F0]">
              <PhoneIcon />
              <span>+250 784 434 216</span>
            </a>

            <a
              href="mailto:example@gmail.com"
              className="flex items-center gap-2 transition hover:text-[#6050F0]"
            >
              <MailIcon />
              <span>asyncafrica@gmail.com</span>
            </a>
          </div>

          <div className="flex items-center gap-5 text-[13px]">
            <Link to="/register" className="flex items-center gap-2 transition hover:text-[#6050F0]">
              <UserIcon />
              <span>Register</span>
            </Link>

            {/* <Link to="/login" className="flex items-center gap-2 transition hover:text-[#6050F0]">
              <UserIcon />
              <span>Login</span>
            </Link> */}

            
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div
        ref={navRef}
        className={`transition-all duration-500 ${
          transparentMode
            ? "border-b border-white/10 bg-transparent"
            : "border-b border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/8 backdrop-blur-xl"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 ${
            transparentMode ? "py-4" : "py-3"
          }`}
        >
          {/* LOGO */}
          <Link to="/" className="group flex items-center" aria-label="AsyncAfrica Home">
            <div
              className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
                transparentMode
                  ? "h-[62px] w-[185px] sm:h-[68px] sm:w-[220px] lg:h-[76px] lg:w-[250px]"
                  : "h-[52px] w-[160px] sm:h-[56px] sm:w-[185px] lg:h-[60px] lg:w-[210px]"
              }`}
            >
              <img
                src="/asyncafrica-logo.png"
                alt="AsyncAfrica Logo"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 lg:flex">
            {mainLinks.slice(0, 2).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative text-[15px] font-semibold transition-all duration-300 ${linkBaseClass}`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#6050F0] transition-all duration-300 ${
                    isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}

            {/* SERVICES */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setServicesOpen((prev) => !prev);
                  setTrainingOpen(false);
                }}
                className={`group flex items-center gap-1 text-[15px] font-semibold transition-all duration-300 ${linkBaseClass}`}
              >
                <span className="relative">
                  Services
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#6050F0] transition-all duration-300 ${
                      pathname.startsWith("/services") || servicesOpen
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </span>
                <ChevronIcon open={servicesOpen} dark={!transparentMode} />
              </button>

              <div
                className={`absolute left-0 top-full mt-4 w-80 origin-top overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-all duration-300 ${
                  servicesOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                }`}
              >
                

                <div className="p-2">
                  {servicesMenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block rounded-xl px-4 py-3 text-sm text-slate-700 transition-all duration-300 hover:bg-[#6050F0]/5 hover:pl-5 hover:text-[#6050F0]"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* TRAINING */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTrainingOpen((prev) => !prev);
                  setServicesOpen(false);
                }}
                className={`group flex items-center gap-1 text-[15px] font-semibold transition-all duration-300 ${linkBaseClass}`}
              >
                <span className="relative">
                  Training
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#6050F0] transition-all duration-300 ${
                      pathname.startsWith("/training") || trainingOpen
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </span>
                <ChevronIcon open={trainingOpen} dark={!transparentMode} />
              </button>

              <div
                className={`absolute left-0 top-full mt-4 w-72 origin-top overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-all duration-300 ${
                  trainingOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                }`}
              >
                

                <div className="p-2">
                  {trainingMenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block rounded-xl px-4 py-3 text-sm text-slate-700 transition-all duration-300 hover:bg-[#6050F0]/5 hover:pl-5 hover:text-[#6050F0]"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {mainLinks.slice(2).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative text-[15px] font-semibold transition-all duration-300 ${linkBaseClass}`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#6050F0] transition-all duration-300 ${
                    isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:block">
            <Link
              to="/contact"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-[#6050F0] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6050F0]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#7467ff]"
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[130%]" />
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`inline-flex items-center justify-center rounded-xl border p-2 transition-all duration-300 lg:hidden ${
              transparentMode
                ? "border-white/20 bg-white/10 hover:border-[#6050F0]/60"
                : "border-slate-200 bg-white hover:border-[#6050F0]/60"
            }`}
          >
            {mobileOpen ? (
              <CloseIcon dark={!transparentMode} />
            ) : (
              <MenuIcon dark={!transparentMode} />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`overflow-hidden border-t transition-all duration-300 lg:hidden ${
            mobileOpen
              ? "max-h-[900px] border-slate-200 bg-white opacity-100"
              : "max-h-0 border-transparent bg-white opacity-0"
          }`}
        >
          <div className="px-4 py-4 sm:px-6">
            <div className="space-y-2">
              {mainLinks.slice(0, 2).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-[#6050F0]/10 text-[#6050F0]"
                      : "text-slate-800 hover:bg-slate-50 hover:text-[#6050F0]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* mobile services */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800"
                >
                  <span>Services</span>
                  <ChevronIcon open={mobileServicesOpen} dark />
                </button>

                <div
                  className={`overflow-hidden bg-slate-50 transition-all duration-300 ${
                    mobileServicesOpen ? "max-h-[500px] border-t border-slate-200" : "max-h-0"
                  }`}
                >
                  <div className="space-y-1 p-2">
                    {servicesMenu.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-white hover:text-[#6050F0]"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* mobile training */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMobileTrainingOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800"
                >
                  <span>Training</span>
                  <ChevronIcon open={mobileTrainingOpen} dark />
                </button>

                <div
                  className={`overflow-hidden bg-slate-50 transition-all duration-300 ${
                    mobileTrainingOpen ? "max-h-[400px] border-t border-slate-200" : "max-h-0"
                  }`}
                >
                  <div className="space-y-1 p-2">
                    {trainingMenu.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-white hover:text-[#6050F0]"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {mainLinks.slice(2).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-[#6050F0]/10 text-[#6050F0]"
                      : "text-slate-800 hover:bg-slate-50 hover:text-[#6050F0]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <Link
                to="/contact"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#6050F0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7467ff]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}