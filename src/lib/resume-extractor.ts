import type { Student } from "./auth";
import { createEmptyResume, createId, type ResumeData } from "./resume-engine";

export type SupportedResumeFileType = "pdf" | "docx";

export interface ExtractedResumeTextResult {
  rawText: string;
  fileName: string;
  fileType: SupportedResumeFileType;
  pageCount?: number;
  warnings: string[];
}

export interface ParsedResumeResult {
  resumeData: ResumeData;
  detectedSections: string[];
  missingSections: string[];
  rawText: string;
  warnings: string[];
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function hasPdfMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  // Look for %PDF- within first 1024 bytes (some generators prepend whitespace/BOM)
  const searchLimit = Math.min(bytes.length - 5, 1024);
  for (let i = 0; i <= searchLimit; i++) {
    if (
      bytes[i] === 0x25 && // %
      bytes[i + 1] === 0x50 && // P
      bytes[i + 2] === 0x44 && // D
      bytes[i + 3] === 0x46 && // F
      bytes[i + 4] === 0x2d // -
    ) {
      return true;
    }
  }
  return false;
}

function hasZipMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  return bytes[0] === 0x50 && bytes[1] === 0x4b; // PK
}

export function detectResumeFileType(file: File): SupportedResumeFileType | null {
  const nameLower = file.name.toLowerCase().trim();
  const mimeLower = (file.type || "").toLowerCase().trim();

  if (nameLower.endsWith(".pdf") || mimeLower === "application/pdf") {
    return "pdf";
  }
  if (
    nameLower.endsWith(".docx") ||
    mimeLower === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  return null;
}

async function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") {
    return await file.arrayBuffer();
  }
  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read file contents."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read the selected file."));
    reader.readAsArrayBuffer(file);
  });
}

async function extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<{
  text: string;
  pageCount: number;
  warnings: string[];
}> {
  const bytes = new Uint8Array(buffer);
  if (!hasPdfMagicBytes(bytes)) {
    throw new Error(
      "The uploaded file does not appear to be a valid PDF document (missing PDF header).",
    );
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const warnings: string[] = [];

  if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    } catch {
      // Fallback safely in restricted/test environments
    }
  }

  const loadingTask = pdfjs.getDocument({
    data: bytes,
    useWorkerFetch: false,
    verbosity: 0,
  });

  const pdfDoc = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const linesByY = new Map<number, Array<{ x: number; str: string }>>();

    for (const rawItem of content.items) {
      if (!rawItem || typeof rawItem !== "object" || !("str" in rawItem)) continue;
      const item = rawItem as { str: string; transform?: number[]; hasEOL?: boolean };
      const str = item.str;
      if (!str || !str.trim()) continue;
      const x =
        Array.isArray(item.transform) && typeof item.transform[4] === "number"
          ? item.transform[4]
          : 0;
      const rawY =
        Array.isArray(item.transform) && typeof item.transform[5] === "number"
          ? item.transform[5]
          : 0;
      // Group text fragments lying on the same horizontal baseline (3pt bucket)
      const yBucket = Math.round(rawY / 3) * 3;
      const bucket = linesByY.get(yBucket) ?? [];
      bucket.push({ x, str });
      linesByY.set(yBucket, bucket);
    }

    const sortedYs = Array.from(linesByY.keys()).sort((a, b) => b - a);
    const pageLines: string[] = [];
    for (const yKey of sortedYs) {
      const fragments = linesByY.get(yKey) ?? [];
      fragments.sort((a, b) => a.x - b.x);
      const joined = fragments
        .map((f) => f.str.trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (joined) pageLines.push(joined);
    }

    if (pageLines.length > 0) {
      pageTexts.push(pageLines.join("\n"));
    }
  }

  const text = pageTexts.join("\n\n").trim();
  if (pdfDoc.numPages > 3) {
    warnings.push(
      `Your PDF has ${pdfDoc.numPages} pages. Most ATS-friendly student and early-career resumes perform best at 1–2 pages.`,
    );
  }

  return { text, pageCount: pdfDoc.numPages, warnings };
}

