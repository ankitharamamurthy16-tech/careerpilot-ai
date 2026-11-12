import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, LayoutGrid, BarChart3, User, Bell } from "lucide-react";
import { getStudent, type Student } from "@/lib/auth";
import { BrandMark } from "@/components/Brand";
import { NotificationBell } from "@/components/NotificationCentre";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const tabs = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/modules", label: "Modules", icon: LayoutGrid, exact: false },
  { to: "/app/progress", label: "Progress", icon: BarChart3, exact: false },
  { to: "/app/profile", label: "Profile", icon: User, exact: false },
] as const;

function AppLayout() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null | undefined>(undefined);
  useEffect(() => {
    const s = getStudent();
    if (!s) navigate({ to: "/login", replace: true });
    setStudent(s);
  }, [navigate]);
  if (!student) return <div className="bg-hero min-h-dvh" />;

  return (
    <div className="min-h-dvh bg-background md:flex">
      {/* Laptop sidebar */}
      <aside className="bg-hero sticky top-0 hidden h-dvh w-64 shrink-0 flex-col justify-between p-6 text-navy-foreground md:flex">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark size={40} />
            <span className="font-display font-bold">CareerPilot AI</span>
          </div>
          <nav className="mt-10 space-y-1">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.exact }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold opacity-75 transition hover:bg-navy-foreground/10 data-[status=active]:bg-navy-foreground/15 data-[status=active]:opacity-100"
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Notifications Button */}
        <div className="border-t border-navy-foreground/15 pt-4">
          <NotificationBell triggerVariant="sidebar" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar with notification bell */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur md:hidden">
          <div className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="font-display font-bold text-sm text-foreground">CareerPilot AI</span>
          </div>
          <NotificationBell triggerVariant="default" />
        </header>

        <main className="mx-auto w-full max-w-5xl pb-28 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 pt-2">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="group flex flex-col items-center gap-1 py-1 text-[11px] font-semibold text-muted-foreground data-[status=active]:text-primary"
            >
              <span className="rounded-full px-4 py-1 transition group-data-[status=active]:bg-accent">
                <t.icon className="h-5 w-5" />
              </span>
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
