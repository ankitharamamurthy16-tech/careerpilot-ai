import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle, Sparkles, Award } from "lucide-react";
import { modules } from "@/lib/data";
import { Progress } from "@/components/Brand";
import { GovernmentExamModule } from "@/components/modules/GovernmentExamModule";
import { CodeDecoderModule } from "@/components/modules/CodeDecoderModule";
import { InterviewMentorModule } from "@/components/modules/InterviewMentorModule";
import { ResumeBuilderModule } from "@/components/modules/ResumeBuilderModule";
import { RoadmapModule } from "@/components/modules/RoadmapModule";
import { CommunicationModule } from "@/components/modules/CommunicationModule";
import { GatePrepModule } from "@/components/modules/GatePrepModule";

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
      {
        property: "og:description",
        content: loaderData?.tagline ?? "Placement preparation module.",
      },
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
        <Link
          to="/app/modules"
          className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        >
          <ArrowLeft className="h-4 w-4" /> All Preparation Modules
        </Link>
        <div className="mt-5 flex items-center gap-4">
          <span className="rounded-2xl bg-navy-foreground/15 p-3.5">
            <m.icon className="h-7 w-7" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{m.title}</h1>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {m.track} track
              </span>
            </div>
            <p className="text-sm opacity-80">{m.tagline}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 text-sm">
          <Progress value={m.progress} className="bg-navy-foreground/15" />
          <b>{m.progress}%</b>
        </div>
      </header>

      <div className="px-5 py-6 md:px-6">
        {/* Render Specialized Interactive Module Experience */}
        {id === "gate-prep" && <GatePrepModule />}
        {id === "government-exams" && <GovernmentExamModule />}
        {id === "code-decoder" && <CodeDecoderModule />}
        {id === "interview-mentor" && <InterviewMentorModule />}
        {id === "communication" && <CommunicationModule />}
        {id === "resume" && <ResumeBuilderModule />}
        {id === "roadmap" && <RoadmapModule />}

        {/* Assessment Module Fallback & Sub-Tests */}
        {id === "assessment" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display font-bold text-base">Aptitude & Technical Assessments</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Practice full-length timed tests matching top company patterns (TCS, Infosys,
                Cognizant)
              </p>

              <div className="mt-4 space-y-2.5">
                <Link
                  to="/app/assessment/quant-mock-4"
                  className="flex w-full items-center gap-3 rounded-2xl bg-primary/10 border border-primary/30 p-4 text-left shadow-card transition active:scale-[0.98] hover:bg-primary/15"
                >
                  <PlayCircle className="h-6 w-6 shrink-0 text-primary" />
                  <div className="flex-1">
                    <span className="block text-sm font-bold text-foreground">
                      Quantitative Aptitude – Mock 4 (30 Questions)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Timed 30 mins • Percentages, Profit & Loss, Time-Speed-Distance
                    </span>
                  </div>
                  <span className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-glow">
                    Start Test
                  </span>
                </Link>

                <div className="flex w-full items-center gap-3 rounded-2xl bg-card border border-border p-4 text-left opacity-80 shadow-card">
                  <PlayCircle className="h-6 w-6 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      Logical Reasoning – Puzzles & Seating Arrangements
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Blood relations, syllogisms and circular puzzles
                    </span>
                  </div>
                  <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    Available Soon
                  </span>
                </div>

                <div className="flex w-full items-center gap-3 rounded-2xl bg-card border border-border p-4 text-left opacity-80 shadow-card">
                  <PlayCircle className="h-6 w-6 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      Core CS Quiz: DBMS, OS & Computer Networks
                    </span>
                    <span className="text-xs text-muted-foreground">
                      SQL joins, indexing, processes, threads and TCP/IP
                    </span>
                  </div>
                  <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    Available Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other modules (Projects, Community) */}
        {id !== "gate-prep" &&
          id !== "government-exams" &&
          id !== "code-decoder" &&
          id !== "interview-mentor" &&
          id !== "communication" &&
          id !== "resume" &&
          id !== "roadmap" &&
          id !== "assessment" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display font-bold text-base">{m.title} Curriculum</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{m.tagline}</p>

                <div className="mt-4 space-y-2.5">
                  {m.highlights.map((h) => (
                    <div
                      key={h}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-left shadow-sm"
                    >
                      <PlayCircle className="h-5 w-5 shrink-0 text-primary" />
                      <span className="flex-1 text-xs font-medium text-foreground">{h}</span>
                      <span className="text-xs font-bold text-primary">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
