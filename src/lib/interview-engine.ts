export type InterviewCategory =
  | "HR Interview"
  | "Technical Interview"
  | "Full Stack Developer Interview"
  | "Core Computer Science Interview"
  | "General Placement Interview";

export type InterviewCategoryId = "hr" | "technical" | "fullstack" | "core-cs" | "general";

export type InterviewDifficulty = "Easy" | "Medium" | "Hard";

export type InterviewCompletionStatus = "In Progress" | "Completed" | "Ended Early";

export type InterviewAnswerVerdict = "Correct" | "Partially Correct" | "Needs Improvement";

// Preserved legacy union for backward compatibility across existing views
export type InterviewRole =
  | "Software Development Engineer (SDE-1)"
  | "Data Analyst & Business Intelligence"
  | "Frontend / Fullstack Developer"
  | "Banking Probationary Officer (PO)"
  | "Civil Services (UPSC / TNPSC Candidate)"
  | InterviewCategory;

export interface InterviewCategoryMeta {
  id: InterviewCategoryId;
  label: InterviewCategory;
  shortLabel: string;
  description: string;
  focusAreas: string[];
}

export const INTERVIEW_CATEGORIES: InterviewCategoryMeta[] = [
  {
    id: "hr",
    label: "HR Interview",
    shortLabel: "HR",
    description: "Behavioral, STAR storytelling, teamwork, conflict resolution, and culture fit.",
    focusAreas: ["STAR Structure", "Leadership & Ownership", "Conflict Resolution", "Career Goals"],
  },
  {
    id: "technical",
    label: "Technical Interview",
    shortLabel: "Technical",
    description: "Data structures, algorithms, system design, debugging, and API problem solving.",
    focusAreas: ["DSA & Complexity", "System Design", "Debugging", "Concurrency"],
  },
  {
    id: "fullstack",
    label: "Full Stack Developer Interview",
    shortLabel: "Full Stack",
    description:
      "React architecture, backend APIs, auth/security, SQL optimization, and deployment.",
    focusAreas: ["Frontend State & Perf", "Auth & Security", "SQL & APIs", "Real-Time & CI/CD"],
  },
  {
    id: "core-cs",
    label: "Core Computer Science Interview",
    shortLabel: "Core CS",
    description:
      "Operating systems, DBMS transactions, computer networks, and distributed systems.",
    focusAreas: ["OS & Concurrency", "DBMS & Indexing", "Computer Networks", "Distributed Systems"],
  },
  {
    id: "general",
    label: "General Placement Interview",
    shortLabel: "General Placement",
    description:
      "Campus placement mix: project deep-dives, engineering trade-offs, and problem solving.",
    focusAreas: ["Project Architecture", "Product Diagnosis", "Engineering Trade-offs", "Teamwork"],
  },
];

export interface FollowUpTrigger {
  id: string;
  triggerTerms: string[];
  followUpQuestion: string;
  followUpTopic: string;
  keyPointsExpected: string[];
  conceptKeywords: string[][];
  idealModelAnswer: string;
}

export interface InterviewQuestion {
  id: string;
  role: InterviewRole;
  category: string;
  interviewCategory?: InterviewCategory;
  topic?: string;
  difficulty?: InterviewDifficulty;
  question: string;
  keyPointsExpected: string[];
  conceptKeywords?: string[][];
  followUpTriggers?: FollowUpTrigger[];
  idealModelAnswer: string;
  isFollowUp?: boolean;
  parentQuestionId?: string;
  adaptationReason?: string;
}

export interface DimensionScores {
  technicalCorrectness: number; // 0 - 10
  communicationSkills: number; // 0 - 10
  confidence: number; // 0 - 10
  relevance: number; // 0 - 10
  answerStructure: number; // 0 - 10
}

export interface InterviewEvaluation {
  score: number; // 0 - 100
  overallScoreTen: number; // 0 - 10 (1 decimal)
  dimensions: DimensionScores;
  verdict: InterviewAnswerVerdict;
  feedbackSummary: string;
  detectedConcepts: string[];
  missedConcepts: string[];
  speakingPaceWpm: number;
  paceVerdict: "Optimal" | "A Bit Fast" | "Too Fast" | "A Bit Slow" | "Too Slow";
  grammarScore: number; // 0 - 100
  clarityScore: number; // 0 - 100
  relevanceScore: number; // 0 - 100
  structureScore: number; // 0 - 100
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
}

export interface InterviewTurnRecord {
  turnNumber: number;
  questionId: string;
  question: string;
  topic: string;
  difficulty: InterviewDifficulty;
  isFollowUp: boolean;
  adaptationReason?: string | undefined;
  answerText: string;
  isSpoken: boolean;
  durationSec: number;
  evaluation: InterviewEvaluation;
  idealModelAnswer: string;
}

export interface InterviewSession {
  id: string;
  weekNumber: number;
  date: string;
  role: InterviewRole;
  category?: InterviewCategory;
  completionStatus?: InterviewCompletionStatus;
  targetQuestionCount?: number;
  questionId: string;
  question: string;
  answerText: string;
  isSpoken: boolean;
  durationSec: number;
  evaluation: InterviewEvaluation;
  turns?: InterviewTurnRecord[];
  overallScoreTen?: number;
  questionsAnsweredCorrectly?: number;
  totalQuestionsAnswered?: number;
  strongAreas?: string[];
  weakAreas?: string[];
  areasForImprovement?: string[];
  personalizedRecommendations?: string[];
  dimensionAverages?: DimensionScores;
  updatedAt?: string;
}

export interface InterviewProgressSummary {
  totalInterviews: number;
  completedInterviews: number;
  endedEarlyInterviews: number;
  inProgressInterviews: number;
  averageScoreTen: number;
  latestScoreTen: number | null;
  improvementDeltaTen: number | null; // latest vs previous
  overallGrowthDeltaTen: number | null; // latest vs oldest
  repeatedStruggles: Array<{ area: string; occurrences: number; avgScoreTen: number }>;
  strongestCategory: string | null;
  categoryStats: Array<{
    category: InterviewCategory;
    attempts: number;
    avgScoreTen: number;
  }>;
}

export interface SmartPracticeRecommendations {
  topicsToRevise: Array<{
    topic: string;
    category: InterviewCategory;
    reason: string;
    currentScoreTen: number | null;
  }>;
  technicalQuestionsToPractice: InterviewQuestion[];
  hrQuestionsToPrepare: InterviewQuestion[];
  communicationExercises: Array<{
    title: string;
    durationMinutes: number;
    focus: string;
    instruction: string;
    targetMetric: string;
  }>;
}

// ==========================================
// COMPREHENSIVE INTERVIEW QUESTION BANK (40+ Questions across 5 Categories)
// ==========================================

