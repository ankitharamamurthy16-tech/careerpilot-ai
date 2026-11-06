import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle, Sparkles } from "lucide-react";
import { modules } from "@/lib/data";
import { Progress } from "@/components/Brand";

export const Route = createFileRoute("/app/modules/$id")({
  loader: ({ params }) => {
    const m = modules.find((x) => x.id === params.id);
    if (!m) throw notFound();
    return { id: m.id, title: m.title, tagline: m.tagline };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Module"} — CareerPilot AI` },
      { name: "description", content: loaderData?.tagline ?? "Placement preparation module." },
      { property: "og:title", content: `${loaderData?.title ?? "Module"} — CareerPilot AI` },
      { property: "og:description", content: loaderData?.tagline ?? "Placement preparation module." },
    ],
  }),
  component: ModulePage,
});

function ModulePage() {
  const { id } = Route.useLoaderData();
  const m = modules.find((x) => x.id === id)!;
  return (
    <div>
      <header className="bg-hero rounded-b-[2rem] px-5 pb-8 pt-6 text-navy-foreground md:mx-6 md:mt-6 md:rounded-3xl">
        <Link to="/app/modules" className="inline-flex items-center gap-1 text-sm opacity-80"><ArrowLeft className="h-4 w-4" /> Modules</Link>
        <div className="mt-5 flex items-center gap-4">
          <span className="rounded-2xl bg-navy-foreground/15 p-3.5"><m.icon className="h-7 w-7" /></span>
          <div>
            <h1 className="text-2xl font-bold">{m.title}</h1>
            <p className="text-sm opacity-80">{m.tagline}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 text-sm"><Progress value={m.progress} className="bg-navy-foreground/15" /><b>{m.progress}%</b></div>
      </header>
      <div className="space-y-3 px-5 py-6 md:px-6">
        {m.highlights.map((h, i) => {
          const to = m.id === "assessment" && i === 0 ? "/app/assessment/quant-mock-4" : null;
          return to ? (
            <Link key={h} to={to}
              className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-card ring-2 ring-primary/30 transition active:scale-[0.98]">
              <PlayCircle className="h-5 w-5 shrink-0 text-primary" />
              <span className="flex-1 text-sm font-medium">{h}</span>
              <span className="text-xs font-bold text-primary">Start</span>
            </Link>
          ) : (
            <div key={h} className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left opacity-70 shadow-card">
              <PlayCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium">{h}</span>
            </div>
          );
        })}
        {m.id !== "assessment" && <div className="flex items-start gap-3 rounded-2xl border border-accent bg-accent/60 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-accent-foreground">AI-powered guidance for this module is coming soon.</p>
        </div>}
      </div>
    </div>
  );
}
