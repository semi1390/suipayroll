import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuiClient } from '@mysten/dapp-kit';
import { useBatch } from '../hooks/useSuiData';
import { useExecutePayroll, useCancelBatch } from '../hooks/useTransactions';
import { Button, Card, Badge, Spinner, TxSuccessBanner, TxErrorBanner, Modal } from '../components/ui';
import { formatSui, formatDate, formatDateTime, countdownTo, shortAddress, mistToSui } from '../utils/helpers';
import { getExplorerTxUrl } from '../utils/contract';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ExternalLink, CheckCircle, XCircle, Search } from 'lucide-react';

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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <Search className="w-7 h-7 text-slate-600" />
        </div>
        <h3 className="font-display font-semibold text-slate-300 text-xl mb-2">Batch not found</h3>
        <p className="text-slate-500 text-sm mb-6">This batch may not exist or isn't owned by your wallet.</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const paidCount = batch.employees.filter(e => e.paid).length;
  const treasuryBalance = BigInt(batch.treasury_balance);

  async function handleExecute() {
    const digest = await executePayroll(batch!);
    if (digest) await refetch();
  }

  async function handleCancel() {
    setShowCancelConfirm(false);
    await cancelBatch(batch!.id, batch!.token_type);
    navigate('/dashboard');
  }

  const formatAmount = (amount: string) =>
    batch.token_type === 'USDC'
      ? `${(Number(amount) / 1_000_000).toFixed(2)} USDC`
      : formatSui(amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm font-display mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100">Payroll Batch</h2>
          <p className="text-sm text-slate-400 mt-1">Created {formatDateTime(batch.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={batch.executed ? 'success' : 'pending'}>
            {batch.executed ? '✓ Executed' : '⏳ Pending'}
          </Badge>
          <Badge variant="sui">{batch.token_type}</Badge>
        </div>
      </div>

      {/* Tx banners */}
      {execState.status === 'success' && execState.digest && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <TxSuccessBanner digest={execState.digest} onClose={resetExec} />
          <div className="mt-2 text-center">
            <a
              href={getExplorerTxUrl(execState.digest)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-sm font-display font-medium"
            >
              View on Sui Explorer <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
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
          <p className="text-xl font-display font-bold text-sky-400">{formatAmount(batch.total_amount)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 uppercase font-display tracking-wider mb-2">Treasury</p>
          <p className="text-xl font-display font-bold text-slate-100">
            {batch.token_type === 'USDC'
              ? `${(Number(treasuryBalance) / 1_000_000).toFixed(2)} USDC`
              : `${mistToSui(treasuryBalance)} SUI`}
          </p>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 uppercase font-display tracking-wider mb-2">
            {batch.executed ? 'Executed On' : 'Payday'}
          </p>
          <p className="text-sm font-mono text-slate-200">{formatDate(batch.payday)}</p>
          {!batch.executed && (
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <p className="text-xs text-amber-400">{countdownTo(batch.payday)}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Employee list */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-slate-200">Employees</h3>
          <span className="text-xs font-mono text-slate-500">{paidCount}/{batch.employees.length} paid</span>
        </div>
        <div className="space-y-2">
          {batch.employees.map((emp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                {emp.paid
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  : <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                }
                <span className="font-mono text-sm text-slate-300 truncate">{shortAddress(emp.wallet)}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-display font-semibold text-sky-400 text-sm whitespace-nowrap">
                  {formatAmount(emp.amount)}
                </span>
                <Badge variant={emp.paid ? 'success' : 'neutral'}>
                  {emp.paid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
            </motion.div>
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
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleExecute}
            loading={execState.status === 'pending'}
            disabled={cancelState.status === 'pending' || execState.status === 'success'}
          >
            {execState.status === 'pending' ? 'Running Payroll...' : `Run Payroll — ${formatAmount(batch.total_amount)}`}
          </Button>
        </div>
      )}

      {/* Cancel modal */}
      {showCancelConfirm && (
        <Modal onClose={() => setShowCancelConfirm(false)}>
          <Card className="border-red-500/30">
            <h3 className="font-display font-bold text-slate-100 text-lg mb-2">Cancel Payroll Batch?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This will return <strong className="text-slate-200">{formatAmount(batch.treasury_balance)}</strong> from the treasury back to your wallet. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowCancelConfirm(false)} className="flex-1">Keep Batch</Button>
              <Button variant="danger" onClick={handleCancel} className="flex-1">Confirm Cancel</Button>
            </div>
          </Card>
        </Modal>
      )}
    </motion.div>
  );
}