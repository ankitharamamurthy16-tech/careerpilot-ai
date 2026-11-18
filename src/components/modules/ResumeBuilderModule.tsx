import { useState, useEffect, useMemo, useRef, type ChangeEvent } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  Trash2,
  Printer,
  Save,
  Eye,
  Pencil,
  Wand2,
  BarChart3,
  RotateCcw,
  Columns2,
  ShieldCheck,
  Upload,
  Briefcase,
  History,
  ArrowUpRight,
  ArrowDownRight,
  SpellCheck2,
  LayoutList,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { getStudent } from "@/lib/auth";
import {
  analyzeResumeATS,
  analyzeResumeComprehensive,
  applyResumeOptimizationPlan,
  buildResumeOptimizationPlan,
  calculateResumeCompletion,
  compareResumeWithVersion,
  createEmptyResume,
  createId,
  createStarterResume,
  deleteResumeVersion,
  generateProfessionalSummary,
  improveGrammarAndStructure,
  loadResumeHistory,
  loadSavedResume,
  matchResumeWithJobDescription,
  saveResumeToStorage,
  saveResumeVersion,
  suggestSkillsFromProjects,
  type GrammarImprovementResult,
  type JobDescriptionMatchResult,
  type ResumeData,
  type ResumeTemplate,
  type ResumeVersionRecord,
  type SummaryStyle,
} from "@/lib/resume-engine";
import {
  extractTextFromResumeFile,
  parseResumeTextToData,
  type SupportedResumeFileType,
} from "@/lib/resume-extractor";
import { downloadResumePdf } from "@/lib/resume-pdf";
import { ResumePreview } from "./ResumePreview";

type LeftPanelTab = "edit" | "upload" | "ai" | "ats" | "jd" | "improve" | "history";
type MobileViewMode = "split" | "edit" | "ai-ats" | "preview";

interface UploadedResumeSummary {
  fileName: string;
  fileType: SupportedResumeFileType;
  pageCount?: number;
  rawText: string;
  detectedSections: string[];
  missingSections: string[];
  warnings: string[];
}

type GrammarTarget =
  | { kind: "summary"; label: string }
  | { kind: "objective"; label: string }
  | { kind: "project-bullet"; projectId: string; bulletIdx: number; label: string }
  | { kind: "internship-bullet"; internshipId: string; bulletIdx: number; label: string }
  | { kind: "achievement-detail"; achievementId: string; label: string };