export const interviewQuestionBank: InterviewQuestion[] = [
  // ---------- 1. TECHNICAL INTERVIEW ----------
  {
    id: "tech-1",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Technical Interview",
    topic: "System Design & Caching",
    difficulty: "Medium",
    question:
      "Can you explain how you would design a scalable URL shortener like TinyURL, and how you would handle hash collisions and high read traffic?",
    keyPointsExpected: [
      "Base62 encoding or unique ID generation",
      "Handling hash collisions cleanly",
      "Redis caching with LRU eviction for high reads",
      "Database read replicas and horizontal sharding",
    ],
    conceptKeywords: [
      [
        "base62",
        "encode",
        "encoding",
        "snowflake",
        "unique id",
        "hash",
        "md5",
        "sha256",
        "counter",
      ],
      ["collision", "collisions", "unique", "retry", "pre-generated", "atomic"],
      ["redis", "cache", "caching", "lru", "memory", "in-memory", "ttl"],
      [
        "replica",
        "replicas",
        "shard",
        "sharding",
        "partition",
        "nosql",
        "dynamodb",
        "postgres",
        "read",
      ],
    ],
    followUpTriggers: [
      {
        id: "tech-1-fu-cache",
        triggerTerms: ["redis", "cache", "lru", "caching"],
        followUpQuestion:
          "Follow-up on your caching design: If a viral link causes sudden traffic spikes or expires in Redis, how would you prevent cache stampede and keep database load stable?",
        followUpTopic: "Cache Invalidation & Stampede Prevention",
        keyPointsExpected: [
          "Request coalescing / singleflight or distributed mutex lock",
          "Probabilistic early expiration or staggered TTL",
          "Fallback / stale-while-revalidate serving",
        ],
        conceptKeywords: [
          ["lock", "mutex", "singleflight", "coalesc", "queue", "semaphore"],
          ["ttl", "jitter", "stagger", "early", "expir", "refresh"],
          ["stale", "fallback", "replica", "rate limit", "circuit"],
        ],
        idealModelAnswer:
          "To prevent cache stampede when a hot key expires, I would combine a distributed mutex or singleflight request coalescing so only one worker recomputes the value from PostgreSQL while concurrent readers wait briefly or receive a slightly stale cached value. I would also add jitter to TTL values and proactively warm trending URLs before expiration.",
      },
      {
        id: "tech-1-fu-shard",
        triggerTerms: ["shard", "sharding", "replica", "partition"],
        followUpQuestion:
          "Follow-up on your database scaling: How would you choose a shard key for the URL mappings table, and how would you rebalance shards if traffic grows unevenly?",
        followUpTopic: "Database Sharding & Consistent Hashing",
        keyPointsExpected: [
          "Short-code / hash key for uniform distribution",
          "Consistent hashing to minimize data movement",
          "Avoiding hotspot keys with range vs hash partitioning",
        ],
        conceptKeywords: [
          ["short", "key", "hash", "uniform", "distribution"],
          ["consistent hash", "virtual node", "ring", "rebalanc", "migration"],
          ["hotspot", "skew", "partition", "range"],
        ],
        idealModelAnswer:
          "I would partition by a hash of the short key using consistent hashing with virtual nodes so reads route directly to a single shard in O(1) without cross-shard joins, and scaling out only moves ~1/N of keys.",
      },
    ],
    idealModelAnswer:
      "I would design the URL shortener using Base62 encoding over a distributed 64-bit unique ID generator like Snowflake to avoid hash collisions. Since traffic is heavily read-skewed, I would place a Redis cluster with LRU eviction in front of the database for hot URLs. For storage, I would use read replicas and horizontal sharding partitioned by the short key hash.",
  },
  {
    id: "tech-2",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Technical Interview",
    topic: "Data Structures & Hashing",
    difficulty: "Easy",
    question:
      "When would you choose a Hash Table over a Balanced Binary Search Tree (such as an AVL or Red-Black Tree), and what trade-offs are involved?",
    keyPointsExpected: [
      "O(1) average lookup/insert vs O(log n) worst-case guarantee",
      "Ordering & range queries supported by balanced BSTs",
      "Collision handling and resizing overhead in hash tables",
      "Memory overhead and cache locality considerations",
    ],
    conceptKeywords: [
      ["o(1)", "constant", "o(log n)", "logarithmic", "worst"],
      ["order", "sorted", "range", "min", "max", "traversal", "successor"],
      ["collision", "chaining", "probing", "resize", "rehash", "load factor"],
      ["memory", "overhead", "cache", "pointer", "bucket"],
    ],
    followUpTriggers: [
      {
        id: "tech-2-fu-collision",
        triggerTerms: ["collision", "chaining", "probing", "hash"],
        followUpQuestion:
          "Follow-up on hash collisions: Compare separate chaining with open addressing in terms of cache performance and worst-case degradation.",
        followUpTopic: "Hash Collision Resolution Trade-offs",
        keyPointsExpected: [
          "Open addressing offers better CPU cache locality via contiguous arrays",
          "Separate chaining tolerates higher load factors cleanly",
          "Clustering in linear probing vs linked-list / treeified buckets",
        ],
        conceptKeywords: [
          ["cache", "contiguous", "locality", "array"],
          ["load factor", "chaining", "linked list", "bucket"],
          ["cluster", "probe", "probing", "worst", "o(n)"],
        ],
        idealModelAnswer:
          "Open addressing stores entries contiguously in an array for superior CPU cache locality, though performance degrades sharply past a 0.7 load factor due to clustering. Separate chaining uses bucket pointers—more memory allocations, but resilient at higher load factors and Java HashMap even converts long chains into balanced trees for O(log n) worst-case lookup.",
      },
    ],
    idealModelAnswer:
      "I choose a hash table for O(1) average-case point lookups, insertions, and deletions when key ordering does not matter. I prefer a balanced BST when I need sorted traversal, range queries, predecessor/successor lookups, or strict O(log n) worst-case latency without resizing spikes or hash-collision degradation.",
  },
  {
    id: "tech-3",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Technical Interview",
    topic: "Algorithm Optimization & Complexity",
    difficulty: "Medium",
    question:
      "Suppose you need to find the longest substring without repeating characters or detect anomalies in a sliding window of streaming events. Explain how the sliding window pattern optimizes time and space complexity.",
    keyPointsExpected: [
      "Two pointers (left and right) avoiding nested O(n^2) loops",
      "Hash map / set tracking character positions or window frequency",
      "O(n) amortized linear time complexity",
      "O(k) or O(min(n, charset)) auxiliary space complexity",
    ],
    conceptKeywords: [
      ["two pointer", "left", "right", "window", "nested", "o(n^2)", "brute"],
      ["map", "set", "index", "frequency", "track", "duplicate"],
      ["o(n)", "linear", "amortized", "once"],
      ["o(k)", "space", "charset", "memory", "o(1)"],
    ],
    idealModelAnswer:
      "Instead of checking every O(n^2) subarray, a sliding window maintains left and right pointers backed by a hash map of last-seen indices. When a duplicate enters the window, the left pointer jumps directly past the previous occurrence. Each element is visited at most twice, giving O(n) time complexity and O(min(n, charset)) space.",
  },
  {
    id: "tech-4",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Technical Interview",
    topic: "API Design & Distributed Rate Limiting",
    difficulty: "Hard",
    question:
      "How would you design a distributed API rate limiter supporting 100,000 requests per second across multiple application servers?",
    keyPointsExpected: [
      "Algorithm choice (Token Bucket or Sliding Window Counter)",
      "Centralized atomic state using Redis Lua scripts / INCR+EXPIRE",
      "HTTP 429 Too Many Requests with Retry-After headers",
      "Handling race conditions and fail-open vs fail-closed fallback",
    ],
    conceptKeywords: [
      ["token bucket", "leaky bucket", "sliding window", "fixed window"],
      ["redis", "lua", "atomic", "incr", "central", "cluster"],
      ["429", "header", "retry-after", "x-ratelimit"],
      ["race", "fail-open", "fail-closed", "latency", "local"],
    ],
    idealModelAnswer:
      "I would use a Token Bucket or Sliding Window Counter algorithm stored in a Redis cluster, executing counter updates via atomic Lua scripts to eliminate race conditions. On limit breach, the API gateway returns HTTP 429 with X-RateLimit-Remaining and Retry-After headers. If Redis temporarily degrades, I'd fail open with local in-memory rate limits so legitimate user traffic isn't blocked.",
  },
  {
    id: "tech-5",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Technical Interview",
    topic: "Sorting & Algorithmic Trade-offs",
    difficulty: "Easy",
    question:
      "Explain the difference between QuickSort and MergeSort in terms of time complexity, space usage, stability, and when you would prefer each in practice.",
    keyPointsExpected: [
      "MergeSort guarantees O(n log n) worst-case and is stable",
      "QuickSort is O(n log n) average, O(n^2) worst-case, in-place O(log n) stack",
      "MergeSort uses O(n) extra space for arrays",
      "Cache locality favors QuickSort for arrays; MergeSort excels for linked lists/external sort",
    ],
    conceptKeywords: [
      ["o(n log n)", "worst", "stable", "stability"],
      ["o(n^2)", "pivot", "in-place", "stack"],
      ["o(n)", "extra space", "memory", "auxiliary"],
      ["cache", "linked list", "external", "disk"],
    ],
    idealModelAnswer:
      "MergeSort guarantees O(n log n) time in all cases and is stable, making it ideal for linked lists, external disk sorting, and multi-key sorting, though it requires O(n) extra memory for arrays. QuickSort averages O(n log n) with superior CPU cache locality and O(log n) stack space, though poor pivot selection yields O(n^2) worst-case unless mitigated by randomized pivots or Introsort.",
  },
  {
    id: "tech-6",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Technical Interview",
    topic: "Dynamic Programming vs Recursion",
    difficulty: "Medium",
    question:
      "How do you identify when a recursive problem benefits from Dynamic Programming, and how do you decide between top-down memoization and bottom-up tabulation?",
    keyPointsExpected: [
      "Overlapping subproblems and optimal substructure",
      "Top-down memoization uses recursion + cache for reachable states only",
      "Bottom-up tabulation avoids recursion stack overflow",
      "Space optimization via rolling 1D array or variables",
    ],
    conceptKeywords: [
      ["overlapping", "subproblem", "optimal substructure", "repeat"],
      ["memo", "top-down", "cache", "recursion", "reachable"],
      ["tabulation", "bottom-up", "iterative", "stack overflow"],
      ["space", "rolling", "1d", "compress", "o(1)"],
    ],
    idealModelAnswer:
      "Dynamic Programming applies when a problem exhibits optimal substructure and overlapping subproblems. Top-down memoization mirrors the recurrence cleanly and computes only reachable states, while bottom-up tabulation eliminates recursion stack overhead and enables iterative space compression from 2D tables down to 1D rolling arrays.",
  },
  {
    id: "tech-7",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Technical Interview",
    topic: "Debugging & Production Reliability",
    difficulty: "Hard",
    question:
      "A backend service experiences a gradual memory leak and latency spikes every 6 hours under production traffic. Walk through your step-by-step investigation and resolution strategy.",
    keyPointsExpected: [
      "Metrics & observability: heap usage, GC pause times, thread/connection pools",
      "Capturing heap snapshots / flamegraphs and comparing diffs over time",
      "Common root causes: unclosed listeners, unbounded caches, dangling references",
      "Safe mitigation, regression test, and post-fix monitoring alerts",
    ],
    conceptKeywords: [
      ["metric", "gc", "garbage", "heap", "monitor", "log", "latency"],
      ["snapshot", "profil", "flamegraph", "diff", "leak"],
      ["listener", "cache", "unbounded", "closure", "connection", "pool"],
      ["alert", "test", "rollback", "graceful", "restart"],
    ],
    idealModelAnswer:
      "First, I check heap telemetry, GC pause graphs, and open file/DB connection metrics to confirm memory retention vs CPU saturation. Second, I capture two heap snapshots spaced apart under load and inspect growing object retainers—commonly unbounded in-memory maps, unremoved event listeners, or unclosed streams. After isolating and fixing the leak, I add bounded LRU limits, memory threshold alerts, and load tests to prevent regressions.",
  },
  {
    id: "tech-8",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Technical Interview",
    topic: "REST API Idempotency & Reliability",
    difficulty: "Medium",
    question:
      "Why is idempotency important in payment or order-creation APIs, and how would you implement idempotent POST endpoints?",
    keyPointsExpected: [
      "Preventing duplicate charges on network timeouts/retries",
      "Client-generated Idempotency-Key header stored server-side",
      "Atomic database check + response caching for identical keys",
      "Handling in-flight concurrent duplicate requests with locks or unique constraints",
    ],
    conceptKeywords: [
      ["duplicate", "retry", "timeout", "network", "safe"],
      ["idempotency-key", "header", "uuid", "unique key"],
      ["store", "cache", "database", "return", "replay"],
      ["lock", "concurrent", "transaction", "unique constraint", "in-flight"],
    ],
    idealModelAnswer:
      "Without idempotency, client retries after a network timeout can trigger duplicate payments. I require a client-generated UUID Idempotency-Key header on POST requests, enforce a unique constraint in the database inside a transaction, cache the serialized response once complete, and either return a 409 Conflict or wait if an identical key is currently in flight.",
  },

  // ---------- 2. HR INTERVIEW ----------
  {
    id: "hr-1",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "HR Interview",
    topic: "Self-Introduction & Career Narrative",
    difficulty: "Easy",
    question:
      "Tell me about yourself, your key technical strengths, and why you are excited about starting your engineering career in this role.",
    keyPointsExpected: [
      "Clear academic/technical background summary",
      "Highlight 1-2 flagship projects with measurable impact",
      "Relevant core strengths matched to the role",
      "Genuine motivation for company engineering culture & growth",
    ],
    conceptKeywords: [
      ["degree", "student", "engineer", "computer", "background", "graduat", "experience"],
      ["project", "built", "developed", "impact", "users", "improved", "reduced"],
      ["strength", "problem", "stack", "javascript", "python", "java", "backend", "frontend"],
      ["excited", "company", "role", "learn", "contribute", "grow", "team"],
    ],
    followUpTriggers: [
      {
        id: "hr-1-fu-proj",
        triggerTerms: ["project", "built", "developed", "app", "system"],
        followUpQuestion:
          "Follow-up on your project experience: What was the toughest technical or design decision you personally had to make in that project, and what trade-off did it involve?",
        followUpTopic: "Project Decision & Ownership",
        keyPointsExpected: [
          "Specific architectural or implementation choice",
          "Clear explanation of alternatives considered",
          "Tangible outcome or lesson learned",
        ],
        conceptKeywords: [
          ["chose", "decided", "architecture", "database", "framework", "api"],
          ["alternative", "instead", "tradeoff", "trade-off", "versus", "because"],
          ["result", "learned", "faster", "reliable", "metric", "improved"],
        ],
        idealModelAnswer:
          "In my capstone analytics dashboard, I had to choose between client-side filtering and server-side SQL pagination. Although client-side filtering was faster to prototype, payload sizes exceeded 5MB. I migrated to cursor-based pagination with PostgreSQL indexes, reducing initial load latency by 70% while keeping the UI snappy.",
      },
    ],
    idealModelAnswer:
      "I am a final-year Computer Science student specializing in full-stack systems and algorithmic problem solving. Over the past year, I built a collaborative code-review platform in React and Node.js serving 300+ peers and improved query response times by 45% through Redis caching. My strengths lie in structured debugging and clean API design, and I am eager to join your engineering team to build reliable, user-facing products at scale.",
  },
  {
    id: "hr-2",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "HR Interview",
    topic: "Conflict Resolution & Teamwork",
    difficulty: "Medium",
    question:
      "Tell me about a time you strongly disagreed with a teammate during a project. How did you handle the disagreement and reach a resolution?",
    keyPointsExpected: [
      "Situation and specific point of technical/project disagreement",
      "Active listening and objective data-driven comparison",
      "Respectful compromise or consensus without ego",
      "Positive measurable outcome and preserved team relationship",
    ],
    conceptKeywords: [
      ["situation", "team", "project", "disagreed", "teammate", "conflict"],
      ["listen", "perspective", "benchmark", "data", "prototype", "criteria"],
      ["compromise", "agreed", "consensus", "solution", "calm", "respect"],
      ["result", "delivered", "outcome", "relationship", "ahead", "success"],
    ],
    followUpTriggers: [
      {
        id: "hr-2-fu-outcome",
        triggerTerms: ["teammate", "team", "project", "disagreed", "conflict"],
        followUpQuestion:
          "Follow-up on that collaboration: Looking back, what measurable outcome did your compromise achieve, and how did it change how your team communicated afterward?",
        followUpTopic: "Retrospective Impact & Team Norms",
        keyPointsExpected: [
          "Quantifiable or clear delivery outcome",
          "Process improvement adopted by the team",
          "Emotional maturity and accountability",
        ],
        conceptKeywords: [
          ["delivered", "deadline", "grade", "faster", "zero", "users", "%"],
          ["process", "checklist", "review", "meeting", "document", "rfc"],
          ["learned", "communication", "trust", "respect"],
        ],
        idealModelAnswer:
          "Our compromise allowed us to ship the core release two days ahead of the deadline with zero integration defects. Afterward, our team adopted short 1-page architecture decision notes before starting sprints, which eliminated late-stage rework.",
      },
    ],
    idealModelAnswer:
      "During our hackathon, a teammate wanted to build a custom WebSocket server while I advocated for a managed real-time channel to meet our 24-hour deadline. (Situation/Task) I suggested we list our latency, setup-time, and reliability requirements and spent 20 minutes prototyping both options. (Action) The data showed the managed approach saved 5 hours for core features, so we agreed on it while using my teammate's event schema design. We finished 2 hours early and won second place. (Result)",
  },
  {
    id: "hr-3",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "HR Interview",
    topic: "Handling Failure & Accountability",
    difficulty: "Medium",
    question:
      "Describe a mistake or failure in a project or internship where something went wrong under your ownership. What did you do to fix it and prevent it from happening again?",
    keyPointsExpected: [
      "Clear ownership without blaming teammates",
      "Immediate containment / remediation steps",
      "Root cause reflection",
      "Concrete preventive system or habit put in place",
    ],
    conceptKeywords: [
      ["my mistake", "owned", "responsibility", "wrong", "missed", "bug", "failed"],
      ["fixed", "rolled back", "communicated", "resolved", "immediately"],
      ["root cause", "because", "overlooked", "assumption"],
      ["prevent", "automated", "checklist", "test", "monitoring", "ci"],
    ],
    idealModelAnswer:
      "During a college club portal deployment, I pushed an environment variable change that accidentally pointed staging scripts at production test records. I immediately took ownership, reverted the configuration within 10 minutes, restored clean seed records, and notified the coordinator transparently. To prevent recurrence, I introduced pre-deployment validation checks and separated production secrets completely.",
  },
  {
    id: "hr-4",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "HR Interview",
    topic: "Pressure & Competing Priorities",
    difficulty: "Hard",
    question:
      "Tell me about a time you had multiple urgent deadlines simultaneously with limited time. How did you prioritize and ensure quality was not compromised?",
    keyPointsExpected: [
      "Context of competing high-stakes deliverables",
      "Prioritization framework (impact, urgency, dependencies)",
      "Proactive stakeholder communication on scope/timeline",
      "Verified quality outcome across deliverables",
    ],
    conceptKeywords: [
      ["deadline", "multiple", "exams", "project", "urgent", "simultaneous"],
      ["priorit", "matrix", "critical", "impact", "dependency", "break down"],
      ["communicat", "mentor", "professor", "manager", "scope", "timeline"],
      ["completed", "delivered", "quality", "test", "on time", "result"],
    ],
    idealModelAnswer:
      "Last semester I had a capstone milestone, an internship API deliverable, and midterm exams in the same week. I mapped every task by impact and dependency blockers, proactively aligned with my project lead to defer two nice-to-have UI animations until after the core API freeze, and time-blocked deep work mornings. Both deliverables shipped on schedule with full test coverage and zero critical bugs.",
  },
  {
    id: "hr-5",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "HR Interview",
    topic: "Receiving Constructive Feedback",
    difficulty: "Easy",
    question:
      "Tell me about a piece of constructive feedback you received from a mentor, professor, or peer, and how you acted on it.",
    keyPointsExpected: [
      "Specific feedback received without defensiveness",
      "Concrete action plan taken to improve",
      "Observable change in subsequent work",
    ],
    conceptKeywords: [
      ["feedback", "mentor", "professor", "review", "suggested", "pointed out"],
      ["practiced", "changed", "started", "refactored", "applied", "action"],
      ["improved", "better", "faster", "subsequent", "next", "result"],
    ],
    idealModelAnswer:
      "In an early code review, my mentor noted my pull requests were too large and lacked edge-case tests, slowing team reviews. Rather than getting defensive, I started breaking features into small <250-line PRs with unit tests first. Within two weeks, my PR approval turnaround dropped from two days to a few hours.",
  },
  {
    id: "hr-6",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "HR Interview",
    topic: "Growth Mindset & Weaknesses",
    difficulty: "Medium",
    question:
      "What is one professional area or skill you realized was a weakness, and what concrete steps have you taken to strengthen it?",
    keyPointsExpected: [
      "Honest, non-cliché area for improvement",
      "Self-awareness of how it affected work",
      "Structured actions taken and measurable progress",
    ],
    conceptKeywords: [
      ["weakness", "struggled", "over-engineer", "time estimation", "public speaking", "delegat"],
      ["affect", "noticed", "realized", "delayed"],
      ["practiced", "framework", "checklist", "habit", "improved", "now"],
    ],
    idealModelAnswer:
      "Earlier in college projects, I underestimated time required for integration testing and edge cases, leading to last-minute stress. I corrected this by breaking tasks into verifiable milestones with a 25% buffer for testing and error states. Across my last three projects, I delivered every milestone on schedule with cleaner error handling.",
  },
  {
    id: "hr-7",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "HR Interview",
    topic: "Leadership & Initiative",
    difficulty: "Hard",
    question:
      "Describe a situation where you stepped up to lead or unblock a team without having formal authority.",
    keyPointsExpected: [
      "Identified team bottleneck or ambiguity",
      "Took initiative to organize, align, or unblock peers",
      "Empowered teammates rather than doing everything alone",
      "Clear measurable team outcome",
    ],
    conceptKeywords: [
      ["stuck", "blocked", "unclear", "ambiguous", "bottleneck", "confusion"],
      ["organized", "coordinated", "initiated", "facilitated", "divided", "board"],
      ["helped", "paired", "shared", "teammates", "ownership"],
      ["finished", "delivered", "result", "improved", "won", "launched"],
    ],
    idealModelAnswer:
      "Midway through a 4-person college project, our frontend and backend branches diverged with broken API contracts. Even though we had no formal team lead, I initiated a 30-minute contract sync, wrote a shared OpenAPI/TypeScript spec, and paired with teammates to wire mocks. That unblocked parallel development and brought the whole team back on track in 48 hours.",
  },
  {
    id: "hr-8",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "HR Interview",
    topic: "Ethical Integrity & Transparency",
    difficulty: "Hard",
    question:
      "If you discovered a subtle data privacy bug right before an important client or faculty demo and fixing it might delay the release, what would you do?",
    keyPointsExpected: [
      "Prioritize user trust, security, and data integrity",
      "Immediate risk assessment and transparent escalation",
      "Proposing safe mitigation (feature flag / hotfix scope) rather than hiding it",
    ],
    conceptKeywords: [
      ["privacy", "security", "trust", "never hide", "ethical", "integrity"],
      ["escalate", "transparent", "inform", "assess", "severity", "impact"],
      ["hotfix", "feature flag", "disable", "mitigate", "safe", "delay"],
    ],
    idealModelAnswer:
      "I would never ship a known privacy issue silently. First, I would reproduce the bug to assess exact exposure and check if disabling the affected endpoint or gating it behind a feature flag safely isolates it. Then I would immediately inform stakeholders with a clear timeline for a verified hotfix, protecting user trust over short-term optics.",
  },

  // ---------- 3. FULL STACK DEVELOPER INTERVIEW ----------
  {
    id: "fs-1",
    role: "Frontend / Fullstack Developer",
    category: "Technical",
    interviewCategory: "Full Stack Developer Interview",
    topic: "React Rendering & Performance",
    difficulty: "Easy",
    question:
      "How does React decide when to re-render a component, and what practical techniques do you use to fix unnecessary re-renders in a large dashboard?",
    keyPointsExpected: [
      "State updates, parent re-renders, and Context value changes",
      "Virtual DOM reconciliation and stable list keys",
      "Colocating state, memoization (React.memo/useMemo/useCallback) judiciously",
      "Profiling with React DevTools before optimizing",
    ],
    conceptKeywords: [
      ["state", "props", "parent", "context", "render"],
      ["reconcil", "virtual dom", "key", "diff"],
      ["memo", "usememo", "usecallback", "colocat", "split", "children"],
      ["profil", "devtools", "flame", "measure"],
    ],
    followUpTriggers: [
      {
        id: "fs-1-fu-context",
        triggerTerms: ["context", "memo", "usememo", "usecallback", "redux", "zustand"],
        followUpQuestion:
          "Follow-up on state & memoization: Why can passing a single global React Context value slow down a complex app, and how do you architect context or state stores to avoid cascading renders?",
        followUpTopic: "Context Splitting & Granular Subscriptions",
        keyPointsExpected: [
          "Every consumer re-renders on any context object reference change",
          "Splitting state vs dispatch contexts or memoizing provider values",
          "Using selector-based stores (Zustand / React Query) for granular updates",
        ],
        conceptKeywords: [
          ["consumer", "all", "reference", "object", "re-render"],
          ["split", "dispatch", "separate", "usememo", "provider"],
          ["selector", "zustand", "query", "granular", "subscribe"],
        ],
        idealModelAnswer:
          "Whenever a Context provider's value reference changes, every component calling useContext re-renders regardless of which field it reads. To prevent cascading updates, I separate state and dispatch contexts, wrap provider values in useMemo, or move rapidly changing server/UI state to React Query or selector-based stores like Zustand.",
      },
    ],
    idealModelAnswer:
      "React re-renders when a component's state changes, its parent re-renders, or a consumed Context value changes. Before optimizing, I profile with React DevTools Profiler. My primary fixes are colocating state closer to leaf components, splitting volatile contexts, ensuring stable array keys, and applying React.memo/useMemo only around genuinely expensive subtrees.",
  },
  {
    id: "fs-2",
    role: "Frontend / Fullstack Developer",
    category: "Technical",
    interviewCategory: "Full Stack Developer Interview",
    topic: "Authentication & Web Security",
    difficulty: "Medium",
    question:
      "Compare storing JWT access tokens in localStorage versus HTTP-only cookies. How would you protect a full-stack web app against both XSS and CSRF attacks?",
    keyPointsExpected: [
      "localStorage is vulnerable to XSS; HTTP-only cookies block JS access",
      "Cookies are exposed to CSRF unless SameSite/CSRF tokens are used",
      "XSS defenses: output escaping, CSP headers, sanitizing HTML",
      "Short-lived access tokens + refresh token rotation",
    ],
    conceptKeywords: [
      ["localstorage", "xss", "http-only", "httponly", "script", "javascript"],
      ["csrf", "samesite", "strict", "lax", "anti-csrf", "origin"],
      ["csp", "sanitiz", "escape", "content security policy"],
      ["refresh", "rotation", "short-lived", "expir", "revoke"],
    ],
    idealModelAnswer:
      "JWTs in localStorage are readable by injected scripts, making them vulnerable to XSS theft. Storing tokens in HttpOnly, Secure cookies prevents JS reads, though cookies require CSRF mitigation via SameSite=Lax/Strict and origin/CSRF token checks. Across the stack, I combine strict Content Security Policy headers, output escaping, and short-lived access tokens with refresh token rotation.",
  },
  {
    id: "fs-3",
    role: "Frontend / Fullstack Developer",
    category: "Technical",
    interviewCategory: "Full Stack Developer Interview",
    topic: "SQL & Backend Query Optimization",
    difficulty: "Medium",
    question:
      "What is the N+1 query problem in full-stack backends/ORMs, how do you detect it, and how do you fix it in SQL or an ORM?",
    keyPointsExpected: [
      "1 parent query followed by N child queries in a loop",
      "Detection via SQL query logging, APM traces, or EXPLAIN ANALYZE",
      "Fix using SQL JOINs, IN clauses / eager loading, or DataLoader batching",
      "Adding composite indexes and pagination for large datasets",
    ],
    conceptKeywords: [
      ["loop", "parent", "n+1", "each", "extra quer"],
      ["log", "apm", "trace", "explain", "slow query", "profiler"],
      ["join", "eager", "include", "in (", "batch", "dataloader"],
      ["index", "pagination", "cursor", "limit"],
    ],
    idealModelAnswer:
      "The N+1 problem happens when fetching N parent rows triggers N separate queries for related children inside a loop, multiplying database round-trips. I detect it using ORM query logging or APM request traces and resolve it with eager loading (SQL JOIN or WHERE id IN (...) batching) or GraphQL DataLoader, paired with indexes on foreign keys.",
  },
  {
    id: "fs-4",
    role: "Frontend / Fullstack Developer",
    category: "Technical",
    interviewCategory: "Full Stack Developer Interview",
    topic: "Frontend Web Performance & Core Web Vitals",
    difficulty: "Hard",
    question:
      "A single-page React application has a slow initial load (4.5s LCP) and layout shifts during data fetching. What concrete full-stack optimizations would you apply?",
    keyPointsExpected: [
      "Code splitting / lazy loading routes and heavy bundles",
      "SSR / streaming / preloading critical data & assets",
      "Image optimization (WebP/AVIF, explicit dimensions) & skeleton placeholders for CLS",
      "HTTP caching, CDN compression (Brotli/Gzip), and eliminating request waterfalls",
    ],
    conceptKeywords: [
      ["split", "lazy", "chunk", "bundle", "tree shak"],
      ["ssr", "preload", "prefetch", "critical", "waterfall"],
      ["skeleton", "dimension", "width", "height", "cls", "webp", "image"],
      ["cdn", "cache", "brotli", "gzip", "lcp", "parallel"],
    ],
    idealModelAnswer:
      "To improve LCP and eliminate CLS, I would audit the bundle with source-map-explorer and apply route-based React.lazy code splitting. On the network layer, I'd enable Brotli compression, CDN edge caching, and eliminate API request waterfalls by fetching data in parallel or via SSR loaders. For CLS, I'd reserve explicit dimensions on images/media and render fixed-height skeletons.",
  },
  {
    id: "fs-5",
    role: "Frontend / Fullstack Developer",
    category: "Technical",
    interviewCategory: "Full Stack Developer Interview",
    topic: "Real-Time Architecture & WebSockets",
    difficulty: "Hard",
    question:
      "How would you implement reliable real-time notifications across multiple backend Node.js instances so users never miss events during brief disconnects?",
    keyPointsExpected: [
      "WebSockets or SSE for persistent push delivery",
      "Redis Pub/Sub (or Kafka) fan-out across horizontally scaled servers",
      "Persisting notifications in DB with read/unread state & sequence IDs",
      "Exponential backoff reconnect + catch-up fetch by last-seen timestamp/ID",
    ],
    conceptKeywords: [
      ["websocket", "sse", "server-sent", "push", "socket"],
      ["redis", "pub/sub", "pubsub", "kafka", "broker", "instance", "scale"],
      ["database", "persist", "store", "unread", "sequence", "id"],
      ["reconnect", "backoff", "missed", "sync", "since", "catch-up"],
    ],
    idealModelAnswer:
      "I would use WebSockets or Server-Sent Events for live push, backed by Redis Pub/Sub so an event published on any Node instance reaches the server holding the user's socket. Crucially, every notification is persisted first in PostgreSQL with a monotonic ID; on reconnect with exponential backoff, the client requests missed events since its last acknowledged ID.",
  },
  {
    id: "fs-6",
    role: "Frontend / Fullstack Developer",
    category: "Technical",
    interviewCategory: "Full Stack Developer Interview",
    topic: "API Design & Validation Contracts",
    difficulty: "Medium",
    question:
      "How do you design clean API error handling, schema validation, and optimistic UI updates in a TypeScript full-stack application?",
    keyPointsExpected: [
      "Shared runtime schema validation (e.g. Zod) on both client and server",
      "Consistent HTTP status codes & structured error payloads",
      "Optimistic UI rollback using previous snapshot on mutation failure",
      "Accessible inline validation and non-blocking toast notifications",
    ],
    conceptKeywords: [
      ["zod", "schema", "validat", "typescript", "type-safe", "contract"],
      ["status", "400", "422", "500", "structured", "error"],
      ["optimistic", "rollback", "revert", "snapshot", "onerror", "mutation"],
      ["accessible", "inline", "toast", "feedback"],
    ],
    idealModelAnswer:
      "I share Zod schemas between client forms and server endpoints so invalid payloads fail fast with structured 400/422 field errors. On the UI, optimistic mutations via React Query snapshot the previous cache state in onMutate and cleanly roll back in onError while surfacing clear inline feedback.",
  },
  {
    id: "fs-7",
    role: "Frontend / Fullstack Developer",
    category: "Technical",
    interviewCategory: "Full Stack Developer Interview",
    topic: "Containerization & Deployment",
    difficulty: "Easy",
    question:
      "Explain why teams containerize full-stack applications with Docker, and what best practices you follow when writing a production Dockerfile.",
    keyPointsExpected: [
      "Environment parity across dev, CI, and production",
      "Multi-stage builds to keep final image small",
      "Layer caching (copy package.json before source code)",
      "Non-root user & excluding secrets/.env via .dockerignore",
    ],
    conceptKeywords: [
      ["consistent", "parity", "environment", "works on my machine", "isolat"],
      ["multi-stage", "multistage", "alpine", "slim", "size"],
      ["layer", "cache", "package.json", "lockfile"],
      ["non-root", "dockerignore", "secret", "env"],
    ],
    idealModelAnswer:
      "Docker eliminates 'works on my machine' drift by bundling runtime, OS dependencies, and app code deterministically. In production Dockerfiles, I use multi-stage builds to strip build tools from the final slim/alpine image, copy package manifests first to maximize layer caching, exclude node_modules/.env in .dockerignore, and run as a non-root user.",
  },
  {
    id: "fs-8",
    role: "Frontend / Fullstack Developer",
    category: "Technical",
    interviewCategory: "Full Stack Developer Interview",
    topic: "Browser Storage & Offline Resilience",
    difficulty: "Medium",
    question:
      "How do cookies, localStorage, sessionStorage, and IndexedDB differ, and how do you decide which one to use for different kinds of client data?",
    keyPointsExpected: [
      "Cookies (~4KB, sent with HTTP requests, auth/session flags)",
      "localStorage/sessionStorage (~5MB synchronous strings, scoped per origin vs tab)",
      "IndexedDB (asynchronous structured storage for large/offline datasets)",
      "Never store sensitive raw secrets in unencrypted browser storage",
    ],
    conceptKeywords: [
      ["cookie", "4kb", "http", "request", "httponly"],
      ["localstorage", "sessionstorage", "5mb", "tab", "persist", "synchronous"],
      ["indexeddb", "async", "large", "structured", "offline", "blob"],
      ["sensitive", "secret", "xss", "never"],
    ],
    idealModelAnswer:
      "Cookies (~4KB) automatically travel with HTTP requests and support HttpOnly/Secure flags, making them right for auth sessions. localStorage persists lightweight UI preferences across sessions, while sessionStorage scopes temporary wizard state to one tab. For large structured objects or offline queues, I use asynchronous IndexedDB to avoid blocking the main UI thread.",
  },

  // ---------- 4. CORE COMPUTER SCIENCE INTERVIEW ----------
  {
    id: "cs-1",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Core Computer Science Interview",
    topic: "OS: Processes vs Threads",
    difficulty: "Easy",
    question:
      "Explain the key differences between a process and a thread, including memory layout, context-switching cost, and inter-thread communication.",
    keyPointsExpected: [
      "Process has isolated virtual address space; threads share heap/code/open files",
      "Each thread maintains its own stack, registers, and program counter",
      "Thread context switch is cheaper (no page-table / TLB flush)",
      "Shared memory requires synchronization (mutex/semaphore) to avoid race conditions",
    ],
    conceptKeywords: [
      ["isolated", "address space", "shared", "heap", "memory"],
      ["stack", "register", "program counter", "pc", "tcb"],
      ["context switch", "tlb", "page table", "cheaper", "overhead"],
      ["mutex", "semaphore", "lock", "race", "synchroniz"],
    ],
    followUpTriggers: [
      {
        id: "cs-1-fu-sync",
        triggerTerms: ["mutex", "semaphore", "lock", "race", "synchroniz"],
        followUpQuestion:
          "Follow-up on thread synchronization: How does a mutex differ from a binary semaphore, and when can priority inversion occur?",
        followUpTopic: "Mutex Ownership & Priority Inversion",
        keyPointsExpected: [
          "Mutex enforces strict ownership (only locking thread unlocks)",
          "Semaphore is a signaling counter without ownership",
          "Priority inversion & solution via priority inheritance",
        ],
        conceptKeywords: [
          ["owner", "ownership", "unlock", "same thread"],
          ["signal", "counter", "wait", "post", "semaphore"],
          ["priority inversion", "priority inheritance", "scheduler"],
        ],
        idealModelAnswer:
          "A mutex is a locking mechanism with strict thread ownership—the same thread that acquires it must release it—whereas a semaphore is a signaling counter that one thread can signal and another can wait on. Priority inversion occurs when a high-priority thread waits on a mutex held by a low-priority thread preempted by medium-priority work, solved via priority inheritance.",
      },
    ],
    idealModelAnswer:
      "A process is an independent execution unit with its own isolated virtual address space, while threads run inside a process sharing its code, heap, and file descriptors while keeping private stacks, registers, and program counters. Switching threads is faster since it avoids changing page tables or flushing the TLB, though shared memory requires mutexes or semaphores to prevent data races.",
  },
  {
    id: "cs-2",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Core Computer Science Interview",
    topic: "OS: Deadlocks & Prevention",
    difficulty: "Medium",
    question:
      "What are the four necessary conditions for a deadlock to occur, and how can systems prevent or avoid deadlocks in practice?",
    keyPointsExpected: [
      "Four Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait",
      "Breaking Circular Wait via global lock ordering",
      "Avoidance via resource allocation graphs / Banker's algorithm",
      "Timeout / deadlock detection and recovery",
    ],
    conceptKeywords: [
      ["mutual exclusion", "hold and wait", "hold & wait", "no preemption", "circular wait"],
      ["order", "hierarchy", "global", "break"],
      ["banker", "avoidance", "safe state", "allocation graph"],
      ["timeout", "detect", "recover", "abort", "rollback"],
    ],
    idealModelAnswer:
      "Deadlock requires four simultaneous Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. In production software, the cleanest prevention breaks Circular Wait by enforcing a strict global lock-acquisition order. Databases also use wait-for graph deadlock detection, aborting and rolling back the youngest transaction or applying lock timeouts.",
  },
  {
    id: "cs-3",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Core Computer Science Interview",
    topic: "DBMS: ACID & Isolation Levels",
    difficulty: "Medium",
    question:
      "Explain the ACID properties of database transactions, and compare Read Committed vs Repeatable Read vs Serializable isolation levels.",
    keyPointsExpected: [
      "Atomicity, Consistency, Isolation, Durability definitions",
      "Anomalies: dirty reads, non-repeatable reads, phantom reads",
      "Read Committed prevents dirty reads; Repeatable Read stabilizes read rows",
      "Serializable prevents phantoms at higher locking/MVCC conflict cost",
    ],
    conceptKeywords: [
      ["atomicity", "consistency", "isolation", "durability", "all or nothing", "wal"],
      ["dirty read", "non-repeatable", "phantom"],
      ["read committed", "repeatable read", "snapshot", "mvcc"],
      ["serializable", "lock", "performance", "contention", "throughput"],
    ],
    idealModelAnswer:
      "ACID stands for Atomicity (all-or-nothing via undo logs), Consistency (preserving schema invariants), Isolation (concurrent transactions don't corrupt state), and Durability (committed writes survive crashes via WAL). Read Committed blocks dirty reads; Repeatable Read guarantees identical rows within a transaction; Serializable prevents phantom reads and write skew, though with lower concurrency.",
  },
  {
    id: "cs-4",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Core Computer Science Interview",
    topic: "DBMS: B+ Tree Indexing & Query Plans",
    difficulty: "Medium",
    question:
      "Why do relational databases use B+ Trees instead of Binary Search Trees or Hash Indexes for table indexing?",
    keyPointsExpected: [
      "High fan-out reduces disk I/O tree height (3-4 levels for millions of rows)",
      "Data pointers stored only at leaf nodes, maximizing internal node branching",
      "Linked leaf nodes support fast range queries & ORDER BY",
      "Hash indexes only support equality (=), not range scans (<, >)",
    ],
    conceptKeywords: [
      ["fan-out", "fanout", "disk", "block", "page", "height", "i/o"],
      ["leaf", "internal", "pointer", "branch"],
      ["range", "linked", "sequential", "order by", "between"],
      ["hash", "equality", "scan", "balanced"],
    ],
    idealModelAnswer:
      "B+ Trees align node size with disk/OS pages, giving high fan-out so millions of rows sit just 3–4 disk hops deep. Because internal nodes hold only routing keys and not row pointers, branching factor is maximized. Doubly linked leaf nodes also make range scans and sorted traversals fast, which hash indexes cannot support.",
  },
  {
    id: "cs-5",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Core Computer Science Interview",
    topic: "Computer Networks: TCP vs UDP & Handshake",
    difficulty: "Easy",
    question:
      "Walk through the TCP 3-way handshake and explain when an application should choose UDP over TCP.",
    keyPointsExpected: [
      "SYN -> SYN-ACK -> ACK sequence number negotiation",
      "TCP provides reliable ordered delivery, congestion & flow control",
      "UDP is connectionless, low-overhead, tolerates packet loss",
      "Use cases: video streaming, VoIP, gaming, DNS/QUIC",
    ],
    conceptKeywords: [
      ["syn", "syn-ack", "ack", "sequence", "handshake"],
      ["reliable", "order", "retransmit", "congestion", "flow control"],
      ["udp", "connectionless", "overhead", "latency", "packet loss"],
      ["video", "voice", "voip", "gaming", "dns", "quic", "streaming"],
    ],
    idealModelAnswer:
      "In the TCP 3-way handshake, the client sends SYN, the server replies with SYN-ACK, and the client confirms with ACK to synchronize initial sequence numbers. TCP guarantees ordered, reliable delivery with congestion control. Applications like live video calls, online gaming, and DNS prefer UDP to avoid head-of-line blocking and handshake latency where fresh packets matter more than retransmitting stale ones.",
  },
  {
    id: "cs-6",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Core Computer Science Interview",
    topic: "OS: Virtual Memory, Paging & TLB",
    difficulty: "Hard",
    question:
      "How does virtual memory translate virtual addresses to physical frames, and what happens during a TLB miss and a page fault?",
    keyPointsExpected: [
      "MMU splits address into virtual page number + offset",
      "TLB fast hardware cache checked first; miss walks page table",
      "Page fault traps to OS kernel to load page from disk/swap",
      "Thrashing happens when working set exceeds physical RAM frames",
    ],
    conceptKeywords: [
      ["mmu", "page number", "offset", "frame", "virtual", "physical"],
      ["tlb", "cache", "page table", "walk", "miss"],
      ["page fault", "trap", "kernel", "disk", "swap", "lru"],
      ["thrash", "working set", "ram"],
    ],
    idealModelAnswer:
      "The MMU splits a virtual address into page number and offset and checks the TLB hardware cache. On a TLB miss, it walks the multi-level page table in memory. If the valid bit is 0, a page fault traps to the OS kernel, which reads the page from disk into a physical frame (using LRU/Clock replacement if full), updates the page table, and restarts the instruction.",
  },
  {
    id: "cs-7",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Core Computer Science Interview",
    topic: "Networks: End-to-End Request Lifecycle (DNS & TLS)",
    difficulty: "Medium",
    question:
      "What happens under the hood from the moment a user enters an HTTPS URL in their browser until the page responds?",
    keyPointsExpected: [
      "DNS resolution (browser/OS cache -> resolver -> root/TLD/authoritative)",
      "TCP 3-way handshake + TLS handshake (certificate verification & session key)",
      "HTTP request routing through CDN / load balancer to application server",
      "Response parsing, DOM/CSSOM construction, and rendering",
    ],
    conceptKeywords: [
      ["dns", "ip", "resolver", "authoritative", "cache"],
      ["tcp", "tls", "ssl", "certificate", "cipher", "symmetric", "key"],
      ["http", "load balancer", "cdn", "server", "get"],
      ["html", "dom", "cssom", "render", "paint"],
    ],
    idealModelAnswer:
      "First, the browser resolves the domain to an IP via cached or recursive DNS lookup. It opens a TCP connection via the 3-way handshake and completes a TLS handshake to verify the server certificate and negotiate symmetric encryption keys. Over that encrypted channel, it sends the HTTP GET request through any CDN/load balancer, receives the HTML response, and builds the DOM and CSSOM to render the page.",
  },
  {
    id: "cs-8",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "Core Computer Science Interview",
    topic: "Distributed Systems: CAP Theorem",
    difficulty: "Hard",
    question:
      "Explain the CAP theorem and PACELC extension. During a network partition between database replicas, why must a system choose between Consistency and Availability?",
    keyPointsExpected: [
      "CAP: Consistency, Availability, Partition Tolerance (partitions are inevitable)",
      "CP systems reject/error writes on minority partition to preserve linearizability",
      "AP systems serve potentially stale reads/writes and reconcile later",
      "PACELC captures normal-operation latency vs consistency trade-offs",
    ],
    conceptKeywords: [
      ["consistency", "availability", "partition", "inevitable", "cap"],
      ["cp", "lineariz", "reject", "quorum", "minority"],
      ["ap", "stale", "eventual", "reconcil", "conflict", "crdt"],
      ["pacelc", "latency", "else", "normal"],
    ],
    idealModelAnswer:
      "Because network partitions are unavoidable in distributed systems, CAP states that during a partition a store must choose between Consistency (CP—every read sees the latest write or errors, used by ZooKeeper/banking ledgers) and Availability (AP—every non-failing node responds even with stale data, reconciled later via eventual consistency). PACELC extends this by noting that even without partitions, systems trade off latency against replication consistency.",
  },

  // ---------- 5. GENERAL PLACEMENT INTERVIEW ----------
  {
    id: "gen-1",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "General Placement Interview",
    topic: "Project Architecture & Individual Contribution",
    difficulty: "Easy",
    question:
      "Walk me through the architecture of your most significant academic or personal project. What was your exact individual contribution, and what would you redesign today?",
    keyPointsExpected: [
      "Clear high-level architecture (frontend, backend, database, auth)",
      "Explicit individual ownership vs team components",
      "One concrete bottleneck solved or metric achieved",
      "Reflective architectural improvement you would make today",
    ],
    conceptKeywords: [
      ["frontend", "backend", "database", "api", "architecture", "stack"],
      ["my role", "i built", "i designed", "i implemented", "owned", "responsible"],
      ["challenge", "latency", "bug", "users", "improved", "reduced", "%"],
      ["redesign", "today", "scale", "test", "cache", "improve"],
    ],
    followUpTriggers: [
      {
        id: "gen-1-fu-scale",
        triggerTerms: ["database", "api", "backend", "users", "architecture", "stack"],
        followUpQuestion:
          "Follow-up on your project architecture: If user traffic grew 50x overnight on your project, which component would become the bottleneck first and how would you scale it?",
        followUpTopic: "System Bottleneck & Scaling Readiness",
        keyPointsExpected: [
          "Identifying the single point of bottleneck (DB connections, CPU, unindexed queries)",
          "Concrete scaling step (indexing, caching, connection pooling, horizontal statelessness)",
          "Trade-off or cost consideration",
        ],
        conceptKeywords: [
          ["bottleneck", "database", "connection", "cpu", "memory", "query"],
          ["index", "cache", "redis", "pool", "load balancer", "replica", "stateless"],
          ["cost", "consistency", "latency", "tradeoff", "trade-off"],
        ],
        idealModelAnswer:
          "Our single PostgreSQL instance and synchronous PDF export endpoint would bottleneck first. I would add connection pooling (PgBouncer), introduce a Redis cache for read-heavy dashboards, index frequent filter columns, and offload heavy exports to an asynchronous background job queue.",
      },
    ],
    idealModelAnswer:
      "For my Smart Campus Placement Tracker, I built a React TypeScript client communicating with an Express REST API and PostgreSQL database. I personally designed the authentication middleware, SQL schema, and automated resume scorer, reducing search latency from 400ms to 45ms with trigram indexes. If redesigning it today, I would add containerized CI integration tests and asynchronous email workers.",
  },
  {
    id: "gen-2",
    role: "Data Analyst & Business Intelligence",
    category: "Technical",
    interviewCategory: "General Placement Interview",
    topic: "Product Metric Diagnosis",
    difficulty: "Hard",
    question:
      "If a company's daily active user (DAU) metric suddenly drops by 12% overnight, walk me through how you would diagnose the root cause.",
    keyPointsExpected: [
      "Verify data pipeline / logging integrity before assuming user drop",
      "Segment drop by platform (iOS/Android/Web), region, and cohort",
      "Correlate with recent deployments, outages, or external holidays",
      "Quantify downstream business impact and communicate next steps",
    ],
    conceptKeywords: [
      ["pipeline", "logging", "telemetry", "tracking", "etl", "data integrity"],
      ["segment", "ios", "android", "web", "region", "country", "cohort"],
      ["deploy", "release", "outage", "bug", "crash", "holiday", "campaign"],
      ["conversion", "revenue", "stakeholder", "incident", "report"],
    ],
    idealModelAnswer:
      "First, I verify the analytics pipeline and event ingestion logs so we don't chase a broken tracking event. Second, I segment the 12% drop by OS, app version, geography, and user cohort. If it's isolated to an Android release, I inspect crash logs and rollback candidates; if across all platforms in one region, I check ISP/payment gateway outages and brief stakeholders with clear impact metrics.",
  },
  {
    id: "gen-3",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "General Placement Interview",
    topic: "Debugging Under Deadline Pressure",
    difficulty: "Medium",
    question:
      "Tell me about a time when you encountered a severe bug right before a project demo or deadline. How did you systematically isolate and resolve it?",
    keyPointsExpected: [
      "STAR context with calm diagnosis under pressure",
      "Reproducing deterministically and inspecting logs/root cause",
      "Clean verified fix rather than blind guesswork",
      "Automated test or safeguard added afterward",
    ],
    conceptKeywords: [
      ["demo", "deadline", "project", "bug", "error", "outage"],
      ["reproduc", "log", "isolate", "root cause", "debug", "trace"],
      ["fixed", "transaction", "patch", "verified", "tested"],
      ["ci", "prevent", "automated", "integration test", "result", "passed"],
    ],
    idealModelAnswer:
      "Two hours before our final project evaluation, checkout webhooks began silently dropping payments. (Situation/Task) I isolated the failure in local reproduction logs, discovered an uncommitted database read race condition, and replaced the raw query with an atomic transaction and optimistic lock. (Action) All test runs passed cleanly for the evaluation, and I afterward added an integration test in CI to guard concurrency paths. (Result)",
  },
  {
    id: "gen-4",
    role: "Software Development Engineer (SDE-1)",
    category: "Situational",
    interviewCategory: "General Placement Interview",
    topic: "Code Quality vs Delivery Speed",
    difficulty: "Medium",
    question:
      "How do you balance shipping a feature quickly for an upcoming campus or business deadline versus maintaining clean, maintainable code?",
    keyPointsExpected: [
      "Distinguish reversible shortcuts from dangerous structural debt",
      "Keep clean module boundaries and critical path tests even under time pressure",
      "Document intentional tech debt with a follow-up cleanup ticket",
    ],
    conceptKeywords: [
      ["revers", "scope", "mvp", "core", "shortcut", "debt"],
      ["boundary", "interface", "modular", "critical", "test", "security"],
      ["ticket", "document", "refactor", "todo", "clean up"],
    ],
    idealModelAnswer:
      "Under tight deadlines, I trim non-essential scope before sacrificing security, data integrity, or clean interfaces. If I must take a tactical shortcut—like deferring an abstraction or caching layer—I keep the module boundary clean so it's easily swappable, protect the critical path with tests, and log a tracked follow-up ticket to pay down the debt immediately after release.",
  },
  {
    id: "gen-5",
    role: "Software Development Engineer (SDE-1)",
    category: "HR & Behavioral",
    interviewCategory: "General Placement Interview",
    topic: "Rapid Technical Learning",
    difficulty: "Easy",
    question:
      "Tell me about a time you had to learn an unfamiliar programming language, framework, or domain quickly to deliver a project.",
    keyPointsExpected: [
      "Specific unfamiliar technology and time constraint",
      "Structured learning approach (official docs, small spike, building incrementally)",
      "Successful delivery and key takeaway",
    ],
    conceptKeywords: [
      ["unfamiliar", "new", "first time", "learned", "days", "week"],
      ["docs", "documentation", "prototype", "spike", "mentor", "step by step"],
      ["built", "delivered", "shipped", "result", "confident"],
    ],
    idealModelAnswer:
      "For an internship prototype, I needed to build a TypeScript service with GraphQL despite only having REST experience in Python. I spent the first evening reading the official schema docs and building a two-query vertical slice, then expanded incrementally while writing type-safe tests. I shipped the API within five days and later documented setup conventions for incoming interns.",
  },
  {
    id: "gen-6",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "General Placement Interview",
    topic: "Testing Strategy & Quality Assurance",
    difficulty: "Hard",
    question:
      "How do you design an effective testing pyramid (unit, integration, end-to-end tests) for an application with limited engineering time?",
    keyPointsExpected: [
      "Fast unit tests for pure business logic and edge cases",
      "Integration tests for API contracts, DB queries, and auth boundaries",
      "Focused E2E tests only for highest-value user journeys",
      "Avoiding brittle mocks and slow flaky test suites in CI",
    ],
    conceptKeywords: [
      ["unit", "pure", "business logic", "edge case", "fast"],
      ["integration", "api", "database", "contract", "boundary"],
      ["e2e", "end-to-end", "critical", "checkout", "login", "journey"],
      ["flaky", "mock", "ci", "maintain", "pyramid"],
    ],
    idealModelAnswer:
      "With limited time, I put most assertions in fast unit tests covering pure domain logic and edge cases. I add focused integration tests at system boundaries—API endpoints, validation, and database queries—and keep E2E browser tests strictly for mission-critical flows like signup and checkout so CI stays fast and non-flaky.",
  },
  {
    id: "gen-7",
    role: "Software Development Engineer (SDE-1)",
    category: "Situational",
    interviewCategory: "General Placement Interview",
    topic: "Handling Ambiguous Requirements",
    difficulty: "Medium",
    question:
      "Suppose an interviewer or manager gives you an open-ended, ambiguous problem statement with missing details. How do you approach clarifying and breaking it down?",
    keyPointsExpected: [
      "Ask targeted clarifying questions (users, scale, constraints, success criteria)",
      "State explicit assumptions before proposing architecture/code",
      "Decompose into MVP core vs stretch extensions",
    ],
    conceptKeywords: [
      ["clarify", "questions", "constraint", "users", "scale", "success"],
      ["assumption", "explicit", "confirm", "scope"],
      ["break down", "decompose", "mvp", "milestone", "step"],
    ],
    idealModelAnswer:
      "Before jumping into implementation, I clarify the target users, expected scale, latency constraints, and definition of success. Where constraints remain open, I state reasonable assumptions explicitly so stakeholders can correct them early, then break the work into a minimal vertical slice first before layering extensions.",
  },
  {
    id: "gen-8",
    role: "Software Development Engineer (SDE-1)",
    category: "Technical",
    interviewCategory: "General Placement Interview",
    topic: "OOP & Clean Design Principles",
    difficulty: "Easy",
    question:
      "Explain Composition over Inheritance and the Single Responsibility Principle using a practical software example.",
    keyPointsExpected: [
      "Single Responsibility: a module/class should have one cohesive reason to change",
      "Inheritance creates tight coupling and brittle hierarchies",
      "Composition injects small reusable behaviors flexibly at runtime",
      "Clear real-world example (notification sender, payment strategy, UI components)",
    ],
    conceptKeywords: [
      ["single responsibility", "one reason to change", "cohesive", "focused"],
      ["inheritance", "tight coupling", "hierarchy", "brittle", "subclass"],
      ["composition", "inject", "interface", "delegate", "flexible"],
      ["example", "payment", "notification", "strategy", "logger"],
    ],
    idealModelAnswer:
      "Single Responsibility keeps each class focused on one cohesive concern—separating invoice calculation from PDF rendering and email delivery. Instead of deep inheritance trees like EmailAndSmsNotifier, composition injects interchangeable transport interfaces (EmailTransport, SmsTransport) into a NotificationService, avoiding rigid hierarchies and making testing trivial.",
  },
];

