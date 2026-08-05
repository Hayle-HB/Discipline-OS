import {
  BarChart3,
  Brain,
  CheckCircle2,
  Flame,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: CheckCircle2,
    title: "Daily Commitments",
    description: "Track the promises you make to yourself.",
  },
  {
    icon: Flame,
    title: "Streak System",
    description: "Build consistency and see your progress.",
  },
  {
    icon: BarChart3,
    title: "Personal Analytics",
    description: "Understand your discipline patterns.",
  },
  {
    icon: Brain,
    title: "AI Life Coach",
    description: "Get insights to improve your daily life.",
    badge: "Coming Soon",
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      className="border-t border-border bg-secondary/20 py-20 lg:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Everything you need to stay accountable
          </h2>
          <p className="mt-4 text-muted-foreground">
            A focused toolkit designed to help you follow through on what
            matters most.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-secondary transition-colors group-hover:bg-secondary/80">
                    <feature.icon
                      className="size-5 text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  {"badge" in feature && feature.badge && (
                    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="mt-2 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
