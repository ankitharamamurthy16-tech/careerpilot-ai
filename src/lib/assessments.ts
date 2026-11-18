// Assessment & Placement Preparation content, scoring, performance analytics,
// adaptive difficulty & personalized recommendation engine.
// Preserves legacy quantMock4 and saveResult/getResults interfaces for full backward compatibility.

export type Question = {
  q: string;
  options: [string, string, string, string];
  answer: number;
  level: "Beginner" | "Intermediate";
  topic: string;
  explain: string;
};

export type AssessmentResult = {
  assessmentId: string;
  title: string;
  takenAt: string;
  score: number;
  total: number;
  attempted: number;
  unanswered: number;
  timeTakenSec: number;
  answers: (number | null)[];
  topicBreakdown: Record<string, { correct: number; total: number }>;
};

export type AssessmentCategory = "aptitude" | "logical" | "technical" | "core-cs";
export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type SkillTier = "Beginner" | "Intermediate" | "Advanced";

export type AssessmentQuestion = {
  id: string;
  category: AssessmentCategory;
  topic: string;
  difficulty: DifficultyLevel;
  csLevel: SkillTier;
  q: string;
  codeSnippet?: string;
  options: [string, string, string, string];
  answer: number;
  explain: string;
};

export type QuestionAttemptDetail = {
  questionId: string;
  topic: string;
  category: AssessmentCategory;
  difficulty: DifficultyLevel;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
};

export type AssessmentAttemptRecord = {
  id: string;
  assessmentId: string;
  category: AssessmentCategory | "recommended" | "quant-mock";
  title: string;
  topicFilter?: string;
  difficultyFilter?: string;
  takenAt: string;
  score: number;
  incorrect: number;
  unanswered: number;
  attempted: number;
  total: number;
  scorePct: number;
  accuracyPct: number;
  timeTakenSec: number;
  topicBreakdown: Record<string, { correct: number; attempted: number; total: number }>;
  questionDetails?: QuestionAttemptDetail[];
};

export type TopicPerformanceStat = {
  topic: string;
  category: AssessmentCategory | "quant-mock";
  correct: number;
  incorrect: number;
  attempted: number;
  total: number;
  accuracy: number;
  status: "strong" | "moderate" | "weak";
};

export type CategoryPerformanceStat = {
  category: AssessmentCategory;
  label: string;
  assessmentsCount: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  recommendedDifficulty: DifficultyLevel;
  recommendedTier: SkillTier;
};

export type GeneratedDailyTask = {
  id: string;
  title: string;
  description: string;
  category: AssessmentCategory | "recommended";
  topic: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  priority: "High" | "Medium" | "Normal";
};

export type PerformanceAnalytics = {
  totalAssessments: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number;
  averageScorePct: number;
  byCategory: Record<AssessmentCategory, CategoryPerformanceStat>;
  topicStats: TopicPerformanceStat[];
  strengths: TopicPerformanceStat[];
  weaknesses: TopicPerformanceStat[];
  adaptiveDifficulty: DifficultyLevel;
  adaptiveTier: SkillTier;
  adaptiveReason: string;
  recommendedQuestions: AssessmentQuestion[];
  dailyPracticeTasks: GeneratedDailyTask[];
  history: AssessmentAttemptRecord[];
};

const B = "Beginner" as const,
  I = "Intermediate" as const;

// ==========================================
// 1. LEGACY QUANT MOCK 4 (PRESERVED INTACT)
// ==========================================
export const quantMock4 = {
  id: "quant-mock-4",
  title: "Quantitative Aptitude – Mock 4",
  durationSec: 30 * 60,
  questions: [
    {
      q: "What is 15% of 240?",
      options: ["32", "36", "38", "40"],
      answer: 1,
      level: B,
      topic: "Percentages",
      explain: "15% × 240 = 0.15 × 240 = 36.",
    },
    {
      q: "A number increased by 20% becomes 96. What is the number?",
      options: ["76", "78", "80", "82"],
      answer: 2,
      level: B,
      topic: "Percentages",
      explain: "1.2x = 96 ⇒ x = 80.",
    },
    {
      q: "A shirt marked ₹800 is sold at 25% discount. Selling price?",
      options: ["₹550", "₹600", "₹620", "₹650"],
      answer: 1,
      level: B,
      topic: "Profit & Loss",
      explain: "800 × 0.75 = ₹600.",
    },
    {
      q: "An item bought for ₹500 is sold for ₹600. Profit %?",
      options: ["15%", "18%", "20%", "25%"],
      answer: 2,
      level: B,
      topic: "Profit & Loss",
      explain: "Profit = 100; 100/500 × 100 = 20%.",
    },
    {
      q: "Average of 12, 18, 24, 30 and 36 is:",
      options: ["22", "24", "26", "28"],
      answer: 1,
      level: B,
      topic: "Averages",
      explain: "Sum = 120; 120 / 5 = 24.",
    },
    {
      q: "Ratio of boys to girls is 3:5 in a class of 40. Number of girls?",
      options: ["15", "20", "24", "25"],
      answer: 3,
      level: B,
      topic: "Ratio & Proportion",
      explain: "Girls = 5/8 × 40 = 25.",
    },
    {
      q: "A car travels 180 km in 3 hours. Its speed is:",
      options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"],
      answer: 2,
      level: B,
      topic: "Time, Speed & Distance",
      explain: "180 / 3 = 60 km/h.",
    },
    {
      q: "Convert 72 km/h into m/s.",
      options: ["18 m/s", "20 m/s", "22 m/s", "25 m/s"],
      answer: 1,
      level: B,
      topic: "Time, Speed & Distance",
      explain: "72 × 5/18 = 20 m/s.",
    },
    {
      q: "Simple interest on ₹5,000 at 8% p.a. for 3 years?",
      options: ["₹1,000", "₹1,200", "₹1,400", "₹1,500"],
      answer: 1,
      level: B,
      topic: "Interest",
      explain: "SI = 5000 × 8 × 3 / 100 = ₹1,200.",
    },
    {
      q: "A can finish a work in 10 days, B in 15 days. Together they take:",
      options: ["5 days", "6 days", "7 days", "8 days"],
      answer: 1,
      level: B,
      topic: "Time & Work",
      explain: "1/10 + 1/15 = 1/6 ⇒ 6 days.",
    },
    {
      q: "LCM of 12 and 18 is:",
      options: ["24", "36", "48", "72"],
      answer: 1,
      level: B,
      topic: "Number System",
      explain: "12 = 2²·3, 18 = 2·3² ⇒ LCM = 2²·3² = 36.",
    },
    {
      q: "HCF of 48 and 72 is:",
      options: ["12", "16", "24", "36"],
      answer: 2,
      level: B,
      topic: "Number System",
      explain: "48 = 2⁴·3, 72 = 2³·3² ⇒ HCF = 2³·3 = 24.",
    },
    {
      q: "Find the next number: 2, 6, 12, 20, 30, ?",
      options: ["40", "42", "44", "48"],
      answer: 1,
      level: B,
      topic: "Number Series",
      explain: "Differences 4, 6, 8, 10, 12 ⇒ 30 + 12 = 42.",
    },
    {
      q: "If 5 pens cost ₹60, what do 8 pens cost?",
      options: ["₹84", "₹90", "₹96", "₹100"],
      answer: 2,
      level: B,
      topic: "Ratio & Proportion",
      explain: "One pen = ₹12; 8 × 12 = ₹96.",
    },
    {
      q: "Area of a rectangle 12 m × 8 m is:",
      options: ["40 m²", "84 m²", "96 m²", "104 m²"],
      answer: 2,
      level: B,
      topic: "Mensuration",
      explain: "12 × 8 = 96 m².",
    },
    {
      q: "A train 150 m long passes a pole in 10 s. Its speed in km/h?",
      options: ["45", "54", "60", "72"],
      answer: 1,
      level: I,
      topic: "Time, Speed & Distance",
      explain: "15 m/s × 18/5 = 54 km/h.",
    },
    {
      q: "Compound interest on ₹10,000 at 10% p.a. for 2 years?",
      options: ["₹2,000", "₹2,050", "₹2,100", "₹2,200"],
      answer: 2,
      level: I,
      topic: "Interest",
      explain: "10000 × 1.1² = 12,100 ⇒ CI = ₹2,100.",
    },
    {
      q: "A shopkeeper marks goods 40% above cost and gives 20% discount. Profit %?",
      options: ["10%", "12%", "15%", "20%"],
      answer: 1,
      level: I,
      topic: "Profit & Loss",
      explain: "1.4 × 0.8 = 1.12 ⇒ 12% profit.",
    },
    {
      q: "A pipe fills a tank in 6 h, another empties it in 9 h. Both open, tank fills in:",
      options: ["12 h", "15 h", "18 h", "20 h"],
      answer: 2,
      level: I,
      topic: "Pipes & Cisterns",
      explain: "1/6 − 1/9 = 1/18 ⇒ 18 hours.",
    },
    {
      q: "Average of 5 numbers is 40. If one number is removed, average becomes 38. Removed number?",
      options: ["44", "46", "48", "50"],
      answer: 2,
      level: I,
      topic: "Averages",
      explain: "200 − 4 × 38 = 200 − 152 = 48.",
    },
    {
      q: "Price of sugar rises 25%. By how much % must consumption drop to keep expense same?",
      options: ["20%", "22%", "25%", "15%"],
      answer: 0,
      level: I,
      topic: "Percentages",
      explain: "25/125 × 100 = 20%.",
    },
    {
      q: "A and B's ages are in ratio 4:5. After 5 years it will be 5:6. A's present age?",
      options: ["16", "20", "24", "25"],
      answer: 1,
      level: I,
      topic: "Ages",
      explain: "(4x+5)/(5x+5) = 5/6 ⇒ 24x+30 = 25x+25 ⇒ x = 5 ⇒ A = 20.",
    },
    {
      q: "In how many ways can the letters of 'APPLE' be arranged?",
      options: ["60", "100", "120", "24"],
      answer: 0,
      level: I,
      topic: "Permutations",
      explain: "5! / 2! = 120 / 2 = 60 (P repeats).",
    },
    {
      q: "Two dice are thrown. Probability that the sum is 7?",
      options: ["1/9", "1/6", "5/36", "1/12"],
      answer: 1,
      level: I,
      topic: "Probability",
      explain: "6 favourable outcomes out of 36 ⇒ 1/6.",
    },
    {
      q: "12 men complete a work in 15 days. How many days for 20 men?",
      options: ["8", "9", "10", "12"],
      answer: 1,
      level: I,
      topic: "Time & Work",
      explain: "12 × 15 = 180 man-days; 180 / 20 = 9 days.",
    },
    {
      q: "A boat goes 24 km downstream in 2 h and returns in 3 h. Speed of stream?",
      options: ["1 km/h", "2 km/h", "3 km/h", "4 km/h"],
      answer: 1,
      level: I,
      topic: "Boats & Streams",
      explain: "Down = 12, Up = 8 ⇒ stream = (12 − 8)/2 = 2 km/h.",
    },
    {
      q: "How much water must be added to 40 L of milk at ₹20/L so the mix costs ₹16/L?",
      options: ["8 L", "10 L", "12 L", "15 L"],
      answer: 1,
      level: I,
      topic: "Mixtures",
      explain: "800 / (40 + x) = 16 ⇒ 40 + x = 50 ⇒ x = 10 L.",
    },
    {
      q: "Radius of a circle is 14 cm. Its area (π = 22/7)?",
      options: ["616 cm²", "588 cm²", "440 cm²", "308 cm²"],
      answer: 0,
      level: I,
      topic: "Mensuration",
      explain: "22/7 × 14 × 14 = 616 cm².",
    },
    {
      q: "Find the remainder when 2¹⁰ is divided by 7.",
      options: ["1", "2", "3", "4"],
      answer: 1,
      level: I,
      topic: "Number System",
      explain: "2³ = 8 ≡ 1 (mod 7); 2¹⁰ = (2³)³·2 ≡ 2.",
    },
    {
      q: "Sum of first 20 natural numbers is:",
      options: ["190", "200", "210", "220"],
      answer: 2,
      level: I,
      topic: "Number System",
      explain: "n(n+1)/2 = 20 × 21 / 2 = 210.",
    },
  ] as Question[],
};

