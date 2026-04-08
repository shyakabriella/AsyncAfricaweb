import { Link } from "react-router-dom";
import { ArrowLeft, PhoneCall } from "lucide-react";
import WebPhone from "../components/WebPhone";

export default function WebPhonePage() {
  return (
    <div className="h-[100svh] overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef4ff_30%,_#f8fafc_65%,_#e2e8f0_100%)] px-4 py-4">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
        {/* top bar */}
        <div className="flex items-center justify-between pb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>

          <div className="hidden items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur sm:inline-flex">
            <PhoneCall className="h-4 w-4 text-blue-600" />
            Customer Support
          </div>
        </div>

        {/* centered phone */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* side buttons */}
            <div className="absolute -left-[4px] top-28 h-14 w-[4px] rounded-full bg-slate-700/70" />
            <div className="absolute -left-[4px] top-48 h-20 w-[4px] rounded-full bg-slate-700/70" />
            <div className="absolute -right-[4px] top-40 h-24 w-[4px] rounded-full bg-slate-700/70" />

            {/* phone frame */}
            <div className="w-[320px] sm:w-[360px]">
              <div className="rounded-[44px] bg-[#0f172a] p-[10px] shadow-[0_35px_90px_rgba(15,23,42,0.30)]">
                <div className="relative aspect-[9/19.2] overflow-hidden rounded-[36px] bg-gradient-to-b from-slate-100 via-white to-slate-100">
                  {/* notch */}
                  <div className="absolute left-1/2 top-3 z-20 h-7 w-36 -translate-x-1/2 rounded-full bg-black" />

                  {/* screen */}
                  <div className="flex h-full flex-col px-3 pb-3 pt-14 sm:px-4">
                    <div className="mb-3 rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                        AsyncAfrica Calling
                      </p>
                      <h1 className="mt-1 text-lg font-bold text-slate-900">
                        Support Phone
                      </h1>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Call support directly from your browser.
                      </p>
                    </div>

                    <div className="min-h-0 flex-1">
                      <WebPhone />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="pt-3 text-center text-xs text-slate-500">
          Allow microphone access if your browser asks.
        </p>
      </div>
    </div>
  );
}