import { useState, lazy, Suspense } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import CurrentModels from '../components/CurrentModels'
import About from '../components/About'
import FlagshipProjects from '../components/FlagshipProjects'
import MarcusStudio from '../components/MarcusStudio'
import ProjectGraph from '../components/ProjectGraph'
import Skills from '../components/Skills'
import Experience from '../components/Experience'
import Wins from '../components/Wins'
import Certifications from '../components/Certifications'
import Contact from '../components/Contact'
import CustomCursor from '../components/CustomCursor'

const TalkModal = lazy(() => import('../components/TalkModal'))
const KnowledgeGraph = lazy(() => import('../components/knowledge-graph/KnowledgeGraph'))

export default function Home() {
  const [talkOpen, setTalkOpen] = useState(false)
  const [graphOpen, setGraphOpen] = useState(false)

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero
          onTalkClick={() => setTalkOpen(true)}
          onGraphClick={() => setGraphOpen(true)}
        />
        <CurrentModels />
        <About />
        <FlagshipProjects />
        <MarcusStudio />
        <Skills />
        <ProjectGraph onNodeClick={() => setGraphOpen(true)} />
        <Experience />
        <Wins />
        <Certifications />
        <Contact />
      </main>

      <button
        className="floating-talk-btn"
        onClick={() => setTalkOpen(true)}
        aria-label="Talk with Khelan's AI"
      >
        <span className="floating-pulse" />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <Suspense fallback={null}>
        {talkOpen && <TalkModal open={talkOpen} onClose={() => setTalkOpen(false)} />}
        {graphOpen && <KnowledgeGraph isOpen={graphOpen} onClose={() => setGraphOpen(false)} />}
      </Suspense>
    </>
  )
}
