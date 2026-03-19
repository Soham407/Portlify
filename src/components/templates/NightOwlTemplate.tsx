import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Globe, Mail, Phone, ExternalLink, MapPin, Award } from "lucide-react";
import type { PortfolioData } from "./PortfolioTemplateProps";
import SectionWrapper from "@/components/preview/SectionWrapper";
import { getEffectiveLayout } from "@/lib/sectionLayouts";

const slideLeft: any = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const container: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const TEAL = "#2DD4BF";
const BG = "#0d1117";
const CARD_BG = "#161b22";
const BORDER = "#30363d";

export default function NightOwlTemplate({ bio, projects, skills, experiences, education, contact, certifications, sectionLayouts, editMode, onSectionEdit }: PortfolioData) {
  const name = [bio?.first_name, bio?.last_name].filter(Boolean).join(" ") || "Your Name";

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const bioLayout = getEffectiveLayout("bio", sectionLayouts);
  const projectsLayout = getEffectiveLayout("projects", sectionLayouts);
  const skillsLayout = getEffectiveLayout("skills", sectionLayouts);
  const experienceLayout = getEffectiveLayout("experience", sectionLayouts);
  const educationLayout = getEffectiveLayout("education", sectionLayouts);

  return (
    <div className="min-h-screen" style={{ background: BG, color: "#c9d1d9" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4" style={{ background: "rgba(13,17,23,0.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${BORDER}` }}>
        <span className="font-mono text-sm font-semibold" style={{ color: TEAL }}>
          {bio?.first_name ? `~/${bio.first_name.toLowerCase()}` : "~/portfolio"}
        </span>
        <div className="flex items-center gap-6 text-sm" style={{ color: "#8b949e" }}>
          <a href="#projects" className="hover:text-white transition-colors">Projects</a>
          <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
      </nav>

      {/* Hero / Bio */}
      <SectionWrapper id="bio" editMode={editMode} onEdit={onSectionEdit}>
        <section className="px-8 py-20 md:px-16">
          {/* centered layout */}
          {bioLayout === "centered" && (
            <div className="mx-auto max-w-3xl text-center">
              {bio?.avatar_url && (
                <motion.img src={bio.avatar_url} alt={name} className="mx-auto mb-6 h-24 w-24 rounded-full object-cover" style={{ border: `2px solid ${TEAL}` }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} />
              )}
              <motion.div className="mb-3 inline-block rounded-full px-3 py-1 font-mono text-xs" style={{ background: `${TEAL}18`, color: TEAL, border: `1px solid ${TEAL}33` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Available for work
              </motion.div>
              <motion.h1 className="mb-3 text-4xl font-bold leading-tight text-white md:text-5xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{name}</motion.h1>
              {bio?.headline && <motion.p className="mb-3 text-xl" style={{ color: TEAL }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{bio.headline}</motion.p>}
              {bio?.location && <motion.p className="mb-4 flex items-center justify-center gap-1.5 text-sm" style={{ color: "#8b949e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><MapPin className="h-3.5 w-3.5" /> {bio.location}</motion.p>}
              {bio?.bio && <motion.p className="mx-auto mb-6 max-w-lg leading-relaxed" style={{ color: "#8b949e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{bio.bio}</motion.p>}
              {contact && (
                <motion.div className="flex flex-wrap justify-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-black transition-all hover:opacity-90" style={{ background: TEAL }}><Mail className="h-4 w-4" /> Contact</a>}
                  {contact.github_url && <a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white transition-all hover:opacity-80" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}><Github className="h-4 w-4" /> GitHub</a>}
                  {contact.linkedin_url && <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white transition-all hover:opacity-80" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}><Linkedin className="h-4 w-4" /></a>}
                </motion.div>
              )}
            </div>
          )}

          {/* left layout (default) */}
          {(bioLayout === "left" || bioLayout === undefined) && (
            <div className="mx-auto max-w-5xl md:flex md:items-center md:gap-12">
              <div className="flex-1">
                {bio?.avatar_url && (
                  <motion.img src={bio.avatar_url} alt={name} className="mb-6 h-24 w-24 rounded-full object-cover md:hidden" style={{ border: `2px solid ${TEAL}` }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} />
                )}
                <motion.div className="mb-3 inline-block rounded-full px-3 py-1 font-mono text-xs" style={{ background: `${TEAL}18`, color: TEAL, border: `1px solid ${TEAL}33` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Available for work
                </motion.div>
                <motion.h1 className="mb-3 text-4xl font-bold leading-tight text-white md:text-5xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{name}</motion.h1>
                {bio?.headline && <motion.p className="mb-3 text-xl" style={{ color: TEAL }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>{bio.headline}</motion.p>}
                {bio?.location && <motion.p className="mb-4 flex items-center gap-1.5 text-sm" style={{ color: "#8b949e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><MapPin className="h-3.5 w-3.5" /> {bio.location}</motion.p>}
                {bio?.bio && <motion.p className="mb-6 max-w-lg leading-relaxed" style={{ color: "#8b949e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{bio.bio}</motion.p>}
                {contact && (
                  <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-black transition-all hover:opacity-90" style={{ background: TEAL }}><Mail className="h-4 w-4" /> Contact</a>}
                    {contact.github_url && <a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white transition-all hover:opacity-80" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}><Github className="h-4 w-4" /> GitHub</a>}
                    {contact.linkedin_url && <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white transition-all hover:opacity-80" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}><Linkedin className="h-4 w-4" /></a>}
                    {contact.twitter_url && <a href={contact.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white transition-all hover:opacity-80" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}><Twitter className="h-4 w-4" /></a>}
                    {contact.website_url && <a href={contact.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white transition-all hover:opacity-80" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}><Globe className="h-4 w-4" /></a>}
                  </motion.div>
                )}
              </div>
              {bio?.avatar_url && (
                <motion.div className="hidden md:block flex-shrink-0" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                  <img src={bio.avatar_url} alt={name} className="h-40 w-40 rounded-2xl object-cover" style={{ border: `2px solid ${TEAL}`, boxShadow: `0 0 40px ${TEAL}33` }} />
                </motion.div>
              )}
            </div>
          )}

          {/* split layout */}
          {bioLayout === "split" && (
            <div className="mx-auto max-w-5xl md:flex md:items-center md:gap-12">
              {bio?.avatar_url && (
                <motion.div className="mb-8 flex-shrink-0 md:mb-0" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                  <img src={bio.avatar_url} alt={name} className="h-44 w-44 rounded-2xl object-cover" style={{ border: `2px solid ${TEAL}`, boxShadow: `0 0 40px ${TEAL}33` }} />
                </motion.div>
              )}
              <div className="flex-1">
                <motion.h1 className="mb-3 text-4xl font-bold leading-tight text-white md:text-5xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{name}</motion.h1>
                {bio?.headline && <motion.p className="mb-3 text-xl" style={{ color: TEAL }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{bio.headline}</motion.p>}
                {bio?.location && <motion.p className="mb-3 flex items-center gap-1.5 text-sm" style={{ color: "#8b949e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><MapPin className="h-3.5 w-3.5" /> {bio.location}</motion.p>}
                {bio?.bio && <motion.p className="mb-5 max-w-lg leading-relaxed" style={{ color: "#8b949e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{bio.bio}</motion.p>}
                {contact && (
                  <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-black transition-all hover:opacity-90" style={{ background: TEAL }}><Mail className="h-4 w-4" /> Contact</a>}
                    {contact.github_url && <a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white transition-all hover:opacity-80" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}><Github className="h-4 w-4" /> GitHub</a>}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </section>
      </SectionWrapper>

      <div className="mx-auto max-w-5xl space-y-20 px-8 pb-24 md:px-16">
        {/* Skills */}
        {skills.length > 0 && (
          <SectionWrapper id="skills" editMode={editMode} onEdit={onSectionEdit}>
            <motion.section variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 custom={0} variants={slideLeft} className="mb-6 font-mono text-sm font-semibold uppercase tracking-widest" style={{ color: TEAL }}>
                // Tech Stack
              </motion.h2>
              {skillsLayout === "tags" && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <motion.span key={s.id} custom={i + 1} variants={slideLeft} className="rounded-md px-3 py-1 font-mono text-sm" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: "#c9d1d9" }}>
                      {s.skill_name}
                    </motion.span>
                  ))}
                </div>
              )}
              {skillsLayout === "grouped" && (
                <div className="space-y-4">
                  {Object.entries(skillsByCategory).map(([cat, catSkills], ci) => (
                    <motion.div key={cat} custom={ci + 1} variants={slideLeft}>
                      <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: "#8b949e" }}>{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {catSkills.map((s) => (
                          <span key={s.id} className="rounded-md px-3 py-1 font-mono text-sm" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: "#c9d1d9" }}>
                            {s.skill_name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </SectionWrapper>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <SectionWrapper id="projects" editMode={editMode} onEdit={onSectionEdit}>
            <motion.section id="projects" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 custom={0} variants={slideLeft} className="mb-8 font-mono text-sm font-semibold uppercase tracking-widest" style={{ color: TEAL }}>
                // Projects
              </motion.h2>
              {projectsLayout === "grid" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((project, i) => (
                    <motion.div key={project.id} custom={i + 1} variants={slideLeft} className="group rounded-lg p-5 transition-all" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                      <h3 className="mb-1 font-semibold text-white">{project.name}</h3>
                      {project.problem_statement && <p className="mb-2 text-sm leading-relaxed" style={{ color: "#8b949e" }}>{project.problem_statement}</p>}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {project.technologies.map((tech) => <span key={tech} className="rounded px-2 py-0.5 font-mono text-xs" style={{ background: `${TEAL}18`, color: TEAL, border: `1px solid ${TEAL}33` }}>{tech}</span>)}
                        </div>
                      )}
                      <div className="flex gap-3">
                        {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs transition-colors hover:text-white" style={{ color: "#8b949e" }}><Github className="h-3.5 w-3.5" /> Code</a>}
                        {project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs transition-colors" style={{ color: TEAL }}><ExternalLink className="h-3.5 w-3.5" /> Demo</a>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {(projectsLayout === "list" || projectsLayout === undefined) && (
                <div className="space-y-4">
                  {projects.map((project, i) => (
                    <motion.div key={project.id} custom={i + 1} variants={slideLeft} className="group rounded-lg p-6 transition-all hover:border-teal-500/40" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                      <div className="md:flex md:items-start md:gap-6">
                        <div className="mb-4 h-20 w-32 flex-shrink-0 rounded-md md:mb-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${TEAL}22, ${TEAL}55)`, border: `1px solid ${TEAL}33` }}>
                          <div className="flex h-full items-center justify-center font-mono text-xs" style={{ color: TEAL }}>{project.name.slice(0, 2).toUpperCase()}</div>
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold text-white">{project.name}</h3>
                          {project.problem_statement && <p className="mb-3 text-sm leading-relaxed" style={{ color: "#8b949e" }}>{project.problem_statement}</p>}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-1.5">
                              {project.technologies.map((tech) => <span key={tech} className="rounded px-2 py-0.5 font-mono text-xs" style={{ background: `${TEAL}18`, color: TEAL, border: `1px solid ${TEAL}33` }}>{tech}</span>)}
                            </div>
                          )}
                          <div className="flex gap-4">
                            {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs transition-colors hover:text-white" style={{ color: "#8b949e" }}><Github className="h-3.5 w-3.5" /> Repository</a>}
                            {project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: TEAL }}><ExternalLink className="h-3.5 w-3.5" /> Live Preview →</a>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {projectsLayout === "featured" && (
                <div className="space-y-4">
                  {projects[0] && (
                    <motion.div custom={1} variants={slideLeft} className="rounded-lg p-7" style={{ background: `linear-gradient(135deg, ${TEAL}08, ${TEAL}18)`, border: `1px solid ${TEAL}44` }}>
                      <div className="mb-1 font-mono text-xs" style={{ color: TEAL }}>// featured_project</div>
                      <h3 className="mb-2 text-xl font-bold text-white">{projects[0].name}</h3>
                      {projects[0].problem_statement && <p className="mb-3 text-sm leading-relaxed" style={{ color: "#8b949e" }}>{projects[0].problem_statement}</p>}
                      {projects[0].technologies && projects[0].technologies.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {projects[0].technologies.map((tech) => <span key={tech} className="rounded px-2 py-0.5 font-mono text-xs" style={{ background: `${TEAL}18`, color: TEAL, border: `1px solid ${TEAL}33` }}>{tech}</span>)}
                        </div>
                      )}
                      <div className="flex gap-3">
                        {projects[0].github_url && <a href={projects[0].github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-black" style={{ background: TEAL }}><Github className="h-4 w-4" /> Code</a>}
                        {projects[0].project_url && <a href={projects[0].project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-white" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}><ExternalLink className="h-4 w-4" /> Demo</a>}
                      </div>
                    </motion.div>
                  )}
                  {projects.length > 1 && (
                    <div className="grid gap-3 md:grid-cols-2">
                      {projects.slice(1).map((project, i) => (
                        <motion.div key={project.id} custom={i + 2} variants={slideLeft} className="rounded-lg p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                          <h3 className="mb-1 font-medium text-white">{project.name}</h3>
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((tech) => <span key={tech} className="rounded px-1.5 py-0.5 font-mono text-xs" style={{ background: `${TEAL}18`, color: TEAL }}>{tech}</span>)}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          </SectionWrapper>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <SectionWrapper id="experience" editMode={editMode} onEdit={onSectionEdit}>
            <motion.section id="experience" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 custom={0} variants={slideLeft} className="mb-8 font-mono text-sm font-semibold uppercase tracking-widest" style={{ color: TEAL }}>
                // Experience
              </motion.h2>
              {experienceLayout === "timeline" && (
                <div className="relative space-y-0 pl-8">
                  <div className="absolute left-0 top-2 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, ${TEAL}, transparent)` }} />
                  {experiences.map((exp, i) => (
                    <motion.div key={exp.id} custom={i + 1} variants={slideLeft} className="relative pb-8">
                      <div className="absolute -left-[33px] top-1.5 h-3.5 w-3.5 rounded-full" style={{ background: TEAL, boxShadow: `0 0 8px ${TEAL}` }} />
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{exp.role_title}</h3>
                          <p className="text-sm" style={{ color: TEAL }}>{exp.company_name}{exp.employment_type && <span className="ml-2 text-xs" style={{ color: "#8b949e" }}>· {exp.employment_type}</span>}</p>
                        </div>
                        <p className="mt-1 font-mono text-xs md:mt-0" style={{ color: "#8b949e" }}>{exp.start_date} — {exp.is_current ? "Present" : exp.end_date}</p>
                      </div>
                      {exp.description && <p className="mt-2 text-sm leading-relaxed" style={{ color: "#8b949e" }}>{exp.description}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
              {experienceLayout === "compact" && (
                <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${BORDER}` }}>
                  {experiences.map((exp, i) => (
                    <motion.div key={exp.id} custom={i + 1} variants={slideLeft} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3 gap-1 sm:gap-0" style={{ background: i % 2 === 0 ? CARD_BG : `${CARD_BG}88`, borderBottom: `1px solid ${BORDER}` }}>
                      <div>
                        <span className="font-medium text-white text-sm">{exp.role_title}</span>
                        <span className="ml-2 text-sm" style={{ color: TEAL }}>@ {exp.company_name}</span>
                      </div>
                      <span className="font-mono text-xs" style={{ color: "#8b949e" }}>{exp.start_date} — {exp.is_current ? "Present" : exp.end_date}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </SectionWrapper>
        )}

        {/* Education */}
        {education.length > 0 && (
          <SectionWrapper id="education" editMode={editMode} onEdit={onSectionEdit}>
            <motion.section variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 custom={0} variants={slideLeft} className="mb-6 font-mono text-sm font-semibold uppercase tracking-widest" style={{ color: TEAL }}>
                // Education
              </motion.h2>
              {educationLayout === "cards" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {education.map((edu, i) => (
                    <motion.div key={edu.id} custom={i + 1} variants={slideLeft} className="rounded-lg p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                      <h3 className="font-medium text-white">{edu.institution}</h3>
                      <p className="text-sm" style={{ color: "#8b949e" }}>{edu.degree}{edu.field_of_study && ` · ${edu.field_of_study}`}</p>
                      {edu.graduation_year && <p className="mt-1 font-mono text-xs" style={{ color: "#8b949e" }}>Class of {edu.graduation_year}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
              {educationLayout === "list" && (
                <div className="space-y-2">
                  {education.map((edu, i) => (
                    <motion.div key={edu.id} custom={i + 1} variants={slideLeft} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 rounded-lg px-4 py-3" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                      <div>
                        <span className="font-medium text-white text-sm">{edu.institution}</span>
                        <span className="ml-2 text-sm" style={{ color: "#8b949e" }}>{edu.degree}{edu.field_of_study && ` · ${edu.field_of_study}`}</span>
                      </div>
                      {edu.graduation_year && <span className="font-mono text-xs" style={{ color: "#8b949e" }}>{edu.graduation_year}</span>}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </SectionWrapper>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <motion.section variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 custom={0} variants={slideLeft} className="mb-6 font-mono text-sm font-semibold uppercase tracking-widest" style={{ color: TEAL }}>
              // Certifications
            </motion.h2>
            <div className="grid gap-4 md:grid-cols-2">
              {certifications.map((cert, i) => (
                <motion.div key={cert.id} custom={i + 1} variants={slideLeft} className="flex items-start gap-3 rounded-lg p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                  <Award className="mt-0.5 h-5 w-5 shrink-0" style={{ color: TEAL }} />
                  <div>
                    <h3 className="font-medium text-white">{cert.name}</h3>
                    {cert.issuer && <p className="text-sm" style={{ color: "#8b949e" }}>{cert.issuer}</p>}
                    {cert.credential_url && <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: TEAL }}>View credential →</a>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Contact */}
        {contact && (contact.email || contact.phone) && (
          <motion.section id="contact" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-xl p-10 text-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <motion.p custom={0} variants={slideLeft} className="mb-2 font-mono text-xs uppercase tracking-widest" style={{ color: TEAL }}>// Get In Touch</motion.p>
            <motion.h2 custom={1} variants={slideLeft} className="mb-4 text-3xl font-bold text-white">Let's build something together</motion.h2>
            <motion.p custom={2} variants={slideLeft} className="mb-8 text-sm" style={{ color: "#8b949e" }}>I'm currently open to new opportunities</motion.p>
            <motion.div custom={3} variants={slideLeft} className="flex flex-wrap justify-center gap-4">
              {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-md px-6 py-3 font-medium text-black transition-all hover:opacity-90" style={{ background: TEAL }}><Mail className="h-4 w-4" /> {contact.email}</a>}
              {contact.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-2 rounded-md px-6 py-3 text-white transition-all hover:opacity-80" style={{ background: "#21262d", border: `1px solid ${BORDER}` }}><Phone className="h-4 w-4" /> {contact.phone}</a>}
            </motion.div>
          </motion.section>
        )}
      </div>

      <footer className="border-t py-8 text-center font-mono text-xs" style={{ borderColor: BORDER, color: "#8b949e" }}>
        Built with <a href="/" className="hover:underline" style={{ color: TEAL }}>PortfolioBuilder</a>
      </footer>
    </div>
  );
}
