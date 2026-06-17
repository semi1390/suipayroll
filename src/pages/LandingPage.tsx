import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  Zap, Lock, FileText, Globe, Users, Shield,
  ArrowRight, CheckCircle, Upload, Calendar,
  Wallet, Play, ChevronRight
} from 'lucide-react';

const PACKAGE_ID = '0x82c28f483194ccca6e267373ba6d7a52c8245fe22d8b91313412365fc9b23475';

const NodeLogo = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 680 680" style={{ borderRadius: size * 0.25 }}>
    <rect width="680" height="680" fill="#0a0f1e" rx="120"/>
    <circle cx="340" cy="340" r="120" fill="none" stroke="#38bdf8" strokeWidth="4"/>
    <circle cx="340" cy="340" r="16" fill="#38bdf8"/>
    <line x1="436" y1="254" x2="508" y2="182" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="524" cy="166" r="14" fill="#38bdf8"/>
    <line x1="460" y1="340" x2="532" y2="340" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="548" cy="340" r="14" fill="#38bdf8"/>
    <line x1="436" y1="426" x2="508" y2="498" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="524" cy="514" r="14" fill="#38bdf8"/>
  </svg>
);

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: Zap,
    title: 'One-click payroll',
    desc: 'Pay your entire team in a single transaction. No bank wires, no delays, no manual transfers one by one.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
  },
  {
    icon: Lock,
    title: 'On-chain treasury',
    desc: 'Funds locked in a verifiable Move smart contract. Only you can release them. Transparent and auditable.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
  },
  {
    icon: FileText,
    title: 'Soulbound PayslipNFT',
    desc: 'Every contributor receives a non-transferable NFT as permanent on-chain proof of payment. Cannot be faked.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/20',
  },
  {
    icon: Globe,
    title: 'SUI & USDC support',
    desc: 'Pay in native SUI or USDC stablecoin. DAOs can settle payroll without exposing contributors to price volatility.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    icon: Upload,
    title: 'CSV bulk import',
    desc: 'Upload a spreadsheet of wallet addresses and salaries. The form fills instantly. No manual entry for large teams.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
  },
  {
    icon: Calendar,
    title: 'Payroll templates',
    desc: 'Save your team as a template. Next month, one click loads everyone back. Recurring payroll in seconds.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
  },
];

const STEPS = [
  {
    icon: Wallet,
    number: '01',
    title: 'Connect your wallet',
    desc: 'Sign in with any Sui wallet. No account, no KYC, no signup required.',
  },
  {
    icon: Users,
    number: '02',
    title: 'Add your team',
    desc: 'Add wallet addresses manually, upload a CSV, or load a saved team template.',
  },
  {
    icon: Play,
    number: '03',
    title: 'Run payroll',
    desc: 'One click pays everyone simultaneously. Each contributor gets a soulbound PayslipNFT as proof.',
  },
];

const WHY_SUI = [
  { stat: '< 1s', label: 'Transaction finality' },
  { stat: '$0.001', label: 'Average gas fee' },
  { stat: '1 PTB', label: 'Pays entire team atomically' },
  { stat: '100%', label: 'On-chain verifiable' },
];

