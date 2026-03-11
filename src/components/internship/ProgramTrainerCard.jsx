export default function ProgramTrainerCard({
  program,
  trainers,
  saving,
  onAssignTrainer,
  onUnassignTrainer,
}) {
  const currentTrainerId =
    program?.raw?.trainer?.id ||
    program?.raw?.trainer_id ||
    program?.raw?.assigned_trainer?.id ||
    "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900">Trainer Assignment</h3>
          <p className="mt-1 text-xs text-slate-500">
            {program
              ? `Assign trainer to ${program.title}`
              : "Select a program first"}
          </p>
        </div>
      </div>

      {!program ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          Please select a program.
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
              Current Trainer
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {program.trainerName || "-"}
            </p>

            {program.trainerName && program.trainerName !== "-" ? (
              <button
                type="button"
                onClick={onUnassignTrainer}
                disabled={saving}
                className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Remove Trainer"}
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {trainers.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No trainer found.
              </div>
            ) : (
              trainers.map((trainer, index) => {
                const trainerId = trainer?.id || index;
                const trainerName =
                  trainer?.name ||
                  `${trainer?.first_name || ""} ${trainer?.last_name || ""}`.trim() ||
                  trainer?.email ||
                  "Unnamed Trainer";

                const active = String(currentTrainerId) === String(trainerId);

                return (
                  <div
                    key={trainerId}
                    className={`rounded-xl border p-3 transition ${
                      active
                        ? "border-indigo-200 bg-indigo-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <h4 className="text-sm font-bold text-slate-900">
                      {trainerName}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      {trainer?.email || "-"}
                    </p>

                    <button
                      type="button"
                      disabled={saving || active}
                      onClick={() => onAssignTrainer(trainerId)}
                      className="mt-3 rounded-lg bg-[#6050F0] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#7A6CF5] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {active ? "Assigned" : saving ? "Saving..." : "Assign"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}