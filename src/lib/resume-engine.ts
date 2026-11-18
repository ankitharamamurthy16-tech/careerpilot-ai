import type { Student } from "./auth";

export type ResumeTemplate = "classic" | "modern" | "compact" | "modern-pro" | "tech-dev";

export const ATS_SCORE_DISCLAIMER =
  "Estimated ATS Compatibility Score: Calculated from resume structure, keywords, and formatting heuristics. This estimate does NOT represent the result of any specific employer's proprietary ATS system.";

export interface ResumePersonal {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface ResumeEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  grade: string;
  coursework: string;
}

export interface ResumeProject {
  id: string;
  title: string;
  tech: string;
  duration: string;
  link: string;
  bullets: string[];
}

export interface ResumeInternship {
  id: string;
  role: string;
  company: string;
  location: string;
  duration: string;
  bullets: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl: string;
}

export interface ResumeAchievement {
  id: string;
  title: string;
  date: string;
  detail: string;
}

export interface ResumeData {
  personal: ResumePersonal;
  careerObjective: string;
  summary: string;
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  internships: ResumeInternship[];
  certifications: ResumeCertification[];
  achievements: ResumeAchievement[];
}

export interface StoredResumeState {
  data: ResumeData;
  template: ResumeTemplate;
  lastSavedAt: string;
}

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function createEmptyResume(student?: Student | null): ResumeData {
  return {
    personal: {
      fullName: student?.name ?? "",
      headline: "",
      email: student?.email ?? "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    careerObjective: "",
    summary: "",
    education: student?.college
      ? [
          {
            id: createId("edu"),
            degree: student.branch ? `B.E. / B.Tech in ${student.branch}` : "",
            institution: student.college,
            location: "",
            startYear: "",
            endYear: student.year ?? "",
            grade: "",
            coursework: "",
          },
        ]
      : [],
    skills: [],
    projects: [],
    internships: [],
    certifications: [],
    achievements: [],
  };
}

export function createStarterResume(student?: Student | null): ResumeData {
  const name = student?.name || "Aarav Sharma";
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "student";
  const branch = student?.branch || "Computer Science & Engineering";
  const college = student?.college || "RV College of Engineering";
  const year = student?.year || "2026";

  return {
    personal: {
      fullName: name,
      headline: `${branch} Undergraduate | Full-Stack Software Developer`,
      email: student?.email || "aarav@student.edu",
      phone: "+91 98765 43210",
      location: "Bengaluru, India",
      linkedin: `linkedin.com/in/${slug}`,
      github: `github.com/${slug}`,
      portfolio: "",
    },
    careerObjective:
      "Seeking a Software Development Engineer role where I can apply full-stack web engineering, data structures, and backend performance tuning to build reliable user-facing products.",
    summary:
      "Pre-final year Computer Science undergraduate with hands-on experience in Full-Stack Web Development (React, TypeScript, Node.js), Data Structures & Algorithms, and caching systems. Built scalable student assessment and distributed backend projects with measurable latency and throughput gains.",
    education: [
      {
        id: "edu-1",
        degree: `B.E. in ${branch}`,
        institution: college,
        location: "Bengaluru, India",
        startYear: "2022",
        endYear: year,
        grade: "CGPA: 8.7 / 10",
        coursework: "Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks",
      },
    ],
    skills: [
      "Python",
      "Java",
      "C++",
      "React.js",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
      "Docker",
      "RESTful APIs",
    ],
    projects: [
      {
        id: "proj-1",
        title: "Placement Preparation & Assessment Platform",
        tech: "React, TypeScript, Tailwind CSS, Vite",
        duration: "Jan 2025 – Mar 2025",
        link: `github.com/${slug}/careerpilot`,
        bullets: [
          "Architected a responsive mobile-first web app serving 500+ student assessment simulations with real-time analytics.",
          "Engineered algorithmic speech cadence tracker evaluating words-per-minute (WPM) and STAR interview structure.",
          "Reduced initial bundle load time by 42% utilizing code-splitting and dynamic imports.",
        ],
      },
      {
        id: "proj-2",
        title: "Distributed File Cache & URL Shortener",
        tech: "Go, Redis, Docker, PostgreSQL",
        duration: "Aug 2024 – Nov 2024",
        link: `github.com/${slug}/url-cache`,
        bullets: [
          "Constructed high-throughput URL shortening service handling 10,000+ simulated requests per second.",
          "Implemented Redis LRU cache cluster achieving a 91% cache hit ratio for frequently accessed URLs.",
        ],
      },
    ],
    internships: [
      {
        id: "intern-1",
        role: "Software Engineering Intern",
        company: "FinStack Labs",
        location: "Bengaluru, India",
        duration: "May 2024 – Jul 2024",
        bullets: [
          "Built REST API endpoints in Node.js and PostgreSQL for transaction history filtering across 120k+ test records.",
          "Added automated unit and integration tests, improving module test coverage from 54% to 86%.",
        ],
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        date: "2024",
        credentialUrl: "",
      },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "Smart India Hackathon Finalist",
        date: "2024",
        detail:
          "Selected among top 5 teams out of 180+ entries for building an accessible student placement analytics dashboard.",
      },
    ],
  };
}

// ==========================================
// STORAGE & AUTO-SAVE
// ==========================================
const RESUME_STORAGE_PREFIX = "cp_resume_builder_v2_";

function getResumeStorageKey(email?: string | null): string {
  const normalized = (email || "guest").toLowerCase().trim();
  return `${RESUME_STORAGE_PREFIX}${normalized}`;
}

export function hasCustomSavedResume(email?: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(getResumeStorageKey(email));
    if (raw) return true;
    return loadResumeHistory(email).length > 0;
  } catch {
    return false;
  }
}

export function loadSavedResume(student?: Student | null): StoredResumeState {
  const fallback: StoredResumeState = {
    data: createStarterResume(student),
    template: "classic",
    lastSavedAt: new Date().toISOString(),
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(getResumeStorageKey(student?.email));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredResumeState>;
    if (!parsed || !parsed.data) return fallback;

    const d = parsed.data;
    return {
      data: {
        personal: {
          fullName: d.personal?.fullName ?? "",
          headline: d.personal?.headline ?? "",
          email: d.personal?.email ?? "",
          phone: d.personal?.phone ?? "",
          location: d.personal?.location ?? "",
          linkedin: d.personal?.linkedin ?? "",
          github: d.personal?.github ?? "",
          portfolio: d.personal?.portfolio ?? "",
        },
        careerObjective: d.careerObjective ?? "",
        summary: d.summary ?? "",
        education: Array.isArray(d.education) ? d.education : [],
        skills: Array.isArray(d.skills) ? d.skills : [],
        projects: Array.isArray(d.projects) ? d.projects : [],
        internships: Array.isArray(d.internships) ? d.internships : [],
        certifications: Array.isArray(d.certifications) ? d.certifications : [],
        achievements: Array.isArray(d.achievements) ? d.achievements : [],
      },
      template:
        parsed.template === "modern" ||
        parsed.template === "compact" ||
        parsed.template === "modern-pro" ||
        parsed.template === "tech-dev"
          ? parsed.template
          : "classic",
      lastSavedAt: parsed.lastSavedAt ?? new Date().toISOString(),
    };
  } catch {
    return fallback;
  }
}

export function saveResumeToStorage(
  data: ResumeData,
  template: ResumeTemplate,
  email?: string | null,
): string {
  const savedAt = new Date().toISOString();
  if (typeof window === "undefined") return savedAt;
  try {
    const payload: StoredResumeState = { data, template, lastSavedAt: savedAt };
    localStorage.setItem(getResumeStorageKey(email), JSON.stringify(payload));
  } catch {
    // ignore storage quota errors
  }
  return savedAt;
}

// ==========================================
// 1. RESUME COMPLETION PROGRESS (SEPARATE FROM ATS)
// ==========================================
export interface CompletionSectionStatus {
  id: string;
  label: string;
  completed: boolean;
}

export interface ResumeCompletionResult {
  percentage: number;
  completedCount: number;
  totalSections: number;
  sections: CompletionSectionStatus[];
  incompleteLabels: string[];
}

export function calculateResumeCompletion(resume: ResumeData): ResumeCompletionResult {
  const hasPersonal =
    resume.personal.fullName.trim().length > 0 &&
    resume.personal.email.trim().length > 0 &&
    resume.personal.phone.trim().length > 0;
  const hasObjective = resume.careerObjective.trim().length > 0;
  const hasSummary = resume.summary.trim().length > 0;
  const hasEducation = resume.education.some(
    (e) => e.degree.trim().length > 0 && e.institution.trim().length > 0,
  );
  const hasSkills = resume.skills.some((s) => s.trim().length > 0);
  const hasProjects = resume.projects.some((p) => p.title.trim().length > 0);
  const hasInternships = resume.internships.some(
    (i) => i.role.trim().length > 0 && i.company.trim().length > 0,
  );
  const hasCertifications = resume.certifications.some((c) => c.name.trim().length > 0);
  const hasAchievements = resume.achievements.some(
    (a) => a.title.trim().length > 0 || a.detail.trim().length > 0,
  );

  const sections: CompletionSectionStatus[] = [
    { id: "personal", label: "Personal Details", completed: hasPersonal },
    { id: "objective", label: "Career Objective", completed: hasObjective },
    { id: "summary", label: "Professional Summary", completed: hasSummary },
    { id: "education", label: "Education", completed: hasEducation },
    { id: "skills", label: "Skills", completed: hasSkills },
    { id: "projects", label: "Projects", completed: hasProjects },
    { id: "internships", label: "Internships", completed: hasInternships },
    { id: "certifications", label: "Certifications", completed: hasCertifications },
    { id: "achievements", label: "Achievements", completed: hasAchievements },
  ];

  const completedCount = sections.filter((s) => s.completed).length;
  const totalSections = sections.length;
  const percentage = Math.round((completedCount / totalSections) * 100);

  return {
    percentage,
    completedCount,
    totalSections,
    sections,
    incompleteLabels: sections.filter((s) => !s.completed).map((s) => s.label),
  };
}

// ==========================================
// 2. ATS ANALYSIS ENGINE (CONTENT-BASED, EXPLAINABLE)
// ==========================================
export interface AtsDeduction {
  id: string;
  category: string;
  points: number;
  reason: string;
  suggestion: string;
}

export interface AtsCategoryBreakdown {
  category: string;
  earned: number;
  max: number;
}

export interface AtsAnalysisResult {
  score: number;
  totalDeducted: number;
  grade: "Strong" | "Good" | "Fair" | "Needs Improvement";
  deductions: AtsDeduction[];
  missingSections: string[];
  foundKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  categories: AtsCategoryBreakdown[];
  scoreExplanation: string;
  disclaimer: string;
}

const STRONG_ACTION_VERBS = [
  "achieved",
  "architected",
  "automated",
  "built",
  "collaborated",
  "constructed",
  "created",
  "decreased",
  "delivered",
  "deployed",
  "designed",
  "developed",
  "engineered",
  "enhanced",
  "established",
  "evaluated",
  "executed",
  "implemented",
  "improved",
  "increased",
  "integrated",
  "launched",
  "led",
  "optimized",
  "orchestrated",
  "reduced",
  "refactored",
  "resolved",
  "scaled",
  "streamlined",
  "tested",
];

