const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

interface WeekOverviewProps {
  activity: number[];
}

export function WeekOverview({ activity }: WeekOverviewProps) {
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0 … Sun=6

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm animate-fade-up animation-delay-200 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">This Week</h3>
        <span className="text-[11px] text-muted-foreground sm:text-xs">Completion rate</span>
      </div>

      <div className="flex items-end justify-between gap-1 sm:gap-2">
        {DAYS.map((day, index) => {
          const value = activity[index] ?? 0;
          const isToday = index === todayIndex;

          return (
            <div
              key={day}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:gap-2"
            >
              <div className="relative flex h-20 w-full items-end justify-center sm:h-24">
                <div
                  className={`w-full max-w-[1.75rem] rounded-md transition-all duration-500 sm:max-w-[2rem] ${
                    isToday
                      ? "bg-foreground/80"
                      : "bg-secondary"
                  }`}
                  style={{ height: `${Math.max(value, 8)}%` }}
                  aria-hidden="true"
                />
              </div>
              <span
                className={`text-[11px] font-medium uppercase tracking-wider sm:text-[10px] ${
                  isToday ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {day.slice(0, 1)}
                <span className="hidden sm:inline">{day.slice(1)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
