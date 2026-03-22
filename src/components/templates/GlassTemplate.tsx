import { motion, type Variants } from "framer-motion";
import { Github, Linkedin, Twitter, Globe, Mail, Phone, ExternalLink, MapPin, Award } from "lucide-react";
import type { PortfolioData } from "./PortfolioTemplateProps";
import SectionWrapper from "@/components/preview/SectionWrapper";
import { getPortfolioSectionAvailability, hasContactContent } from "@/lib/portfolioSectionAvailability";
import { getRenderableSectionIds } from "@/lib/portfolioSections";
import { getEffectiveLayout } from "@/lib/sectionLayouts";
import { buildCustomSectionMap, renderSimpleCustomSection } from "@/lib/templateSectionHelpers";

const fadeBlur: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" },
  }),
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function GlassTemplate({
  bio,
  projects,
  skills,
  experiences,
  education,
  contact,
  certifications,
  customSections,
  sectionLayouts,
  sectionOrder,
  hiddenSections,
  notApplicableSections,
  editMode,
  onSectionEdit,
}: PortfolioData) {
  const name = [bio?.first_name, bio?.last_name].filter(Boolean).join(" ") || "Your Name";
  const hasContactLinks = hasContactContent(contact);

  const bioLayout = getEffectiveLayout("bio", sectionLayouts);
  const projectsLayout = getEffectiveLayout("projects", sectionLayouts);
  const skillsLayout = getEffectiveLayout("skills", sectionLayouts);
  const experienceLayout = getEffectiveLayout("experience", sectionLayouts);
  const educationLayout = getEffectiveLayout("education", sectionLayouts);

  const renderableSections = getRenderableSectionIds(
    sectionOrder,
    hiddenSections,
    getPortfolioSectionAvailability({
      bio,
      projects,
      skills,
      experiences,
      education,
      contact,
      certifications,
      customSections,
    }),
    notApplicableSections
  );

  const customSectionMap = buildCustomSectionMap(customSections, (section) =>
    renderSimpleCustomSection(
      section,
      `custom:${section.id}`,
      editMode,
      onSectionEdit,
      "rounded-3xl p-8",
      "mb-4 text-2xl font-bold text-white",
      "text-sm leading-7 text-white/70",
      { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
    )
  );

  const socialPills = (
    <>
      {contact?.github_url && (
        <a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Github className="h-4 w-4" /> GitHub
        </a>
      )}
      {contact?.linkedin_url && (
        <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Linkedin className="h-4 w-4" /> LinkedIn
        </a>
      )}
      {contact?.email && (
        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", color: "#fff" }}>
          <Mail className="h-4 w-4" /> Contact Me
        </a>
      )}
      {contact?.twitter_url && (
        <a href={contact.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Twitter className="h-4 w-4" />
        </a>
      )}
      {contact?.website_url && (
        <a href={contact.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Globe className="h-4 w-4" />
        </a>
      )}
    </>
  );

  const sectionContent: Record<string, JSX.Element> = {
    ...customSectionMap,
    bio: (
      <SectionWrapper key="bio" id="bio" editMode={editMode} onEdit={onSectionEdit}>
        <section id="bio" className="relative overflow-hidden px-6 py-24 text-white">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />

          {bioLayout === "centered" && (
            <div className="relative mx-auto max-w-3xl text-center">
              {bio?.avatar_url ? (
                <motion.div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full" style={{ boxShadow: "0 0 0 3px rgba(167,139,250,0.5), 0 0 40px rgba(167,139,250,0.3)" }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                  <img src={bio.avatar_url} alt={name} className="h-full w-full object-cover" />
                </motion.div>
              ) : (
                <motion.div className="mx-auto mb-6 h-28 w-28 rounded-full" style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", boxShadow: "0 0 40px rgba(167,139,250,0.4)" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} />
              )}
              <motion.h1 className="mb-3 text-5xl font-bold tracking-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>{name}</motion.h1>
              {bio?.headline && <motion.p className="mb-2 text-xl" style={{ color: "#a78bfa" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{bio.headline}</motion.p>}
              {bio?.location && <motion.p className="mb-4 flex items-center justify-center gap-1 text-sm text-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}><MapPin className="h-3.5 w-3.5" /> {bio.location}</motion.p>}
              {bio?.bio && <motion.p className="mx-auto mb-6 max-w-xl text-white/70 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{bio.bio}</motion.p>}
              {hasContactLinks && <motion.div className="flex flex-wrap items-center justify-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>{socialPills}</motion.div>}
            </div>
          )}

          {bioLayout === "left" && (
            <div className="relative mx-auto max-w-3xl">
              {bio?.avatar_url && <motion.div className="mb-5 h-20 w-20 overflow-hidden rounded-full" style={{ boxShadow: "0 0 0 3px rgba(167,139,250,0.5)" }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}><img src={bio.avatar_url} alt={name} className="h-full w-full object-cover" /></motion.div>}
              <motion.h1 className="mb-2 text-5xl font-bold tracking-tight" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>{name}</motion.h1>
              {bio?.headline && <motion.p className="mb-2 text-xl" style={{ color: "#a78bfa" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{bio.headline}</motion.p>}
              {bio?.location && <motion.p className="mb-3 flex items-center gap-1 text-sm text-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><MapPin className="h-3.5 w-3.5" /> {bio.location}</motion.p>}
              {bio?.bio && <motion.p className="mb-5 max-w-lg text-white/70 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{bio.bio}</motion.p>}
              {hasContactLinks && <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>{socialPills}</motion.div>}
            </div>
          )}

          {bioLayout === "split" && (
            <div className="relative mx-auto max-w-4xl md:flex md:items-center md:gap-12">
              <div className="flex-1">
                <motion.h1 className="mb-3 text-5xl font-bold tracking-tight" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>{name}</motion.h1>
                {bio?.headline && <motion.p className="mb-2 text-xl" style={{ color: "#a78bfa" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{bio.headline}</motion.p>}
                {bio?.location && <motion.p className="mb-3 flex items-center gap-1 text-sm text-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><MapPin className="h-3.5 w-3.5" /> {bio.location}</motion.p>}
                {bio?.bio && <motion.p className="mb-5 max-w-md text-white/70 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{bio.bio}</motion.p>}
                {hasContactLinks && <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>{socialPills}</motion.div>}
              </div>
              {bio?.avatar_url ? (
                <motion.div className="mt-10 flex-shrink-0 md:mt-0" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                  <img src={bio.avatar_url} alt={name} className="h-44 w-44 rounded-2xl object-cover" style={{ boxShadow: "0 0 0 3px rgba(167,139,250,0.5), 0 0 40px rgba(167,139,250,0.3)" }} />
                </motion.div>
              ) : (
                <motion.div className="mt-10 h-44 w-44 flex-shrink-0 rounded-2xl md:mt-0" style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", boxShadow: "0 0 40px rgba(167,139,250,0.4)" }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} />
              )}
            </div>
          )}
        </section>
      </SectionWrapper>
    ),
    skills: (
      <SectionWrapper key="skills" id="skills" editMode={editMode} onEdit={onSectionEdit}>
        <motion.section id="skills" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/40" custom={0} variants={fadeBlur}>Skills & Technologies</motion.h2>
          {skillsLayout === "grouped" ? (
            <div className="space-y-4">
              {Object.entries(skills.reduce<Record<string, typeof skills>>((acc, s) => {
                const cat = s.category || "Other";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(s);
                return acc;
              }, {})).map(([cat, catSkills], ci) => (
                <motion.div key={cat} custom={ci + 1} variants={fadeBlur}>
                  <p className="mb-2 text-xs uppercase tracking-wider text-white/40">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((s) => <span key={s.id} className="rounded-full px-4 py-1.5 text-sm text-white/90" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)" }}>{s.skill_name}</span>)}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map((skill, i) => <motion.span key={skill.id} custom={i} variants={fadeBlur} className="rounded-full px-4 py-1.5 text-sm text-white/90" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)" }}>{skill.skill_name}</motion.span>)}
            </div>
          )}
        </motion.section>
      </SectionWrapper>
    ),
    projects: (
      <SectionWrapper key="projects" id="projects" editMode={editMode} onEdit={onSectionEdit}>
        <motion.section id="projects" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 custom={0} variants={fadeBlur} className="mb-8 text-2xl font-bold text-white">Projects</motion.h2>
          {projectsLayout === "list" ? (
            <div className="space-y-4">
              {projects.map((project, i) => (
                <motion.div key={project.id} custom={i} variants={fadeBlur} className="flex gap-5 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl font-bold text-lg text-purple-300" style={{ background: "rgba(167,139,250,0.15)" }}>{project.name.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2"><h3 className="font-semibold text-white">{project.name}</h3><div className="flex gap-2 shrink-0">{project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Github className="h-4 w-4" /></a>}{project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><ExternalLink className="h-4 w-4" /></a>}</div></div>
                    {project.problem_statement && <p className="mb-2 text-sm text-white/60">{project.problem_statement}</p>}
                    {project.solution && <p className="mb-2 text-sm text-white/50">{project.solution}</p>}
                    {project.technologies && project.technologies.length > 0 && <div className="flex flex-wrap gap-1">{project.technologies.map((tech) => <span key={tech} className="rounded px-2 py-0.5 text-xs text-purple-300" style={{ background: "rgba(167,139,250,0.15)" }}>{tech}</span>)}</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : projectsLayout === "featured" ? (
            <div className="space-y-5">
              {projects[0] && <motion.div custom={0} variants={fadeBlur} className="rounded-2xl p-8" style={{ background: "rgba(167,139,250,0.1)", backdropFilter: "blur(20px)", border: "1px solid rgba(167,139,250,0.25)", boxShadow: "0 8px 40px rgba(167,139,250,0.15)" }}><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-purple-400">Featured</div><h3 className="mb-3 text-2xl font-bold text-white">{projects[0].name}</h3>{projects[0].problem_statement && <p className="mb-4 text-white/70 leading-relaxed">{projects[0].problem_statement}</p>}{projects[0].solution && <p className="mb-4 text-sm text-white/50">{projects[0].solution}</p>}{projects[0].technologies && projects[0].technologies.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{projects[0].technologies.map((tech) => <span key={tech} className="rounded-md px-3 py-1 text-sm text-purple-300" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.2)" }}>{tech}</span>)}</div>}<div className="flex gap-3">{projects[0].github_url && <a href={projects[0].github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}><Github className="h-4 w-4" /> Code</a>}{projects[0].project_url && <a href={projects[0].project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium" style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", color: "#fff" }}><ExternalLink className="h-4 w-4" /> Live Demo</a>}</div></motion.div>}
              {projects.length > 1 && <div className="grid gap-4 md:grid-cols-2">{projects.slice(1).map((project, i) => <motion.div key={project.id} custom={i + 1} variants={fadeBlur} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}><h3 className="mb-1 font-semibold text-white">{project.name}</h3>{project.problem_statement && <p className="mb-2 text-sm text-white/60">{project.problem_statement}</p>}{project.technologies && project.technologies.length > 0 && <div className="flex flex-wrap gap-1">{project.technologies.map((tech) => <span key={tech} className="rounded px-2 py-0.5 text-xs text-purple-300" style={{ background: "rgba(167,139,250,0.12)" }}>{tech}</span>)}</div>}</motion.div>)}</div>}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {projects.map((project, i) => (
                <motion.div key={project.id} custom={i} variants={fadeBlur} className="group rounded-2xl p-6 transition-all hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
                  <h3 className="mb-2 text-lg font-semibold text-white">{project.name}</h3>
                  {project.problem_statement && <p className="mb-3 text-sm leading-relaxed text-white/60">{project.problem_statement}</p>}
                  {project.technologies && project.technologies.length > 0 && <div className="mb-4 flex flex-wrap gap-1.5">{project.technologies.map((tech) => <span key={tech} className="rounded-md px-2 py-0.5 text-xs text-purple-300" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.2)" }}>{tech}</span>)}</div>}
                  <div className="flex gap-3">{project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"><Github className="h-3.5 w-3.5" /> Code</a>}{project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"><ExternalLink className="h-3.5 w-3.5" /> Live Demo</a>}</div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </SectionWrapper>
    ),
    experience: (
      <SectionWrapper key="experience" id="experience" editMode={editMode} onEdit={onSectionEdit}>
        <motion.section id="experience" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 custom={0} variants={fadeBlur} className="mb-8 text-2xl font-bold text-white">Experience</motion.h2>
          {experienceLayout === "compact" ? (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {experiences.map((exp, i) => <motion.div key={exp.id} custom={i} variants={fadeBlur} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 px-5 py-3" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}><div><span className="font-medium text-white text-sm">{exp.role_title}</span><span className="ml-2 text-white/50 text-sm">@ {exp.company_name}</span></div><span className="text-xs text-white/30">{exp.start_date} ? {exp.is_current ? "Present" : exp.end_date}</span></motion.div>)}
            </div>
          ) : (
            <div className="relative space-y-6 pl-6">
              <div className="absolute left-0 top-2 h-full w-px" style={{ background: "linear-gradient(to bottom, #a78bfa, transparent)" }} />
              {experiences.map((exp, i) => <motion.div key={exp.id} custom={i} variants={fadeBlur} className="relative"><div className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 10px #a78bfa" }} /><div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}><h3 className="font-semibold text-white">{exp.role_title}</h3><p className="text-sm" style={{ color: "#a78bfa" }}>{exp.company_name}{exp.employment_type && <span className="ml-2 text-white/40">? {exp.employment_type}</span>}</p><p className="mt-0.5 text-xs text-white/30">{exp.start_date} ? {exp.is_current ? "Present" : exp.end_date}</p>{exp.description && <p className="mt-2 text-sm text-white/60">{exp.description}</p>}</div></motion.div>)}
            </div>
          )}
        </motion.section>
      </SectionWrapper>
    ),
    education: (
      <SectionWrapper key="education" id="education" editMode={editMode} onEdit={onSectionEdit}>
        <motion.section id="education" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 custom={0} variants={fadeBlur} className="mb-8 text-2xl font-bold text-white">Education</motion.h2>
          {educationLayout === "list" ? (
            <div className="space-y-3">{education.map((edu, i) => <motion.div key={edu.id} custom={i} variants={fadeBlur} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 rounded-lg px-5 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}><div><span className="font-medium text-white">{edu.institution}</span><span className="ml-2 text-sm text-white/50">{edu.degree}{edu.field_of_study && ` ? ${edu.field_of_study}`}</span></div>{edu.graduation_year && <span className="text-xs text-white/30">{edu.graduation_year}</span>}</motion.div>)}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{education.map((edu, i) => <motion.div key={edu.id} custom={i} variants={fadeBlur} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}><h3 className="font-semibold text-white">{edu.institution}</h3><p className="text-sm text-white/60">{edu.degree}{edu.field_of_study && ` in ${edu.field_of_study}`}</p>{edu.graduation_year && <p className="mt-1 text-xs text-white/30">Class of {edu.graduation_year}</p>}{edu.cgpa && <p className="text-xs text-white/30">CGPA: {edu.cgpa}</p>}</motion.div>)}</div>
          )}
        </motion.section>
      </SectionWrapper>
    ),
    certifications: (
      <SectionWrapper key="certifications" id="certifications" editMode={editMode} onEdit={onSectionEdit}>
        <motion.section id="certifications" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 custom={0} variants={fadeBlur} className="mb-8 text-2xl font-bold text-white">Certifications</motion.h2>
          <div className="grid gap-4 md:grid-cols-2">{certifications.map((cert, i) => <motion.div key={cert.id} custom={i} variants={fadeBlur} className="flex items-start gap-3 rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}><Award className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#a78bfa" }} /><div><h3 className="font-semibold text-white">{cert.name}</h3>{cert.issuer && <p className="text-sm text-white/60">{cert.issuer}</p>}{cert.issue_date && <p className="text-xs text-white/30">Issued: {cert.issue_date}</p>}{cert.credential_url && <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: "#a78bfa" }}>View credential ?</a>}</div></motion.div>)}</div>
        </motion.section>
      </SectionWrapper>
    ),
    contact: (
      <SectionWrapper key="contact" id="contact" editMode={editMode} onEdit={onSectionEdit}>
        <motion.section id="contact" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
          <motion.h2 custom={0} variants={fadeBlur} className="mb-2 text-4xl font-bold text-white">Let's Connect</motion.h2>
          <motion.p custom={1} variants={fadeBlur} className="mb-8 text-white/50">Open to opportunities and collaborations</motion.p>
          <motion.div custom={2} variants={fadeBlur} className="flex flex-wrap justify-center gap-4">
            {contact?.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white" style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)" }}><Mail className="h-4 w-4" /> {contact.email}</a>}
            {contact?.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-2 rounded-full px-6 py-3 text-white" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}><Phone className="h-4 w-4" /> {contact.phone}</a>}
          </motion.div>
        </motion.section>
      </SectionWrapper>
    ),
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
      {renderableSections.includes("bio") ? sectionContent.bio : null}
      <div className="mx-auto max-w-5xl space-y-16 px-6 pb-20">
        {renderableSections.filter((sectionId) => sectionId !== "bio").map((sectionId) => sectionContent[sectionId])}
      </div>
      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-sm text-white/30">Built with <a href="/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Portlify</a></p>
      </footer>
    </div>
  );
}