async function extractTextFromDocxBuffer(buffer: ArrayBuffer): Promise<{
  text: string;
  warnings: string[];
}> {
  const bytes = new Uint8Array(buffer);
  if (!hasZipMagicBytes(bytes)) {
    throw new Error(
      "The uploaded file is not a valid DOCX archive (DOCX files must be valid Word XML packages).",
    );
  }

  const mammothModule = await import("mammoth");
  const mammoth = mammothModule.default ?? mammothModule;
  // mammoth's browser build reads `arrayBuffer`, whereas its Node entry reads `buffer`
  const inputOptions = {
    arrayBuffer: buffer,
    buffer: bytes,
  } as unknown as Parameters<typeof mammoth.extractRawText>[0];
  const result = await mammoth.extractRawText(inputOptions);

  const warnings = (result.messages ?? [])
    .filter((m) => m.type === "warning" && m.message)
    .map((m) => m.message);

  return {
    text: (result.value ?? "").trim(),
    warnings,
  };
}

export async function extractTextFromResumeFile(file: File): Promise<ExtractedResumeTextResult> {
  if (!file) {
    throw new Error("No file selected.");
  }

  const fileType = detectResumeFileType(file);
  if (!fileType) {
    throw new Error(
      `Unsupported file "${file.name}". Please upload a valid PDF (.pdf) or Word (.docx) resume.`,
    );
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty (0 bytes). Please upload a valid resume.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File size exceeds 10 MB. Please upload a smaller resume document.");
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await readFileArrayBuffer(file);
  } catch {
    throw new Error("Unable to read the uploaded file. Please try selecting it again.");
  }

  if (buffer.byteLength === 0) {
    throw new Error("The selected file has no readable content.");
  }

  if (fileType === "pdf") {
    try {
      const { text, pageCount, warnings } = await extractTextFromPdfBuffer(buffer);
      if (text.replace(/\s+/g, "").length < 15) {
        throw new Error(
          "No selectable text was found in this PDF. It may be a scanned image or password-protected PDF. Please upload a text-based PDF or DOCX file.",
        );
      }
      return {
        rawText: text,
        fileName: file.name,
        fileType: "pdf",
        pageCount,
        warnings,
      };
    } catch (err) {
      if (err instanceof Error && err.message) {
        throw err;
      }
      throw new Error(
        "Failed to parse this PDF file. Please ensure it is not corrupted or encrypted.",
      );
    }
  }

  // DOCX
  try {
    const { text, warnings } = await extractTextFromDocxBuffer(buffer);
    if (text.replace(/\s+/g, "").length < 15) {
      throw new Error(
        "The uploaded DOCX document contains no readable resume text. Please check the file and try again.",
      );
    }
    return {
      rawText: text,
      fileName: file.name,
      fileType: "docx",
      warnings,
    };
  } catch (err) {
    if (err instanceof Error && err.message) {
      throw err;
    }
    throw new Error("Failed to read this DOCX file. Ensure it is a valid Word (.docx) file.");
  }
}

// ==========================================
// STRUCTURED RESUME PARSER FROM EXTRACTED TEXT
// ==========================================
type SectionKey =
  | "header"
  | "objective"
  | "summary"
  | "education"
  | "skills"
  | "projects"
  | "internships"
  | "certifications"
  | "achievements";

const SECTION_PATTERNS: Array<{ key: SectionKey; pattern: RegExp }> = [
  { key: "objective", pattern: /^(?:career\s+objective|objective)$/i },
  {
    key: "summary",
    pattern: /^(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me)$/i,
  },
  {
    key: "education",
    pattern: /^(?:education|educational\s+qualifications|academic\s+background|academics)$/i,
  },
  {
    key: "skills",
    pattern: /^(?:technical\s+skills|skills|core\s+competencies|technologies|tech\s+stack)$/i,
  },
  {
    key: "internships",
    pattern:
      /^(?:internships?|work\s+experience|experience|professional\s+experience|internships?\s*&\s*experience|employment)$/i,
  },
  {
    key: "projects",
    pattern: /^(?:projects|academic\s+projects|personal\s+projects|key\s+projects)$/i,
  },
  {
    key: "certifications",
    pattern:
      /^(?:certifications?|licenses?\s*&\s*certifications?|courses?\s*&\s*certifications?)$/i,
  },
  {
    key: "achievements",
    pattern: /^(?:achievements?|honors?\s*&\s*awards|awards|accomplishments|extracurriculars?)$/i,
  },
];