export function scoreAssessment(questions: Question[], answers: (number | null)[]) {
  let score = 0;
  const topicBreakdown: AssessmentResult["topicBreakdown"] = {};
  questions.forEach((q, i) => {
    const t = (topicBreakdown[q.topic] ??= { correct: 0, total: 0 });
    t.total++;
    if (answers[i] === q.answer) {
      score++;
      t.correct++;
    }
  });
  const attempted = answers.filter((a) => a !== null && a !== undefined).length;
  return {
    score,
    attempted,
    unanswered: questions.length - attempted,
    total: questions.length,
    topicBreakdown,
  };
}

// ==========================================
// 2. FULL PLACEMENT QUESTION BANK
// ==========================================
function qItem(
  id: string,
  category: AssessmentCategory,
  topic: string,
  difficulty: DifficultyLevel,
  q: string,
  options: [string, string, string, string],
  answer: number,
  explain: string,
  codeSnippet?: string,
): AssessmentQuestion {
  const csLevel: SkillTier =
    difficulty === "Easy" ? "Beginner" : difficulty === "Medium" ? "Intermediate" : "Advanced";
  const item: AssessmentQuestion = {
    id,
    category,
    topic,
    difficulty,
    csLevel,
    q,
    options,
    answer,
    explain,
  };
  if (codeSnippet !== undefined) {
    item.codeSnippet = codeSnippet;
  }
  return item;
}

export const ASSESSMENT_CATEGORIES: Array<{
  id: AssessmentCategory;
  label: string;
  shortLabel: string;
  description: string;
  topics: string[];
}> = [
  {
    id: "aptitude",
    label: "Quantitative Aptitude Practice",
    shortLabel: "Aptitude Practice",
    description:
      "Percentages, Profit & Loss, Time & Work, Speed & Distance, Averages, and Probability.",
    topics: [
      "Percentages",
      "Profit & Loss",
      "Time & Work",
      "Speed & Distance",
      "Averages",
      "Probability",
    ],
  },
  {
    id: "logical",
    label: "Logical Reasoning",
    shortLabel: "Logical Reasoning",
    description:
      "Puzzles, Number Series, Coding-Decoding, Blood Relations, Directions, and Syllogisms across Easy, Medium & Hard.",
    topics: [
      "Puzzles",
      "Number Series",
      "Coding-Decoding",
      "Blood Relations",
      "Directions",
      "Syllogisms",
    ],
  },
  {
    id: "technical",
    label: "Technical Assessment",
    shortLabel: "Technical Assessment",
    description:
      "Programming & Core Systems covering C, C++, Java, Python, SQL, DSA, OS, DBMS, and Computer Networks.",
    topics: [
      "C",
      "C++",
      "Java",
      "Python",
      "SQL",
      "Data Structures & Algorithms",
      "Operating Systems",
      "DBMS",
      "Computer Networks",
    ],
  },
  {
    id: "core-cs",
    label: "Core CS Quiz",
    shortLabel: "Core CS Quiz",
    description:
      "Topic-wise Core Computer Science quizzes calibrated across Beginner, Intermediate, and Advanced levels.",
    topics: [
      "Operating Systems",
      "DBMS",
      "Computer Networks",
      "Data Structures & Algorithms",
      "OOP & System Design",
    ],
  },
];

