export function Motivation() {
  return (
    <section
      className="relative overflow-hidden py-24 lg:py-32"
      aria-labelledby="motivation-quote"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <blockquote>
          <p
            id="motivation-quote"
            className="text-2xl font-medium leading-relaxed tracking-tight text-foreground sm:text-3xl lg:text-4xl lg:leading-snug"
          >
            &ldquo;Small daily actions create extraordinary lives.&rdquo;
          </p>
        </blockquote>
        <footer className="mt-6">
          <cite className="not-italic text-sm text-muted-foreground">
            The philosophy behind Discipline OS
          </cite>
        </footer>
      </div>
    </section>
  );
}
