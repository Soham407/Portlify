import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Globe, Mail, Phone, ExternalLink, MapPin, Award, Download } from "lucide-react";
import type { PortfolioData } from "./PortfolioTemplateProps";
import SectionWrapper from "@/components/preview/SectionWrapper";
import { getEffectiveLayout } from "@/lib/sectionLayouts";

const spring: any = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.07, type: "spring", stiffness: 200, damping: 18 },
  }),
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

const container: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const LIME = "#CBFF4D";
const DARK = "#111111";

const PROJECT_COLORS = [
  { bg: "#F3E8FF", border: "#C084FC", tag: "#7C3AED" },
  { bg: "#FEF9C3", border: "#FACC15", tag: "#B45309" },
  { bg: "#DCFCE7", border: "#4ADE80", tag: "#16A34A" },
  { bg: "#FEE2E2", border: "#F87171", tag: "#B91C1C" },
  { bg: "#DBEAFE", border: "#60A5FA", tag: "#1D4ED8" },
];

const SKILL_EMOJI: Record<string, string> = {
  Frontend: "🎨", Backend: "⚙️", Database: "🗄️", DevOps: "🚀",
  Mobile: "📱", "AI/ML": "🤖", Design: "✏️",
};

export default function VibrantTemplate({ bio, projects, skills, experiences, education, contact, certifications, sectionLayouts, editMode, onSectionEdit }: PortfolioData) {
  const name = [bio?.first_name, bio?.last_name].filter(Boolean).join(" ") || "Your Name";
  const firstName = bio?.first_name || name;

  const bioLayout = getEffectiveLayout("bio", sectionLayouts);
  const projectsLayout = getEffectiveLayout("projects", sectionLayouts);
  const skillsLayout = getEffectiveLayout("skills", sectionLayouts);
  const experienceLayout = getEffectiveLayout("experience", sectionLayouts);
  const educationLayout = getEffectiveLayout("education", sectionLayouts);

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-white px-8 py-4" style={{ borderBottom: "2px solid #111" }}>
        <span className="text-xl font-black tracking-tight" style={{ color: DARK }}>
          {firstName.toUpperCase()}<span style={{ color: LIME }}>.</span>
        </span>
        <div className="flex items-center gap-6 text-sm font-semibold" style={{ color: DARK }}>
          <a href="#projects" className="hover:opacity-60 transition-opacity">WORK</a>
          <a href="#skills" className="hover:opacity-60 transition-opacity">SKILLS</a>
          <a href="#contact" className="hover:opacity-60 transition-opacity">CONTACT</a>
        </div>
      </nav>

      {/* Hero / Bio */}
      <SectionWrapper id="bio" editMode={editMode} onEdit={onSectionEdit}>
        <section className="relative overflow-hidden px-8 py-20 md:px-16" style={{ background: DARK }}>
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-bl-full opacity-20" style={{ background: LIME }} />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-tr-full opacity-10" style={{ background: LIME }} />

          {/* centered layout */}
          {bioLayout === "centered" && (
            <div className="relative mx-auto max-w-2xl text-center">
              {bio?.avatar_url && (
                <motion.div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full" style={{ border: `4px solid ${LIME}` }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
                  <img src={bio.avatar_url} alt={name} className="h-full w-full object-cover" />
                </motion.div>
              )}
              <motion.h1 className="mb-4 text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{name}</motion.h1>
              {bio?.headline && (
                <motion.div className="mb-4 inline-block rounded-full px-4 py-2 text-lg font-bold" style={{ background: LIME, color: DARK }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>{bio.headline}</motion.div>
              )}
              {bio?.location && <motion.p className="mb-3 flex items-center justify-center gap-1.5 text-sm font-medium" style={{ color: LIME }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><MapPin className="h-3.5 w-3.5" /> {bio.location}</motion.p>}
              {bio?.bio && <motion.p className="mb-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{bio.bio}</motion.p>}
              <motion.div className="flex flex-wrap justify-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                {contact?.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all hover:scale-105" style={{ background: LIME, color: DARK }}><Mail className="h-4 w-4" /> Let's Talk</a>}
                {contact?.github_url && <a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105" style={{ borderColor: "rgba(255,255,255,0.3)" }}><Github className="h-4 w-4" /> GitHub</a>}
              </motion.div>
            </div>
          )}

          {/* left (default) layout */}
          {(bioLayout === "left" || bioLayout === undefined) && (
            <div className="relative mx-auto max-w-5xl md:flex md:items-center md:justify-between">
              <div className="max-w-xl">
                {bio?.location && (
                  <motion.p className="mb-4 flex items-center gap-1.5 text-sm font-medium" style={{ color: LIME }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <MapPin className="h-3.5 w-3.5" /> {bio.location}
                  </motion.p>
                )}
                <motion.h1 className="mb-4 text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-7xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{name}</motion.h1>
                {bio?.headline && (
                  <motion.div className="mb-4 inline-block rounded-full px-4 py-2 text-lg font-bold" style={{ background: LIME, color: DARK }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>{bio.headline}</motion.div>
                )}
                {bio?.bio && <motion.p className="mb-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{bio.bio}</motion.p>}
                <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  {contact?.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all hover:scale-105" style={{ background: LIME, color: DARK }}><Mail className="h-4 w-4" /> Let's Talk</a>}
                  {contact?.github_url && <a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105" style={{ borderColor: "rgba(255,255,255,0.3)" }}><Github className="h-4 w-4" /> GitHub</a>}
                  {contact?.linkedin_url && <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border-2 px-4 py-3 text-white transition-all hover:scale-105" style={{ borderColor: "rgba(255,255,255,0.3)" }}><Linkedin className="h-4 w-4" /></a>}
                  {contact?.twitter_url && <a href={contact.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border-2 px-4 py-3 text-white transition-all hover:scale-105" style={{ borderColor: "rgba(255,255,255,0.3)" }}><Twitter className="h-4 w-4" /></a>}
                </motion.div>
              </div>
              {bio?.avatar_url && (
                <motion.div className="mt-10 flex-shrink-0 md:mt-0" initial={{ opacity: 0, scale: 0.8, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 150, delay: 0.2 }}>
                  <div className="relative h-52 w-44 overflow-hidden rounded-2xl" style={{ border: `4px solid ${LIME}` }}>
                    <img src={bio.avatar_url} alt={name} className="h-full w-full object-cover" />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* split layout */}
          {bioLayout === "split" && (
            <div className="relative mx-auto max-w-5xl md:flex md:items-center md:gap-12">
              {bio?.avatar_url && (
                <motion.div className="mb-8 flex-shrink-0 md:mb-0" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                  <div className="relative h-56 w-48 overflow-hidden rounded-2xl" style={{ border: `4px solid ${LIME}` }}>
                    <img src={bio.avatar_url} alt={name} className="h-full w-full object-cover" />
                  </div>
                </motion.div>
              )}
              <div className="flex-1">
                <motion.h1 className="mb-4 text-5xl font-black uppercase leading-none tracking-tighter text-white" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{name}</motion.h1>
                {bio?.headline && <motion.div className="mb-4 inline-block rounded-full px-4 py-2 text-lg font-bold" style={{ background: LIME, color: DARK }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{bio.headline}</motion.div>}
                {bio?.bio && <motion.p className="mb-5 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{bio.bio}</motion.p>}
                <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  {contact?.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all hover:scale-105" style={{ background: LIME, color: DARK }}><Mail className="h-4 w-4" /> Let's Talk</a>}
                  {contact?.github_url && <a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105" style={{ borderColor: "rgba(255,255,255,0.3)" }}><Github className="h-4 w-4" /> GitHub</a>}
                </motion.div>
              </div>
            </div>
          )}
        </section>
      </SectionWrapper>

      {/* Marquee strip */}
      <div className="overflow-hidden py-3" style={{ background: LIME }}>
        <div className="flex gap-8 whitespace-nowrap text-sm font-black uppercase text-black animate-pulse">
          {["Web Developer", "Creative Thinker", "Problem Solver", "Open to Work", "Let's Collaborate"].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2">{t} <span>✦</span></span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-20 px-8 py-20 md:px-16">
        {/* Skills */}
        {skills.length > 0 && (
          <SectionWrapper id="skills" editMode={editMode} onEdit={onSectionEdit}>
            <motion.section id="skills" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div custom={0} variants={fadeUp} className="mb-8 flex items-center gap-4">
                <span className="text-3xl font-black uppercase tracking-tight" style={{ color: DARK }}>I SPECIALIZE IN</span>
                <div className="h-1 flex-1 rounded" style={{ background: LIME }} />
              </motion.div>
              {(skillsLayout === "tags" || skillsLayout === undefined) && (
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, i) => (
                    <motion.span key={skill.id} custom={i} variants={spring} className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "#f5f5f5", border: "2px solid #e5e5e5", color: DARK }}>
                      {skill.skill_name}
                    </motion.span>
                  ))}
                </div>
              )}
              {skillsLayout === "grouped" && (
                <div className="space-y-5">
                  {Object.entries(skillsByCategory).map(([cat, catSkills], ci) => (
                    <motion.div key={cat} custom={ci} variants={fadeUp}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-lg">{SKILL_EMOJI[cat] || "💻"}</span>
                        <p className="text-sm font-black uppercase tracking-wider" style={{ color: DARK }}>{cat}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {catSkills.map((s) => (
                          <span key={s.id} className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: "#f5f5f5", border: "2px solid #e5e5e5", color: DARK }}>{s.skill_name}</span>
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
              <motion.div custom={0} variants={fadeUp} className="mb-8 flex items-center gap-4">
                <span className="text-3xl font-black uppercase tracking-tight" style={{ color: DARK }}>RECENT WORK</span>
                <div className="h-1 flex-1 rounded" style={{ background: LIME }} />
              </motion.div>
              {(projectsLayout === "grid" || projectsLayout === undefined) && (
                <div className="grid gap-5 md:grid-cols-2">
                  {projects.map((project, i) => {
                    const colors = PROJECT_COLORS[i % PROJECT_COLORS.length];
                    return (
                      <motion.div key={project.id} custom={i} variants={spring} className="group rounded-2xl p-6 transition-all hover:-translate-y-2 hover:shadow-xl" style={{ background: colors.bg, border: `2px solid ${colors.border}` }}>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-lg font-black" style={{ color: DARK }}>{project.name}</h3>
                          <div className="flex gap-2">
                            {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="rounded-full p-2 transition-all hover:scale-110" style={{ background: DARK, color: "white" }}><Github className="h-3.5 w-3.5" /></a>}
                            {project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="rounded-full p-2 transition-all hover:scale-110" style={{ background: colors.tag, color: "white" }}><ExternalLink className="h-3.5 w-3.5" /></a>}
                          </div>
                        </div>
                        {project.problem_statement && <p className="mb-3 text-sm leading-relaxed" style={{ color: DARK + "bb" }}>{project.problem_statement}</p>}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.technologies.map((tech) => <span key={tech} className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: colors.tag + "22", color: colors.tag, border: `1px solid ${colors.tag}44` }}>{tech}</span>)}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
              {projectsLayout === "list" && (
                <div className="space-y-4">
                  {projects.map((project, i) => {
                    const colors = PROJECT_COLORS[i % PROJECT_COLORS.length];
                    return (
                      <motion.div key={project.id} custom={i} variants={fadeUp} className="flex items-start gap-4 rounded-2xl p-5" style={{ background: "#f9f9f9", border: "2px solid #e5e5e5" }}>
                        <div className="h-12 w-12 flex-shrink-0 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: colors.tag }}>
                          {project.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="font-black" style={{ color: DARK }}>{project.name}</h3>
                            <div className="flex gap-2">
                              {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="rounded-full p-1.5 transition-all hover:scale-110" style={{ background: DARK, color: "white" }}><Github className="h-3.5 w-3.5" /></a>}
                              {project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="rounded-full p-1.5 transition-all hover:scale-110" style={{ background: colors.tag, color: "white" }}><ExternalLink className="h-3.5 w-3.5" /></a>}
                            </div>
                          </div>
                          {project.problem_statement && <p className="mb-2 text-sm text-gray-600">{project.problem_statement}</p>}
                          {project.solution && <p className="mb-2 text-sm text-gray-500">{project.solution}</p>}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.map((tech) => <span key={tech} className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: colors.tag + "22", color: colors.tag }}>{tech}</span>)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              {projectsLayout === "featured" && (
                <div className="space-y-5">
                  {projects[0] && (() => {
                    const colors = PROJECT_COLORS[0];
                    return (
                      <motion.div custom={0} variants={spring} className="rounded-2xl p-8" style={{ background: colors.bg, border: `3px solid ${colors.border}` }}>
                        <div className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: colors.tag }}>★ Featured Project</div>
                        <h3 className="mb-3 text-2xl font-black" style={{ color: DARK }}>{projects[0].name}</h3>
                        {projects[0].problem_statement && <p className="mb-3 text-base leading-relaxed" style={{ color: DARK + "bb" }}>{projects[0].problem_statement}</p>}
                        {projects[0].solution && <p className="mb-3 text-sm text-gray-600">{projects[0].solution}</p>}
                        {projects[0].technologies && projects[0].technologies.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {projects[0].technologies.map((tech) => <span key={tech} className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: colors.tag + "22", color: colors.tag, border: `1px solid ${colors.tag}44` }}>{tech}</span>)}
                          </div>
                        )}
                        <div className="flex gap-3">
                          {projects[0].github_url && <a href={projects[0].github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all hover:scale-105" style={{ background: DARK, color: "white" }}><Github className="h-4 w-4" /> GitHub</a>}
                          {projects[0].project_url && <a href={projects[0].project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all hover:scale-105" style={{ background: colors.tag, color: "white" }}><ExternalLink className="h-4 w-4" /> Live</a>}
                        </div>
                      </motion.div>
                    );
                  })()}
                  {projects.length > 1 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {projects.slice(1).map((project, i) => {
                        const colors = PROJECT_COLORS[(i + 1) % PROJECT_COLORS.length];
                        return (
                          <motion.div key={project.id} custom={i + 1} variants={spring} className="rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: colors.bg, border: `2px solid ${colors.border}` }}>
                            <h3 className="mb-1 font-black" style={{ color: DARK }}>{project.name}</h3>
                            {project.problem_statement && <p className="mb-2 text-sm" style={{ color: DARK + "99" }}>{project.problem_statement}</p>}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.slice(0, 3).map((tech) => <span key={tech} className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: colors.tag + "22", color: colors.tag }}>{tech}</span>)}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
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
            <motion.section variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div custom={0} variants={fadeUp} className="mb-8 flex items-center gap-4">
                <span className="text-3xl font-black uppercase tracking-tight" style={{ color: DARK }}>EXPERIENCE</span>
                <div className="h-1 flex-1 rounded" style={{ background: LIME }} />
              </motion.div>
              {(experienceLayout === "timeline" || experienceLayout === undefined) && (
                <div className="space-y-4">
                  {experiences.map((exp, i) => (
                    <motion.div key={exp.id} custom={i} variants={fadeUp} className="flex items-start gap-4 rounded-2xl p-5" style={{ background: "#f9f9f9", border: "2px solid #e5e5e5" }}>
                      <div className="h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: DARK }}>
                        {exp.company_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-black" style={{ color: DARK }}>{exp.role_title}</h3>
                            <p className="text-sm font-semibold text-yellow-700">{exp.company_name}{exp.employment_type && <span className="ml-2 font-normal text-gray-500">· {exp.employment_type}</span>}</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 md:mt-0">{exp.start_date} — {exp.is_current ? "Present" : exp.end_date}</p>
                        </div>
                        {exp.description && <p className="mt-2 text-sm text-gray-600">{exp.description}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {experienceLayout === "compact" && (
                <div className="overflow-hidden rounded-2xl" style={{ border: "2px solid #e5e5e5" }}>
                  {experiences.map((exp, i) => (
                    <motion.div key={exp.id} custom={i} variants={fadeUp} className="flex flex-col items-start gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0" style={{ background: i % 2 === 0 ? "#f9f9f9" : "white", borderBottom: "1px solid #e5e5e5" }}>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-black text-sm" style={{ color: DARK }}>{exp.role_title}</span>
                        <span className="text-sm font-semibold text-yellow-700 sm:ml-2">@ {exp.company_name}</span>
                      </div>
                      <span className="mt-1 text-xs text-gray-500 sm:mt-0">{exp.start_date} — {exp.is_current ? "Present" : exp.end_date}</span>
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
              <motion.div custom={0} variants={fadeUp} className="mb-8 flex items-center gap-4">
                <span className="text-3xl font-black uppercase tracking-tight" style={{ color: DARK }}>EDUCATION</span>
                <div className="h-1 flex-1 rounded" style={{ background: LIME }} />
              </motion.div>
              {(educationLayout === "cards" || educationLayout === undefined) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {education.map((edu, i) => (
                    <motion.div key={edu.id} custom={i} variants={spring} className="rounded-2xl p-5" style={{ background: "#111", color: "white" }}>
                      <h3 className="font-black">{edu.institution}</h3>
                      <p className="text-sm" style={{ color: LIME }}>{edu.degree}{edu.field_of_study && ` · ${edu.field_of_study}`}</p>
                      {edu.graduation_year && <p className="mt-1 text-xs text-white/50">Class of {edu.graduation_year}</p>}
                      {edu.cgpa && <p className="text-xs text-white/50">CGPA: {edu.cgpa}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
              {educationLayout === "list" && (
                <div className="space-y-2">
                  {education.map((edu, i) => (
                    <motion.div key={edu.id} custom={i} variants={fadeUp} className="flex flex-col items-start gap-1 rounded-xl px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0" style={{ background: "#f5f5f5", border: "2px solid #e5e5e5" }}>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-black text-sm" style={{ color: DARK }}>{edu.institution}</span>
                        <span className="text-sm text-gray-600 sm:ml-2">{edu.degree}{edu.field_of_study && ` · ${edu.field_of_study}`}</span>
                      </div>
                      {edu.graduation_year && <span className="mt-1 text-xs font-bold text-gray-500 sm:mt-0">{edu.graduation_year}</span>}
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
            <motion.div custom={0} variants={fadeUp} className="mb-8 flex items-center gap-4">
              <span className="text-3xl font-black uppercase tracking-tight" style={{ color: DARK }}>ACHIEVEMENTS</span>
              <div className="h-1 flex-1 rounded" style={{ background: LIME }} />
            </motion.div>
            <div className="grid gap-4 md:grid-cols-2">
              {certifications.map((cert, i) => (
                <motion.div key={cert.id} custom={i} variants={spring} className="flex items-start gap-3 rounded-2xl p-5" style={{ background: "#f5f5f5", border: "2px solid #e5e5e5" }}>
                  <span className="mt-0.5 text-2xl">🏆</span>
                  <div>
                    <h3 className="font-black" style={{ color: DARK }}>{cert.name}</h3>
                    {cert.issuer && <p className="text-sm text-gray-500">{cert.issuer}</p>}
                    {cert.credential_url && <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold hover:underline" style={{ color: "#5c5100" }}>View credential →</a>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* CTA Footer */}
      {contact && (contact.email || contact.phone) && (
        <section id="contact" className="px-8 py-20 text-center" style={{ background: DARK }}>
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p custom={0} variants={fadeUp} className="mb-2 text-sm font-bold uppercase tracking-widest" style={{ color: LIME }}>Open to Opportunities</motion.p>
            <motion.h2 custom={1} variants={fadeUp} className="mb-6 text-5xl font-black uppercase text-white md:text-6xl">LET'S WORK<br /><span style={{ color: LIME }}>TOGETHER</span></motion.h2>
            <motion.div custom={2} variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-black transition-all hover:scale-105" style={{ background: LIME, color: DARK }}><Mail className="h-5 w-5" /> {contact.email}</a>}
              {contact.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-base font-bold text-white transition-all hover:scale-105"><Phone className="h-5 w-5" /> {contact.phone}</a>}
            </motion.div>
          </motion.div>
        </section>
      )}

      <footer className="py-6 text-center text-xs" style={{ background: "#0a0a0a", color: "#666" }}>
        Built with <a href="/" className="hover:underline" style={{ color: LIME }}>PortfolioBuilder</a>
      </footer>
    </div>
  );
}
