import WebPhone from "../components/WebPhone";
import { PhoneCall } from "lucide-react";

export default function WebPhonePage() {
  return (
    <div className="h-[100svh] overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef4ff_30%,_#f8fafc_65%,_#e2e8f0_100%)] px-4 py-4">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center">
        <div className="mb-5 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-600">
            AsyncAfrica Calling
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Customer Support Phone
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Call customer support directly from the website in a clean mobile
            phone style experience.
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Left side buttons */}
          <div className="absolute -left-[4px] top-28 h-14 w-[4px] rounded-full bg-slate-700/70" />
          <div className="absolute -left-[4px] top-48 h-20 w-[4px] rounded-full bg-slate-700/70" />

          {/* Right side button */}
          <div className="absolute -right-[4px] top-40 h-24 w-[4px] rounded-full bg-slate-700/70" />

          {/* iPhone frame */}
          <div className="w-[320px] sm:w-[360px]">
            <div className="rounded-[44px] bg-[#0f172a] p-[10px] shadow-[0_35px_90px_rgba(15,23,42,0.30)]">
              <div className="relative aspect-[9/19.2] overflow-hidden rounded-[36px] bg-gradient-to-b from-slate-100 via-white to-slate-100">
                {/* notch */}
                <div className="absolute left-1/2 top-3 z-20 h-7 w-36 -translate-x-1/2 rounded-full bg-black" />

                {/* screen */}
                <div className="flex h-full flex-col px-3 pb-3 pt-14 sm:px-4">
                  <div className="mb-3 rounded-[26px] border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600">
                          Support Call
                        </p>
                        <h2 className="truncate text-lg font-bold text-slate-900">
                          Call Center
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1">
                    <WebPhone />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Allow microphone access if your browser asks.
        </p>
      </div>
    </div>
  );
}