export function ResumeBuilderModule() {
  const student = useMemo(() => getStudent(), []);
  const initialStored = useMemo(() => loadSavedResume(student), [student]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [resume, setResume] = useState<ResumeData>(initialStored.data);
  const [template, setTemplate] = useState<ResumeTemplate>(initialStored.template);
  const [lastSavedAt, setLastSavedAt] = useState<string>(initialStored.lastSavedAt);
  const [leftTab, setLeftTab] = useState<LeftPanelTab>("edit");
  const [viewMode, setViewMode] = useState<MobileViewMode>("split");
  const [newSkill, setNewSkill] = useState("");

  // Upload & extraction state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedSummary, setUploadedSummary] = useState<UploadedResumeSummary | null>(null);

  // Job description matching state
  const [jobDescription, setJobDescription] = useState("");
  const [jdMatchResult, setJdMatchResult] = useState<JobDescriptionMatchResult | null>(null);

  // Interactive "Improve My Resume" state
  const [selectedOptIds, setSelectedOptIds] = useState<string[]>([]);

  // Resume Version History state
  const [history, setHistory] = useState<ResumeVersionRecord[]>(() =>
    loadResumeHistory(student?.email),
  );
  const [versionLabel, setVersionLabel] = useState("");
  const [compareVersionId, setCompareVersionId] = useState<string>(() => {
    const existing = loadResumeHistory(student?.email);
    return existing[0]?.id ?? "";
  });

  // AI Assistant state
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>("technical");
  const [summaryPreview, setSummaryPreview] = useState<ReturnType<
    typeof generateProfessionalSummary
  > | null>(null);
  const [grammarTarget, setGrammarTarget] = useState<GrammarTarget>({
    kind: "summary",
    label: "Professional Summary",
  });
  const [grammarPreview, setGrammarPreview] = useState<GrammarImprovementResult | null>(null);

  // Auto-save whenever resume or template changes
  useEffect(() => {
    const savedAt = saveResumeToStorage(resume, template, student?.email);
    setLastSavedAt(savedAt);
  }, [resume, template, student?.email]);

  // Derived real-time metrics (strictly separated: Completion % vs ATS Score)
  const completion = useMemo(() => calculateResumeCompletion(resume), [resume]);
  const ats = useMemo(() => analyzeResumeATS(resume), [resume]);
  const comprehensive = useMemo(() => analyzeResumeComprehensive(resume), [resume]);
  const optimizationPlan = useMemo(
    () => buildResumeOptimizationPlan(resume, jobDescription),
    [resume, jobDescription],
  );
  const skillSuggestions = useMemo(() => suggestSkillsFromProjects(resume), [resume]);

  useEffect(() => {
    setSelectedOptIds(optimizationPlan.items.filter((i) => i.applicable).map((i) => i.id));
  }, [optimizationPlan]);

  useEffect(() => {
    if (jobDescription.trim().length >= 15 && jdMatchResult) {
      setJdMatchResult(matchResumeWithJobDescription(resume, jobDescription));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

  const handleManualSave = () => {
    const savedAt = saveResumeToStorage(resume, template, student?.email);
    setLastSavedAt(savedAt);
    toast.success("Resume saved to your profile!");
  };

  const handleResumeFileUpload = async (file: File | null | undefined) => {
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      const extracted = await extractTextFromResumeFile(file);
      const parsed = parseResumeTextToData(extracted.rawText, student);
      const combinedWarnings = [...extracted.warnings, ...parsed.warnings];

      setResume(parsed.resumeData);
      setSummaryPreview(null);
      setGrammarPreview(null);
      setUploadedSummary({
        fileName: extracted.fileName,
        fileType: extracted.fileType,
        ...(typeof extracted.pageCount === "number" ? { pageCount: extracted.pageCount } : {}),
        rawText: extracted.rawText,
        detectedSections: parsed.detectedSections,
        missingSections: parsed.missingSections,
        warnings: combinedWarnings,
      });

      const updatedHistory = saveResumeVersion(
        parsed.resumeData,
        template,
        extracted.fileType === "pdf" ? "Uploaded PDF" : "Uploaded DOCX",
        `Uploaded: ${extracted.fileName}`,
        student?.email,
      );
      setHistory(updatedHistory);
      if (updatedHistory[0]) {
        setCompareVersionId(updatedHistory[0].id);
      }

      setLeftTab("upload");
      if (viewMode === "preview") setViewMode("ai-ats");
      toast.success(`Extracted and loaded "${extracted.fileName}"`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to read the uploaded resume file. Please upload a valid PDF or DOCX.";
      setUploadError(message);
      setLeftTab("upload");
      if (viewMode === "preview") setViewMode("ai-ats");
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleResumeFileUpload(file);
    e.target.value = "";
  };

  const handleAnalyzeJobMatch = () => {
    if (jobDescription.trim().length < 15) {
      toast.error("Please paste a full job description (at least 15 characters) to compare.");
      return;
    }
    const result = matchResumeWithJobDescription(resume, jobDescription);
    setJdMatchResult(result);
    toast.success(`Job match analyzed: ${result.compatibilityScore}/100`);
  };

  const toggleOptimizationItem = (id: string) => {
    setSelectedOptIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleApplySelectedOptimizations = () => {
    if (selectedOptIds.length === 0) {
      toast.info("Select at least one optimization item to apply.");
      return;
    }
    const improved = applyResumeOptimizationPlan(resume, selectedOptIds, optimizationPlan);
    setResume(improved);
    const updatedHistory = saveResumeVersion(
      improved,
      template,
      "AI Optimized",
      `AI Improved (${selectedOptIds.length} updates)`,
      student?.email,
    );
    setHistory(updatedHistory);
    toast.success(`Applied ${selectedOptIds.length} grounded optimization(s) to your resume.`);
  };

  const handleSaveHistoryVersion = () => {
    const updatedHistory = saveResumeVersion(
      resume,
      template,
      "Manual Save",
      versionLabel.trim() || undefined,
      student?.email,
    );
    setHistory(updatedHistory);
    setVersionLabel("");
    if (updatedHistory[0] && !compareVersionId) {
      setCompareVersionId(updatedHistory[0].id);
    }
    toast.success("Saved snapshot to Resume History!");
  };

  const handleRestoreVersion = (record: ResumeVersionRecord) => {
    setResume(record.resume);
    setTemplate(record.template);
    setSummaryPreview(null);
    setGrammarPreview(null);
    toast.success(`Restored version "${record.label}"`);
  };

  const handleDeleteVersion = (id: string) => {
    const updated = deleteResumeVersion(id, student?.email);
    setHistory(updated);
    if (compareVersionId === id) {
      setCompareVersionId(updated[0]?.id ?? "");
    }
    toast.info("Removed version from history.");
  };

  const handleDownloadPdf = () => {
    try {
      const filename = downloadResumePdf(resume, template);
      toast.success(`Downloaded ${filename}`);
    } catch {
      toast.error("Unable to generate PDF in this browser. Try using Print instead.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetStarter = () => {
    const starter = createStarterResume(student);
    setResume(starter);
    setSummaryPreview(null);
    setGrammarPreview(null);
    toast.info("Restored starter resume template.");
  };

  const handleClearAll = () => {
    setResume(createEmptyResume(student));
    setSummaryPreview(null);
    setGrammarPreview(null);
    toast.info("Cleared resume sections so you can build from scratch.");
  };

  // --- Personal Details ---
  const updatePersonal = (field: keyof ResumeData["personal"], value: string) => {
    setResume((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  // --- Skills ---
  const handleAddSkills = (rawInput?: string) => {
    const raw = (rawInput ?? newSkill).trim();
    if (!raw) return;
    const incoming = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;

    const existingLower = new Set(resume.skills.map((s) => s.toLowerCase()));
    const toAdd = incoming.filter((s) => !existingLower.has(s.toLowerCase()));

    if (toAdd.length === 0) {
      toast.info("Skill already exists in your list.");
      if (!rawInput) setNewSkill("");
      return;
    }

    setResume((prev) => ({ ...prev, skills: [...prev.skills, ...toAdd] }));
    if (!rawInput) setNewSkill("");
    toast.success(`Added ${toAdd.join(", ")}`);
  };

  const handleRemoveSkill = (idx: number) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  };

  // --- Education ---
  const handleAddEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: createId("edu"),
          degree: "",
          institution: "",
          location: "",
          startYear: "",
          endYear: "",
          grade: "",
          coursework: "",
        },
      ],
    }));
  };

  const updateEducation = (
    id: string,
    field: keyof ResumeData["education"][number],
    value: string,
  ) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const deleteEducation = (id: string) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  // --- Projects ---
  const handleAddProject = () => {
    setResume((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: createId("proj"),
          title: "",
          tech: "",
          duration: "",
          link: "",
          bullets: [""],
        },
      ],
    }));
  };

  const updateProjectField = (
    id: string,
    field: "title" | "tech" | "duration" | "link",
    value: string,
  ) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const deleteProject = (id: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const addProjectBullet = (projectId: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, bullets: [...p.bullets, ""] } : p,
      ),
    }));
  };

  const updateProjectBullet = (projectId: string, bulletIdx: number, value: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? { ...p, bullets: p.bullets.map((b, bi) => (bi === bulletIdx ? value : b)) }
          : p,
      ),
    }));
  };

  const deleteProjectBullet = (projectId: string, bulletIdx: number) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, bullets: p.bullets.filter((_, bi) => bi !== bulletIdx) } : p,
      ),
    }));
  };

  // --- Internships ---
  const handleAddInternship = () => {
    setResume((prev) => ({
      ...prev,
      internships: [
        ...prev.internships,
        {
          id: createId("intern"),
          role: "",
          company: "",
          location: "",
          duration: "",
          bullets: [""],
        },
      ],
    }));
  };

  const updateInternshipField = (
    id: string,
    field: "role" | "company" | "location" | "duration",
    value: string,
  ) => {
    setResume((prev) => ({
      ...prev,
      internships: prev.internships.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    }));
  };

  const deleteInternship = (id: string) => {
    setResume((prev) => ({
      ...prev,
      internships: prev.internships.filter((i) => i.id !== id),
    }));
  };

  const addInternshipBullet = (internshipId: string) => {
    setResume((prev) => ({
      ...prev,
      internships: prev.internships.map((i) =>
        i.id === internshipId ? { ...i, bullets: [...i.bullets, ""] } : i,
      ),
    }));
  };

  const updateInternshipBullet = (internshipId: string, bulletIdx: number, value: string) => {
    setResume((prev) => ({
      ...prev,
      internships: prev.internships.map((i) =>
        i.id === internshipId
          ? { ...i, bullets: i.bullets.map((b, bi) => (bi === bulletIdx ? value : b)) }
          : i,
      ),
    }));
  };

  const deleteInternshipBullet = (internshipId: string, bulletIdx: number) => {
    setResume((prev) => ({
      ...prev,
      internships: prev.internships.map((i) =>
        i.id === internshipId
          ? { ...i, bullets: i.bullets.filter((_, bi) => bi !== bulletIdx) }
          : i,
      ),
    }));
  };

  // --- Certifications ---
  const handleAddCertification = () => {
    setResume((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: createId("cert"),
          name: "",
          issuer: "",
          date: "",
          credentialUrl: "",
        },
      ],
    }));
  };

  const updateCertification = (
    id: string,
    field: keyof ResumeData["certifications"][number],
    value: string,
  ) => {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const deleteCertification = (id: string) => {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  };

  // --- Achievements ---
  const handleAddAchievement = () => {
    setResume((prev) => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        {
          id: createId("ach"),
          title: "",
          date: "",
          detail: "",
        },
      ],
    }));
  };

  const updateAchievement = (
    id: string,
    field: keyof ResumeData["achievements"][number],
    value: string,
  ) => {
    setResume((prev) => ({
      ...prev,
      achievements: prev.achievements.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  };

  const deleteAchievement = (id: string) => {
    setResume((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((a) => a.id !== id),
    }));
  };

  // --- AI Assistant Helpers ---
  const getTextForGrammarTarget = (target: GrammarTarget): string => {
    switch (target.kind) {
      case "summary":
        return resume.summary;
      case "objective":
        return resume.careerObjective;
      case "project-bullet": {
        const proj = resume.projects.find((p) => p.id === target.projectId);
        return proj?.bullets[target.bulletIdx] ?? "";
      }
      case "internship-bullet": {
        const intern = resume.internships.find((i) => i.id === target.internshipId);
        return intern?.bullets[target.bulletIdx] ?? "";
      }
      case "achievement-detail": {
        const ach = resume.achievements.find((a) => a.id === target.achievementId);
        return ach?.detail ?? "";
      }
    }
  };

  const openGrammarAssistantFor = (target: GrammarTarget) => {
    const sourceText = getTextForGrammarTarget(target);
    const context =
      target.kind === "summary"
        ? "summary"
        : target.kind === "objective"
          ? "objective"
          : target.kind === "achievement-detail"
            ? "achievement"
            : "bullet";
    setGrammarTarget(target);
    setGrammarPreview(improveGrammarAndStructure(sourceText, context));
    setLeftTab("ai");
    if (viewMode === "preview") setViewMode("ai-ats");
  };

  const applyGrammarImprovement = () => {
    if (!grammarPreview || !grammarPreview.improved) return;
    const text = grammarPreview.improved;
    switch (grammarTarget.kind) {
      case "summary":
        setResume((prev) => ({ ...prev, summary: text }));
        break;
      case "objective":
        setResume((prev) => ({ ...prev, careerObjective: text }));
        break;
      case "project-bullet":
        updateProjectBullet(grammarTarget.projectId, grammarTarget.bulletIdx, text);
        break;
      case "internship-bullet":
        updateInternshipBullet(grammarTarget.internshipId, grammarTarget.bulletIdx, text);
        break;
      case "achievement-detail":
        updateAchievement(grammarTarget.achievementId, "detail", text);
        break;
    }
    toast.success(`Applied grammar improvement to ${grammarTarget.label}.`);
  };

  const handleGenerateSummary = (style: SummaryStyle = summaryStyle) => {
    const generated = generateProfessionalSummary(resume, style);
    setSummaryPreview(generated);
    setLeftTab("ai");
    if (viewMode === "preview") setViewMode("ai-ats");
  };

  const applyGeneratedSummary = () => {
    if (!summaryPreview?.summary) return;
    setResume((prev) => ({ ...prev, summary: summaryPreview.summary }));
    toast.success("Applied generated summary to your resume!");
  };

  const formattedSaveTime = useMemo(() => {
    try {
      return new Date(lastSavedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "just now";
    }
  }, [lastSavedAt]);

  const showLeftColumn = viewMode === "split" || viewMode === "edit" || viewMode === "ai-ats";
  const showPreviewColumn = viewMode === "split" || viewMode === "preview";

  const activeLeftTab: LeftPanelTab =
    viewMode === "edit"
      ? "edit"
      : viewMode === "ai-ats"
        ? leftTab === "edit"
          ? "ai"
          : leftTab
        : leftTab;

  return (
    <div className="space-y-6">
      {/* Header & Separate Completion + ATS Score Cards */}
      <div className="print:hidden rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ATS Compatibility Engine
              </span>
              <span
                data-testid="autosave-status"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Auto-saved at {formattedSaveTime}
              </span>
            </div>
            <h2 className="font-display mt-1 text-xl font-bold">ATS Resume Builder & Optimizer</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Edit all resume sections, run grounded AI refinements, inspect content-based ATS
              deductions, and download a formatted PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLeftTab("upload");
                if (viewMode === "preview" || viewMode === "edit") setViewMode("ai-ats");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary transition hover:bg-primary/20 active:scale-95"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Resume</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLeftTab("ats");
                if (viewMode === "preview" || viewMode === "edit") setViewMode("ai-ats");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-muted active:scale-95"
            >
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <span>Analyze Resume</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLeftTab("improve");
                if (viewMode === "preview" || viewMode === "edit") setViewMode("ai-ats");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/10 px-3.5 py-2 text-xs font-bold text-violet transition hover:bg-violet/20 active:scale-95"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Improve Resume</span>
            </button>

            <button
              type="button"
              onClick={handleManualSave}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-muted active:scale-95"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="bg-brand shadow-glow flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-95 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white transition active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Separated Metrics Row: Completion % vs ATS Compatibility Score */}
        <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          {/* Metric 1: Resume Completion % */}
          <div
            data-testid="completion-card"
            className="rounded-xl border border-border bg-muted/30 p-3.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Resume Completion
                </p>
                <p className="font-display text-lg font-bold text-foreground">
                  {completion.percentage}%{" "}
                  <span className="text-xs font-medium text-muted-foreground">
                    ({completion.completedCount} of {completion.totalSections} sections)
                  </span>
                </p>
              </div>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {completion.incompleteLabels.length === 0
                ? "All 9 resume sections filled."
                : `Remaining: ${completion.incompleteLabels.slice(0, 3).join(", ")}${
                    completion.incompleteLabels.length > 3
                      ? ` +${completion.incompleteLabels.length - 3} more`
                      : ""
                  }`}
            </p>
          </div>

          {/* Metric 2: ATS Compatibility Score */}
          <div
            data-testid="ats-score-card"
            className="rounded-xl border border-primary/25 bg-primary/5 p-3.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  ATS Compatibility Score
                </p>
                <p className="font-display text-lg font-bold text-foreground">
                  {ats.score} / 100{" "}
                  <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {ats.grade}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLeftTab("ats");
                  if (viewMode === "preview" || viewMode === "edit") setViewMode("ai-ats");
                }}
                className="rounded-lg border border-primary/30 bg-card px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10"
              >
                Why -{ats.totalDeducted} pts?
              </button>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  ats.score >= 80
                    ? "bg-emerald-500"
                    : ats.score >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${ats.score}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {ats.deductions.length === 0
                ? "No ATS deductions — strong keyword and structure match."
                : `${ats.deductions.length} deduction(s) • ${ats.foundKeywords.length} domain keywords matched`}
            </p>
          </div>
        </div>

        {/* Workspace Mode Switcher (Mobile-Friendly & Desktop Split) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden lg:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "split"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span>Split View</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("edit");
                setLeftTab("edit");
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "edit"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("ai-ats");
                if (leftTab === "edit") setLeftTab("ats");
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "ai-ats"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI & ATS</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "preview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={handleResetStarter}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 font-semibold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Starter</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 font-semibold text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className={viewMode === "split" ? "grid gap-6 lg:grid-cols-12" : "space-y-6"}>
        {/* LEFT COLUMN: Editor / AI Assistant / ATS Analysis */}
        {showLeftColumn && (
          <div
            className={`print:hidden space-y-4 ${
              viewMode === "split" ? "lg:col-span-6" : "w-full"
            }`}
          >
            {/* Sub-tabs inside Left Column when in Split or AI/ATS view */}
            {viewMode !== "edit" && (
              <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card p-2 shadow-card">
                {viewMode === "split" && (
                  <button
                    type="button"
                    onClick={() => setLeftTab("edit")}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                      activeLeftTab === "edit"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Edit Sections
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLeftTab("upload")}
                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    activeLeftTab === "upload"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab("ats")}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    activeLeftTab === "ats"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  ATS & Analysis ({ats.score}/100)
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab("jd")}
                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    activeLeftTab === "jd"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Briefcase className="h-3 w-3" />
                  <span>Job Match</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab("improve")}
                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    activeLeftTab === "improve"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Improve My Resume</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab("ai")}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    activeLeftTab === "ai"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  AI Assistant
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab("history")}
                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    activeLeftTab === "history"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <History className="h-3 w-3" />
                  <span>History ({history.length})</span>
                </button>
              </div>
            )}

            {/* TAB: UPLOAD RESUME (PDF / DOCX) */}
            {activeLeftTab === "upload" && (
              <div className="space-y-4" data-testid="upload-resume-panel">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-sm font-bold">
                        Upload Resume (PDF or DOCX)
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Extract real text from your PDF or Word (.docx) resume, inspect parsed
                        sections, and edit details directly in CareerPilot AI.
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      PDF & DOCX
                    </span>
                  </div>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dropped = e.dataTransfer.files?.[0];
                      void handleResumeFileUpload(dropped);
                    }}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 text-center transition hover:border-primary/50"
                  >
                    <Upload className="h-7 w-7 text-primary mb-2" />
                    <p className="text-xs font-semibold text-foreground">
                      Drag & drop your resume file here, or select from device
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Supports text-based PDF (.pdf) and Microsoft Word (.docx) up to 10 MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      aria-label="Upload Resume File"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileInputChange}
                      className="sr-only"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 bg-brand shadow-glow inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {isUploading ? "Extracting Resume Text..." : "Select PDF or DOCX File"}
                      </span>
                    </button>
                  </div>

                  {uploadError && (
                    <div
                      role="alert"
                      data-testid="upload-error-alert"
                      className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Could not extract resume</p>
                        <p className="mt-0.5">{uploadError}</p>
                      </div>
                    </div>
                  )}

                  {uploadedSummary && (
                    <div className="space-y-3 border-t border-border pt-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground">
                            Loaded: {uploadedSummary.fileName}{" "}
                            <span className="ml-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                              {uploadedSummary.fileType}
                            </span>
                          </p>
                          {typeof uploadedSummary.pageCount === "number" && (
                            <p className="text-[11px] text-muted-foreground">
                              {uploadedSummary.pageCount} page(s) parsed
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLeftTab("edit")}
                            className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-bold hover:bg-muted"
                          >
                            Edit Parsed Fields
                          </button>
                          <button
                            type="button"
                            onClick={() => setLeftTab("ats")}
                            className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary/90"
                          >
                            View Full Analysis
                          </button>
                        </div>
                      </div>

                      {uploadedSummary.warnings.length > 0 && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                          {uploadedSummary.warnings.map((w, i) => (
                            <p key={i}>• {w}</p>
                          ))}
                        </div>
                      )}

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-muted/20 p-3">
                          <p className="font-bold text-emerald-700 dark:text-emerald-300">
                            Detected Sections ({uploadedSummary.detectedSections.length})
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {uploadedSummary.detectedSections.map((sec) => (
                              <span
                                key={sec}
                                className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                              >
                                ✓ {sec}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/20 p-3">
                          <p className="font-bold text-amber-700 dark:text-amber-300">
                            Missing Sections ({uploadedSummary.missingSections.length})
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {uploadedSummary.missingSections.length === 0 ? (
                              <span className="text-[11px] text-muted-foreground">None</span>
                            ) : (
                              uploadedSummary.missingSections.map((sec) => (
                                <span
                                  key={sec}
                                  className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
                                >
                                  {sec}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase text-muted-foreground mb-1">
                          Extracted Raw Text Preview
                        </p>
                        <pre
                          data-testid="uploaded-raw-text"
                          className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-3 font-mono text-[11px] text-foreground"
                        >
                          {uploadedSummary.rawText}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB A: EDIT ALL RESUME SECTIONS */}
            {activeLeftTab === "edit" && (
              <div className="space-y-4">
                {/* 1. Personal Details */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <h3 className="font-display text-sm font-bold mb-3">1. Personal Details</h3>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Full Name
                      </label>
                      <input
                        aria-label="Full Name"
                        value={resume.personal.fullName}
                        onChange={(e) => updatePersonal("fullName", e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Target Headline / Role
                      </label>
                      <input
                        aria-label="Target Headline"
                        value={resume.personal.headline}
                        onChange={(e) => updatePersonal("headline", e.target.value)}
                        placeholder="e.g. Computer Science Undergraduate"
                        className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Email
                      </label>
                      <input
                        aria-label="Email"
                        value={resume.personal.email}
                        onChange={(e) => updatePersonal("email", e.target.value)}
                        placeholder="name@college.edu"
                        className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Phone
                      </label>
                      <input
                        aria-label="Phone"
                        value={resume.personal.phone}
                        onChange={(e) => updatePersonal("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Location
                      </label>
                      <input
                        aria-label="Location"
                        value={resume.personal.location}
                        onChange={(e) => updatePersonal("location", e.target.value)}
                        placeholder="City, Country"
                        className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        LinkedIn
                      </label>
                      <input
                        aria-label="LinkedIn"
                        value={resume.personal.linkedin}
                        onChange={(e) => updatePersonal("linkedin", e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        GitHub
                      </label>
                      <input
                        aria-label="GitHub"
                        value={resume.personal.github}
                        onChange={(e) => updatePersonal("github", e.target.value)}
                        placeholder="github.com/username"
                        className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Portfolio / Website
                      </label>
                      <input
                        aria-label="Portfolio"
                        value={resume.personal.portfolio}
                        onChange={(e) => updatePersonal("portfolio", e.target.value)}
                        placeholder="yourportfolio.dev"
                        className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Career Objective */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="font-display text-sm font-bold">2. Career Objective</h3>
                    <button
                      type="button"
                      onClick={() =>
                        openGrammarAssistantFor({ kind: "objective", label: "Career Objective" })
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-violet/10 px-2.5 py-1 text-[11px] font-bold text-violet hover:bg-violet/20"
                    >
                      <Wand2 className="h-3 w-3" />
                      <span>Improve Grammar</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    aria-label="Career Objective"
                    value={resume.careerObjective}
                    onChange={(e) =>
                      setResume((prev) => ({ ...prev, careerObjective: e.target.value }))
                    }
                    placeholder="State your target role and the real skills you want to apply..."
                    className="w-full rounded-lg border border-input bg-card p-2.5 text-xs leading-relaxed text-foreground"
                  />
                </div>

                {/* 3. Professional Summary */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="font-display text-sm font-bold">3. Professional Summary</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleGenerateSummary(summaryStyle)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Generate Summary</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openGrammarAssistantFor({
                            kind: "summary",
                            label: "Professional Summary",
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-violet/10 px-2.5 py-1 text-[11px] font-bold text-violet hover:bg-violet/20"
                      >
                        <Wand2 className="h-3 w-3" />
                        <span>Improve Grammar</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    aria-label="Professional Summary"
                    value={resume.summary}
                    onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder="Summarize your degree, real technical skills, and key projects..."
                    className="w-full rounded-lg border border-input bg-card p-2.5 text-xs leading-relaxed text-foreground"
                  />
                </div>

                {/* 4. Education */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-bold">4. Education</h3>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Education</span>
                    </button>
                  </div>

                  {resume.education.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No education entries yet. Click "Add Education" to include your degree.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {resume.education.map((edu, idx) => (
                        <div
                          key={edu.id}
                          className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground">
                              Education #{idx + 1}
                            </span>
                            <button
                              type="button"
                              aria-label={`Delete Education ${idx + 1}`}
                              onClick={() => deleteEducation(edu.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <input
                              aria-label={`Education ${idx + 1} Degree`}
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                              placeholder="Degree (e.g. B.E. in Computer Science)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Education ${idx + 1} Institution`}
                              value={edu.institution}
                              onChange={(e) =>
                                updateEducation(edu.id, "institution", e.target.value)
                              }
                              placeholder="College / University"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Education ${idx + 1} Start Year`}
                              value={edu.startYear}
                              onChange={(e) => updateEducation(edu.id, "startYear", e.target.value)}
                              placeholder="Start Year (e.g. 2022)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Education ${idx + 1} End Year`}
                              value={edu.endYear}
                              onChange={(e) => updateEducation(edu.id, "endYear", e.target.value)}
                              placeholder="End / Graduation Year (e.g. 2026)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Education ${idx + 1} Grade`}
                              value={edu.grade}
                              onChange={(e) => updateEducation(edu.id, "grade", e.target.value)}
                              placeholder="Grade / CGPA (e.g. CGPA: 8.7 / 10)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Education ${idx + 1} Location`}
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                              placeholder="City / Location"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                          </div>
                          <input
                            aria-label={`Education ${idx + 1} Coursework`}
                            value={edu.coursework}
                            onChange={(e) => updateEducation(edu.id, "coursework", e.target.value)}
                            placeholder="Relevant Coursework (e.g. DSA, DBMS, OS)"
                            className="h-8 w-full rounded-lg border border-input bg-card px-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Technical Skills */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="font-display text-sm font-bold">5. Technical Skills</h3>
                    {skillSuggestions.suggestedSkills.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setLeftTab("ai");
                          if (viewMode === "edit") setViewMode("ai-ats");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-violet/10 px-2.5 py-1 text-[11px] font-bold text-violet hover:bg-violet/20"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>
                          {skillSuggestions.suggestedSkills.length} Suggested from Projects
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {resume.skills.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No skills added yet.</p>
                    ) : (
                      resume.skills.map((s, idx) => (
                        <span
                          key={`${s}-${idx}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            aria-label={`Remove skill ${s}`}
                            onClick={() => handleRemoveSkill(idx)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      aria-label="New Skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkills();
                        }
                      }}
                      placeholder="Add skill or comma-separated list (e.g. SQL, AWS)..."
                      className="h-9 flex-1 rounded-lg border border-input bg-card px-3 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkills()}
                      className="rounded-lg bg-primary px-3.5 text-xs font-bold text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* 6. Projects */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-bold">6. Projects</h3>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {resume.projects.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No projects added yet. Click "Add Project" to showcase your work.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {resume.projects.map((proj, idx) => (
                        <div
                          key={proj.id}
                          className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground">
                              Project #{idx + 1}
                            </span>
                            <button
                              type="button"
                              aria-label={`Delete Project ${idx + 1}`}
                              onClick={() => deleteProject(proj.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <input
                              aria-label={`Project ${idx + 1} Title`}
                              value={proj.title}
                              onChange={(e) => updateProjectField(proj.id, "title", e.target.value)}
                              placeholder="Project Title"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Project ${idx + 1} Tech Stack`}
                              value={proj.tech}
                              onChange={(e) => updateProjectField(proj.id, "tech", e.target.value)}
                              placeholder="Tech Stack (e.g. React, Node.js, SQL)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Project ${idx + 1} Duration`}
                              value={proj.duration}
                              onChange={(e) =>
                                updateProjectField(proj.id, "duration", e.target.value)
                              }
                              placeholder="Duration (e.g. Jan 2025 – Mar 2025)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Project ${idx + 1} Link`}
                              value={proj.link}
                              onChange={(e) => updateProjectField(proj.id, "link", e.target.value)}
                              placeholder="GitHub / Live Demo Link"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                Impact & Bullet Points
                              </span>
                              <button
                                type="button"
                                onClick={() => addProjectBullet(proj.id)}
                                className="text-[11px] font-bold text-primary hover:underline"
                              >
                                + Add Bullet
                              </button>
                            </div>
                            {proj.bullets.map((bullet, bi) => (
                              <div key={bi} className="flex items-start gap-1.5">
                                <textarea
                                  rows={2}
                                  aria-label={`Project ${idx + 1} Bullet ${bi + 1}`}
                                  value={bullet}
                                  onChange={(e) => updateProjectBullet(proj.id, bi, e.target.value)}
                                  placeholder="Describe what you built and the outcome..."
                                  className="flex-1 rounded-lg border border-input bg-card p-2 text-xs"
                                />
                                <div className="flex flex-col gap-1">
                                  <button
                                    type="button"
                                    title="Improve sentence structure with AI"
                                    aria-label={`Improve Project ${idx + 1} Bullet ${bi + 1}`}
                                    onClick={() =>
                                      openGrammarAssistantFor({
                                        kind: "project-bullet",
                                        projectId: proj.id,
                                        bulletIdx: bi,
                                        label: `${proj.title || `Project #${idx + 1}`} — Bullet ${bi + 1}`,
                                      })
                                    }
                                    className="rounded-lg bg-violet/10 p-1.5 text-violet hover:bg-violet/20"
                                  >
                                    <Wand2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Delete Project ${idx + 1} Bullet ${bi + 1}`}
                                    onClick={() => deleteProjectBullet(proj.id, bi)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7. Internships */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-bold">7. Internships</h3>
                    <button
                      type="button"
                      onClick={handleAddInternship}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Internship</span>
                    </button>
                  </div>

                  {resume.internships.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No internships added. Click "Add Internship" if you have internship or
                      training experience.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {resume.internships.map((intern, idx) => (
                        <div
                          key={intern.id}
                          className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground">
                              Internship #{idx + 1}
                            </span>
                            <button
                              type="button"
                              aria-label={`Delete Internship ${idx + 1}`}
                              onClick={() => deleteInternship(intern.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <input
                              aria-label={`Internship ${idx + 1} Role`}
                              value={intern.role}
                              onChange={(e) =>
                                updateInternshipField(intern.id, "role", e.target.value)
                              }
                              placeholder="Role (e.g. Software Engineering Intern)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Internship ${idx + 1} Company`}
                              value={intern.company}
                              onChange={(e) =>
                                updateInternshipField(intern.id, "company", e.target.value)
                              }
                              placeholder="Company / Organization"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Internship ${idx + 1} Duration`}
                              value={intern.duration}
                              onChange={(e) =>
                                updateInternshipField(intern.id, "duration", e.target.value)
                              }
                              placeholder="Duration (e.g. May 2024 – Jul 2024)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                            <input
                              aria-label={`Internship ${idx + 1} Location`}
                              value={intern.location}
                              onChange={(e) =>
                                updateInternshipField(intern.id, "location", e.target.value)
                              }
                              placeholder="Location (e.g. Bengaluru / Remote)"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                Responsibilities & Outcomes
                              </span>
                              <button
                                type="button"
                                onClick={() => addInternshipBullet(intern.id)}
                                className="text-[11px] font-bold text-primary hover:underline"
                              >
                                + Add Bullet
                              </button>
                            </div>
                            {intern.bullets.map((bullet, bi) => (
                              <div key={bi} className="flex items-start gap-1.5">
                                <textarea
                                  rows={2}
                                  aria-label={`Internship ${idx + 1} Bullet ${bi + 1}`}
                                  value={bullet}
                                  onChange={(e) =>
                                    updateInternshipBullet(intern.id, bi, e.target.value)
                                  }
                                  placeholder="Describe your work and tools used..."
                                  className="flex-1 rounded-lg border border-input bg-card p-2 text-xs"
                                />
                                <div className="flex flex-col gap-1">
                                  <button
                                    type="button"
                                    title="Improve sentence structure with AI"
                                    aria-label={`Improve Internship ${idx + 1} Bullet ${bi + 1}`}
                                    onClick={() =>
                                      openGrammarAssistantFor({
                                        kind: "internship-bullet",
                                        internshipId: intern.id,
                                        bulletIdx: bi,
                                        label: `${intern.company || `Internship #${idx + 1}`} — Bullet ${bi + 1}`,
                                      })
                                    }
                                    className="rounded-lg bg-violet/10 p-1.5 text-violet hover:bg-violet/20"
                                  >
                                    <Wand2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Delete Internship ${idx + 1} Bullet ${bi + 1}`}
                                    onClick={() => deleteInternshipBullet(intern.id, bi)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 8. Certifications */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-bold">8. Certifications</h3>
                    <button
                      type="button"
                      onClick={handleAddCertification}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Certification</span>
                    </button>
                  </div>

                  {resume.certifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No certifications listed yet. Click "Add Certification" to add earned
                      credentials.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {resume.certifications.map((cert, idx) => (
                        <div
                          key={cert.id}
                          className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground">
                              Certification #{idx + 1}
                            </span>
                            <button
                              type="button"
                              aria-label={`Delete Certification ${idx + 1}`}
                              onClick={() => deleteCertification(cert.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <input
                              aria-label={`Certification ${idx + 1} Name`}
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                              placeholder="Certification Name"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs sm:col-span-2"
                            />
                            <input
                              aria-label={`Certification ${idx + 1} Date`}
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                              placeholder="Year / Date"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                          </div>
                          <input
                            aria-label={`Certification ${idx + 1} Issuer`}
                            value={cert.issuer}
                            onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                            placeholder="Issuing Organization (e.g. AWS, Coursera, NPTEL)"
                            className="h-8 w-full rounded-lg border border-input bg-card px-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 9. Achievements */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-bold">9. Achievements</h3>
                    <button
                      type="button"
                      onClick={handleAddAchievement}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Achievement</span>
                    </button>
                  </div>

                  {resume.achievements.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No achievements listed yet. Click "Add Achievement" to add awards or honors.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {resume.achievements.map((ach, idx) => (
                        <div
                          key={ach.id}
                          className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground">
                              Achievement #{idx + 1}
                            </span>
                            <button
                              type="button"
                              aria-label={`Delete Achievement ${idx + 1}`}
                              onClick={() => deleteAchievement(ach.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <input
                              aria-label={`Achievement ${idx + 1} Title`}
                              value={ach.title}
                              onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                              placeholder="Achievement / Award Title"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs sm:col-span-2"
                            />
                            <input
                              aria-label={`Achievement ${idx + 1} Date`}
                              value={ach.date}
                              onChange={(e) => updateAchievement(ach.id, "date", e.target.value)}
                              placeholder="Year"
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs"
                            />
                          </div>
                          <div className="flex items-start gap-1.5">
                            <textarea
                              rows={2}
                              aria-label={`Achievement ${idx + 1} Detail`}
                              value={ach.detail}
                              onChange={(e) => updateAchievement(ach.id, "detail", e.target.value)}
                              placeholder="Brief factual detail..."
                              className="flex-1 rounded-lg border border-input bg-card p-2 text-xs"
                            />
                            <button
                              type="button"
                              title="Improve grammar with AI"
                              aria-label={`Improve Achievement ${idx + 1} Detail`}
                              onClick={() =>
                                openGrammarAssistantFor({
                                  kind: "achievement-detail",
                                  achievementId: ach.id,
                                  label: ach.title || `Achievement #${idx + 1}`,
                                })
                              }
                              className="rounded-lg bg-violet/10 p-1.5 text-violet hover:bg-violet/20"
                            >
                              <Wand2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB B: AI RESUME ASSISTANT (STRICTLY GROUNDED) */}
            {activeLeftTab === "ai" && (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 rounded-2xl border border-violet/30 bg-violet/10 p-3.5 text-xs">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet" />
                  <div>
                    <p className="font-bold text-foreground">
                      Grounded AI Resume Assistant (Zero Fabrication)
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      Generates summaries, refines grammar, and suggests skills strictly from your
                      actual education, projects, internships, and skills — never inventing
                      qualifications, experience, or fake metrics.
                    </p>
                  </div>
                </div>

                {/* 1. Generate Professional Summary */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-sm font-bold">
                        1. Professional Summary Generator
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Synthesizes a tailored summary from your entered degree, skills, projects,
                        and internships.
                      </p>
                    </div>
                    <select
                      aria-label="Summary Style"
                      value={summaryStyle}
                      onChange={(e) => {
                        const style = e.target.value as SummaryStyle;
                        setSummaryStyle(style);
                        handleGenerateSummary(style);
                      }}
                      className="h-8 rounded-lg border border-input bg-card px-2.5 text-xs font-semibold"
                    >
                      <option value="technical">Technical & ATS Focus</option>
                      <option value="concise">Concise (2-Line)</option>
                      <option value="graduate">Fresh Graduate Highlight</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateSummary(summaryStyle)}
                    className="bg-brand shadow-glow inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate Summary from My Info</span>
                  </button>

                  {summaryPreview && (
                    <div
                      data-testid="ai-summary-preview"
                      className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-xs space-y-2"
                    >
                      <p className="font-bold text-primary">Generated Summary Draft:</p>
                      <p className="leading-relaxed text-foreground">{summaryPreview.summary}</p>
                      {summaryPreview.usedSources.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          Grounded in: <b>{summaryPreview.usedSources.join(", ")}</b>
                        </p>
                      )}
                      {summaryPreview.missingHints.length > 0 && (
                        <ul className="space-y-0.5 text-[11px] text-amber-700 dark:text-amber-300">
                          {summaryPreview.missingHints.map((hint, i) => (
                            <li key={i}>• {hint}</li>
                          ))}
                        </ul>
                      )}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={applyGeneratedSummary}
                          className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary/90"
                        >
                          Apply Summary
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Grammar & Sentence Structure Improver */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3">
                  <div>
                    <h3 className="font-display text-sm font-bold">
                      2. Grammar & Sentence Structure Improver
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Select any section or click the wand icon beside any bullet point to polish
                      active voice and clarity.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openGrammarAssistantFor({ kind: "summary", label: "Professional Summary" })
                      }
                      className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                    >
                      Check Summary
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openGrammarAssistantFor({ kind: "objective", label: "Career Objective" })
                      }
                      className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                    >
                      Check Career Objective
                    </button>
                    {resume.projects.map((p, pi) =>
                      p.bullets.map((_, bi) => (
                        <button
                          key={`${p.id}-${bi}`}
                          type="button"
                          onClick={() =>
                            openGrammarAssistantFor({
                              kind: "project-bullet",
                              projectId: p.id,
                              bulletIdx: bi,
                              label: `${p.title || `Project #${pi + 1}`} — Bullet ${bi + 1}`,
                            })
                          }
                          className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                        >
                          {p.title ? p.title.slice(0, 18) : `Proj ${pi + 1}`} • B{bi + 1}
                        </button>
                      )),
                    )}
                    {resume.internships.map((intern, ii) =>
                      intern.bullets.map((_, bi) => (
                        <button
                          key={`${intern.id}-${bi}`}
                          type="button"
                          onClick={() =>
                            openGrammarAssistantFor({
                              kind: "internship-bullet",
                              internshipId: intern.id,
                              bulletIdx: bi,
                              label: `${intern.company || `Intern #${ii + 1}`} — Bullet ${bi + 1}`,
                            })
                          }
                          className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                        >
                          {intern.company ? intern.company.slice(0, 18) : `Intern ${ii + 1}`} • B
                          {bi + 1}
                        </button>
                      )),
                    )}
                  </div>

                  {grammarPreview && (
                    <div
                      data-testid="ai-grammar-preview"
                      className="rounded-xl border border-violet/25 bg-violet/5 p-3.5 text-xs space-y-2"
                    >
                      <p className="font-bold text-violet">Refining: {grammarTarget.label}</p>
                      {grammarPreview.original ? (
                        <>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">
                              Before
                            </p>
                            <p className="text-muted-foreground">{grammarPreview.original}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                              Suggested Improvement
                            </p>
                            <p className="font-medium text-foreground">{grammarPreview.improved}</p>
                          </div>
                          {grammarPreview.changes.length > 0 && (
                            <ul className="text-[11px] text-muted-foreground space-y-0.5">
                              {grammarPreview.changes.map((c, idx) => (
                                <li key={idx}>✓ {c}</li>
                              ))}
                            </ul>
                          )}
                          {grammarPreview.guidance && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-300">
                              {grammarPreview.guidance}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={applyGrammarImprovement}
                            className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary/90"
                          >
                            Apply Improvement
                          </button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">{grammarPreview.guidance}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Project-Based Skill Suggestions */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3">
                  <div>
                    <h3 className="font-display text-sm font-bold">
                      3. Suggested Skills from Your Projects
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {skillSuggestions.groundedNote}
                    </p>
                  </div>

                  {skillSuggestions.suggestedSkills.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      All detected skills from your projects and internships are already in your
                      Technical Skills list.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {skillSuggestions.suggestedSkills.map((item) => (
                        <div
                          key={item.skill}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
                        >
                          <div>
                            <p className="font-bold text-foreground">{item.skill}</p>
                            <p className="text-[11px] text-muted-foreground">{item.reason}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSkills(item.skill)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary/90"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Skill</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB C: ATS ANALYSIS, 8-AREA AI DIAGNOSTICS & DEDUCTION EXPLANATIONS */}
            {activeLeftTab === "ats" && (
              <div className="space-y-4" data-testid="ats-analysis-panel">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-display text-sm font-bold">
                          Estimated ATS Compatibility Score & Analysis
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Calculated live from your actual resume content across 7 weighted
                          dimensions.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-brand px-3.5 py-1.5 text-center text-white">
                      <p className="text-[10px] font-bold uppercase opacity-80">Estimated Score</p>
                      <p className="font-display text-lg font-bold">{ats.score} / 100</p>
                    </div>
                  </div>

                  {/* Score Calculation Explanation & Honest ATS Disclaimer */}
                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground leading-relaxed">{ats.scoreExplanation}</p>
                    <div
                      data-testid="ats-disclaimer"
                      className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-2.5 text-[11px] text-muted-foreground"
                    >
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                      <span>{ats.disclaimer}</span>
                    </div>
                  </div>

                  {/* 7 Category Score Breakdown */}
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {ats.categories.map((cat) => (
                      <div
                        key={cat.category}
                        className="rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
                      >
                        <div className="flex justify-between font-semibold">
                          <span>{cat.category}</span>
                          <span className="text-primary">
                            {cat.earned} / {cat.max}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round((cat.earned / cat.max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8-Area Comprehensive Resume Evaluation */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3">
                  <div className="flex items-center gap-2">
                    <LayoutList className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-sm font-bold">8-Area Resume Content Audit</h3>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {comprehensive.sectionEvaluations.map((ev) => (
                      <div
                        key={ev.area}
                        className="rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-foreground">{ev.area}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              ev.status === "Strong"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : ev.status === "Needs Attention"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                  : "bg-red-500/15 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {ev.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">{ev.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak Descriptions, Spelling Mistakes & Formatting Issues */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SpellCheck2 className="h-4 w-4 text-violet" />
                      <h3 className="font-display text-sm font-bold">
                        Quality Diagnostics (Weak Descriptions, Spelling & Formatting)
                      </h3>
                    </div>
                    {optimizationPlan.applicableCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setLeftTab("improve")}
                        className="rounded-lg bg-violet/15 px-2.5 py-1 text-[11px] font-bold text-violet hover:bg-violet/25"
                      >
                        Fix in Improve My Resume →
                      </button>
                    )}
                  </div>

                  {/* Spelling Mistakes */}
                  <div>
                    <p className="font-bold text-foreground">
                      Spelling Mistakes ({comprehensive.spellingMistakes.length})
                    </p>
                    {comprehensive.spellingMistakes.length === 0 ? (
                      <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                        No spelling errors detected.
                      </p>
                    ) : (
                      <ul className="mt-1.5 space-y-1.5">
                        {comprehensive.spellingMistakes.map((sp, i) => (
                          <li
                            key={i}
                            className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-[11px]"
                          >
                            <span className="font-bold">{sp.field}:</span> "{sp.misspelled}" →{" "}
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                              {sp.correction}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Weak Descriptions */}
                  <div className="border-t border-border pt-2.5">
                    <p className="font-bold text-foreground">
                      Weak Descriptions ({comprehensive.weakDescriptions.length})
                    </p>
                    {comprehensive.weakDescriptions.length === 0 ? (
                      <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                        Descriptions use clear, active technical language.
                      </p>
                    ) : (
                      <ul className="mt-1.5 space-y-1.5">
                        {comprehensive.weakDescriptions.map((wd, i) => (
                          <li
                            key={i}
                            className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2 text-[11px]"
                          >
                            <p className="font-bold text-foreground">{wd.location}</p>
                            <p className="text-muted-foreground italic">"{wd.currentText}"</p>
                            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                              {wd.issue} {wd.suggestion}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Formatting Issues & Unnecessary Clutter */}
                  <div className="border-t border-border pt-2.5">
                    <p className="font-bold text-foreground">
                      Formatting & Clutter Issues (
                      {comprehensive.formattingIssues.length +
                        comprehensive.unnecessaryClutter.length}
                      )
                    </p>
                    {comprehensive.formattingIssues.length === 0 &&
                    comprehensive.unnecessaryClutter.length === 0 ? (
                      <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                        Formatting and conciseness look ATS-ready.
                      </p>
                    ) : (
                      <ul className="mt-1.5 space-y-1.5">
                        {comprehensive.formattingIssues.map((fi, i) => (
                          <li
                            key={`fmt-${i}`}
                            className="rounded-lg border border-border bg-muted/30 p-2 text-[11px]"
                          >
                            <span className="font-bold">{fi.location}:</span> {fi.issue}{" "}
                            <span className="text-primary font-medium">{fi.fix}</span>
                          </li>
                        ))}
                        {comprehensive.unnecessaryClutter.map((cl, i) => (
                          <li
                            key={`clutter-${i}`}
                            className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2 text-[11px]"
                          >
                            <span className="font-bold">{cl.location}:</span> Remove "{cl.phrase}" —{" "}
                            {cl.reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Why Marks Were Deducted */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-2.5">
                  <h3 className="font-display text-sm font-bold">
                    Why Marks Were Deducted (-{ats.totalDeducted} pts total)
                  </h3>
                  {ats.deductions.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Zero marks deducted — your resume satisfies all ATS criteria!</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ats.deductions.map((ded) => (
                        <div
                          key={ded.id}
                          className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-foreground">{ded.category}</span>
                            <span className="rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                              -{ded.points} pts
                            </span>
                          </div>
                          <p className="mt-1 text-foreground">{ded.reason}</p>
                          <p className="mt-1 text-[11px] text-primary font-medium">
                            Fix: {ded.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Sections & Keyword Coverage */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-foreground">Missing Sections</h4>
                    {ats.missingSections.length === 0 ? (
                      <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        All key sections are present.
                      </p>
                    ) : (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {ats.missingSections.map((sec) => (
                          <span
                            key={sec}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400"
                          >
                            <AlertCircle className="h-3 w-3" />
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-3">
                    <h4 className="font-bold text-foreground">
                      Keyword Coverage ({ats.foundKeywords.length} matched,{" "}
                      {ats.missingKeywords.length} missing)
                    </h4>
                    {ats.foundKeywords.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {ats.foundKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    )}
                    {ats.missingKeywords.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[11px] text-muted-foreground mb-1">
                          Important keywords not yet found (add only if you have experience with
                          them):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {ats.missingKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB D: JOB DESCRIPTION MATCHING */}
            {activeLeftTab === "jd" && (
              <div className="space-y-4" data-testid="jd-match-panel">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3">
                  <div>
                    <h3 className="font-display text-sm font-bold">Job Description Matching</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Paste a target role description to compare required skills, keywords,
                      strengths, and gaps against your resume.
                    </p>
                  </div>

                  <textarea
                    rows={6}
                    aria-label="Paste Job Description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job responsibilities, required technical skills (e.g., React, TypeScript, Node.js, PostgreSQL, Docker, System Design)..."
                    className="w-full rounded-xl border border-input bg-card p-3 text-xs leading-relaxed text-foreground"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAnalyzeJobMatch}
                      className="bg-brand shadow-glow inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-95"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>Compare With Job Description</span>
                    </button>
                    {jdMatchResult && (
                      <button
                        type="button"
                        onClick={() => {
                          setJobDescription("");
                          setJdMatchResult(null);
                        }}
                        className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {jdMatchResult && (
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Job-Specific Compatibility Score
                        </p>
                        <p className="font-display text-2xl font-bold text-foreground">
                          {jdMatchResult.compatibilityScore} / 100
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {jdMatchResult.summaryNote}
                        </p>
                      </div>
                      <div className="w-full sm:w-44">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${
                              jdMatchResult.compatibilityScore >= 75
                                ? "bg-emerald-500"
                                : jdMatchResult.compatibilityScore >= 50
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${jdMatchResult.compatibilityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <p className="font-bold text-emerald-700 dark:text-emerald-300">
                          Matching Skills ({jdMatchResult.matchingSkills.length})
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {jdMatchResult.matchingSkills.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground">
                              None matched yet
                            </span>
                          ) : (
                            jdMatchResult.matchingSkills.map((s) => (
                              <span
                                key={s}
                                className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                              >
                                ✓ {s}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <p className="font-bold text-red-600 dark:text-red-400">
                          Missing Skills ({jdMatchResult.missingSkills.length})
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {jdMatchResult.missingSkills.length === 0 ? (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              All detected JD skills covered!
                            </span>
                          ) : (
                            jdMatchResult.missingSkills.map((s) => (
                              <span
                                key={s}
                                className="rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400"
                              >
                                {s}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <p className="font-bold text-primary">
                          Relevant Keywords ({jdMatchResult.relevantKeywords.length})
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {jdMatchResult.relevantKeywords.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground">
                              None matched yet
                            </span>
                          ) : (
                            jdMatchResult.relevantKeywords.map((k) => (
                              <span
                                key={k}
                                className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary"
                              >
                                {k}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <p className="font-bold text-amber-700 dark:text-amber-300">
                          Missing Keywords ({jdMatchResult.missingKeywords.length})
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {jdMatchResult.missingKeywords.length === 0 ? (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              All detected domain keywords covered!
                            </span>
                          ) : (
                            jdMatchResult.missingKeywords.map((k) => (
                              <span
                                key={k}
                                className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
                              >
                                {k}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-3">
                      <div>
                        <p className="font-bold text-foreground mb-1">Resume Strengths</p>
                        <ul className="space-y-1 text-[11px] text-muted-foreground">
                          {jdMatchResult.resumeStrengths.map((str, i) => (
                            <li key={i}>• {str}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold text-foreground mb-1">
                          Areas Requiring Improvement
                        </p>
                        <ul className="space-y-1 text-[11px] text-muted-foreground">
                          {jdMatchResult.areasRequiringImprovement.map((imp, i) => (
                            <li key={i}>• {imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB E: INTERACTIVE "IMPROVE MY RESUME" WORKFLOW */}
            {activeLeftTab === "improve" && (
              <div className="space-y-4" data-testid="improve-resume-panel">
                <div className="rounded-2xl border border-violet/30 bg-violet/10 p-4 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-violet" />
                    <span>Improve My Resume — Interactive Optimizer</span>
                  </div>
                  <p className="text-muted-foreground">{optimizationPlan.groundedGuarantee}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-sm font-bold">
                        Suggested Grounded Improvements ({optimizationPlan.applicableCount} ready to
                        apply)
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Review before/after changes, select the improvements you want, and apply to
                        update your live preview immediately.
                      </p>
                    </div>
                    {optimizationPlan.applicableCount > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOptIds(
                              optimizationPlan.items.filter((i) => i.applicable).map((i) => i.id),
                            )
                          }
                          className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleApplySelectedOptimizations}
                          className="bg-brand shadow-glow inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-95"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Apply Selected Improvements ({selectedOptIds.length})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {optimizationPlan.items.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Your summary, bullet points, spelling, and skills look cleanly optimized!
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {optimizationPlan.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-border bg-muted/20 p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <label className="flex items-start gap-2 cursor-pointer">
                              {item.applicable && (
                                <input
                                  type="checkbox"
                                  checked={selectedOptIds.includes(item.id)}
                                  onChange={() => toggleOptimizationItem(item.id)}
                                  className="mt-0.5 rounded border-input"
                                />
                              )}
                              <div>
                                <p className="font-bold text-foreground">{item.title}</p>
                                <p className="text-[11px] text-muted-foreground">{item.location}</p>
                              </div>
                            </label>
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                item.applicable
                                  ? "bg-primary/15 text-primary"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              {item.applicable ? "Auto-Apply" : "Advisory"}
                            </span>
                          </div>

                          {item.applicable ? (
                            <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                              <div className="rounded-lg border border-border bg-card p-2">
                                <p className="font-bold uppercase text-[9px] text-muted-foreground">
                                  Before
                                </p>
                                <p className="mt-0.5 text-muted-foreground">{item.before}</p>
                              </div>
                              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2">
                                <p className="font-bold uppercase text-[9px] text-emerald-700 dark:text-emerald-300">
                                  After
                                </p>
                                <p className="mt-0.5 text-foreground font-medium">{item.after}</p>
                              </div>
                            </div>
                          ) : null}

                          <p className="text-[11px] text-muted-foreground">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB F: RESUME VERSION HISTORY & ATS COMPARISON */}
            {activeLeftTab === "history" && (
              <div className="space-y-4" data-testid="resume-history-panel">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3 text-xs">
                  <div>
                    <h3 className="font-display text-sm font-bold">
                      Resume Version History & Score Comparison
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Save snapshots of your resume over time, compare previous vs current ATS
                      scores, and restore any prior draft.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      aria-label="Version Label"
                      value={versionLabel}
                      onChange={(e) => setVersionLabel(e.target.value)}
                      placeholder="Optional label (e.g., Backend SWE Draft)"
                      className="h-9 flex-1 min-w-[180px] rounded-lg border border-input bg-card px-2.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleSaveHistoryVersion}
                      className="bg-brand shadow-glow inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white hover:opacity-95"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Version Snapshot</span>
                    </button>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-5 text-center text-xs text-muted-foreground shadow-card">
                    No saved resume versions yet. Click "Save Version Snapshot" or upload a resume
                    to track ATS score progress over time.
                  </div>
                ) : (
                  <>
                    {/* Comparison Card vs Selected Previous Version */}
                    {(() => {
                      const targetPrev =
                        history.find((h) => h.id === compareVersionId) ?? history[0]!;
                      const cmp = compareResumeWithVersion(ats, targetPrev);
                      return (
                        <div
                          data-testid="history-comparison-card"
                          className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-xs space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                Previous vs Current ATS Comparison
                              </p>
                              <p className="font-display text-base font-bold text-foreground">
                                {cmp.previousScore}/100 → {cmp.currentScore}/100{" "}
                                <span
                                  className={`ml-1 inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[11px] font-bold ${
                                    cmp.overallDelta > 0
                                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                      : cmp.overallDelta < 0
                                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                        : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {cmp.overallDelta > 0 && <ArrowUpRight className="h-3 w-3" />}
                                  {cmp.overallDelta < 0 && <ArrowDownRight className="h-3 w-3" />}
                                  {cmp.overallDelta > 0
                                    ? `+${cmp.overallDelta} pts`
                                    : `${cmp.overallDelta} pts`}
                                </span>
                              </p>
                            </div>
                            <select
                              aria-label="Compare against version"
                              value={targetPrev.id}
                              onChange={(e) => setCompareVersionId(e.target.value)}
                              className="h-8 rounded-lg border border-input bg-card px-2 text-xs font-semibold"
                            >
                              {history.map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.label} ({h.atsScore}/100)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {cmp.categoryDeltas.map((cd) => (
                              <div
                                key={cd.category}
                                className="flex items-center justify-between rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px]"
                              >
                                <span className="font-medium text-foreground">{cd.category}</span>
                                <span className="font-bold">
                                  {cd.previous}→{cd.current}/{cd.max}{" "}
                                  {cd.delta !== 0 && (
                                    <span
                                      className={
                                        cd.delta > 0
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-red-600 dark:text-red-400"
                                      }
                                    >
                                      ({cd.delta > 0 ? `+${cd.delta}` : cd.delta})
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Saved Versions List */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-2.5 text-xs">
                      <h4 className="font-bold text-foreground">
                        Saved Versions ({history.length})
                      </h4>
                      <div className="space-y-2">
                        {history.map((ver) => (
                          <div
                            key={ver.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/20 p-3"
                          >
                            <div>
                              <p className="font-bold text-foreground">{ver.label}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {ver.source} • {new Date(ver.savedAt).toLocaleString()} • ATS:{" "}
                                <b>{ver.atsScore}/100</b>
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setCompareVersionId(ver.id)}
                                className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                              >
                                Compare
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRestoreVersion(ver)}
                                className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary/90"
                              >
                                Restore
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete version ${ver.label}`}
                                onClick={() => handleDeleteVersion(ver.id)}
                                className="p-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN: LIVE RESUME PREVIEW & TEMPLATE SELECTOR */}
        {showPreviewColumn && (
          <div className={viewMode === "split" ? "lg:col-span-6" : "w-full"}>
            <div className="space-y-3 lg:sticky lg:top-4">
              {/* Template Switcher Bar */}
              <div className="print:hidden flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 shadow-card">
                <span className="text-xs font-bold text-foreground">Resume Template:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "classic", label: "Fresher / Student" },
                      { id: "modern-pro", label: "Modern Professional" },
                      { id: "tech-dev", label: "Technical Developer" },
                      { id: "modern", label: "Modern Minimal" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplate(t.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        template === t.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Sheet */}
              <ResumePreview resume={resume} template={template} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
