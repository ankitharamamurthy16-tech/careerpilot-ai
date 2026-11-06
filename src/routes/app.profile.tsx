import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut, Mail, School } from "lucide-react";
import { getStudent, logout } from "@/lib/auth";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CareerPilot AI" },
      { name: "description", content: "Your student profile and account settings." },
      { property: "og:title", content: "Profile — CareerPilot AI" },
      { property: "og:description", content: "Manage your CareerPilot AI profile." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const s = getStudent();
  if (!s) return null;
  const initials = s.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const rows = [
    { icon: Mail, label: "Email", value: s.email },
    { icon: School, label: "College", value: s.college },
    { icon: GraduationCap, label: "Branch & year", value: `${s.branch} · ${s.year}` },
  ];
  return (
    <div className="px-5 pt-8 md:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="bg-brand shadow-glow font-display flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-primary-foreground">{initials}</div>
        <h1 className="mt-4 text-2xl font-bold">{s.name}</h1>
        <p className="text-sm text-muted-foreground">Aspiring Software Engineer</p>
      </div>
      <div className="mt-6 divide-y divide-border rounded-2xl bg-card shadow-card">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4 p-4">
            <r.icon className="h-5 w-5 text-primary" />
            <div><p className="text-xs text-muted-foreground">{r.label}</p><p className="text-sm font-semibold">{r.value}</p></div>
          </div>
        ))}
      </div>
      <button onClick={() => { logout(); navigate({ to: "/login" }); }}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 font-semibold text-destructive">
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );
}
