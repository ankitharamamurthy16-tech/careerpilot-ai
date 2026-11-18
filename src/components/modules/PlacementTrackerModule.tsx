import { useState, useEffect, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Compass,
  Info,
  ListChecks,
  Lock,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Unlock,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Progress } from "@/components/Brand";
import {
  COMPANY_GUIDANCE_DISCLAIMER,
  COMPANY_PREP_GUIDES,
  addCustomWeeklyGoal,
  calculatePlacementReadiness,
  evaluatePlacementMilestones,
  generatePlacementMentorReport,
  getPlacementAnalyticsData,
  loadPlacementTracker,
  loadWeeklyPlacementGoals,
  removeWeeklyGoal,
  setTrackerActivityStatus,
  toggleWeeklyGoal,
  type ActivityStatus,
  type PlacementAnalyticsData,
  type PlacementMentorReport,
  type PlacementMilestone,
  type PlacementReadinessReport,
  type PlacementTrackerState,
  type WeeklyGoalsState,
} from "@/lib/placement-engine";

type TrackerTab = "overview" | "tracker" | "companies" | "goals" | "analytics" | "milestones";

function ModuleActionLink({ moduleId, label }: { moduleId: string; label: string }) {
  if (moduleId === "placement-tracker") return null;
  return (
    <Link
      to="/app/modules/$id"
      params={{ id: moduleId }}
      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
    >
      <span>{label}</span>
      <ChevronRight className="h-3 w-3" />
    </Link>
  );
}

