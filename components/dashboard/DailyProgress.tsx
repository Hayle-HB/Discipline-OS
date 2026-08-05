import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyProgressProps {
  progress: number;
  completed: number;
  total: number;
}

export function DailyProgress({
  progress,
  completed,
  total,
}: DailyProgressProps) {
  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm animate-fade-up animation-delay-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Overall Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <p className="text-3xl font-semibold tracking-tight">{progress}%</p>
          <p className="text-sm text-muted-foreground">
            {completed} of {total} tasks
          </p>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall task progress"
        >
          <div
            className="h-full rounded-full bg-foreground/80 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
