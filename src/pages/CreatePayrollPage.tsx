import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { EmployeeFormRow, CreateBatchForm } from '../types';
import { useCreateBatch } from '../hooks/useTransactions';
import { useSuiBalance, useValidateAddress } from '../hooks/useSuiData';
import { Button, Input, Card, TxSuccessBanner, TxErrorBanner, SectionHeader } from '../components/ui';
import { isValidSuiAddress, suiToMist, mistToSui, cn } from '../utils/helpers';
import { DEMO_EMPLOYEES, DEMO_PAYDAY, DEMO_TOKEN_TYPE } from '../utils/demo';

const EMPTY_EMPLOYEE: EmployeeFormRow = { wallet: '', amount: '', name: '' };

function WalletInput({ value, onChange, error }: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const isValid = isValidSuiAddress(value);
  const { data: hasActivity, isLoading: checking } = useValidateAddress(value);

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <div className="relative">
        <input
          placeholder="0x1234...abcd (64 hex chars)"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            'w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-sm text-slate-100',
            'placeholder:text-slate-600 font-mono',
            'focus:outline-none focus:ring-2 focus:ring-sky-500/50',
            'transition-all duration-200 pr-10',
            error ? 'border-red-500/50' :
            value && !isValid ? 'border-red-500/50' :
            value && isValid ? 'border-emerald-500/50' :
            'border-slate-700/60'
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
          {value && !isValid && <span className="text-red-400">✗</span>}
          {value && isValid && checking && (
            <span className="w-3 h-3 border border-sky-400 border-t-transparent rounded-full animate-spin block" />
          )}
          {value && isValid && !checking && hasActivity && (
            <span className="text-emerald-400">✓</span>
          )}
          {value && isValid && !checking && hasActivity === false && (
            <span className="text-amber-400">?</span>
          )}
        </div>
      </div>
      {value && !isValid && (
        <p className="text-xs text-red-400 font-mono">
          Invalid address — must be 0x followed by 64 hex characters
        </p>
      )}
      {value && isValid && !checking && hasActivity === false && (
        <p className="text-xs text-amber-400">
          ⚠️ No transaction history on Sui testnet — double check this address
        </p>
      )}
      {value && isValid && !checking && hasActivity && (
        <p className="text-xs text-emerald-400">✓ Active Sui address</p>
      )}
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
}

