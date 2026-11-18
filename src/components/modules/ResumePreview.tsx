import type { ResumeData, ResumeTemplate } from "@/lib/resume-engine";

interface ResumePreviewProps {
  resume: ResumeData;
  template: ResumeTemplate;
}

export function ResumePreview({ resume, template }: ResumePreviewProps) {
  const isModern = template === "modern";
  const isModernPro = template === "modern-pro";
  const isTechDev = template === "tech-dev";
  const isCompact = template === "compact";

  const contactItems = [
    resume.personal.email.trim(),
    resume.personal.phone.trim(),
    resume.personal.location.trim(),
    resume.personal.linkedin.trim(),
    resume.personal.github.trim(),
    resume.personal.portfolio.trim(),
  ].filter(Boolean);

  const validEducation = resume.education.filter((e) => e.degree.trim() || e.institution.trim());
  const cleanSkills = resume.skills.map((s) => s.trim()).filter(Boolean);
  const validInternships = resume.internships.filter(
    (i) => i.role.trim() || i.company.trim() || i.bullets.some((b) => b.trim()),
  );
  const validProjects = resume.projects.filter(
    (p) => p.title.trim() || p.tech.trim() || p.bullets.some((b) => b.trim()),
  );
  const validCerts = resume.certifications.filter((c) => c.name.trim());
  const validAchievements = resume.achievements.filter((a) => a.title.trim() || a.detail.trim());

  const hasAnyContent =
    resume.personal.fullName.trim() ||
    contactItems.length > 0 ||
    resume.careerObjective.trim() ||
    resume.summary.trim() ||
    validEducation.length > 0 ||
    cleanSkills.length > 0 ||
    validInternships.length > 0 ||
    validProjects.length > 0 ||
    validCerts.length > 0 ||
    validAchievements.length > 0;

  const sectionHeadingClass = isModern
    ? "text-[11px] font-bold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-200 pb-0.5"
    : isModernPro
      ? "text-[11px] font-bold uppercase tracking-wider text-sky-900 border-b-2 border-sky-700/30 pb-0.5"
      : isTechDev
        ? "text-[10.5px] font-mono font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5"
        : isCompact
          ? "text-[10.5px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5"
          : "text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5";

  return (
    <div
      id="resume-preview-sheet"
      data-testid="resume-preview-sheet"
      data-template={template}
      className={`rounded-2xl border border-border bg-white text-slate-900 shadow-card ${
        isCompact ? "p-4 sm:p-5 text-[10.5px]" : "p-5 sm:p-7 text-[11px]"
      }`}
    >
      {!hasAnyContent ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Start filling in your resume details to see a live formatted preview here.
        </div>
      ) : (
        <div className={isCompact ? "space-y-2.5" : "space-y-3.5"}>
          {/* Header */}
          {isModern || isModernPro ? (
            <div
              className={`border-l-4 pl-3.5 pb-1 ${
                isModernPro
                  ? "border-sky-800 bg-sky-50/40 py-1.5 pr-2 rounded-r-lg"
                  : "border-indigo-600"
              }`}
            >
              <h1 className="text-xl font-bold tracking-tight text-slate-950 break-words">
                {resume.personal.fullName.trim() || "Your Full Name"}
              </h1>
              {resume.personal.headline.trim() && (
                <p
                  className={`mt-0.5 text-xs font-semibold break-words ${
                    isModernPro ? "text-sky-800" : "text-indigo-700"
                  }`}
                >
                  {resume.personal.headline.trim()}
                </p>
              )}
              {contactItems.length > 0 && (
                <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10.5px] text-slate-600 break-all">
                  {contactItems.map((item, idx) => (
                    <span key={`${item}-${idx}`}>
                      {idx > 0 && <span className="mr-2 text-slate-300">|</span>}
                      {item}
                    </span>
                  ))}
                </p>
              )}
            </div>
          ) : isTechDev ? (
            <div className="border-b-2 border-slate-900 pb-2.5 text-left">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="font-mono text-lg font-bold tracking-tight text-slate-950 break-words">
                  {resume.personal.fullName.trim() || "Your Full Name"}
                </h1>
                {resume.personal.location.trim() && (
                  <span className="font-mono text-[10px] text-slate-500">
                    {resume.personal.location.trim()}
                  </span>
                )}
              </div>
              {resume.personal.headline.trim() && (
                <p className="mt-0.5 font-mono text-[11px] font-semibold text-slate-700 break-words">
                  {resume.personal.headline.trim()}
                </p>
              )}
              {contactItems.length > 0 && (
                <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px] text-slate-600 break-all">
                  {contactItems.map((item, idx) => (
                    <span key={`${item}-${idx}`}>
                      {idx > 0 && <span className="mr-2 text-slate-400">::</span>}
                      {item}
                    </span>
                  ))}
                </p>
              )}
            </div>
          ) : (
            <div
              className={`border-b border-slate-300 pb-3 ${
                isCompact ? "text-left" : "text-center"
              }`}
            >
              <h1 className="text-xl font-bold tracking-tight text-slate-950 break-words">
                {resume.personal.fullName.trim() || "Your Full Name"}
              </h1>
              {resume.personal.headline.trim() && (
                <p className="mt-0.5 text-xs font-medium text-slate-600 break-words">
                  {resume.personal.headline.trim()}
                </p>
              )}
              {contactItems.length > 0 && (
                <p
                  className={`mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10.5px] text-slate-600 break-all ${
                    isCompact ? "justify-start" : "justify-center"
                  }`}
                >
                  {contactItems.map((item, idx) => (
                    <span key={`${item}-${idx}`}>
                      {idx > 0 && <span className="mr-1.5 text-slate-400">•</span>}
                      {item}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}

          {/* Career Objective */}
          {resume.careerObjective.trim() && (
            <section>
              <h2 className={sectionHeadingClass}>Career Objective</h2>
              <p className="mt-1 leading-relaxed text-slate-700 break-words">
                {resume.careerObjective.trim()}
              </p>
            </section>
          )}

          {/* Professional Summary */}
          {resume.summary.trim() && (
            <section>
              <h2 className={sectionHeadingClass}>Professional Summary</h2>
              <p className="mt-1 leading-relaxed text-slate-700 break-words">
                {resume.summary.trim()}
              </p>
            </section>
          )}

          {/* Education */}
          {validEducation.length > 0 && (
            <section>
              <h2 className={sectionHeadingClass}>Education</h2>
              <div className="mt-1.5 space-y-2">
                {validEducation.map((edu) => {
                  const dateSpan = [edu.startYear.trim(), edu.endYear.trim()]
                    .filter(Boolean)
                    .join(" – ");
                  const meta = [dateSpan, edu.grade.trim()].filter(Boolean).join(" | ");
                  return (
                    <div key={edu.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="font-bold text-slate-900">
                          {edu.degree.trim() || "Degree"}
                        </span>
                        {meta && <span className="text-[10px] text-slate-600">{meta}</span>}
                      </div>
                      {(edu.institution.trim() || edu.location.trim()) && (
                        <p className="italic text-slate-700">
                          {[edu.institution.trim(), edu.location.trim()].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {edu.coursework.trim() && (
                        <p className="mt-0.5 text-[10px] text-slate-600">
                          <span className="font-semibold">Relevant Coursework:</span>{" "}
                          {edu.coursework.trim()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Skills */}
          {cleanSkills.length > 0 && (
            <section>
              <h2 className={sectionHeadingClass}>Technical Skills</h2>
              {isModern || isModernPro ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {cleanSkills.map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                        isModernPro
                          ? "bg-sky-50 text-sky-950 border-sky-200"
                          : "bg-indigo-50 text-indigo-900 border-indigo-100"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : isTechDev ? (
                <p className="mt-1 font-mono text-[10.5px] leading-relaxed text-slate-800">
                  {cleanSkills.join("  |  ")}
                </p>
              ) : (
                <p className="mt-1 leading-relaxed text-slate-700">{cleanSkills.join(" • ")}</p>
              )}
            </section>
          )}

          {/* Internships */}
          {validInternships.length > 0 && (
            <section>
              <h2 className={sectionHeadingClass}>Internships & Experience</h2>
              <div className="mt-1.5 space-y-2">
                {validInternships.map((intern) => {
                  const heading = [intern.role.trim(), intern.company.trim()]
                    .filter(Boolean)
                    .join(" — ");
                  const meta = [intern.location.trim(), intern.duration.trim()]
                    .filter(Boolean)
                    .join(" | ");
                  return (
                    <div key={intern.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="font-bold text-slate-900">{heading || "Internship"}</span>
                        {meta && <span className="text-[10px] text-slate-600">{meta}</span>}
                      </div>
                      {intern.bullets.some((b) => b.trim()) && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-slate-700">
                          {intern.bullets
                            .filter((b) => b.trim())
                            .map((b, bi) => (
                              <li key={bi} className="leading-relaxed break-words">
                                {b.trim()}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Projects */}
          {validProjects.length > 0 && (
            <section>
              <h2 className={sectionHeadingClass}>Projects</h2>
              <div className="mt-1.5 space-y-2.5">
                {validProjects.map((proj) => {
                  const meta = [proj.tech.trim(), proj.duration.trim()].filter(Boolean).join(" | ");
                  return (
                    <div key={proj.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="font-bold text-slate-900">
                          {proj.title.trim() || "Project"}
                        </span>
                        {meta && <span className="italic text-[10px] text-slate-600">{meta}</span>}
                      </div>
                      {proj.link.trim() && (
                        <p className="text-[10px] text-indigo-700 break-all">{proj.link.trim()}</p>
                      )}
                      {proj.bullets.some((b) => b.trim()) && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-slate-700">
                          {proj.bullets
                            .filter((b) => b.trim())
                            .map((b, bi) => (
                              <li key={bi} className="leading-relaxed break-words">
                                {b.trim()}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Certifications */}
          {validCerts.length > 0 && (
            <section>
              <h2 className={sectionHeadingClass}>Certifications</h2>
              <ul className="mt-1.5 space-y-1 text-slate-700">
                {validCerts.map((cert) => (
                  <li
                    key={cert.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-2"
                  >
                    <span>
                      • <span className="font-semibold text-slate-900">{cert.name.trim()}</span>
                      {cert.issuer.trim() && ` — ${cert.issuer.trim()}`}
                    </span>
                    {cert.date.trim() && (
                      <span className="text-[10px] text-slate-600">{cert.date.trim()}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Achievements */}
          {validAchievements.length > 0 && (
            <section>
              <h2 className={sectionHeadingClass}>Achievements</h2>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-slate-700">
                {validAchievements.map((ach) => (
                  <li key={ach.id} className="leading-relaxed break-words">
                    <span className="font-semibold text-slate-900">{ach.title.trim()}</span>
                    {ach.date.trim() && (
                      <span className="text-[10px] text-slate-500"> ({ach.date.trim()})</span>
                    )}
                    {ach.detail.trim() && ` — ${ach.detail.trim()}`}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
