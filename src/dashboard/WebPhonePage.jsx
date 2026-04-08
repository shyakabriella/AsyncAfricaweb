import { Link } from "react-router-dom";
import { ArrowLeft, PhoneCall } from "lucide-react";
import WebPhone from "../components/WebPhone";

export default function WebPhonePage() {
  return (
    <div className="h-[100svh] overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef4ff_30%,_#f8fafc_65%,_#e2e8f0_100%)] px-4 py-3">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
        <div className="flex items-center justify-between pb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>

          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm sm:inline-flex">
            <PhoneCall className="h-4 w-4 text-blue-600" />
            Customer Support
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="relative">
            <div className="absolute -left-[4px] top-24 h-12 w-[4px] rounded-full bg-slate-700/70" />
            <div className="absolute -left-[4px] top-40 h-16 w-[4px] rounded-full bg-slate-700/70" />
            <div className="absolute -right-[4px] top-32 h-20 w-[4px] rounded-full bg-slate-700/70" />

            <div className="w-[300px] sm:w-[330px]">
              <div className="rounded-[42px] bg-[#0f172a] p-[9px] shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
                <div className="relative aspect-[9/18] overflow-hidden rounded-[34px] bg-gradient-to-b from-slate-100 via-white to-slate-100">
                  <div className="absolute left-1/2 top-3 z-20 h-7 w-32 -translate-x-1/2 rounded-full bg-black" />

                  <div className="flex h-full flex-col px-3 pb-3 pt-14 sm:px-4">
                    <div className="mb-3 rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                        AsyncAfrica Calling
                      </p>
                      <h1 className="mt-1 text-lg font-bold text-slate-900">
                        Support Phone
                      </h1>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Call customer support directly from your browser.
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

        <p className="pt-2 text-center text-[11px] text-slate-500">
          Allow microphone access if your browser asks.
        </p>
      </div>
    </div>
  );
}