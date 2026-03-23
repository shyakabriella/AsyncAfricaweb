import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_HOME_DATA = {
  page_key: "home",
  hero_badge: "AsyncAfrica Technology",
  hero_title: "Building Africa’s",
  hero_highlight: "Digital Future",
  hero_description:
    "AsyncAfrica delivers modern technology solutions in software development, networking, AI, IoT, robotics, and professional training. We help businesses, institutions, and young innovators grow through smart digital transformation.",
  hero_media_type: "image",
  hero_media_url: "/hero-tech.jpg",
  hero_media_poster: null,
  hero_media_alt: "AsyncAfrica Technology",
  hero_media_settings: {
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
  },
  primary_button_text: "Start Your Project",
  primary_button_link: "/contact",
  secondary_button_text: "Explore Training",
  secondary_button_link: "/training",
  tags: [
    "Software Development",
    "Networking",
    "Artificial Intelligence",
    "IoT Solutions",
    "Robotics",
    "IT Training",
  ],
  stats: [
    { value: "50+", label: "Projects" },
    { value: "10+", label: "Tech Services" },
    { value: "100+", label: "Trainees" },
    { value: "24/7", label: "Support" },
  ],
  dashboard_label: "AsyncAfrica Systems",
  dashboard_title: "Innovation Dashboard",
  dashboard_growth_label: "Digital Growth",
  dashboard_growth_value: "+84%",
  dashboard_cards: [
    { label: "AI Solutions", value: "12+", type: "metric" },
    { label: "Active Training", value: "08", type: "metric" },
  ],
  dashboard_focus_tags: ["Web", "Mobile", "Cloud", "AI", "IoT"],
  floating_cards: [
    {
      eyebrow: "AsyncAfrica offers You",
      title: "Smart Innovation",
      icon: "alert",
    },
    {
      eyebrow: "Professional",
      title: "Tech Training",
      icon: "menu",
    },
  ],
  gallery_items: [],
};

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function getApiBaseUrl() {
  return normalizeBaseUrl(
    import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api"
  );
}

function getHomepageEndpoint(pageKey = "home") {
  const base = getApiBaseUrl();
  const finalBase = /\/api$/i.test(base) ? base : `${base}/api`;
  return `${finalBase}/homepage/${pageKey}`;
}

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function getGrowthPercent(value) {
  const text = String(value || "");
  const match = text.match(/-?\d+(\.\d+)?/);

  if (!match) return 84;

  return clamp(parseFloat(match[0]), 0, 100);
}

function normalizeHomepageData(data) {
  return {
    ...DEFAULT_HOME_DATA,
    ...data,
    hero_media_settings: {
      ...DEFAULT_HOME_DATA.hero_media_settings,
      ...(data?.hero_media_settings || {}),
    },
    hero_media_url:
      data?.hero_media_url ||
      data?.hero_image ||
      DEFAULT_HOME_DATA.hero_media_url,
    hero_media_type:
      data?.hero_media_type ||
      (data?.hero_image ? "image" : DEFAULT_HOME_DATA.hero_media_type),
    tags:
      Array.isArray(data?.tags) && data.tags.length
        ? data.tags
        : DEFAULT_HOME_DATA.tags,
    stats:
      Array.isArray(data?.stats) && data.stats.length
        ? data.stats
        : DEFAULT_HOME_DATA.stats,
    dashboard_cards:
      Array.isArray(data?.dashboard_cards) && data.dashboard_cards.length
        ? data.dashboard_cards
        : DEFAULT_HOME_DATA.dashboard_cards,
    dashboard_focus_tags:
      Array.isArray(data?.dashboard_focus_tags) && data.dashboard_focus_tags.length
        ? data.dashboard_focus_tags
        : DEFAULT_HOME_DATA.dashboard_focus_tags,
    floating_cards:
      Array.isArray(data?.floating_cards) && data.floating_cards.length
        ? data.floating_cards
        : DEFAULT_HOME_DATA.floating_cards,
    gallery_items:
      Array.isArray(data?.gallery_items) && data.gallery_items.length
        ? data.gallery_items
        : DEFAULT_HOME_DATA.gallery_items,
  };
}

function FloatingIcon({ name }) {
  const icon = String(name || "").toLowerCase();

  if (["alert", "warning"].includes(icon)) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 2 1 21h22L12 2Zm0 4.8L19.53 19H4.47L12 6.8ZM11 10v4h2v-4h-2Zm0 6v2h2v-2h-2Z" />
      </svg>
    );
  }

  if (["menu", "list"].includes(icon)) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M4 6h16v2H4V6Zm0 5h10v2H4v-2Zm0 5h16v2H4v-2Z" />
      </svg>
    );
  }

  if (["chart", "graph", "analytics"].includes(icon)) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M3 13h4v8H3v-8Zm7-6h4v14h-4V7Zm7-4h4v18h-4V3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="m12 3 1.7 4.4L18 9l-4.3 1.6L12 15l-1.7-4.4L6 9l4.3-1.6L12 3Zm7 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5ZM5 14l.8 1.8 1.8.8-1.8.8L5 19l-.8-1.8-1.8-.8 1.8-.8L5 14Z" />
    </svg>
  );
}

