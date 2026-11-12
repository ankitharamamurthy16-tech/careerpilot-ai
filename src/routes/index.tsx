import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BrandMark } from "@/components/Brand";
import { getStudent } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerPilot AI — Placement prep, personalised" },
      {
        name: "description",
        content:
          "AI-powered placement preparation for college students: assessments, coding, communication, roadmap and resume.",
      },
      { property: "og:title", content: "CareerPilot AI" },
      {
        property: "og:description",
        content: "AI-powered personalised placement preparation for college students.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: getStudent() ? "/app" : "/login", replace: true });
    }, 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="bg-hero relative flex min-h-dvh flex-col items-center justify-center overflow-hidden text-navy-foreground">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      <div className="animate-float-up flex flex-col items-center">
        <div className="shadow-glow rounded-3xl">
          <BrandMark size={96} />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold">
          CareerPilot <span className="text-violet">AI</span>
        </h1>
        <p className="mt-2 text-sm opacity-80">Your personal placement co-pilot</p>
      </div>
      <div className="absolute bottom-12 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-navy-foreground/70"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
