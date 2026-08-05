interface DashboardHeaderProps {
  name: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatToday(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function DashboardHeader({ name }: DashboardHeaderProps) {
  const firstName = name.trim().split(/\s+/)[0] ?? name;

  return (
    <div className="animate-fade-up">
      <p className="text-sm text-muted-foreground">{formatToday()}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {getGreeting()}, {firstName}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep the promises you made to yourself today.
      </p>
    </div>
  );
}