export const assessmentQuestionBank: AssessmentQuestion[] = [
  // ==========================================
  // A. QUANTITATIVE APTITUDE (24 QUESTIONS)
  // Topics: Percentages, Profit & Loss, Time & Work, Speed & Distance, Averages, Probability
  // ==========================================
  // --- Percentages ---
  qItem(
    "apt-pct-1",
    "aptitude",
    "Percentages",
    "Easy",
    "In an exam, a student scores 342 marks out of 450. What is the percentage scored?",
    ["72%", "74%", "76%", "78%"],
    2,
    "(342 / 450) × 100 = (342 × 2) / 9 = 684 / 9 = 76%.",
  ),
  qItem(
    "apt-pct-2",
    "aptitude",
    "Percentages",
    "Medium",
    "The salary of an engineer increases by 20% in the first year and decreases by 10% in the second year. What is the net percentage change?",
    ["+8%", "+10%", "+12%", "+6%"],
    0,
    "Successive percentage change: 20 − 10 + (20 × (−10))/100 = 10 − 2 = +8%.",
  ),
  qItem(
    "apt-pct-3",
    "aptitude",
    "Percentages",
    "Medium",
    "In a placement test, 35% of candidates failed in Aptitude, 25% failed in Coding, and 10% failed in both. What percentage passed in both?",
    ["40%", "45%", "50%", "55%"],
    2,
    "Failed in at least one = 35% + 25% − 10% = 50%. Therefore, passed in both = 100% − 50% = 50%.",
  ),
  qItem(
    "apt-pct-4",
    "aptitude",
    "Percentages",
    "Hard",
    "The population of a town increases by 10% annually. If its present population is 26,620, what was it 3 years ago?",
    ["18,000", "20,000", "21,500", "22,000"],
    1,
    "P × (1.1)³ = 26,620 ⇒ P × 1.331 = 26,620 ⇒ P = 26,620 / 1.331 = 20,000.",
  ),

  // --- Profit & Loss ---
  qItem(
    "apt-pl-1",
    "aptitude",
    "Profit & Loss",
    "Easy",
    "A laptop bought for ₹40,000 is sold for ₹46,000. What is the profit percentage?",
    ["12%", "15%", "16%", "18%"],
    1,
    "Profit = ₹46,000 − ₹40,000 = ₹6,000. Profit % = (6000 / 40000) × 100 = 15%.",
  ),
  qItem(
    "apt-pl-2",
    "aptitude",
    "Profit & Loss",
    "Medium",
    "By selling an article for ₹720, a trader incurs a loss of 10%. At what price must it be sold to gain 20%?",
    ["₹880", "₹920", "₹960", "₹980"],
    2,
    "90% of CP = 720 ⇒ CP = ₹800. For 20% gain, SP = 800 × 1.2 = ₹960.",
  ),
  qItem(
    "apt-pl-3",
    "aptitude",
    "Profit & Loss",
    "Medium",
    "If the cost price of 15 notebooks equals the selling price of 12 notebooks, find the profit percentage.",
    ["20%", "25%", "30%", "33.33%"],
    1,
    "Profit = 15 − 12 = 3 notebooks on CP of 12. Profit % = (3 / 12) × 100 = 25%.",
  ),
  qItem(
    "apt-pl-4",
    "aptitude",
    "Profit & Loss",
    "Hard",
    "A merchant sells two gadgets at ₹9,900 each, gaining 10% on one and losing 10% on the other. What is the overall gain or loss percentage?",
    ["No profit, no loss", "1% profit", "1% loss", "2% loss"],
    2,
    "When two items are sold at the same SP with equal x% gain and x% loss, there is always a loss of (x²/100)% = (10²/100)% = 1% loss.",
  ),

  // --- Time & Work ---
  qItem(
    "apt-tw-1",
    "aptitude",
    "Time & Work",
    "Easy",
    "A can build a module in 12 days and B can build it in 24 days. Working together, how many days will they take?",
    ["6 days", "8 days", "9 days", "10 days"],
    1,
    "Combined 1-day work = 1/12 + 1/24 = 3/24 = 1/8. Thus, they finish in 8 days.",
  ),
  qItem(
    "apt-tw-2",
    "aptitude",
    "Time & Work",
    "Medium",
    "A and B together finish a task in 10 days, B and C in 15 days, and C and A in 12 days. In how many days can all three finish it together?",
    ["6 days", "8 days", "9 days", "10 days"],
    1,
    "2(A + B + C) = 1/10 + 1/15 + 1/12 = (6 + 4 + 5)/60 = 15/60 = 1/4. So (A + B + C) = 1/8 ⇒ 8 days.",
  ),
  qItem(
    "apt-tw-3",
    "aptitude",
    "Time & Work",
    "Medium",
    "A can do a job in 15 days and B in 20 days. They work together for 4 days, after which A leaves. In how many more days will B finish the remaining work?",
    ["8 days", "10 2/3 days", "12 days", "9 1/3 days"],
    1,
    "In 4 days they complete 4 × (1/15 + 1/20) = 4 × (7/60) = 7/15. Remaining = 8/15. B takes (8/15) × 20 = 32/3 = 10 2/3 days.",
  ),
  qItem(
    "apt-tw-4",
    "aptitude",
    "Time & Work",
    "Hard",
    "A is twice as efficient as B and finishes a task 30 days earlier than B. If they work together, in how many days will the task be completed?",
    ["15 days", "20 days", "24 days", "30 days"],
    1,
    "Efficiency ratio A:B = 2:1, so time ratio is 1:2. Difference 2x − x = 30 ⇒ A takes 30 days, B takes 60 days. Together: 1/30 + 1/60 = 1/20 ⇒ 20 days.",
  ),

  // --- Speed & Distance ---
  qItem(
    "apt-sd-1",
    "aptitude",
    "Speed & Distance",
    "Easy",
    "A cyclist rides at 18 km/h. How much distance does the cyclist cover in 25 minutes?",
    ["6.5 km", "7.5 km", "8 km", "9 km"],
    1,
    "Time = 25/60 hours = 5/12 hours. Distance = 18 × (5/12) = 7.5 km.",
  ),
  qItem(
    "apt-sd-2",
    "aptitude",
    "Speed & Distance",
    "Medium",
    "A commuter drives from A to B at 40 km/h and returns at 60 km/h. What is the average speed for the entire round trip?",
    ["45 km/h", "48 km/h", "50 km/h", "52 km/h"],
    1,
    "Average speed for equal distances = 2xy/(x+y) = (2 × 40 × 60)/(40 + 60) = 4800/100 = 48 km/h.",
  ),
  qItem(
    "apt-sd-3",
    "aptitude",
    "Speed & Distance",
    "Medium",
    "Two trains 140 m and 160 m long run on parallel tracks in opposite directions at 54 km/h and 36 km/h. In how many seconds will they cross each other?",
    ["10 s", "12 s", "15 s", "18 s"],
    1,
    "Total distance = 140 + 160 = 300 m. Relative speed = (54 + 36) × 5/18 = 90 × 5/18 = 25 m/s. Time = 300 / 25 = 12 seconds.",
  ),
  qItem(
    "apt-sd-4",
    "aptitude",
    "Speed & Distance",
    "Hard",
    "Walking at 3/4 of his usual speed, a student reaches college 15 minutes late. What is his usual travel time?",
    ["30 min", "40 min", "45 min", "60 min"],
    2,
    "Since speed becomes 3/4, time becomes 4/3 of usual time T. (4/3 − 1)T = 15 ⇒ (1/3)T = 15 ⇒ T = 45 minutes.",
  ),

  // --- Averages ---
  qItem(
    "apt-avg-1",
    "aptitude",
    "Averages",
    "Easy",
    "Find the average of the first five prime numbers.",
    ["5.2", "5.4", "5.6", "5.8"],
    2,
    "First five prime numbers: 2, 3, 5, 7, 11. Sum = 28. Average = 28 / 5 = 5.6.",
  ),
  qItem(
    "apt-avg-2",
    "aptitude",
    "Averages",
    "Medium",
    "The average weight of 24 students is 52 kg. When the teacher's weight is included, the average rises by 1 kg. What is the teacher's weight?",
    ["75 kg", "76 kg", "77 kg", "78 kg"],
    2,
    "New total (25 people) = 25 × 53 = 1,325 kg. Previous total (24 students) = 24 × 52 = 1,248 kg. Teacher = 1,325 − 1,248 = 77 kg.",
  ),
  qItem(
    "apt-avg-3",
    "aptitude",
    "Averages",
    "Medium",
    "The average of 7 consecutive odd numbers is 27. What is the largest of these numbers?",
    ["31", "33", "35", "29"],
    1,
    "For 7 consecutive odd numbers, the middle (4th) number equals the average = 27. The next three odd numbers are 29, 31, and 33.",
  ),
  qItem(
    "apt-avg-4",
    "aptitude",
    "Averages",
    "Hard",
    "A batsman has a certain average in 11 innings. In the 12th inning he scores 90 runs, raising his average by 5 runs. What is his new average?",
    ["30", "35", "40", "45"],
    1,
    "Let old average = x. 11x + 90 = 12(x + 5) ⇒ 11x + 90 = 12x + 60 ⇒ x = 30. New average = 30 + 5 = 35.",
  ),

  // --- Probability ---
  qItem(
    "apt-prob-1",
    "aptitude",
    "Probability",
    "Easy",
    "A fair coin is tossed twice. What is the probability of getting at least one head?",
    ["1/4", "1/2", "3/4", "2/3"],
    2,
    "Sample space: {HH, HT, TH, TT}. Only TT has no heads. Probability = 1 − 1/4 = 3/4.",
  ),
  qItem(
    "apt-prob-2",
    "aptitude",
    "Probability",
    "Medium",
    "A bag contains 5 red, 4 blue, and 3 green balls. If one ball is drawn at random, what is the probability that it is neither red nor green?",
    ["1/3", "1/4", "5/12", "7/12"],
    0,
    "Total balls = 12. Neither red nor green means blue (4 balls). Probability = 4/12 = 1/3.",
  ),
  qItem(
    "apt-prob-3",
    "aptitude",
    "Probability",
    "Medium",
    "Two cards are drawn together from a standard 52-card deck. What is the probability that both are Kings?",
    ["1/221", "1/169", "1/26", "4/663"],
    0,
    "Favourable = C(4,2) = 6. Total = C(52,2) = (52 × 51)/2 = 1,326. Probability = 6 / 1326 = 1/221.",
  ),
  qItem(
    "apt-prob-4",
    "aptitude",
    "Probability",
    "Hard",
    "Problem-solving probability of A is 1/3 and of B is 1/4 independently. If both try the problem, what is the probability that the problem is solved?",
    ["1/2", "7/12", "5/12", "2/3"],
    0,
    "P(neither solves) = (1 − 1/3) × (1 − 1/4) = (2/3) × (3/4) = 1/2. Therefore, P(solved) = 1 − 1/2 = 1/2.",
  ),

  // ==========================================
  // B. LOGICAL REASONING (24 QUESTIONS)
  // Topics: Puzzles, Number Series, Coding-Decoding, Blood Relations, Directions, Syllogisms
  // Difficulties: Easy, Medium, Hard
  // ==========================================
  // --- Puzzles ---
  qItem(
    "log-puz-1",
    "logical",
    "Puzzles",
    "Easy",
    "Five friends P, Q, R, S, and T sit in a row facing North. R sits exactly in the middle. P sits at the extreme left and T sits at the extreme right. If Q is to the immediate left of R, who sits between R and T?",
    ["P", "Q", "S", "Cannot be determined"],
    2,
    "Order from left to right: P (1st), Q (2nd), R (3rd/middle), S (4th), T (5th). Thus S sits between R and T.",
  ),
  qItem(
    "log-puz-2",
    "logical",
    "Puzzles",
    "Medium",
    "Six colleagues A, B, C, D, E, and F sit around a circular table facing the center. A sits opposite D. B sits immediately to the right of A. F sits opposite B. C sits immediately to the left of D. Who sits immediately to the left of A?",
    ["C", "D", "E", "F"],
    2,
    "Facing the center, moving clockwise from A gives positions: A (1), E (2), F (3), D (4, opposite A), C (5, left of D), B (6, right of A and opposite F). Thus E sits immediately to the left of A.",
  ),
  qItem(
    "log-puz-3",
    "logical",
    "Puzzles",
    "Medium",
    "Four seminars (AI, Cloud, Security, DevOps) are scheduled Monday to Thursday, one per day. Cloud is immediately before AI. DevOps is scheduled on Wednesday. Security is not on Monday. Which seminar is on Tuesday?",
    ["AI", "Cloud", "DevOps", "Security"],
    0,
    "DevOps is on Wednesday. The only consecutive pair of free days left for Cloud immediately before AI is Monday–Tuesday (Mon = Cloud, Tue = AI), leaving Thursday for Security.",
  ),
  qItem(
    "log-puz-4",
    "logical",
    "Puzzles",
    "Hard",
    "Five boxes (Red, Blue, Green, Yellow, White) are stacked 1 (bottom) to 5 (top). Red is above Blue. Green is at position 3. Yellow is immediately below Green. White is not at the top. Which box is at the top (position 5)?",
    ["Red", "Blue", "Yellow", "White"],
    0,
    "Position 3 = Green. Yellow is immediately below Green ⇒ Position 2 = Yellow. White is not at 5 (top), so White is at 1 or 4. Since Red must be above Blue, Red cannot be 1 and Blue cannot be 5. If Red is at 5, Blue can be at 1 or 4 (with White taking the other). Could Blue or White be at 5? White cannot be 5; if Blue were 5, Red couldn't be above Blue. Hence Red MUST be at position 5 (top).",
  ),

  // --- Number Series ---
  qItem(
    "log-ns-1",
    "logical",
    "Number Series",
    "Easy",
    "Find the next term in the series: 5, 11, 17, 23, 29, ?",
    ["33", "35", "37", "39"],
    1,
    "Each term increases by a constant difference of +6: 29 + 6 = 35.",
  ),
  qItem(
    "log-ns-2",
    "logical",
    "Number Series",
    "Medium",
    "Find the missing number in the series: 3, 7, 15, 31, 63, ?",
    ["95", "125", "127", "129"],
    2,
    "Pattern is (previous × 2) + 1: 3×2+1=7, 7×2+1=15, 15×2+1=31, 31×2+1=63, 63×2+1 = 127.",
  ),
  qItem(
    "log-ns-3",
    "logical",
    "Number Series",
    "Medium",
    "Find the wrong number in the series: 4, 9, 19, 39, 78, 159",
    ["9", "19", "78", "159"],
    2,
    "Pattern is ×2 + 1: 4→9→19→39→79→159. Thus 78 is wrong (it should be 79).",
  ),
  qItem(
    "log-ns-4",
    "logical",
    "Number Series",
    "Hard",
    "Find the next number in the series: 2, 12, 36, 80, 150, ?",
    ["216", "242", "252", "288"],
    2,
    "nth term = n³ + n²: 1³+1²=2, 2³+2²=12, 3³+3²=36, 4³+4²=80, 5³+5²=150, 6³+6² = 216 + 36 = 252.",
  ),

  // --- Coding-Decoding ---
  qItem(
    "log-cd-1",
    "logical",
    "Coding-Decoding",
    "Easy",
    "In a certain code, 'CODE' is written as 'DPEF'. How is 'JAVA' written in that code?",
    ["KBWB", "KBWA", "JBWB", "KCWC"],
    0,
    "Each letter shifts forward by +1: J→K, A→B, V→W, A→B ⇒ KBWB.",
  ),
  qItem(
    "log-cd-2",
    "logical",
    "Coding-Decoding",
    "Medium",
    "If 'SYSTEM' is coded as 'SYSMET' and 'NEARER' as 'AENRER', how will 'FRACTION' be coded?",
    ["CARFTION", "CARFNOIT", "FRACNOIT", "NOITCARF"],
    1,
    "The word is split into two equal halves and each half is reversed: FRAC → CARF, TION → NOIT ⇒ CARFNOIT.",
  ),
  qItem(
    "log-cd-3",
    "logical",
    "Coding-Decoding",
    "Medium",
    "If 'WORK' is coded as 23-15-18-11 and 'JOB' as 10-15-2, how is 'CODE' coded?",
    ["3-15-4-5", "4-15-3-5", "3-14-4-5", "2-15-4-5"],
    0,
    "Each letter is replaced by its 1-based alphabetical position: C=3, O=15, D=4, E=5 ⇒ 3-15-4-5.",
  ),
  qItem(
    "log-cd-4",
    "logical",
    "Coding-Decoding",
    "Hard",
    "In a code language, '786' means 'study very hard', '958' means 'hard work pays', and '645' means 'study and work'. Which digit stands for 'very'?",
    ["6", "7", "8", "9"],
    1,
    "From '786' and '958', common word 'hard' = 8. From '786' and '645', common word 'study' = 6. Therefore in '786', remaining digit 7 stands for 'very'.",
  ),

  // --- Blood Relations ---
  qItem(
    "log-br-1",
    "logical",
    "Blood Relations",
    "Easy",
    "Pointing to a photograph, Ravi says, 'She is the daughter of my father's only son.' How is the girl in the photograph related to Ravi?",
    ["Sister", "Daughter", "Cousin", "Niece"],
    1,
    "Ravi's father's only son is Ravi himself. So the girl is Ravi's daughter.",
  ),
  qItem(
    "log-br-2",
    "logical",
    "Blood Relations",
    "Medium",
    "A is the brother of B. C is the father of A. D is the sister of E, and E is the daughter of B. Who is the uncle of D?",
    ["A", "C", "B", "E"],
    0,
    "D and E are sisters, both children of B. Since A is the brother of B, A is the uncle (maternal or paternal) of D.",
  ),
  qItem(
    "log-br-3",
    "logical",
    "Blood Relations",
    "Medium",
    "Introducing a man, Meera said, 'His mother is the only daughter of my mother.' How is Meera related to that man?",
    ["Aunt", "Sister", "Mother", "Grandmother"],
    2,
    "'The only daughter of my mother' refers to Meera herself. Therefore, Meera is the man's mother.",
  ),
  qItem(
    "log-br-4",
    "logical",
    "Blood Relations",
    "Hard",
    "If P + Q means P is the father of Q; P × Q means P is the brother of Q; P − Q means P is the mother of Q. Which expression means M is the maternal uncle of N?",
    ["M × R − N", "M + R − N", "M − R × N", "N × R − M"],
    0,
    "M × R means M is the brother of R. R − N means R is the mother of N. Thus M is the brother of N's mother, i.e., N's maternal uncle.",
  ),

  // --- Directions ---
  qItem(
    "log-dir-1",
    "logical",
    "Directions",
    "Easy",
    "Kiran walks 10 m North, then turns right and walks 15 m, then turns right again and walks 10 m. Which direction is Kiran from the starting point?",
    ["North", "South", "East", "West"],
    2,
    "10 m North and 10 m South cancel vertically; 15 m right from North is 15 m East of the start.",
  ),
  qItem(
    "log-dir-2",
    "logical",
    "Directions",
    "Medium",
    "A robot moves 6 km East, turns left and moves 8 km, then stops. What is the shortest distance from the starting point?",
    ["10 km", "12 km", "14 km", "8 km"],
    0,
    "6 km East and 8 km North form a right triangle. Shortest distance = √(6² + 8²) = √100 = 10 km.",
  ),
  qItem(
    "log-dir-3",
    "logical",
    "Directions",
    "Medium",
    "At sunrise, Amit and Deepak stand facing each other. If Deepak's shadow falls exactly to his left, which direction is Amit facing?",
    ["North", "South", "East", "West"],
    1,
    "At sunrise, sun is in the East so shadows point West. For West to be Deepak's left, Deepak must face North. Facing him, Amit faces South.",
  ),
  qItem(
    "log-dir-4",
    "logical",
    "Directions",
    "Hard",
    "A clock shows 4:30. If the minute hand points East, in which direction does the hour hand point?",
    ["North", "North-East", "South-East", "North-West"],
    1,
    "Normally at 4:30, the minute hand points South (180°) and the hour hand is at 135° (South-East, 45° counter-clockwise from South). Rotating South to East (−90° counter-clockwise) moves the hour hand 45° counter-clockwise from East, which is North-East.",
  ),

  // --- Syllogisms ---
  qItem(
    "log-syl-1",
    "logical",
    "Syllogisms",
    "Easy",
    "Statements: All laptops are computers. All computers are machines. Conclusion I: All laptops are machines. Conclusion II: Some machines are laptops.",
    ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"],
    2,
    "Laptops ⊂ Computers ⊂ Machines, so all laptops are machines (I follows) and some machines are laptops (II follows).",
  ),
  qItem(
    "log-syl-2",
    "logical",
    "Syllogisms",
    "Medium",
    "Statements: Some engineers are designers. No designer is lazy. Conclusion I: Some engineers are not lazy. Conclusion II: All engineers are lazy.",
    ["Only I follows", "Only II follows", "Both follow", "Either I or II follows"],
    0,
    "The engineers who are designers cannot be lazy, so some engineers are definitely not lazy (I follows; II contradicts I).",
  ),
  qItem(
    "log-syl-3",
    "logical",
    "Syllogisms",
    "Medium",
    "Statements: Some books are pens. No pen is a pencil. Conclusion I: Some books are pencils. Conclusion II: No book is a pencil.",
    ["Only I follows", "Only II follows", "Either I or II follows", "Both I and II follow"],
    2,
    "'Some A are B' and 'No A is B' form a complementary pair when no direct relation between books and pencils is forced; hence Either I or II follows.",
  ),
  qItem(
    "log-syl-4",
    "logical",
    "Syllogisms",
    "Hard",
    "Statements: Only a few servers are fast. All fast systems are cached. Conclusion I: Some servers are cached. Conclusion II: All servers being cached is a possibility.",
    ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"],
    2,
    "'Only a few servers are fast' implies some servers are fast (so some servers are cached ⇒ I follows) and some servers are not fast. Those non-fast servers can still independently be cached, so all servers being cached is a valid possibility (II follows).",
  ),

  // ==========================================
  // C. TECHNICAL ASSESSMENT (27 QUESTIONS)
  // Topics: C, C++, Java, Python, SQL, Data Structures & Algorithms, Operating Systems, DBMS, Computer Networks
  // ==========================================
  // --- C ---
  qItem(
    "tech-c-1",
    "technical",
    "C",
    "Easy",
    "What is the output of the following C code snippet?",
    ["10", "11", "12", "Compilation error"],
    2,
    "In `*p += 2`, `p` points to `x`, so `x` becomes 10 + 2 = 12.",
    `int x = 10;
int *p = &x;
*p += 2;
printf("%d", x);`,
  ),
  qItem(
    "tech-c-2",
    "technical",
    "C",
    "Medium",
    "What does `sizeof(arr)` return inside `func(int arr[])` on a 64-bit system?",
    ["20 bytes", "4 bytes", "8 bytes (size of int*)", "Depends on compiler only for values"],
    2,
    "When passed to a function, an array parameter decays to a pointer (`int *`). On a 64-bit system, `sizeof(int *)` is 8 bytes.",
  ),
  qItem(
    "tech-c-3",
    "technical",
    "C",
    "Hard",
    "What will be printed when `counter()` is called three times in C?",
    ["1 1 1", "1 2 3", "0 1 2", "Undefined behavior"],
    1,
    "A `static` local variable retains its value across function calls and is initialized only once to 0. Each call increments it: 1, then 2, then 3.",
    `int counter() {
  static int c = 0;
  return ++c;
}`,
  ),

  // --- C++ ---
  qItem(
    "tech-cpp-1",
    "technical",
    "C++",
    "Easy",
    "Which C++ keyword enables runtime polymorphism when overridden in a derived class?",
    ["inline", "static", "virtual", "explicit"],
    2,
    "Declaring a base-class member function `virtual` enables dynamic dispatch via the vtable at runtime.",
  ),
  qItem(
    "tech-cpp-2",
    "technical",
    "C++",
    "Medium",
    "What is the average-case lookup time complexity of `std::unordered_map` vs `std::map` in C++ STL?",
    ["O(1) vs O(log n)", "O(log n) vs O(1)", "O(n) vs O(log n)", "O(1) vs O(1)"],
    0,
    "`std::unordered_map` uses a hash table with O(1) average lookup, whereas `std::map` uses a balanced Red-Black Tree with O(log n) lookup.",
  ),
  qItem(
    "tech-cpp-3",
    "technical",
    "C++",
    "Hard",
    "Why should a polymorphic base class with virtual methods have a virtual destructor in C++?",
    [
      "To prevent multiple inheritance ambiguity",
      "To ensure derived-class destructors execute when deleting via a base pointer",
      "To make objects stack-only",
      "To disable move semantics",
    ],
    1,
    "Without a virtual destructor, `delete basePtr` pointing to a derived object invokes only the base destructor (undefined behavior / resource leak).",
  ),

  // --- Java ---
  qItem(
    "tech-java-1",
    "technical",
    "Java",
    "Easy",
    "Why is `String` immutable in Java?",
    [
      "It enables String Pool sharing, thread safety, and reliable HashMap keys",
      "Strings cannot store Unicode characters otherwise",
      "Java lacks heap memory allocation",
      "To prevent garbage collection of String objects",
    ],
    0,
    "String immutability allows safe String Intern Pool reuse, built-in thread safety, and cached hashCode values for HashMap/HashSet keys.",
  ),
  qItem(
    "tech-java-2",
    "technical",
    "Java",
    "Medium",
    "What is the difference between `==` and `.equals()` on Java `String` objects?",
    [
      "`==` compares content; `.equals()` compares memory references",
      "`==` compares object references; `.equals()` compares character sequences",
      "Both compare character sequences identically",
      "`.equals()` only works on primitive types",
    ],
    1,
    "`==` checks whether two references point to the exact same object in memory, while `String.equals()` compares actual characters.",
  ),
  qItem(
    "tech-java-3",
    "technical",
    "Java",
    "Hard",
    "In Java's `HashMap` (Java 8+), what happens to a bucket once the number of colliding entries exceeds `TREEIFY_THRESHOLD` (8) and capacity >= 64?",
    [
      "Throws ConcurrentModificationException",
      "Converts the bucket's linked list into a balanced Red-Black Tree",
      "Drops older entries automatically",
      "Falls back to linear probing",
    ],
    1,
    "Java 8 converts overloaded buckets from linked lists (O(n) worst case) into Red-Black Trees (O(log n) worst case).",
  ),

  // --- Python ---
  qItem(
    "tech-py-1",
    "technical",
    "Python",
    "Easy",
    "What does `print(len({1, 2, 2, 3}))` output in Python?",
    ["4", "3", "2", "TypeError"],
    1,
    "Curly braces with single elements create a `set`, which stores unique elements `{1, 2, 3}` of length 3.",
  ),
  qItem(
    "tech-py-2",
    "technical",
    "Python",
    "Medium",
    "What is the output of calling `add_item(1)` followed by `add_item(2)` in this Python code?",
    ["[1] then [2]", "[1] then [1, 2]", "[1, 2] then [1, 2]", "SyntaxError"],
    1,
    "Default mutable arguments (`lst=[]`) are evaluated once at function definition time, so subsequent calls mutate and return the same list.",
    `def add_item(val, lst=[]):
    lst.append(val)
    return lst

print(add_item(1))
print(add_item(2))`,
  ),
  qItem(
    "tech-py-3",
    "technical",
    "Python",
    "Hard",
    "What is the key advantage of a Python generator expression `(x*x for x in range(10**6))` over a list comprehension `[x*x for x in range(10**6)]`?",
    [
      "Generators automatically run on multiple CPU cores",
      "Generators yield values lazily using O(1) memory instead of storing all elements in RAM",
      "List comprehensions do not support filtering",
      "Generators allow random index slicing like gen[500]",
    ],
    1,
    "Generators compute elements on demand using O(1) auxiliary memory, avoiding allocating a million-element list upfront.",
  ),

  // --- SQL ---
  qItem(
    "tech-sql-1",
    "technical",
    "SQL",
    "Easy",
    "Which SQL clause is used to filter aggregated groups produced by `GROUP BY`?",
    ["WHERE", "HAVING", "ORDER BY", "DISTINCT"],
    1,
    "`WHERE` filters rows before grouping, whereas `HAVING` filters groups after `GROUP BY` and aggregate functions are computed.",
  ),
  qItem(
    "tech-sql-2",
    "technical",
    "SQL",
    "Medium",
    "What does a `LEFT JOIN` between `Students` (left) and `Placements` (right) return?",
    [
      "Only students who have matching rows in Placements",
      "All students, with NULLs in Placements columns where no match exists",
      "All rows from both tables regardless of match",
      "Only unmatched rows in Placements",
    ],
    1,
    "`LEFT JOIN` preserves every row from the left table (`Students`) and fills right-table columns with `NULL` when there is no match.",
  ),
  qItem(
    "tech-sql-3",
    "technical",
    "SQL",
    "Hard",
    "Which SQL query correctly returns the second-highest distinct salary from an `Employees` table?",
    [
      "SELECT MAX(salary) FROM Employees WHERE salary < (SELECT MAX(salary) FROM Employees);",
      "SELECT salary FROM Employees WHERE COUNT(salary) = 2;",
      "SELECT TOP 2 salary FROM Employees;",
      "SELECT MIN(salary) FROM Employees LIMIT 2;",
    ],
    0,
    "Finding the maximum salary strictly less than the global maximum reliably yields the second-highest distinct salary across SQL dialects.",
  ),

  // --- Data Structures & Algorithms ---
  qItem(
    "tech-dsa-1",
    "technical",
    "Data Structures & Algorithms",
    "Easy",
    "Which tree traversal of a Binary Search Tree (BST) produces node values in sorted ascending order?",
    ["Preorder", "Inorder", "Postorder", "Level-order"],
    1,
    "Inorder traversal visits Left subtree → Root → Right subtree, yielding keys in non-decreasing sorted order.",
  ),
  qItem(
    "tech-dsa-2",
    "technical",
    "Data Structures & Algorithms",
    "Medium",
    "What are the worst-case time complexities of Merge Sort and Quick Sort respectively?",
    [
      "O(n log n) and O(n²)",
      "O(n²) and O(n log n)",
      "O(n log n) and O(n log n)",
      "O(n) and O(n log n)",
    ],
    0,
    "Merge Sort guarantees O(n log n) in all cases; standard Quick Sort degrades to O(n²) on adversarial pivot choices.",
  ),
  qItem(
    "tech-dsa-3",
    "technical",
    "Data Structures & Algorithms",
    "Hard",
    "Which algorithm finds shortest paths in a directed graph with non-negative edge weights in O((V + E) log V) using a min-priority queue?",
    ["Bellman-Ford", "Floyd-Warshall", "Dijkstra's Algorithm", "Kruskal's Algorithm"],
    2,
    "Dijkstra's algorithm uses a greedy min-heap relaxation in O((V + E) log V) for non-negative edge weights.",
  ),

  // --- Operating Systems ---
  qItem(
    "tech-os-1",
    "technical",
    "Operating Systems",
    "Easy",
    "Which CPU scheduling algorithm minimizes average waiting time when exact burst times are known?",
    ["First-Come First-Served (FCFS)", "Shortest Job First (SJF)", "Round Robin", "FIFO"],
    1,
    "SJF (and its preemptive version SRTF) is provably optimal for minimizing average waiting time.",
  ),
  qItem(
    "tech-os-2",
    "technical",
    "Operating Systems",
    "Medium",
    "Which of the following is NOT one of the four Coffman conditions required for a deadlock?",
    ["Mutual Exclusion", "Hold and Wait", "Circular Wait", "Preemption"],
    3,
    "The four necessary conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. 'Preemption' prevents deadlock rather than causing it.",
  ),
  qItem(
    "tech-os-3",
    "technical",
    "Operating Systems",
    "Hard",
    "What is Belady's Anomaly in OS page replacement?",
    [
      "Allocating more page frames increases the number of page faults in FIFO",
      "Thrashing caused by too few processes in ready queue",
      "TLB hit ratio dropping when page size doubles",
      "Deadlock between swapper and dispatcher",
    ],
    0,
    "Belady's Anomaly occurs in FIFO page replacement (not stack-based LRU/Optimal) when adding memory frames paradoxically increases page faults.",
  ),

  // --- DBMS ---
  qItem(
    "tech-dbms-1",
    "technical",
    "DBMS",
    "Easy",
    "In ACID properties of database transactions, what does 'Atomicity' guarantee?",
    [
      "Either all operations of a transaction succeed or none take effect",
      "Concurrent transactions never see intermediate states",
      "Committed data survives power loss",
      "Foreign keys remain valid",
    ],
    0,
    "Atomicity is the all-or-nothing guarantee: partial failures are rolled back completely.",
  ),
  qItem(
    "tech-dbms-2",
    "technical",
    "DBMS",
    "Medium",
    "When is a relation in Boyce-Codd Normal Form (BCNF)?",
    [
      "When it has no multivalued dependencies",
      "When for every non-trivial functional dependency X → Y, X is a superkey",
      "When all attributes are atomic",
      "When it has only one candidate key",
    ],
    1,
    "BCNF strictly requires the determinant X of every non-trivial functional dependency X → Y to be a superkey.",
  ),
  qItem(
    "tech-dbms-3",
    "technical",
    "DBMS",
    "Hard",
    "Why do relational databases prefer B+ Trees over B-Trees for disk-based indexes?",
    [
      "B+ Trees store data pointers only in leaf nodes, increasing fan-out and enabling fast sequential range scans via linked leaves",
      "B+ Trees always require O(1) disk I/O",
      "B-Trees cannot handle duplicate keys or integer columns",
      "B+ Trees do not need balancing on insertion",
    ],
    0,
    "Keeping only keys and child pointers in internal nodes boosts branching factor (shallower tree), and linked leaf nodes make range queries sequential.",
  ),

  // --- Computer Networks ---
  qItem(
    "tech-cn-1",
    "technical",
    "Computer Networks",
    "Easy",
    "Which transport-layer protocol provides reliable, ordered, byte-stream delivery?",
    ["UDP", "ICMP", "TCP", "ARP"],
    2,
    "TCP provides connection-oriented, reliable, ordered delivery using acknowledgments, sequence numbers, and retransmissions.",
  ),
  qItem(
    "tech-cn-2",
    "technical",
    "Computer Networks",
    "Medium",
    "In a /26 IPv4 subnet mask (`255.255.255.192`), how many usable host IP addresses are available?",
    ["64", "62", "30", "126"],
    1,
    "A /26 subnet leaves 32 − 26 = 6 host bits ⇒ 2⁶ − 2 = 64 − 2 = 62 usable host addresses (subtracting network and broadcast addresses).",
  ),
  qItem(
    "tech-cn-3",
    "technical",
    "Computer Networks",
    "Hard",
    "During TCP congestion control, how does Congestion Avoidance differ from Slow Start?",
    [
      "Slow Start increases cwnd exponentially per RTT; Congestion Avoidance increases cwnd linearly (~1 MSS per RTT)",
      "Slow Start drops cwnd to zero on every ACK",
      "Congestion Avoidance disables flow control rwnd",
      "Slow Start runs only after FIN packet is sent",
    ],
    0,
    "Slow Start doubles cwnd every RTT until reaching ssthresh, after which Congestion Avoidance grows cwnd additively (+1 MSS per RTT).",
  ),

  // ==========================================
  // D. CORE CS QUIZ (18 ADDITIONAL TOPIC-WISE QUESTIONS)
  // Topics: Operating Systems, DBMS, Computer Networks, Data Structures & Algorithms, OOP & System Design
  // Levels: Beginner (Easy), Intermediate (Medium), Advanced (Hard)
  // ==========================================
  // --- Operating Systems ---
  qItem(
    "cs-os-1",
    "core-cs",
    "Operating Systems",
    "Easy",
    "What is the primary difference between a process and a thread?",
    [
      "Threads within the same process share code, data, and heap memory; processes have separate address spaces",
      "Processes cannot be scheduled by the OS kernel",
      "Threads each own an isolated virtual address space",
      "Context switching between processes is faster than between threads",
    ],
    0,
    "Threads share the parent process's address space, file descriptors, and heap while maintaining private stacks and registers.",
  ),
  qItem(
    "cs-os-2",
    "core-cs",
    "Operating Systems",
    "Medium",
    "A system with 4KB pages uses a 32-bit virtual address. How many bits are used for the page offset?",
    ["10 bits", "12 bits", "16 bits", "20 bits"],
    1,
    "Page size = 4 KB = 4096 bytes = 2¹² bytes, so the page offset takes 12 bits.",
  ),
  qItem(
    "cs-os-3",
    "core-cs",
    "Operating Systems",
    "Hard",
    "If TLB hit time is 10 ns, main memory access time is 100 ns, and TLB hit ratio is 90% (single-level page table), what is the Effective Memory Access Time (EMAT)?",
    ["110 ns", "120 ns", "130 ns", "190 ns"],
    1,
    "EMAT = 0.90 × (10 + 100) + 0.10 × (10 + 100 + 100) = 99 + 21 = 120 ns.",
  ),

  // --- DBMS ---
  qItem(
    "cs-dbms-1",
    "core-cs",
    "DBMS",
    "Easy",
    "Which key uniquely identifies each tuple in a relational table and cannot contain NULL values?",
    ["Foreign Key", "Primary Key", "Super Key", "Alternate Key"],
    1,
    "Entity integrity guarantees that a Primary Key uniquely identifies every row and never contains NULL.",
  ),
  qItem(
    "cs-dbms-2",
    "core-cs",
    "DBMS",
    "Medium",
    "What isolation anomaly happens when Transaction T1 reads a row modified by T2, and T2 subsequently rolls back?",
    ["Phantom Read", "Dirty Read", "Lost Update", "Non-Repeatable Read"],
    1,
    "Reading uncommitted data from another transaction that later aborts is a Dirty Read, prevented by Read Committed and higher levels.",
  ),
  qItem(
    "cs-dbms-3",
    "core-cs",
    "DBMS",
    "Hard",
    "In Strict Two-Phase Locking (Strict 2PL), when are exclusive (X) locks released?",
    [
      "As soon as the write operation finishes",
      "Only after the transaction commits or aborts",
      "Right before the growing phase begins",
      "Whenever a deadlock detector wakes up",
    ],
    1,
    "Strict 2PL holds all exclusive locks until commit/abort, preventing cascading rollbacks and ensuring recoverable strict schedules.",
  ),

  // --- Computer Networks ---
  qItem(
    "cs-cn-1",
    "core-cs",
    "Computer Networks",
    "Easy",
    "At which OSI layer does an Ethernet Switch primarily operate using MAC addresses?",
    [
      "Physical Layer (Layer 1)",
      "Data Link Layer (Layer 2)",
      "Network Layer (Layer 3)",
      "Transport Layer (Layer 4)",
    ],
    1,
    "Layer-2 switches inspect Ethernet frame MAC addresses to forward frames within a LAN.",
  ),
  qItem(
    "cs-cn-2",
    "core-cs",
    "Computer Networks",
    "Medium",
    "What is the exact sequence of flags exchanged during a TCP Three-Way Handshake?",
    ["SYN → ACK → FIN", "SYN → SYN-ACK → ACK", "ACK → SYN → SYN-ACK", "FIN → ACK → RST"],
    1,
    "Client sends SYN, server replies SYN-ACK, and client confirms with ACK to establish the full-duplex connection.",
  ),
  qItem(
    "cs-cn-3",
    "core-cs",
    "Computer Networks",
    "Hard",
    "Which HTTP status code specifically indicates an idempotent/permanent redirect that preserves the original HTTP method (e.g. POST stays POST)?",
    ["301 Moved Permanently", "302 Found", "304 Not Modified", "308 Permanent Redirect"],
    3,
    "HTTP 308 mandates a permanent redirect without altering the HTTP request method or body (unlike 301/302 which may rewrite POST to GET).",
  ),

  // --- Data Structures & Algorithms ---
  qItem(
    "cs-dsa-1",
    "core-cs",
    "Data Structures & Algorithms",
    "Easy",
    "Which data structure is best suited for Breadth-First Search (BFS) on a graph?",
    ["Stack", "Queue", "Min-Heap", "Disjoint Set"],
    1,
    "BFS explores vertices level by level in FIFO order, which requires a Queue.",
  ),
  qItem(
    "cs-dsa-2",
    "core-cs",
    "Data Structures & Algorithms",
    "Medium",
    "What is the time complexity of building a binary heap from an unsorted array of n elements using bottom-up heapify?",
    ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    1,
    "Floyd's bottom-up build-heap runs in linear O(n) time because most nodes are near the bottom with small subtree heights.",
  ),
  qItem(
    "cs-dsa-3",
    "core-cs",
    "Data Structures & Algorithms",
    "Hard",
    "What is the amortized time complexity per operation of Disjoint Set Union (Union-Find) with both Path Compression and Union by Rank?",
    ["O(log n)", "O(α(n)) — inverse Ackermann", "O(√n)", "O(log* n) worst only"],
    1,
    "Combining Union by Rank/Size and Path Compression achieves O(α(n)) amortized time per operation, effectively constant for all practical inputs.",
  ),

  // --- OOP & System Design ---
  qItem(
    "cs-oop-1",
    "core-cs",
    "OOP & System Design",
    "Easy",
    "Which SOLID principle states that classes should be open for extension but closed for modification?",
    [
      "Single Responsibility Principle",
      "Open/Closed Principle",
      "Liskov Substitution Principle",
      "Dependency Inversion Principle",
    ],
    1,
    "The Open/Closed Principle (O in SOLID) encourages adding new behavior via abstractions/extensions without altering stable existing code.",
  ),
  qItem(
    "cs-oop-2",
    "core-cs",
    "OOP & System Design",
    "Medium",
    "In distributed systems (CAP Theorem), when a network partition occurs, a data store must choose between:",
    [
      "Caching and Indexing",
      "Consistency and Availability",
      "Normalization and Sharding",
      "Latency and Throughput",
    ],
    1,
    "Under a network partition (P), a distributed system must trade off strict Consistency (CP) versus Availability (AP).",
  ),
  qItem(
    "cs-oop-3",
    "core-cs",
    "OOP & System Design",
    "Hard",
    "Why is Consistent Hashing used in distributed caches (like Redis clusters) instead of `hash(key) % N`?",
    [
      "It encrypts cache keys with SHA-256",
      "Adding or removing a node only remaps ~K/N keys rather than invalidating nearly all cached keys",
      "It eliminates network partitions completely",
      "It guarantees O(1) disk persistence",
    ],
    1,
    "Consistent hashing maps nodes and keys onto a ring so scaling nodes redistributes only a minimal fraction (K/N) of keys.",
  ),
];

