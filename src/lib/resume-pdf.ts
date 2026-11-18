import { jsPDF } from "jspdf";
import type { ResumeData, ResumeTemplate } from "./resume-engine";

export function buildResumePdfFilename(fullName: string): string {
  const cleaned = fullName
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, "_");
  return cleaned ? `${cleaned}_Resume.pdf` : "CareerPilot_Resume.pdf";
}

export function generateResumePdf(resume: ResumeData, template: ResumeTemplate = "classic"): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const isModern = template === "modern";
  const isModernPro = template === "modern-pro";
  const isTechDev = template === "tech-dev";
  const isCompact = template === "compact" || isTechDev;

  const marginX = isCompact ? 13 : 16;
  const marginBottom = 15;
  const contentWidth = pageWidth - marginX * 2;
  let y = isCompact ? 14 : 17;

  const accentRgb: [number, number, number] = isModern
    ? [79, 70, 229] // indigo-600
    : isModernPro
      ? [7, 89, 133] // sky-800
      : isTechDev
        ? [15, 23, 42] // slate-950
        : [30, 41, 59]; // slate-800
  const bodyRgb: [number, number, number] = [51, 65, 85]; // slate-700
  const mutedRgb: [number, number, number] = [100, 116, 139]; // slate-500

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = 16;
    }
  };

  const drawSectionHeader = (title: string) => {
    ensureSpace(10);
    y += isCompact ? 2.5 : 3.5;
    doc.setFont(isTechDev ? "courier" : "helvetica", "bold");
    doc.setFontSize(isCompact ? 9.5 : 10.5);
    doc.setTextColor(...accentRgb);
    doc.text(title.toUpperCase(), marginX, y);
    y += 1.6;
    doc.setDrawColor(
      ...(isModern || isModernPro
        ? accentRgb
        : isTechDev
          ? ([100, 116, 139] as [number, number, number])
          : ([203, 213, 225] as [number, number, number])),
    );
    doc.setLineWidth(isModern || isModernPro ? 0.5 : 0.3);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += isCompact ? 3.5 : 4.2;
  };

  const drawWrappedParagraph = (text: string, fontSize = 9.5, lineHeight = 4.2) => {
    const clean = text.trim();
    if (!clean) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...bodyRgb);
    const lines = doc.splitTextToSize(clean, contentWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight + 1);
      doc.text(line, marginX, y);
      y += lineHeight;
    }
  };

  const drawBullet = (text: string, fontSize = 9, lineHeight = 4) => {
    const clean = text.trim();
    if (!clean) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...bodyRgb);

    const bulletIndent = 4;
    const wrapped = doc.splitTextToSize(clean, contentWidth - bulletIndent) as string[];
    wrapped.forEach((line, idx) => {
      ensureSpace(lineHeight + 1);
      if (idx === 0) {
        doc.text("•", marginX + 0.8, y);
      }
      doc.text(line, marginX + bulletIndent, y);
      y += lineHeight;
    });
  };

  // --- HEADER ---
  const nameText = resume.personal.fullName.trim() || "Resume";
  const contactParts = [
    resume.personal.email.trim(),
    resume.personal.phone.trim(),
    resume.personal.location.trim(),
    resume.personal.linkedin.trim(),
    resume.personal.github.trim(),
    resume.personal.portfolio.trim(),
  ].filter(Boolean);

  if (isModern || isModernPro) {
    doc.setFillColor(...accentRgb);
    doc.rect(marginX, y - 4, 2.2, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(nameText, marginX + 5, y + 1);
    y += 5.5;

    if (resume.personal.headline.trim()) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...accentRgb);
      doc.text(resume.personal.headline.trim(), marginX + 5, y + 0.5);
      y += 4.5;
    }

    if (contactParts.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...mutedRgb);
      const contactLines = doc.splitTextToSize(
        contactParts.join("  |  "),
        contentWidth - 5,
      ) as string[];
      for (const line of contactLines) {
        doc.text(line, marginX + 5, y + 0.5);
        y += 3.8;
      }
    }
    y += 2;
  } else {
    doc.setFont(isTechDev ? "courier" : "helvetica", "bold");
    doc.setFontSize(isCompact ? 16 : 18);
    doc.setTextColor(15, 23, 42);
    if (isCompact) {
      doc.text(nameText, marginX, y);
    } else {
      doc.text(nameText, pageWidth / 2, y, { align: "center" });
    }
    y += 5;

    if (resume.personal.headline.trim()) {
      doc.setFont(isTechDev ? "courier" : "helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...mutedRgb);
      if (isCompact) {
        doc.text(resume.personal.headline.trim(), marginX, y);
      } else {
        doc.text(resume.personal.headline.trim(), pageWidth / 2, y, { align: "center" });
      }
      y += 4.2;
    }

    if (contactParts.length > 0) {
      doc.setFont(isTechDev ? "courier" : "helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...mutedRgb);
      const sep = isTechDev ? "  ::  " : "  •  ";
      const contactLines = doc.splitTextToSize(contactParts.join(sep), contentWidth) as string[];
      for (const line of contactLines) {
        if (isCompact) {
          doc.text(line, marginX, y);
        } else {
          doc.text(line, pageWidth / 2, y, { align: "center" });
        }
        y += 3.8;
      }
    }
    doc.setDrawColor(isTechDev ? 15 : 148, isTechDev ? 23 : 163, isTechDev ? 42 : 184);
    doc.setLineWidth(isTechDev ? 0.6 : 0.4);
    doc.line(marginX, y + 0.5, pageWidth - marginX, y + 0.5);
    y += 3;
  }

  // --- CAREER OBJECTIVE ---
  if (resume.careerObjective.trim()) {
    drawSectionHeader("Career Objective");
    drawWrappedParagraph(resume.careerObjective, isCompact ? 9 : 9.5, isCompact ? 3.9 : 4.2);
  }

  // --- PROFESSIONAL SUMMARY ---
  if (resume.summary.trim()) {
    drawSectionHeader("Professional Summary");
    drawWrappedParagraph(resume.summary, isCompact ? 9 : 9.5, isCompact ? 3.9 : 4.2);
  }

  const drawTitleRow = (
    leftText: string,
    rightText: string,
    leftFontStyle: "bold" | "normal" = "bold",
    rightFontStyle: "normal" | "italic" = "normal",
    fontSize = 9.5,
    rightFontSize = 8.5,
  ) => {
    doc.setFont("helvetica", leftFontStyle);
    doc.setFontSize(fontSize);
    const leftWidth = doc.getTextWidth(leftText);

    doc.setFont("helvetica", rightFontStyle);
    doc.setFontSize(rightFontSize);
    const rightWidth = rightText ? doc.getTextWidth(rightText) : 0;

    if (rightText && leftWidth + rightWidth + 6 <= contentWidth) {
      doc.setFont("helvetica", leftFontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(15, 23, 42);
      doc.text(leftText, marginX, y);

      doc.setFont("helvetica", rightFontStyle);
      doc.setFontSize(rightFontSize);
      doc.setTextColor(...mutedRgb);
      doc.text(rightText, pageWidth - marginX, y, { align: "right" });
      y += 4;
    } else {
      doc.setFont("helvetica", leftFontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(15, 23, 42);
      const leftLines = doc.splitTextToSize(leftText, contentWidth) as string[];
      for (const line of leftLines) {
        ensureSpace(4.2);
        doc.text(line, marginX, y);
        y += 4;
      }
      if (rightText) {
        doc.setFont("helvetica", rightFontStyle);
        doc.setFontSize(rightFontSize);
        doc.setTextColor(...mutedRgb);
        const rightLines = doc.splitTextToSize(rightText, contentWidth) as string[];
        for (const line of rightLines) {
          ensureSpace(3.8);
          doc.text(line, marginX, y);
          y += 3.6;
        }
      }
    }
  };

  // --- EDUCATION ---
  const validEducation = resume.education.filter((e) => e.degree.trim() || e.institution.trim());
  if (validEducation.length > 0) {
    drawSectionHeader("Education");
    for (const edu of validEducation) {
      ensureSpace(12);
      const dateSpan = [edu.startYear.trim(), edu.endYear.trim()].filter(Boolean).join(" – ");
      const rightMeta = [dateSpan, edu.grade.trim()].filter(Boolean).join("  |  ");

      drawTitleRow(edu.degree.trim() || "Degree", rightMeta, "bold", "normal", 9.5, 8.5);

      const instLine = [edu.institution.trim(), edu.location.trim()].filter(Boolean).join(", ");
      if (instLine) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(...bodyRgb);
        doc.text(instLine, marginX, y);
        y += 3.8;
      }

      if (edu.coursework.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...mutedRgb);
        const cwLines = doc.splitTextToSize(
          `Relevant Coursework: ${edu.coursework.trim()}`,
          contentWidth,
        ) as string[];
        for (const line of cwLines) {
          ensureSpace(4);
          doc.text(line, marginX, y);
          y += 3.6;
        }
      }
      y += 1.5;
    }
  }

  // --- TECHNICAL SKILLS ---
  const cleanSkills = resume.skills.map((s) => s.trim()).filter(Boolean);
  if (cleanSkills.length > 0) {
    drawSectionHeader("Technical Skills");
    drawWrappedParagraph(cleanSkills.join("  •  "), isCompact ? 9 : 9.5, isCompact ? 3.9 : 4.2);
  }

  // --- INTERNSHIPS ---
  const validInternships = resume.internships.filter(
    (i) => i.role.trim() || i.company.trim() || i.bullets.some((b) => b.trim()),
  );
  if (validInternships.length > 0) {
    drawSectionHeader("Internships & Experience");
    for (const intern of validInternships) {
      ensureSpace(12);
      const heading = [intern.role.trim(), intern.company.trim()].filter(Boolean).join(" — ");
      const rightMeta = [intern.location.trim(), intern.duration.trim()]
        .filter(Boolean)
        .join("  |  ");

      drawTitleRow(heading || "Internship", rightMeta, "bold", "normal", 9.5, 8.5);

      for (const bullet of intern.bullets) {
        if (bullet.trim()) {
          drawBullet(bullet, isCompact ? 8.8 : 9, isCompact ? 3.8 : 4);
        }
      }
      y += 1.5;
    }
  }

  // --- PROJECTS ---
  const validProjects = resume.projects.filter(
    (p) => p.title.trim() || p.tech.trim() || p.bullets.some((b) => b.trim()),
  );
  if (validProjects.length > 0) {
    drawSectionHeader("Projects");
    for (const proj of validProjects) {
      ensureSpace(12);
      const rightMeta = [proj.tech.trim(), proj.duration.trim()].filter(Boolean).join("  |  ");
      drawTitleRow(proj.title.trim() || "Project", rightMeta, "bold", "italic", 9.5, 8.5);

      if (proj.link.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...accentRgb);
        doc.text(proj.link.trim(), marginX, y);
        y += 3.5;
      }

      for (const bullet of proj.bullets) {
        if (bullet.trim()) {
          drawBullet(bullet, isCompact ? 8.8 : 9, isCompact ? 3.8 : 4);
        }
      }
      y += 1.5;
    }
  }

  // --- CERTIFICATIONS ---
  const validCerts = resume.certifications.filter((c) => c.name.trim());
  if (validCerts.length > 0) {
    drawSectionHeader("Certifications");
    for (const cert of validCerts) {
      ensureSpace(6);
      const label = `•  ${[cert.name.trim(), cert.issuer.trim()].filter(Boolean).join(" — ")}`;
      const right = cert.date.trim();
      drawTitleRow(label, right, "normal", "normal", 9, 8.5);
    }
  }

  // --- ACHIEVEMENTS ---
  const validAchievements = resume.achievements.filter((a) => a.title.trim() || a.detail.trim());
  if (validAchievements.length > 0) {
    drawSectionHeader("Achievements");
    for (const ach of validAchievements) {
      ensureSpace(8);
      const text = [
        ach.title.trim(),
        ach.date.trim() ? `(${ach.date.trim()})` : "",
        ach.detail.trim(),
      ]
        .filter(Boolean)
        .join(" — ");
      drawBullet(text, isCompact ? 8.8 : 9, isCompact ? 3.8 : 4);
    }
  }

  return doc;
}

export function downloadResumePdf(
  resume: ResumeData,
  template: ResumeTemplate = "classic",
): string {
  const doc = generateResumePdf(resume, template);
  const filename = buildResumePdfFilename(resume.personal.fullName);
  doc.save(filename);
  return filename;
}