function HeroMedia({ content }) {
  const mediaType = content.hero_media_type;
  const mediaUrl = content.hero_media_url || DEFAULT_HOME_DATA.hero_media_url;
  const mediaPoster = content.hero_media_poster || undefined;
  const mediaAlt = content.hero_media_alt || DEFAULT_HOME_DATA.hero_media_alt;
  const settings = content.hero_media_settings || DEFAULT_HOME_DATA.hero_media_settings;

  if (mediaType === "video" && mediaUrl) {
    return (
      <video
        className="animate-bg h-full w-full object-cover object-center opacity-25"
        src={mediaUrl}
        poster={mediaPoster}
        autoPlay={!!settings.autoplay}
        muted={!!settings.muted}
        loop={!!settings.loop}
        controls={!!settings.controls}
        playsInline
      />
    );
  }

  return (
    <img
      src={mediaUrl}
      alt={mediaAlt}
      className="animate-bg h-full w-full object-cover object-center opacity-25"
    />
  );
}

export default function Wellcome() {
  const [content, setContent] = useState(DEFAULT_HOME_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchHomepageContent() {
      try {
        const response = await fetch(getHomepageEndpoint("home"), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const json = await response.json();

        if (!response.ok || !json?.success) {
          throw new Error(json?.message || "Failed to load homepage content.");
        }

        if (!isMounted) return;

        setContent(normalizeHomepageData(json.data || {}));
      } catch (error) {
        if (!isMounted) return;
        setContent(DEFAULT_HOME_DATA);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHomepageContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const growthPercent = useMemo(
    () => getGrowthPercent(content.dashboard_growth_value),
    [content.dashboard_growth_value]
  );

  const visibleStats = useMemo(
    () => (content.stats || []).slice(0, 4),
    [content.stats]
  );

  const visibleDashboardCards = useMemo(
    () => (content.dashboard_cards || []).slice(0, 2),
    [content.dashboard_cards]
  );

  const visibleFloatingCards = useMemo(
    () => (content.floating_cards || []).slice(0, 2),
    [content.floating_cards]
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeRight {
          0% {
            opacity: 0;
            transform: translateX(-40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeLeft {
          0% {
            opacity: 0;
            transform: translateX(40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes floatY {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(96, 80, 240, 0.0);
          }
          50% {
            box-shadow: 0 0 30px rgba(96, 80, 240, 0.35);
          }
        }

        @keyframes zoomBg {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }

        @keyframes scrollDot {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(8px);
          }
          100% {
            opacity: 0;
            transform: translateY(16px);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.9s ease forwards;
        }

        .animate-fade-right {
          animation: fadeRight 0.9s ease forwards;
        }

        .animate-fade-left {
          animation: fadeLeft 0.9s ease forwards;
        }

        .animate-float {
          animation: floatY 4s ease-in-out infinite;
        }

        .animate-glow {
          animation: pulseGlow 3.5s ease-in-out infinite;
        }

        .animate-bg {
          animation: zoomBg 12s ease-in-out infinite alternate;
        }

        .scroll-dot {
          animation: scrollDot 1.8s infinite;
        }
      `}</style>

      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        {/* Background media */}
        <div className="absolute inset-0">
          <HeroMedia content={content} />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-[#6050F0]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,108,245,0.25),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(96,80,240,0.2),transparent_35%)]" />
        </div>

        {/* Decorative blurred orbs */}
        <div className="absolute left-[-80px] top-40 h-72 w-72 rounded-full bg-[#6050F0]/20 blur-3xl" />
        <div className="absolute bottom-10 right-[-60px] h-80 w-80 rounded-full bg-[#7A6CF5]/20 blur-3xl" />
        <div className="absolute right-[20%] top-[15%] h-20 w-20 rounded-full bg-[#6050F0]/30 blur-2xl" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-16 pt-40 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-14 lg:grid-cols-2">
            {/* Left content */}
            <div className="max-w-3xl">
              {content.hero_badge ? (
                <div
                  className="animate-fade-up inline-flex rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#c9c3ff]"
                  style={{ animationDelay: "0.05s" }}
                >
                  {content.hero_badge}
                </div>
              ) : null}

              <h3
                className="animate-fade-up mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-7xl"
                style={{ animationDelay: "0.2s" }}
              >
                {content.hero_title}
                <span className="block bg-gradient-to-r from-[#6050F0] via-[#7A6CF5] to-white bg-clip-text text-transparent">
                  {content.hero_highlight}
                </span>
              </h3>

              <p
                className="animate-fade-up mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-gray-300 sm:text-lg"
                style={{ animationDelay: "0.35s" }}
              >
                {content.hero_description}
              </p>

              <div
                className="animate-fade-up mt-8 flex flex-col gap-4 sm:flex-row"
                style={{ animationDelay: "0.5s" }}
              >
                <Link
                  to={content.primary_button_link || "/contact"}
                  className="animate-glow inline-flex items-center justify-center rounded-full bg-[#6050F0] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#7A6CF5]"
                >
                  {content.primary_button_text || "Start Your Project"}
                </Link>

                <Link
                  to={content.secondary_button_link || "/training"}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:border-[#7A6CF5] hover:bg-[#6050F0]/10"
                >
                  {content.secondary_button_text || "Explore Training"}
                </Link>
              </div>

              <div
                className="animate-fade-up mt-8 flex flex-wrap gap-3"
                style={{ animationDelay: "0.65s" }}
              >
                {(content.tags || []).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 backdrop-blur-sm transition hover:border-[#7A6CF5]/40 hover:bg-[#6050F0]/10"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div
                className="animate-fade-up mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
                style={{ animationDelay: "0.8s" }}
              >
                {visibleStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-md"
                  >
                    <div className="text-2xl font-black text-[#7A6CF5]">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="mt-5 text-sm text-gray-400">
                  Loading homepage content...
                </div>
              ) : null}
            </div>

            {/* Right content */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto h-[560px] w-full max-w-[520px]">
                {/* Main panel */}
                <div className="animate-fade-left absolute left-10 top-14 w-[360px] rounded-[28px] border border-white/10 bg-white/[0.08] p-6 backdrop-blur-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">
                        {content.dashboard_label || "AsyncAfrica Systems"}
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-white">
                        {content.dashboard_title || "Innovation Dashboard"}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                        <path d="M3 13h4v8H3v-8Zm7-6h4v14h-4V7Zm7-4h4v18h-4V3Z" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-black/30 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          {content.dashboard_growth_label || "Digital Growth"}
                        </span>
                        <span className="text-sm font-bold text-[#7A6CF5]">
                          {content.dashboard_growth_value || "+84%"}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6050F0] to-[#7A6CF5]"
                          style={{ width: `${growthPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {visibleDashboardCards.map((card, index) => (
                        <div key={`${card.label}-${index}`} className="rounded-2xl bg-black/30 p-4">
                          <p className="text-xs uppercase tracking-wider text-gray-400">
                            {card.label}
                          </p>
                          <h4 className="mt-2 text-2xl font-black text-white">
                            {card.value}
                          </h4>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-black/30 p-4">
                      <p className="text-sm text-gray-300">Core Focus</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(content.dashboard_focus_tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#6050F0]/20 px-3 py-1 text-xs font-semibold text-[#c9c3ff]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 1 */}
                {visibleFloatingCards[0] ? (
                  <div className="animate-float absolute left-0 top-0 w-60 rounded-3xl border border-white/10 bg-[#0f0f18]/80 p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#6050F0]/20 p-3 text-[#7A6CF5]">
                        <FloatingIcon name={visibleFloatingCards[0].icon} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {visibleFloatingCards[0].eyebrow}
                        </p>
                        <h4 className="text-base font-bold text-white">
                          {visibleFloatingCards[0].title}
                        </h4>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Floating Card 2 */}
                {visibleFloatingCards[1] ? (
                  <div
                    className="animate-float absolute bottom-14 right-2 w-64 rounded-3xl border border-white/10 bg-[#0f0f18]/80 p-5 backdrop-blur-xl"
                    style={{ animationDelay: "1.2s" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#7A6CF5]/20 p-3 text-[#7A6CF5]">
                        <FloatingIcon name={visibleFloatingCards[1].icon} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {visibleFloatingCards[1].eyebrow}
                        </p>
                        <h4 className="text-base font-bold text-white">
                          {visibleFloatingCards[1].title}
                        </h4>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Floating circle */}
                <div className="absolute right-12 top-10 h-20 w-20 rounded-full border border-[#7A6CF5]/30 bg-[#6050F0]/10 blur-[1px]" />
                <div className="absolute bottom-0 left-16 h-28 w-28 rounded-full bg-[#6050F0]/15 blur-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center lg:flex">
          <span className="mb-3 text-xs uppercase tracking-[0.3em] text-gray-400">
            Scroll
          </span>
          <div className="flex h-14 w-8 justify-center rounded-full border border-white/20">
            <div className="scroll-dot mt-2 h-3 w-3 rounded-full bg-[#7A6CF5]" />
          </div>
        </div>
      </section>
    </>
  );
}