// ==========================================
// 3. FILTERING, PERSISTENCE & PERFORMANCE ANALYTICS
// ==========================================
const LEGACY_KEY = "cp_assessment_results";
const HISTORY_KEY = "cp_assessment_history_v2";

export function difficultyToSkillTier(d: DifficultyLevel): SkillTier {
  if (d === "Easy") return "Beginner";
  if (d === "Medium") return "Intermediate";
  return "Advanced";
}

export function skillTierToDifficulty(tier: SkillTier): DifficultyLevel {
  if (tier === "Beginner") return "Easy";
  if (tier === "Intermediate") return "Medium";
  return "Hard";
}

export function getQuestionsByCategory(
  category: AssessmentCategory,
  topic = "all",
  difficulty: DifficultyLevel | "all" = "all",
): AssessmentQuestion[] {
  return assessmentQuestionBank.filter((q) => {
    if (q.category !== category) return false;
    if (topic !== "all" && q.topic !== topic) return false;
    if (difficulty !== "all" && q.difficulty !== difficulty) return false;
    return true;
  });
}

export function getResults(): AssessmentResult[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AssessmentResult =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
    );
  } catch {
    return [];
  }
}

export function saveResult(r: AssessmentResult) {
  if (typeof window === "undefined") return;
  try {
    const existing = getResults();
    // Avoid duplicating exact same timestamp + assessmentId save
    const filtered = existing.filter(
      (item) => !(item.assessmentId === r.assessmentId && item.takenAt === r.takenAt),
    );
    localStorage.setItem(LEGACY_KEY, JSON.stringify([r, ...filtered]));
  } catch {
    // ignore
  }
}

