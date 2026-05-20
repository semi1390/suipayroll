import { useState } from 'react';
import { useEmployeePayslips } from '../hooks/useSuiData';
import { Spinner, EmptyState, SectionHeader, Card, Badge } from '../components/ui';
import { formatSui, formatDateTime, shortAddress } from '../utils/helpers';
import { getExplorerObjectUrl } from '../utils/contract';
import { PayslipNFT } from '../types';
import { CopyButton } from '../components/ui';

function PayslipCard({ payslip }: { payslip: PayslipNFT }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500" />
      <div className="pt-2">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-display uppercase tracking-widest text-slate-500 mb-1">PayslipNFT</p>
            <Badge variant="success">✓ Paid</Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-extrabold text-sky-400">{formatSui(payslip.amount)}</p>
            <p className="text-xs font-mono text-slate-500">{payslip.token_type}</p>
          </div>
        </div>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-display uppercase tracking-wide">From</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300">{shortAddress(payslip.employer)}</span>
              <CopyButton text={payslip.employer} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-display uppercase tracking-wide">To</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300">{shortAddress(payslip.employee)}</span>
              <CopyButton text={payslip.employee} />
            </div>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-display uppercase tracking-wide">Paid At</span>
            <span className="font-mono text-slate-300">{formatDateTime(payslip.paid_at)}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-display uppercase tracking-wide">Batch</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400">{payslip.batch_id.slice(0, 14)}...</span>
              <CopyButton text={payslip.batch_id} />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-600">{payslip.id.slice(0, 14)}...</span>
          
          <a href={getExplorerObjectUrl(payslip.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:text-sky-300 font-display transition-colors"
          >
            View on-chain ↗
          </a>
        </div>
      </div>
    </Card>
  );
}

export function PayslipsPage() {
  const { data: payslips, isLoading } = useEmployeePayslips();
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const employers = [...new Set(payslips?.map(p => p.employer) ?? [])];
  const filtered = filter === 'all' ? (payslips ?? []) : (payslips ?? []).filter(p => p.employer === filter);
  const totalReceived = filtered.reduce((acc, p) => acc + BigInt(p.amount), 0n);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in pb-20 md:pb-8">
      <SectionHeader
        title="My Payslips"
        description="Soulbound PayslipNFTs received as proof of payment"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm font-display transition-all ${view === 'grid' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-lg text-sm font-display transition-all ${view === 'table' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              ☰ Table
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !payslips || payslips.length === 0 ? (
        <EmptyState
          icon="🪙"
          title="No payslips yet"
          description="When an employer runs payroll and includes your wallet, you'll receive a PayslipNFT here as on-chain proof of payment."
        />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card className="col-span-2 sm:col-span-1">
              <p className="text-xs font-display text-slate-500 uppercase tracking-wider mb-1">Total Received</p>
              <p className="text-xl font-display font-bold text-sky-400">{formatSui(totalReceived)}</p>
            </Card>
            <Card>
              <p className="text-xs font-display text-slate-500 uppercase tracking-wider mb-1">Payslips</p>
              <p className="text-xl font-display font-bold text-slate-100">{filtered.length}</p>
            </Card>
            <Card>
              <p className="text-xs font-display text-slate-500 uppercase tracking-wider mb-1">Employers</p>
              <p className="text-xl font-display font-bold text-slate-100">{employers.length}</p>
            </Card>
            <Card>
              <p className="text-xs font-display text-slate-500 uppercase tracking-wider mb-1">Latest</p>
              <p className="text-sm font-mono text-slate-200">{payslips[0] ? formatDateTime(payslips[0].paid_at) : '—'}</p>
            </Card>
          </div>

          {/* Filter by employer */}
          {employers.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-display transition-all ${filter === 'all' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
              >
                All
              </button>
              {employers.map(emp => (
                <button
                  key={emp}
                  onClick={() => setFilter(emp)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all ${filter === emp ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                >
                  {shortAddress(emp, 4)}
                </button>
              ))}
            </div>
          )}

          {/* Grid view */}
          {view === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => <PayslipCard key={p.id} payslip={p} />)}
            </div>
          )}

          {/* Table view */}
          {view === 'table' && (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-4 py-3 text-xs font-display text-slate-500 uppercase tracking-wider">From</th>
                      <th className="text-left px-4 py-3 text-xs font-display text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-display text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-display text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                        <td className="px-4 py-3 font-mono text-sm text-slate-300">{shortAddress(p.employer)}</td>
                        <td className="px-4 py-3 font-display font-semibold text-sky-400">{formatSui(p.amount)}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">{formatDateTime(p.paid_at)}</td>
                        <td className="px-4 py-3"> 
                          <a
                          
                            href={getExplorerObjectUrl(p.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-400 hover:text-sky-300 font-display"
                          >
                            View ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}