function matchSectionHeading(line: string): SectionKey | null {
  const cleaned = line
    .trim()
    .replace(/^[\d.\s•\-–—]+/, "")
    .replace(/[:\-–—]+$/, "")
    .trim();
  if (!cleaned || cleaned.length > 48) return null;
  for (const entry of SECTION_PATTERNS) {
    if (entry.pattern.test(cleaned)) {
      return entry.key;
    }
  }
  return null;
}

function cleanBulletPrefix(line: string): string {
  return line.replace(/^\s*(?:[•●○▪▫▸▹\-*]|\d+[.)])\s*/, "").trim();
}

function isBulletLine(line: string): boolean {
  return /^\s*(?:[•●○▪▫▸▹\-*]|\d+[.)])\s+/.test(line);
}

function parseSkillsLines(lines: string[]): string[] {
  const skills: string[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    // Strip category prefix like "Languages: Python, Java"
    const withoutPrefix = rawLine.replace(/^[A-Za-z\s/&+-]{2,28}:\s*/, "");
    const tokens = withoutPrefix
      .split(/[,|•·/]+|\s{2,}/)
      .map((t) => cleanBulletPrefix(t).trim())
      .filter((t) => t.length >= 1 && t.length <= 42);

    for (const token of tokens) {
      const key = token.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        skills.push(token);
      }
    }
  }
  return skills.slice(0, 40);
}

function parseEducationLines(lines: string[]): ResumeData["education"] {
  const entries: ResumeData["education"] = [];
  const degreePattern =
    /\b(b\.?\s?tech|b\.?\s?e\.?|m\.?\s?tech|m\.?\s?e\.?|b\.?\s?sc|m\.?\s?sc|bca|mca|bachelor|master|diploma|high school|class\s+xii|12th|10th|ssc|hsc|ph\.?d)\b/i;
  const yearSpanRegex = /((?:19|20)\d{2})\s*(?:[-–—to]+)\s*((?:19|20)\d{2}|present|expected)/i;
  const singleYearRegex = /\b((?:19|20)\d{2})\b/;
  const gradeRegex =
    /(?:cgpa|gpa|percentage|score|grade)\s*[:-]?\s*([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*10|\s*\/\s*4|%)?)|([0-9]+(?:\.[0-9]+)?\s*(?:cgpa|gpa|%))/i;

  let current: ResumeData["education"][number] | null = null;

  const pushCurrent = () => {
    if (current && (current.degree || current.institution)) {
      entries.push(current);
    }
    current = null;
  };

  for (const raw of lines) {
    const line = cleanBulletPrefix(raw);
    if (!line) continue;

    if (/^relevant\s+coursework\s*:/i.test(line) && current) {
      current.coursework = line.replace(/^relevant\s+coursework\s*:\s*/i, "").trim();
      continue;
    }

    const hasDegree = degreePattern.test(line);
    const hasCollege =
      /\b(university|college|institute|school|academy|polytechnic|iit|nit|iiit)\b/i.test(line);

    if (hasDegree || (!current && hasCollege)) {
      if (current && (current.degree || current.institution)) {
        pushCurrent();
      }
      if (!current) {
        current = {
          id: createId("edu"),
          degree: "",
          institution: "",
          location: "",
          startYear: "",
          endYear: "",
          grade: "",
          coursework: "",
        };
      }

      const spanMatch = line.match(yearSpanRegex);
      if (spanMatch) {
        current.startYear = spanMatch[1] ?? "";
        current.endYear = spanMatch[2] ?? "";
      } else {
        const singleMatch = line.match(singleYearRegex);
        if (singleMatch && !current.endYear) {
          current.endYear = singleMatch[1] ?? "";
        }
      }

      const gradeMatch = line.match(gradeRegex);
      if (gradeMatch) {
        current.grade = (gradeMatch[0] ?? "").trim();
      }

      const cleanTitle = line
        .replace(yearSpanRegex, "")
        .replace(gradeRegex, "")
        .replace(/[|•]+/g, " ")
        .trim()
        .replace(/[,\-–]+$/, "")
        .trim();

      if (hasDegree) {
        current.degree = cleanTitle || line;
      } else {
        current.institution = cleanTitle || line;
      }
    } else if (current) {
      const spanMatch = line.match(yearSpanRegex);
      if (spanMatch) {
        if (!current.startYear) current.startYear = spanMatch[1] ?? "";
        if (!current.endYear) current.endYear = spanMatch[2] ?? "";
      } else {
        const singleMatch = line.match(singleYearRegex);
        if (singleMatch && !current.endYear) current.endYear = singleMatch[1] ?? "";
      }

      const gradeMatch = line.match(gradeRegex);
      if (gradeMatch && !current.grade) {
        current.grade = (gradeMatch[0] ?? "").trim();
      }

      const stripped = line
        .replace(yearSpanRegex, "")
        .replace(gradeRegex, "")
        .replace(/^\||\|$/g, "")
        .trim();

      if (stripped && !current.institution) {
        current.institution = stripped;
      } else if (stripped && /coursework|subjects/i.test(stripped) && !current.coursework) {
        current.coursework = stripped.replace(/^.*?(coursework|subjects)\s*:\s*/i, "");
      }
    } else {
      current = {
        id: createId("edu"),
        degree: line,
        institution: "",
        location: "",
        startYear: "",
        endYear: "",
        grade: "",
        coursework: "",
      };
    }
  }

  pushCurrent();
  return entries;
}

