import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  LogOut,
  Mail,
  School,
  Briefcase,
  Landmark,
  Sparkles,
  Award,
  Check,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { getStudent, logout } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationCentre";
import {
  getPathway,
  setPathway,
  getSelectedPathways,
  setSelectedPathways,
  togglePathway,
  getSelectedGatePaper,
  setSelectedGatePaper,
  gatePapers,
  type PreparationPathway,
  type PathwayType,
  type GatePaperCode,
} from "@/lib/data";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CareerPilot AI" },
      { name: "description", content: "Your student profile, target role and pathway settings." },
      { property: "og:title", content: "Profile — CareerPilot AI" },
      { property: "og:description", content: "Manage your CareerPilot AI profile." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const s = getStudent();
  const [selectedPathways, setSelectedPathwaysState] = useState<PathwayType[]>([
    "placement",
    "government",
    "gate",
  ]);
  const [gatePaper, setGatePaperState] = useState<GatePaperCode>("CS");

  useEffect(() => {
    setSelectedPathwaysState(getSelectedPathways());
    setGatePaperState(getSelectedGatePaper());
  }, []);

  const handleTogglePathway = (p: PathwayType) => {
    const updated = togglePathway(p);
    setSelectedPathwaysState(updated);
    toast.success(`Preparation tracks updated!`);
  };

  const handlePaperChange = (code: GatePaperCode) => {
    setGatePaperState(code);
    setSelectedGatePaper(code);
    toast.success(`Target GATE Paper set to ${code}`);
  };

  if (!s) return null;
  const initials = s.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const rows = [
    { icon: Mail, label: "Email", value: s.email },
    { icon: School, label: "College", value: s.college },
    { icon: GraduationCap, label: "Branch & year", value: `${s.branch} · ${s.year}` },
  ];

  return (
    <div className="px-5 pt-8 md:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="bg-brand shadow-glow font-display flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-primary-foreground">
          {initials}
        </div>
        <h1 className="mt-4 text-2xl font-bold">{s.name}</h1>
        <p className="text-sm text-muted-foreground">
          {selectedPathways
            .map((p) =>
              p === "gate"
                ? "GATE Candidate"
                : p === "government"
                  ? "Govt Aspirant"
                  : "Software Placement",
            )
            .join(" • ")}
        </p>
      </div>

      {/* Target Pathway Selector */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active Career Preparation Pathways
          </p>
          <span className="text-[10px] text-muted-foreground font-semibold">
            Select 1, 2 or all 3
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleTogglePathway("placement")}
            className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition ${
              selectedPathways.includes("placement")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <Briefcase className="h-4 w-4 mb-1" />
            <span>Placement Track</span>
            {selectedPathways.includes("placement") && (
              <span className="mt-1 flex items-center gap-0.5 text-[9px] uppercase font-bold text-emerald-300">
                <Check className="h-3 w-3" /> Active
              </span>
            )}
          </button>
          <button
            onClick={() => handleTogglePathway("government")}
            className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition ${
              selectedPathways.includes("government")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <Landmark className="h-4 w-4 mb-1" />
            <span>Govt Exam Track</span>
            {selectedPathways.includes("government") && (
              <span className="mt-1 flex items-center gap-0.5 text-[9px] uppercase font-bold text-emerald-300">
                <Check className="h-3 w-3" /> Active
              </span>
            )}
          </button>
          <button
            onClick={() => handleTogglePathway("gate")}
            className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition ${
              selectedPathways.includes("gate")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <GraduationCap className="h-4 w-4 mb-1" />
            <span>GATE Prep Track</span>
            {selectedPathways.includes("gate") && (
              <span className="mt-1 flex items-center gap-0.5 text-[9px] uppercase font-bold text-emerald-300">
                <Check className="h-3 w-3" /> Active
              </span>
            )}
          </button>
        </div>

        {/* When GATE is selected, show branch / engineering paper chooser */}
        {selectedPathways.includes("gate") && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Select Your Target GATE Engineering Paper:
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {gatePapers.map((paper) => (
                <button
                  key={paper.code}
                  onClick={() => handlePaperChange(paper.code)}
                  className={`rounded-xl p-2.5 text-left border transition ${
                    gatePaper === paper.code
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{paper.code}</span>
                    {gatePaper === paper.code && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-foreground/80">{paper.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Centre & Daily Reminder Preferences */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-primary/10 p-2 text-primary">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-foreground">Notification & Reminder Center</h3>
              <p className="text-[11px] text-muted-foreground">
                Daily practice schedule, LinkedIn milestone alerts & streak safety
              </p>
            </div>
          </div>
          <NotificationBell triggerVariant="default" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          <div className="rounded-xl bg-muted/30 p-2.5 border border-border">
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">
              Daily Practice Time
            </span>
            <span className="font-bold text-foreground">18:00 (Evening)</span>
          </div>
          <div className="rounded-xl bg-muted/30 p-2.5 border border-border">
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">
              Frequency
            </span>
            <span className="font-bold text-primary">Daily Active</span>
          </div>
          <div className="rounded-xl bg-muted/30 p-2.5 border border-border">
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">
              LinkedIn Reminders
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Enabled</span>
          </div>
          <div className="rounded-xl bg-muted/30 p-2.5 border border-border">
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">
              Streak Alerts
            </span>
            <span className="font-bold text-amber-500">14-Day Active</span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="mt-4 divide-y divide-border rounded-2xl bg-card shadow-card">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4 p-4">
            <r.icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{r.label}</p>
              <p className="text-sm font-semibold">{r.value}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 font-semibold text-destructive transition hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );
}
