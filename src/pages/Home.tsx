import { useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import ProjectGraph from '../components/ProjectGraph'
import Experience from '../components/Experience'
import Certifications from '../components/Certifications'
import Contact from '../components/Contact'
import TalkModal from '../components/TalkModal'
import KnowledgeGraph from '../components/knowledge-graph/KnowledgeGraph'
import ParticleField from '../components/ParticleField'
import FloatingNode from '../components/FloatingNode'
import CustomCursor from '../components/CustomCursor'

export default function Home() {
  const [talkOpen, setTalkOpen] = useState(false)
  const [graphOpen, setGraphOpen] = useState(false)

  return (
    <>
      <ParticleField />
      <FloatingNode onNodeClick={() => setGraphOpen(true)} />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero
          onTalkClick={() => setTalkOpen(true)}
          onGraphClick={() => setGraphOpen(true)}
        />
        <About />
        <Skills />
        <ProjectGraph onNodeClick={() => setGraphOpen(true)} />
        <Experience />
        <Certifications />
        <Contact />
      </main>

      <button
        className="floating-talk-btn"
        onClick={() => setTalkOpen(true)}
        aria-label="Talk with Khelan"
      >
        <span className="floating-pulse" />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </button>

      <TalkModal open={talkOpen} onClose={() => setTalkOpen(false)} />
      <KnowledgeGraph isOpen={graphOpen} onClose={() => setGraphOpen(false)} />
    </>
  )
}