function parseProjectLines(lines: string[]): ResumeData["projects"] {
  const projects: ResumeData["projects"] = [];
  let current: ResumeData["projects"][number] | null = null;

  const pushCurrent = () => {
    if (current && (current.title || current.bullets.some((b) => b.trim()))) {
      if (current.bullets.length === 0) current.bullets = [""];
      projects.push(current);
    }
    current = null;
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (isBulletLine(trimmed)) {
      const bullet = cleanBulletPrefix(trimmed);
      if (!current) {
        current = {
          id: createId("proj"),
          title: "Project",
          tech: "",
          duration: "",
          link: "",
          bullets: [],
        };
      }
      if (bullet) current.bullets.push(bullet);
      continue;
    }

    if (/^(?:https?:\/\/|github\.com\/)/i.test(trimmed)) {
      if (current && !current.link) {
        current.link = trimmed;
        continue;
      }
    }

    if (/^(?:tech(?:\s*stack)?|tools|stack)\s*:/i.test(trimmed) && current) {
      current.tech = trimmed.replace(/^(?:tech(?:\s*stack)?|tools|stack)\s*:\s*/i, "").trim();
      continue;
    }

    // Likely a new project header
    if (!current || current.bullets.length > 0 || trimmed.length <= 100) {
      pushCurrent();
      const parts = trimmed.split(/\s*\|\s*|\s+[—–]\s+/);
      const title = (parts[0] ?? trimmed).trim();
      let tech = "";
      let duration = "";
      for (const extra of parts.slice(1)) {
        if (
          /\b(19|20)\d{2}\b|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present/i.test(extra)
        ) {
          duration = extra.trim();
        } else if (!tech) {
          tech = extra.trim();
        }
      }
      current = {
        id: createId("proj"),
        title,
        tech,
        duration,
        link: "",
        bullets: [],
      };
    } else {
      current.bullets.push(trimmed);
    }
  }

  pushCurrent();
  return projects;
}

