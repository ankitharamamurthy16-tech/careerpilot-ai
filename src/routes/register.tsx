import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, Field, PrimaryButton } from "@/components/AuthShell";
import { register } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — CareerPilot AI" },
      { name: "description", content: "Register as a student and start your placement journey." },
      { property: "og:title", content: "Join CareerPilot AI" },
      { property: "og:description", content: "Start your personalised placement preparation today." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", college: "", branch: "", year: "3rd Year", password: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await register(f);
      toast.success(`Welcome aboard, ${f.name.split(" ")[0]}!`);
      navigate({ to: "/app" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Tell us a little about you.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" required value={f.name} onChange={set("name")} placeholder="Priya Nair" />
        <Field label="College email" type="email" required value={f.email} onChange={set("email")} placeholder="priya@college.edu" />
        <Field label="College" required value={f.college} onChange={set("college")} placeholder="PES University" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Branch" required value={f.branch} onChange={set("branch")} placeholder="CSE" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Year</span>
            <select value={f.year} onChange={set("year")} className="h-12 w-full rounded-xl border border-input bg-card px-3 text-base">
              {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => <option key={y}>{y}</option>)}
            </select>
          </label>
        </div>
        <Field label="Password" type="password" required value={f.password} onChange={set("password")} placeholder="At least 6 characters" />
        <PrimaryButton type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</PrimaryButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered? <Link to="/login" className="font-semibold text-primary">Log in</Link>
      </p>
    </AuthShell>
  );
}
