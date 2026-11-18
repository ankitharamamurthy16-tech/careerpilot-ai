// Central Data & Service Layer for CareerPilot AI
// Screens import ONLY from src/lib/data.ts and src/lib/auth.ts
import {
  ClipboardCheck,
  Code2,
  MessageCircle,
  Map,
  FolderKanban,
  FileText,
  Users,
  Landmark,
  Mic,
  BookOpen,
  Award,
  CheckCircle2,
  Flame,
  Target,
  Sparkles,
  GraduationCap,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import type { CodeLanguage } from "./code-decoder-data";

// ==========================================
// 1. PATHWAY MANAGEMENT
// ==========================================
export type PathwayType = "placement" | "government" | "gate";
export type PreparationPathway = PathwayType | "both" | "all";

const PATHWAY_KEY = "cp_prep_pathway";
const PATHWAYS_MULTI_KEY = "cp_selected_pathways";

export function getSelectedPathways(): PathwayType[] {
  if (typeof window === "undefined") return ["placement", "government", "gate"];
  try {
    const stored = localStorage.getItem(PATHWAYS_MULTI_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as PathwayType[];
      }
    }
    const single = localStorage.getItem(PATHWAY_KEY);
    if (single === "placement") return ["placement"];
    if (single === "government") return ["government"];
    if (single === "gate") return ["gate"];
    if (single === "both") return ["placement", "government"];
    if (single === "all") return ["placement", "government", "gate"];
    return ["placement", "government", "gate"];
  } catch {
    return ["placement", "government", "gate"];
  }
}

export function setSelectedPathways(pathways: PathwayType[]) {
  if (typeof window === "undefined") return;
  try {
    const cleaned = pathways.length ? pathways : ["placement", "government", "gate"];
    localStorage.setItem(PATHWAYS_MULTI_KEY, JSON.stringify(cleaned));
    if (cleaned.length === 3) localStorage.setItem(PATHWAY_KEY, "all");
    else if (cleaned.length === 1) localStorage.setItem(PATHWAY_KEY, cleaned[0] ?? "placement");
    else if (
      cleaned.includes("placement") &&
      cleaned.includes("government") &&
      !cleaned.includes("gate")
    ) {
      localStorage.setItem(PATHWAY_KEY, "both");
    } else {
      localStorage.setItem(PATHWAY_KEY, cleaned[0] ?? "placement");
    }
  } catch {
    // ignore
  }
}

export function togglePathway(p: PathwayType): PathwayType[] {
  const current = getSelectedPathways();
  let updated: PathwayType[];
  if (current.includes(p)) {
    // Don't allow deselecting all
    if (current.length === 1) return current;
    updated = current.filter((x) => x !== p);
  } else {
    updated = [...current, p];
  }
  setSelectedPathways(updated);
  return updated;
}

export function getPathway(): PreparationPathway {
  if (typeof window === "undefined") return "all";
  try {
    const val = localStorage.getItem(PATHWAY_KEY);
    if (
      val === "placement" ||
      val === "government" ||
      val === "gate" ||
      val === "both" ||
      val === "all"
    ) {
      return val as PreparationPathway;
    }
    const multi = getSelectedPathways();
    if (multi.length === 3) return "all";
    if (multi.length === 1) return multi[0] ?? "placement";
    if (multi.includes("placement") && multi.includes("government")) return "both";
    return "all";
  } catch {
    return "all";
  }
}

export function setPathway(p: PreparationPathway) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PATHWAY_KEY, p);
    if (p === "placement") setSelectedPathways(["placement"]);
    else if (p === "government") setSelectedPathways(["government"]);
    else if (p === "gate") setSelectedPathways(["gate"]);
    else if (p === "both") setSelectedPathways(["placement", "government"]);
    else if (p === "all") setSelectedPathways(["placement", "government", "gate"]);
  } catch {
    // ignore
  }
}

// ==========================================
// 2. MODULES (PLACEMENT, GOVERNMENT & GATE)
// ==========================================
export type Module = {
  id: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  progress: number;
  highlights: string[];
  track: "placement" | "government" | "gate" | "core";
};

