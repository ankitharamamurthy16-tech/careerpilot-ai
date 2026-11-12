import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Briefcase, Landmark, Sparkles, Filter, GraduationCap } from "lucide-react";
import { modules, getPathway, type Module } from "@/lib/data";
import { Progress } from "@/components/Brand";
import { NotificationBell } from "@/components/NotificationCentre";

export const Route = createFileRoute("/app/modules/")({
  head: () => ({
    meta: [
      { title: "Preparation Modules — CareerPilot AI" },
      {
        name: "description",
        content:
          "Explore Private-Sector Placement, Government Exams, GATE Preparation, Code Decoder, Communication Coach, and AI Interview Mentor.",
      },
      { property: "og:title", content: "Preparation Modules — CareerPilot AI" },
      {
        property: "og:description",
        content: "Complete placement, government exam and GATE preparation curriculum.",
      },
    ],
  }),
  component: Modules,
});

type FilterTab = "all" | "placement" | "government" | "gate" | "core";

function Modules() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const defaultPathway = getPathway();

  const filtered = modules.filter((m) => {
    if (filter === "all") return true;
    return m.track === filter;
  });

  return (
    <div className="px-5 pt-8 md:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Preparation Modules</h1>
          <p className="text-sm text-muted-foreground">
            Complete curriculum for Private Placements, Government Examinations, and GATE
            Preparation.
          </p>
        </div>
        <NotificationBell triggerVariant="default" />
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            filter === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <span>All Modules ({modules.length})</span>
        </button>
        <button
          onClick={() => setFilter("placement")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            filter === "placement"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Private Placement Track</span>
        </button>
        <button
          onClick={() => setFilter("government")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            filter === "government"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <Landmark className="h-3.5 w-3.5" />
          <span>Government Exam Track</span>
        </button>
        <button
          onClick={() => setFilter("gate")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            filter === "gate"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>GATE Preparation Track</span>
        </button>
        <button
          onClick={() => setFilter("core")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            filter === "core"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Interview & Community</span>
        </button>
      </div>

      {/* Module Cards Grid */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {filtered.map((m) => (
          <Link
            key={m.id}
            to="/app/modules/$id"
            params={{ id: m.id }}
            className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-card transition active:scale-[0.98] hover:border-primary/50 hover:shadow-glow/10"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="bg-brand rounded-2xl p-3 text-primary-foreground transition group-hover:scale-105">
                    <m.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-foreground">{m.title}</h2>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-foreground">
                        {m.track}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.tagline}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              {/* Highlights List */}
              <ul className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                {m.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 border-t border-border/50 pt-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Readiness Progress</span>
                <span className="text-primary font-bold">{m.progress}%</span>
              </div>
              <Progress value={m.progress} className="mt-1.5 h-1.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