export function LandingPage() {
  const account = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) navigate('/dashboard');
  }, [account, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-sky-600/12 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10">

        {/* ── HERO ── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-12 pb-20">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
           className="flex items-center gap-3 mb-8"
          >
            <NodeLogo size={48} />
            <span className="font-display font-bold text-slate-100 text-2xl tracking-tight">SuiPayroll</span>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/25 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-400 text-xs font-mono tracking-wide">Live on Sui Testnet · DeFi & Payments Track</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
           className="font-display font-extrabold text-4xl sm:text-8xl text-slate-100 leading-[0.9] tracking-tight mb-6 max-w-5xl"
          >
            Payroll,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
              on-chain.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-12 leading-relaxed"
          >
            SuiPayroll lets DAOs and remote teams pay contributors simultaneously
            with verifiable proof — no banks, no intermediaries, no manual transfers.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <ConnectButton
              connectText="Connect Wallet to Start"
              className="!font-display !font-bold !text-base !rounded-2xl !bg-sky-500 !text-white !border-0 !px-8 !py-4 hover:!bg-sky-400 !transition-all !shadow-xl !shadow-sky-500/25"
            />
            <a
              href="https://faucet.sui.io/?network=testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Get testnet SUI <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Contract address */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 text-xs font-mono">Contract:</span>
            <span className="text-slate-400 text-xs font-mono">{PACKAGE_ID.slice(0, 20)}...{PACKAGE_ID.slice(-8)}</span>
            <a
              href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 text-xs transition-colors flex items-center gap-1"
            >
              Verify <ChevronRight className="w-3 h-3" />
            </a>
          </motion.div>
        </section>

        {/* ── STATS BAR ── */}
        <AnimatedSection>
          <section className="border-y border-slate-800/60 py-12 px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
              {WHY_SUI.map((item, i) => (
                <div key={i} className="text-center">
                  <p className="font-display font-black text-3xl text-sky-400 mb-1">{item.stat}</p>
                  <p className="text-slate-500 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* ── HOW IT WORKS ── */}
        <section className="py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-20">
              <p className="text-xs font-display font-semibold text-sky-400 uppercase tracking-widest mb-4">How it works</p>
              <h2 className="font-display font-bold text-4xl sm:text-5xl text-slate-100 mb-4">
                Three steps to pay your team
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                From wallet connection to everyone paid — in under a minute.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {/* Connecting line */}
              <div className="hidden sm:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-sky-500/50 to-sky-500/50" style={{ top: '3rem' }} />

              {STEPS.map((step, i) => (
                <AnimatedSection key={i}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-sm text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-6">
                      <step.icon className="w-6 h-6 text-sky-400" />
                    </div>
                    <span className="font-display font-black text-5xl text-slate-800 absolute top-6 right-6">{step.number}</span>
                    <h3 className="font-display font-bold text-slate-100 text-lg mb-3">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-32 px-4 border-t border-slate-800/60">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-20">
              <p className="text-xs font-display font-semibold text-sky-400 uppercase tracking-widest mb-4">Features</p>
              <h2 className="font-display font-bold text-4xl sm:text-5xl text-slate-100 mb-4">
                Built for the on-chain economy
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Everything a DAO or remote team needs to run payroll on Sui.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <AnimatedSection key={i}>
                  <motion.div
                    whileHover={{ y: -4, borderColor: 'rgba(56, 189, 248, 0.3)' }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-7 backdrop-blur-sm h-full"
                  >
                    <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-5`}>
                      <f.icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <h3 className="font-display font-semibold text-slate-100 text-base mb-2">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY SUI ── */}
        <section className="py-32 px-4 border-t border-slate-800/60">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection>
                <p className="text-xs font-display font-semibold text-sky-400 uppercase tracking-widest mb-4">Why Sui</p>
                <h2 className="font-display font-bold text-4xl sm:text-5xl text-slate-100 mb-6 leading-tight">
                  The fastest blockchain
                  <span className="text-sky-400"> for payroll.</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Sui's Programmable Transaction Blocks let SuiPayroll pay an entire team atomically — everyone in one transaction, or nobody. No partial payments. No failed transfers left unresolved.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    'Sub-second finality — payroll settles faster than a bank notification',
                    'Sub-cent gas fees — pay 100 employees for less than a penny in fees',
                    'Move smart contracts — type-safe, auditable, no reentrancy attacks',
                    'Object-based assets — funds owned by the contract, not an account',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                      <span className="text-slate-400 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection>
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
                  <p className="text-xs font-mono text-slate-500 mb-6 uppercase tracking-wider">Live transaction</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-800">
                      <span className="text-slate-400 text-sm">Employer</span>
                      <span className="font-mono text-xs text-slate-300">0x2001...bf37</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-800">
                      <span className="text-slate-400 text-sm">Recipients</span>
                      <span className="font-mono text-xs text-emerald-400">3 wallets</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-800">
                      <span className="text-slate-400 text-sm">Total paid</span>
                      <span className="font-mono text-xs text-sky-400">0.30 SUI</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-800">
                      <span className="text-slate-400 text-sm">Gas used</span>
                      <span className="font-mono text-xs text-slate-300">~0.000412 SUI</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-800">
                      <span className="text-slate-400 text-sm">NFTs minted</span>
                      <span className="font-mono text-xs text-violet-400">3 PayslipNFTs</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-slate-400 text-sm">Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-xs text-emerald-400">Confirmed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="py-32 px-4 border-t border-slate-800/60">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display font-bold text-4xl sm:text-6xl text-slate-100 mb-6 leading-tight">
                Ready to pay your team
                <span className="text-sky-400"> on-chain?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10">
                Connect your wallet and run your first payroll in under 2 minutes.
              </p>
              <ConnectButton
                connectText="Get Started — It's Free"
                className="!font-display !font-bold !text-lg !rounded-2xl !bg-sky-500 !text-white !border-0 !px-10 !py-5 hover:!bg-sky-400 !transition-all !shadow-2xl !shadow-sky-500/25"
              />
            </div>
          </AnimatedSection>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-800/60 py-12 px-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <NodeLogo size={28} />
              <div>
                <p className="text-slate-300 text-sm font-display font-semibold">SuiPayroll</p>
                <p className="text-slate-600 text-xs font-mono">Sui Overflow 2026 · DeFi & Payments</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a
                href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors"
              >
                View Contract
              </a>
              <a
                href="https://faucet.sui.io/?network=testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors"
              >
                Get Testnet SUI
              </a>
              <span className="text-slate-600 text-xs font-mono">{PACKAGE_ID.slice(0, 10)}...</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}