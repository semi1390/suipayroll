import { useState } from 'react';
import { useEmployeePayslips } from '../hooks/useSuiData';
import { Spinner, Card, Badge } from '../components/ui';
import { formatSui, formatDateTime, shortAddress } from '../utils/helpers';
import { getExplorerObjectUrl } from '../utils/contract';
import { PayslipNFT } from '../types';
import { CopyButton } from '../components/ui';
import { motion } from 'framer-motion';
import { Coins, LayoutGrid, List, ExternalLink } from 'lucide-react';

function PayslipCard({ payslip, index }: { payslip: PayslipNFT; index: number }) {
  const formatAmount = (amount: string) =>
    payslip.token_type === 'USDC'
      ? `${(Number(amount) / 1_000_000).toFixed(2)} USDC`
      : formatSui(amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="relative overflow-hidden h-full">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500" />
        <div className="pt-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-display uppercase tracking-widest text-slate-500 mb-1">PayslipNFT</p>
              <Badge variant="success">✓ Paid</Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-extrabold text-sky-400">{formatAmount(payslip.amount)}</p>
              <p className="text-xs font-mono text-slate-500">{payslip.token_type}</p>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-display uppercase tracking-wide shrink-0">From</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-slate-300 truncate">{shortAddress(payslip.employer)}</span>
                <CopyButton text={payslip.employer} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-display uppercase tracking-wide shrink-0">To</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-slate-300 truncate">{shortAddress(payslip.employee)}</span>
                <CopyButton text={payslip.employee} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-display uppercase tracking-wide shrink-0">Paid At</span>
              <span className="font-mono text-slate-300 text-right">{formatDateTime(payslip.paid_at)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-display uppercase tracking-wide shrink-0">Batch</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-slate-400 truncate">{payslip.batch_id.slice(0, 14)}...</span>
                <CopyButton text={payslip.batch_id} />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-600 truncate">{payslip.id.slice(0, 14)}...</span>
            <a
              href={getExplorerObjectUrl(payslip.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-display transition-colors shrink-0"
            >
              View on-chain <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function PayslipsPage() {
  const { data: payslips, isLoading } = useEmployeePayslips();
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const employers = [...new Set(payslips?.map(p => p.employer) ?? [])];
  const filtered = filter === 'all' ? (payslips ?? []) : (payslips ?? []).filter(p => p.employer === filter);
  const totalReceived = filtered.reduce((acc, p) => acc + BigInt(p.amount), 0n);

  const formatAmount = (amount: string, tokenType: string) =>
    tokenType === 'USDC'
      ? `${(Number(amount) / 1_000_000).toFixed(2)} USDC`
      : formatSui(amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20 md:pb-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100">My Payslips</h2>
          <p className="text-sm text-slate-400 mt-1">Soulbound PayslipNFTs received as proof of payment</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('table')}
            className={`p-2 rounded-lg transition-all ${view === 'table' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !payslips || payslips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-slate-900/40 border border-slate-800/60 rounded-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
            <Coins className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-300 text-lg">No payslips yet</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">When an employer runs payroll and includes your wallet, you'll receive a PayslipNFT here.</p>
          </div>
        </motion.div>
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
              {filtered.map((p, i) => <PayslipCard key={p.id} payslip={p} index={i} />)}
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
                      <th className="text-left px-4 py-3 text-xs font-display text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-display text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}
                      >
                        <td className="px-4 py-3 font-mono text-sm text-slate-300">{shortAddress(p.employer)}</td>
                        <td className="px-4 py-3 font-display font-semibold text-sky-400 whitespace-nowrap">{formatAmount(p.amount, p.token_type)}</td>
                        <td className="px-4 py-3 text-sm text-slate-400 hidden sm:table-cell">{formatDateTime(p.paid_at)}</td>
                        <td className="px-4 py-3">
                          <a
                            href={getExplorerObjectUrl(p.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-display"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}