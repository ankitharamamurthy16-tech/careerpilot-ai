import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { modules } from "@/lib/data";
import { Progress } from "@/components/Brand";

export const Route = createFileRoute("/app/modules/")({
  head: () => ({
    meta: [
      { title: "Modules — CareerPilot AI" },
      { name: "description", content: "All placement preparation modules in one place." },
      { property: "og:title", content: "Modules — CareerPilot AI" },
      { property: "og:description", content: "Assessments, coding, communication, roadmap, projects, resume and community." },
    ],
  }),
  component: Modules,
});

function Modules() {
  return (
    <div className="px-5 pt-8 md:px-6">
      <h1 className="text-2xl font-bold">Modules</h1>
      <p className="text-sm text-muted-foreground">Everything you need to get placed.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {modules.map((m) => (
          <Link key={m.id} to="/app/modules/$id" params={{ id: m.id }} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card transition active:scale-[0.98]">
            <span className="bg-brand rounded-xl p-3 text-primary-foreground"><m.icon className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{m.title}</p>
              <p className="truncate text-xs text-muted-foreground">{m.tagline}</p>
              <Progress value={m.progress} className="mt-2 h-1.5" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
