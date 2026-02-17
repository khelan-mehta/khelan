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
          width: 56px;
          height: 56px;
          background: var(--white);
          color: var(--black);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1500;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .floating-talk-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 40px rgba(255,255,255,0.2);
        }
        .floating-pulse {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 12px;
          height: 12px;
          background: #22c55e;
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
