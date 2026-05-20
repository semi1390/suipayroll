import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuiClient } from '@mysten/dapp-kit';
import { useBatch } from '../hooks/useSuiData';
import { useExecutePayroll, useCancelBatch } from '../hooks/useTransactions';
import {
  Button, Card, Badge, Spinner, EmptyState,
  TxSuccessBanner, TxErrorBanner, SectionHeader, Modal
} from '../components/ui';
import {
  formatSui, formatDate, formatDateTime, countdownTo,
  shortAddress, mistToSui
} from '../utils/helpers';
import { getExplorerTxUrl } from '../utils/contract';

export function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useSuiClient();

  const { data: batch, isLoading, refetch } = useBatch(id);
  const { executePayroll, txState: execState, resetTx: resetExec } = useExecutePayroll(client);
  const { cancelBatch, txState: cancelState, resetTx: resetCancel } = useCancelBatch(client);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon="🔍"
          title="Batch not found"
          description="This batch may not exist or isn't owned by your wallet."
          action={<Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  const paidCount = batch.employees.filter(e => e.paid).length;
  const treasuryBalance = BigInt(batch.treasury_balance);

  async function handleExecute() {
    const digest = await executePayroll(batch!);
    if (digest) {
      await refetch();
    }
  }

  async function handleCancel() {
    setShowCancelConfirm(false);
   await cancelBatch(batch!.id, batch!.token_type);
    navigate('/dashboard');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-300 transition-colors text-sm font-display"
        >
          ← Back
        </button>
      </div>

      <SectionHeader
        title="Payroll Batch"
        description={`Created ${formatDateTime(batch.created_at)}`}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={batch.executed ? 'success' : 'pending'}>
              {batch.executed ? '✓ Executed' : '⏳ Pending'}
            </Badge>
            <Badge variant="sui">{batch.token_type}</Badge>
          </div>
        }
      />

      {/* Tx banners */}
      {execState.status === 'success' && execState.digest && (
        <div className="mb-4">
          <TxSuccessBanner digest={execState.digest} onClose={resetExec} />
          <div className="mt-2 text-center">
            <a
              href={getExplorerTxUrl(execState.digest)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 text-sm font-display font-medium"
            >
              View on Sui Explorer ↗
            </a>
          </div>
        </div>
      )}
      {execState.status === 'error' && execState.error && (
        <div className="mb-4"><TxErrorBanner error={execState.error} onClose={resetExec} /></div>
      )}
      {cancelState.status === 'error' && cancelState.error && (
        <div className="mb-4"><TxErrorBanner error={cancelState.error} onClose={resetCancel} /></div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card className="col-span-1">
          <p className="text-xs text-slate-500 uppercase font-display tracking-wider mb-2">Total</p>
         <p className="text-xl font-display font-bold text-sky-400">
  {batch.token_type === 'USDC'
    ? `${(Number(batch.total_amount) / 1_000_000).toFixed(2)} USDC`
    : formatSui(batch.total_amount)
  }
</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 uppercase font-display tracking-wider mb-2">Treasury</p>
          <p className="text-xl font-display font-bold text-slate-100">{mistToSui(treasuryBalance)} SUI</p>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 uppercase font-display tracking-wider mb-2">
            {batch.executed ? 'Executed On' : 'Payday'}
          </p>
          {batch.executed ? (
            <p className="text-sm font-mono text-slate-200">{formatDate(batch.payday)}</p>
          ) : (
            <>
              <p className="text-sm font-mono text-slate-200">{formatDate(batch.payday)}</p>
              <p className="text-xs text-amber-400 mt-1">⏰ {countdownTo(batch.payday)}</p>
            </>
          )}
        </Card>
      </div>

      {/* Employee list */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-slate-200">Employees</h3>
          <span className="text-xs font-mono text-slate-500">
            {paidCount}/{batch.employees.length} paid
          </span>
        </div>
        <div className="space-y-2">
          {batch.employees.map((emp, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${emp.paid ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className="font-mono text-sm text-slate-300">{shortAddress(emp.wallet)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-sky-400 text-sm">
                  {formatSui(emp.amount)}
                </span>
                <Badge variant={emp.paid ? 'success' : 'neutral'}>
                  {emp.paid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Batch ID */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-slate-500 mb-1 font-display uppercase tracking-wider">Batch Object ID</p>
        <p className="font-mono text-xs text-slate-400 break-all">{batch.id}</p>
      </div>

      {/* Actions */}
      {!batch.executed && (
        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={() => setShowCancelConfirm(true)}
            disabled={cancelState.status === 'pending' || execState.status === 'pending'}
          >
            Cancel Batch
          </Button>
          <Button
            className="flex-1"
            onClick={handleExecute}
            loading={execState.status === 'pending'}
            disabled={cancelState.status === 'pending' || execState.status === 'success'}
          >
            {execState.status === 'pending'
              ? 'Running Payroll...'
              : `Run Payroll — ${formatSui(batch.total_amount)}`}
          </Button>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <Modal onClose={() => setShowCancelConfirm(false)}>
          <Card className="border-red-500/30">
            <h3 className="font-display font-bold text-slate-100 text-lg mb-2">Cancel Payroll Batch?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This will return <strong className="text-slate-200">{formatSui(batch.treasury_balance)}</strong> from
              the treasury back to your wallet. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowCancelConfirm(false)} className="flex-1">
                Keep Batch
              </Button>
              <Button variant="danger" onClick={handleCancel} className="flex-1">
                Confirm Cancel
              </Button>
            </div>
          </Card>
        </Modal>
      )}
    </div>
  );
}