export function CreatePayrollPage() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { createBatch, txState, resetTx } = useCreateBatch(client);
  const { data: balance } = useSuiBalance();

  const [employees, setEmployees] = useState<EmployeeFormRow[]>([{ ...EMPTY_EMPLOYEE }]);
  const [tokenType, setTokenType] = useState<'SUI' | 'USDC'>('SUI');
  const [payday, setPayday] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [usedDemo, setUsedDemo] = useState(false);

  const totalSui = employees.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const totalMist = suiToMist(totalSui);
  const hasEnoughBalance = balance !== undefined && balance >= totalMist;

  function loadDemo() {
    setEmployees(DEMO_EMPLOYEES.map(e => ({ ...e })));
    setPayday(DEMO_PAYDAY);
    setTokenType(DEMO_TOKEN_TYPE);
    setUsedDemo(true);
  }

  function addEmployee() {
    setEmployees(prev => [...prev, { ...EMPTY_EMPLOYEE }]);
  }

  function removeEmployee(idx: number) {
    setEmployees(prev => prev.filter((_, i) => i !== idx));
  }

  function updateEmployee(idx: number, field: keyof EmployeeFormRow, value: string) {
    setEmployees(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
    setErrors(prev => { const n = { ...prev }; delete n[`emp_${idx}_${field}`]; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    employees.forEach((e, i) => {
      if (!e.wallet) errs[`emp_${i}_wallet`] = 'Required';
      else if (!isValidSuiAddress(e.wallet)) errs[`emp_${i}_wallet`] = 'Invalid Sui address (0x + 64 hex)';
     if (!e.amount) errs[`emp_${i}_amount`] = 'Required';
else if (parseFloat(e.amount) <= 0) errs[`emp_${i}_amount`] = 'Must be > 0';
else if (parseFloat(e.amount) < 0.001) errs[`emp_${i}_amount`] = 'Amount too low — minimum 0.001 SUI';
    });
    if (!payday) errs.payday = 'Required';
    else if (new Date(payday) <= new Date()) errs.payday = 'Must be in the future';
    if (!hasEnoughBalance) errs.balance = 'Insufficient SUI balance';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) setStep('confirm');
  }

  async function handleSubmit() {
    if (!account) return;
    const form: CreateBatchForm = { employees, token_type: tokenType, payday };
    const digest = await createBatch(form);
    if (digest) {
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  }

  if (step === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <SectionHeader title="Confirm Payroll" description="Review before depositing funds on-chain" />
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
            <span className="text-slate-400 text-sm font-display">Token</span>
            <span className="font-mono text-slate-100 font-semibold">{tokenType}</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
            <span className="text-slate-400 text-sm font-display">Payday</span>
            <span className="font-mono text-slate-100">{new Date(payday).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
          </div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <span className="text-slate-400 text-sm font-display">Employees</span>
            <span className="font-mono text-slate-100">{employees.length}</span>
          </div>
          <div className="space-y-2 mb-6">
            {employees.map((e, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-3 py-2.5">
                <div>
                  {e.name && <p className="text-xs text-slate-400 mb-0.5">{e.name}</p>}
                  <p className="font-mono text-xs text-slate-300">{e.wallet.slice(0, 14)}...{e.wallet.slice(-6)}</p>
                </div>
                <span className="font-display font-semibold text-sky-400 text-sm">{e.amount} {tokenType}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-sky-950/30 border border-sky-500/20 rounded-xl p-4">
            <span className="font-display font-bold text-slate-200">Total Required</span>
            <span className="font-display font-extrabold text-sky-400 text-xl">{totalSui.toFixed(4)} SUI</span>
          </div>
        </Card>
        {txState.status === 'success' && txState.digest && (
          <div className="mb-4"><TxSuccessBanner digest={txState.digest} onClose={resetTx} /></div>
        )}
        {txState.status === 'error' && txState.error && (
          <div className="mb-4"><TxErrorBanner error={txState.error} onClose={resetTx} /></div>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep('form')} disabled={txState.status === 'pending'}>
            ← Back
          </Button>
          <Button className="flex-1" onClick={handleSubmit} loading={txState.status === 'pending'} disabled={txState.status === 'success'}>
            {txState.status === 'pending' ? 'Depositing funds...' : `Deposit ${totalSui.toFixed(4)} SUI & Create Batch`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <SectionHeader
        title="Create Payroll Batch"
        description="Add employees, set payday, and deposit funds on-chain"
        action={!usedDemo && <Button variant="ghost" size="sm" onClick={loadDemo}>Load demo data</Button>}
      />
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider block mb-2">Token Type</label>
            <div className="flex gap-2">
              {(['SUI', 'USDC'] as const).map(t => (
                <button key={t} onClick={() => setTokenType(t)}
                  className={cn('flex-1 py-2.5 rounded-xl text-sm font-display font-semibold border transition-all',
                    tokenType === t ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Input label="Payday Date" type="date" value={payday}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => { setPayday(e.target.value); setErrors(p => { const n = { ...p }; delete n.payday; return n; }); }}
            error={errors.payday}
          />
        </div>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-slate-200">Employees</h3>
          <span className="text-xs text-slate-500">{employees.length} added</span>
        </div>
        <div className="space-y-4">
          {employees.map((emp, idx) => (
            <div key={idx} className="relative bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xs font-mono text-slate-600 pt-0.5 w-5 shrink-0">#{idx + 1}</span>
                <Input placeholder="Label (optional)" value={emp.name}
                  onChange={e => updateEmployee(idx, 'name', e.target.value)}
                  className="flex-1 !text-xs !py-1.5"
                />
                {employees.length > 1 && (
                  <button onClick={() => removeEmployee(idx)} className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none mt-1">×</button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <WalletInput
                  value={emp.wallet}
                  onChange={val => updateEmployee(idx, 'wallet', val)}
                  error={errors[`emp_${idx}_wallet`]}
                />
                <div className="flex flex-col gap-1.5">
  <div className="relative">
    <input
      placeholder="0.0"
      type="number"
      min="0"
      step="0.001"
      value={emp.amount}
      onChange={e => updateEmployee(idx, 'amount', e.target.value)}
      className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50 pr-14"
    />
    <button
      onClick={() => {
        if (balance) {
          const remaining = Number(balance) / 1e9;
          updateEmployee(idx, 'amount', remaining.toFixed(4));
        }
      }}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg px-2 py-1 hover:bg-sky-500/30 transition-all font-display"
    >
      Max
    </button>
  </div>
  {errors[`emp_${idx}_amount`] && (
    <p className="text-xs text-red-400 font-mono">{errors[`emp_${idx}_amount`]}</p>
  )}
</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addEmployee} className="mt-4 w-full py-2.5 border border-dashed border-slate-700 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all font-display">
          + Add Employee
        </button>
      </Card>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 mb-6">
        <div>
          <p className="text-xs text-slate-500 font-display uppercase tracking-wider mb-1">Total Required</p>
          <p className="text-2xl font-display font-extrabold text-sky-400">{totalSui.toFixed(4)} SUI</p>
        </div>
        <div className="text-right">
          {balance !== undefined && (
            <p className={cn('text-sm font-mono', hasEnoughBalance ? 'text-emerald-400' : 'text-red-400')}>
              Balance: {mistToSui(balance)} SUI {hasEnoughBalance ? '✓' : '✗'}
            </p>
          )}
          {errors.balance && <p className="text-xs text-red-400 mt-1">{errors.balance}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
        <Button className="flex-1" onClick={handleNext}>Review & Confirm →</Button>
      </div>
    </div>
  );
}