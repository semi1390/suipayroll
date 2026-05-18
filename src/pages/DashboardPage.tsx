import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEmployerBatches, useSuiBalance } from '../hooks/useSuiData';
import { BatchCard } from '../components/BatchCard';
import { Button, StatCard, EmptyState, Spinner, SectionHeader } from '../components/ui';
import { mistToSui, shortAddress } from '../utils/helpers';
import { useRef, useEffect, useState } from 'react';

function SkeletonCard() {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-3 bg-slate-800 rounded w-24" />
        <div className="h-3 bg-slate-800 rounded w-12" />
      </div>
      <div className="h-5 bg-slate-800 rounded w-32 mb-2" />
      <div className="h-3 bg-slate-800 rounded w-20" />
      <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
        <div className="h-5 bg-slate-800 rounded w-16" />
        <div className="h-5 bg-slate-800 rounded w-16" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const { data: batches, isLoading } = useEmployerBatches();
  const { data: balance } = useSuiBalance();

  if (!account) return null;

  const pending = batches?.filter(b => !b.executed) ?? [];
  const executed = batches?.filter(b => b.executed) ?? [];
  const totalPaid = executed.reduce((acc, b) => acc + BigInt(b.total_amount), 0n);
  const totalEmployees = executed.reduce((acc, b) => acc + b.employees.length, 0);
  const prevAddress = useRef<string | undefined>(undefined);
const [switchWarning, setSwitchWarning] = useState(false);

useEffect(() => {
  if (prevAddress.current && account?.address && prevAddress.current !== account.address) {
    if (pending.length > 0) setSwitchWarning(true);
  }
  prevAddress.current = account?.address;
}, [account?.address, pending.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-extrabold text-slate-100 mb-1">Dashboard</h1>
        <p className="text-slate-500 font-mono text-sm">{shortAddress(account.address, 8)}</p>
      </div>
      {switchWarning && (
  <div className="mb-4 flex items-start gap-3 bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 animate-slide-up">
    <span className="text-amber-400 text-xl">⚠️</span>
    <div className="flex-1">
      <p className="font-display font-semibold text-amber-400 text-sm">Wallet switched</p>
      <p className="text-xs text-amber-300/70 mt-0.5">You have pending payrolls on another wallet. Switch back to manage them.</p>
    </div>
    <button onClick={() => setSwitchWarning(false)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
  </div>
)}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Wallet Balance"
          value={balance !== undefined ? `${mistToSui(balance)} SUI` : '—'}
          sub="Available to deploy"
          accent
        />
        <StatCard
          label="Pending Batches"
          value={String(pending.length)}
          sub="Awaiting execution"
        />
        <StatCard
          label="Total Paid Out"
          value={`${mistToSui(totalPaid)} SUI`}
          sub="All-time"
        />
        <StatCard
          label="Employees Paid"
          value={String(totalEmployees)}
          sub="Unique payslips minted"
        />
      </div>

      {/* Pending payrolls */}
      <div className="mb-8">
        <SectionHeader
          title="Pending Payrolls"
          description="Batches awaiting execution"
          action={
            <Button onClick={() => navigate('/create')} size="sm">
              + New Payroll
            </Button>
          }
        />

        {isLoading ? (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <SkeletonCard />
    <SkeletonCard />
  </div>
) : pending.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No pending payrolls"
            description="Create your first payroll batch to get started."
            action={<Button onClick={() => navigate('/create')}>Create Payroll</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map(batch => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </div>

      {/* Recent executed */}
      {executed.length > 0 && (
        <div>
          <SectionHeader
            title="Recently Executed"
            description="Completed payroll runs"
            action={
              <button
                onClick={() => navigate('/history')}
                className="text-sm text-sky-400 hover:text-sky-300 font-display font-medium transition-colors"
              >
                View all →
              </button>
            }
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {executed.slice(0, 2).map(batch => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