export const modules: Module[] = [
  // --- Private-Sector Placement Track ---
  {
    id: "placement-tracker",
    title: "Smart Placement Tracker",
    tagline: "Readiness score, 8-area prep tracker, company paths & AI mentor",
    icon: Target,
    progress: 0,
    highlights: [
      "Real-data 8-category Placement Readiness Score (/100)",
      "8-section Preparation Tracker (Completed / Ongoing / Pending)",
      "9 Company Prep Guides + Personalized Weekly Goals & Milestones",
      "Analytics Charts & Data-Grounded AI Placement Mentor",
    ],
    track: "placement",
  },
  {
    id: "assessment",
    title: "My Assessment",
    tagline: "Aptitude, reasoning & technical tests",
    icon: ClipboardCheck,
    progress: 72,
    highlights: [
      "Quantitative Aptitude – Mock 4 (30 Qs)",
      "Logical Reasoning – Puzzles set",
      "DBMS & OS technical quiz",
      "Company-wise test: TCS NQT pattern",
    ],
    track: "placement",
  },
  {
    id: "code-decoder",
    title: "Code Decoder",
    tagline: "Python, Java & C code breakdowns & complexity",
    icon: Code2,
    progress: 65,
    highlights: [
      "Python: Two Sum, Kadane's Algorithm",
      "Java: Reverse Linked List in K Groups",
      "C: Memory Pointers & Dynamic Allocation",
      "Interactive syntax & complexity explainer",
    ],
    track: "placement",
  },
  {
    id: "communication",
    title: "Communication Coach",
    tagline: "HR answers, GD & spoken English",
    icon: MessageCircle,
    progress: 58,
    highlights: [
      "Tell me about yourself – practice",
      "Group discussion: AI in jobs",
      "Formal email writing drill",
      "Speech pace & filler word detector",
    ],
    track: "placement",
  },
  {
    id: "interview-mentor",
    title: "Weekly AI Interview Mentor",
    tagline: "Simulated voice/typed mock interviews",
    icon: Mic,
    progress: 80,
    highlights: [
      "Simulated weekly role interview",
      "Spoken voice / typed answer evaluation",
      "Speech pace (WPM) & STAR structure check",
      "Historical week-by-week progress comparison",
    ],
    track: "core",
  },
  {
    id: "roadmap",
    title: "Career Roadmap",
    tagline: "Your step-by-step path to placement",
    icon: Map,
    progress: 45,
    highlights: [
      "Goal: Software Engineer @ Product Company",
      "Phase 1: DSA fundamentals – done",
      "Phase 2: Core CS + Projects – in progress",
      "Phase 3: Mock interviews & HR rounds",
    ],
    track: "placement",
  },
  {
    id: "resume",
    title: "Resume Builder",
    tagline: "ATS-friendly resumes in minutes",
    icon: FileText,
    progress: 85,
    highlights: [
      "ATS score: 84 / 100",
      "Quantified bullet points generator",
      "Clean 1-page modern tech template",
      "Live ATS keyword optimizer",
    ],
    track: "placement",
  },
  {
    id: "projects",
    title: "Projects",
    tagline: "Build portfolio-worthy work",
    icon: FolderKanban,
    progress: 60,
    highlights: [
      "Smart Placement Portal (React + Node)",
      "Expense Tracker API with Auth",
      "AI Resume Screening Engine",
      "Campus Buzz Social Network",
    ],
    track: "placement",
  },
  {
    id: "community",
    title: "Campus Community",
    tagline: "Peers, seniors & placement buzz",
    icon: Users,
    progress: 35,
    highlights: [
      "TCS & Infosys drive dates announced",
      "Senior AMA: Cracking Amazon SDE-1",
      "Daily DSA study circle – 42 active",
      "24 new interview experiences shared",
    ],
    track: "core",
  },

  // --- Government Exam Track ---
  {
    id: "government-exams",
    title: "Govt Exam Track",
    tagline: "UPSC, TNPSC, SSC, Banking & Railways",
    icon: Landmark,
    progress: 60,
    highlights: [
      "Target exams: UPSC, TNPSC, SSC, Bank, RRB",
      "Official Previous-Year Questions (PYQs)",
      "Daily Current Affairs with sources & dates",
      "Topic-wise accuracy & structured study plans",
    ],
    track: "government",
  },

  // --- GATE Exam Track ---
  {
    id: "gate-prep",
    title: "GATE Preparation",
    tagline: "CSE, DA, EC, EE, ME, CE • 12 Subjects, MCQs, NATs & PYQs",
    icon: GraduationCap,
    progress: 68,
    highlights: [
      "Branch selector: CS, DA, EC, EE, ME, CE & Other",
      "12 GATE CSE Subjects with syllabus & formula references",
      "Topic-wise MCQs & Numerical Answer Type (NAT) questions",
      "Verified official PYQs vs newly generated practice drills",
      "Timed mock tests with official negative marking",
      "Topic-wise accuracy & 30/90-day structured study plans",
    ],
    track: "gate",
  },
];

// ==========================================
// 3. CODE DECODER DATA (PYTHON, JAVA, C)
// ==========================================
export * from "./code-decoder-data";

export type CodeProblem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  code: Record<CodeLanguage, string>;
  explanation: Record<
    CodeLanguage,
    {
      summary: string;
      timeComplexity: string;
      spaceComplexity: string;
      lineBreakdown: { line: number; text: string }[];
      bugTraps: string[];
    }
  >;
};

