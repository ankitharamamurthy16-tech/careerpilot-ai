import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Flame,
  Mic,
  ClipboardCheck,
  GraduationCap,
  Landmark,
  Briefcase,
  Clock,
  AlertTriangle,
  X,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Send,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  clearAllNotifications,
  markLinkedInTaskPosted,
  getNotificationSettings,
  saveNotificationSettings,
  getBrowserPushPermissionStatus,
  requestBrowserPushPermission,
  getCompletedTaskIds,
  setTaskCompleted,
  dailyTasks,
  streak,
  getSelectedPathways,
  type InAppNotification,
  type NotificationCategory,
  type NotificationSettings,
  type PushPermissionState,
  type PathwayType,
} from "@/lib/data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

export function NotificationBell({
  className = "",
  triggerVariant = "default",
}: {
  className?: string;
  triggerVariant?: "default" | "header" | "sidebar";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | NotificationCategory>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [pushStatus, setPushStatus] = useState<PushPermissionState>("default");
  const [completedTasks, setCompletedTasksState] = useState<string[]>([]);
  const [linkedInModalPost, setLinkedInModalPost] = useState<{
    id: string;
    title: string;
    draft: string;
  } | null>(null);

  // Load and refresh notifications
  const reload = () => {
    setNotifications(getNotifications());
    setSettings(getNotificationSettings());
    setPushStatus(getBrowserPushPermissionStatus());
    setCompletedTasksState(getCompletedTaskIds());
  };

  useEffect(() => {
    reload();
    // Poll every 10 seconds in case new tasks or streaks trigger notifications
    const interval = setInterval(reload, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    const updated = markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
    toast.success("All notifications marked as read");
  };

  const handleDismiss = (id: string) => {
    const updated = dismissNotification(id);
    setNotifications(updated);
    toast.info("Notification dismissed");
  };

  const handleClearAll = () => {
    const updated = clearAllNotifications();
    setNotifications(updated);
    toast.info("All notifications cleared");
  };

  const handleToggleTask = (taskId: string) => {
    const isCurrentlyDone = completedTasks.includes(taskId);
    const updated = setTaskCompleted(taskId, !isCurrentlyDone);
    setCompletedTasksState(updated);
    toast.success(isCurrentlyDone ? "Task marked incomplete" : "Task completed! Streak updated.");
  };

  const handleOpenLinkedInDraft = (notif: InAppNotification) => {
    if (!notif.metadata?.linkedInDraft) return;
    setLinkedInModalPost({
      id: notif.id,
      title: notif.title,
      draft: notif.metadata.linkedInDraft,
    });
    handleMarkAsRead(notif.id);
  };

  const handleCopyAndLaunchLinkedIn = () => {
    if (!linkedInModalPost) return;
    try {
      navigator.clipboard.writeText(linkedInModalPost.draft);
      toast.success("Draft post copied to clipboard! Opening LinkedIn post composer...");
    } catch {
      toast.info("Opening LinkedIn. You can copy the draft post below.");
    }
    // Mark as posted on LinkedIn
    markLinkedInTaskPosted(linkedInModalPost.id);
    reload();

    // Open LinkedIn in a new tab without automatically posting (student reviews first)
    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank", "noopener,noreferrer");
  };

  const handleEnablePush = async () => {
    const status = await requestBrowserPushPermission();
    setPushStatus(status);
    if (status === "granted") {
      toast.success("Browser push notifications enabled successfully!");
    } else if (status === "denied") {
      toast.error(
        "Notifications blocked by browser. Please enable them in your browser site settings.",
      );
    } else if (status === "unsupported") {
      toast.info(
        "Web push not supported in this iframe environment. Persistent in-app notifications are fully active.",
      );
    }
  };

  const handleSettingCategoryToggle = (
    category: keyof NotificationSettings["enabledCategories"],
  ) => {
    const current = { ...settings };
    current.enabledCategories[category] = !current.enabledCategories[category];
    setSettings(current);
    saveNotificationSettings(current);
    toast.success(`Notification preference saved`);
  };

  const handleTimeChange = (time: string) => {
    const current = { ...settings, preferredDailyTime: time };
    setSettings(current);
    saveNotificationSettings(current);
    toast.success(`Daily reminder time set to ${time}`);
  };

  const handleFrequencyChange = (freq: NotificationSettings["frequency"]) => {
    const current = { ...settings, frequency: freq };
    setSettings(current);
    saveNotificationSettings(current);
    toast.success(`Reminder frequency set to ${freq.replace("_", " ")}`);
  };

  // Filter notifications by category and active settings
  const filteredNotifications = notifications.filter((n) => {
    if (!settings.enabledCategories[n.category]) return false;
    if (activeTab === "all") return true;
    return n.category === activeTab;
  });

  const selectedPathways = getSelectedPathways();
  const activeTasks = dailyTasks.filter(
    (t) => t.track === "core" || selectedPathways.includes(t.track as PathwayType),
  );
  const pendingTasks = activeTasks.filter((t) => !completedTasks.includes(t.id));

  // Category Icon helper
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "daily_practice":
        return <ClipboardCheck className="h-4 w-4 text-primary" />;
      case "linkedin_reminder":
        return <Share2 className="h-4 w-4 text-blue-500" />;
      case "streak_motivation":
        return <Flame className="h-4 w-4 text-amber-500" />;
      case "weekly_interview":
        return <Mic className="h-4 w-4 text-violet" />;
      case "system_exam":
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open notifications"
            className={`relative flex items-center justify-center transition active:scale-95 ${
              triggerVariant === "header"
                ? "rounded-full bg-navy-foreground/10 p-3 hover:bg-navy-foreground/20 text-navy-foreground"
                : triggerVariant === "sidebar"
                  ? "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold opacity-75 hover:bg-navy-foreground/10 hover:opacity-100 text-navy-foreground"
                  : "rounded-xl border border-border bg-card p-2 text-foreground hover:bg-muted shadow-sm"
            } ${className}`}
          >
            <Bell className="h-5 w-5" />
            {triggerVariant === "sidebar" && <span>Notifications</span>}

            {unreadCount > 0 && (
              <span
                className={`absolute flex items-center justify-center rounded-full bg-rose-600 font-bold text-white shadow-sm ${
                  triggerVariant === "sidebar"
                    ? "right-4 h-5 px-1.5 text-[10px]"
                    : "-right-1 -top-1 h-5 min-w-5 px-1 text-[10px]"
                }`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="flex h-full w-full flex-col p-0 sm:max-w-md bg-background border-l border-border z-50 overflow-hidden"
        >
          {/* Header */}
          <SheetHeader className="border-b border-border p-4 bg-card/60 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-brand flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-base font-bold text-foreground">
                      Notification Centre
                    </SheetTitle>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <SheetDescription className="text-[11px] text-muted-foreground mt-0.5">
                    Practice alerts, LinkedIn reminders & weekly mentors
                  </SheetDescription>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  title="Notification Settings"
                  className={`rounded-lg p-2 transition ${
                    showSettings ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    title="Clear all notifications"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Tabs (when not viewing settings) */}
            {!showSettings && (
              <div className="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg px-2.5 py-1 font-bold whitespace-nowrap transition ${
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab("daily_practice")}
                  className={`rounded-lg px-2.5 py-1 font-bold whitespace-nowrap transition ${
                    activeTab === "daily_practice"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Practice ({pendingTasks.length} Pending)
                </button>
                <button
                  onClick={() => setActiveTab("linkedin_reminder")}
                  className={`rounded-lg px-2.5 py-1 font-bold whitespace-nowrap transition ${
                    activeTab === "linkedin_reminder"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => setActiveTab("streak_motivation")}
                  className={`rounded-lg px-2.5 py-1 font-bold whitespace-nowrap transition ${
                    activeTab === "streak_motivation"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Streak ({streak.current}d)
                </button>
                <button
                  onClick={() => setActiveTab("weekly_interview")}
                  className={`rounded-lg px-2.5 py-1 font-bold whitespace-nowrap transition ${
                    activeTab === "weekly_interview"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Interview
                </button>
              </div>
            )}
          </SheetHeader>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* SETTINGS VIEW */}
            {showSettings ? (
              <div className="space-y-5 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-bold text-sm text-foreground">Notification Preferences</h4>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-primary font-bold hover:underline"
                  >
                    Back to Alerts →
                  </button>
                </div>

                {/* Category Toggles */}
                <div className="space-y-3">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    Enabled Notification Channels
                  </p>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between rounded-xl bg-card border border-border p-3 cursor-pointer hover:bg-muted/40 transition">
                      <div className="flex items-center gap-2.5">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <div>
                          <span className="font-bold text-foreground block">
                            Daily Practice Reminders
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Aptitude, reasoning, code decoder & GATE practice
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabledCategories.daily_practice}
                        onChange={() => handleSettingCategoryToggle("daily_practice")}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-xl bg-card border border-border p-3 cursor-pointer hover:bg-muted/40 transition">
                      <div className="flex items-center gap-2.5">
                        <Share2 className="h-4 w-4 text-blue-500" />
                        <div>
                          <span className="font-bold text-foreground block">
                            LinkedIn Professional Reminders
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Prompts to share projects, streaks & hackathon milestones
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabledCategories.linkedin_reminder}
                        onChange={() => handleSettingCategoryToggle("linkedin_reminder")}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-xl bg-card border border-border p-3 cursor-pointer hover:bg-muted/40 transition">
                      <div className="flex items-center gap-2.5">
                        <Flame className="h-4 w-4 text-amber-500" />
                        <div>
                          <span className="font-bold text-foreground block">
                            Streak & Motivation Alerts
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Habit preservation before streak expires at midnight
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabledCategories.streak_motivation}
                        onChange={() => handleSettingCategoryToggle("streak_motivation")}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-xl bg-card border border-border p-3 cursor-pointer hover:bg-muted/40 transition">
                      <div className="flex items-center gap-2.5">
                        <Mic className="h-4 w-4 text-violet" />
                        <div>
                          <span className="font-bold text-foreground block">
                            Weekly AI Interview Mentor
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            New week simulated rounds & speech pace goals
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabledCategories.weekly_interview}
                        onChange={() => handleSettingCategoryToggle("weekly_interview")}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-xl bg-card border border-border p-3 cursor-pointer hover:bg-muted/40 transition">
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="h-4 w-4 text-emerald-500" />
                        <div>
                          <span className="font-bold text-foreground block">
                            Exam Cadre & PYQ Alerts
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            UPSC, SSC, Banking dates & GATE verified PYQ releases
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabledCategories.system_exam}
                        onChange={() => handleSettingCategoryToggle("system_exam")}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>
                  </div>
                </div>

                {/* Preferred Daily Reminder Time */}
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    Preferred Daily Reminder Time
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "Morning", time: "08:00" },
                      { label: "Afternoon", time: "14:00" },
                      { label: "Evening", time: "18:00" },
                      { label: "Night", time: "21:00" },
                    ].map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeChange(slot.time)}
                        className={`rounded-xl p-2 text-center border transition ${
                          settings.preferredDailyTime === slot.time
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-card border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="block font-bold text-xs">{slot.time}</span>
                        <span className="text-[9px] opacity-75">{slot.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    Notification Frequency
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { key: "daily", label: "Daily (Standard)" },
                        { key: "weekdays", label: "Weekdays Only" },
                        { key: "twice_daily", label: "Twice Daily (Morning & Evening)" },
                        { key: "milestones_only", label: "Milestones Only" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.key}
                        onClick={() => handleFrequencyChange(f.key)}
                        className={`rounded-xl p-2.5 text-left border text-xs font-semibold transition ${
                          settings.frequency === f.key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Browser Push Permission Setup */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="font-bold text-foreground">Browser Push Alerts</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        pushStatus === "granted"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : pushStatus === "denied"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {pushStatus === "granted"
                        ? "Permission Granted"
                        : pushStatus === "denied"
                          ? "Blocked by Browser"
                          : pushStatus === "unsupported"
                            ? "Iframe Restricted"
                            : "Permission Required"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Browser push notifications require explicit user permission. In-app
                    notifications always persist reliably within your CareerPilot AI session.
                  </p>
                  {pushStatus !== "granted" && (
                    <button
                      onClick={handleEnablePush}
                      className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:opacity-95 transition"
                    >
                      Request Browser Push Permission
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* NOTIFICATIONS LIST VIEW */
              <div className="space-y-3">
                {/* INCOMPLETE DAILY PRACTICE BANNER (If viewing Daily Practice tab or All) */}
                {(activeTab === "all" || activeTab === "daily_practice") &&
                  pendingTasks.length > 0 && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-primary" />
                          <span className="text-xs font-bold text-foreground">
                            Today's Incomplete Practice Drills ({pendingTasks.length})
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {completedTasks.length}/{activeTasks.length} Completed
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {pendingTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <button
                                onClick={() => handleToggleTask(t.id)}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border hover:border-primary"
                              >
                                {completedTasks.includes(t.id) && (
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                )}
                              </button>
                              <span className="truncate font-medium text-foreground">
                                {t.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-primary whitespace-nowrap ml-2">
                              {t.minutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Notifications Cards */}
                {filteredNotifications.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="bg-muted inline-flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground">
                      <Bell className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-bold text-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      No notifications in this category. You're fully on track with your practice
                      drills and weekly interviews.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => {
                    return (
                      <div
                        key={n.id}
                        className={`group relative rounded-2xl border p-4 transition text-xs ${
                          n.isRead
                            ? "bg-card border-border/70"
                            : "bg-card border-primary/30 shadow-sm"
                        }`}
                      >
                        {/* Top Row: Category icon, title, dismiss & unread dot */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 rounded-lg bg-muted p-1.5 shrink-0">
                              {getCategoryIcon(n.category)}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="font-bold text-foreground text-xs leading-snug">
                                  {n.title}
                                </h5>
                                {!n.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-violet shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" /> {n.formattedTime}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDismiss(n.id)}
                            title="Dismiss notification"
                            className="text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground p-1 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Message body */}
                        <p className="mt-2 text-muted-foreground leading-relaxed pl-8">
                          {n.message}
                        </p>

                        {/* Context Action Buttons */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 pl-8">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* LinkedIn Action */}
                            {n.category === "linkedin_reminder" && (
                              <button
                                onClick={() => handleOpenLinkedInDraft(n)}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-blue-700 transition"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                                <span>{n.actionLabel || "Draft LinkedIn Post"}</span>
                              </button>
                            )}

                            {/* Standard In-App Action */}
                            {n.actionUrl && n.category !== "linkedin_reminder" && (
                              <Link
                                to={n.actionUrl}
                                onClick={() => {
                                  handleMarkAsRead(n.id);
                                  setIsOpen(false);
                                }}
                                className="bg-brand shadow-sm flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white hover:opacity-95 transition"
                              >
                                <span>{n.actionLabel || "Open Track"}</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            )}

                            {/* LinkedIn Status Badge if already posted */}
                            {n.metadata?.isPostedToLinkedIn && (
                              <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <Check className="h-3 w-3" /> Shared on LinkedIn
                              </span>
                            )}
                          </div>

                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="text-[10px] font-bold text-primary hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* LINKEDIN DRAFT & REVIEW MODAL */}
      {linkedInModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-blue-600 p-2 text-white">
                  <Share2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    LinkedIn Professional Post Draft
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Review and personalize before sharing on your profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLinkedInModalPost(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-muted/40 p-3.5 border border-border text-xs">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Draft Content (Editable):
              </label>
              <textarea
                rows={8}
                value={linkedInModalPost.draft}
                onChange={(e) =>
                  setLinkedInModalPost({ ...linkedInModalPost, draft: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background p-3 font-sans text-xs text-foreground leading-relaxed outline-none focus:border-primary"
              />
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <b>Student Publishing Guarantee:</b> CareerPilot AI never publishes directly to your
                LinkedIn account. Clicking the button copies this text to your clipboard and opens
                LinkedIn's post composer so you retain total editorial control.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
              <button
                onClick={() => setLinkedInModalPost(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyAndLaunchLinkedIn}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Draft & Open LinkedIn Composer</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