function parseInternshipLines(lines: string[]): ResumeData["internships"] {
  const internships: ResumeData["internships"] = [];
  let current: ResumeData["internships"][number] | null = null;

  const pushCurrent = () => {
    if (current && (current.role || current.company || current.bullets.some((b) => b.trim()))) {
      if (current.bullets.length === 0) current.bullets = [""];
      internships.push(current);
    }
    current = null;
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (isBulletLine(trimmed)) {
      const bullet = cleanBulletPrefix(trimmed);
      if (!current) {
        current = {
          id: createId("intern"),
          role: "Experience",
          company: "",
          location: "",
          duration: "",
          bullets: [],
        };
      }
      if (bullet) current.bullets.push(bullet);
      continue;
    }

    const durationMatch = trimmed.match(
      /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(?:19|20)\d{2}\s*(?:[-–—to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(?:19|20)\d{2}|present))?|(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|present))/i,
    );

    if (!current || current.bullets.length > 0) {
      pushCurrent();
      const withoutDate = durationMatch
        ? trimmed
            .replace(durationMatch[0], "")
            .replace(/[|,\-–—]+$/, "")
            .trim()
        : trimmed;
      const splitParts = withoutDate.split(/\s+(?:—|–|at|@)\s+|\s*\|\s*/i);

      current = {
        id: createId("intern"),
        role: (splitParts[0] ?? withoutDate).trim(),
        company: (splitParts[1] ?? "").trim(),
        location: (splitParts[2] ?? "").trim(),
        duration: durationMatch ? durationMatch[0].trim() : "",
        bullets: [],
      };
    } else if (!current.company && trimmed.length < 70) {
      current.company = durationMatch
        ? trimmed
            .replace(durationMatch[0], "")
            .replace(/[|,\-–—]+$/, "")
            .trim()
        : trimmed;
      if (durationMatch && !current.duration) {
        current.duration = durationMatch[0].trim();
      }
    } else {
      current.bullets.push(trimmed);
    }
  }

  pushCurrent();
  return internships;
}

function parseCertificationLines(lines: string[]): ResumeData["certifications"] {
  const certs: ResumeData["certifications"] = [];
  for (const raw of lines) {
    const cleaned = cleanBulletPrefix(raw);
    if (!cleaned) continue;
    const yearMatch = cleaned.match(/\b((?:19|20)\d{2})\b/);
    const withoutYear = yearMatch
      ? cleaned
          .replace(yearMatch[0], "")
          .replace(/[\s,|()\-–—]+$/, "")
          .trim()
      : cleaned;
    const parts = withoutYear.split(/\s*[—–|]\s*|\s+-\s+/);
    certs.push({
      id: createId("cert"),
      name: (parts[0] ?? withoutYear).trim(),
      issuer: (parts[1] ?? "").trim(),
      date: yearMatch ? (yearMatch[1] ?? "") : "",
      credentialUrl: "",
    });
  }
  return certs;
}

function parseAchievementLines(lines: string[]): ResumeData["achievements"] {
  const achievements: ResumeData["achievements"] = [];
  for (const raw of lines) {
    const cleaned = cleanBulletPrefix(raw);
    if (!cleaned) continue;
    const yearMatch = cleaned.match(/\b((?:19|20)\d{2})\b/);
    const parts = cleaned.split(/\s*[—–|]\s*|\s+-\s+/);
    const title = (parts[0] ?? cleaned).replace(/\((?:19|20)\d{2}\)/g, "").trim();
    const detail = parts.slice(1).join(" — ").trim();
    achievements.push({
      id: createId("ach"),
      title,
      date: yearMatch ? (yearMatch[1] ?? "") : "",
      detail,
    });
  }
  return achievements;
}

