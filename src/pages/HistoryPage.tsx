import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployerBatches } from '../hooks/useSuiData';
import { BatchCard } from '../components/BatchCard';
import { Spinner, EmptyState, Button, SectionHeader } from '../components/ui';
import { mistToSui } from '../utils/helpers';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <SectionHeader
        title="Payroll History"
        description={`${executed.length} batches executed · ${mistToSui(totalPaidOut)} SUI total`}
        action={
          <Button size="sm" onClick={() => navigate('/create')}>+ New Payroll</Button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
        {(['all', 'pending', 'executed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-display font-medium transition-all capitalize ${
              filter === f
                ? 'bg-sky-500/20 text-sky-400'
                : 'text-slate-500 hover:text-slate-300'
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
        <EmptyState
          icon="📂"
          title="No batches found"
          description={filter === 'executed'
            ? 'No executed payrolls yet. Run your first payroll to see it here.'
            : 'No payroll batches match this filter.'}
          action={<Button onClick={() => navigate('/create')}>Create First Payroll</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(batch => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}
    </div>
  );
}
