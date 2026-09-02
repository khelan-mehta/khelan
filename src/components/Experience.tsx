import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as const

const experiences = [
  {
    company: 'CannonDesign',
    role: 'AI Engineer, Sustainability Automation (Intern)',
    location: 'Mumbai, IN',
    period: 'May – Jul 2026',
    description:
      'Architected The Marcus Studio — a full-stack AI platform parsing eQUEST, TRACE 3D Plus and IES-VE outputs into one unified schema, cutting an 80-hour BIM-to-documentation workflow to ~2 hours. Delivered ASHRAE 90.1 & Title 24 compliance modelling for LAUSD K-12 projects.',
    link: { label: 'Read the case study', href: '#top' },
  },
  {
    company: 'Ergo Energy LLP',
    role: 'Automation & Sustainability Engineer',
    location: 'Surat, IN',
    period: 'Jun – Dec 2025',
    description:
      'Designed an ESG KPI tracker and disclosure-framework mapper. Built Python pipelines cutting analysis time 40%, supported 3 LEED certifications with baseline energy models, and ran 8+ energy audits identifying 15–20% annual cost savings. Shipped the firm’s client-facing platform.',
    link: { label: 'ergoenergysolution.com', href: 'https://ergoenergysolution.com' },
  },
  {
    company: 'LEAD Consultancy & Engineering',
    role: 'Automation Engineering Intern',
    location: 'Bengaluru, IN',
    period: 'May 2026',
    description:
      'Built workflow automation for engineering-consultancy processes — replacing manual, repeat-heavy steps with scripted pipelines.',
  },
  {
    company: 'The IT Company — Brown Ion',
    role: 'Development Team Manager',
    location: 'Remote',
    period: '2023 – 2024',
    description:
      'Led a 6-developer team delivering 10+ production web applications on agile cycles — shipping 20% ahead of schedule at 99.9% uptime. Architected MERN systems to OWASP standards and built ML models automating internal workflows.',
  },
  {
    company: 'Admyre',
    role: 'Full-Stack Engineer',
    location: 'Remote',
    period: '2021 – 2023',
    description:
      'Built an influencer-marketing platform (React / Node / Express) connecting 20+ brands to creators, processing $2K+ in campaign transactions, with dashboards tracking 300+ engagement metrics across 15+ monthly campaigns.',
  },
]

export default function Experience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-90px' })

  return (
    <section id="experience" className="section" ref={ref} style={{ background: 'var(--paper)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ marginBottom: 'clamp(30px, 4vw, 48px)' }}
        >
          <div className="sec-head">
            <span className="sec-index">/ track record</span>
            <h2 className="sec-title">Where I’ve shipped</h2>
          </div>
        </motion.div>

        <div style={{ borderTop: '1px solid var(--line)' }}>
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.07, ease }}
              className="exp-row"
            >
              <div className="exp-meta">
                <span className="exp-period">{exp.period}</span>
                <span className="mono-label" style={{ fontSize: 10 }}>{exp.location}</span>
              </div>
              <div className="exp-body">
                <h3 className="exp-company">{exp.company}</h3>
                <span className="exp-role">{exp.role}</span>
                <p className="exp-desc">{exp.description}</p>
                {exp.link && (
                  <a
                    className="exp-link"
                    href={exp.link.href}
                    target={exp.link.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    {exp.link.label}
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .exp-row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 28px;
          padding: clamp(28px, 3.5vw, 44px) 0;
          border-bottom: 1px solid var(--line);
        }
        .exp-meta { display: flex; flex-direction: column; gap: 8px; padding-top: 5px; }
        .exp-period {
          font-family: var(--mono); font-size: 13px; font-weight: 500;
          color: var(--indigo); letter-spacing: 0.01em;
        }
        .exp-company {
          font-family: var(--serif); font-weight: 400;
          font-size: clamp(1.6rem, 3vw, 2.3rem); line-height: 1.05;
          letter-spacing: -0.015em; color: var(--ink);
        }
        .exp-role { display: block; font-size: 14px; color: var(--ink-3); margin: 6px 0 16px; font-weight: 500; }
        .exp-desc { font-size: 14.5px; line-height: 1.7; color: var(--ink-2); max-width: 62ch; }
        .exp-link {
          display: inline-flex; align-items: center; gap: 5px; margin-top: 16px;
          font-family: var(--mono); font-size: 12.5px; color: var(--indigo-ink);
          border-bottom: 1px solid var(--indigo-line); padding-bottom: 2px;
          transition: gap 0.25s var(--ease-out-expo), border-color 0.25s;
        }
        .exp-link:hover { gap: 9px; border-color: var(--indigo); }
        @media (max-width: 680px) {
          .exp-row { grid-template-columns: 1fr; gap: 12px; }
          .exp-meta { flex-direction: row; align-items: center; gap: 14px; }
        }
      `}</style>
    </section>
  )
}
