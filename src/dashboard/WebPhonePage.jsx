import WebPhone from "../components/WebPhone";

export default function WebPhonePage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
          AsyncAfrica Calling
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Browser Web Phone
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          This phone runs inside your website using WebRTC. Users do not need
          MicroSIP on their local computer for this page.
        </p>
      </div>

      <WebPhone />
    </div>
  );
}