import { useState } from "react";

const contactInfo = [
  {
    title: "Email Address",
    value: "info@asyncafrica.com",
  },
  {
    title: "Phone Number",
    value: "+250 123 456 789",
  },
  {
    title: "Location",
    value: "Kigali, Rwanda",
  },
  {
    title: "Working Hours",
    value: "Monday - Saturday, 8:00 AM - 6:00 PM",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your message has been captured successfully.");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <section className="min-h-screen bg-[#f8f8ff] pt-32">
      {/* hero */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#0f172a] px-6 py-16 text-white sm:px-10 lg:px-14">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#c8c1ff]">
              Contact Us
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Let’s talk about your{" "}
              <span className="text-[#7A6CF5]">project, service, or training needs</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Whether you need a software solution, networking support,
              technology consulting, or training, AsyncAfrica is ready to hear
              from you.
            </p>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* left */}
          <div className="space-y-8">
            <div className="rounded-[28px] bg-gradient-to-br from-[#6050F0] to-[#7A6CF5] p-8 text-white shadow-[0_20px_60px_rgba(96,80,240,0.2)]">
              <h2 className="text-2xl font-black">Get in touch</h2>
              <p className="mt-4 text-sm leading-7 text-white/90 sm:text-base">
                We would love to discuss your ideas, technology needs, and
                opportunities for collaboration.
              </p>

              <div className="mt-6 space-y-4">
                {contactInfo.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm font-bold text-white sm:text-base">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6050F0]">
                Why contact us?
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "Request software development support",
                  "Ask about networking and infrastructure services",
                  "Explore AI, IoT, and robotics solutions",
                  "Book technology training or corporate sessions",
                  "Discuss partnerships and collaborations",
                ].map((item) => (
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

          {/* right */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Send us a message
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Fill in the form below and we will get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#6050F0] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#6050F0] focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#6050F0] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter subject"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#6050F0] focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#6050F0] focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#6050F0] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}