function getDomainRecommendedKeywords(resume: ResumeData): string[] {
  const corpus = [
    resume.personal.headline,
    resume.careerObjective,
    resume.summary,
    resume.education.map((e) => `${e.degree} ${e.coursework}`).join(" "),
    resume.skills.join(" "),
    resume.projects.map((p) => `${p.title} ${p.tech} ${p.bullets.join(" ")}`).join(" "),
    resume.internships.map((i) => `${i.role} ${i.bullets.join(" ")}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const keywords = new Set<string>(["Git", "Data Structures", "Algorithms", "Problem Solving"]);

  if (
    /\b(react|vue|angular|frontend|front-end|tailwind|css|html|javascript|typescript|ui|ux|vite|next)\b/.test(
      corpus,
    )
  ) {
    [
      "TypeScript",
      "JavaScript",
      "HTML/CSS",
      "Responsive Design",
      "RESTful APIs",
      "Unit Testing",
    ].forEach((k) => keywords.add(k));
  }
  if (
    /\b(node|express|go|golang|java|spring|backend|back-end|api|microservice|server|django|flask|fastapi)\b/.test(
      corpus,
    )
  ) {
    [
      "RESTful APIs",
      "SQL",
      "PostgreSQL",
      "Authentication",
      "Docker",
      "System Design",
      "Testing",
    ].forEach((k) => keywords.add(k));
  }
  if (
    /\b(python|machine learning|ml|ai|data|pandas|numpy|tensorflow|pytorch|analytics|sql|tableau|power bi)\b/.test(
      corpus,
    )
  ) {
    ["Python", "SQL", "Data Analysis", "Pandas", "Machine Learning", "Statistics"].forEach((k) =>
      keywords.add(k),
    );
  }
  if (/\b(cloud|aws|gcp|azure|docker|kubernetes|ci\/cd|devops|linux|redis|cache)\b/.test(corpus)) {
    ["Docker", "CI/CD", "Cloud Computing", "Linux", "Caching"].forEach((k) => keywords.add(k));
  }

  return Array.from(keywords);
}

export function analyzeResumeATS(resume: ResumeData): AtsAnalysisResult {
  const deductions: AtsDeduction[] = [];
  const missingSections: string[] = [];

  // --- 1. Resume Structure (15 pts) ---
  let structureEarned = 0;
  if (resume.personal.fullName.trim().length >= 2) {
    structureEarned += 3;
  } else {
    deductions.push({
      id: "ded-name",
      category: "Resume Structure",
      points: 3,
      reason: "Full name is missing from the resume header.",
      suggestion:
        "Add your full name in Personal Details so recruiters and ATS parsers can index your profile.",
    });
  }

  const emailTrimmed = resume.personal.email.trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  if (isValidEmail) {
    structureEarned += 4;
  } else if (emailTrimmed.length > 0) {
    structureEarned += 2;
    deductions.push({
      id: "ded-email-fmt",
      category: "Resume Structure",
      points: 2,
      reason: "Email address format appears invalid.",
      suggestion: "Enter a valid professional email address (e.g., name@domain.com).",
    });
  } else {
    deductions.push({
      id: "ded-email",
      category: "Resume Structure",
      points: 4,
      reason: "Email address is missing.",
      suggestion: "Provide a reachable email address in Personal Details.",
    });
  }

  const phoneDigits = resume.personal.phone.replace(/\D/g, "");
  if (phoneDigits.length >= 7) {
    structureEarned += 3;
  } else {
    deductions.push({
      id: "ded-phone",
      category: "Resume Structure",
      points: 3,
      reason: "Valid phone number is missing.",
      suggestion: "Add a contact phone number with at least 7–10 digits.",
    });
  }

  if (resume.personal.linkedin.trim().length > 0) {
    structureEarned += 3;
  } else {
    deductions.push({
      id: "ded-linkedin",
      category: "Resume Structure",
      points: 3,
      reason: "LinkedIn profile link is missing.",
      suggestion: "Include your LinkedIn profile URL to improve recruiter verification.",
    });
  }

  if (resume.personal.github.trim().length > 0 || resume.personal.portfolio.trim().length > 0) {
    structureEarned += 2;
  } else {
    deductions.push({
      id: "ded-github",
      category: "Resume Structure",
      points: 2,
      reason: "GitHub or portfolio link is missing.",
      suggestion: "Add a GitHub or portfolio link so reviewers can inspect your work.",
    });
  }

  if (!resume.personal.fullName.trim() || !emailTrimmed || phoneDigits.length < 7) {
    missingSections.push("Complete Personal Details");
  }

  // --- 2. Educational Details (15 pts) ---
  let educationEarned = 0;
  const validEducation = resume.education.filter(
    (e) => e.degree.trim().length > 0 && e.institution.trim().length > 0,
  );
  const partialEducation = resume.education.filter(
    (e) => e.degree.trim().length > 0 || e.institution.trim().length > 0,
  );

  if (validEducation.length > 0) {
    educationEarned += 10;
    const hasYear = validEducation.some(
      (e) => e.endYear.trim().length > 0 || e.startYear.trim().length > 0,
    );
    const hasGradeOrCourses = validEducation.some(
      (e) => e.grade.trim().length > 0 || e.coursework.trim().length > 0,
    );
    if (hasYear && hasGradeOrCourses) {
      educationEarned += 5;
    } else if (hasYear || hasGradeOrCourses) {
      educationEarned += 3;
      deductions.push({
        id: "ded-edu-details",
        category: "Educational Details",
        points: 2,
        reason: hasYear
          ? "Education entry is missing GPA/percentage or relevant coursework."
          : "Education entry is missing graduation/study years.",
        suggestion: "Add graduation year and GPA or relevant coursework to your education entry.",
      });
    } else {
      deductions.push({
        id: "ded-edu-meta",
        category: "Educational Details",
        points: 5,
        reason: "Education entry lacks study dates, GPA, and relevant coursework.",
        suggestion:
          "Include study dates, grade/CGPA, and relevant subjects in your education section.",
      });
    }
  } else if (partialEducation.length > 0) {
    educationEarned += 5;
    deductions.push({
      id: "ded-edu-incomplete",
      category: "Educational Details",
      points: 10,
      reason: "Education entry is missing either the degree name or institution.",
      suggestion: "Fill in both degree and institution name along with graduation year.",
    });
  } else {
    missingSections.push("Education");
    deductions.push({
      id: "ded-edu-missing",
      category: "Educational Details",
      points: 15,
      reason: "Education section is empty.",
      suggestion:
        "Add at least one education entry with your degree, institution, and graduation year.",
    });
  }

  // --- 3. Technical Skills (15 pts) ---
  let skillsEarned = 0;
  const rawNonEmptySkills = resume.skills.map((s) => s.trim()).filter((s) => s.length > 0);
  const uniqueSkills = Array.from(new Set(rawNonEmptySkills));
  const hasDuplicateSkills =
    new Set(rawNonEmptySkills.map((s) => s.toLowerCase())).size < rawNonEmptySkills.length;

  if (uniqueSkills.length >= 8) {
    skillsEarned += 12;
  } else if (uniqueSkills.length >= 5) {
    skillsEarned += 8;
    deductions.push({
      id: "ded-skills-mid",
      category: "Technical Skills",
      points: 4,
      reason: `Only ${uniqueSkills.length} skills listed (ATS benchmarks recommend 8+ relevant keywords).`,
      suggestion: "Add more verified technical skills or tools you used in your projects.",
    });
  } else if (uniqueSkills.length >= 1) {
    skillsEarned += 4;
    deductions.push({
      id: "ded-skills-low",
      category: "Technical Skills",
      points: 8,
      reason: `Only ${uniqueSkills.length} skill(s) listed, reducing keyword match coverage.`,
      suggestion: "List at least 8 relevant languages, frameworks, and tools you know.",
    });
  } else {
    missingSections.push("Skills");
    deductions.push({
      id: "ded-skills-missing",
      category: "Technical Skills",
      points: 12,
      reason: "Technical skills section is empty.",
      suggestion:
        "Add your core programming languages, frameworks, and tools in the Skills section.",
    });
  }

  if (uniqueSkills.length === 0) {
    deductions.push({
      id: "ded-skills-org-empty",
      category: "Technical Skills",
      points: 3,
      reason: "No skills organized for ATS skill-tag indexing.",
      suggestion: "Add categorized technical skills (languages, frameworks, databases, tools).",
    });
  } else if (hasDuplicateSkills) {
    skillsEarned += 1;
    deductions.push({
      id: "ded-skills-dup",
      category: "Technical Skills",
      points: 2,
      reason: "Duplicate entries found in your Technical Skills list.",
      suggestion: "Remove duplicate skills so each skill appears clearly once.",
    });
  } else {
    skillsEarned += 3;
  }

  // --- 4. Keyword Relevance (10 pts) ---
  let keywordEarned = 0;
  const resumeTextLower = [
    resume.personal.headline,
    resume.careerObjective,
    resume.summary,
    resume.skills.join(" "),
    resume.education.map((e) => `${e.degree} ${e.coursework}`).join(" "),
    resume.projects.map((p) => `${p.title} ${p.tech} ${p.bullets.join(" ")}`).join(" "),
    resume.internships.map((i) => `${i.role} ${i.company} ${i.bullets.join(" ")}`).join(" "),
    resume.certifications.map((c) => `${c.name} ${c.issuer}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const recommendedKeywords = getDomainRecommendedKeywords(resume);
  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of recommendedKeywords) {
    const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const variants = kw === "HTML/CSS" ? ["html", "css"] : [escaped];
    const matched = variants.some((v) => resumeTextLower.includes(v));
    if (matched) {
      foundKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const contextCorpus = [
    resume.summary,
    resume.projects.map((p) => `${p.title} ${p.tech} ${p.bullets.join(" ")}`).join(" "),
    resume.internships.map((i) => `${i.role} ${i.bullets.join(" ")}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const alignedSkillsCount = uniqueSkills.filter((skill) =>
    contextCorpus.includes(skill.toLowerCase().replace(/\.js$/i, "")),
  ).length;

  const keywordCoverageRatio =
    recommendedKeywords.length > 0 ? foundKeywords.length / recommendedKeywords.length : 0;

  if (uniqueSkills.length === 0 && contextCorpus.trim().length === 0) {
    deductions.push({
      id: "ded-kw-align-0",
      category: "Keyword Relevance",
      points: 10,
      reason: "No skills or project context present to match role keywords.",
      suggestion: "Add skills and substantiate them in your project and experience descriptions.",
    });
  } else if (alignedSkillsCount >= 3 && keywordCoverageRatio >= 0.5) {
    keywordEarned += 10;
  } else if (alignedSkillsCount >= 1 || keywordCoverageRatio >= 0.3) {
    keywordEarned += 5;
    deductions.push({
      id: "ded-kw-align-partial",
      category: "Keyword Relevance",
      points: 5,
      reason: `Partial keyword alignment (${foundKeywords.length}/${recommendedKeywords.length} domain keywords matched; ${alignedSkillsCount} skills evidenced in projects/internships).`,
      suggestion:
        missingKeywords.length > 0
          ? `Where true to your experience, incorporate relevant keywords such as: ${missingKeywords.slice(0, 4).join(", ")}.`
          : "Reference your listed skills directly inside project and internship bullet points.",
    });
  } else {
    keywordEarned += 2;
    deductions.push({
      id: "ded-kw-align-none",
      category: "Keyword Relevance",
      points: 8,
      reason: "Listed skills are not substantiated in project or internship descriptions.",
      suggestion: "Mention how you applied your listed skills within projects or internships.",
    });
  }

  // --- 5. Project Descriptions (15 pts) ---
  let projectsEarned = 0;
  const projectsWithTitle = resume.projects.filter((p) => p.title.trim().length > 0);
  const projectsWithBullets = projectsWithTitle.filter((p) =>
    p.bullets.some((b) => b.trim().length >= 10),
  );

  if (projectsWithBullets.length >= 2) {
    projectsEarned += 10;
  } else if (projectsWithBullets.length === 1) {
    projectsEarned += 6;
    deductions.push({
      id: "ded-proj-1",
      category: "Project Descriptions",
      points: 4,
      reason:
        "Only 1 project with detailed bullet points (2+ projects recommended for candidates).",
      suggestion: "Add a second project with clear technical stack and bullet points.",
    });
  } else if (projectsWithTitle.length >= 1) {
    projectsEarned += 3;
    deductions.push({
      id: "ded-proj-nobullets",
      category: "Project Descriptions",
      points: 7,
      reason: "Project entry lacks descriptive bullet points explaining what you built.",
      suggestion:
        "Add 2–3 bullet points per project detailing architecture, technologies, and results.",
    });
  } else {
    missingSections.push("Projects");
    deductions.push({
      id: "ded-proj-missing",
      category: "Project Descriptions",
      points: 10,
      reason: "Projects section is empty.",
      suggestion: "Add at least 2 projects showing practical implementation of your skills.",
    });
  }

  const allBullets = [
    ...resume.projects.flatMap((p) => p.bullets),
    ...resume.internships.flatMap((i) => i.bullets),
  ]
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const actionVerbBullets = allBullets.filter((b) => {
    const firstWord =
      b
        .toLowerCase()
        .split(/\s+/)[0]
        ?.replace(/[^a-z]/g, "") ?? "";
    return STRONG_ACTION_VERBS.includes(firstWord);
  });

  if (allBullets.length > 0 && actionVerbBullets.length / allBullets.length >= 0.6) {
    projectsEarned += 5;
  } else if (actionVerbBullets.length >= 1) {
    projectsEarned += 2;
    deductions.push({
      id: "ded-verbs-partial",
      category: "Project Descriptions",
      points: 3,
      reason: `Only ${actionVerbBullets.length} of ${allBullets.length} bullet points start with strong action verbs.`,
      suggestion:
        "Use Improve My Resume or the Grammar Assistant to start bullets with strong action verbs like Built or Engineered.",
    });
  } else {
    deductions.push({
      id: "ded-verbs-none",
      category: "Project Descriptions",
      points: 5,
      reason: "Project/internship bullets lack strong action verbs.",
      suggestion: "Begin each bullet with an active verb describing your contribution.",
    });
  }

  // --- 6. Experience, Outcomes & Credentials (15 pts) ---
  let experienceEarned = 0;
  const validInternships = resume.internships.filter(
    (i) => i.role.trim().length > 0 && i.company.trim().length > 0,
  );
  const internshipsWithBullets = validInternships.filter((i) =>
    i.bullets.some((b) => b.trim().length >= 10),
  );
  if (internshipsWithBullets.length >= 1) {
    experienceEarned += 5;
  } else if (validInternships.length >= 1) {
    experienceEarned += 2;
    deductions.push({
      id: "ded-intern-nobullets",
      category: "Experience",
      points: 3,
      reason: "Internship/work entry has no descriptive bullet points.",
      suggestion:
        "Add bullet points explaining your contributions and technologies used during your experience.",
    });
  } else {
    missingSections.push("Internships");
    deductions.push({
      id: "ded-intern-missing",
      category: "Experience",
      points: 5,
      reason: "No internship or practical work experience listed.",
      suggestion: "Add any internships, industrial training, or work experience if applicable.",
    });
  }

  const metricRegex =
    /(\d+%|\d+\s*(x|ms|s|sec|seconds|users|records|requests|teams?|mb|kb|gb)|\d+\+)/i;
  const allImpactLines = [...allBullets, ...resume.achievements.map((a) => a.detail)].filter(
    (t) => t.trim().length > 0,
  );
  const quantifiedCount = allImpactLines.filter((line) => metricRegex.test(line)).length;

  if (quantifiedCount >= 2) {
    experienceEarned += 4;
  } else if (quantifiedCount === 1) {
    experienceEarned += 2;
    deductions.push({
      id: "ded-metrics-one",
      category: "Experience",
      points: 2,
      reason: "Only 1 bullet point includes a measurable metric or scale figure.",
      suggestion:
        "Add real measurable figures (e.g., latency, dataset size, test coverage) to another bullet where known.",
    });
  } else {
    deductions.push({
      id: "ded-metrics-none",
      category: "Experience",
      points: 4,
      reason: "No quantified metrics or measurable outcomes found in bullets.",
      suggestion:
        "Where accurate, add real numbers such as users served, performance gains, or dataset size.",
    });
  }

  const validCerts = resume.certifications.filter((c) => c.name.trim().length > 0);
  if (validCerts.length >= 1) {
    experienceEarned += 3;
  } else {
    missingSections.push("Certifications");
    deductions.push({
      id: "ded-certs-missing",
      category: "Experience",
      points: 3,
      reason: "No certifications listed.",
      suggestion: "Add verified technical courses or certifications you have completed.",
    });
  }

  const validAchievements = resume.achievements.filter(
    (a) => a.title.trim().length > 0 || a.detail.trim().length > 0,
  );
  if (validAchievements.length >= 1) {
    experienceEarned += 3;
  } else {
    missingSections.push("Achievements");
    deductions.push({
      id: "ded-ach-missing",
      category: "Experience",
      points: 3,
      reason: "No achievements, hackathons, or awards listed.",
      suggestion:
        "Include academic honors, hackathon rankings, or coding contest achievements if you have them.",
    });
  }

  // --- 7. Readability & Formatting (15 pts) ---
  let readabilityEarned = 0;
  const summaryWords = resume.summary.trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 20) {
    readabilityEarned += 7;
  } else if (summaryWords >= 8) {
    readabilityEarned += 4;
    deductions.push({
      id: "ded-summary-short",
      category: "Readability & Formatting",
      points: 3,
      reason: `Professional summary is too brief (${summaryWords} words; recommended 20+ words).`,
      suggestion:
        "Expand your professional summary with your degree, core skills, and key project focus.",
    });
  } else {
    missingSections.push("Professional Summary");
    deductions.push({
      id: "ded-summary-missing",
      category: "Readability & Formatting",
      points: 7,
      reason: "Professional summary is missing or incomplete.",
      suggestion:
        "Write or generate a 2–3 sentence professional summary grounded in your skills and projects.",
    });
  }

  const objectiveWords = resume.careerObjective.trim().split(/\s+/).filter(Boolean).length;
  if (objectiveWords >= 8) {
    readabilityEarned += 4;
  } else if (objectiveWords >= 1) {
    readabilityEarned += 2;
    deductions.push({
      id: "ded-obj-short",
      category: "Readability & Formatting",
      points: 2,
      reason: `Career objective is too brief (${objectiveWords} words).`,
      suggestion: "Clarify your target role and what value you bring in your Career Objective.",
    });
  } else {
    missingSections.push("Career Objective");
    deductions.push({
      id: "ded-obj-missing",
      category: "Readability & Formatting",
      points: 4,
      reason: "Career objective is missing.",
      suggestion: "Add a concise Career Objective stating your target role and technical focus.",
    });
  }

  const totalTextWords = [
    resume.summary,
    resume.careerObjective,
    ...allBullets,
    ...resume.achievements.map((a) => `${a.title} ${a.detail}`),
  ]
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const spellingHits = detectSpellingMistakes(resume);
  const formattingHits = detectFormattingIssues(resume);

  if (totalTextWords < 12) {
    deductions.push({
      id: "ded-readability-empty",
      category: "Readability & Formatting",
      points: 4,
      reason: "Insufficient written content to validate readability, spelling, and formatting.",
      suggestion: "Add summary and project bullet points so ATS readability can be scored.",
    });
  } else if (spellingHits.length === 0 && formattingHits.length === 0) {
    readabilityEarned += 4;
  } else {
    const penalty = Math.min(4, spellingHits.length + formattingHits.length);
    const earned = Math.max(0, 4 - penalty);
    readabilityEarned += earned;
    deductions.push({
      id: "ded-readability-issues",
      category: "Readability & Formatting",
      points: 4 - earned,
      reason: `Detected ${spellingHits.length} spelling issue(s) and ${formattingHits.length} formatting issue(s).`,
      suggestion:
        "Use 'Improve My Resume' to automatically resolve spelling and formatting issues.",
    });
  }

  const categories: AtsCategoryBreakdown[] = [
    { category: "Resume Structure", earned: structureEarned, max: 15 },
    { category: "Keyword Relevance", earned: keywordEarned, max: 10 },
    { category: "Technical Skills", earned: skillsEarned, max: 15 },
    { category: "Educational Details", earned: educationEarned, max: 15 },
    { category: "Project Descriptions", earned: projectsEarned, max: 15 },
    { category: "Experience", earned: experienceEarned, max: 15 },
    { category: "Readability & Formatting", earned: readabilityEarned, max: 15 },
  ];

  const score = categories.reduce((sum, c) => sum + c.earned, 0);
  const totalDeducted = 100 - score;

  let grade: AtsAnalysisResult["grade"] = "Needs Improvement";
  if (score >= 85) grade = "Strong";
  else if (score >= 70) grade = "Good";
  else if (score >= 50) grade = "Fair";

  const sortedDeductions = [...deductions].sort((a, b) => b.points - a.points);
  const suggestions = sortedDeductions.map((d) => `${d.suggestion} (+${d.points} pts)`);

  const scoreExplanation = `Your estimated ATS compatibility score (${score}/100) is the sum of 7 weighted dimensions: ${categories
    .map((c) => `${c.category} (${c.earned}/${c.max})`)
    .join(", ")}.`;

  return {
    score,
    totalDeducted,
    grade,
    deductions: sortedDeductions,
    missingSections,
    foundKeywords,
    missingKeywords,
    suggestions,
    categories,
    scoreExplanation,
    disclaimer: ATS_SCORE_DISCLAIMER,
  };
}

// ==========================================
// 3. AI RESUME ASSISTANT (STRICTLY GROUNDED — NO FABRICATION)
// ==========================================
export type SummaryStyle = "technical" | "concise" | "graduate";

export interface GeneratedSummaryResult {
  summary: string;
  usedSources: string[];
  missingHints: string[];
}

export function generateProfessionalSummary(
  resume: ResumeData,
  style: SummaryStyle = "technical",
): GeneratedSummaryResult {
  const usedSources: string[] = [];
  const missingHints: string[] = [];

  const primaryEdu = resume.education.find(
    (e) => e.degree.trim().length > 0 || e.institution.trim().length > 0,
  );
  const validSkills = resume.skills.map((s) => s.trim()).filter(Boolean);
  const validProjects = resume.projects.filter((p) => p.title.trim().length > 0);
  const validInternships = resume.internships.filter(
    (i) => i.role.trim().length > 0 && i.company.trim().length > 0,
  );
  const validCerts = resume.certifications.filter((c) => c.name.trim().length > 0);
  const validAchievements = resume.achievements.filter((a) => a.title.trim().length > 0);

  if (!primaryEdu)
    missingHints.push("Add an Education entry to include your degree and institution.");
  if (validSkills.length === 0) missingHints.push("Add Technical Skills to highlight your stack.");
  if (validProjects.length === 0 && validInternships.length === 0) {
    missingHints.push("Add at least one Project or Internship so the summary can cite real work.");
  }

  const parts: string[] = [];

  // Opening grounded strictly in education or headline
  if (primaryEdu) {
    const degreePart = primaryEdu.degree.trim() || "Undergraduate student";
    const instPart = primaryEdu.institution.trim() ? ` at ${primaryEdu.institution.trim()}` : "";
    const gradPart = primaryEdu.endYear.trim() ? ` (${primaryEdu.endYear.trim()})` : "";
    usedSources.push("Education");

    if (style === "concise") {
      parts.push(`${degreePart}${instPart}${gradPart}.`);
    } else {
      parts.push(`${degreePart} candidate${instPart}${gradPart}`);
    }
  } else if (resume.personal.headline.trim()) {
    usedSources.push("Headline");
    parts.push(resume.personal.headline.trim().replace(/\.$/, ""));
  } else {
    parts.push("Motivated candidate");
  }

  // Skills clause (only user-entered skills)
  if (validSkills.length > 0) {
    usedSources.push("Skills");
    const topSkills = validSkills.slice(0, style === "concise" ? 5 : 7).join(", ");
    if (style === "concise") {
      parts.push(`Skilled in ${topSkills}.`);
    } else {
      parts[0] = `${parts[0]} with practical proficiency in ${topSkills}.`;
    }
  } else if (style !== "concise") {
    parts[0] = `${parts[0]}.`;
  }

  // Internship clause (strictly user's real role & company)
  if (validInternships.length > 0) {
    usedSources.push("Internships");
    const firstIntern = validInternships[0]!;
    parts.push(
      `Gained hands-on industry experience as ${firstIntern.role.trim()} at ${firstIntern.company.trim()}.`,
    );
  }

  // Project clause (strictly user's real project titles)
  if (validProjects.length > 0 && style !== "concise") {
    usedSources.push("Projects");
    const projectNames = validProjects
      .slice(0, 2)
      .map((p) => p.title.trim())
      .join(" and ");
    parts.push(`Developed real-world solutions including ${projectNames}.`);
  }

  // Certification / achievement mention only if entered
  if (style === "graduate" && (validCerts.length > 0 || validAchievements.length > 0)) {
    const extras: string[] = [];
    if (validCerts.length > 0) {
      usedSources.push("Certifications");
      extras.push(validCerts[0]!.name.trim());
    }
    if (validAchievements.length > 0) {
      usedSources.push("Achievements");
      extras.push(validAchievements[0]!.title.trim());
    }
    parts.push(`Recognized for ${extras.join(" and ")}.`);
  }

  // Objective alignment if present
  if (resume.careerObjective.trim().length > 10 && style !== "concise") {
    usedSources.push("Career Objective");
    const objClean = resume.careerObjective
      .trim()
      .replace(/^seeking\s+/i, "Targeting ")
      .replace(/\.$/, "");
    parts.push(`${objClean.charAt(0).toUpperCase()}${objClean.slice(1)}.`);
  }

  return {
    summary: parts.join(" ").replace(/\s+/g, " ").trim(),
    usedSources: Array.from(new Set(usedSources)),
    missingHints,
  };
}

export interface GrammarImprovementResult {
  original: string;
  improved: string;
  changes: string[];
  guidance: string | null;
}

export function improveGrammarAndStructure(
  text: string,
  context: "summary" | "objective" | "bullet" | "achievement" = "bullet",
): GrammarImprovementResult {
  const original = text.trim();
  if (!original) {
    return {
      original: "",
      improved: "",
      changes: [],
      guidance: "Enter text first so the assistant can refine its grammar and structure.",
    };
  }

  const changes: string[] = [];
  let result = original;

  // 1. Normalize whitespace & spacing around punctuation
  const collapsed = result
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
  if (collapsed !== result) {
    changes.push("Normalized spacing and punctuation");
    result = collapsed;
  }

  // Ensure space after commas/periods inside text
  const spacedPunct = result.replace(/,([^\s\d])/g, ", $1");
  if (spacedPunct !== result) {
    changes.push("Added missing space after commas");
    result = spacedPunct;
  }

  // 2. Fix standalone lowercase "i"
  const fixedI = result.replace(/\bi\b/g, "I").replace(/\bi'm\b/gi, "I am");
  if (fixedI !== result) {
    changes.push("Corrected pronoun capitalization");
    result = fixedI;
  }

  // 3. Fix common article issues ("a engineering" -> "an engineering", "an user" -> "a user")
  const fixedArticles = result
    .replace(/\ba\s+([aeiou][a-z]*)/gi, (m, word: string) => {
      if (/^(user|unit|universal|unique|university|use)/i.test(word)) return m;
      return `an ${word}`;
    })
    .replace(/\ban\s+(user|unit|unique)/gi, "a $1");
  if (fixedArticles !== result) {
    changes.push("Corrected indefinite articles (a/an)");
    result = fixedArticles;
  }

  // 4. Replace weak/informal phrasing with stronger structure without inventing facts
  const replacements: Array<
    [RegExp, string | ((match: string, a?: string, b?: string) => string), string]
  > = [
    [/^i\s+worked\s+on\s+/i, "Developed ", "Replaced weak opening 'worked on' with 'Developed'"],
    [/^worked\s+on\s+/i, "Developed ", "Replaced weak verb 'worked on' with 'Developed'"],
    [
      /^i\s+helped\s+(?:in\s+|with\s+|to\s+)?/i,
      "Collaborated on ",
      "Replaced 'helped with' with 'Collaborated on'",
    ],
    [
      /^helped\s+(?:in\s+|with\s+|to\s+)?/i,
      "Collaborated on ",
      "Replaced 'helped with' with 'Collaborated on'",
    ],
    [/^i\s+made\s+(?:a|an)?\s*/i, "Built ", "Replaced informal 'made' with 'Built'"],
    [/^made\s+(?:a|an)?\s*/i, "Built ", "Replaced informal 'made' with 'Built'"],
    [
      /^was\s+responsible\s+for\s+/i,
      "Managed ",
      "Converted passive phrase 'was responsible for' to active voice",
    ],
    [/^responsible\s+for\s+/i, "Managed ", "Converted 'responsible for' to active verb 'Managed'"],
    [/^i\s+built\s+/i, "Built ", "Removed first-person pronoun for concise resume style"],
    [/^i\s+created\s+/i, "Created ", "Removed first-person pronoun for concise resume style"],
    [/^i\s+designed\s+/i, "Designed ", "Removed first-person pronoun for concise resume style"],
    [
      /^i\s+implemented\s+/i,
      "Implemented ",
      "Removed first-person pronoun for concise resume style",
    ],
    [/\ba\s+lot\s+of\b/gi, "multiple", "Replaced informal 'a lot of' with 'multiple'"],
    [/\bvery\s+good\b/gi, "strong", "Replaced 'very good' with 'strong'"],
    [/\bvery\s+fast\b/gi, "high-performance", "Replaced 'very fast' with 'high-performance'"],
    [/\bin\s+order\s+to\b/gi, "to", "Tightened 'in order to' to 'to'"],
    [/\butilized\b/gi, "used", "Simplified 'utilized' for clarity"],
    [
      /\bused\s+([a-z0-9.+#]+)\s+to\s+([a-z]+)/gi,
      (_match: string, tech = "", verb = "") => {
        const capVerb = verb.charAt(0).toUpperCase() + verb.slice(1);
        return `${capVerb} with ${tech} to`;
      },
      "Restructured 'used X to...' into an action-first phrase",
    ],
  ];

  for (const [pattern, replacement, note] of replacements) {
    const next =
      typeof replacement === "string"
        ? result.replace(pattern, replacement)
        : result.replace(pattern, replacement);
    if (next !== result) {
      changes.push(note);
      result = next;
    }
  }

  // 5. Capitalize sentence start
  const firstCap = result.charAt(0).toUpperCase() + result.slice(1);
  if (firstCap !== result) {
    changes.push("Capitalized opening character");
    result = firstCap;
  }

  // 6. Capitalize after periods
  const sentenceCaps = result.replace(
    /([.!?]\s+)([a-z])/g,
    (_, sep: string, ch: string) => `${sep}${ch.toUpperCase()}`,
  );
  if (sentenceCaps !== result) {
    changes.push("Capitalized sentence starts");
    result = sentenceCaps;
  }

  // 7. Ensure terminal period
  if (!/[.!?]$/.test(result)) {
    result += ".";
    changes.push("Added terminal period");
  }

  let guidance: string | null = null;
  if (context === "bullet" && !/\d/.test(result)) {
    guidance =
      "No numbers were added automatically. If you know the real scale or outcome (e.g., users, latency, test cases), include your true figure.";
  } else if (changes.length === 0) {
    guidance = "Sentence structure and grammar already look clean and concise.";
  }

  return {
    original,
    improved: result,
    changes: Array.from(new Set(changes)),
    guidance,
  };
}

export interface SuggestedSkillItem {
  skill: string;
  reason: string;
  source: string;
}

export interface SkillSuggestionResult {
  suggestedSkills: SuggestedSkillItem[];
  groundedNote: string;
}

const PROJECT_SKILL_MAP: Array<{
  trigger: RegExp;
  suggestions: string[];
}> = [
  {
    trigger: /\breact\b/i,
    suggestions: ["React Hooks", "Component Architecture", "State Management", "Responsive UI"],
  },
  {
    trigger: /\btypescript\b/i,
    suggestions: ["Type Safety", "Interface Design"],
  },
  {
    trigger: /\btailwind\b/i,
    suggestions: ["Tailwind CSS", "Responsive Web Design"],
  },
  {
    trigger: /\bnode(?:\.js)?\b|\bexpress\b/i,
    suggestions: ["Node.js", "RESTful APIs", "Middleware & Routing"],
  },
  {
    trigger: /\bgo(?:lang)?\b/i,
    suggestions: ["Go", "Concurrency", "Backend Services"],
  },
  {
    trigger: /\bredis\b|\bcache\b|\blru\b/i,
    suggestions: ["Redis", "Caching Strategies", "System Design"],
  },
  {
    trigger: /\bpostgres(?:ql)?\b|\bmysql\b|\bsql\b/i,
    suggestions: ["PostgreSQL", "SQL", "Database Design", "Query Optimization"],
  },
  {
    trigger: /\bmongodb\b|\bnosql\b/i,
    suggestions: ["MongoDB", "NoSQL Schema Design"],
  },
  {
    trigger: /\bdocker\b|\bkubernetes\b/i,
    suggestions: ["Docker", "Containerization", "Linux"],
  },
  {
    trigger: /\bpython\b/i,
    suggestions: ["Python", "Scripting & Automation"],
  },
  {
    trigger: /\bmachine learning\b|\bpandas\b|\bnumpy\b|\bscikit\b|\btensorflow\b|\bpytorch\b/i,
    suggestions: ["Machine Learning", "Data Preprocessing", "Pandas", "NumPy"],
  },
  {
    trigger: /\btest(?:ing|s)?\b|\bvitest\b|\bjest\b|\bcypress\b/i,
    suggestions: ["Unit Testing", "Integration Testing"],
  },
  {
    trigger: /\burl shortener\b|\bhigh[- ]throughput\b|\bscalab/i,
    suggestions: ["Scalability", "Distributed Systems"],
  },
  {
    trigger: /\bauth(?:entication)?\b|\bjwt\b|\boauth\b/i,
    suggestions: ["Authentication & Authorization", "Web Security"],
  },
  {
    trigger: /\bpwa\b|\bvite\b|\bcode-splitting\b/i,
    suggestions: ["Web Performance Optimization", "Vite"],
  },
];

export function suggestSkillsFromProjects(resume: ResumeData): SkillSuggestionResult {
  const existingLower = new Set(resume.skills.map((s) => s.trim().toLowerCase()));
  const suggestionsMap = new Map<string, SuggestedSkillItem>();

  const sources: Array<{ label: string; text: string }> = [
    ...resume.projects
      .filter((p) => p.title.trim() || p.tech.trim() || p.bullets.some((b) => b.trim()))
      .map((p) => ({
        label: `Project: ${p.title.trim() || "Untitled Project"}`,
        text: `${p.title} ${p.tech} ${p.bullets.join(" ")}`,
      })),
    ...resume.internships
      .filter((i) => i.role.trim() || i.company.trim() || i.bullets.some((b) => b.trim()))
      .map((i) => ({
        label: `Internship: ${i.role.trim() || "Intern"}${i.company.trim() ? ` @ ${i.company.trim()}` : ""}`,
        text: `${i.role} ${i.company} ${i.bullets.join(" ")}`,
      })),
  ];

  // 1. Prioritize explicit comma-separated tech items listed in project.tech
  for (const proj of resume.projects) {
    const techTokens = proj.tech
      .split(/[,/|]/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && t.length <= 32);
    for (const token of techTokens) {
      const key = token.toLowerCase();
      if (!existingLower.has(key) && !suggestionsMap.has(key)) {
        suggestionsMap.set(key, {
          skill: token,
          reason: `Listed in tech stack of "${proj.title.trim() || "your project"}"`,
          source: `Project: ${proj.title.trim() || "Untitled Project"}`,
        });
      }
    }
  }

  // 2. Derive related domain skills directly triggered by project and internship descriptions
  for (const src of sources) {
    for (const rule of PROJECT_SKILL_MAP) {
      if (rule.trigger.test(src.text)) {
        for (const candidate of rule.suggestions) {
          const key = candidate.toLowerCase();
          if (!existingLower.has(key) && !suggestionsMap.has(key)) {
            suggestionsMap.set(key, {
              skill: candidate,
              reason: `Directly supported by your ${src.label}`,
              source: src.label,
            });
          }
        }
      }
    }
  }

  return {
    suggestedSkills: Array.from(suggestionsMap.values()).slice(0, 12),
    groundedNote:
      sources.length > 0
        ? "Suggestions are derived strictly from the technologies and descriptions in your projects and internships."
        : "Add project titles, technologies, or internship details so the assistant can suggest relevant skills without guessing.",
  };
}

// ==========================================
// 4. COMPREHENSIVE 8-AREA AI RESUME ANALYSIS
// ==========================================
export interface SpellingMistakeItem {
  field: string;
  misspelled: string;
  correction: string;
  context: string;
}

export interface FormattingIssueItem {
  location: string;
  issue: string;
  fix: string;
}

export interface WeakDescriptionItem {
  location: string;
  currentText: string;
  issue: string;
  suggestion: string;
}

export interface ResumeSectionEvaluation {
  area:
    | "Technical Skills"
    | "Educational Qualifications"
    | "Projects"
    | "Internship Experience"
    | "Certifications"
    | "Work Experience"
    | "Achievements"
    | "Communication & Presentation";
  status: "Strong" | "Needs Attention" | "Missing";
  summary: string;
}

export interface ComprehensiveResumeAnalysis {
  sectionEvaluations: ResumeSectionEvaluation[];
  missingSections: string[];
  weakDescriptions: WeakDescriptionItem[];
  spellingMistakes: SpellingMistakeItem[];
  formattingIssues: FormattingIssueItem[];
  unnecessaryClutter: Array<{ location: string; phrase: string; reason: string }>;
}

const SPELLING_DICTIONARY: Array<[RegExp, string]> = [
  [/\bexperiance\b/gi, "experience"],
  [/\bexperince\b/gi, "experience"],
  [/\bmanagment\b/gi, "management"],
  [/\bmangment\b/gi, "management"],
  [/\bdevelopement\b/gi, "development"],
  [/\bdevelpment\b/gi, "development"],
  [/\bjavscript\b/gi, "JavaScript"],
  [/\bjavascrpt\b/gi, "JavaScript"],
  [/\btypscript\b/gi, "TypeScript"],
  [/\btypescrpt\b/gi, "TypeScript"],
  [/\bpyhton\b/gi, "Python"],
  [/\bphyton\b/gi, "Python"],
  [/\brecieved\b/gi, "received"],
  [/\bresponsibile\b/gi, "responsible"],
  [/\bresponsbile\b/gi, "responsible"],
  [/\bdatabse\b/gi, "database"],
  [/\bdatbase\b/gi, "database"],
  [/\balgoritm\b/gi, "algorithm"],
  [/\balgorihm\b/gi, "algorithm"],
  [/\bcommuncation\b/gi, "communication"],
  [/\bcommuniction\b/gi, "communication"],
  [/\bacheivement\b/gi, "achievement"],
  [/\bachievement\b/gi, "achievement"],
  [/\bcertifcate\b/gi, "certificate"],
  [/\bcertfication\b/gi, "certification"],
  [/\bprograming\b/gi, "programming"],
  [/\bsoftwre\b/gi, "software"],
  [/\benginering\b/gi, "engineering"],
  [/\bengineerng\b/gi, "engineering"],
  [/\bintership\b/gi, "internship"],
  [/\blangauge\b/gi, "language"],
  [/\bknowlege\b/gi, "knowledge"],
  [/\bsuccesful\b/gi, "successful"],
  [/\bsucessful\b/gi, "successful"],
  [/\bseperate\b/gi, "separate"],
  [/\boccured\b/gi, "occurred"],
  [/\buntill\b/gi, "until"],
  [/\bframewrok\b/gi, "framework"],
  [/\bperformace\b/gi, "performance"],
  [/\bperfomance\b/gi, "performance"],
  [/\barchitechture\b/gi, "architecture"],
  [/\bimplmented\b/gi, "implemented"],
  [/\bimplemnted\b/gi, "implemented"],
  [/\boptimzed\b/gi, "optimized"],
  [/\bmachne\b/gi, "machine"],
  [/\bprojct\b/gi, "project"],
  [/\bteh\b/gi, "the"],
  [/\bauthentcation\b/gi, "authentication"],
  [/\bresponsivee\b/gi, "responsive"],
  [/\binfrastucture\b/gi, "infrastructure"],
];

const CLUTTER_PATTERNS: Array<{ pattern: RegExp; label: string; reason: string }> = [
  {
    pattern: /\breferences?\s+available\s+(?:upon|on)\s+request\b/i,
    label: "References available upon request",
    reason: "Outdated resume filler — recruiters request references separately when needed.",
  },
  {
    pattern: /\b(?:curriculum\s+vitae|resume\s+of)\b/i,
    label: "Curriculum Vitae / Resume header",
    reason: "Redundant document label — your full name serves as the header.",
  },
  {
    pattern: /\b(?:hard[\s-]*working|self[\s-]*motivated|team\s+player|go[\s-]*getter)\b/i,
    label: "Generic personality cliché",
    reason: "Replace generic claims with concrete evidence from your projects or internships.",
  },
  {
    pattern: /\bi\s+am\s+a\b|\bmy\s+name\s+is\b/i,
    label: "First-person conversational phrasing",
    reason: "Standard ATS resumes use concise third-person/implied-subject phrasing.",
  },
];

export function detectSpellingMistakes(resume: ResumeData): SpellingMistakeItem[] {
  const hits: SpellingMistakeItem[] = [];
  const fields: Array<{ field: string; text: string }> = [
    { field: "Headline", text: resume.personal.headline },
    { field: "Career Objective", text: resume.careerObjective },
    { field: "Professional Summary", text: resume.summary },
    ...resume.education.map((e, i) => ({
      field: `Education #${i + 1}`,
      text: `${e.degree} ${e.institution} ${e.coursework}`,
    })),
    { field: "Technical Skills", text: resume.skills.join(", ") },
    ...resume.projects.flatMap((p, pi) => [
      { field: `Project #${pi + 1} (${p.title || "Untitled"})`, text: `${p.title} ${p.tech}` },
      ...p.bullets.map((b, bi) => ({
        field: `Project #${pi + 1} Bullet ${bi + 1}`,
        text: b,
      })),
    ]),
    ...resume.internships.flatMap((intern, ii) => [
      {
        field: `Experience #${ii + 1} (${intern.company || "Entry"})`,
        text: `${intern.role} ${intern.company}`,
      },
      ...intern.bullets.map((b, bi) => ({
        field: `Experience #${ii + 1} Bullet ${bi + 1}`,
        text: b,
      })),
    ]),
    ...resume.achievements.map((a, ai) => ({
      field: `Achievement #${ai + 1}`,
      text: `${a.title} ${a.detail}`,
    })),
  ];

  const seen = new Set<string>();
  for (const item of fields) {
    if (!item.text.trim()) continue;
    for (const [regex, correction] of SPELLING_DICTIONARY) {
      const match = item.text.match(regex);
      if (match && match[0]) {
        const key = `${item.field}::${match[0].toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          hits.push({
            field: item.field,
            misspelled: match[0],
            correction,
            context: item.text.trim().slice(0, 90),
          });
        }
      }
    }
  }
  return hits;
}

export function detectFormattingIssues(resume: ResumeData): FormattingIssueItem[] {
  const issues: FormattingIssueItem[] = [];

  if (
    resume.personal.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.personal.email.trim())
  ) {
    issues.push({
      location: "Personal Details (Email)",
      issue: `Invalid email format "${resume.personal.email.trim()}".`,
      fix: "Use a standard reachable email address like name@domain.com.",
    });
  }

  const lowerSkills = resume.skills.map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (new Set(lowerSkills).size < lowerSkills.length) {
    issues.push({
      location: "Technical Skills",
      issue: "Duplicate skills appear in your skills list.",
      fix: "Deduplicate skills so each technology is listed once.",
    });
  }

  const allBullets: Array<{ location: string; text: string }> = [
    ...resume.projects.flatMap((p, pi) =>
      p.bullets.map((b, bi) => ({
        location: `${p.title || `Project #${pi + 1}`} — Bullet ${bi + 1}`,
        text: b.trim(),
      })),
    ),
    ...resume.internships.flatMap((intern, ii) =>
      intern.bullets.map((b, bi) => ({
        location: `${intern.company || `Experience #${ii + 1}`} — Bullet ${bi + 1}`,
        text: b.trim(),
      })),
    ),
  ].filter((item) => item.text.length > 0);

  for (const item of allBullets) {
    if (item.text.length > 220) {
      issues.push({
        location: item.location,
        issue: `Bullet point is ${item.text.length} characters long (hard to scan quickly).`,
        fix: "Trim or split into two concise 1–2 line bullet points under 180 characters.",
      });
    }
    if (/\bi\b|\bmy\b|\bwe\b/i.test(item.text)) {
      issues.push({
        location: item.location,
        issue: "Contains first-person pronouns ('I', 'my', or 'we').",
        fix: "Remove first-person pronouns and start directly with a strong action verb.",
      });
    }
    if (/^[a-z]/.test(item.text)) {
      issues.push({
        location: item.location,
        issue: "Starts with a lowercase letter.",
        fix: "Capitalize the opening word of each bullet point.",
      });
    }
    if (item.text.length >= 15 && !/[.!?]$/.test(item.text)) {
      issues.push({
        location: item.location,
        issue: "Missing terminal punctuation.",
        fix: "End sentences consistently with a period.",
      });
    }
  }

  if (resume.summary.trim() && /^[A-Z\s]{16,}$/.test(resume.summary.trim())) {
    issues.push({
      location: "Professional Summary",
      issue: "Written in ALL CAPS, which hurts readability.",
      fix: "Convert summary text to standard sentence case.",
    });
  }

  return issues.slice(0, 12);
}

export function analyzeResumeComprehensive(resume: ResumeData): ComprehensiveResumeAnalysis {
  const ats = analyzeResumeATS(resume);
  const spellingMistakes = detectSpellingMistakes(resume);
  const formattingIssues = detectFormattingIssues(resume);

  const uniqueSkills = Array.from(new Set(resume.skills.map((s) => s.trim()).filter(Boolean)));
  const validEdu = resume.education.filter((e) => e.degree.trim() && e.institution.trim());
  const validProjects = resume.projects.filter((p) => p.title.trim());
  const validInternships = resume.internships.filter((i) => i.role.trim() || i.company.trim());
  const validCerts = resume.certifications.filter((c) => c.name.trim());
  const validAchievements = resume.achievements.filter((a) => a.title.trim() || a.detail.trim());

  // 8 Explicit Evaluation Areas
  const sectionEvaluations: ResumeSectionEvaluation[] = [
    {
      area: "Technical Skills",
      status:
        uniqueSkills.length >= 8
          ? "Strong"
          : uniqueSkills.length >= 1
            ? "Needs Attention"
            : "Missing",
      summary:
        uniqueSkills.length >= 8
          ? `${uniqueSkills.length} technical skills listed with ${ats.foundKeywords.length} relevant domain matches.`
          : uniqueSkills.length > 0
            ? `Only ${uniqueSkills.length} skill(s) listed; aim for 8+ accurate tools and languages.`
            : "No technical skills listed.",
    },
    {
      area: "Educational Qualifications",
      status:
        validEdu.length > 0 &&
        validEdu.some((e) => e.endYear.trim() && (e.grade.trim() || e.coursework.trim()))
          ? "Strong"
          : validEdu.length > 0
            ? "Needs Attention"
            : "Missing",
      summary:
        validEdu.length > 0
          ? `${validEdu.length} degree entry listed (${validEdu[0]!.degree} at ${validEdu[0]!.institution}).`
          : "Missing degree and institution details.",
    },
    {
      area: "Projects",
      status:
        validProjects.filter((p) => p.bullets.some((b) => b.trim().length >= 15)).length >= 2
          ? "Strong"
          : validProjects.length > 0
            ? "Needs Attention"
            : "Missing",
      summary:
        validProjects.length >= 2
          ? `${validProjects.length} projects documented.`
          : validProjects.length === 1
            ? "Only 1 project listed; adding a second technical project strengthens your portfolio."
            : "No projects listed yet.",
    },
    {
      area: "Internship Experience",
      status: validInternships.some((i) => /intern|trainee|apprentice/i.test(i.role))
        ? "Strong"
        : validInternships.length > 0
          ? "Needs Attention"
          : "Missing",
      summary:
        validInternships.length > 0
          ? `${validInternships.length} practical experience entry recorded.`
          : "No internship entries recorded.",
    },
    {
      area: "Certifications",
      status: validCerts.length >= 1 ? "Strong" : "Missing",
      summary:
        validCerts.length >= 1
          ? `${validCerts.length} certification(s) listed.`
          : "No verified certifications or coursework credentials added.",
    },
    {
      area: "Work Experience",
      status: validInternships.some((i) => i.bullets.some((b) => b.trim().length >= 15))
        ? "Strong"
        : validInternships.length > 0
          ? "Needs Attention"
          : "Missing",
      summary:
        validInternships.length > 0
          ? `Includes ${validInternships
              .map((i) => `${i.role || "Role"} at ${i.company || "Org"}`)
              .slice(0, 2)
              .join("; ")}.`
          : "No prior employment, freelance, or internship work history listed.",
    },
    {
      area: "Achievements",
      status: validAchievements.length >= 1 ? "Strong" : "Missing",
      summary:
        validAchievements.length >= 1
          ? `${validAchievements.length} award/achievement highlight(s) present.`
          : "No hackathons, coding ranks, or academic honors listed.",
    },
    {
      area: "Communication & Presentation",
      status:
        resume.summary.trim().split(/\s+/).filter(Boolean).length >= 20 &&
        spellingMistakes.length === 0 &&
        formattingIssues.length <= 1
          ? "Strong"
          : resume.summary.trim() || validProjects.length > 0
            ? "Needs Attention"
            : "Missing",
      summary:
        spellingMistakes.length === 0 && formattingIssues.length === 0
          ? "Clear, consistent phrasing with no detected spelling or formatting errors."
          : `${spellingMistakes.length} spelling issue(s) and ${formattingIssues.length} formatting issue(s) need cleanup.`,
    },
  ];

  // Detect weak descriptions
  const weakDescriptions: WeakDescriptionItem[] = [];
  const summaryWords = resume.summary.trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords > 0 && summaryWords < 18) {
    weakDescriptions.push({
      location: "Professional Summary",
      currentText: resume.summary.trim(),
      issue: `Too brief (${summaryWords} words) to convey your degree, core skills, and project focus.`,
      suggestion: "Expand to 2–3 clear sentences anchored in your entered education and projects.",
    });
  }

  const weakPhraseRegex =
    /^(?:i\s+)?(?:worked\s+on|helped\s+(?:with|in|to)|made\s+(?:a|an)?|was\s+responsible\s+for|responsible\s+for|did|assisted\s+in)\b/i;

  resume.projects.forEach((p, pi) => {
    p.bullets.forEach((b, bi) => {
      const trimmed = b.trim();
      if (!trimmed) return;
      const wordCount = trimmed.split(/\s+/).length;
      if (weakPhraseRegex.test(trimmed)) {
        weakDescriptions.push({
          location: `${p.title || `Project #${pi + 1}`} — Bullet ${bi + 1}`,
          currentText: trimmed,
          issue: "Opens with a weak or passive phrase ('worked on', 'made', 'helped').",
          suggestion:
            "Replace the opening with a strong action verb like Built, Engineered, or Developed.",
        });
      } else if (wordCount < 6) {
        weakDescriptions.push({
          location: `${p.title || `Project #${pi + 1}`} — Bullet ${bi + 1}`,
          currentText: trimmed,
          issue: `Very short description (${wordCount} words) — lacks technical scope or outcome.`,
          suggestion:
            "Describe what you built, which technologies you used, and what problem it solved.",
        });
      }
    });
  });

  resume.internships.forEach((intern, ii) => {
    intern.bullets.forEach((b, bi) => {
      const trimmed = b.trim();
      if (!trimmed) return;
      const wordCount = trimmed.split(/\s+/).length;
      if (weakPhraseRegex.test(trimmed)) {
        weakDescriptions.push({
          location: `${intern.company || `Experience #${ii + 1}`} — Bullet ${bi + 1}`,
          currentText: trimmed,
          issue: "Opens with passive or vague phrasing.",
          suggestion: "Lead with a concrete engineering verb describing your actual contribution.",
        });
      } else if (wordCount < 6) {
        weakDescriptions.push({
          location: `${intern.company || `Experience #${ii + 1}`} — Bullet ${bi + 1}`,
          currentText: trimmed,
          issue: `Too brief (${wordCount} words) for recruiters to understand your impact.`,
          suggestion: "Clarify the component/feature you built and tools used.",
        });
      }
    });
  });

  // Unnecessary clutter check
  const unnecessaryClutter: Array<{ location: string; phrase: string; reason: string }> = [];
  const checkClutter = (location: string, text: string) => {
    if (!text.trim()) return;
    for (const c of CLUTTER_PATTERNS) {
      const match = text.match(c.pattern);
      if (match) {
        unnecessaryClutter.push({
          location,
          phrase: match[0],
          reason: c.reason,
        });
      }
    }
  };

  checkClutter("Career Objective", resume.careerObjective);
  checkClutter("Professional Summary", resume.summary);
  resume.projects.forEach((p, i) =>
    p.bullets.forEach((b, bi) => checkClutter(`${p.title || `Project #${i + 1}`} B${bi + 1}`, b)),
  );
  resume.internships.forEach((intern, i) =>
    intern.bullets.forEach((b, bi) =>
      checkClutter(`${intern.company || `Experience #${i + 1}`} B${bi + 1}`, b),
    ),
  );

  return {
    sectionEvaluations,
    missingSections: ats.missingSections,
    weakDescriptions,
    spellingMistakes,
    formattingIssues,
    unnecessaryClutter,
  };
}

// ==========================================
// 5. JOB DESCRIPTION MATCHING ENGINE
// ==========================================
export interface JobDescriptionMatchResult {
  compatibilityScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  relevantKeywords: string[];
  missingKeywords: string[];
  resumeStrengths: string[];
  areasRequiringImprovement: string[];
  jdSkillsCount: number;
  summaryNote: string;
}

const JD_SKILL_CATALOG: Array<{ label: string; aliases: string[] }> = [
  { label: "Python", aliases: ["python"] },
  { label: "Java", aliases: ["java"] },
  { label: "C++", aliases: ["c++", "cpp"] },
  { label: "C", aliases: ["c programming", "language c"] },
  { label: "JavaScript", aliases: ["javascript", "es6"] },
  { label: "TypeScript", aliases: ["typescript"] },
  { label: "React", aliases: ["react", "react.js", "reactjs"] },
  { label: "Next.js", aliases: ["next.js", "nextjs"] },
  { label: "Angular", aliases: ["angular"] },
  { label: "Vue.js", aliases: ["vue", "vue.js", "vuejs"] },
  { label: "HTML/CSS", aliases: ["html", "css", "html5", "css3"] },
  { label: "Tailwind CSS", aliases: ["tailwind", "tailwind css"] },
  { label: "Node.js", aliases: ["node", "node.js", "nodejs"] },
  { label: "Express.js", aliases: ["express", "express.js"] },
  { label: "Django", aliases: ["django"] },
  { label: "Flask", aliases: ["flask"] },
  { label: "FastAPI", aliases: ["fastapi"] },
  { label: "Spring Boot", aliases: ["spring boot", "spring"] },
  { label: "Go", aliases: ["golang", "go language"] },
  { label: "SQL", aliases: ["sql"] },
  { label: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { label: "MySQL", aliases: ["mysql"] },
  { label: "MongoDB", aliases: ["mongodb", "nosql"] },
  { label: "Redis", aliases: ["redis"] },
  { label: "GraphQL", aliases: ["graphql"] },
  { label: "RESTful APIs", aliases: ["rest api", "restful", "rest apis", "restful apis"] },
  { label: "Docker", aliases: ["docker", "containerization"] },
  { label: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { label: "AWS", aliases: ["aws", "amazon web services"] },
  { label: "Azure", aliases: ["azure"] },
  { label: "GCP", aliases: ["gcp", "google cloud"] },
  { label: "Linux", aliases: ["linux", "unix", "bash"] },
  { label: "Git", aliases: ["git", "github", "gitlab"] },
  { label: "CI/CD", aliases: ["ci/cd", "ci cd", "github actions", "jenkins"] },
  { label: "Machine Learning", aliases: ["machine learning"] },
  { label: "Deep Learning", aliases: ["deep learning", "neural networks"] },
  { label: "Pandas", aliases: ["pandas"] },
  { label: "NumPy", aliases: ["numpy"] },
  { label: "TensorFlow", aliases: ["tensorflow"] },
  { label: "PyTorch", aliases: ["pytorch"] },
  { label: "Scikit-learn", aliases: ["scikit-learn", "sklearn"] },
  { label: "Unit Testing", aliases: ["unit testing", "vitest", "jest", "junit", "pytest"] },
  { label: "Microservices", aliases: ["microservices", "microservice"] },
];

const JD_KEYWORD_CATALOG: Array<{ label: string; aliases: string[] }> = [
  { label: "Data Structures", aliases: ["data structures"] },
  { label: "Algorithms", aliases: ["algorithms", "algorithmic"] },
  { label: "System Design", aliases: ["system design", "scalable architecture", "scalability"] },
  { label: "Object-Oriented Programming (OOP)", aliases: ["object-oriented", "oop"] },
  { label: "DBMS", aliases: ["dbms", "database management", "relational database"] },
  { label: "Operating Systems", aliases: ["operating systems", "concurrency", "multithreading"] },
  { label: "Computer Networks", aliases: ["computer networks", "http", "tcp/ip", "networking"] },
  { label: "Authentication & Security", aliases: ["authentication", "oauth", "jwt", "security"] },
  { label: "Cloud Computing", aliases: ["cloud", "serverless"] },
  { label: "Caching", aliases: ["caching", "cache", "lru"] },
  { label: "Agile / Scrum", aliases: ["agile", "scrum", "sprint"] },
  { label: "Problem Solving", aliases: ["problem solving", "problem-solving", "debugging"] },
  {
    label: "Performance Optimization",
    aliases: ["optimization", "latency", "throughput", "performance"],
  },
  { label: "Code Review", aliases: ["code review", "best practices", "clean code"] },
];

function containsAlias(corpus: string, alias: string): boolean {
  const escaped = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Handle symbols like c++ safely without trailing \b issue
  if (/[+#.]$/.test(alias) || /^[+#.]/.test(alias)) {
    return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(corpus);
  }
  return new RegExp(`\\b${escaped}\\b`, "i").test(corpus);
}

export function matchResumeWithJobDescription(
  resume: ResumeData,
  jobDescription: string,
): JobDescriptionMatchResult {
  const jdClean = jobDescription.trim();
  const jdLower = jdClean.toLowerCase();

  const resumeCorpus = [
    resume.personal.headline,
    resume.careerObjective,
    resume.summary,
    resume.skills.join(" "),
    resume.education.map((e) => `${e.degree} ${e.institution} ${e.coursework}`).join(" "),
    resume.projects.map((p) => `${p.title} ${p.tech} ${p.bullets.join(" ")}`).join(" "),
    resume.internships.map((i) => `${i.role} ${i.company} ${i.bullets.join(" ")}`).join(" "),
    resume.certifications.map((c) => `${c.name} ${c.issuer}`).join(" "),
    resume.achievements.map((a) => `${a.title} ${a.detail}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const item of JD_SKILL_CATALOG) {
    const inJd = item.aliases.some((alias) => containsAlias(jdLower, alias));
    if (!inJd) continue;
    const inResume = item.aliases.some((alias) => containsAlias(resumeCorpus, alias));
    if (inResume) {
      matchingSkills.push(item.label);
    } else {
      missingSkills.push(item.label);
    }
  }

  const relevantKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of JD_KEYWORD_CATALOG) {
    const inJd = kw.aliases.some((alias) => containsAlias(jdLower, alias));
    if (!inJd) continue;
    const inResume = kw.aliases.some((alias) => containsAlias(resumeCorpus, alias));
    if (inResume) {
      relevantKeywords.push(kw.label);
    } else {
      missingKeywords.push(kw.label);
    }
  }

  const totalSkillsInJd = matchingSkills.length + missingSkills.length;
  const totalKeywordsInJd = relevantKeywords.length + missingKeywords.length;
  const atsBase = analyzeResumeATS(resume);

  let compatibilityScore = 0;
  if (jdClean.length >= 15) {
    const skillRatio = totalSkillsInJd > 0 ? matchingSkills.length / totalSkillsInJd : 0.5;
    const kwRatio = totalKeywordsInJd > 0 ? relevantKeywords.length / totalKeywordsInJd : 0.5;
    const structuralFactor = atsBase.score / 100;
    // Weighted blend: 55% required skills, 25% domain keywords, 20% resume structure readiness
    compatibilityScore = Math.round(
      Math.min(
        100,
        Math.max(0, (skillRatio * 0.55 + kwRatio * 0.25 + structuralFactor * 0.2) * 100),
      ),
    );
  }

  const resumeStrengths: string[] = [];
  if (matchingSkills.length > 0) {
    resumeStrengths.push(
      `Matches ${matchingSkills.length} key JD skill(s): ${matchingSkills.slice(0, 6).join(", ")}.`,
    );
  }
  if (relevantKeywords.length > 0) {
    resumeStrengths.push(
      `Demonstrates ${relevantKeywords.length} core engineering keyword(s): ${relevantKeywords.slice(0, 4).join(", ")}.`,
    );
  }
  if (resume.projects.filter((p) => p.title.trim()).length >= 2) {
    resumeStrengths.push("Includes multiple hands-on technical projects to back up listed skills.");
  }
  if (resume.internships.filter((i) => i.role.trim() && i.company.trim()).length >= 1) {
    resumeStrengths.push("Practical internship/work experience strengthens role readiness.");
  }

  const areasRequiringImprovement: string[] = [];
  if (missingSkills.length > 0) {
    areasRequiringImprovement.push(
      `Missing JD skills (${missingSkills.length}): ${missingSkills.slice(0, 6).join(", ")} — add only those you actually know or build a project demonstrating them.`,
    );
  }
  if (missingKeywords.length > 0) {
    areasRequiringImprovement.push(
      `Add missing domain concepts where truthful: ${missingKeywords.slice(0, 5).join(", ")}.`,
    );
  }
  if (atsBase.score < 70) {
    areasRequiringImprovement.push(
      `Baseline resume ATS quality is ${atsBase.score}/100. Resolve structural deductions first to boost role competitiveness.`,
    );
  }
  if (areasRequiringImprovement.length === 0 && compatibilityScore >= 75) {
    areasRequiringImprovement.push(
      "Tailor your top 2 project bullets to emphasize outcomes matching the job description priorities.",
    );
  }

  const summaryNote =
    totalSkillsInJd + totalKeywordsInJd === 0
      ? "Paste a detailed job description listing required skills, tools, and responsibilities for an accurate match breakdown."
      : `Matched ${matchingSkills.length} of ${totalSkillsInJd} detected JD skills and ${relevantKeywords.length} of ${totalKeywordsInJd} domain keywords.`;

  return {
    compatibilityScore,
    matchingSkills,
    missingSkills,
    relevantKeywords,
    missingKeywords,
    resumeStrengths,
    areasRequiringImprovement,
    jdSkillsCount: totalSkillsInJd,
    summaryNote,
  };
}

// ==========================================
// 6. INTERACTIVE "IMPROVE MY RESUME" OPTIMIZER
// ==========================================
export type OptimizationItemType =
  | "summary"
  | "bullet-project"
  | "bullet-internship"
  | "spelling"
  | "skills"
  | "clutter-cleanup"
  | "advisory";

export interface ResumeOptimizationItem {
  id: string;
  type: OptimizationItemType;
  title: string;
  location: string;
  before: string;
  after: string;
  reason: string;
  applicable: boolean;
  // Metadata used to apply the patch deterministically
  targetIndex?: number;
  subIndex?: number;
  skillsToAdd?: string[];
  deduplicatedSkills?: string[];
}

export interface ResumeOptimizationPlan {
  items: ResumeOptimizationItem[];
  applicableCount: number;
  advisoryCount: number;
  groundedGuarantee: string;
}

function fixSpellingInString(text: string): { fixed: string; changed: boolean } {
  let fixed = text;
  let changed = false;
  for (const [regex, correction] of SPELLING_DICTIONARY) {
    const next = fixed.replace(regex, correction);
    if (next !== fixed) {
      fixed = next;
      changed = true;
    }
  }
  return { fixed, changed };
}

function removeClutterFromString(text: string): { cleaned: string; changed: boolean } {
  let cleaned = text;
  let changed = false;
  for (const item of CLUTTER_PATTERNS) {
    const next = cleaned
      .replace(item.pattern, "")
      .replace(/\s{2,}/g, " ")
      .replace(/^[,.\s-]+|[,.\s-]+$/g, "")
      .trim();
    if (next !== cleaned) {
      cleaned = next;
      changed = true;
    }
  }
  return { cleaned, changed };
}

export function buildResumeOptimizationPlan(
  resume: ResumeData,
  _jobDescription?: string,
): ResumeOptimizationPlan {
  const items: ResumeOptimizationItem[] = [];

  // 1. Summary generation or grammar/spelling polish
  const summaryWords = resume.summary.trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords < 18) {
    const generated = generateProfessionalSummary(resume, "technical");
    if (generated.summary && generated.summary !== resume.summary.trim()) {
      items.push({
        id: "opt-summary-gen",
        type: "summary",
        title:
          summaryWords === 0 ? "Generate Grounded Professional Summary" : "Expand Brief Summary",
        location: "Professional Summary",
        before: resume.summary.trim() || "(Empty)",
        after: generated.summary,
        reason: `Synthesized strictly from your entered ${generated.usedSources.join(", ") || "profile"} without inventing qualifications.`,
        applicable: true,
      });
    }
  } else {
    const spelled = fixSpellingInString(resume.summary);
    const decluttered = removeClutterFromString(spelled.fixed);
    const refined = improveGrammarAndStructure(decluttered.cleaned, "summary");
    if (refined.improved && refined.improved !== resume.summary.trim()) {
      items.push({
        id: "opt-summary-polish",
        type: "summary",
        title: "Polish Summary Clarity & Grammar",
        location: "Professional Summary",
        before: resume.summary.trim(),
        after: refined.improved,
        reason: refined.changes.join("; ") || "Corrected grammar and removed filler phrasing.",
        applicable: true,
      });
    }
  }

  // 2. Rewrite weak / misspelled project bullets
  resume.projects.forEach((proj, pi) => {
    proj.bullets.forEach((bullet, bi) => {
      const original = bullet.trim();
      if (!original) return;
      const spelled = fixSpellingInString(original);
      const decluttered = removeClutterFromString(spelled.fixed);
      const grammar = improveGrammarAndStructure(decluttered.cleaned, "bullet");

      if (grammar.improved && grammar.improved !== original) {
        items.push({
          id: `opt-proj-${pi}-${bi}`,
          type: "bullet-project",
          title: `Strengthen Project Bullet (${proj.title || `Project #${pi + 1}`})`,
          location: `${proj.title || `Project #${pi + 1}`} — Bullet ${bi + 1}`,
          before: original,
          after: grammar.improved,
          reason:
            [
              spelled.changed ? "Fixed spelling mistakes" : "",
              decluttered.changed ? "Removed unnecessary filler words" : "",
              ...grammar.changes,
            ]
              .filter(Boolean)
              .join("; ") || "Improved action verb and sentence structure.",
          applicable: true,
          targetIndex: pi,
          subIndex: bi,
        });
      } else if (!/\d/.test(original)) {
        items.push({
          id: `adv-proj-metric-${pi}-${bi}`,
          type: "advisory",
          title: "Add Real Scale/Metric If Known",
          location: `${proj.title || `Project #${pi + 1}`} — Bullet ${bi + 1}`,
          before: original,
          after: original,
          reason:
            "Advisory only (no numbers fabricated): if you tested latency, dataset size, or user count, edit this bullet manually with your true figure.",
          applicable: false,
        });
      }
    });
  });

  // 3. Rewrite weak / misspelled internship bullets
  resume.internships.forEach((intern, ii) => {
    intern.bullets.forEach((bullet, bi) => {
      const original = bullet.trim();
      if (!original) return;
      const spelled = fixSpellingInString(original);
      const decluttered = removeClutterFromString(spelled.fixed);
      const grammar = improveGrammarAndStructure(decluttered.cleaned, "bullet");

      if (grammar.improved && grammar.improved !== original) {
        items.push({
          id: `opt-intern-${ii}-${bi}`,
          type: "bullet-internship",
          title: `Strengthen Experience Bullet (${intern.company || `Experience #${ii + 1}`})`,
          location: `${intern.company || `Experience #${ii + 1}`} — Bullet ${bi + 1}`,
          before: original,
          after: grammar.improved,
          reason:
            [
              spelled.changed ? "Fixed spelling mistakes" : "",
              decluttered.changed ? "Removed filler text" : "",
              ...grammar.changes,
            ]
              .filter(Boolean)
              .join("; ") || "Converted to active, ATS-ready voice.",
          applicable: true,
          targetIndex: ii,
          subIndex: bi,
        });
      }
    });
  });

  // 4. Skill deduplication + grounded skills directly present in projects[].tech
  const skillSuggestions = suggestSkillsFromProjects(resume);
  const directTechSkills = skillSuggestions.suggestedSkills
    .filter((s) => s.reason.startsWith("Listed in tech stack"))
    .map((s) => s.skill);

  const normalizedUnique: string[] = [];
  const seenSkills = new Set<string>();
  for (const raw of resume.skills) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const spelled = fixSpellingInString(trimmed).fixed;
    const key = spelled.toLowerCase();
    if (!seenSkills.has(key)) {
      seenSkills.add(key);
      normalizedUnique.push(spelled);
    }
  }
  const addableFromProjects = directTechSkills.filter((s) => !seenSkills.has(s.toLowerCase()));
  const hasSkillDuplicates = normalizedUnique.length !== resume.skills.length;

  if (addableFromProjects.length > 0 || hasSkillDuplicates) {
    const combinedSkills = [...normalizedUnique, ...addableFromProjects];
    items.push({
      id: "opt-skills-sync",
      type: "skills",
      title: "Organize Skills & Sync Project Tech Stack",
      location: "Technical Skills",
      before: resume.skills.join(", ") || "(Empty)",
      after: combinedSkills.join(", "),
      reason:
        addableFromProjects.length > 0
          ? `Removes duplicates and surfaces ${addableFromProjects.join(", ")} directly stated in your project tech stacks.`
          : "Deduplicates and normalizes your Technical Skills list.",
      applicable: true,
      skillsToAdd: addableFromProjects,
      deduplicatedSkills: combinedSkills,
    });
  }

  // 5. Career Objective clutter cleanup if generic cliché present
  if (resume.careerObjective.trim()) {
    const spelledObj = fixSpellingInString(resume.careerObjective);
    const declutteredObj = removeClutterFromString(spelledObj.fixed);
    if (declutteredObj.changed || spelledObj.changed) {
      const cleanedFinal = improveGrammarAndStructure(declutteredObj.cleaned, "objective").improved;
      if (cleanedFinal && cleanedFinal !== resume.careerObjective.trim()) {
        items.push({
          id: "opt-objective-clean",
          type: "clutter-cleanup",
          title: "Clean Career Objective & Remove Clichés",
          location: "Career Objective",
          before: resume.careerObjective.trim(),
          after: cleanedFinal,
          reason:
            "Removed spelling errors or generic filler phrases while keeping your goal intact.",
          applicable: true,
        });
      }
    }
  }

  return {
    items,
    applicableCount: items.filter((i) => i.applicable).length,
    advisoryCount: items.filter((i) => !i.applicable).length,
    groundedGuarantee:
      "Every optimization modifies only your own words and listed project tools — no jobs, degrees, or numbers are ever invented.",
  };
}

