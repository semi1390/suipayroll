import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

const FEATURES = [
  {
    icon: '⚡',
    title: 'One-click payroll',
    desc: 'Pay your entire team in a single transaction. No bank wires, no delays.',
  },
  {
    icon: '🔐',
    title: 'On-chain treasury',
    desc: 'Funds locked in a verifiable smart contract. Transparent, auditable, trustless.',
  },
  {
    icon: '🪙',
    title: 'PayslipNFT receipts',
    desc: 'Every employee receives a non-fungible payslip — permanent on-chain proof.',
  },
  {
    icon: '🌐',
    title: 'Sui-native speed',
    desc: 'Settle payroll in under a second with sub-cent gas fees on Sui.',
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
      {/* Background mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-sky-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-[500px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-sky-400 text-xs font-mono tracking-wide">Deployed on Sui Testnet</span>
        </div>

        {/* Hero */}
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
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <ConnectButton
            connectText="Connect Wallet to Start"
            className="!font-display !font-bold !text-base !rounded-2xl !bg-sky-500 !text-white !border-0 !px-8 !py-4 hover:!bg-sky-400 !transition-all !shadow-xl !shadow-sky-500/25"
          />
          <a
            href="https://docs.sui.io/guides/developer/getting-started/get-coins"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-200 text-sm font-body underline underline-offset-4 transition-colors"
          >
            Get testnet SUI →
          </a>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-left backdrop-blur-sm hover:border-slate-700 transition-all"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-slate-100 text-sm mb-1.5">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-body">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-16 text-slate-700 text-xs font-mono">
          SuiPayroll · Sui Testnet · Open Source
        </p>
      </div>
    </div>
  );
}
