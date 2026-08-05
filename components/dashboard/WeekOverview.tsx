const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

interface WeekOverviewProps {
  activity: number[];
}

export function WeekOverview({ activity }: WeekOverviewProps) {
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0 … Sun=6

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm animate-fade-up animation-delay-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">This Week</h3>
        <span className="text-xs text-muted-foreground">Completion rate</span>
      </div>

      <div className="flex items-end justify-between gap-2">
        {DAYS.map((day, index) => {
          const value = activity[index] ?? 0;
          const isToday = index === todayIndex;

          return (
            <div
              key={day}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-24 w-full items-end justify-center">
                <div
                  className={`w-full max-w-[2rem] rounded-md transition-all duration-500 ${
                    isToday
                      ? "bg-foreground/80"
                      : "bg-secondary"
                  }`}
                  style={{ height: `${Math.max(value, 8)}%` }}
                  aria-hidden="true"
                />
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-wider ${
                  isToday ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