export function applyResumeOptimizationPlan(
  resume: ResumeData,
  selectedItemIds: string[],
  plan: ResumeOptimizationPlan,
): ResumeData {
  const selectedSet = new Set(selectedItemIds);
  const next: ResumeData = {
    ...resume,
    personal: { ...resume.personal },
    education: resume.education.map((e) => ({ ...e })),
    skills: [...resume.skills],
    projects: resume.projects.map((p) => ({ ...p, bullets: [...p.bullets] })),
    internships: resume.internships.map((i) => ({ ...i, bullets: [...i.bullets] })),
    certifications: resume.certifications.map((c) => ({ ...c })),
    achievements: resume.achievements.map((a) => ({ ...a })),
  };

  for (const item of plan.items) {
    if (!item.applicable || !selectedSet.has(item.id)) continue;

    if (item.type === "summary") {
      next.summary = item.after;
    } else if (item.type === "clutter-cleanup") {
      next.careerObjective = item.after;
    } else if (
      item.type === "bullet-project" &&
      typeof item.targetIndex === "number" &&
      typeof item.subIndex === "number"
    ) {
      const targetProj = next.projects[item.targetIndex];
      if (targetProj && item.subIndex >= 0 && item.subIndex < targetProj.bullets.length) {
        targetProj.bullets[item.subIndex] = item.after;
      }
    } else if (
      item.type === "bullet-internship" &&
      typeof item.targetIndex === "number" &&
      typeof item.subIndex === "number"
    ) {
      const targetIntern = next.internships[item.targetIndex];
      if (targetIntern && item.subIndex >= 0 && item.subIndex < targetIntern.bullets.length) {
        targetIntern.bullets[item.subIndex] = item.after;
      }
    } else if (item.type === "skills" && item.deduplicatedSkills) {
      next.skills = [...item.deduplicatedSkills];
    }
  }

  return next;
}