export function saveAssessmentAttempt(record: AssessmentAttemptRecord) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRawAssessmentAttempts();
    // Prevent duplicate submission of same attempt ID
    if (existing.some((item) => item.id === record.id)) return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify([record, ...existing]));
  } catch {
    // ignore
  }
}

function getRawAssessmentAttempts(): AssessmentAttemptRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AssessmentAttemptRecord =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
    );
  } catch {
    return [];
  }
}

function convertLegacyResultToAttempt(r: AssessmentResult, index: number): AssessmentAttemptRecord {
  const incorrect = Math.max(0, r.attempted - r.score);
  const topicBreakdown: AssessmentAttemptRecord["topicBreakdown"] = {};

  if (r.assessmentId === "quant-mock-4" && Array.isArray(r.answers)) {
    quantMock4.questions.forEach((q, idx) => {
      const entry = (topicBreakdown[q.topic] ??= { correct: 0, attempted: 0, total: 0 });
      entry.total += 1;
      const ans = r.answers[idx];
      if (ans !== null && ans !== undefined) {
        entry.attempted += 1;
        if (ans === q.answer) {
          entry.correct += 1;
        }
      }
    });
  } else {
    for (const [topic, stats] of Object.entries(r.topicBreakdown || {})) {
      topicBreakdown[topic] = {
        correct: stats.correct,
        attempted: stats.total,
        total: stats.total,
      };
    }
  }

  return {
    id: `legacy-${r.assessmentId}-${r.takenAt}-${index}`,
    assessmentId: r.assessmentId,
    category: "quant-mock",
    title: r.title,
    takenAt: r.takenAt,
    score: r.score,
    incorrect,
    unanswered: r.unanswered,
    attempted: r.attempted,
    total: r.total,
    scorePct: r.total > 0 ? Math.round((r.score / r.total) * 100) : 0,
    accuracyPct: r.attempted > 0 ? Math.round((r.score / r.attempted) * 100) : 0,
    timeTakenSec: r.timeTakenSec,
    topicBreakdown,
  };
}

