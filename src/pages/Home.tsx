import { useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import Experience from '../components/Experience'
import Certifications from '../components/Certifications'
import Contact from '../components/Contact'
import TalkModal from '../components/TalkModal'

export default function Home() {
  const [talkOpen, setTalkOpen] = useState(false)

  return (
    <>
      <Navbar />
      <main>
        <Hero onTalkClick={() => setTalkOpen(true)} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Certifications />
        <Contact />
      </main>

      {/* Floating Talk Button */}
      <button
        className="floating-talk-btn"
        onClick={() => setTalkOpen(true)}
        aria-label="Talk with Khelan"
      >
        <span className="floating-pulse" />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </button>

      <TalkModal isOpen={talkOpen} onClose={() => setTalkOpen(false)} />

      <style>{`
        .floating-talk-btn {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 52px;
          height: 52px;
          background: var(--teal);
          color: var(--bg);
          border: none;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1500;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 20px rgba(0, 212, 170, 0.25);
        }
        .floating-talk-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 32px rgba(0, 212, 170, 0.45), 0 10px 30px rgba(0,0,0,0.4);
        }
        .floating-pulse {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 11px;
          height: 11px;
          background: var(--amber);
          border-radius: 50%;
          animation: fpulse 2s infinite;
        }
        @keyframes fpulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </>
  )
}