// ==========================================
// 7. RESUME VERSION HISTORY & ATS COMPARISON
// ==========================================
export type ResumeVersionSource = "Manual Save" | "Uploaded PDF" | "Uploaded DOCX" | "AI Optimized";

export interface ResumeVersionRecord {
  id: string;
  label: string;
  savedAt: string;
  source: ResumeVersionSource;
  template: ResumeTemplate;
  atsScore: number;
  categories: AtsCategoryBreakdown[];
  resume: ResumeData;
}

export interface ResumeVersionComparison {
  overallDelta: number;
  previousScore: number;
  currentScore: number;
  categoryDeltas: Array<{
    category: string;
    previous: number;
    current: number;
    delta: number;
    max: number;
  }>;
}

const RESUME_HISTORY_PREFIX = "cp_resume_history_v1_";

function getResumeHistoryKey(email?: string | null): string {
  const normalized = (email || "guest").toLowerCase().trim();
  return `${RESUME_HISTORY_PREFIX}${normalized}`;
}

export function loadResumeHistory(email?: string | null): ResumeVersionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getResumeHistoryKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ResumeVersionRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveResumeVersion(
  resume: ResumeData,
  template: ResumeTemplate,
  source: ResumeVersionSource,
  label?: string,
  email?: string | null,
): ResumeVersionRecord[] {
  const ats = analyzeResumeATS(resume);
  const existing = loadResumeHistory(email);
  const versionNumber = existing.length + 1;
  const record: ResumeVersionRecord = {
    id: createId("ver"),
    label:
      label?.trim() ||
      `${resume.personal.fullName.trim() || "Resume"} — v${versionNumber} (${source})`,
    savedAt: new Date().toISOString(),
    source,
    template,
    atsScore: ats.score,
    categories: ats.categories,
    resume,
  };

  const updated = [record, ...existing].slice(0, 20);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getResumeHistoryKey(email), JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }
  }
  return updated;
}

export function deleteResumeVersion(id: string, email?: string | null): ResumeVersionRecord[] {
  const existing = loadResumeHistory(email);
  const updated = existing.filter((v) => v.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getResumeHistoryKey(email), JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

export function compareResumeWithVersion(
  currentAts: AtsAnalysisResult,
  previousVersion: ResumeVersionRecord,
): ResumeVersionComparison {
  const categoryDeltas = currentAts.categories.map((cat) => {
    const prevCat = previousVersion.categories.find((p) => p.category === cat.category);
    const prevEarned = prevCat ? prevCat.earned : 0;
    return {
      category: cat.category,
      previous: prevEarned,
      current: cat.earned,
      delta: cat.earned - prevEarned,
      max: cat.max,
    };
  });

  return {
    overallDelta: currentAts.score - previousVersion.atsScore,
    previousScore: previousVersion.atsScore,
    currentScore: currentAts.score,
    categoryDeltas,
  };
}