export function getAssessmentHistory(): AssessmentAttemptRecord[] {
  const v2 = getRawAssessmentAttempts();
  const legacy = getResults().map((r, i) => convertLegacyResultToAttempt(r, i));
  return [...v2, ...legacy].sort(
    (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime(),
  );
}

export function clearAssessmentHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}

export function pickAdaptiveDifficulty(
  accuracy: number,
  attempted: number,
): { difficulty: DifficultyLevel; tier: SkillTier; reason: string } {
  if (attempted === 0) {
    return {
      difficulty: "Easy",
      tier: "Beginner",
      reason:
        "No assessments completed yet — starting at Beginner / Easy to establish your baseline.",
    };
  }
  if (accuracy >= 80) {
    return {
      difficulty: "Hard",
      tier: "Advanced",
      reason: `High accuracy (${accuracy}%) across ${attempted} questions — leveled up to Hard / Advanced challenges.`,
    };
  }
  if (accuracy >= 55) {
    return {
      difficulty: "Medium",
      tier: "Intermediate",
      reason: `Solid progress (${accuracy}% accuracy) — calibrated to Medium / Intermediate questions to build consistency.`,
    };
  }
  return {
    difficulty: "Easy",
    tier: "Beginner",
    reason: `Current accuracy is ${accuracy}% — adjusted to Easy / Beginner fundamentals to strengthen core accuracy first.`,
  };
}

