import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  analyzeResumeATS,
  analyzeResumeComprehensive,
  applyResumeOptimizationPlan,
  buildResumeOptimizationPlan,
  calculateResumeCompletion,
  compareResumeWithVersion,
  createEmptyResume,
  generateProfessionalSummary,
  improveGrammarAndStructure,
  matchResumeWithJobDescription,
  saveResumeVersion,
  suggestSkillsFromProjects,
  type ResumeData,
} from "@/lib/resume-engine";
import { extractTextFromResumeFile, parseResumeTextToData } from "@/lib/resume-extractor";
import { buildResumePdfFilename, generateResumePdf } from "@/lib/resume-pdf";
import * as resumePdfModule from "@/lib/resume-pdf";
import { ResumeBuilderModule } from "@/components/modules/ResumeBuilderModule";

// Minimal pure-JS STORE-mode ZIP builder for generating real valid binary .docx files in tests
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i]!;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildMinimalDocxBytes(paragraphs: string[]): Uint8Array {
  const escXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const docXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>` +
    paragraphs.map((p) => `<w:p><w:r><w:t>${escXml(p)}</w:t></w:r></w:p>`).join("") +
    `</w:body></w:document>`;
  const contentTypesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `</Types>`;
  const relsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;

  const enc = new TextEncoder();
  const files = [
    { name: "[Content_Types].xml", data: enc.encode(contentTypesXml) },
    { name: "_rels/.rels", data: enc.encode(relsXml) },
    { name: "word/document.xml", data: enc.encode(docXml) },
  ];

  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const crc = crc32(f.data);

    const localHeader = new ArrayBuffer(30 + nameBytes.length);
    const lv = new DataView(localHeader);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true); // STORE
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, f.data.length, true);
    lv.setUint32(22, f.data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    new Uint8Array(localHeader, 30).set(nameBytes);

    const centralHeader = new ArrayBuffer(46 + nameBytes.length);
    const cv = new DataView(centralHeader);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, f.data.length, true);
    cv.setUint32(24, f.data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    new Uint8Array(centralHeader, 46).set(nameBytes);

    localParts.push(new Uint8Array(localHeader), f.data);
    centralParts.push(new Uint8Array(centralHeader));
    offset += 30 + nameBytes.length + f.data.length;
  }

  const centralSize = centralParts.reduce((s, p) => s + p.length, 0);
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLen = offset + centralSize + 22;
  const out = new Uint8Array(totalLen);
  let pos = 0;
  for (const part of [...localParts, ...centralParts, new Uint8Array(eocd)]) {
    out.set(part, pos);
    pos += part.length;
  }
  return out;
}

describe("Resume Builder Engine & Module", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("1. ATS Analysis & Completion Separation", () => {
    it("scores an empty resume at 0/100 with itemized deductions totaling 100 and identifies all missing sections", () => {
      const empty = createEmptyResume();
      const completion = calculateResumeCompletion(empty);
      const ats = analyzeResumeATS(empty);

      expect(completion.percentage).toBe(0);
      expect(completion.completedCount).toBe(0);
      expect(completion.totalSections).toBe(9);

      expect(ats.score).toBe(0);
      expect(ats.totalDeducted).toBe(100);
      const deductionSum = ats.deductions.reduce((sum, d) => sum + d.points, 0);
      expect(deductionSum).toBe(100);
      expect(ats.missingSections).toContain("Education");
      expect(ats.missingSections).toContain("Skills");
      expect(ats.missingSections).toContain("Projects");
      expect(ats.missingSections).toContain("Internships");
      expect(ats.missingSections).toContain("Certifications");
      expect(ats.missingSections).toContain("Achievements");
    });

    it("separates Resume Completion % from ATS Score when all 9 sections are minimally filled", () => {
      const minimal: ResumeData = {
        personal: {
          fullName: "Priya Nair",
          headline: "",
          email: "priya@college.edu",
          phone: "9876543210",
          location: "",
          linkedin: "",
          github: "",
          portfolio: "",
        },
        careerObjective: "Software role",
        summary: "Computer science student looking for roles.",
        education: [
          {
            id: "e1",
            degree: "B.Tech CSE",
            institution: "NIT Trichy",
            location: "",
            startYear: "",
            endYear: "",
            grade: "",
            coursework: "",
          },
        ],
        skills: ["Python"],
        projects: [
          {
            id: "p1",
            title: "Notes App",
            tech: "Python",
            duration: "",
            link: "",
            bullets: ["made a notes app"],
          },
        ],
        internships: [
          {
            id: "i1",
            role: "Intern",
            company: "Acme Corp",
            location: "",
            duration: "",
            bullets: ["worked on backend"],
          },
        ],
        certifications: [
          { id: "c1", name: "Python Basics", issuer: "NPTEL", date: "2024", credentialUrl: "" },
        ],
        achievements: [{ id: "a1", title: "Coding Contest", date: "2024", detail: "Top 10" }],
      };

      const completion = calculateResumeCompletion(minimal);
      const ats = analyzeResumeATS(minimal);

      expect(completion.percentage).toBe(100);
      expect(completion.completedCount).toBe(9);
      // ATS should still deduct marks for missing links, brief summary, few skills, weak verbs, no metrics
      expect(ats.score).toBeLessThan(70);
      expect(ats.score + ats.totalDeducted).toBe(100);
      expect(ats.deductions.reduce((s, d) => s + d.points, 0)).toBe(ats.totalDeducted);
      expect(ats.deductions.some((d) => /linkedin/i.test(d.reason))).toBe(true);
      expect(ats.deductions.some((d) => /metrics|measurable/i.test(d.reason))).toBe(true);
    });
  });

  describe("2. Grounded AI Resume Assistant (Zero Fabrication)", () => {
    it("generates summary strictly from entered details without inventing unmentioned companies or metrics", () => {
      const custom: ResumeData = {
        ...createEmptyResume(),
        education: [
          {
            id: "e1",
            degree: "B.E. Electronics",
            institution: "PSG Tech",
            location: "Coimbatore",
            startYear: "2021",
            endYear: "2025",
            grade: "8.4 CGPA",
            coursework: "Embedded Systems",
          },
        ],
        skills: ["C", "Embedded C", "RTOS"],
        projects: [
          {
            id: "p1",
            title: "Smart Energy Meter",
            tech: "C, ESP32, MQTT",
            duration: "2024",
            link: "",
            bullets: ["Built real-time power telemetry firmware."],
          },
        ],
      };

      const generated = generateProfessionalSummary(custom, "technical");
      expect(generated.summary).toContain("B.E. Electronics");
      expect(generated.summary).toContain("PSG Tech");
      expect(generated.summary).toContain("Embedded C");
      expect(generated.summary).toContain("Smart Energy Meter");
      // Must NOT fabricate metrics or unrelated internships
      expect(generated.summary).not.toMatch(/Google|Microsoft|Amazon|42%|99%/i);
      expect(generated.usedSources).toEqual(
        expect.arrayContaining(["Education", "Skills", "Projects"]),
      );
    });

    it("improves grammar and sentence structure without adding fabricated metrics", () => {
      const res = improveGrammarAndStructure(
        "i worked on a engineering dashboard with a lot of charts",
        "bullet",
      );
      expect(res.improved).toBe("Developed an engineering dashboard with multiple charts.");
      expect(res.changes.length).toBeGreaterThan(0);
      expect(res.improved).not.toMatch(/\d+%/);
      expect(res.guidance).toMatch(/no numbers were added/i);
    });

    it("suggests relevant skills strictly from project and internship content", () => {
      const custom: ResumeData = {
        ...createEmptyResume(),
        skills: ["React"],
        projects: [
          {
            id: "p1",
            title: "Order Tracking API",
            tech: "Node.js, PostgreSQL, Docker",
            duration: "",
            link: "",
            bullets: ["Implemented Redis caching and unit testing for order endpoints."],
          },
        ],
      };

      const res = suggestSkillsFromProjects(custom);
      const skillNames = res.suggestedSkills.map((s) => s.skill);
      expect(skillNames).toContain("Node.js");
      expect(skillNames).toContain("PostgreSQL");
      expect(skillNames).toContain("Docker");
      expect(skillNames).toContain("Redis");
      expect(skillNames).not.toContain("React"); // already present
    });
  });

  describe("3. Interactive UI, Live Preview, Auto-Save & PDF Download", () => {
    it("allows editing all sections, adding/deleting multiple entries, auto-saving, and updating live preview immediately", () => {
      const { unmount } = render(<ResumeBuilderModule />);

      // Edit Personal Details & Career Objective
      const nameInput = screen.getByLabelText("Full Name") as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "Ananya Krishnan" } });

      const objectiveInput = screen.getByLabelText("Career Objective") as HTMLTextAreaElement;
      fireEvent.change(objectiveInput, {
        target: { value: "Seeking a Backend Engineer role building distributed APIs." },
      });

      // Verify live preview updated immediately
      const preview = screen.getByTestId("resume-preview-sheet");
      expect(preview.textContent).toContain("Ananya Krishnan");
      expect(preview.textContent).toContain(
        "Seeking a Backend Engineer role building distributed APIs.",
      );

      // Add a new Skill
      const skillInput = screen.getByLabelText("New Skill") as HTMLInputElement;
      fireEvent.change(skillInput, { target: { value: "Kubernetes" } });
      fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
      expect(preview.textContent).toContain("Kubernetes");

      // Add a second Certification and delete the first
      fireEvent.click(screen.getByRole("button", { name: /add certification/i }));
      const cert2Input = screen.getByLabelText("Certification 2 Name") as HTMLInputElement;
      fireEvent.change(cert2Input, { target: { value: "CKAD Certified Developer" } });
      expect(preview.textContent).toContain("CKAD Certified Developer");

      fireEvent.click(screen.getByRole("button", { name: "Delete Certification 1" }));
      expect(preview.textContent).not.toContain("AWS Certified Cloud Practitioner");

      // Add a new Achievement
      fireEvent.click(screen.getByRole("button", { name: /add achievement/i }));
      const ach2Input = screen.getByLabelText("Achievement 2 Title") as HTMLInputElement;
      fireEvent.change(ach2Input, { target: { value: "ICPC Regionalist" } });
      expect(preview.textContent).toContain("ICPC Regionalist");

      // Switch template and verify immediately reflected
      fireEvent.click(screen.getByRole("button", { name: "Modern Minimal" }));
      expect(screen.getByTestId("resume-preview-sheet").getAttribute("data-template")).toBe(
        "modern",
      );

      // Unmount and remount — auto-saved state & template must persist
      unmount();
      render(<ResumeBuilderModule />);
      const restoredPreview = screen.getByTestId("resume-preview-sheet");
      expect(restoredPreview.textContent).toContain("Ananya Krishnan");
      expect(restoredPreview.textContent).toContain("Kubernetes");
      expect(restoredPreview.textContent).toContain("CKAD Certified Developer");
      expect(restoredPreview.textContent).toContain("ICPC Regionalist");
      expect(restoredPreview.getAttribute("data-template")).toBe("modern");
    }, 15000);

    it("renders separated Completion % and ATS Score cards and displays ATS deduction reasons", () => {
      render(<ResumeBuilderModule />);

      const completionCard = screen.getByTestId("completion-card");
      const atsCard = screen.getByTestId("ats-score-card");
      expect(completionCard.textContent).toMatch(/resume completion/i);
      expect(completionCard.textContent).toMatch(/100%/);
      expect(atsCard.textContent).toMatch(/ats compatibility score/i);

      // Clear all and verify both drop to 0 and ATS explains deductions
      fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
      expect(completionCard.textContent).toMatch(/0%/);
      expect(atsCard.textContent).toMatch(/0 \/ 100/);

      // Open ATS breakdown
      fireEvent.click(screen.getByRole("button", { name: /why -100 pts/i }));
      const atsPanel = screen.getByTestId("ats-analysis-panel");
      expect(atsPanel.textContent).toMatch(/why marks were deducted \(-100 pts total\)/i);
      expect(atsPanel.textContent).toMatch(/education section is empty/i);
    });

    it("downloads a PDF containing the latest edited resume content", () => {
      const saveSpy = vi
        .spyOn(resumePdfModule, "downloadResumePdf")
        .mockImplementation((resume, template) => {
          const doc = generateResumePdf(resume, template);
          expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
          return buildResumePdfFilename(resume.personal.fullName);
        });

      render(<ResumeBuilderModule />);

      fireEvent.change(screen.getByLabelText("Full Name"), {
        target: { value: "Rohan Deshmukh" },
      });
      fireEvent.change(screen.getByLabelText("Career Objective"), {
        target: { value: "Targeting Cloud Platform Engineering internships." },
      });

      fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

      expect(saveSpy).toHaveBeenCalledTimes(1);
      const [passedResume, passedTemplate] = saveSpy.mock.calls[0]!;
      expect(passedResume.personal.fullName).toBe("Rohan Deshmukh");
      expect(passedResume.careerObjective).toBe(
        "Targeting Cloud Platform Engineering internships.",
      );
      expect(passedTemplate).toBe("classic");

      // Also verify direct PDF binary generation succeeds cleanly
      const pdfDoc = generateResumePdf(passedResume, "compact");
      const output = pdfDoc.output("arraybuffer");
      expect(output.byteLength).toBeGreaterThan(500);
    });
  });

  describe("4. Real PDF & DOCX Resume Upload, Extraction & Error Handling", () => {
    it("extracts real text and structured resume fields from an uploaded PDF file", async () => {
      const sample: ResumeData = {
        ...createEmptyResume(),
        personal: {
          fullName: "Meera Venkatesh",
          headline: "Full-Stack Computer Science Student",
          email: "meera.v@college.edu",
          phone: "+91 98111 22334",
          location: "Chennai, India",
          linkedin: "linkedin.com/in/meerav",
          github: "github.com/meerav",
          portfolio: "",
        },
        careerObjective: "Seeking Software Engineering roles in cloud-native backend systems.",
        summary:
          "Computer Science undergraduate skilled in TypeScript, Python, PostgreSQL, and distributed backend engineering.",
        education: [
          {
            id: "edu-1",
            degree: "B.Tech in Computer Science",
            institution: "VIT Vellore",
            location: "Vellore, India",
            startYear: "2022",
            endYear: "2026",
            grade: "CGPA: 9.1 / 10",
            coursework: "Operating Systems, DBMS",
          },
        ],
        skills: ["TypeScript", "Python", "React", "PostgreSQL", "Docker"],
        projects: [
          {
            id: "p1",
            title: "Realtime Telemetry Hub",
            tech: "TypeScript, PostgreSQL",
            duration: "2025",
            link: "github.com/meerav/telemetry",
            bullets: ["Built event ingestion pipeline processing 2,000 events per second."],
          },
        ],
      };

      const pdfBytes = new Uint8Array(generateResumePdf(sample, "classic").output("arraybuffer"));
      const pdfFile = new File([pdfBytes], "Meera_Resume.pdf", { type: "application/pdf" });

      const extracted = await extractTextFromResumeFile(pdfFile);
      expect(extracted.fileType).toBe("pdf");
      expect(extracted.pageCount).toBeGreaterThanOrEqual(1);
      expect(extracted.rawText).toContain("Meera Venkatesh");
      expect(extracted.rawText).toContain("meera.v@college.edu");
      expect(extracted.rawText).toContain("Realtime Telemetry Hub");

      const parsed = parseResumeTextToData(extracted.rawText);
      expect(parsed.resumeData.personal.email).toBe("meera.v@college.edu");
      expect(parsed.resumeData.personal.linkedin).toContain("linkedin.com/in/meerav");
      expect(parsed.resumeData.skills.join(" ")).toContain("TypeScript");
    }, 15000);

    it("extracts real text and structured sections from an uploaded DOCX file and loads it in the UI", async () => {
      const docxBytes = buildMinimalDocxBytes([
        "Siddharth Rao",
        "siddharth.rao@university.edu | +91 90000 11223 | linkedin.com/in/sidrao | github.com/sidrao",
        "Summary",
        "Final-year Computer Science student experienced in Java, Spring Boot, PostgreSQL, and Docker.",
        "Education",
        "B.E. Computer Science, BMS College of Engineering, 2022 - 2026, CGPA: 8.8",
        "Skills",
        "Java, Spring Boot, SQL, PostgreSQL, Docker, Git, React, TypeScript",
        "Projects",
        "Campus Placement Portal | React, Java",
        "- Built REST endpoints serving 400+ students and automated shortlisting.",
        "Certifications",
        "AWS Certified Cloud Practitioner — Amazon Web Services (2024)",
      ]);

      const docxFile = new File([Uint8Array.from(docxBytes)], "Siddharth_Rao.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      render(<ResumeBuilderModule />);
      fireEvent.click(screen.getByRole("button", { name: /^upload resume$/i }));

      const fileInput = screen.getByLabelText("Upload Resume File") as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [docxFile] } });

      await waitFor(() => {
        expect(screen.getByTestId("uploaded-raw-text").textContent).toContain("Siddharth Rao");
      });

      const preview = screen.getByTestId("resume-preview-sheet");
      expect(preview.textContent).toContain("Siddharth Rao");
      expect(preview.textContent).toContain("siddharth.rao@university.edu");
      expect(preview.textContent).toContain("Spring Boot");
    }, 15000);

    it("handles unsupported, empty, and corrupted uploaded files gracefully with clear errors", async () => {
      const unsupported = new File(["hello"], "notes.txt", { type: "text/plain" });
      await expect(extractTextFromResumeFile(unsupported)).rejects.toThrow(/unsupported file/i);

      const emptyPdf = new File([], "empty.pdf", { type: "application/pdf" });
      await expect(extractTextFromResumeFile(emptyPdf)).rejects.toThrow(/empty/i);

      const corruptPdf = new File(["not-really-a-pdf-body"], "broken.pdf", {
        type: "application/pdf",
      });
      await expect(extractTextFromResumeFile(corruptPdf)).rejects.toThrow(/valid pdf/i);

      render(<ResumeBuilderModule />);
      fireEvent.click(screen.getByRole("button", { name: /^upload resume$/i }));
      const fileInput = screen.getByLabelText("Upload Resume File") as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [corruptPdf] } });

      await waitFor(() => {
        expect(screen.getByTestId("upload-error-alert").textContent).toMatch(/valid pdf/i);
      });
    });
  });

  describe("5. 8-Area AI Analysis, ATS Disclaimer, Job Description Match & Improve My Resume", () => {
    it("identifies spelling errors, weak descriptions, formatting issues, clutter, and 8 evaluation areas", () => {
      const flawed: ResumeData = {
        ...createEmptyResume(),
        personal: {
          fullName: "Kiran Verma",
          headline: "Software Developer",
          email: "kiran@college.edu",
          phone: "9876543210",
          location: "Pune",
          linkedin: "linkedin.com/in/kiran",
          github: "",
          portfolio: "",
        },
        careerObjective: "Seeking developer role. References available upon request.",
        summary: "Hardworking team player with experiance in javscript and databse tools.",
        skills: ["JavaScript", "javascript", "Pyhton"],
        projects: [
          {
            id: "p1",
            title: "Inventory App",
            tech: "React, Node.js",
            duration: "2024",
            link: "",
            bullets: ["i worked on a inventory system"],
          },
        ],
      };

      const analysis = analyzeResumeComprehensive(flawed);
      expect(analysis.sectionEvaluations).toHaveLength(8);
      expect(analysis.spellingMistakes.map((m) => m.misspelled.toLowerCase())).toEqual(
        expect.arrayContaining(["experiance", "javscript", "databse", "pyhton"]),
      );
      expect(analysis.weakDescriptions.some((w) => /worked on/i.test(w.currentText))).toBe(true);
      expect(analysis.formattingIssues.some((f) => /duplicate skills/i.test(f.issue))).toBe(true);
      expect(analysis.formattingIssues.some((f) => /first-person/i.test(f.issue))).toBe(true);
      expect(analysis.unnecessaryClutter.some((c) => /references available/i.test(c.phrase))).toBe(
        true,
      );

      const ats = analyzeResumeATS(flawed);
      expect(ats.categories).toHaveLength(7);
      expect(ats.disclaimer).toMatch(/does NOT represent the result of any specific employer/i);

      // Grounded optimization plan fixes issues without fabricating experience
      const plan = buildResumeOptimizationPlan(flawed);
      const applicableIds = plan.items.filter((i) => i.applicable).map((i) => i.id);
      expect(applicableIds.length).toBeGreaterThan(0);

      const improved = applyResumeOptimizationPlan(flawed, applicableIds, plan);
      expect(improved.projects[0]!.bullets[0]).toMatch(/^Developed/i);
      expect(improved.skills).toContain("React");
      expect(improved.skills).toContain("Python");
      expect(improved.skills.filter((s) => s.toLowerCase() === "javascript")).toHaveLength(1);
      expect(improved.careerObjective).not.toMatch(/references available/i);
      expect(improved.summary).not.toMatch(/Google|Microsoft|99%/i);
    });

    it("compares resume against pasted Job Description and surfaces matching/missing skills, keywords & score", () => {
      render(<ResumeBuilderModule />);

      fireEvent.click(screen.getByRole("button", { name: /job match/i }));
      const jdBox = screen.getByLabelText("Paste Job Description") as HTMLTextAreaElement;
      fireEvent.change(jdBox, {
        target: {
          value:
            "Looking for a Backend & Full-Stack Engineer skilled in TypeScript, React, Node.js, PostgreSQL, Docker, Kubernetes, GraphQL, Data Structures, Algorithms, and System Design.",
        },
      });
      fireEvent.click(screen.getByRole("button", { name: /compare with job description/i }));

      const jdPanel = screen.getByTestId("jd-match-panel");
      expect(jdPanel.textContent).toMatch(/job-specific compatibility score/i);
      expect(jdPanel.textContent).toContain("TypeScript");
      expect(jdPanel.textContent).toContain("Kubernetes");
      expect(jdPanel.textContent).toContain("GraphQL");

      const directMatch = matchResumeWithJobDescription(
        createEmptyResume(),
        "Requires Python, Docker, SQL, and Algorithms.",
      );
      expect(directMatch.missingSkills).toEqual(
        expect.arrayContaining(["Python", "Docker", "SQL"]),
      );
      expect(directMatch.missingKeywords).toContain("Algorithms");
    });

    it("renders 8-area analysis disclaimer, applies Improve My Resume in UI, switches templates, and compares Resume History", () => {
      render(<ResumeBuilderModule />);

      // Verify ATS disclaimer in Analysis tab
      fireEvent.click(screen.getByRole("button", { name: /analyze resume/i }));
      expect(screen.getByTestId("ats-disclaimer").textContent).toMatch(
        /does not represent the result of any specific employer/i,
      );

      // Save an initial version in History
      const historyBefore = saveResumeVersion(
        createEmptyResume(),
        "classic",
        "Manual Save",
        "Baseline Empty Draft",
      );
      expect(historyBefore[0]!.atsScore).toBe(0);

      // Verify Improve My Resume interactive panel
      fireEvent.click(screen.getByRole("button", { name: /^improve my resume$/i }));
      expect(screen.getByTestId("improve-resume-panel")).toBeInTheDocument();

      // Switch across requested templates: Modern Professional, Technical Developer, Fresher / Student
      fireEvent.click(screen.getByRole("button", { name: "Modern Professional" }));
      expect(screen.getByTestId("resume-preview-sheet").getAttribute("data-template")).toBe(
        "modern-pro",
      );
      fireEvent.click(screen.getByRole("button", { name: "Technical Developer" }));
      expect(screen.getByTestId("resume-preview-sheet").getAttribute("data-template")).toBe(
        "tech-dev",
      );
      fireEvent.click(screen.getByRole("button", { name: "Fresher / Student" }));
      expect(screen.getByTestId("resume-preview-sheet").getAttribute("data-template")).toBe(
        "classic",
      );

      // Verify Resume History tab & version comparison helper
      fireEvent.click(screen.getByRole("button", { name: /^history/i }));
      expect(screen.getByTestId("resume-history-panel")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /save version snapshot/i }));
      expect(screen.getByTestId("history-comparison-card")).toBeInTheDocument();

      const cmp = compareResumeWithVersion(
        analyzeResumeATS(createEmptyResume()),
        historyBefore[0]!,
      );
      expect(cmp.overallDelta).toBe(0);
    }, 15000);
  });
});
