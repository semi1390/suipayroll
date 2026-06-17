import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployerBatches } from '../hooks/useSuiData';
import { BatchCard } from '../components/BatchCard';
import { Spinner, Button } from '../components/ui';
import { mistToSui } from '../utils/helpers';
import { motion } from 'framer-motion';
import { Plus, FolderOpen } from 'lucide-react';

export function HistoryPage() {
  const navigate = useNavigate();
  const { data: batches, isLoading } = useEmployerBatches();
  const [filter, setFilter] = useState<'all' | 'executed' | 'pending'>('all');

  const executed = batches?.filter(b => b.executed) ?? [];
  const pending = batches?.filter(b => !b.executed) ?? [];
  const totalPaidOut = executed.reduce((acc, b) => acc + BigInt(b.total_amount), 0n);

  const filtered = filter === 'all' ? (batches ?? []) :
    filter === 'executed' ? executed : pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20 md:pb-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100">Payroll History</h2>
          <p className="text-sm text-slate-400 mt-1">
            {executed.length} batches executed · {mistToSui(totalPaidOut)} SUI total
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/create')}>
          <Plus className="w-4 h-4" />
          New Payroll
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
        {(['all', 'pending', 'executed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-display font-medium transition-all capitalize ${
              filter === f ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f}
            {f === 'pending' && pending.length > 0 && (
              <span className="ml-1.5 bg-amber-500/20 text-amber-400 text-xs px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-slate-900/40 border border-slate-800/60 rounded-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-300 text-lg">No batches found</h3>
            <p className="text-slate-500 text-sm mt-1">
              {filter === 'executed'
                ? 'No executed payrolls yet. Run your first payroll to see it here.'
                : 'No payroll batches match this filter.'}
            </p>
          </div>
          <Button onClick={() => navigate('/create')}>Create First Payroll</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((batch, i) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <BatchCard batch={batch} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}