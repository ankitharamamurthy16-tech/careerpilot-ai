import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle, Sparkles, Award } from "lucide-react";
import { modules, calculatePlacementReadiness } from "@/lib/data";
import { Progress } from "@/components/Brand";
import { GovernmentExamModule } from "@/components/modules/GovernmentExamModule";
import { CodeDecoderModule } from "@/components/modules/CodeDecoderModule";
import { InterviewMentorModule } from "@/components/modules/InterviewMentorModule";
import { ResumeBuilderModule } from "@/components/modules/ResumeBuilderModule";
import { RoadmapModule } from "@/components/modules/RoadmapModule";
import { CommunicationModule } from "@/components/modules/CommunicationModule";
import { GatePrepModule } from "@/components/modules/GatePrepModule";
import { AssessmentModule } from "@/components/modules/AssessmentModule";
import { PlacementTrackerModule } from "@/components/modules/PlacementTrackerModule";

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
  const headerProgress =
    id === "placement-tracker" ? calculatePlacementReadiness().overallScore : m.progress;

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
          <Progress value={headerProgress} className="bg-navy-foreground/15" />
          <b>{headerProgress}%</b>
        </div>
      </header>

      <div className="px-5 py-6 md:px-6">
        {/* Render Specialized Interactive Module Experience */}
        {id === "placement-tracker" && <PlacementTrackerModule />}
        {id === "gate-prep" && <GatePrepModule />}
        {id === "government-exams" && <GovernmentExamModule />}
        {id === "code-decoder" && <CodeDecoderModule />}
        {id === "interview-mentor" && <InterviewMentorModule />}
        {id === "communication" && <CommunicationModule />}
        {id === "resume" && <ResumeBuilderModule />}
        {id === "roadmap" && <RoadmapModule />}

        {/* Interactive Assessment & Placement Prep Hub */}
        {id === "assessment" && <AssessmentModule />}

        {/* Other modules (Projects, Community) */}
        {id !== "placement-tracker" &&
          id !== "gate-prep" &&
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
