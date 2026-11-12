// Notification Centre Service & Persistence Layer for CareerPilot AI
// Scoped per authenticated student, supports in-app notifications, LinkedIn milestone sharing,
// daily practice reminders, streak preservation, and browser push notification permissions.

import { getStudent } from "./auth";

export type NotificationCategory =
  "daily_practice" | "linkedin_reminder" | "streak_motivation" | "weekly_interview" | "system_exam";

export type NotificationPriority = "high" | "normal" | "low";

export type InAppNotification = {
  id: string;
  studentEmail: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string; // ISO format
  formattedTime: string;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    taskId?: string;
    taskTitle?: string;
    taskMinutes?: number;
    pathway?: "placement" | "government" | "gate";
    streakDays?: number;
    linkedInType?: "task" | "project" | "certificate" | "hackathon" | "skill";
    linkedInDraft?: string;
    isPostedToLinkedIn?: boolean;
    interviewWeek?: number;
    previousScore?: number;
    previousPaceWpm?: number;
  };
};

export type NotificationSettings = {
  studentEmail: string;
  enabledCategories: {
    daily_practice: boolean;
    linkedin_reminder: boolean;
    streak_motivation: boolean;
    weekly_interview: boolean;
    system_exam: boolean;
  };
  preferredDailyTime: string; // "08:00" | "14:00" | "18:00" | "21:00"
  frequency: "daily" | "weekdays" | "twice_daily" | "milestones_only";
  browserPushEnabled: boolean;
};

const NOTIFICATIONS_PREFIX = "cp_notifications_";
const SETTINGS_PREFIX = "cp_notification_settings_";
const COMPLETED_TASKS_PREFIX = "cp_completed_tasks_";

// Get current student email
function getCurrentStudentEmail(): string {
  const s = getStudent();
  return s?.email || "student@careerpilot.ai";
}

// ==========================================
// 1. TASK COMPLETION PERSISTENCE
// ==========================================
export function getCompletedTaskIds(): string[] {
  if (typeof window === "undefined") return ["t1", "t3"];
  try {
    const email = getCurrentStudentEmail();
    const raw = localStorage.getItem(`${COMPLETED_TASKS_PREFIX}${email}`);
    if (raw) return JSON.parse(raw);
    return ["t1", "t3"]; // Default initial state
  } catch {
    return ["t1", "t3"];
  }
}

