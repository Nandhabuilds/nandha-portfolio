import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

// status: 'certified' = passed exam / earned credential; anything else is shown in a neutral style
const certificates = [
  {
    number: '01',
    code: 'AZ-900',
    title: 'Azure Fundamentals',
    issuer: 'Microsoft',
    status: 'CERTIFIED',
    certified: true,
    description: 'Core Azure cloud concepts, services, security and pricing. Scored 857/1000.',
    tags: ['Azure', 'Cloud Concepts'],
    image: 'certs/az-900.png',
  },
  {
    number: '02',
    code: 'AI-900',
    title: 'Azure AI Fundamentals',
    issuer: 'Microsoft',
    status: 'CERTIFIED',
    certified: true,
    description: 'Core AI and machine learning concepts and the Azure services behind them.',
    tags: ['Azure AI', 'Machine Learning'],
    image: 'certs/ai-900.png',
  },
  {
    number: '03',
    code: 'GH-200',
    title: 'GitHub Actions',
    issuer: 'Koenig Solutions',
    status: 'COURSE COMPLETION',
    certified: false,
    description: 'Training course completed on workflows, runners and CI/CD automation with GitHub Actions.',
    tags: ['GitHub Actions', 'CI/CD'],
    image: 'certs/gh-200-github-actions.png',
  },
  {
    number: '04',
    code: 'AZ-104',
    title: 'Azure Administrator Training',
    issuer: 'Koenig Solutions',
    status: 'EXAM PENDING',
    certified: false,
    description: 'Training course completed. The AZ-104 certification exam is still pending.',
    tags: ['Azure Administration'],
    image: 'certs/az-104-training.png',
  },
  {
    number: '05',
    code: 'XCEED',
    title: 'Linux',
    issuer: 'TCS Internal Certification',
    status: 'TCS INTERNAL',
    certified: false,
    description: 'Internal certification in Linux from the TCS Xceed programme.',
    tags: ['Linux'],
    image: 'certs/tcs-xceed-linux.png',
  },
];

const Certificates = () => {
  const [active, setActive] = useState(null);

  // Esc closes the viewer; page scroll is locked while it is open
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => e.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  return (
    <section id="certificates" className="relative w-full bg-[#0b0b0b] text-white py-24 md:py-32 px-6 overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-8 left-0 w-full flex justify-center pointer-events-none">
        <h2 className="text-[14vw] md:text-[16vw] font-black text-white/[0.03] tracking-tighter leading-none whitespace-nowrap uppercase">
          CREDITS
        </h2>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase border border-red-600/30 bg-red-600/5 rounded px-3 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-red-500">Episode 05</span>
              <span className="text-white/40">|</span>
              <span>Credentials</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.95] uppercase">
              End Credits<br />
              <span className="text-red-600">Certifications.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm text-white/60 font-light md:text-right">
            Certifications and completed training. Click any card to view the certificate.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {certificates.map((c, i) => (
            <motion.button
              key={c.code}
              type="button"
              onClick={() => setActive(c)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
              className="group text-left w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] min-h-[300px] rounded-[24px] border border-white/15 bg-[#141414]/95 backdrop-blur-2xl shadow-[0_25px_50px_rgba(0,0,0,0.9)] p-7 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:border-red-600 hover:shadow-[0_35px_80px_rgba(229,9,20,0.35)]"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-red-500 bg-red-600/10 px-2.5 py-1 rounded border border-red-600/20">
                    CERT {c.number}
                  </span>
                  <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${c.certified ? 'text-red-500' : 'text-white/50'}`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-2">
                  {c.issuer} &middot; {c.code}
                </div>
                <h3 className="text-2xl font-black tracking-tight leading-tight mb-3">{c.title}</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">{c.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span key={t} className="text-[10px] font-mono text-white/60 bg-white/5 border border-white/10 rounded px-2 py-1">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="shrink-0 text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 group-hover:translate-x-1 transition-transform">
                  View &rarr;
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Certificate viewer */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[9995] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.code} certificate`}
          >
            <motion.div
              className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-red-600/40 bg-[#141414] shadow-[0_30px_80px_rgba(229,9,20,0.25)] overflow-hidden"
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div>
                  <div className="text-sm font-black tracking-tight">{active.code} &middot; {active.title}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">{active.issuer}</div>
                </div>
                <button
                  autoFocus
                  onClick={() => setActive(null)}
                  aria-label="Close certificate"
                  className="w-9 h-9 rounded border border-white/15 text-white/70 hover:text-white hover:border-red-600 text-xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="overflow-auto p-4 flex justify-center bg-black/40">
                <img
                  src={`${BASE}${active.image}`}
                  alt={`${active.code} certificate`}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Certificates;
