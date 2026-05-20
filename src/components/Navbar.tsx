import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Link, useLocation } from 'react-router-dom';
import { shortAddress, cn } from '../utils/helpers';
import { useSuiBalance } from '../hooks/useSuiData';
import { mistToSui } from '../utils/helpers';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/create', label: 'New Payroll' },
  { to: '/history', label: 'History' },
  { to: '/payslips', label: 'My Payslips' },
];

export function Navbar() {
  const account = useCurrentAccount();
  const location = useLocation();
  const { data: balance } = useSuiBalance();

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to={account ? '/dashboard' : '/'} className="flex items-center gap-2.5 shrink-0">
         <svg width="32" height="32" viewBox="0 0 680 680" style={{ borderRadius: 8 }}>
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
          <span className="font-display font-bold text-slate-100 text-base hidden sm:block">SuiPayroll</span>
        </Link>

        {/* Nav links */}
        {account && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-display font-medium transition-all',
                  location.pathname === link.to
                    ? 'bg-sky-500/15 text-sky-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {account && balance !== undefined && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-300">
                {mistToSui(balance)} SUI
              </span>
            </div>
          )}
          {account && (
            <div className="hidden sm:block px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="text-xs font-mono text-slate-400">{shortAddress(account.address)}</span>
            </div>
          )}
          <ConnectButton
            connectText="Connect Wallet"
            className="!font-display !font-semibold !text-sm !rounded-xl !bg-sky-500 !text-white !border-0 !px-4 !py-2 hover:!bg-sky-400 !transition-all"
          />
        </div>
      </div>
    </nav>
  );
}
