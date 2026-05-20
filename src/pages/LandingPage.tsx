import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

const PACKAGE_ID = '0x82c28f483194ccca6e267373ba6d7a52c8245fe22d8b91313412365fc9b23475';

const FEATURES = [
  {
    icon: '⚡',
    title: 'One-click payroll',
    desc: 'Pay your entire team in a single transaction. No bank wires, no delays, no manual transfers.',
  },
  {
    icon: '🔐',
    title: 'On-chain treasury',
    desc: 'Funds locked in a verifiable smart contract. Transparent, auditable, and trustless.',
  },
  {
    icon: '🪙',
    title: 'PayslipNFT receipts',
    desc: 'Every employee receives a soulbound NFT — permanent on-chain proof of payment.',
  },
  {
    icon: '💵',
    title: 'SUI & USDC support',
    desc: 'Pay in native SUI or stablecoins. DAOs can settle payroll without price volatility.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Connect your wallet',
    desc: 'Sign in with any Sui wallet. No account, no KYC, no signup required.',
  },
  {
    number: '02',
    title: 'Add employees & deposit',
    desc: 'Add contributor wallet addresses and salary amounts. Deposit funds into the on-chain treasury.',
  },
  {
    number: '03',
    title: 'Run payroll in one click',
    desc: 'Execute payroll — every contributor paid simultaneously. Each receives a soulbound PayslipNFT as proof.',
  },
];

export function LandingPage() {
  const account = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) navigate('/dashboard');
  }, [account, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-sky-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-[500px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <div className="flex flex-col items-center text-center pt-20 pb-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <svg width="40" height="40" viewBox="0 0 680 680" style={{ borderRadius: 10 }}>
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
            <span className="font-display font-bold text-slate-100 text-2xl">SuiPayroll</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-400 text-xs font-mono tracking-wide">Live on Sui Testnet · DeFi & Payments Track</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl text-slate-100 leading-[0.95] tracking-tight mb-6 max-w-4xl">
            Payroll,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              on‑chain.
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed font-body">
            SuiPayroll lets DAOs and remote teams pay contributors simultaneously
            with verifiable proof — no banks, no intermediaries.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <ConnectButton
              connectText="Connect Wallet to Start"
              className="!font-display !font-bold !text-base !rounded-2xl !bg-sky-500 !text-white !border-0 !px-8 !py-4 hover:!bg-sky-400 !transition-all !shadow-xl !shadow-sky-500/25"
            />
            <a
              href="https://faucet.sui.io/?network=testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 text-sm font-body underline underline-offset-4 transition-colors"
            >
              Get testnet SUI →
            </a>
          </div>

          {/* Contract address */}
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2">
            <span className="text-slate-500 text-xs font-display uppercase tracking-wider">Contract:</span>
            <a
              href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-slate-400 hover:text-sky-400 transition-colors"
            >
              {PACKAGE_ID.slice(0, 16)}...{PACKAGE_ID.slice(-8)} ↗
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <p className="text-center text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-10">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.number} className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
                <span className="font-display font-black text-4xl text-sky-500/15 mb-3 block">{step.number}</span>
                <h3 className="font-display font-bold text-slate-100 text-base mb-2 pr-8">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-body">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <p className="text-center text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-10">
            Why SuiPayroll
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-left backdrop-blur-sm hover:border-slate-700 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display font-semibold text-slate-100 text-sm mb-2">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/60 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 680 680">
              <rect width="680" height="680" fill="#0a0f1e" rx="120"/>
              <circle cx="340" cy="340" r="120" fill="none" stroke="#38bdf8" strokeWidth="8"/>
              <circle cx="340" cy="340" r="30" fill="#38bdf8"/>
              <line x1="436" y1="254" x2="508" y2="182" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round"/>
              <circle cx="524" cy="166" r="28" fill="#38bdf8"/>
              <line x1="460" y1="340" x2="532" y2="340" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round"/>
              <circle cx="548" cy="340" r="28" fill="#38bdf8"/>
              <line x1="436" y1="426" x2="508" y2="498" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round"/>
              <circle cx="524" cy="514" r="28" fill="#38bdf8"/>
            </svg>
            <span className="text-slate-500 text-xs font-mono">SuiPayroll · Sui Overflow 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}`} target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors">
              View Contract ↗
            </a>
            <span className="text-slate-700">·</span>
            <span className="text-slate-600 text-xs font-mono">#DeFi&Payments</span>
          </div>
        </div>

      </div>
    </div>
  );
}