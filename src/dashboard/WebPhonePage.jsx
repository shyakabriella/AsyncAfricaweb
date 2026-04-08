import WebPhone from "../components/WebPhone";
import { Headphones, PhoneCall, ShieldCheck } from "lucide-react";

export default function WebPhonePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f8fafc_35%,_#e2e8f0_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
            AsyncAfrica Calling
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Customer Support Phone
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Call customer support directly from the website in a simple mobile
            phone style experience. No login and no MicroSIP needed.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="order-2 lg:order-1">
            <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <PhoneCall className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Fast Customer Support
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Customers can open the phone support page and call directly
                    from browser. It works like a web phone inside your website.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Call Support
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    One tap to connect customers with your support center.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Browser Based
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    No desktop softphone app is needed for customers.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Secure Access
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Uses your WebRTC browser phone with secure connection.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                Tip: For the best mobile experience, allow microphone access and
                open the phone support page directly from your website support
                button.
              </div>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative">
              {/* Side buttons */}
              <div className="absolute -left-[5px] top-28 h-16 w-[4px] rounded-full bg-slate-700/70" />
              <div className="absolute -left-[5px] top-48 h-24 w-[4px] rounded-full bg-slate-700/70" />
              <div className="absolute -right-[5px] top-40 h-28 w-[4px] rounded-full bg-slate-700/70" />

              {/* Phone body */}
              <div className="relative w-[360px] rounded-[46px] bg-[#0f172a] p-[10px] shadow-[0_35px_120px_rgba(15,23,42,0.35)] sm:w-[390px]">
                <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-b from-slate-100 via-white to-slate-100">
                  {/* Dynamic island */}
                  <div className="absolute left-1/2 top-3 z-20 h-7 w-36 -translate-x-1/2 rounded-full bg-black" />

                  {/* Screen content */}
                  <div className="h-[760px] overflow-y-auto px-3 pb-4 pt-14 sm:px-4">
                    <div className="mb-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600">
                        Support Call
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">
                        iPhone Style Web Phone
                      </h2>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        Customers can place support calls directly here.
                      </p>
                    </div>

                    <WebPhone />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}