// Keep legacy export name working smoothly
export const interviewQuestions: InterviewQuestion[] = interviewQuestionBank;

// ==========================================
// STORAGE & HISTORY MANAGEMENT (Real User Data Only — Zero Dummy Seeds)
// ==========================================

const INTERVIEWS_KEY = "cp_interview_history";

export function getInterviewSessions(): InterviewSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INTERVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is InterviewSession =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
    );
  } catch {
    return [];
  }
}

export function saveInterviewSession(session: InterviewSession) {
  if (typeof window === "undefined") return;
  try {
    const existing = getInterviewSessions();
    const list = [session, ...existing.filter((s) => s.id !== session.id)];
    localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(list));
  } catch {
    // ignore storage quota errors
  }
}

export function clearInterviewSessions() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(INTERVIEWS_KEY);
  } catch {
    // ignore
  }
}

export function getCategoryForRoleOrLabel(value?: string): InterviewCategory {
  const matched = INTERVIEW_CATEGORIES.find((c) => c.label === value || c.id === value);
  if (matched) return matched.label;
  if (value === "Frontend / Fullstack Developer") return "Full Stack Developer Interview";
  if (value === "Software Development Engineer (SDE-1)") return "Technical Interview";
  return "General Placement Interview";
}

export function getInterviewQuestionsByCategory(category: InterviewCategory): InterviewQuestion[] {
  const list = interviewQuestionBank.filter((q) => q.interviewCategory === category);
  return list.length > 0 ? list : interviewQuestionBank;
}