export function parseResumeTextToData(
  rawText: string,
  existingStudent?: Student | null,
): ParsedResumeResult {
  const base = createEmptyResume(existingStudent);
  // Start with truly blank education/personal when parsing an uploaded file so uploaded data is authoritative
  const resumeData: ResumeData = {
    ...base,
    personal: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    education: [],
  };

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00a0/g, " ").trim())
    .filter((l) => l.length > 0);

  // Extract contact entities anywhere in top block / document
  const topBlock = lines.slice(0, 10).join("\n");
  const emailMatch = rawText.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) resumeData.personal.email = emailMatch[0].trim();

  const phoneMatch = rawText.match(
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{4,5}/,
  );
  if (phoneMatch && phoneMatch[0].replace(/\D/g, "").length >= 7) {
    resumeData.personal.phone = phoneMatch[0].trim();
  }

  const linkedinMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i,
  );
  if (linkedinMatch) resumeData.personal.linkedin = linkedinMatch[0].replace(/^https?:\/\//i, "");

  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_.-]+/i);
  if (githubMatch) resumeData.personal.github = githubMatch[0].replace(/^https?:\/\//i, "");

  const portfolioMatch = topBlock.match(
    /https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[^\s|,]+/i,
  );
  if (portfolioMatch) resumeData.personal.portfolio = portfolioMatch[0];

  // Partition lines into sections
  const buckets: Record<SectionKey, string[]> = {
    header: [],
    objective: [],
    summary: [],
    education: [],
    skills: [],
    projects: [],
    internships: [],
    certifications: [],
    achievements: [],
  };

  let currentSection: SectionKey = "header";
  const detectedSections = new Set<string>();

  for (const line of lines) {
    const matchedHeading = matchSectionHeading(line);
    if (matchedHeading) {
      currentSection = matchedHeading;
      detectedSections.add(matchedHeading);
      continue;
    }
    buckets[currentSection].push(line);
  }

  // Name & Headline from header lines (excluding contact-only lines)
  const headerNonContact = buckets.header.filter(
    (l) => !/@/.test(l) && !/linkedin\.com|github\.com/i.test(l) && l.replace(/\D/g, "").length < 7,
  );
  if (headerNonContact[0]) {
    resumeData.personal.fullName = headerNonContact[0].replace(/[|•]+$/g, "").trim();
  }
  if (headerNonContact[1] && headerNonContact[1].length <= 95) {
    resumeData.personal.headline = headerNonContact[1].trim();
  }

  // Try extracting city/location from header lines if comma-separated (e.g. "Bengaluru, India")
  for (const hLine of buckets.header) {
    const locMatch = hLine.match(
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*(?:India|USA|UK|Canada|Remote|[A-Z]{2}))\b/,
    );
    if (locMatch) {
      resumeData.personal.location = locMatch[1] ?? "";
      break;
    }
  }

  if (buckets.objective.length > 0) {
    resumeData.careerObjective = buckets.objective.join(" ").replace(/\s+/g, " ").trim();
  }
  if (buckets.summary.length > 0) {
    resumeData.summary = buckets.summary.join(" ").replace(/\s+/g, " ").trim();
  }
  if (buckets.education.length > 0) {
    resumeData.education = parseEducationLines(buckets.education);
  }
  if (buckets.skills.length > 0) {
    resumeData.skills = parseSkillsLines(buckets.skills);
  }
  if (buckets.projects.length > 0) {
    resumeData.projects = parseProjectLines(buckets.projects);
  }
  if (buckets.internships.length > 0) {
    resumeData.internships = parseInternshipLines(buckets.internships);
  }
  if (buckets.certifications.length > 0) {
    resumeData.certifications = parseCertificationLines(buckets.certifications);
  }
  if (buckets.achievements.length > 0) {
    resumeData.achievements = parseAchievementLines(buckets.achievements);
  }

  const allSectionLabels: Array<{
    key: keyof ResumeData | "personal";
    label: string;
    present: boolean;
  }> = [
    {
      key: "personal",
      label: "Personal Details",
      present: Boolean(resumeData.personal.fullName && resumeData.personal.email),
    },
    { key: "summary", label: "Professional Summary", present: Boolean(resumeData.summary) },
    {
      key: "careerObjective",
      label: "Career Objective",
      present: Boolean(resumeData.careerObjective),
    },
    { key: "education", label: "Education", present: resumeData.education.length > 0 },
    { key: "skills", label: "Technical Skills", present: resumeData.skills.length > 0 },
    { key: "projects", label: "Projects", present: resumeData.projects.length > 0 },
    {
      key: "internships",
      label: "Internships / Work Experience",
      present: resumeData.internships.length > 0,
    },
    {
      key: "certifications",
      label: "Certifications",
      present: resumeData.certifications.length > 0,
    },
    { key: "achievements", label: "Achievements", present: resumeData.achievements.length > 0 },
  ];

  const warnings: string[] = [];
  if (detectedSections.size === 0) {
    warnings.push(
      "Standard section headings (e.g., Education, Skills, Projects, Experience) were not clearly detected. Review and edit the parsed fields below.",
    );
  }

  return {
    resumeData,
    detectedSections: allSectionLabels.filter((s) => s.present).map((s) => s.label),
    missingSections: allSectionLabels.filter((s) => !s.present).map((s) => s.label),
    rawText,
    warnings,
  };
}