function inferCategoryForTopic(topic: string): AssessmentCategory | "quant-mock" {
  const match = assessmentQuestionBank.find((q) => q.topic === topic);
  if (match) return match.category;
  return "quant-mock";
}

export function buildAttemptRecord(params: {
  id: string;
  assessmentId: string;
  category: AssessmentCategory | "recommended" | "quant-mock";
  title: string;
  topicFilter?: string;
  difficultyFilter?: string;
  questions: AssessmentQuestion[];
  answers: Record<string, number | undefined>;
  timeTakenSec: number;
}): AssessmentAttemptRecord {
  const {
    id,
    assessmentId,
    category,
    title,
    topicFilter,
    difficultyFilter,
    questions,
    answers,
    timeTakenSec,
  } = params;

  let score = 0;
  let attempted = 0;
  const topicBreakdown: AssessmentAttemptRecord["topicBreakdown"] = {};
  const questionDetails: QuestionAttemptDetail[] = [];

  for (const q of questions) {
    const t = (topicBreakdown[q.topic] ??= { correct: 0, attempted: 0, total: 0 });
    t.total += 1;
    const selected = answers[q.id];
    const isAnswered = selected !== undefined && selected !== null;
    const isCorrect = isAnswered && selected === q.answer;
    if (isAnswered) {
      attempted += 1;
      t.attempted += 1;
    }
    if (isCorrect) {
      score += 1;
      t.correct += 1;
    }
    questionDetails.push({
      questionId: q.id,
      topic: q.topic,
      category: q.category,
      difficulty: q.difficulty,
      selectedIndex: isAnswered ? selected : null,
      correctIndex: q.answer,
      isCorrect,
    });
  }

  const total = questions.length;
  const incorrect = Math.max(0, attempted - score);
  const unanswered = Math.max(0, total - attempted);
  const scorePct = total > 0 ? Math.round((score / total) * 100) : 0;
  const accuracyPct = attempted > 0 ? Math.round((score / attempted) * 100) : 0;

  const record: AssessmentAttemptRecord = {
    id,
    assessmentId,
    category,
    title,
    takenAt: new Date().toISOString(),
    score,
    incorrect,
    unanswered,
    attempted,
    total,
    scorePct,
    accuracyPct,
    timeTakenSec: Math.max(1, timeTakenSec),
    topicBreakdown,
    questionDetails,
  };
  if (topicFilter !== undefined) record.topicFilter = topicFilter;
  if (difficultyFilter !== undefined) record.difficultyFilter = difficultyFilter;
  return record;
}

export function buildRecommendedPracticeSet(
  weaknesses: TopicPerformanceStat[],
  adaptiveDifficulty: DifficultyLevel,
  limit = 8,
): AssessmentQuestion[] {
  const weakTopics = weaknesses.map((w) => w.topic);
  const diffRank = (d: DifficultyLevel) => {
    if (d === adaptiveDifficulty) return 0;
    if (d === "Medium") return 1;
    return 2;
  };

  if (weakTopics.length > 0) {
    const weakPool = assessmentQuestionBank
      .filter((q) => weakTopics.includes(q.topic))
      .sort((a, b) => {
        const wa = weakTopics.indexOf(a.topic);
        const wb = weakTopics.indexOf(b.topic);
        if (wa !== wb) return wa - wb;
        return diffRank(a.difficulty) - diffRank(b.difficulty);
      });

    if (weakPool.length >= limit) {
      return weakPool.slice(0, limit);
    }

    // Pad with adaptive-difficulty questions from unattempted/core topics
    const usedIds = new Set(weakPool.map((q) => q.id));
    const extras = assessmentQuestionBank
      .filter((q) => !usedIds.has(q.id))
      .sort((a, b) => diffRank(a.difficulty) - diffRank(b.difficulty));
    return [...weakPool, ...extras].slice(0, limit);
  }

  // If no weak topics recorded yet, pick a balanced starter set across all 4 categories at adaptiveDifficulty
  const perCategory: AssessmentQuestion[] = [];
  const categories: AssessmentCategory[] = ["aptitude", "logical", "technical", "core-cs"];
  for (const cat of categories) {
    const catQs = assessmentQuestionBank
      .filter((q) => q.category === cat)
      .sort((a, b) => diffRank(a.difficulty) - diffRank(b.difficulty));
    perCategory.push(...catQs.slice(0, 2));
  }
  return perCategory.slice(0, limit);
}