export const codeProblems: CodeProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum (Target Pair)",
    difficulty: "Easy",
    topic: "Arrays & Hash Maps",
    code: {
      python: `def two_sum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []`,
      java: `import java.util.HashMap;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* result = (int*)malloc(2 * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                *returnSize = 2;
                return result;
            }
        }
    }
    return result;
}`,
    },
    explanation: {
      python: {
        summary:
          "Uses a hash table to find the complement in a single pass instead of quadratic brute force.",
        timeComplexity: "O(n) — single pass through the array with O(1) hash lookups",
        spaceComplexity: "O(n) — stores at most n elements in the dictionary",
        lineBreakdown: [
          { line: 1, text: "Define function receiving list of integers and target sum." },
          { line: 2, text: "Initialize empty dictionary to track seen numbers and their indices." },
          { line: 3, text: "Enumerate through array to inspect both index i and value num." },
          { line: 4, text: "Compute required difference: complement = target - num." },
          { line: 5, text: "Check if complement was already seen in constant time O(1)." },
          { line: 6, text: "Match found: return the previous index and current index." },
          { line: 7, text: "Otherwise store current number with its index for future lookups." },
        ],
        bugTraps: [
          "Do not insert the current number before checking complement, or a number might match itself.",
          "Beware of using index() which is O(n) inside a loop.",
        ],
      },
      java: {
        summary: "Uses Java HashMap for constant time complement verification in one pass.",
        timeComplexity: "O(n) — O(1) average time for HashMap get and put",
        spaceComplexity: "O(n) — HashMap holds up to n integer entries",
        lineBreakdown: [
          {
            line: 5,
            text: "Initialize HashMap with Integer keys (value) and Integer values (index).",
          },
          { line: 6, text: "Iterate through nums array using standard indexed for-loop." },
          { line: 7, text: "Calculate complement = target - nums[i]." },
          { line: 8, text: "Check if HashMap already contains complement key." },
          { line: 9, text: "Return new int array with previous index and current index." },
          { line: 11, text: "Store current value and index into HashMap." },
        ],
        bugTraps: [
          "Autoboxing overhead when creating millions of Integer objects.",
          "Integer overflow if target is large positive and complement is negative.",
        ],
      },
      c: {
        summary:
          "In C without built-in HashMaps, demonstrates two-pointer or nested scan with explicit memory allocation.",
        timeComplexity: "O(n²) brute-force scan (or O(n log n) with qsort)",
        spaceComplexity: "O(1) auxiliary space (excluding 2-element returned buffer)",
        lineBreakdown: [
          { line: 5, text: "Dynamically allocate 2 ints on the heap using malloc." },
          { line: 6, text: "Set output returnSize pointer to 0 initially." },
          { line: 7, text: "Outer loop iterates through first element." },
          { line: 8, text: "Inner loop checks subsequent elements j = i + 1." },
          { line: 9, text: "Check if sum matches target." },
          { line: 12, text: "Assign returnSize = 2 and return pointer to caller." },
        ],
        bugTraps: [
          "Memory leak if caller forgets to free() the returned pointer.",
          "Neglecting to set *returnSize causes undefined behavior on judge platforms.",
        ],
      },
    },
  },
  {
    id: "kadanes-algorithm",
    title: "Maximum Subarray (Kadane's Algorithm)",
    difficulty: "Medium",
    topic: "Dynamic Programming / Greedy",
    code: {
      python: `def max_sub_array(nums):
    current_sum = max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
      java: `public class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`,
      c: `#include <stdio.h>

int maxSubArray(int* nums, int numsSize) {
    int currentSum = nums[0];
    int maxSum = nums[0];
    for (int i = 1; i < numsSize; i++) {
        int sum = currentSum + nums[i];
        currentSum = (nums[i] > sum) ? nums[i] : sum;
        if (currentSum > maxSum) {
            maxSum = currentSum;
        }
    }
    return maxSum;
}`,
    },
    explanation: {
      python: {
        summary:
          "Kadane's algorithm decides at each step whether to extend the existing contiguous subarray or start fresh from current number.",
        timeComplexity: "O(n) — single linear pass through nums",
        spaceComplexity: "O(1) — only two tracking variables",
        lineBreakdown: [
          { line: 2, text: "Initialize both current_sum and max_sum to first element." },
          { line: 3, text: "Iterate through rest of array from index 1." },
          {
            line: 4,
            text: "At each index: choose between extending prefix or starting new subarray.",
          },
          { line: 5, text: "Update global maximum seen so far." },
        ],
        bugTraps: [
          "Do not initialize max_sum to 0! If all numbers are negative, the correct answer is the largest negative number.",
        ],
      },
      java: {
        summary: "Linear time solution using Math.max to maintain running contiguous sum.",
        timeComplexity: "O(n) — loop runs (n - 1) times",
        spaceComplexity: "O(1) — constant auxiliary space",
        lineBreakdown: [
          { line: 3, text: "Initialize currentSum and maxSum to nums[0]." },
          { line: 5, text: "Iterate from index 1 to nums.length - 1." },
          { line: 6, text: "Compute maximum of extending previous sub-array vs starting fresh." },
          { line: 7, text: "Track the all-time maximum sum." },
        ],
        bugTraps: [
          "Ensure input array is not empty before indexing nums[0].",
          "Potential 32-bit integer overflow if sums exceed Integer.MAX_VALUE in custom tests.",
        ],
      },
      c: {
        summary: "Cache-friendly, zero-allocation C implementation of Kadane's algorithm.",
        timeComplexity: "O(n) — single loop",
        spaceComplexity: "O(1) — register variables",
        lineBreakdown: [
          { line: 4, text: "Initialize currentSum and maxSum with nums[0]." },
          { line: 6, text: "Loop through elements from index 1 to numsSize - 1." },
          { line: 7, text: "Ternary operator chooses whether to restart or continue sub-array." },
          { line: 9, text: "Update maxSum when currentSum reaches new peak." },
        ],
        bugTraps: [
          "Always handle numsSize == 1 edge case properly.",
          "Do not initialize maxSum with 0 when array contains negative numbers.",
        ],
      },
    },
  },
  {
    id: "reverse-linked-list",
    title: "Reverse a Linked List",
    difficulty: "Medium",
    topic: "Pointers & Linked Lists",
    code: {
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`,
      c: `struct ListNode {
    int val;
    struct ListNode *next;
};

struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode *prev = NULL;
    struct ListNode *curr = head;
    while (curr != NULL) {
        struct ListNode *nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
    },
    explanation: {
      python: {
        summary: "Three-pointer iterative approach that reverses node links in place.",
        timeComplexity: "O(n) — visits each node exactly once",
        spaceComplexity: "O(1) — reverses pointers in-place without extra nodes",
        lineBreakdown: [
          { line: 7, text: "Initialize prev pointer to None (will become the new tail's next)." },
          { line: 8, text: "Start traversal pointer curr at head." },
          { line: 9, text: "Loop while curr node is not None." },
          { line: 10, text: "Store next node in nxt before breaking the link." },
          { line: 11, text: "Reverse the link: point curr.next backwards to prev." },
          { line: 12, text: "Shift prev forward to curr." },
          { line: 13, text: "Advance curr to saved nxt." },
        ],
        bugTraps: [
          "Losing reference to curr.next before updating pointer causes an infinite cycle or orphaned chain.",
        ],
      },
      java: {
        summary: "Classic iterative reference reversal across single linked list.",
        timeComplexity: "O(n) — single pass",
        spaceComplexity: "O(1) — only reference pointers",
        lineBreakdown: [
          { line: 9, text: "Set prev pointer to null." },
          { line: 10, text: "Set curr pointer to head." },
          { line: 11, text: "Traverse until curr reaches end (null)." },
          { line: 12, text: "Save nextTemp reference to prevent losing rest of list." },
          { line: 13, text: "Point curr.next to prev." },
          { line: 14, text: "Move prev forward to curr." },
          { line: 15, text: "Move curr forward to nextTemp." },
        ],
        bugTraps: ["NullPointerException if head is dereferenced without null check."],
      },
      c: {
        summary: "In-place struct pointer manipulation using 3 pointer addresses.",
        timeComplexity: "O(n) — traverses each node pointer once",
        spaceComplexity: "O(1) — zero memory allocation",
        lineBreakdown: [
          { line: 7, text: "Declare struct ListNode *prev initialized to NULL." },
          { line: 8, text: "Assign curr to input head pointer." },
          { line: 9, text: "Loop while curr is not NULL." },
          { line: 10, text: "Cache curr->next into nextTemp pointer." },
          { line: 11, text: "Reverse curr->next pointer to prev address." },
          { line: 12, text: "Advance prev to current node." },
          { line: 13, text: "Advance curr to nextTemp." },
        ],
        bugTraps: [
          "Dereferencing a NULL pointer leads to Segmentation Fault (SIGSEGV).",
          "Forgetting to return prev (new head) instead of head.",
        ],
      },
    },
  },
];

// ==========================================
// 4. GOVERNMENT EXAMS TRACK
// ==========================================
export type GovExamId = "upsc" | "tnpsc" | "ssc" | "banking" | "railway";

export type GovExam = {
  id: GovExamId;
  name: string;
  fullName: string;
  description: string;
  badge: string;
  subjects: string[];
  nextExamDate: string;
  totalPYQs: number;
  studyPlanDays: number;
  studyPlanHighlights: string[];
};

export const govExams: GovExam[] = [
  {
    id: "upsc",
    name: "UPSC CSE",
    fullName: "Union Public Service Commission – Civil Services Exam",
    description: "IAS, IPS, IFS premier national civil service examination.",
    badge: "All India Rank",
    subjects: [
      "Indian Polity",
      "Modern History",
      "Economy",
      "Current Affairs",
      "Environment & CSAT",
    ],
    nextExamDate: "May 2025",
    totalPYQs: 450,
    studyPlanDays: 90,
    studyPlanHighlights: [
      "Daily Editorial & Current Affairs synthesis (PIB, Hindu)",
      "Polity (Laxmikanth) Chapter-wise MCQs",
      "Economic Survey & Budget key metrics",
      "CSAT: Reading Comprehension & Data Interpretation",
    ],
  },
  {
    id: "tnpsc",
    name: "TNPSC",
    fullName: "Tamil Nadu Public Service Commission (Group 1 & 2)",
    description: "State civil services for Deputy Collector, DSP and Sub-Registrar.",
    badge: "State Cadre",
    subjects: [
      "Tamil Society & Thirukkural",
      "History of Tamil Nadu",
      "Indian Polity",
      "Aptitude & Mental Ability",
      "Current Affairs",
    ],
    nextExamDate: "July 2025",
    totalPYQs: 380,
    studyPlanDays: 60,
    studyPlanHighlights: [
      "Thirukkural with socioeconomic context (Unit 8)",
      "Tamil Nadu administration & social justice movements (Unit 9)",
      "Mental Ability: Ratio, Percentages & Puzzles",
      "State-specific government schemes & budget updates",
    ],
  },
  {
    id: "ssc",
    name: "SSC CGL / CHSL",
    fullName: "Staff Selection Commission – Combined Graduate Level",
    description: "Central government ministries, Income Tax, CBI and Customs Inspectors.",
    badge: "Central Staff",
    subjects: [
      "General Intelligence & Reasoning",
      "Quantitative Aptitude",
      "English Comprehension",
      "General Awareness",
    ],
    nextExamDate: "Sept 2025",
    totalPYQs: 520,
    studyPlanDays: 60,
    studyPlanHighlights: [
      "Arithmetic & Advanced Maths (Trigonometry, Geometry)",
      "High-frequency English idioms & vocabulary drills",
      "Reasoning speed tests (50 Qs in 30 mins)",
      "General Science (Physics, Chemistry, Biology basics)",
    ],
  },
  {
    id: "banking",
    name: "Banking (IBPS & SBI)",
    fullName: "IBPS PO / Clerk & SBI Probationary Officer",
    description: "Public sector commercial banks probationary officer & clerical cadres.",
    badge: "Banking Cadre",
    subjects: [
      "Quantitative Aptitude & DI",
      "Reasoning & Seating Arrangement",
      "English Language",
      "Banking & Financial Awareness",
    ],
    nextExamDate: "Oct 2025",
    totalPYQs: 410,
    studyPlanDays: 45,
    studyPlanHighlights: [
      "High-speed Data Interpretation (Pie, Bar, Caselet)",
      "Complex circular & floor puzzle strategies",
      "RBI Circulars, Monetary Policy & Banking terms",
      "Error spotting & cloze test daily drills",
    ],
  },
  {
    id: "railway",
    name: "Railway (RRB NTPC)",
    fullName: "Railway Recruitment Board – Non-Technical Popular Categories",
    description: "Station Master, Goods Guard, Traffic Assistant across Indian Railways.",
    badge: "Indian Railways",
    subjects: ["Mathematics", "General Intelligence & Reasoning", "General Awareness & Science"],
    nextExamDate: "Dec 2025",
    totalPYQs: 340,
    studyPlanDays: 45,
    studyPlanHighlights: [
      "Physics & Biology NCERT fundamental concepts",
      "Arithmetic shortcuts: Time-Speed-Distance & Trains",
      "Indian Railway history, zones & achievements",
      "Static GK: National parks, dance forms & monuments",
    ],
  },
];

export type GovQuestion = {
  id: string;
  examId: GovExamId;
  subject: string;
  topic: string;
  q: string;
  options: [string, string, string, string];
  answer: number;
  explain: string;
  isPYQ: boolean;
  pyqSource?: string; // e.g. "UPSC Prelims 2023 - GS Paper 1"
  sourceRef?: string; // e.g. "PIB Release / The Hindu"
  sourceDate?: string; // e.g. "Oct 14, 2024"
};

export const govQuestionBank: GovQuestion[] = [
  // --- UPSC Questions ---
  {
    id: "upsc-1",
    examId: "upsc",
    subject: "Indian Polity",
    topic: "Fundamental Rights",
    q: "Which one of the following statements is correct regarding the 'Right to Privacy' under the Constitution of India?",
    options: [
      "It is part of Article 19 (Freedom of Speech).",
      "It is protected as an intrinsic part of the Right to Life and Personal Liberty under Article 21.",
      "It is explicitly enumerated under Article 14 as Right to Equality.",
      "It is only a statutory right created by the IT Act 2000.",
    ],
    answer: 1,
    explain:
      "In the landmark Justice K.S. Puttaswamy (Retd.) v. Union of India (2017) judgment, a nine-judge bench unanimously held that Right to Privacy is protected as an intrinsic part of the Right to Life and Personal Liberty under Article 21.",
    isPYQ: true,
    pyqSource: "UPSC CSE Prelims 2021 (GS Paper 1)",
  },
  {
    id: "upsc-2",
    examId: "upsc",
    subject: "Current Affairs",
    topic: "Economy & Energy",
    q: "In the context of India's 'National Green Hydrogen Mission', which target has been set for green hydrogen production capacity by 2030?",
    options: [
      "At least 5 MMT (Million Metric Tonnes) per annum",
      "At least 15 MMT per annum",
      "At least 2 MMT per annum",
      "At least 10 MMT per annum",
    ],
    answer: 0,
    explain:
      "The National Green Hydrogen Mission approved by the Union Cabinet targets building at least 5 Million Metric Tonnes (MMT) of green hydrogen production capacity per annum by 2030, with an associated renewable energy capacity addition of about 125 GW.",
    isPYQ: false,
    sourceRef: "PIB Release - Ministry of New and Renewable Energy",
    sourceDate: "October 2024",
  },
  {
    id: "upsc-3",
    examId: "upsc",
    subject: "Modern History",
    topic: "Freedom Struggle",
    q: "With reference to the Indian freedom struggle, who among the following was the founder of the 'Ghadar Party' established in San Francisco in 1913?",
    options: ["Lala Har Dayal", "Bhagat Singh", "Shyamji Krishna Varma", "V.D. Savarkar"],
    answer: 0,
    explain:
      "The Ghadar Party was an international political movement founded in 1913 by expatriate Indians, notably Lala Har Dayal, Sohan Singh Bhakna, and Tarak Nath Das, with its headquarters at the Yugantar Ashram in San Francisco.",
    isPYQ: true,
    pyqSource: "UPSC CSE Prelims 2014 (GS Paper 1)",
  },

  // --- TNPSC Questions ---
  {
    id: "tnpsc-1",
    examId: "tnpsc",
    subject: "Tamil Society & Thirukkural",
    topic: "Thirukkural Values",
    q: "According to Thiruvalluvar in Thirukkural, what is regarded as the truest and highest jewel / ornament (அணி) for any human being?",
    options: [
      "Gold and precious gems",
      "Humility (பணிவு) and pleasant speech (இனியவை கூறல்)",
      "Vast material wealth",
      "High political authority",
    ],
    answer: 1,
    explain:
      "Kural 95 states: 'பணிவுடையன் இன்சொலன் ஆதல் ஒருவற்கு அணியல்ல மற்றுப் பிற' (Humility and kind speech alone are a person's true ornaments; all other jewels are superfluous).",
    isPYQ: true,
    pyqSource: "TNPSC Group 1 Prelims 2022 (Unit 8)",
  },
  {
    id: "tnpsc-2",
    examId: "tnpsc",
    subject: "Current Affairs",
    topic: "TN Governance & Welfare",
    q: "Under the Tamil Nadu government's 'Kalaignar Magalir Urimai Thittam' launched across the state, what is the monthly financial assistance provided to eligible women heads of families?",
    options: ["₹500 per month", "₹1,000 per month", "₹1,500 per month", "₹2,000 per month"],
    answer: 1,
    explain:
      "The Kalaignar Magalir Urimai Thittam scheme provides ₹1,000 per month as basic rights grant directly into the bank accounts of over 1.15 crore eligible women heads of households in Tamil Nadu.",
    isPYQ: false,
    sourceRef: "Tamil Nadu Information & Public Relations Department",
    sourceDate: "September 2024",
  },
  {
    id: "tnpsc-3",
    examId: "tnpsc",
    subject: "History of Tamil Nadu",
    topic: "Dravidian Movement",
    q: "Who was the editor of the revolutionary Tamil weekly newspaper 'Kudi Arasu' launched in 1925 to advocate social reform and self-respect?",
    options: [
      "Periyar E.V. Ramasamy",
      "C.N. Annadurai",
      "Subramania Bharati",
      "C. Rajagopalachari",
    ],
    answer: 0,
    explain:
      "Kudi Arasu was a Tamil weekly published by Periyar E.V. Ramasamy starting from May 2, 1925. It served as the primary organ for disseminating the principles of the Self-Respect Movement.",
    isPYQ: true,
    pyqSource: "TNPSC Group 2 Prelims 2022 (Unit 9)",
  },

  // --- SSC CGL Questions ---
  {
    id: "ssc-1",
    examId: "ssc",
    subject: "General Intelligence & Reasoning",
    topic: "Analogy & Logic",
    q: "Select the option related to the third term in the same way as the second is related to the first: \nSeismograph : Earthquake :: Hygrometer : ?",
    options: ["Atmospheric Pressure", "Humidity", "Liquid Density", "Electric Current"],
    answer: 1,
    explain:
      "A seismograph is used to measure earthquakes; a hygrometer is the scientific instrument used to measure the humidity (moisture content) in the air.",
    isPYQ: true,
    pyqSource: "SSC CGL Tier 1 2023",
  },
  {
    id: "ssc-2",
    examId: "ssc",
    subject: "Current Affairs",
    topic: "Sports & Honours",
    q: "At the Paris 2024 Paralympic Games, who became the first Indian woman to win two consecutive Paralympic gold medals in shooting?",
    options: ["Avani Lekhara", "Mona Agarwal", "Bhavina Patel", "Deepa Malik"],
    answer: 0,
    explain:
      "Avani Lekhara scripted history by winning gold in the women's 10m air rifle standing SH1 event at the Paris 2024 Paralympics, successfully defending her title won at Tokyo 2020.",
    isPYQ: false,
    sourceRef: "Sports Authority of India / PIB",
    sourceDate: "September 2024",
  },
  {
    id: "ssc-3",
    examId: "ssc",
    subject: "Quantitative Aptitude",
    topic: "Trigonometry",
    q: "If tan θ = 4/3, what is the value of (sin θ + cos θ) / (sin θ - cos θ)?",
    options: ["7", "5", "1/7", "-7"],
    answer: 0,
    explain:
      "Divide numerator and denominator by cos θ: (tan θ + 1) / (tan θ - 1) = (4/3 + 1) / (4/3 - 1) = (7/3) / (1/3) = 7.",
    isPYQ: true,
    pyqSource: "SSC CGL Tier 1 2022",
  },

  // --- Banking Questions ---
  {
    id: "bank-1",
    examId: "banking",
    subject: "Banking & Financial Awareness",
    topic: "Monetary Policy",
    q: "What is the primary role of the 'Marginal Standing Facility' (MSF) rate administered by the Reserve Bank of India (RBI)?",
    options: [
      "To provide short-term overnight loans to scheduled commercial banks against approved government securities above SLR quota.",
      "To lend long-term infrastructure funds to state governments.",
      "To set the interest rate charged on international currency swaps.",
      "To determine deposit rates for corporate fixed deposits.",
    ],
    answer: 0,
    explain:
      "MSF is a window for scheduled commercial banks to borrow overnight funds from the RBI against approved government securities beyond their statutory liquidity ratio (SLR) portfolio to manage acute liquidity shocks.",
    isPYQ: true,
    pyqSource: "IBPS PO Mains 2023",
  },
  {
    id: "bank-2",
    examId: "banking",
    subject: "Current Affairs",
    topic: "Financial Regulatory",
    q: "Which regulatory body launched the 'Unified Lending Interface' (ULI) in 2024 to enable frictionless credit evaluation for micro and rural borrowers across India?",
    options: ["Reserve Bank of India (RBI)", "SEBI", "NABARD", "IRDAI"],
    answer: 0,
    explain:
      "RBI Governor Shaktikanta Das announced the nationwide rollout of the Unified Lending Interface (ULI), designed like UPI to facilitate frictionless flow of consent-based credit by integrating diverse data sources.",
    isPYQ: false,
    sourceRef: "Reserve Bank of India Press Release & Economic Times",
    sourceDate: "August 2024",
  },

  // --- Railway Questions ---
  {
    id: "rail-1",
    examId: "railway",
    subject: "General Science",
    topic: "Physics",
    q: "A passenger in a moving train tosses a coin upward. The coin falls behind him. This indicates that the motion of the train is:",
    options: ["Accelerated", "Decelerated (Retarded)", "Uniform speed", "Along a circular curve"],
    answer: 0,
    explain:
      "Because the train is accelerating, during the time the coin is in the air, the train's forward speed increases compared to the coin's initial horizontal velocity, causing the coin to land behind the passenger.",
    isPYQ: true,
    pyqSource: "RRB NTPC Stage 1 2021",
  },
  {
    id: "rail-2",
    examId: "railway",
    subject: "Current Affairs",
    topic: "Railway Modernisation",
    q: "What is the indigenous Automatic Train Protection (ATP) system developed by Indian Railways to prevent train collisions known as?",
    options: ["Kavach", "Raksha", "Suraksha", "Drishti"],
    answer: 0,
    explain:
      "Kavach is an indigenously developed Automatic Train Protection (ATP) system by the Research Designs and Standards Organisation (RDSO) in collaboration with Indian industry, providing safety integrity level 4 (SIL-4).",
    isPYQ: false,
    sourceRef: "Ministry of Railways Press Information Bureau",
    sourceDate: "October 2024",
  },
];

export type GovQuizResult = {
  examId: GovExamId;
  examTitle: string;
  takenAt: string;
  score: number;
  total: number;
  topicAccuracies: Record<string, { correct: number; total: number }>;
};

const GOV_RESULTS_KEY = "cp_gov_results";

export function getGovResults(): GovQuizResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GOV_RESULTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveGovResult(r: GovQuizResult) {
  if (typeof window === "undefined") return;
  try {
    const list = [r, ...getGovResults()];
    localStorage.setItem(GOV_RESULTS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

// ==========================================
// 5. WEEKLY AI INTERVIEW MENTOR & COMMUNICATION
// ==========================================
export * from "./interview-engine";
import {
  getInterviewSessions as fetchInterviewSessions,
  getInterviewProgressSummary as fetchInterviewProgress,
  getSessionScoreTen as fetchSessionScoreTen,
} from "./interview-engine";

// ==========================================
// 6. TASKS, STREAK & INTEGRATED READINESS
// ==========================================
// Re-export GATE data layer
export * from "./gate-data";

// Re-export Notification Centre service & persistence
export * from "./notifications";

// Re-export Assessments & Placement Prep service (excluding DifficultyLevel which is already exported from ./code-decoder-data)
export {
  type Question,
  type AssessmentResult,
  type AssessmentCategory,
  type SkillTier,
  type AssessmentQuestion,
  type QuestionAttemptDetail,
  type AssessmentAttemptRecord,
  type TopicPerformanceStat,
  type CategoryPerformanceStat,
  type GeneratedDailyTask,
  type PerformanceAnalytics,
  quantMock4,
  scoreAssessment,
  ASSESSMENT_CATEGORIES,
  assessmentQuestionBank,
  difficultyToSkillTier,
  skillTierToDifficulty,
  getQuestionsByCategory,
  getResults,
  saveResult,
  saveAssessmentAttempt,
  getAssessmentHistory,
  clearAssessmentHistory,
  pickAdaptiveDifficulty,
  buildAttemptRecord,
  buildRecommendedPracticeSet,
  generateDailyPracticeTasks,
  getPerformanceAnalytics,
} from "./assessments";

// Re-export Smart Placement Tracker & Readiness Dashboard service
export * from "./placement-engine";

import { getGateResults as fetchGateResults } from "./gate-data";
import { getPerformanceAnalytics as fetchAssessmentAnalytics } from "./assessments";

export type Task = {
  id: string;
  title: string;
  module: string;
  minutes: number;
  track: "placement" | "government" | "gate" | "core";
};

export const dailyTasks: Task[] = [
  {
    id: "t1",
    title: "Code Decoder: Solve 2 array problems in Python",
    module: "code-decoder",
    minutes: 30,
    track: "placement",
  },
  {
    id: "t2",
    title: "Aptitude: Quantitative Mock 4 practice",
    module: "assessment",
    minutes: 25,
    track: "placement",
  },
  {
    id: "t3",
    title: "AI Interview Mentor: Complete an adaptive mock interview round",
    module: "interview-mentor",
    minutes: 15,
    track: "core",
  },
  {
    id: "t4",
    title: "Govt Track: Practice 15 UPSC/SSC PYQs",
    module: "government-exams",
    minutes: 20,
    track: "government",
  },
  {
    id: "t5",
    title: "Communication: Record 60s elevator pitch",
    module: "communication",
    minutes: 10,
    track: "placement",
  },
  {
    id: "t6",
    title: "GATE CSE: Practice Cache & Pipelining NATs",
    module: "gate-prep",
    minutes: 25,
    track: "gate",
  },
];

export const streak = {
  current: 14,
  best: 21,
  week: [true, true, true, true, true, true, true], // Mon–Sun
};

export const skills = [
  { name: "Aptitude", score: 76 },
  { name: "Coding (Py/Java/C)", score: 70 },
  { name: "AI Interview & Speech", score: 68 },
  { name: "Core CS", score: 74 },
  { name: "Govt GK & Current Affairs", score: 65 },
  { name: "GATE CSE Technical", score: 71 },
  { name: "ATS Resume", score: 85 },
];

export const overallReadiness = 73;

// Real integrated calculation
export function getIntegratedMetrics() {
  const pathway = getPathway();
  const selectedPathways = getSelectedPathways();
  const interviews = fetchInterviewSessions();
  const interviewProgress = fetchInterviewProgress(interviews);
  const govResults = getGovResults();
  const gateResults = fetchGateResults();
  const assessmentStats = fetchAssessmentAnalytics();

  // Latest interview score from actual sessions (0 when none completed)
  const latestInterview = interviews[0];
  const interviewAvg = interviews.length
    ? Math.round(
        interviews.reduce((acc, i) => acc + Math.round(fetchSessionScoreTen(i) * 10), 0) /
          interviews.length,
      )
    : 0;

  // Assessment accuracy / score average from real attempts (0 when none taken, no fake fixed score in metrics)
  const assessmentAvg =
    assessmentStats.totalQuestionsAttempted > 0 ? assessmentStats.overallAccuracy : 0;

  // Gov quiz average
  const govAvg = govResults.length
    ? Math.round(
        govResults.reduce((acc, r) => acc + (r.score / Math.max(r.total, 1)) * 100, 0) /
          govResults.length,
      )
    : 65;

  // GATE quiz average
  const gateAvg = gateResults.length
    ? Math.round(
        gateResults.reduce((acc, r) => acc + (r.score / Math.max(r.maxScore, 1)) * 100, 0) /
          gateResults.length,
      )
    : 70;

  // Weak areas calculation from actual assessment, interview, gov quiz & GATE history
  const weakAreas: {
    topic: string;
    score: number;
    reason: string;
    track: "placement" | "government" | "gate";
  }[] = [];

  for (const w of assessmentStats.weaknesses.slice(0, 4)) {
    weakAreas.push({
      topic: w.topic,
      score: w.accuracy,
      reason: `${w.correct}/${w.attempted} correct across recent placement assessments.`,
      track: "placement",
    });
  }

  for (const struggle of interviewProgress.repeatedStruggles.slice(0, 2)) {
    weakAreas.push({
      topic: `Interview: ${struggle.area}`,
      score: Math.round(struggle.avgScoreTen * 10),
      reason: `Flagged across ${struggle.occurrences} mock interview${struggle.occurrences > 1 ? "s" : ""} (avg ${struggle.avgScoreTen}/10).`,
      track: "placement",
    });
  }

  if ((latestInterview?.evaluation?.speakingPaceWpm ?? 0) > 160) {
    weakAreas.push({
      topic: "Speaking Pace & Enunciation",
      score: 62,
      reason: `Current pace is ${latestInterview!.evaluation.speakingPaceWpm} WPM (too fast). Needs pause control.`,
      track: "placement",
    });
  }
  if ((latestInterview?.evaluation?.fillerWordCount ?? 0) > 2) {
    weakAreas.push({
      topic: "Filler Word Elimination",
      score: 58,
      reason: `Detected ${latestInterview!.evaluation.fillerWordCount} fillers in recent mock interview.`,
      track: "placement",
    });
  }

  // Topic accuracies from Gov exams
  if (govResults.length) {
    for (const res of govResults) {
      for (const [topic, stats] of Object.entries(res?.topicAccuracies || {})) {
        const pct = Math.round((stats.correct / Math.max(stats.total, 1)) * 100);
        if (pct < 60) {
          weakAreas.push({
            topic,
            score: pct,
            reason: `${stats.correct}/${stats.total} correct in recent test.`,
            track: "government",
          });
        }
      }
    }
  }

  // Topic accuracies from GATE exams
  if (gateResults.length) {
    for (const res of gateResults) {
      if (res.topicAccuracies) {
        for (const [topic, stats] of Object.entries(res.topicAccuracies)) {
          const pct = Math.round((stats.correct / Math.max(stats.total, 1)) * 100);
          if (pct < 60) {
            weakAreas.push({
              topic: `${topic} (GATE)`,
              score: pct,
              reason: `${stats.correct}/${stats.total} correct in recent GATE quiz.`,
              track: "gate",
            });
          }
        }
      }
    }
  }

  if (!weakAreas.length) {
    weakAreas.push(
      {
        topic: "Time & Work (Quantitative)",
        score: 60,
        reason: "Practice needed on pipe & cistern variations.",
        track: "placement",
      },
      {
        topic: "Current Affairs Sources (Govt Track)",
        score: 55,
        reason: "Revise October 2024 economic & green hydrogen policies.",
        track: "government",
      },
      {
        topic: "Instruction Pipelining Hazards (GATE)",
        score: 58,
        reason: "Review data hazard stalls and forwarding in COA.",
        track: "gate",
      },
    );
  }

  // Filter tasks and modules by selected pathways
  const filteredModules = modules.filter(
    (m) => m.track === "core" || selectedPathways.includes(m.track as PathwayType),
  );
  const filteredTasks = dailyTasks.filter(
    (t) => t.track === "core" || selectedPathways.includes(t.track as PathwayType),
  );

  // Calculate integrated readiness
  const readinessComponents: number[] = [];
  if (selectedPathways.includes("placement")) {
    if (assessmentStats.totalQuestionsAttempted > 0) {
      readinessComponents.push(assessmentAvg);
    }
    if (interviews.length > 0) {
      readinessComponents.push(interviewAvg);
    }
  }
  if (selectedPathways.includes("government")) {
    readinessComponents.push(govAvg);
  }
  if (selectedPathways.includes("gate")) {
    readinessComponents.push(gateAvg);
  }
  const readiness = readinessComponents.length
    ? Math.round(readinessComponents.reduce((a, b) => a + b, 0) / readinessComponents.length)
    : 0;

  return {
    pathway,
    selectedPathways,
    interviewAvg,
    interviewProgress,
    assessmentAvg,
    assessmentStats,
    govAvg,
    gateAvg,
    latestInterview,
    weakAreas,
    filteredModules,
    filteredTasks,
    readiness,
  };
}
