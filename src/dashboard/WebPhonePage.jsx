import WebPhone from "../components/WebPhone";

export default function WebPhonePage() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef4ff_32%,_#f8fafc_65%,_#e2e8f0_100%)] px-4 py-4">
      <div className="relative w-[312px] sm:w-[330px]">
        {/* side buttons */}
        <div className="absolute -left-[4px] top-24 h-12 w-[4px] rounded-full bg-slate-700/70" />
        <div className="absolute -left-[4px] top-40 h-16 w-[4px] rounded-full bg-slate-700/70" />
        <div className="absolute -right-[4px] top-32 h-20 w-[4px] rounded-full bg-slate-700/70" />

        <div className="rounded-[42px] bg-[#0f172a] p-[9px] shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
          <div className="relative aspect-[9/18.5] overflow-hidden rounded-[34px] bg-gradient-to-b from-slate-50 via-white to-slate-100">
            {/* notch */}
            <div className="absolute left-1/2 top-3 z-20 h-7 w-32 -translate-x-1/2 rounded-full bg-black" />

            {/* phone screen */}
            <div className="h-full px-3 pb-3 pt-12 sm:px-4">
              <WebPhone />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}