export function generateDailyPracticeTasks(
  weaknesses: TopicPerformanceStat[],
  byCategory: Record<AssessmentCategory, CategoryPerformanceStat>,
  adaptiveDifficulty: DifficultyLevel,
): GeneratedDailyTask[] {
  const tasks: GeneratedDailyTask[] = [];

  // 1. Prioritize top 2 weak topics from actual user attempts
  weaknesses.slice(0, 2).forEach((w, idx) => {
    const targetDiff: DifficultyLevel =
      w.accuracy < 45 ? "Easy" : w.accuracy < 70 ? "Medium" : adaptiveDifficulty;
    const cat = w.category === "quant-mock" ? "aptitude" : w.category;
    tasks.push({
      id: `rec-weak-${idx}-${w.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: `Strengthen ${w.topic} (${w.accuracy}% accuracy)`,
      description: `Targeted ${targetDiff}-level drill to raise accuracy above 75% (currently ${w.correct}/${w.attempted} correct).`,
      category: cat,
      topic: w.topic,
      difficulty: targetDiff,
      estimatedMinutes: 12,
      priority: "High",
    });
  });

  // 2. Surface unattempted categories so the user gets balanced placement coverage
  const unattemptedCats = (Object.values(byCategory) as CategoryPerformanceStat[]).filter(
    (c) => c.attempted === 0,
  );

  for (const cat of unattemptedCats) {
    if (tasks.length >= 4) break;
    const catMeta = ASSESSMENT_CATEGORIES.find((c) => c.id === cat.category);
    const defaultTopic = catMeta?.topics[0] ?? "all";
    tasks.push({
      id: `rec-diag-${cat.category}`,
      title: `Start ${cat.label} Diagnostic`,
      description: `Attempt ${cat.recommendedDifficulty}-level ${defaultTopic} & mixed questions to benchmark your baseline.`,
      category: cat.category,
      topic: "all",
      difficulty: cat.recommendedDifficulty,
      estimatedMinutes: 15,
      priority: "Medium",
    });
  }

  // 3. Always include an adaptive mixed sprint if fewer than 3 tasks exist
  if (tasks.length < 3) {
    tasks.push({
      id: `rec-adaptive-${adaptiveDifficulty.toLowerCase()}`,
      title: `Adaptive ${adaptiveDifficulty} Mixed Placement Drill`,
      description: `Calibrated ${adaptiveDifficulty}-difficulty set mixing Aptitude, Logical Reasoning, Technical, and Core CS.`,
      category: "recommended",
      topic: "all",
      difficulty: adaptiveDifficulty,
      estimatedMinutes: 15,
      priority: "Normal",
    });
  }

  return tasks;
}

export function getPerformanceAnalytics(): PerformanceAnalytics {
  const history = getAssessmentHistory();

  let totalQuestionsAttempted = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let scorePctSum = 0;

  const categoryAcc: Record<
    AssessmentCategory,
    {
      label: string;
      assessmentsCount: number;
      attempted: number;
      correct: number;
      incorrect: number;
    }
  > = {
    aptitude: {
      label: "Aptitude Practice",
      assessmentsCount: 0,
      attempted: 0,
      correct: 0,
      incorrect: 0,
    },
    logical: {
      label: "Logical Reasoning",
      assessmentsCount: 0,
      attempted: 0,
      correct: 0,
      incorrect: 0,
    },
    technical: {
      label: "Technical Assessment",
      assessmentsCount: 0,
      attempted: 0,
      correct: 0,
      incorrect: 0,
    },
    "core-cs": {
      label: "Core CS Quiz",
      assessmentsCount: 0,
      attempted: 0,
      correct: 0,
      incorrect: 0,
    },
  };

  const topicMap = new Map<
    string,
    {
      topic: string;
      category: AssessmentCategory | "quant-mock";
      correct: number;
      attempted: number;
      total: number;
    }
  >();

  for (const record of history) {
    const attempted = typeof record.attempted === "number" ? record.attempted : 0;
    const score = typeof record.score === "number" ? record.score : 0;
    const incorrect = typeof record.incorrect === "number" ? record.incorrect : 0;
    const scorePct = typeof record.scorePct === "number" ? record.scorePct : 0;

    totalQuestionsAttempted += attempted;
    totalCorrect += score;
    totalIncorrect += incorrect;
    scorePctSum += scorePct;

    // Map quant-mock into aptitude category tracking as well
    if (record.category === "quant-mock") {
      categoryAcc.aptitude.assessmentsCount += 1;
      categoryAcc.aptitude.attempted += attempted;
      categoryAcc.aptitude.correct += score;
      categoryAcc.aptitude.incorrect += incorrect;
    } else if (
      record.category === "recommended" &&
      Array.isArray(record.questionDetails) &&
      record.questionDetails.length
    ) {
      // Attribute recommended questions to their respective real categories
      const touchedCats = new Set<AssessmentCategory>();
      for (const detail of record.questionDetails) {
        if (detail && detail.selectedIndex !== null && categoryAcc[detail.category]) {
          touchedCats.add(detail.category);
          categoryAcc[detail.category].attempted += 1;
          if (detail.isCorrect) categoryAcc[detail.category].correct += 1;
          else categoryAcc[detail.category].incorrect += 1;
        }
      }
      touchedCats.forEach((cat) => {
        categoryAcc[cat].assessmentsCount += 1;
      });
    } else if (record.category !== "recommended" && categoryAcc[record.category]) {
      categoryAcc[record.category].assessmentsCount += 1;
      categoryAcc[record.category].attempted += attempted;
      categoryAcc[record.category].correct += score;
      categoryAcc[record.category].incorrect += incorrect;
    }

    for (const [topic, stats] of Object.entries(record.topicBreakdown || {})) {
      if (!stats || stats.attempted <= 0) continue;
      const existing = topicMap.get(topic);
      const inferredCategory =
        record.category === "recommended" || record.category === "quant-mock"
          ? inferCategoryForTopic(topic)
          : record.category;

      if (existing) {
        existing.correct += stats.correct;
        existing.attempted += stats.attempted;
        existing.total += stats.total;
      } else {
        topicMap.set(topic, {
          topic,
          category: inferredCategory,
          correct: stats.correct,
          attempted: stats.attempted,
          total: stats.total,
        });
      }
    }
  }

  const overallAccuracy =
    totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0;
  const averageScorePct = history.length > 0 ? Math.round(scorePctSum / history.length) : 0;

  const byCategory = {} as Record<AssessmentCategory, CategoryPerformanceStat>;
  (Object.keys(categoryAcc) as AssessmentCategory[]).forEach((cat) => {
    const raw = categoryAcc[cat];
    const accuracy = raw.attempted > 0 ? Math.round((raw.correct / raw.attempted) * 100) : 0;
    const adaptive = pickAdaptiveDifficulty(accuracy, raw.attempted);
    byCategory[cat] = {
      category: cat,
      label: raw.label,
      assessmentsCount: raw.assessmentsCount,
      attempted: raw.attempted,
      correct: raw.correct,
      incorrect: raw.incorrect,
      accuracy,
      recommendedDifficulty: adaptive.difficulty,
      recommendedTier: adaptive.tier,
    };
  });

  const topicStats: TopicPerformanceStat[] = Array.from(topicMap.values())
    .map((t) => {
      const incorrect = Math.max(0, t.attempted - t.correct);
      const accuracy = t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0;
      const status: TopicPerformanceStat["status"] =
        accuracy >= 75 ? "strong" : accuracy >= 60 ? "moderate" : "weak";
      return {
        topic: t.topic,
        category: t.category,
        correct: t.correct,
        incorrect,
        attempted: t.attempted,
        total: t.total,
        accuracy,
        status,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  const strengths = [...topicStats]
    .filter((t) => t.status === "strong")
    .sort((a, b) => b.accuracy - a.accuracy);
  const weaknesses = topicStats.filter((t) => t.status === "weak");

  const adaptiveOverall = pickAdaptiveDifficulty(overallAccuracy, totalQuestionsAttempted);
  const recommendedQuestions = buildRecommendedPracticeSet(
    weaknesses,
    adaptiveOverall.difficulty,
    8,
  );
  const dailyPracticeTasks = generateDailyPracticeTasks(
    weaknesses,
    byCategory,
    adaptiveOverall.difficulty,
  );

  return {
    totalAssessments: history.length,
    totalQuestionsAttempted,
    totalCorrect,
    totalIncorrect,
    overallAccuracy,
    averageScorePct,
    byCategory,
    topicStats,
    strengths,
    weaknesses,
    adaptiveDifficulty: adaptiveOverall.difficulty,
    adaptiveTier: adaptiveOverall.tier,
    adaptiveReason: adaptiveOverall.reason,
    recommendedQuestions,
    dailyPracticeTasks,
    history,
  };
}
