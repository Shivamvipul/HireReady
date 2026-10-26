import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, FileText, Linkedin, MessagesSquare, ScanSearch, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../components/layout/AppShell';
import { useAuth } from '../store/authStore';
import ScaledPreview from '../templates/ScaledPreview';
import { templates } from '../templates/catalog';
import { defaultSettings, sampleData } from '../templates/data';

const PREVIEW_DATA = sampleData();
const PREVIEW_TEMPLATE = templates.find((template) => template.id === 'modern-1');
const PREVIEW_SETTINGS = { ...defaultSettings(), fontSize: 12, spacing: 'compact', accent: '#176c5d', footerTag: false };

const TOOLS = [
  { icon: FileText, number: '01', name: 'Resume builder', text: 'Build once, switch templates, and keep a version ready for every role.', link: '/register', action: 'Build your resume' },
  { icon: ScanSearch, number: '02', name: 'ATS checker', text: 'See the score, missing keywords, and the lines worth strengthening.', link: '/register', action: 'Check a resume' },
  { icon: MessagesSquare, number: '03', name: 'Interview prep', text: 'Practice role-specific questions grounded in your actual experience.', link: '/register', action: 'Prepare for interviews' },
  { icon: Linkedin, number: '04', name: 'LinkedIn optimizer', text: 'Sharpen your headline and About section without losing your voice.', link: '/register', action: 'Tune your profile' },
];

const STEPS = [
  { number: '01', title: 'Bring what you have', text: 'Start with an existing resume or build a new one from your experience.' },
  { number: '02', title: 'See what needs work', text: 'Get clear feedback on readability, keywords, and role-specific gaps.' },
  { number: '03', title: 'Show up prepared', text: 'Carry your stronger story into your interview and your profile.' },
];

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Logo className="landing-logo" />
          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#suite">The toolkit</a>
            <a href="#process">How it works</a>
          </nav>
          <div className="landing-account-links">
            <Link to="/login" className="landing-sign-in">Sign in</Link>
            <Link to="/register" className="landing-nav-cta">Get started <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-container">
            <div className="landing-hero-copy">
              <p className="landing-eyebrow"><span className="landing-eyebrow-mark"><Sparkles size={13} aria-hidden="true" /></span> A clearer way to move your career forward</p>
              <h1 id="landing-title">Your experience, <span>clearly seen.</span></h1>
              <p className="landing-lead">Build a resume that reads clearly to people and screening systems. Then bring that same story to your interviews and your LinkedIn profile.</p>
              <div className="landing-actions">
                <Link to="/register" className="landing-primary-button">Build my resume <ArrowRight size={17} aria-hidden="true" /></Link>
                <a href="#suite" className="landing-secondary-link">Explore the toolkit <ArrowRight size={15} aria-hidden="true" /></a>
              </div>
              <p className="landing-promise"><ShieldCheck size={16} aria-hidden="true" /> Your experience stays yours. No invented achievements or metrics.</p>
            </div>

            <motion.div className="landing-stage" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.12 }} aria-label="Sample resume builder preview">
              <div className="landing-stage-grid" aria-hidden="true" />
              <div className="landing-back-sheet landing-back-sheet-one" aria-hidden="true" />
              <div className="landing-back-sheet landing-back-sheet-two" aria-hidden="true" />
              <div className="landing-preview-label"><span className="landing-live-dot" /> A resume that reads like you <span className="landing-label-divider">/</span> Sample content</div>
              <div className="landing-paper">
                <ScaledPreview data={PREVIEW_DATA} settings={PREVIEW_SETTINGS} tpl={PREVIEW_TEMPLATE} />
              </div>
              <div className="landing-score-note">
                <span className="landing-score-icon"><ScanSearch size={17} aria-hidden="true" /></span>
                <span><strong>82</strong><small>sample ATS score</small></span>
                <span className="landing-score-check"><Check size={15} aria-hidden="true" /></span>
              </div>
              <div className="landing-keyword-note">
                <span className="landing-note-overline">ROLE MATCH PREVIEW</span>
                <strong>Frontend developer</strong>
                <span className="landing-keyword-list"><i>React</i><i>TypeScript</i><i>REST APIs</i></span>
              </div>
              <p className="landing-stage-caption">A stronger first impression starts with the details.</p>
            </motion.div>
          </div>
        </section>

        <section id="suite" className="landing-suite" aria-labelledby="suite-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <p className="landing-eyebrow">One story. Every step.</p>
              <h2 id="suite-title">A job search toolkit that works together.</h2>
              <p>Your resume is the starting point. HireReady helps you carry it through the rest of the process.</p>
            </div>
            <div className="landing-tool-grid">
              {TOOLS.map(({ icon: Icon, number, name, text, link, action }) => (
                <article className="landing-tool" key={name}>
                  <div className="landing-tool-top"><span className="landing-tool-icon"><Icon size={19} aria-hidden="true" /></span><span className="landing-tool-number">{number}</span></div>
                  <h3>{name}</h3>
                  <p>{text}</p>
                  <Link to={link} className="landing-tool-link">{action}<ArrowRight size={14} aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="landing-process" aria-labelledby="process-title">
          <div className="landing-container">
            <div className="landing-process-heading">
              <p className="landing-eyebrow">Simple by design</p>
              <h2 id="process-title">From first draft to ready.</h2>
            </div>
            <div className="landing-steps">
              {STEPS.map((step) => (
                <article className="landing-step" key={step.number}>
                  <span className="landing-step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-integrity" aria-labelledby="integrity-title">
          <div className="landing-container landing-integrity-layout">
            <div className="landing-integrity-mark"><ShieldCheck size={27} aria-hidden="true" /></div>
            <div className="landing-integrity-copy">
              <p className="landing-eyebrow">Your story, only clearer</p>
              <h2 id="integrity-title">AI can help with the words. The experience is always yours.</h2>
              <p>HireReady reshapes what you provide. It will not add jobs, degrees, certifications, skills, or numbers you did not give it. When a result needs a real metric, it asks you to supply one.</p>
            </div>
            <Link to="/register" className="landing-integrity-link">Start with your resume <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="landing-final-cta" aria-labelledby="final-title">
          <div className="landing-container">
            <p className="landing-eyebrow">Your next step is yours</p>
            <h2 id="final-title">Start with the resume you already have.</h2>
            <p>Get a clearer read on what is working and what to strengthen.</p>
            <Link to="/register" className="landing-primary-button">Create a free account <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container"><Logo className="landing-logo" /><span>Build a career story that is still yours.</span><span>HireReady AI</span></div>
      </footer>
    </div>
  );
}