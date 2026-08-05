export function DashboardMockup() {
  const commitments = [
    { label: "Morning workout", done: true, streak: 12 },
    { label: "Read 30 minutes", done: true, streak: 8 },
    { label: "No social media before noon", done: false, streak: 5 },
    { label: "Journal before bed", done: false, streak: 3 },
  ];

  return (
    <div
      className="relative mx-auto w-full max-w-lg"
      role="img"
      aria-label="Preview of the Discipline OS dashboard showing daily commitments and streak progress"
    >
      {/* Glow effect */}
      <div
        className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-zinc-600" />
            <span className="size-2.5 rounded-full bg-zinc-600" />
            <span className="size-2.5 rounded-full bg-zinc-600" />
          </div>
          <span className="mx-auto text-xs text-muted-foreground">
            Today&apos;s Commitments
          </span>
        </div>

        {/* Dashboard content */}
        <div className="p-5">
          {/* Stats row */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { label: "Completed", value: "2/4" },
              { label: "Streak", value: "12d" },
              { label: "Score", value: "87%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-center"
              >
                <p className="text-lg font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Commitment list */}
          <div className="space-y-2">
            {commitments.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-5 items-center justify-center rounded-full border ${
                      item.done
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-border bg-secondary"
                    }`}
                    aria-hidden="true"
                  >
                    {item.done && (
                      <svg
                        viewBox="0 0 12 12"
                        className="size-2.5 text-emerald-400"
                        fill="none"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <svg
                    viewBox="0 0 12 12"
                    className="size-3 text-orange-400/80"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M6 1C4.5 3 3 4.5 3 6.5C3 8.5 4.5 10 6 10C7.5 10 9 8.5 9 6.5C9 4.5 7.5 3 6 1Z" />
                  </svg>
                  {item.streak}d
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Daily progress</span>
              <span>50%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/2 rounded-full bg-foreground/80 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