export function getHistoricallyAskedQuestionIds(category?: InterviewCategory): string[] {
  const sessions = getInterviewSessions();
  const ids = new Set<string>();
  for (const s of sessions) {
    if (category && s.category && s.category !== category) continue;
    if (s.questionId) ids.add(s.questionId);
    if (Array.isArray(s.turns)) {
      for (const t of s.turns) {
        if (!t.isFollowUp && t.questionId) {
          ids.add(t.questionId);
        }
      }
    }
  }
  return Array.from(ids);
}

// ==========================================
// REALISTIC AI ANSWER EVALUATION ENGINE (5 Dimensions / 10)
// ==========================================

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
  "from",
  "your",
  "have",
  "would",
  "could",
  "should",
  "about",
  "there",
  "their",
  "which",
  "when",
  "where",
  "what",
  "while",
  "during",
  "into",
  "also",
  "more",
  "most",
  "very",
  "just",
  "some",
  "such",
  "than",
  "then",
  "them",
  "they",
  "were",
  "been",
  "being",
  "will",
  "make",
  "used",
  "using",
  "like",
  "know",
]);

function roundOneDecimal(val: number): number {
  return Math.round(Math.max(0, Math.min(10, val)) * 10) / 10;
}

function deriveConceptKeywords(question: InterviewQuestion): string[][] {
  if (question.conceptKeywords && question.conceptKeywords.length > 0) {
    return question.conceptKeywords;
  }
  return question.keyPointsExpected.map((point) =>
    point
      .toLowerCase()
      .replace(/[^a-z0-9+#/\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w)),
  );
}

function extractMeaningfulTerms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

export function evaluateInterviewAnswer(
  question: InterviewQuestion,
  answerText: string,
  durationSec: number,
  isSpoken: boolean,
): InterviewEvaluation {
  const trimmed = answerText.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const lower = trimmed.toLowerCase();

  // Accurate WPM calculation for spoken responses
  const safeDurationSec = Math.max(durationSec, 1);
  const speakingPaceWpm = isSpoken ? Math.round(wordCount / (safeDurationSec / 60)) : 135;

  let paceVerdict: InterviewEvaluation["paceVerdict"] = "Optimal";
  if (speakingPaceWpm < 95) paceVerdict = "Too Slow";
  else if (speakingPaceWpm < 120) paceVerdict = "A Bit Slow";
  else if (speakingPaceWpm > 175) paceVerdict = "Too Fast";
  else if (speakingPaceWpm > 155) paceVerdict = "A Bit Fast";

  // Filler & hedging detection
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

  const hedgingPhrases = [
    "i guess",
    "not sure",
    "maybe",
    "i think maybe",
    "probably",
    "don't know",
    "dont know",
    "no idea",
    "something like that",
    "honestly i forgot",
  ];
  let hedgingCount = 0;
  for (const h of hedgingPhrases) {
    if (lower.includes(h)) hedgingCount++;
  }

  const assertivePhrases = [
    "i designed",
    "i built",
    "i implemented",
    "i resolved",
    "i measured",
    "i chose",
    "i led",
    "i ensured",
    "specifically",
    "therefore",
    "trade-off",
    "tradeoff",
    "consequently",
    "in practice",
    "for example",
    "for instance",
  ];
  const assertiveMatches = assertivePhrases.filter((p) => lower.includes(p)).length;

  // STAR components & logical structure
  const situationKeywords = [
    "situation",
    "when",
    "during",
    "while",
    "project",
    "client",
    "problem",
    "faced",
    "sprint",
  ];
  const taskKeywords = [
    "task",
    "responsible",
    "needed to",
    "goal",
    "had to",
    "role",
    "objective",
    "mandate",
  ];
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
    "prototyped",
    "added",
    "replaced",
    "isolated",
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
    "faster",
    "latency",
    "won",
    "passed",
  ];

  const hasSituation = situationKeywords.some((k) => lower.includes(k));
  const hasTask = taskKeywords.some((k) => lower.includes(k));
  const hasAction = actionKeywords.some((k) => lower.includes(k));
  const hasResult = resultKeywords.some((k) => lower.includes(k));

  // Concept matching against expected points
  const conceptGroups = deriveConceptKeywords(question);
  const detectedConcepts: string[] = [];
  const missedConcepts: string[] = [];

  for (let i = 0; i < question.keyPointsExpected.length; i++) {
    const point = question.keyPointsExpected[i]!;
    const keywords = conceptGroups[i] ?? [];
    const hits = keywords.filter((kw) => lower.includes(kw)).length;
    if (hits >= 1) {
      detectedConcepts.push(point);
    } else {
      missedConcepts.push(point);
    }
  }

  const totalConcepts = Math.max(question.keyPointsExpected.length, 1);
  const conceptRatio = detectedConcepts.length / totalConcepts;

  // Prompt lexical relevance check (guards against generic copy-paste / off-topic answers)
  const promptTerms = new Set([
    ...extractMeaningfulTerms(question.question),
    ...extractMeaningfulTerms(question.idealModelAnswer),
    ...conceptGroups.flat(),
  ]);
  const answerMeaningful = extractMeaningfulTerms(trimmed);
  const uniqueAnswerTerms = new Set(answerMeaningful);
  let promptOverlapCount = 0;
  for (const term of uniqueAnswerTerms) {
    if (promptTerms.has(term)) promptOverlapCount++;
  }

  // Quantitative/technical depth cues
  const hasMetricsOrComplexity =
    /\b(o\(1\)|o\(log\s*n\)|o\(n\s*log\s*n\)|o\(n\)|o\(n\^2\)|\d+%|\d+\s*ms|\d+x)\b/i.test(lower);
  const hasTradeoffReasoning =
    /\b(trade-?off|however|whereas|downside|advantage|disadvantage|prevent|avoid|versus|instead)\b/i.test(
      lower,
    );
  const sentenceCount = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4).length;
  const lexicalDiversity =
    answerMeaningful.length > 0 ? uniqueAnswerTerms.size / answerMeaningful.length : 0;

  // 1. Relevance (/10)
  let relevanceTen = 1.5 + conceptRatio * 6.5 + Math.min(2.0, promptOverlapCount * 0.35);
  if (wordCount < 12) relevanceTen = Math.min(relevanceTen, 3.2);
  if (detectedConcepts.length === 0 && promptOverlapCount <= 1) {
    relevanceTen = Math.min(relevanceTen, 2.2);
  }
  relevanceTen = roundOneDecimal(relevanceTen);

  // 2. Technical Correctness (/10)
  let technicalTen = 1.5 + conceptRatio * 6.2;
  if (hasMetricsOrComplexity) technicalTen += 0.9;
  if (hasTradeoffReasoning) technicalTen += 0.9;
  if (promptOverlapCount >= 4) technicalTen += 0.5;
  if (wordCount < 15) technicalTen -= 2.2;
  else if (wordCount < 28) technicalTen -= 1.0;
  if (hedgingCount >= 2) technicalTen -= 0.8;
  if (detectedConcepts.length === 0 && promptOverlapCount <= 1) {
    technicalTen = Math.min(technicalTen, 2.0);
  }
  technicalTen = roundOneDecimal(technicalTen);

  // 3. Answer Structure (/10)
  const isBehavioral =
    question.category.toLowerCase().includes("hr") ||
    question.category.toLowerCase().includes("situational") ||
    question.interviewCategory === "HR Interview";
  const transitionCount = [
    "first",
    "second",
    "finally",
    "because",
    "therefore",
    "however",
    "for example",
    "as a result",
  ].filter((t) => lower.includes(t)).length;

  let structureTen = 3.0;
  if (isBehavioral) {
    if (hasSituation) structureTen += 1.5;
    if (hasTask) structureTen += 1.4;
    if (hasAction) structureTen += 1.8;
    if (hasResult) structureTen += 1.8;
    structureTen += Math.min(0.5, transitionCount * 0.25);
  } else {
    structureTen += Math.min(2.5, sentenceCount * 0.75);
    structureTen += Math.min(2.0, transitionCount * 0.65);
    if (hasTradeoffReasoning) structureTen += 1.2;
    if (hasMetricsOrComplexity || hasResult) structureTen += 1.0;
  }
  if (wordCount < 15) structureTen = Math.min(structureTen, 3.0);
  else if (wordCount < 30) structureTen = Math.min(structureTen, 6.2);
  structureTen = roundOneDecimal(structureTen);

  // 4. Communication Skills (/10)
  let commTen = 5.4;
  if (wordCount >= 40) commTen += 1.4;
  else if (wordCount >= 25) commTen += 0.7;
  else if (wordCount < 15) commTen -= 2.4;

  if (sentenceCount >= 2) commTen += 0.8;
  if (lexicalDiversity >= 0.65 && wordCount >= 20) commTen += 0.8;
  commTen -= Math.min(3.0, fillerCount * 0.65);

  if (isSpoken) {
    if (paceVerdict === "Optimal") commTen += 1.0;
    else if (paceVerdict === "A Bit Fast" || paceVerdict === "A Bit Slow") commTen -= 0.4;
    else commTen -= 1.0;
  } else if (wordCount >= 35 && sentenceCount >= 2) {
    commTen += 0.6;
  }
  commTen = roundOneDecimal(commTen);

  // 5. Confidence (/10)
  let confidenceTen = 5.5;
  confidenceTen += Math.min(2.2, assertiveMatches * 0.75);
  if (wordCount >= 35) confidenceTen += 0.9;
  else if (wordCount < 15) confidenceTen -= 2.2;
  confidenceTen -= Math.min(2.8, hedgingCount * 1.1);
  confidenceTen -= Math.min(2.2, fillerCount * 0.5);
  if (isSpoken && (paceVerdict === "Optimal" || paceVerdict === "A Bit Fast")) {
    confidenceTen += 0.6;
  } else if (isSpoken && paceVerdict === "Too Slow") {
    confidenceTen -= 0.7;
  }
  if (detectedConcepts.length >= 2) confidenceTen += 0.6;
  confidenceTen = roundOneDecimal(confidenceTen);

  const dimensions: DimensionScores = {
    technicalCorrectness: technicalTen,
    communicationSkills: commTen,
    confidence: confidenceTen,
    relevance: relevanceTen,
    answerStructure: structureTen,
  };

  // Weighted overall /10 score
  const overallScoreTen = roundOneDecimal(
    technicalTen * 0.28 +
      relevanceTen * 0.24 +
      structureTen * 0.18 +
      commTen * 0.16 +
      confidenceTen * 0.14,
  );
  const overallScore100 = Math.round(overallScoreTen * 10);

  let verdict: InterviewAnswerVerdict = "Needs Improvement";
  if (overallScoreTen >= 7.0 && technicalTen >= 6.5 && relevanceTen >= 6.5) {
    verdict = "Correct";
  } else if (overallScoreTen >= 5.0 && relevanceTen >= 4.5) {
    verdict = "Partially Correct";
  }

  // Actionable, non-generic strengths & improvements tied directly to user's actual text
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (detectedConcepts.length > 0) {
    strengths.push(
      `Addressed ${detectedConcepts.length}/${totalConcepts} core concepts (${detectedConcepts.slice(0, 2).join("; ")}).`,
    );
  }
  if (hasMetricsOrComplexity) {
    strengths.push("Backed explanation with concrete metrics or algorithmic complexity bounds.");
  }
  if (hasTradeoffReasoning) {
    strengths.push("Evaluated engineering trade-offs rather than giving a single-track answer.");
  }
  if (hasAction && hasResult) {
    strengths.push("Clearly articulated personal actions and concrete outcomes.");
  }
  if (isSpoken && paceVerdict === "Optimal") {
    strengths.push(`Steady, natural speaking cadence (${speakingPaceWpm} WPM).`);
  }
  if (fillerCount === 0 && hedgingCount === 0 && wordCount >= 25) {
    strengths.push("Confident, filler-free delivery with assertive ownership phrasing.");
  }

  if (missedConcepts.length > 0) {
    improvements.push(`Cover missing key points: ${missedConcepts.slice(0, 2).join("; ")}.`);
  }
  if (wordCount < 30) {
    improvements.push(
      `Expand your answer (currently ${wordCount} words) with concrete mechanism details and an example.`,
    );
  }
  if (fillerCount > 1) {
    improvements.push(
      `Eliminate filler words detected (${detectedFillers.join(", ")}) by pausing silently for 1 second.`,
    );
  }
  if (hedgingCount > 0) {
    improvements.push(
      "Replace uncertain phrasing ('maybe', 'I guess', 'not sure') with direct, structured reasoning.",
    );
  }
  if (isBehavioral && (!hasSituation || !hasTask || !hasResult)) {
    const missingStar = [
      !hasSituation ? "Situation" : null,
      !hasTask ? "Task" : null,
      !hasAction ? "Action" : null,
      !hasResult ? "Result" : null,
    ].filter(Boolean);
    improvements.push(
      `Complete the STAR framework by explicitly including: ${missingStar.join(", ")}.`,
    );
  } else if (!isBehavioral && !hasTradeoffReasoning) {
    improvements.push(
      "Explicitly mention trade-offs, edge cases, or failure modes to raise technical depth.",
    );
  }
  if (isSpoken && paceVerdict !== "Optimal") {
    improvements.push(
      `Adjust spoken cadence (${speakingPaceWpm} WPM — ${paceVerdict}) toward 120–150 WPM.`,
    );
  }

  let recommendedDrill = "STAR Method 60-Second Answer Workout";
  if (fillerCount >= 2 || hedgingCount >= 2) {
    recommendedDrill = "Pause & Confidence: Zero-Filler Drill";
  } else if (isSpoken && paceVerdict !== "Optimal") {
    recommendedDrill = "Metronome Pacing Drill (Target 130 WPM)";
  } else if (technicalTen < 6.5 || missedConcepts.length >= 2) {
    recommendedDrill = `Targeted Concept Revision: ${question.topic ?? question.category}`;
  } else if (structureTen < 6.5) {
    recommendedDrill = isBehavioral
      ? "STAR Structuring & Outcome Quantification Drill"
      : "Problem → Architecture → Trade-off Framing Drill";
  }

  const feedbackSummary =
    verdict === "Correct"
      ? `Strong answer (${overallScoreTen}/10). You covered ${detectedConcepts.length} of ${totalConcepts} expected concepts with clear relevance and structure.`
      : verdict === "Partially Correct"
        ? `Solid foundation (${overallScoreTen}/10), covering ${detectedConcepts.length} of ${totalConcepts} expected points, but needs deeper coverage of ${missedConcepts[0] ?? "key trade-offs"}.`
        : `Needs improvement (${overallScoreTen}/10). Your response only partially addressed the prompt (${detectedConcepts.length}/${totalConcepts} key points) — focus on directly answering the core question with concrete details.`;

  // Compatibility percentages for existing UI meters
  const structureScorePct = Math.round(structureTen * 10);
  const relevanceScorePct = Math.round(relevanceTen * 10);
  const clarityScorePct = Math.round(commTen * 10);
  const grammarScorePct = Math.round(Math.min(100, commTen * 9.5 + (sentenceCount >= 2 ? 5 : 0)));

  return {
    score: overallScore100,
    overallScoreTen,
    dimensions,
    verdict,
    feedbackSummary,
    detectedConcepts,
    missedConcepts,
    speakingPaceWpm,
    paceVerdict,
    grammarScore: grammarScorePct,
    clarityScore: clarityScorePct,
    relevanceScore: relevanceScorePct,
    structureScore: structureScorePct,
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
      : ["Attempted the prompt cleanly; expand with concrete technical or behavioral evidence."],
    improvements: improvements.length
      ? improvements
      : ["Great balance across dimensions — try a higher-difficulty follow-up to stretch depth."],
    recommendedDrill,
  };
}

