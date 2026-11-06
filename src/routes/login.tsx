import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, Field, PrimaryButton } from "@/components/AuthShell";
import { login, loginDemo } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — CareerPilot AI" },
      { name: "description", content: "Log in to continue your placement preparation." },
      { property: "og:title", content: "Log in — CareerPilot AI" },
      { property: "og:description", content: "Continue your personalised placement preparation." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      navigate({ to: "/app" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Pick up where you left off.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="College email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
        <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <PrimaryButton type="submit" disabled={busy}>{busy ? "Signing in…" : "Log in"}</PrimaryButton>
      </form>
      <button
        onClick={() => { loginDemo(); navigate({ to: "/app" }); }}
        className="mt-3 h-12 w-full rounded-xl border border-border bg-card font-semibold text-accent-foreground transition active:scale-[0.98]"
      >
        Explore with demo account
      </button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to CareerPilot? <Link to="/register" className="font-semibold text-primary">Create an account</Link>
      </p>
    </AuthShell>
  );
}
