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
    else if (cleaned.length === 1) localStorage.setItem(PATHWAY_KEY, cleaned[0]);
    else if (
      cleaned.includes("placement") &&
      cleaned.includes("government") &&
      !cleaned.includes("gate")
    ) {
      localStorage.setItem(PATHWAY_KEY, "both");
    } else {
      localStorage.setItem(PATHWAY_KEY, cleaned[0]);
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
    if (multi.length === 1) return multi[0];
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
export type InterviewRole =
  | "Software Development Engineer (SDE-1)"
  | "Data Analyst & Business Intelligence"
  | "Frontend / Fullstack Developer"
  | "Banking Probationary Officer (PO)"
  | "Civil Services (UPSC / TNPSC Candidate)";

export type InterviewQuestion = {
  id: string;
  role: InterviewRole;
  category: "Technical" | "HR & Behavioral" | "Situational" | "Current Affairs / Problem Solving";
  question: string;
  keyPointsExpected: string[];
  idealModelAnswer: string;
};

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "sde-1",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    question:
      "Can you explain how you would design a scalable URL shortener like TinyURL, and how you would handle hash collisions and high read traffic?",
    keyPointsExpected: [
      "Base62 encoding of an auto-incrementing ID or MD5/SHA256 truncation",
      "Handling collisions with counter or pre-generated unique keys",
      "Caching hot URLs with Redis (LRU eviction)",
      "Database read replicas and sharding by hash prefix",
    ],
    idealModelAnswer:
      "I would design the URL shortener using a layered microservice architecture. For generating short keys, I'd use Base62 encoding (a-z, A-Z, 0-9) over a 64-bit unique ID generator like Twitter Snowflake to prevent collisions without expensive retries. For high read traffic (typically 100:1 read to write ratio), I would front the database with a Redis cache cluster using an LRU eviction policy to keep top 20% viral URLs in memory. For persistence, a distributed NoSQL store like DynamoDB or sharded PostgreSQL allows horizontal scaling across hash ranges.",
  },
  {
    id: "sde-2",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    question:
      "Tell me about a time when you encountered a severe bug or production outage right before a project deadline. How did you handle it?",
    keyPointsExpected: [
      "STAR structure: Situation, Task, Action, Result",
      "Calm troubleshooting under pressure",
      "Root cause analysis and team communication",
      "Prevention of recurrence with automated testing",
    ],
    idealModelAnswer:
      "During our capstone project demo rehearsal, our payment webhook began dropping transactions due to a race condition in our database session. (Situation) As the backend lead, I had 3 hours before the faculty review to stabilize the checkout flow. (Task) I immediately set up isolated reproduction tests, pinned down the uncommitted read state, and replaced the raw query with atomic database transactions accompanied by optimistic locking. (Action) All test runs completed with zero failed checkouts, and our project received the highest evaluation grade in the cohort. Afterward, I added end-to-end integration tests to our CI/CD pipeline to catch concurrency bugs automatically. (Result)",
  },
  {
    id: "analyst-1",
    role: "Data Analyst & Business Intelligence",
    category: "Technical",
    question:
      "If a company's daily active user (DAU) metric suddenly drops by 12% overnight, walk me through how you would diagnose the root cause.",
    keyPointsExpected: [
      "Data pipeline verification (instrumentation bug vs real user drop)",
      "Segmentation by platform (iOS, Android, Web), geography, and user cohort",
      "Correlation with recent code deployments, marketing campaigns, or outages",
      "Impact on business conversion metrics and stakeholder reporting",
    ],
    idealModelAnswer:
      "First, I would verify the integrity of the data pipeline—checking whether the event ingestion service or analytics logging failed before assuming user behavior changed. Second, I would segment the DAU drop across dimensions: OS version (iOS vs Android), geography, traffic source, and user cohort (new vs returning). If the drop is concentrated on Android following an app update, it points to a client-side crash or broken login. If it spans all platforms evenly in a specific country, it suggests ISP outages or regional payment gateway failures. Once pinpointed, I provide a clear incident dashboard to engineering leads and executive stakeholders.",
  },
  {
    id: "bank-po-1",
    role: "Banking Probationary Officer (PO)",
    category: "Situational",
    question:
      "How would you handle an irate customer who enters your branch complaining about an unauthorized debit deduction from their savings account?",
    keyPointsExpected: [
      "Empathy, patience and de-escalation",
      "Immediate security action: block debit card/net banking",
      "Transaction audit and filing chargeback dispute",
      "Clear timeline and reassurance without defensive tone",
    ],
    idealModelAnswer:
      "I would first invite the customer to sit in a calm space and listen attentively without interrupting, acknowledging their distress with genuine empathy. Next, I would take immediate security measures: blocking their debit card and net banking access to stop further unauthorized debits. Then, I would review the Core Banking System transaction log to identify whether it was an ATM, POS, or UPI transaction, lodge an official grievance ticket, and initiate a chargeback protocol per RBI guidelines. Finally, I would provide them with a signed acknowledgment, reference number, and a direct contact timeline for resolution.",
  },
  {
    id: "civil-1",
    role: "Civil Services (UPSC / TNPSC Candidate)",
    category: "Current Affairs / Problem Solving",
    question:
      "As a District Collector facing public protests over land acquisition for a public infrastructure project, what administrative steps would you take?",
    keyPointsExpected: [
      "Rule of law and peaceful dialogue with community elders",
      "Transparent communication of fair compensation (LARR Act)",
      "Addressing rehabilitation and environmental concerns",
      "Balancing developmental urgency with social justice",
    ],
    idealModelAnswer:
      "As District Collector, my priority is maintaining public order while upholding justice through empathetic administration. First, I would establish a direct dialogue forum with village heads and protest representatives rather than using police force. Second, I would ensure total transparency regarding compensation packages, R&R (Rehabilitation and Resettlement) entitlements under the RFCTLARR Act 2013, and clear grievance redressal mechanisms. Third, I would examine if minor alignment adjustments can spare sacred sites or prime agricultural pockets. Development must never be adversarial; by making citizens stakeholders in the project's long-term benefits, we achieve sustainable progress.",
  },
];