// ==========================================
// DYNAMIC ADAPTIVE QUESTION & FOLLOW-UP GENERATOR
// ==========================================

export function getNextDifficulty(
  current: InterviewDifficulty,
  scoreTen: number,
): { nextDifficulty: InterviewDifficulty; shiftReason: string } {
  if (scoreTen >= 7.5) {
    if (current === "Easy") {
      return {
        nextDifficulty: "Medium",
        shiftReason: `Difficulty raised Easy → Medium after strong ${scoreTen}/10 answer`,
      };
    }
    if (current === "Medium") {
      return {
        nextDifficulty: "Hard",
        shiftReason: `Difficulty raised Medium → Hard after strong ${scoreTen}/10 answer`,
      };
    }
    return {
      nextDifficulty: "Hard",
      shiftReason: `Maintained Hard difficulty after ${scoreTen}/10 answer`,
    };
  }
  if (scoreTen <= 4.5) {
    if (current === "Hard") {
      return {
        nextDifficulty: "Medium",
        shiftReason: `Difficulty adjusted Hard → Medium to reinforce fundamentals after ${scoreTen}/10`,
      };
    }
    if (current === "Medium") {
      return {
        nextDifficulty: "Easy",
        shiftReason: `Difficulty adjusted Medium → Easy to rebuild confidence after ${scoreTen}/10`,
      };
    }
    return {
      nextDifficulty: "Easy",
      shiftReason: `Maintained Easy difficulty to consolidate core concepts`,
    };
  }
  return {
    nextDifficulty: current,
    shiftReason: `Maintained ${current} difficulty based on steady ${scoreTen}/10 performance`,
  };
}