export function setTaskCompleted(taskId: string, isCompleted: boolean): string[] {
  if (typeof window === "undefined") return [];
  try {
    const email = getCurrentStudentEmail();
    const current = getCompletedTaskIds();
    let updated: string[];
    if (isCompleted) {
      updated = current.includes(taskId) ? current : [...current, taskId];
    } else {
      updated = current.filter((id) => id !== taskId);
    }
    localStorage.setItem(`${COMPLETED_TASKS_PREFIX}${email}`, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// ==========================================
// 2. NOTIFICATION SETTINGS PERSISTENCE
// ==========================================
export function getNotificationSettings(): NotificationSettings {
  const email = getCurrentStudentEmail();
  const defaultSettings: NotificationSettings = {
    studentEmail: email,
    enabledCategories: {
      daily_practice: true,
      linkedin_reminder: true,
      streak_motivation: true,
      weekly_interview: true,
      system_exam: true,
    },
    preferredDailyTime: "18:00",
    frequency: "daily",
    browserPushEnabled: false,
  };

  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(`${SETTINGS_PREFIX}${email}`);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === "undefined") return;
  try {
    const email = getCurrentStudentEmail();
    localStorage.setItem(`${SETTINGS_PREFIX}${email}`, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// ==========================================
// 3. IN-APP NOTIFICATIONS STORAGE & GENERATION
// ==========================================
function getInitialSeedNotifications(email: string): InAppNotification[] {
  return [
    {
      id: "notif-dp-1",
      studentEmail: email,
      category: "daily_practice",
      title: "Daily Practice Reminder: 3 Tasks Pending",
      message:
        "You have unfinished practice drills today for your active tracks: TCS NQT Quant Mock, Python Array Problems, and GATE Cache NATs.",
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      formattedTime: "45 mins ago",
      isRead: false,
      priority: "high",
      actionUrl: "/app/assessment/quant-mock-4",
      actionLabel: "Practice Now",
      metadata: {
        taskId: "t2",
        taskTitle: "Aptitude: Quantitative Mock 4 practice",
        taskMinutes: 25,
        pathway: "placement",
      },
    },
    {
      id: "notif-li-1",
      studentEmail: email,
      category: "linkedin_reminder",
      title: "Share Your 14-Day Learning Streak on LinkedIn! 🚀",
      message:
        "Consistent technical effort stands out to recruiters. We've prepared a clean, professional summary of your recent coding & assessment milestones ready for your review.",
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      formattedTime: "3 hours ago",
      isRead: false,
      priority: "normal",
      actionUrl: "https://www.linkedin.com/feed/?shareActive=true",
      actionLabel: "Draft LinkedIn Post",
      metadata: {
        linkedInType: "task",
        streakDays: 14,
        isPostedToLinkedIn: false,
        linkedInDraft:
          "🚀 14-Day Consistency Milestone in Placement & Technical Prep!\n\n" +
          "Over the past two weeks, I've dedicated focused daily time on CareerPilot AI to sharpen core engineering competencies:\n" +
          "• Quantitative Aptitude & Data Interpretation (TCS & Infosys patterns)\n" +
          "• Algorithmic problem breakdowns in Python & C (Two Sum, Kadane's Algorithm)\n" +
          "• Core CS & GATE Architecture concepts (Cache mapping and instruction pipelining)\n" +
          "• Weekly AI-simulated behavioral & technical mock interviews\n\n" +
          "Small daily repetitions compound. Looking forward to upcoming campus recruitment opportunities!\n\n" +
          "#CampusPlacements #ContinuousLearning #Coding #CareerPilotAI #TechCareers #SoftwareEngineering",
      },
    },
    {
      id: "notif-st-1",
      studentEmail: email,
      category: "streak_motivation",
      title: "Protect Your 14-Day Learning Streak 🔥",
      message:
        "Your streak is at an all-time high! Complete at least 1 practice task before midnight to extend your streak to 15 days.",
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      formattedTime: "5 hours ago",
      isRead: false,
      priority: "high",
      actionUrl: "/app/modules/code-decoder",
      actionLabel: "Complete 1 Task",
      metadata: {
        streakDays: 14,
      },
    },
    {
      id: "notif-int-1",
      studentEmail: email,
      category: "weekly_interview",
      title: "Weekly AI Interview Mentor: Week 2 Round Live",
      message:
        "Your Week 2 simulated mock interview is waiting. In Week 1, your pace was 105 WPM (A Bit Slow). Target an articulate 120-140 WPM pace today with STAR structure!",
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      formattedTime: "Yesterday",
      isRead: true,
      priority: "normal",
      actionUrl: "/app/modules/interview-mentor",
      actionLabel: "Start Week 2 Interview",
      metadata: {
        interviewWeek: 2,
        previousScore: 64,
        previousPaceWpm: 105,
      },
    },
    {
      id: "notif-gate-1",
      studentEmail: email,
      category: "system_exam",
      title: "GATE CSE: Verified PYQs Added for 2023",
      message:
        "12 official previous-year questions with Numerical Answer Type (NAT) tolerance validation and step-by-step mathematical solutions are now live in your GATE track.",
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      formattedTime: "2 days ago",
      isRead: true,
      priority: "low",
      actionUrl: "/app/modules/gate-prep",
      actionLabel: "Explore GATE Module",
      metadata: {
        pathway: "gate",
      },
    },
  ];
}

export function getNotifications(): InAppNotification[] {
  const email = getCurrentStudentEmail();
  if (typeof window === "undefined") return getInitialSeedNotifications(email);
  try {
    const raw = localStorage.getItem(`${NOTIFICATIONS_PREFIX}${email}`);
    if (raw) {
      const parsed: InAppNotification[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Seed initial notifications if empty
    const seed = getInitialSeedNotifications(email);
    localStorage.setItem(`${NOTIFICATIONS_PREFIX}${email}`, JSON.stringify(seed));
    return seed;
  } catch {
    return getInitialSeedNotifications(email);
  }
}

export function saveNotifications(notifications: InAppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    const email = getCurrentStudentEmail();
    localStorage.setItem(`${NOTIFICATIONS_PREFIX}${email}`, JSON.stringify(notifications));
  } catch {
    // ignore
  }
}

export function markNotificationAsRead(id: string): InAppNotification[] {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveNotifications(updated);
  return updated;
}

export function markAllNotificationsAsRead(): InAppNotification[] {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, isRead: true }));
  saveNotifications(updated);
  return updated;
}

export function dismissNotification(id: string): InAppNotification[] {
  const current = getNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveNotifications(updated);
  return updated;
}

export function clearAllNotifications(): InAppNotification[] {
  const email = getCurrentStudentEmail();
  if (typeof window !== "undefined") {
    localStorage.setItem(`${NOTIFICATIONS_PREFIX}${email}`, JSON.stringify([]));
  }
  return [];
}

export function markLinkedInTaskPosted(notificationId: string): InAppNotification[] {
  const current = getNotifications();
  const updated = current.map((n) => {
    if (n.id === notificationId) {
      return {
        ...n,
        isRead: true,
        metadata: {
          ...n.metadata,
          isPostedToLinkedIn: true,
        },
      };
    }
    return n;
  });
  saveNotifications(updated);
  return updated;
}

// Generate a fresh LinkedIn reminder for a specific project/certificate/skill milestone
export function createLinkedInMilestoneNotification(
  type: "project" | "certificate" | "hackathon" | "skill",
  title: string,
  draftText: string,
): InAppNotification {
  const email = getCurrentStudentEmail();
  const notif: InAppNotification = {
    id: `notif-li-${Date.now()}`,
    studentEmail: email,
    category: "linkedin_reminder",
    title: `Share Your Achievement: ${title}`,
    message: `You completed a significant learning milestone (${title}). Review and post this to your LinkedIn network to enhance recruiter visibility.`,
    createdAt: new Date().toISOString(),
    formattedTime: "Just now",
    isRead: false,
    priority: "normal",
    actionUrl: "https://www.linkedin.com/feed/?shareActive=true",
    actionLabel: "Draft LinkedIn Post",
    metadata: {
      linkedInType: type,
      isPostedToLinkedIn: false,
      linkedInDraft: draftText,
    },
  };

  const list = [notif, ...getNotifications()];
  saveNotifications(list);
  return notif;
}

// ==========================================
// 4. BROWSER PUSH NOTIFICATION HELPER
// Transparent browser permission check without fake claims
// ==========================================
export type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

export function getBrowserPushPermissionStatus(): PushPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return window.Notification.permission as PushPermissionState;
}

export async function requestBrowserPushPermission(): Promise<PushPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    const result = await window.Notification.requestPermission();
    const settings = getNotificationSettings();
    if (result === "granted") {
      saveNotificationSettings({ ...settings, browserPushEnabled: true });
      // Send a confirmation system notification
      try {
        new window.Notification("CareerPilot AI Reminders Active", {
          body: "You will receive practice, interview and learning milestone alerts.",
          icon: "/logo.svg",
        });
      } catch {
        // Notification constructor may be restricted in some iframes
      }
    } else {
      saveNotificationSettings({ ...settings, browserPushEnabled: false });
    }
    return result as PushPermissionState;
  } catch {
    return "denied";
  }
}