export function PlacementTrackerModule() {
  const [activeTab, setActiveTab] = useState<TrackerTab>("overview");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("tcs");
  const [trackerFilter, setTrackerFilter] = useState<"all" | ActivityStatus>("all");

  const [readiness, setReadiness] = useState<PlacementReadinessReport>(() =>
    calculatePlacementReadiness(),
  );
  const [tracker, setTracker] = useState<PlacementTrackerState>(() => loadPlacementTracker());
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoalsState>(() =>
    loadWeeklyPlacementGoals(),
  );
  const [analytics, setAnalytics] = useState<PlacementAnalyticsData>(() =>
    getPlacementAnalyticsData(),
  );
  const [mentor, setMentor] = useState<PlacementMentorReport>(() =>
    generatePlacementMentorReport(),
  );
  const [milestones, setMilestones] = useState<PlacementMilestone[]>(() =>
    evaluatePlacementMilestones(),
  );

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Custom");

  const refreshAll = () => {
    setReadiness(calculatePlacementReadiness());
    setTracker(loadPlacementTracker());
    setWeeklyGoals(loadWeeklyPlacementGoals());
    setAnalytics(getPlacementAnalyticsData());
    setMentor(generatePlacementMentorReport());
    setMilestones(evaluatePlacementMilestones());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleStatusChange = (activityId: string, status: ActivityStatus) => {
    const nextTracker = setTrackerActivityStatus(activityId, status);
    setTracker(nextTracker);
    setReadiness(calculatePlacementReadiness());
    setAnalytics(getPlacementAnalyticsData());
    setMentor(generatePlacementMentorReport());
    setMilestones(evaluatePlacementMilestones());
    toast.success(`Activity marked as ${status}.`);
  };

  const handleToggleGoal = (goalId: string) => {
    const nextGoals = toggleWeeklyGoal(goalId);
    setWeeklyGoals(nextGoals);
    setReadiness(calculatePlacementReadiness());
    setMilestones(evaluatePlacementMilestones());
    const toggled = nextGoals.goals.find((g) => g.id === goalId);
    if (toggled?.completed) {
      toast.success("Weekly placement goal completed!");
    }
  };

  const handleAddGoal = (e: FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) {
      toast.error("Enter a goal description first.");
      return;
    }
    const nextGoals = addCustomWeeklyGoal(newGoalTitle, newGoalCategory);
    setWeeklyGoals(nextGoals);
    setNewGoalTitle("");
    setReadiness(calculatePlacementReadiness());
    toast.success("Custom weekly goal added.");
  };

  const handleDeleteGoal = (goalId: string) => {
    const nextGoals = removeWeeklyGoal(goalId);
    setWeeklyGoals(nextGoals);
    setReadiness(calculatePlacementReadiness());
  };

  const handleRegenerateGoals = () => {
    const nextGoals = loadWeeklyPlacementGoals(undefined, true);
    setWeeklyGoals(nextGoals);
    setReadiness(calculatePlacementReadiness());
    toast.success("Personalized weekly goals updated from your latest metrics.");
  };

  const selectedCompany =
    COMPANY_PREP_GUIDES.find((c) => c.id === selectedCompanyId) ?? COMPANY_PREP_GUIDES[0]!;
  const unlockedMilestonesCount = milestones.filter((m) => m.unlocked).length;

  const tabs: Array<{ id: TrackerTab; label: string; icon: typeof Target }> = [
    { id: "overview", label: "Readiness & Mentor", icon: Target },
    { id: "tracker", label: "Prep Tracker (8)", icon: ListChecks },
    { id: "companies", label: "Company Prep (9)", icon: Building2 },
    { id: "goals", label: "Weekly Goals", icon: Compass },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "milestones", label: "Milestones", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Top Sub-Navigation */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-brand text-white shadow-glow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================== */}
      {/* TAB 1: PLACEMENT READINESS & AI MENTOR */}
      {/* ========================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Placement Readiness Score Card */}
          <section className="rounded-2xl border border-violet/30 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-card">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <ReadinessGauge score={readiness.overallScore} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet">
                      {readiness.readinessTier}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Data Coverage: {readiness.dataCoveragePct}%
                    </span>
                  </div>
                  <h2 className="font-display mt-1 text-xl font-bold text-foreground">
                    Placement Readiness Score
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                    {readiness.calculationExplanation}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center sm:shrink-0">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2">
                  <p className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {readiness.completedCount}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Complete</p>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2">
                  <p className="font-display text-lg font-bold text-amber-600 dark:text-amber-400">
                    {readiness.partialCount}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Partial</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/50 px-3 py-2">
                  <p className="font-display text-lg font-bold text-foreground">
                    {readiness.incompleteCount}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    Incomplete
                  </p>
                </div>
              </div>
            </div>

            {/* 8 Category Breakdown Grid */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {readiness.categories.map((cat) => {
                const badgeClass =
                  cat.status === "Complete"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : cat.status === "Partial"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : "bg-muted text-muted-foreground";
                const barPct = cat.weight > 0 ? Math.round((cat.earned / cat.weight) * 100) : 0;

                return (
                  <div
                    key={cat.key}
                    data-testid={`readiness-cat-${cat.key}`}
                    className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold leading-snug text-foreground">
                          {cat.label}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}
                        >
                          {cat.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-display text-lg font-bold text-primary">
                          {cat.earned}{" "}
                          <span className="text-xs font-medium text-muted-foreground">
                            / {cat.weight} pts
                          </span>
                        </span>
                        <span className="text-[11px] font-semibold text-foreground">
                          {cat.rawScorePct !== null ? `${cat.rawScorePct}%` : "Incomplete"}
                        </span>
                      </div>

                      <Progress value={barPct} className="mt-2 h-1.5" />

                      <p className="mt-2 text-[11px] font-medium text-foreground">
                        {cat.dataPointsLabel}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                        {cat.formulaNote}
                      </p>
                    </div>

                    <div className="mt-3 border-t border-border/50 pt-2">
                      <ModuleActionLink moduleId={cat.targetModuleId} label="Improve score" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Placement Mentor Section */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start gap-3 border-b border-border pb-4">
              <span className="bg-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-glow">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">
                  AI Placement Mentor
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {mentor.summary}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Next Practice Actions */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recommended Next Practice Actions
                </h3>
                {mentor.nextPracticeActions.map((act, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">{act.title}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          act.priority === "High"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {act.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{act.reason}</p>
                    <div className="mt-2">
                      <ModuleActionLink moduleId={act.targetModuleId} label="Launch module" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Weaknesses & Company Fit */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Detected Weaknesses & Missing Signals
                  </h3>
                  {mentor.weaknessesIdentified.length === 0 ? (
                    <p className="mt-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                      No critical topic weaknesses detected across recorded assessments.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {mentor.weaknessesIdentified.map((w, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11px] text-foreground"
                        >
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Company Preparation Path Fit
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {mentor.recommendedCompanyPaths.map((cp) => (
                      <button
                        key={cp.companyId}
                        type="button"
                        onClick={() => {
                          setSelectedCompanyId(cp.companyId);
                          setActiveTab("companies");
                        }}
                        className="rounded-xl border border-border bg-muted/20 p-2.5 text-left transition hover:border-primary/50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            {cp.companyName}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              cp.fitStatus === "Ready to Target"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : cp.fitStatus === "Near Target"
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {cp.fitStatus}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
                          {cp.reason}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Realistic Improvement Strategies */}
            <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Realistic Improvement Strategies
              </h3>
              <ul className="mt-2 space-y-1.5">
                {mentor.improvementStrategies.map((st, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: PLACEMENT PREPARATION TRACKER (8) */}
      {/* ========================================== */}
      {activeTab === "tracker" && (
        <div className="space-y-5">
          {/* Summary KPI & Filter */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">
                  8-Section Placement Preparation Tracker
                </h2>
                <p className="text-xs text-muted-foreground">
                  Track completed, ongoing, and pending preparation activities across every
                  placement pillar.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-center">
                  <p className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {tracker.completedCount}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground">Completed</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 px-3 py-1.5 text-center">
                  <p className="font-display text-base font-bold text-amber-600 dark:text-amber-400">
                    {tracker.ongoingCount}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground">Ongoing</p>
                </div>
                <div className="rounded-xl bg-muted px-3 py-1.5 text-center">
                  <p className="font-display text-base font-bold text-foreground">
                    {tracker.pendingCount}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Overall Preparation Completion</span>
                <span className="font-bold text-primary">{tracker.completionPct}%</span>
              </div>
              <Progress value={tracker.completionPct} className="h-2" />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
              {(["all", "completed", "ongoing", "pending"] as const).map((statusKey) => {
                const countLabel =
                  statusKey === "all"
                    ? `All (${tracker.totalActivities})`
                    : statusKey === "completed"
                      ? `Completed (${tracker.completedCount})`
                      : statusKey === "ongoing"
                        ? `Ongoing (${tracker.ongoingCount})`
                        : `Pending (${tracker.pendingCount})`;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setTrackerFilter(statusKey)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      trackerFilter === statusKey
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {countLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8 Preparation Sections */}
          <div className="grid gap-4 md:grid-cols-2">
            {tracker.sections.map((section) => {
              const visibleActivities = section.activities.filter(
                (a) => trackerFilter === "all" || a.status === trackerFilter,
              );
              return (
                <section
                  key={section.id}
                  data-testid={`tracker-section-${section.id}`}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {section.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{section.subtitle}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {section.progressPct}%
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-[10px] font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {section.completedCount} Completed
                    </span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {section.ongoingCount} Ongoing
                    </span>
                    <span className="text-muted-foreground">{section.pendingCount} Pending</span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {visibleActivities.length === 0 ? (
                      <p className="rounded-xl bg-muted/30 p-3 text-center text-xs text-muted-foreground">
                        No {trackerFilter} activities in this section.
                      </p>
                    ) : (
                      visibleActivities.map((act) => (
                        <div
                          key={act.id}
                          className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-foreground">{act.title}</span>
                                {act.autoSynced && (
                                  <span className="rounded bg-violet/15 px-1.5 py-0.5 text-[9px] font-bold text-violet">
                                    Auto-Synced
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {act.description}
                              </p>
                            </div>
                            <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {act.estimatedMinutes}m
                            </span>
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2">
                            <div className="flex items-center gap-1">
                              {(["pending", "ongoing", "completed"] as ActivityStatus[]).map(
                                (st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusChange(act.id, st)}
                                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize transition ${
                                      act.status === st
                                        ? st === "completed"
                                          ? "bg-emerald-600 text-white"
                                          : st === "ongoing"
                                            ? "bg-amber-500 text-white"
                                            : "bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900"
                                        : "bg-card text-muted-foreground border border-border hover:text-foreground"
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ),
                              )}
                            </div>
                            <ModuleActionLink moduleId={act.targetModuleId} label="Open" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: COMPANY PREPARATION (9 COMPANIES) */}
      {/* ========================================== */}
      {activeTab === "companies" && (
        <div className="space-y-5">
          {/* Distinction Disclaimer */}
          <div
            role="note"
            className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200"
          >
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">
                General Preparation Guidance vs. Verified Current Hiring Requirements
              </p>
              <p className="mt-0.5 leading-relaxed text-amber-800 dark:text-amber-300">
                {COMPANY_GUIDANCE_DISCLAIMER}
              </p>
            </div>
          </div>

          {/* 9 Company Selector Grid */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {COMPANY_PREP_GUIDES.map((co) => {
              const isSelected = co.id === selectedCompany.id;
              const isReady = readiness.overallScore >= co.targetReadinessMin;
              return (
                <button
                  key={co.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(co.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <p className="font-display text-xs font-bold text-foreground">{co.name}</p>
                  <p
                    className={`mt-1 text-[9px] font-bold ${
                      isReady ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    }`}
                  >
                    {isReady ? "Target Ready" : `Goal ${co.targetReadinessMin}%+`}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Company Guide */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    {selectedCompany.tierLabel}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    General Prep Blueprint
                  </span>
                </div>
                <h2 className="font-display mt-1.5 text-xl font-bold text-foreground">
                  {selectedCompany.name} Placement Preparation Guide
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">{selectedCompany.overview}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-2 text-center shrink-0">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Your Readiness vs Target
                </p>
                <p className="font-display text-base font-bold text-primary">
                  {readiness.overallScore}% / {selectedCompany.targetReadinessMin}%+
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {/* Common Selection Rounds */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Common Selection Rounds (General Pattern)
                </h3>
                <ol className="mt-2.5 space-y-2">
                  {selectedCompany.commonSelectionRounds.map((rnd, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span>{rnd}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Coding Preparation */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet">
                    Coding Preparation
                  </h3>
                  <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-bold text-violet">
                    {selectedCompany.codingPrep.difficulty}
                  </span>
                </div>
                <p className="mt-2 text-xs text-foreground">{selectedCompany.codingPrep.focus}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {selectedCompany.codingPrep.sampleTopics.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Aptitude Topics */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Aptitude Preparation Topics
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                  {selectedCompany.aptitudeTopics.map((topic) => (
                    <li key={topic} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical & HR Topics */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Technical & HR Interview Focus
                </h3>
                <div className="mt-2 space-y-2 text-xs">
                  <div>
                    <p className="font-bold text-primary">Technical Topics:</p>
                    <p className="mt-0.5 text-muted-foreground">
                      {selectedCompany.technicalTopics.join(" • ")}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-violet">HR Preparation:</p>
                    <p className="mt-0.5 text-muted-foreground">
                      {selectedCompany.hrPrep.join(" • ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Practice Activities */}
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Suggested Practice Activities in CareerPilot AI
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {selectedCompany.suggestedActivities.map((act) => (
                  <div
                    key={act.label}
                    className="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-3.5 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">{act.label}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{act.description}</p>
                    </div>
                    <div className="mt-3">
                      <ModuleActionLink moduleId={act.moduleId} label="Start activity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: WEEKLY PLACEMENT GOALS */}
      {/* ========================================== */}
      {activeTab === "goals" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    {weeklyGoals.weekLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {weeklyGoals.completedCount} of {weeklyGoals.totalCount} completed
                  </span>
                </div>
                <h2 className="font-display mt-1 text-lg font-bold">
                  Personalized Weekly Placement Goals
                </h2>
                <p className="text-xs text-muted-foreground">
                  Generated from your incomplete dimensions and topic weaknesses. Progress persists
                  across refreshes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRegenerateGoals}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh Smart Goals</span>
              </button>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Weekly Goal Completion</span>
                <span className="font-bold text-primary">{weeklyGoals.completionPct}%</span>
              </div>
              <Progress value={weeklyGoals.completionPct} className="h-2" />
            </div>

            {/* Goal Checklist */}
            <div className="mt-4 space-y-2.5">
              {weeklyGoals.goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs"
                >
                  <button
                    type="button"
                    aria-label={`Toggle goal ${goal.title}`}
                    onClick={() => handleToggleGoal(goal.id)}
                    className="mt-0.5 shrink-0 text-primary"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-bold ${
                          goal.completed ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {goal.title}
                      </span>
                      <span className="rounded bg-card px-2 py-0.5 text-[10px] font-bold text-primary border border-border">
                        {goal.category}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{goal.reason}</p>
                    <div className="mt-1.5">
                      <ModuleActionLink moduleId={goal.targetModuleId} label="Go to module" />
                    </div>
                  </div>

                  {goal.isCustom && (
                    <button
                      type="button"
                      aria-label={`Delete goal ${goal.title}`}
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Weekly Goal */}
            <form
              onSubmit={handleAddGoal}
              className="mt-5 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row"
            >
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Add a custom weekly placement goal (e.g., Revise Trees & Graphs)..."
                className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
                aria-label="Custom goal category"
                className="rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground outline-none"
              >
                <option value="Custom">Custom</option>
                <option value="Aptitude">Aptitude</option>
                <option value="Coding">Coding</option>
                <option value="Core CS">Core CS</option>
                <option value="Interviews">Interviews</option>
                <option value="Resume">Resume</option>
              </select>
              <button
                type="submit"
                className="bg-brand inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-glow"
              >
                <Plus className="h-4 w-4" />
                <span>Add Goal</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: PLACEMENT PROGRESS ANALYTICS */}
      {/* ========================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-5">
          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">
                Activities Done
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {analytics.completedPreparationActivities} / {analytics.totalPreparationActivities}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">Ongoing</p>
              <p className="font-display mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {analytics.ongoingPreparationActivities}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">
                Assessments Logged
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-primary">
                {analytics.assessmentScoreHistory.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">
                Mock Interviews
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-violet">
                {analytics.interviewScoreHistory.length}
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Weekly & Monthly Activity Chart */}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-bold">Weekly Activity & Score Trend</h3>
              <p className="text-[11px] text-muted-foreground">
                Derived from timestamped assessments, coding bugs, interviews & speech drills.
              </p>
              {analytics.weeklyProgress.length === 0 ? (
                <p className="py-12 text-center text-xs text-muted-foreground">
                  No timestamped practice sessions recorded yet. Complete an assessment or interview
                  to plot your weekly curve.
                </p>
              ) : (
                <div className="mt-4 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="activitiesCompleted"
                        name="Activities"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            {/* Monthly Progress Chart */}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-bold">Monthly Progress Overview</h3>
              <p className="text-[11px] text-muted-foreground">
                Monthly completed activities & average score trajectory (%).
              </p>
              {analytics.monthlyProgress.length === 0 ? (
                <p className="py-12 text-center text-xs text-muted-foreground">
                  Monthly progress will appear once you complete your first activity.
                </p>
              ) : (
                <div className="mt-4 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyProgress}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="avgScorePct"
                        name="Avg Score %"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            {/* Assessment Score History */}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-bold">Assessment Score History</h3>
              <p className="text-[11px] text-muted-foreground">
                Chronological accuracy (%) across Aptitude, Logical, Technical & Core CS.
              </p>
              {analytics.assessmentScoreHistory.length === 0 ? (
                <p className="py-12 text-center text-xs text-muted-foreground">
                  No placement assessments submitted yet.
                </p>
              ) : (
                <div className="mt-4 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.assessmentScoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="accuracyPct"
                        name="Accuracy %"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            {/* Interview Score History */}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-bold">Interview Score History</h3>
              <p className="text-[11px] text-muted-foreground">
                Mock interview score progression out of 10 across completed rounds.
              </p>
              {analytics.interviewScoreHistory.length === 0 ? (
                <p className="py-12 text-center text-xs text-muted-foreground">
                  No mock interview rounds completed yet.
                </p>
              ) : (
                <div className="mt-4 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.interviewScoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="scoreTen"
                        name="Score (/10)"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          {/* Skills Improved & Weak Areas */}
          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 shadow-card">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display text-sm font-bold text-foreground">Skills Improved</h3>
              </div>
              {analytics.skillsImproved.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  No strong/improved skills recorded yet. Score 70%+ on assessments, debugging
                  challenges, or improve across mock interviews to populate this list.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {analytics.skillsImproved.map((sk) => (
                    <div
                      key={sk.skill}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{sk.skill}</p>
                        <p className="text-[11px] text-muted-foreground">{sk.detail}</p>
                      </div>
                      <span className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {sk.scorePct}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 shadow-card">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-display text-sm font-bold text-foreground">Weak Areas</h3>
              </div>
              {analytics.weakAreas.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  No recorded weak areas yet. Practice quizzes and mock interviews to surface
                  specific gaps.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {analytics.weakAreas.map((wk) => (
                    <div
                      key={wk.area}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{wk.area}</p>
                        <p className="text-[11px] text-muted-foreground">{wk.detail}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-display block text-sm font-bold text-amber-600 dark:text-amber-400">
                          {wk.scorePct}%
                        </span>
                        <ModuleActionLink moduleId={wk.targetModuleId} label="Practice" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 6: PLACEMENT MILESTONES */}
      {/* ========================================== */}
      {activeTab === "milestones" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">Placement Milestones</h2>
                <p className="text-xs text-muted-foreground">
                  Milestones unlock automatically from real completed assessments, interviews,
                  coding solutions, and ATS-ready resumes.
                </p>
              </div>
              <span className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-glow">
                {unlockedMilestonesCount} / {milestones.length} Unlocked
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {milestones.map((ms) => (
              <div
                key={ms.id}
                data-testid={`milestone-${ms.id}`}
                className={`flex flex-col justify-between rounded-2xl border p-5 shadow-card transition ${
                  ms.unlocked ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-xl p-2.5 ${
                        ms.unlocked
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ms.unlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        ms.unlocked
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ms.unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>

                  <h3 className="font-display mt-3 text-base font-bold text-foreground">
                    {ms.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{ms.description}</p>

                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[11px] font-semibold">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary">{ms.progressPct}%</span>
                    </div>
                    <Progress value={ms.progressPct} className="h-1.5" />
                    <p className="mt-1.5 text-[11px] font-medium text-foreground">
                      {ms.criteriaLabel}
                    </p>
                  </div>
                </div>

                {!ms.unlocked && (
                  <div className="mt-4 border-t border-border/50 pt-3">
                    <ModuleActionLink moduleId={ms.targetModuleId} label="Work toward milestone" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReadinessGauge({ score }: { score: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
        <circle cx="48" cy="48" r={r} strokeWidth="9" className="fill-none stroke-muted" />
        <circle
          cx="48"
          cy="48"
          r={r}
          strokeWidth="9"
          strokeLinecap="round"
          className="fill-none stroke-primary transition-all duration-500"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-foreground">{clamped}</span>
        <span className="text-[10px] font-bold text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