export function selectInitialQuestion(
  category: InterviewCategory,
  avoidIds: string[] = [],
  preferredDifficulty: InterviewDifficulty = "Medium",
): InterviewQuestion {
  const pool = getInterviewQuestionsByCategory(category);
  const avoidSet = new Set(avoidIds);
  const unasked = pool.filter((q) => !avoidSet.has(q.id));
  const candidates = unasked.length > 0 ? unasked : pool;

  const exactDiff = candidates.find((q) => q.difficulty === preferredDifficulty);
  if (exactDiff) return exactDiff;
  return candidates[0] ?? interviewQuestionBank[0]!;
}

const TECH_PROBE_TEMPLATES: Array<{
  terms: string[];
  label: string;
  question: string;
  expected: string[];
  keywords: string[][];
  modelAnswer: string;
}> = [
  {
    terms: ["postgres", "postgresql", "mysql", "sql", "database"],
    label: "SQL Indexing & Consistency",
    question:
      "Follow-up on your database mention: If query latency spikes on a 50-million-row table during writes and reads, how would you inspect the execution plan and decide which indexes to create without hurting write throughput?",
    expected: [
      "Using EXPLAIN ANALYZE to inspect sequential scans vs index scans",
      "Composite index column ordering based on query selectivity",
      "Write amplification trade-off of excess indexes",
    ],
    keywords: [
      ["explain", "analyze", "plan", "seq scan", "index scan"],
      ["composite", "selectivity", "cardinality", "where", "order"],
      ["write", "insert", "update", "overhead", "amplification"],
    ],
    modelAnswer:
      "I would run EXPLAIN ANALYZE to spot expensive sequential scans, then add a composite index ordered with equality predicates before range columns. Because every extra index slows INSERT/UPDATE operations and consumes RAM, I drop unused indexes and verify query improvements with benchmarks.",
  },
  {
    terms: ["react", "state", "component", "dom", "frontend"],
    label: "React Architecture & Error Resilience",
    question:
      "Follow-up on your React approach: How do you isolate third-party or async component failures with Error Boundaries and handle race conditions during rapid user typing or tab switches?",
    expected: [
      "Error Boundaries catching render errors gracefully with fallback UI",
      "AbortController or stale-effect cleanup to prevent race conditions",
      "Debouncing or query-key cancellation for rapid inputs",
    ],
    keywords: [
      ["error boundary", "fallback", "catch", "componentdidcatch"],
      ["abortcontroller", "cleanup", "ignore", "cancel", "stale", "race"],
      ["debounce", "throttle", "query", "key"],
    ],
    modelAnswer:
      "I wrap independent UI widgets in Error Boundaries with retryable fallbacks so one widget crash never blanks the page. For rapid async requests, I pass an AbortController signal inside useEffect cleanup or rely on React Query's automatic cancellation so out-of-order responses never overwrite newer state.",
  },
  {
    terms: ["docker", "kubernetes", "ci", "cd", "deploy", "microservice"],
    label: "Deployment & Zero-Downtime Rollouts",
    question:
      "Follow-up on your deployment strategy: How would you perform a zero-downtime deployment when a release also includes a backward-incompatible database schema change?",
    expected: [
      "Expand-and-contract (multi-step) migration strategy",
      "Readiness/liveness probes during rolling updates",
      "Backward compatibility while old and new pods run simultaneously",
    ],
    keywords: [
      ["expand", "contract", "backward", "phase", "two-step", "migrate"],
      ["readiness", "liveness", "rolling", "health check", "blue-green"],
      ["old", "new", "simultaneous", "compatible", "drop"],
    ],
    modelAnswer:
      "I apply an expand-and-contract migration: first add the new nullable column and deploy code that dual-writes while reading gracefully, backfill historical rows, switch reads to the new column, and only drop the legacy column in a final cleanup deployment—guarded by Kubernetes readiness probes.",
  },
];

