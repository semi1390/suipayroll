import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEmployerBatches, useSuiBalance, useUSDCBalance } from '../hooks/useSuiData';
import { BatchCard } from '../components/BatchCard';
import { Button, EmptyState, Spinner, SectionHeader } from '../components/ui';
import { mistToSui, shortAddress } from '../utils/helpers';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, TrendingUp, Users, Plus, AlertTriangle, ClipboardList } from 'lucide-react';

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

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
  delay?: number;
}

function StatCard({ label, value, sub, icon: Icon, accent, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative bg-slate-900/80 border rounded-2xl p-6 backdrop-blur-sm overflow-hidden ${
        accent ? 'border-sky-500/30 bg-sky-950/20' : 'border-slate-800/80'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          accent ? 'bg-sky-500/20' : 'bg-slate-800'
        }`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-sky-400' : 'text-slate-500'}`} />
        </div>
      </div>
      <p className={`text-2xl font-display font-bold ${accent ? 'text-sky-400' : 'text-slate-100'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {accent && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      )}
    </motion.div>
  );
}

export function DashboardPage() {
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const { data: batches, isLoading } = useEmployerBatches();
  const { data: balance } = useSuiBalance();
  const { data: usdcBalance } = useUSDCBalance();
  const prevAddress = useRef<string | undefined>(undefined);
  const [switchWarning, setSwitchWarning] = useState(false);

  if (!account) return null;

  const pending = batches?.filter(b => !b.executed) ?? [];
  const executed = batches?.filter(b => b.executed) ?? [];
  const totalPaid = executed.reduce((acc, b) => acc + BigInt(b.total_amount), 0n);
  const totalEmployees = executed.reduce((acc, b) => acc + b.employees.length, 0);

  useEffect(() => {
    if (prevAddress.current && account?.address && prevAddress.current !== account.address) {
      if (pending.length > 0) setSwitchWarning(true);
    }
    prevAddress.current = account?.address;
  }, [account?.address, pending.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-extrabold text-slate-100 mb-1">Dashboard</h1>
        <p className="text-slate-500 font-mono text-sm">{shortAddress(account.address, 8)}</p>
      </motion.div>

      {/* Wallet switch warning */}
      {switchWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-start gap-3 bg-amber-950/40 border border-amber-500/30 rounded-xl p-4"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-display font-semibold text-amber-400 text-sm">Wallet switched</p>
            <p className="text-xs text-amber-300/70 mt-0.5">You have pending payrolls on another wallet. Switch back to manage them.</p>
          </div>
          <button onClick={() => setSwitchWarning(false)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Wallet Balance"
          value={balance !== undefined ? `${mistToSui(balance)} SUI` : '—'}
          sub={usdcBalance !== undefined ? `${(Number(usdcBalance) / 1_000_000).toFixed(2)} USDC` : undefined}
          icon={Wallet}
          accent
          delay={0}
        />
        <StatCard
          label="Pending Batches"
          value={String(pending.length)}
          sub="Awaiting execution"
          icon={Clock}
          delay={0.1}
        />
        <StatCard
          label="Total Paid Out"
          value={`${mistToSui(totalPaid)} SUI`}
          sub="All-time"
          icon={TrendingUp}
          delay={0.2}
        />
        <StatCard
          label="Employees Paid"
          value={String(totalEmployees)}
          sub="Unique payslips minted"
          icon={Users}
          delay={0.3}
        />
      </div>

      {/* Pending payrolls */}
      <div className="mb-10">
        <SectionHeader
          title="Pending Payrolls"
          description="Batches awaiting execution"
          action={
            <Button onClick={() => navigate('/create')} size="sm">
              <Plus className="w-4 h-4" />
              New Payroll
            </Button>
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : pending.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-slate-900/40 border border-slate-800/60 rounded-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-300 text-lg">No pending payrolls</h3>
              <p className="text-slate-500 text-sm mt-1">Create your first payroll batch to get started.</p>
            </div>
            <Button onClick={() => navigate('/create')}>Create Payroll</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map((batch, i) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <BatchCard batch={batch} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent executed */}
      {executed.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
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
            {executed.slice(0, 2).map((batch, i) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <BatchCard batch={batch} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}