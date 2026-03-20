import type { PortfolioData } from "@/components/templates";
import { PORTFOLIO_SECTIONS } from "@/lib/constants";
import { normalizeHiddenSections, normalizeSectionOrder } from "@/lib/portfolioSections";

type PrintablePortfolioProps = PortfolioData & {
  name?: string | null;
  mode: "portfolio" | "resume";
  sectionOrder?: string[] | null;
  hiddenSections?: string[] | null;
};

const hasSectionContent = (sectionId: string, data: PrintablePortfolioProps) => {
  if (sectionId === "bio") return !!(data.bio?.first_name || data.bio?.last_name || data.bio?.headline || data.bio?.bio);
  if (sectionId === "projects") return data.projects.length > 0;
  if (sectionId === "skills") return data.skills.length > 0;
  if (sectionId === "experience") return data.experiences.length > 0;
  if (sectionId === "education") return data.education.length > 0;
  if (sectionId === "certifications") return data.certifications.length > 0;
  if (sectionId === "contact") return !!(data.contact?.email || data.contact?.phone || data.contact?.linkedin_url || data.contact?.github_url || data.contact?.website_url);
  return false;
};

const sectionTitleMap = Object.fromEntries(PORTFOLIO_SECTIONS.map((section) => [section.id, section.label]));

export default function PrintablePortfolio(props: PrintablePortfolioProps) {
  const order = normalizeSectionOrder(props.sectionOrder);
  const hiddenSections = normalizeHiddenSections(props.hiddenSections);
  const visibleSections = order.filter((sectionId) => !hiddenSections.includes(sectionId) && hasSectionContent(sectionId, props));
  const fullName = [props.bio?.first_name, props.bio?.last_name].filter(Boolean).join(" ").trim() || props.name || "Portfolio";
  const compact = props.mode === "resume";

  return (
    <div className={`mx-auto min-h-screen bg-white text-slate-950 ${compact ? "max-w-4xl px-8 py-10" : "max-w-5xl px-10 py-12"}`}>
      <header className={`border-b border-slate-200 ${compact ? "pb-6" : "pb-8"}`}>
        <div className={`flex ${compact ? "flex-col gap-4 md:flex-row md:items-end md:justify-between" : "flex-col gap-5 md:flex-row md:items-center md:justify-between"}`}>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{props.mode === "resume" ? "Resume Export" : "Portfolio Export"}</p>
            <h1 className={`${compact ? "mt-2 text-4xl" : "mt-3 text-5xl"} font-semibold tracking-tight`}>{fullName}</h1>
            {props.bio?.headline && <p className="mt-3 text-lg text-slate-600">{props.bio.headline}</p>}
            {props.bio?.bio && !compact && <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{props.bio.bio}</p>}
          </div>
          <div className="space-y-1 text-sm text-slate-600">
            {props.contact?.email && <p>{props.contact.email}</p>}
            {props.contact?.phone && <p>{props.contact.phone}</p>}
            {props.contact?.website_url && <p>{props.contact.website_url}</p>}
            {props.contact?.linkedin_url && <p>{props.contact.linkedin_url}</p>}
            {props.contact?.github_url && <p>{props.contact.github_url}</p>}
          </div>
        </div>
      </header>

      <main className={`${compact ? "mt-8 space-y-7" : "mt-10 space-y-10"}`}>
        {visibleSections.map((sectionId) => (
          <section key={sectionId}>
            <h2 className="mb-4 border-b border-slate-200 pb-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              {sectionTitleMap[sectionId]}
            </h2>

            {sectionId === "bio" && props.bio && (
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  {compact && props.bio.bio && <p className="text-sm leading-7 text-slate-700">{props.bio.bio}</p>}
                  {props.bio.location && <p className="mt-2 text-sm text-slate-500">{props.bio.location}</p>}
                </div>
              </div>
            )}

            {sectionId === "projects" && (
              <div className="space-y-4">
                {props.projects.map((project) => (
                  <article key={project.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium">{project.name}</h3>
                      <div className="flex gap-3 text-xs text-slate-500">
                        {project.github_url && <span>Code</span>}
                        {project.project_url && <span>Live</span>}
                      </div>
                    </div>
                    {project.problem_statement && <p className="mt-2 text-sm text-slate-700">{project.problem_statement}</p>}
                    {project.solution_approach && <p className="mt-1 text-sm text-slate-500">{project.solution_approach}</p>}
                    {project.technologies && project.technologies.length > 0 && (
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{project.technologies.join(" • ")}</p>
                    )}
                  </article>
                ))}
              </div>
            )}

            {sectionId === "skills" && (
              <div className="flex flex-wrap gap-2">
                {props.skills.map((skill) => (
                  <span key={skill.id} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700">
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            )}

            {sectionId === "experience" && (
              <div className="space-y-4">
                {props.experiences.map((experience) => (
                  <article key={experience.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{experience.role_title}</h3>
                        <p className="text-sm text-slate-600">{experience.company_name}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {experience.start_date || "Start"} - {experience.is_current ? "Present" : experience.end_date || "End"}
                      </p>
                    </div>
                    {experience.description && <p className="mt-2 text-sm text-slate-700">{experience.description}</p>}
                  </article>
                ))}
              </div>
            )}

            {sectionId === "education" && (
              <div className="space-y-4">
                {props.education.map((education) => (
                  <article key={education.id}>
                    <h3 className="font-medium">{education.institution}</h3>
                    <p className="text-sm text-slate-600">
                      {education.degree}
                      {education.field_of_study ? ` in ${education.field_of_study}` : ""}
                    </p>
                    {education.graduation_year && <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Class of {education.graduation_year}</p>}
                  </article>
                ))}
              </div>
            )}

            {sectionId === "certifications" && (
              <div className="grid gap-4 md:grid-cols-2">
                {props.certifications.map((certification) => (
                  <article key={certification.id} className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-medium">{certification.name}</h3>
                    {certification.issuer && <p className="mt-1 text-sm text-slate-600">{certification.issuer}</p>}
                    {certification.issue_date && <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Issued {certification.issue_date}</p>}
                  </article>
                ))}
              </div>
            )}

            {sectionId === "contact" && props.contact && (
              <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                {props.contact.email && <p>Email: {props.contact.email}</p>}
                {props.contact.phone && <p>Phone: {props.contact.phone}</p>}
                {props.contact.linkedin_url && <p>LinkedIn: {props.contact.linkedin_url}</p>}
                {props.contact.github_url && <p>GitHub: {props.contact.github_url}</p>}
                {props.contact.twitter_url && <p>X: {props.contact.twitter_url}</p>}
                {props.contact.website_url && <p>Website: {props.contact.website_url}</p>}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