export function generateNextInterviewQuestion(params: {
  category: InterviewCategory;
  currentQuestion: InterviewQuestion;
  answerText: string;
  evaluation: InterviewEvaluation;
  askedQuestionIds: string[];
  askedFollowUpIds: string[];
  consecutiveFollowUps: number;
  currentDifficulty: InterviewDifficulty;
}): {
  nextQuestion: InterviewQuestion;
  nextDifficulty: InterviewDifficulty;
  isFollowUp: boolean;
  reason: string;
} {
  const {
    category,
    currentQuestion,
    answerText,
    evaluation,
    askedQuestionIds,
    askedFollowUpIds,
    consecutiveFollowUps,
    currentDifficulty,
  } = params;

  const lowerAnswer = answerText.toLowerCase();
  const { nextDifficulty, shiftReason } = getNextDifficulty(
    currentDifficulty,
    evaluation.overallScoreTen,
  );

  // Check for contextual follow-up when appropriate (max 1 consecutive follow-up per main topic)
  if (
    !currentQuestion.isFollowUp &&
    consecutiveFollowUps < 1 &&
    evaluation.overallScoreTen >= 4.0
  ) {
    // 1. Trigger specific question follow-ups based on user's actual mentioned concepts
    const triggers = currentQuestion.followUpTriggers ?? [];
    for (const trig of triggers) {
      if (askedFollowUpIds.includes(trig.id)) continue;
      const matchedTerm = trig.triggerTerms.find((t) => lowerAnswer.includes(t));
      if (matchedTerm) {
        return {
          nextQuestion: {
            id: trig.id,
            role: currentQuestion.role,
            category: currentQuestion.category,
            interviewCategory: category,
            topic: trig.followUpTopic,
            difficulty: nextDifficulty,
            question: trig.followUpQuestion,
            keyPointsExpected: trig.keyPointsExpected,
            conceptKeywords: trig.conceptKeywords,
            idealModelAnswer: trig.idealModelAnswer,
            isFollowUp: true,
            parentQuestionId: currentQuestion.id,
            adaptationReason: `Dynamic follow-up triggered by "${matchedTerm}" in your previous answer`,
          },
          nextDifficulty,
          isFollowUp: true,
          reason: `Dynamic follow-up probing "${matchedTerm}" from your previous response`,
        };
      }
    }

    // 2. If answer missed important concepts while partially addressing the topic, probe the gap!
    if (
      evaluation.missedConcepts.length > 0 &&
      evaluation.overallScoreTen >= 4.5 &&
      evaluation.overallScoreTen < 8.5
    ) {
      const missedPoint = evaluation.missedConcepts[0]!;
      const followUpId = `${currentQuestion.id}-fu-gap-${askedFollowUpIds.length + 1}`;
      if (!askedFollowUpIds.includes(followUpId)) {
        const isHr = category === "HR Interview";
        const followUpPrompt = isHr
          ? `Follow-up on your story: You shared helpful context, but could you elaborate specifically on "${missedPoint}" — what exact actions or measurable outcome resulted from your decision?`
          : `Follow-up on "${currentQuestion.topic ?? currentQuestion.category}": You didn't cover "${missedPoint}" in your previous response. How does that fit into your solution and what trade-offs does it introduce?`;
        return {
          nextQuestion: {
            id: followUpId,
            role: currentQuestion.role,
            category: currentQuestion.category,
            interviewCategory: category,
            topic: `${currentQuestion.topic ?? "Core"} (Deep Dive)`,
            difficulty: nextDifficulty,
            question: followUpPrompt,
            keyPointsExpected: [
              missedPoint,
              "Concrete example or mechanism explaining why it matters",
              "Trade-offs, edge cases, or measurable impact",
            ],
            conceptKeywords: [
              extractMeaningfulTerms(missedPoint),
              ["example", "mechanism", "because", "specifically", "step", "metric"],
              ["tradeoff", "trade-off", "edge", "impact", "however", "result", "risk"],
            ],
            idealModelAnswer: currentQuestion.idealModelAnswer,
            isFollowUp: true,
            parentQuestionId: currentQuestion.id,
            adaptationReason: `Follow-up probing gap identified in previous evaluation (${missedPoint})`,
          },
          nextDifficulty,
          isFollowUp: true,
          reason: `Targeted follow-up addressing missed concept: ${missedPoint}`,
        };
      }
    }

    // 3. Cross-stack dynamic technical probe if candidate mentioned specific stack keywords
    for (let idx = 0; idx < TECH_PROBE_TEMPLATES.length; idx++) {
      const tpl = TECH_PROBE_TEMPLATES[idx]!;
      const probeId = `${currentQuestion.id}-fu-probe-${idx}`;
      if (askedFollowUpIds.includes(probeId)) continue;
      const hit = tpl.terms.find((t) => lowerAnswer.includes(t));
      if (hit && category !== "HR Interview") {
        return {
          nextQuestion: {
            id: probeId,
            role: currentQuestion.role,
            category: "Technical",
            interviewCategory: category,
            topic: tpl.label,
            difficulty: nextDifficulty,
            question: tpl.question,
            keyPointsExpected: tpl.expected,
            conceptKeywords: tpl.keywords,
            idealModelAnswer: tpl.modelAnswer,
            isFollowUp: true,
            parentQuestionId: currentQuestion.id,
            adaptationReason: `Adaptive follow-up probing "${hit}" mentioned in your response`,
          },
          nextDifficulty,
          isFollowUp: true,
          reason: `Adaptive follow-up probing "${hit}" from your previous answer`,
        };
      }
    }
  }

  // Otherwise pick a fresh, non-repeated question from the category bank matching adapted difficulty
  const pool = getInterviewQuestionsByCategory(category);
  const askedSet = new Set(askedQuestionIds);
  const unasked = pool.filter((q) => !askedSet.has(q.id));
  const candidatePool =
    unasked.length > 0 ? unasked : pool.filter((q) => q.id !== currentQuestion.id);

  // Rank candidates by closeness to nextDifficulty
  const diffRank: Record<InterviewDifficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };
  const targetRank = diffRank[nextDifficulty];
  const sorted = [...candidatePool].sort((a, b) => {
    const da = Math.abs(diffRank[a.difficulty ?? "Medium"] - targetRank);
    const db = Math.abs(diffRank[b.difficulty ?? "Medium"] - targetRank);
    return da - db;
  });

  const chosen = sorted[0] ?? currentQuestion;
  return {
    nextQuestion: {
      ...chosen,
      adaptationReason: shiftReason,
    },
    nextDifficulty: chosen.difficulty ?? nextDifficulty,
    isFollowUp: false,
    reason: shiftReason,
  };
}

// ==========================================
// SESSION AGGREGATION, PROGRESS & SMART RECOMMENDATIONS
// ==========================================

export function buildInterviewSummary(
  turns: InterviewTurnRecord[],
  category: InterviewCategory,
  completionStatus: InterviewCompletionStatus,
): {
  overallScoreTen: number;
  overallScore100: number;
  questionsAnsweredCorrectly: number;
  strongAreas: string[];
  weakAreas: string[];
  areasForImprovement: string[];
  personalizedRecommendations: string[];
  dimensionAverages: DimensionScores;
} {
  if (turns.length === 0) {
    return {
      overallScoreTen: 0,
      overallScore100: 0,
      questionsAnsweredCorrectly: 0,
      strongAreas: [],
      weakAreas: [],
      areasForImprovement: [
        "Complete at least one interview question to generate a diagnostic report.",
      ],
      personalizedRecommendations: [`Start a ${category} round and submit your first answer.`],
      dimensionAverages: {
        technicalCorrectness: 0,
        communicationSkills: 0,
        confidence: 0,
        relevance: 0,
        answerStructure: 0,
      },
    };
  }

  const n = turns.length;
  const avg = (getter: (t: InterviewTurnRecord) => number) =>
    roundOneDecimal(turns.reduce((acc, t) => acc + getter(t), 0) / n);

  const dimensionAverages: DimensionScores = {
    technicalCorrectness: avg((t) => t.evaluation.dimensions.technicalCorrectness),
    communicationSkills: avg((t) => t.evaluation.dimensions.communicationSkills),
    confidence: avg((t) => t.evaluation.dimensions.confidence),
    relevance: avg((t) => t.evaluation.dimensions.relevance),
    answerStructure: avg((t) => t.evaluation.dimensions.answerStructure),
  };

  const overallScoreTen = avg((t) => t.evaluation.overallScoreTen);
  const overallScore100 = Math.round(overallScoreTen * 10);
  const questionsAnsweredCorrectly = turns.filter((t) => t.evaluation.verdict === "Correct").length;

  const strongAreasSet = new Set<string>();
  const weakAreasSet = new Set<string>();
  const improvementsSet = new Set<string>();

  for (const t of turns) {
    if (t.evaluation.overallScoreTen >= 7.0) {
      strongAreasSet.add(t.topic);
    } else if (t.evaluation.overallScoreTen < 6.5) {
      weakAreasSet.add(t.topic);
    }
    for (const imp of t.evaluation.improvements) {
      improvementsSet.add(imp);
    }
  }

  // Also classify the 5 rubric dimensions into strengths & weaknesses
  const dimEntries: Array<{ name: string; score: number }> = [
    { name: "Technical Correctness", score: dimensionAverages.technicalCorrectness },
    { name: "Communication Skills", score: dimensionAverages.communicationSkills },
    { name: "Confidence", score: dimensionAverages.confidence },
    { name: "Answer Relevance", score: dimensionAverages.relevance },
    { name: "Answer Structure", score: dimensionAverages.answerStructure },
  ];

  for (const d of dimEntries) {
    if (d.score >= 7.2) strongAreasSet.add(`${d.name} (${d.score}/10)`);
    else if (d.score < 6.5) weakAreasSet.add(`${d.name} (${d.score}/10)`);
  }

  const personalizedRecommendations: string[] = [];
  if (dimensionAverages.technicalCorrectness < 7.0) {
    const weakTopics = turns
      .filter((t) => t.evaluation.dimensions.technicalCorrectness < 7.0)
      .map((t) => t.topic);
    personalizedRecommendations.push(
      `Revise core concepts in ${Array.from(new Set(weakTopics)).slice(0, 2).join(" & ") || category} and practice articulating trade-offs.`,
    );
  }
  if (dimensionAverages.answerStructure < 7.0) {
    personalizedRecommendations.push(
      category === "HR Interview"
        ? "Practice strict STAR framing (15s Situation, 10s Task, 20s Action, 15s Result) with quantifiable outcomes."
        : "Structure technical answers as: Core Principle → Mechanism/Architecture → Complexity → Edge Cases/Trade-offs.",
    );
  }
  if (dimensionAverages.communicationSkills < 7.0 || dimensionAverages.confidence < 7.0) {
    personalizedRecommendations.push(
      "Do 10 minutes of recorded spoken answers aiming for 125–145 WPM with zero filler words and active-voice phrasing ('I built', 'I measured').",
    );
  }
  if (completionStatus === "Ended Early") {
    personalizedRecommendations.push(
      "Try completing a full multi-question round next time to experience Hard-level adaptive follow-ups.",
    );
  }
  if (personalizedRecommendations.length === 0) {
    personalizedRecommendations.push(
      `Strong mastery (${overallScoreTen}/10)! Challenge yourself with a Hard difficulty round in another placement category.`,
    );
  }

  return {
    overallScoreTen,
    overallScore100,
    questionsAnsweredCorrectly,
    strongAreas: Array.from(strongAreasSet),
    weakAreas: Array.from(weakAreasSet),
    areasForImprovement: Array.from(improvementsSet).slice(0, 5),
    personalizedRecommendations,
    dimensionAverages,
  };
}

