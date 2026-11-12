// Assessment content + results store. Results are saved on this device for now;
// swap saveResult/getResults for database calls later (used by AI Analysis & Roadmap).
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

const B = "Beginner" as const,
  I = "Intermediate" as const;

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

const KEY = "cp_assessment_results";

export function getResults(): AssessmentResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveResult(r: AssessmentResult) {
  localStorage.setItem(KEY, JSON.stringify([r, ...getResults()]));
}
