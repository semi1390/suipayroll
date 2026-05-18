import { useEmployeePayslips } from '../hooks/useSuiData';
import { Spinner, EmptyState, SectionHeader, Card, Badge } from '../components/ui';
import { formatSui, formatDateTime, shortAddress } from '../utils/helpers';
import { getExplorerObjectUrl } from '../utils/contract';
import { PayslipNFT } from '../types';

function PayslipCard({ payslip }: { payslip: PayslipNFT }) {
  return (
    <Card className="relative overflow-hidden group">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500" />

      <div className="pt-2">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-display uppercase tracking-widest text-slate-500 mb-1">PayslipNFT</p>
            <Badge variant="success">✓ Paid</Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-extrabold text-sky-400">
              {formatSui(payslip.amount)}
            </p>
            <p className="text-xs font-mono text-slate-500">{payslip.token_type}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-display uppercase tracking-wide">From</span>
            <span className="font-mono text-slate-300">{shortAddress(payslip.employer)}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-display uppercase tracking-wide">To</span>
            <span className="font-mono text-slate-300">{shortAddress(payslip.employee)}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-display uppercase tracking-wide">Paid At</span>
            <span className="font-mono text-slate-300">{formatDateTime(payslip.paid_at)}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-display uppercase tracking-wide">Batch</span>
            <span className="font-mono text-slate-400 text-right">{payslip.batch_id.slice(0, 14)}...</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-600">{payslip.id.slice(0, 14)}...</span>
          <a
            href={getExplorerObjectUrl(payslip.id)}
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

  const totalReceived = payslips?.reduce((acc, p) => acc + BigInt(p.amount), 0n) ?? 0n;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <SectionHeader
        title="My Payslips"
        description={payslips?.length
          ? `${payslips.length} payslips · ${formatSui(totalReceived)} total received`
          : 'PayslipNFTs received as payment proof'}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !payslips || payslips.length === 0 ? (
        <EmptyState
          icon="🪙"
          title="No payslips yet"
          description="When an employer runs payroll and includes your wallet, you'll receive a PayslipNFT here as on-chain proof of payment."
        />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs font-display text-slate-500 uppercase tracking-wider mb-1">Total Received</p>
              <p className="text-xl font-display font-bold text-sky-400">{formatSui(totalReceived)}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs font-display text-slate-500 uppercase tracking-wider mb-1">Payslips</p>
              <p className="text-xl font-display font-bold text-slate-100">{payslips.length}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 col-span-2 sm:col-span-1">
              <p className="text-xs font-display text-slate-500 uppercase tracking-wider mb-1">Latest</p>
              <p className="text-sm font-mono text-slate-200">{formatDateTime(payslips[0].paid_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {payslips.map(p => (
              <PayslipCard key={p.id} payslip={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