export function getSessionScoreTen(session: InterviewSession): number {
  if (typeof session.overallScoreTen === "number") return session.overallScoreTen;
  if (typeof session.evaluation?.overallScoreTen === "number") {
    return session.evaluation.overallScoreTen;
  }
  return roundOneDecimal((session.evaluation?.score ?? 0) / 10);
}

export function getInterviewProgressSummary(
  sessions: InterviewSession[] = getInterviewSessions(),
): InterviewProgressSummary {
  const finishedOrActive = sessions.filter(
    (s) => (s.turns && s.turns.length > 0) || Boolean(s.answerText?.trim()),
  );
  if (finishedOrActive.length === 0) {
    return {
      totalInterviews: 0,
      completedInterviews: 0,
      endedEarlyInterviews: 0,
      inProgressInterviews: 0,
      averageScoreTen: 0,
      latestScoreTen: null,
      improvementDeltaTen: null,
      overallGrowthDeltaTen: null,
      repeatedStruggles: [],
      strongestCategory: null,
      categoryStats: [],
    };
  }

  const completedInterviews = finishedOrActive.filter(
    (s) => s.completionStatus === "Completed" || !s.completionStatus,
  ).length;
  const endedEarlyInterviews = finishedOrActive.filter(
    (s) => s.completionStatus === "Ended Early",
  ).length;
  const inProgressInterviews = finishedOrActive.filter(
    (s) => s.completionStatus === "In Progress",
  ).length;

  const scores = finishedOrActive.map(getSessionScoreTen);
  const averageScoreTen = roundOneDecimal(scores.reduce((a, b) => a + b, 0) / scores.length);
  const latestScoreTen = scores[0] ?? null;
  const improvementDeltaTen =
    scores.length >= 2 ? Math.round((scores[0]! - scores[1]!) * 10) / 10 : null;
  const overallGrowthDeltaTen =
    scores.length >= 2 ? Math.round((scores[0]! - scores[scores.length - 1]!) * 10) / 10 : null;

  // Track repeatedly struggled areas across interviews
  const struggleMap = new Map<string, { occurrences: number; totalScore: number }>();
  const categoryMap = new Map<InterviewCategory, { attempts: number; sumScore: number }>();

  for (const s of finishedOrActive) {
    const scoreTen = getSessionScoreTen(s);
    const cat = s.category ?? getCategoryForRoleOrLabel(s.role);
    const prevCat = categoryMap.get(cat) ?? { attempts: 0, sumScore: 0 };
    categoryMap.set(cat, { attempts: prevCat.attempts + 1, sumScore: prevCat.sumScore + scoreTen });

    const seenInSession = new Set<string>();
    const dims = s.dimensionAverages ?? s.evaluation?.dimensions;
    if (dims && typeof dims === "object") {
      const checks: Array<[string, number | undefined]> = [
        ["Technical Correctness", dims.technicalCorrectness],
        ["Communication Skills", dims.communicationSkills],
        ["Confidence", dims.confidence],
        ["Answer Relevance", dims.relevance],
        ["Answer Structure", dims.answerStructure],
      ];
      for (const [label, val] of checks) {
        if (typeof val === "number" && Number.isFinite(val) && val < 6.5) {
          seenInSession.add(label);
          const prev = struggleMap.get(label) ?? { occurrences: 0, totalScore: 0 };
          struggleMap.set(label, {
            occurrences: prev.occurrences + 1,
            totalScore: prev.totalScore + val,
          });
        }
      }
    }

    if (Array.isArray(s.turns)) {
      for (const t of s.turns) {
        const turnScore = t?.evaluation?.overallScoreTen;
        if (
          typeof turnScore === "number" &&
          Number.isFinite(turnScore) &&
          turnScore < 6.5 &&
          !seenInSession.has(t.topic)
        ) {
          seenInSession.add(t.topic);
          const prev = struggleMap.get(t.topic) ?? { occurrences: 0, totalScore: 0 };
          struggleMap.set(t.topic, {
            occurrences: prev.occurrences + 1,
            totalScore: prev.totalScore + turnScore,
          });
        }
      }
    }
  }

  const repeatedStruggles = Array.from(struggleMap.entries())
    .map(([area, info]) => ({
      area,
      occurrences: info.occurrences,
      avgScoreTen: roundOneDecimal(info.totalScore / info.occurrences),
    }))
    .sort((a, b) => b.occurrences - a.occurrences || a.avgScoreTen - b.avgScoreTen)
    .slice(0, 6);

  const categoryStats = Array.from(categoryMap.entries()).map(([category, info]) => ({
    category,
    attempts: info.attempts,
    avgScoreTen: roundOneDecimal(info.sumScore / info.attempts),
  }));

  const strongestCategory =
    [...categoryStats].sort((a, b) => b.avgScoreTen - a.avgScoreTen)[0]?.category ?? null;

  return {
    totalInterviews: finishedOrActive.length,
    completedInterviews,
    endedEarlyInterviews,
    inProgressInterviews,
    averageScoreTen,
    latestScoreTen,
    improvementDeltaTen,
    overallGrowthDeltaTen,
    repeatedStruggles,
    strongestCategory,
    categoryStats,
  };
}

export function getSmartPracticeRecommendations(
  sessions: InterviewSession[] = getInterviewSessions(),
  activeCategory: InterviewCategory = "Technical Interview",
): SmartPracticeRecommendations {
  const topicsToRevise: SmartPracticeRecommendations["topicsToRevise"] = [];
  const seenTopics = new Set<string>();
  const weakQuestionIds = new Set<string>();
  const masteredQuestionIds = new Set<string>();

  let avgFillers = 0;
  let avgWpm = 135;
  let spokenCount = 0;
  let avgConfidence = 7.5;
  let avgStructure = 7.5;

  if (sessions.length > 0) {
    let fillerSum = 0;
    let wpmSum = 0;
    let confSum = 0;
    let structSum = 0;
    let turnTotal = 0;

    for (const s of sessions) {
      const cat = s.category ?? getCategoryForRoleOrLabel(s.role);
      const turns = s.turns ?? [];
      if (turns.length > 0) {
        for (const t of turns) {
          if (!t?.evaluation) continue;
          turnTotal++;
          fillerSum += t.evaluation.fillerWordCount ?? 0;
          confSum += t.evaluation.dimensions?.confidence ?? 6.5;
          structSum += t.evaluation.dimensions?.answerStructure ?? 6.5;
          if (t.isSpoken) {
            wpmSum += t.evaluation.speakingPaceWpm ?? 135;
            spokenCount++;
          }
          const tScore = t.evaluation.overallScoreTen ?? 0;
          if (tScore < 6.8) {
            weakQuestionIds.add(t.questionId);
            if (!seenTopics.has(t.topic)) {
              seenTopics.add(t.topic);
              topicsToRevise.push({
                topic: t.topic,
                category: cat,
                reason: `Scored ${tScore}/10 — ${t.evaluation.missedConcepts?.[0] ?? "needs deeper mechanism & trade-offs"}`,
                currentScoreTen: tScore,
              });
            }
          } else {
            masteredQuestionIds.add(t.questionId);
          }
        }
      } else if (s?.evaluation) {
        turnTotal++;
        fillerSum += s.evaluation.fillerWordCount ?? 0;
        const dims = s.dimensionAverages ?? s.evaluation.dimensions;
        confSum += dims?.confidence ?? 6.5;
        structSum += dims?.answerStructure ?? (s.evaluation.structureScore ?? 65) / 10;
        if (s.isSpoken) {
          wpmSum += s.evaluation.speakingPaceWpm ?? 135;
          spokenCount++;
        }
        const sTen = getSessionScoreTen(s);
        if (sTen < 6.8) {
          topicsToRevise.push({
            topic: cat,
            category: cat,
            reason: `Recent score ${sTen}/10 — review missed key points and answer framing.`,
            currentScoreTen: sTen,
          });
        }
      }
    }

    if (turnTotal > 0) {
      avgFillers = fillerSum / turnTotal;
      avgConfidence = confSum / turnTotal;
      avgStructure = structSum / turnTotal;
    }
    if (spokenCount > 0) {
      avgWpm = Math.round(wpmSum / spokenCount);
    }
  }

  // Fill remaining revision slots with unmastered foundational topics from active category
  if (topicsToRevise.length < 3) {
    for (const q of getInterviewQuestionsByCategory(activeCategory)) {
      const topic = q.topic ?? q.category;
      if (!seenTopics.has(topic) && !masteredQuestionIds.has(q.id)) {
        seenTopics.add(topic);
        topicsToRevise.push({
          topic,
          category: q.interviewCategory ?? activeCategory,
          reason: `Core ${q.difficulty ?? "Medium"} placement topic not yet mastered in practice rounds.`,
          currentScoreTen: null,
        });
        if (topicsToRevise.length >= 4) break;
      }
    }
  }

  // Technical questions prioritized by weak topics first, then unattempted Technical / Core CS / Full Stack
  const techPool = interviewQuestionBank.filter(
    (q) =>
      q.interviewCategory === "Technical Interview" ||
      q.interviewCategory === "Core Computer Science Interview" ||
      q.interviewCategory === "Full Stack Developer Interview",
  );
  const technicalQuestionsToPractice = [
    ...techPool.filter((q) => weakQuestionIds.has(q.id)),
    ...techPool.filter((q) => !weakQuestionIds.has(q.id) && !masteredQuestionIds.has(q.id)),
  ].slice(0, 4);

  // HR questions prioritized by weak HR/behavioral responses
  const hrPool = interviewQuestionBank.filter(
    (q) =>
      q.interviewCategory === "HR Interview" ||
      (q.interviewCategory === "General Placement Interview" && q.category === "HR & Behavioral"),
  );
  const hrQuestionsToPrepare = [
    ...hrPool.filter((q) => weakQuestionIds.has(q.id)),
    ...hrPool.filter((q) => !weakQuestionIds.has(q.id) && !masteredQuestionIds.has(q.id)),
  ].slice(0, 3);

  // Targeted communication exercises
  const communicationExercises: SmartPracticeRecommendations["communicationExercises"] = [];
  if (avgFillers >= 1.5 || avgConfidence < 7.0) {
    communicationExercises.push({
      title: "Zero-Filler Silent Pause & Assertive Ownership Drill",
      durationMinutes: 10,
      focus: "Confidence & Elimination of Filler Words",
      instruction:
        "Answer 3 technical prompts out loud replacing 'um/like/maybe' with a 1-second silent breath, opening every action with 'I designed...' or 'I measured...'.",
      targetMetric: "0–1 fillers/answer • Confidence >= 8.0/10",
    });
  }
  if (avgStructure < 7.2) {
    communicationExercises.push({
      title: "STAR & Problem-Tradeoff 60-Second Framing",
      durationMinutes: 12,
      focus: "Answer Structure & Clarity",
      instruction:
        "Time-box answers into 4 beats: 15s Context/Principle, 10s Task/Constraint, 20s Mechanism/Action, 15s Measurable Result/Trade-off.",
      targetMetric: "Structure >= 8.0/10",
    });
  }
  if (spokenCount > 0 && (avgWpm < 115 || avgWpm > 158)) {
    communicationExercises.push({
      title: "Metronome Cadence Stabilization (130 WPM)",
      durationMinutes: 8,
      focus: `Speaking Pace (${avgWpm} WPM detected)`,
      instruction:
        avgWpm > 158
          ? "Slow down slightly between architectural steps and pause 1 beat after stating time/space complexity."
          : "Speak from 3 concise bullet points rather than searching mid-sentence to raise flow toward 125–145 WPM.",
      targetMetric: "120–150 WPM Optimal Zone",
    });
  }
  // Always ensure at least 2 concrete exercises are available
  if (communicationExercises.length < 2) {
    communicationExercises.push({
      title: "60-Second Executive Project Pitch & Trade-Off Defense",
      durationMinutes: 10,
      focus: "Concise Technical Storytelling",
      instruction:
        "Summarize your flagship project in under 60 seconds, naming one concrete performance improvement (%) and one architectural trade-off.",
      targetMetric: "120–145 WPM • >= 8.0/10 Relevance",
    });
  }
  if (communicationExercises.length < 3) {
    communicationExercises.push({
      title: "Follow-Up Stress Test (Deep-Dive Defense)",
      durationMinutes: 10,
      focus: "Handling Unscripted Follow-Up Probes",
      instruction:
        "Record answers to two follow-up prompts explaining failure modes, database contention, or edge cases without hedging phrases.",
      targetMetric: "Zero hedging phrases • >= 7.5/10 Correctness",
    });
  }

  return {
    topicsToRevise: topicsToRevise.slice(0, 4),
    technicalQuestionsToPractice,
    hrQuestionsToPrepare,
    communicationExercises,
  };
}