export type InterviewEvaluation = {
  score: number; // 0 - 100
  speakingPaceWpm: number;
  paceVerdict: "Optimal" | "A Bit Fast" | "Too Fast" | "A Bit Slow" | "Too Slow";
  grammarScore: number; // 0 - 100
  clarityScore: number; // 0 - 100
  relevanceScore: number; // 0 - 100
  structureScore: number; // 0 - 100 (STAR method)
  starComponentsFound: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
  fillerWordCount: number;
  fillerWordsDetected: string[];
  strengths: string[];
  improvements: string[];
  recommendedDrill: string;
};

export type InterviewSession = {
  id: string;
  weekNumber: number;
  date: string;
  role: InterviewRole;
  questionId: string;
  question: string;
  answerText: string;
  isSpoken: boolean;
  durationSec: number;
  evaluation: InterviewEvaluation;
};

const INTERVIEWS_KEY = "cp_interview_history";

export function getInterviewSessions(): InterviewSession[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(INTERVIEWS_KEY);
    if (!data) {
      // Seed an initial week 1 session so student immediately has comparison context!
      const initial: InterviewSession[] = [
        {
          id: "seed-w1",
          weekNumber: 1,
          date: "1 week ago",
          role: "Software Development Engineer (SDE-1)",
          questionId: "sde-2",
          question:
            "Tell me about a time when you encountered a severe bug right before a project deadline.",
          answerText:
            "Um, we had this bug during our college project demo. Like, the database went down. I had to fix it quickly by restarting the service and changing the database credentials. In the end it worked fine and we passed.",
          isSpoken: true,
          durationSec: 42,
          evaluation: {
            score: 64,
            speakingPaceWpm: 105,
            paceVerdict: "A Bit Slow",
            grammarScore: 70,
            clarityScore: 60,
            relevanceScore: 70,
            structureScore: 55,
            starComponentsFound: {
              situation: true,
              task: false,
              action: true,
              result: true,
            },
            fillerWordCount: 4,
            fillerWordsDetected: ["um", "like", "in the end"],
            strengths: ["Honest recounting of a technical failure", "Direct problem resolution"],
            improvements: [
              "Reduce filler words ('um', 'like')",
              "Apply full STAR structure: specify your exact task and quantifiable impact",
            ],
            recommendedDrill: "STAR Structuring & Filler Word Elimination Drill",
          },
        },
      ];
      localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveInterviewSession(session: InterviewSession) {
  if (typeof window === "undefined") return;
  try {
    const list = [session, ...getInterviewSessions().filter((s) => s.id !== session.id)];
    localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

// Algorithmic evaluation engine for spoken / typed answers
export function evaluateInterviewAnswer(
  question: InterviewQuestion,
  answerText: string,
  durationSec: number,
  isSpoken: boolean,
): InterviewEvaluation {
  const words = answerText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const timeInMinutes = Math.max(durationSec, 10) / 60;
  const speakingPaceWpm = isSpoken ? Math.round(wordCount / timeInMinutes) : 135;

  let paceVerdict: InterviewEvaluation["paceVerdict"] = "Optimal";
  if (speakingPaceWpm < 95) paceVerdict = "Too Slow";
  else if (speakingPaceWpm < 120) paceVerdict = "A Bit Slow";
  else if (speakingPaceWpm > 175) paceVerdict = "Too Fast";
  else if (speakingPaceWpm > 155) paceVerdict = "A Bit Fast";

  // Filler words detection
  const lower = answerText.toLowerCase();
  const fillers = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"];
  const detectedFillers: string[] = [];
  let fillerCount = 0;
  for (const f of fillers) {
    const regex = new RegExp(`\\b${f}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      detectedFillers.push(f);
      fillerCount += matches.length;
    }
  }

  // STAR methodology check
  const situationKeywords = [
    "situation",
    "when",
    "during",
    "while",
    "project",
    "client",
    "problem",
    "faced",
  ];
  const taskKeywords = ["task", "responsible", "needed to", "goal", "had to", "role", "objective"];
  const actionKeywords = [
    "action",
    "implemented",
    "created",
    "designed",
    "optimized",
    "solved",
    "coded",
    "stepped in",
    "researched",
  ];
  const resultKeywords = [
    "result",
    "outcome",
    "improved",
    "reduced",
    "increased",
    "achieved",
    "delivered",
    "grade",
    "feedback",
  ];

  const hasSituation = situationKeywords.some((k) => lower.includes(k));
  const hasTask = taskKeywords.some((k) => lower.includes(k));
  const hasAction = actionKeywords.some((k) => lower.includes(k));
  const hasResult = resultKeywords.some((k) => lower.includes(k));

  let structureScore = 50;
  if (hasSituation) structureScore += 12;
  if (hasTask) structureScore += 12;
  if (hasAction) structureScore += 14;
  if (hasResult) structureScore += 12;

  // Relevance check against expected key points
  let matchedPoints = 0;
  for (const point of question.keyPointsExpected) {
    const keyTerms = point
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (keyTerms.some((term) => lower.includes(term))) {
      matchedPoints++;
    }
  }
  const relevanceScore = Math.min(
    100,
    Math.round(40 + (matchedPoints / Math.max(question.keyPointsExpected.length, 1)) * 55),
  );

  // Clarity & Grammar scores
  const clarityPenalty = Math.min(30, fillerCount * 5);
  const lengthBonus = wordCount > 50 ? (wordCount > 90 ? 10 : 5) : -15;
  const clarityScore = Math.max(45, Math.min(95, 85 - clarityPenalty + lengthBonus));
  const grammarScore = Math.max(50, Math.min(96, 88 - (wordCount < 30 ? 15 : 0)));

  const overallScore = Math.round(
    clarityScore * 0.25 + grammarScore * 0.2 + relevanceScore * 0.3 + structureScore * 0.25,
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 60) strengths.push("Comprehensive, well-developed response volume.");
  if (matchedPoints >= 2)
    strengths.push("Strong alignment with core technical & operational concepts.");
  if (paceVerdict === "Optimal")
    strengths.push("Pacing is natural, articulate and engaging (120-150 WPM).");
  if (hasAction && hasResult)
    strengths.push("Clear demonstration of personal ownership and tangible impact.");

  if (fillerCount > 2) {
    improvements.push(
      `Reduce filler phrasing (detected: ${detectedFillers.join(", ")}). Practice deliberate silence instead of fillers.`,
    );
  }
  if (!hasTask || !hasResult) {
    improvements.push(
      "Tighten the STAR structure: explicitly state what YOUR specific mandate was and the measurable outcome.",
    );
  }
  if (paceVerdict === "Too Fast" || paceVerdict === "A Bit Fast") {
    improvements.push(
      "Speaking pace is fast. Take steady pauses after key sentences to let interviewers absorb complex technical ideas.",
    );
  } else if (paceVerdict === "Too Slow" || paceVerdict === "A Bit Slow") {
    improvements.push(
      "Speaking pace is hesitant. Practice speaking with confidence using bulleted mental outlines.",
    );
  }
  if (matchedPoints < 2) {
    improvements.push(
      `Incorporate domain terminology: ${question.keyPointsExpected.slice(0, 2).join(", ")}.`,
    );
  }

  // Personalised drill recommendation
  let recommendedDrill = "STAR Method 60-Second Answer Workout";
  if (fillerCount >= 3) {
    recommendedDrill = "Pause & Enunciation: Zero-Filler Drill";
  } else if (paceVerdict !== "Optimal") {
    recommendedDrill = "Metronome Pacing Drill (Target 130 WPM)";
  } else if (relevanceScore < 75) {
    recommendedDrill = "Key Concept Synthesis & Framing Drill";
  }

  return {
    score: overallScore,
    speakingPaceWpm,
    paceVerdict,
    grammarScore,
    clarityScore,
    relevanceScore,
    structureScore,
    starComponentsFound: {
      situation: hasSituation,
      task: hasTask,
      action: hasAction,
      result: hasResult,
    },
    fillerWordCount: fillerCount,
    fillerWordsDetected: detectedFillers,
    strengths: strengths.length
      ? strengths
      : ["Good fundamental effort and willingness to articulate thoughts."],
    improvements: improvements.length
      ? improvements
      : ["Continue refining speed and maintaining high enunciation."],
    recommendedDrill,
  };
}

// ==========================================
// 6. TASKS, STREAK & INTEGRATED READINESS
// ==========================================
// Re-export GATE data layer
export * from "./gate-data";

// Re-export Notification Centre service & persistence
export * from "./notifications";

import { getGateResults as fetchGateResults } from "./gate-data";

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
    title: "Weekly AI Interview: Complete Week 2 simulated interview",
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
  const interviews = getInterviewSessions();
  const govResults = getGovResults();
  const gateResults = fetchGateResults();

  // Latest interview score
  const latestInterview = interviews[0];
  const interviewAvg = interviews.length
    ? Math.round(interviews.reduce((acc, i) => acc + i.evaluation.score, 0) / interviews.length)
    : 68;

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

  // Weak areas calculation from actual interview, gov quiz & GATE history
  const weakAreas: {
    topic: string;
    score: number;
    reason: string;
    track: "placement" | "government" | "gate";
  }[] = [];

  if (latestInterview && latestInterview.evaluation.speakingPaceWpm > 160) {
    weakAreas.push({
      topic: "Speaking Pace & Enunciation",
      score: 62,
      reason: `Current pace is ${latestInterview.evaluation.speakingPaceWpm} WPM (too fast). Needs pause control.`,
      track: "placement",
    });
  }
  if (latestInterview && latestInterview.evaluation.fillerWordCount > 2) {
    weakAreas.push({
      topic: "Filler Word Elimination",
      score: 58,
      reason: `Detected ${latestInterview.evaluation.fillerWordCount} fillers in recent mock interview.`,
      track: "placement",
    });
  }

  // Topic accuracies from Gov exams
  if (govResults.length) {
    for (const res of govResults) {
      for (const [topic, stats] of Object.entries(res.topicAccuracies)) {
        const pct = Math.round((stats.correct / stats.total) * 100);
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
    readinessComponents.push(75, interviewAvg);
  }
  if (selectedPathways.includes("government")) {
    readinessComponents.push(govAvg);
  }
  if (selectedPathways.includes("gate")) {
    readinessComponents.push(gateAvg);
  }
  const readiness = readinessComponents.length
    ? Math.round(readinessComponents.reduce((a, b) => a + b, 0) / readinessComponents.length)
    : 73;

  return {
    pathway,
    selectedPathways,
    interviewAvg,
    govAvg,
    gateAvg,
    latestInterview,
    weakAreas,
    filteredModules,
    filteredTasks,
    readiness,
  };
}
