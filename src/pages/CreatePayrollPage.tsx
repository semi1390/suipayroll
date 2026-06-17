import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { EmployeeFormRow, CreateBatchForm } from '../types';
import { useCreateBatch } from '../hooks/useTransactions';
import { useSuiBalance, useValidateAddress, useUSDCBalance } from '../hooks/useSuiData';
import { Button, Input, Card, TxSuccessBanner, TxErrorBanner } from '../components/ui';
import { isValidSuiAddress, suiToMist, mistToSui, cn, dateToTimestampMs } from '../utils/helpers';
import { DEMO_EMPLOYEES, DEMO_PAYDAY, DEMO_TOKEN_TYPE } from '../utils/demo';
import { DatePicker } from '../components/DatePicker';
import { FN } from '../utils/contract';
import Papa from 'papaparse';
import { getTemplates, saveTemplate, deleteTemplate, PayrollTemplate } from '../utils/templates';
import { motion } from 'framer-motion';
import { LayoutTemplate, Upload, Save, Fuel, Plus, X, AlertTriangle } from 'lucide-react';

const EMPTY_EMPLOYEE: EmployeeFormRow = { wallet: '', amount: '', name: '' };
const USDC_TYPE = '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC';

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
          {value && isValid && !checking && hasActivity && <span className="text-emerald-400">✓</span>}
          {value && isValid && !checking && hasActivity === false && <span className="text-amber-400">?</span>}
        </div>
      </div>
      {value && !isValid && <p className="text-xs text-red-400 font-mono">Invalid address — must be 0x followed by 64 hex characters</p>}
      {value && isValid && !checking && hasActivity === false && (
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400">No transaction history on Sui testnet — double check this address</p>
        </div>
      )}
      {value && isValid && !checking && hasActivity && <p className="text-xs text-emerald-400">Active Sui address</p>}
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
  const { data: usdcBalance } = useUSDCBalance();

  const [employees, setEmployees] = useState<EmployeeFormRow[]>([{ ...EMPTY_EMPLOYEE }]);
  const [tokenType, setTokenType] = useState<'SUI' | 'USDC'>('SUI');
  const [payday, setPayday] = useState('');
  const [batchName, setBatchName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [usedDemo, setUsedDemo] = useState(false);
  const [templates, setTemplates] = useState<PayrollTemplate[]>(getTemplates());
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);

  const totalSui = employees.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const totalMist = suiToMist(totalSui);
  const totalUSDC = BigInt(Math.round(totalSui * 1_000_000));
  const activeBalance = tokenType === 'USDC' ? usdcBalance : balance;
  const activeRequired = tokenType === 'USDC' ? totalUSDC : totalMist;
  const hasEnoughBalance = activeBalance !== undefined && activeBalance >= activeRequired;

  function loadDemo() {
    setEmployees(DEMO_EMPLOYEES.map(e => ({ ...e })));
    setPayday(DEMO_PAYDAY);
    setTokenType(DEMO_TOKEN_TYPE);
    setUsedDemo(true);
  }

  function handleSaveTemplate() {
    if (!templateName.trim()) return;
    saveTemplate({ name: templateName, employees, token_type: tokenType });
    setTemplates(getTemplates());
    setTemplateName('');
    setShowSaveTemplate(false);
  }

  function handleLoadTemplate(template: PayrollTemplate) {
    setEmployees(template.employees.map(e => ({ ...e })));
    setTokenType(template.token_type);
    setShowTemplates(false);
    setUsedDemo(true);
  }

  function handleDeleteTemplate(id: string) {
    deleteTemplate(id);
    setTemplates(getTemplates());
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        const parsed: EmployeeFormRow[] = rows.map(row => ({
          name: row.name || row.Name || row.label || '',
          wallet: row.wallet || row.Wallet || row.address || row.Address || '',
          amount: row.amount || row.Amount || row.salary || row.Salary || '',
        })).filter(r => r.wallet);
        if (parsed.length > 0) { setEmployees(parsed); setUsedDemo(true); }
      },
    });
    e.target.value = '';
  }

  async function estimateGas() {
    if (!account?.address || employees.length === 0 || !payday) return;
    setEstimating(true);
    try {
      const tx = new Transaction();
      tx.setSender(account.address);
      const isUSDC = tokenType === 'USDC';
      const amounts = employees.map(e =>
        isUSDC
          ? BigInt(Math.round(parseFloat(e.amount || '0') * 1_000_000))
          : suiToMist(e.amount || '0')
      );
      const total = amounts.reduce((a, b) => a + b, 0n);
      let coin;
      if (isUSDC) {
        const usdcCoins = await client.getCoins({ owner: account.address, coinType: USDC_TYPE });
        if (!usdcCoins.data.length) throw new Error('No USDC');
        const primaryCoin = tx.object(usdcCoins.data[0].coinObjectId);
        if (usdcCoins.data.length > 1) {
          tx.mergeCoins(primaryCoin, usdcCoins.data.slice(1).map(c => tx.object(c.coinObjectId)));
        }
        [coin] = tx.splitCoins(primaryCoin, [tx.pure.u64(total)]);
      } else {
        [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(total)]);
      }
      tx.moveCall({
        target: FN.CREATE_BATCH,
        typeArguments: [isUSDC ? USDC_TYPE : '0x2::sui::SUI'],
        arguments: [
          tx.pure.vector('address', employees.map(e => e.wallet || account.address)),
          tx.pure.vector('u64', amounts),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(tokenType))),
          tx.pure.u64(dateToTimestampMs(payday)),
          coin,
          tx.object('0x6'),
        ],
      });
      const dryRun = await client.dryRunTransactionBlock({ transactionBlock: await tx.build({ client }) });
      const gas = dryRun.effects.gasUsed;
      const totalGas = BigInt(gas.computationCost) + BigInt(gas.storageCost) - BigInt(gas.storageRebate);
      setGasEstimate(`~${(Number(totalGas) / 1e9).toFixed(6)} SUI`);
    } catch {
      setGasEstimate('Unable to estimate');
    }
    setEstimating(false);
  }

  function addEmployee() { setEmployees(prev => [...prev, { ...EMPTY_EMPLOYEE }]); }
  function removeEmployee(idx: number) { setEmployees(prev => prev.filter((_, i) => i !== idx)); }
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
      else if (parseFloat(e.amount) < 0.001) errs[`emp_${i}_amount`] = 'Amount too low — minimum 0.001';
    });
    if (!payday) errs.payday = 'Required';
    else if (new Date(payday) <= new Date()) errs.payday = 'Must be in the future';
    if (!hasEnoughBalance) errs.balance = `Insufficient ${tokenType} balance`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() { if (validate()) setStep('confirm'); }

  async function handleSubmit() {
    if (!account) return;
    const form: CreateBatchForm = { name: batchName, employees, token_type: tokenType, payday };
    const digest = await createBatch(form);
    if (digest) setTimeout(() => navigate('/dashboard'), 3000);
  }

  if (step === 'confirm') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-display font-bold text-slate-100">Confirm Payroll</h2>
          <p className="text-sm text-slate-400 mt-1">Review before depositing funds on-chain</p>
        </div>
        <Card className="mb-6">
          {batchName && (
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
              <span className="text-slate-400 text-sm font-display">Payroll Name</span>
              <span className="font-mono text-slate-100 font-semibold">{batchName}</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
            <span className="text-slate-400 text-sm font-display">Token</span>
            <span className="font-mono text-slate-100 font-semibold">{tokenType}</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
            <span className="text-slate-400 text-sm font-display">Payday</span>
            <span className="font-mono text-slate-100 text-right">{new Date(payday).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
          </div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <span className="text-slate-400 text-sm font-display">Employees</span>
            <span className="font-mono text-slate-100">{employees.length}</span>
          </div>
          <div className="space-y-2 mb-6">
            {employees.map((e, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-3 py-2.5 gap-2">
                <div className="min-w-0">
                  {e.name && <p className="text-xs text-slate-400 mb-0.5 truncate">{e.name}</p>}
                  <p className="font-mono text-xs text-slate-300 truncate">{e.wallet.slice(0, 14)}...{e.wallet.slice(-6)}</p>
                </div>
                <span className="font-display font-semibold text-sky-400 text-sm shrink-0">{e.amount} {tokenType}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-sky-950/30 border border-sky-500/20 rounded-xl p-4">
            <span className="font-display font-bold text-slate-200">Total Required</span>
            <span className="font-display font-extrabold text-sky-400 text-xl">{totalSui.toFixed(4)} {tokenType}</span>
          </div>
        </Card>
        {txState.status === 'success' && txState.digest && (
          <div className="mb-4"><TxSuccessBanner digest={txState.digest} onClose={resetTx} /></div>
        )}
        {txState.status === 'error' && txState.error && (
          <div className="mb-4"><TxErrorBanner error={txState.error} onClose={resetTx} /></div>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep('form')} disabled={txState.status === 'pending'}>← Back</Button>
          <Button className="flex-1" onClick={handleSubmit} loading={txState.status === 'pending'} disabled={txState.status === 'success'}>
            {txState.status === 'pending' ? 'Depositing...' : `Deposit ${totalSui.toFixed(4)} ${tokenType} & Create`}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100">Create Payroll Batch</h2>
          <p className="text-sm text-slate-400 mt-1">Add employees, set payday, and deposit funds on-chain</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-display font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Templates</span>
            {templates.length > 0 && <span className="bg-sky-500/20 text-sky-400 text-xs px-1.5 py-0.5 rounded-full">{templates.length}</span>}
          </button>
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-display font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </span>
          </label>
        </div>
      </div>

      {/* Templates dropdown */}
      {showTemplates && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <h3 className="font-display font-semibold text-slate-200 text-sm mb-3">Saved Templates</h3>
          {templates.length === 0 ? (
            <p className="text-slate-500 text-sm">No templates saved yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {templates.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-slate-100 font-display font-medium text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.employees.length} employees · {t.token_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleLoadTemplate(t)} className="text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg px-3 py-1.5 hover:bg-sky-500/30 transition-all font-display">Load</button>
                    <button onClick={() => handleDeleteTemplate(t.id)} className="text-slate-500 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Save as template */}
      {showSaveTemplate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <h3 className="font-display font-semibold text-slate-200 text-sm mb-3">Save as Template</h3>
          <div className="flex gap-2">
            <Input placeholder="Template name e.g. Engineering Team" value={templateName} onChange={e => setTemplateName(e.target.value)} className="flex-1" />
            <Button size="sm" onClick={handleSaveTemplate}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowSaveTemplate(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Main form card */}
      <Card className="mb-6">
        <div className="mb-4">
          <Input label="Payroll Name (optional)" placeholder="e.g. May 2026 Engineering Team" value={batchName} onChange={e => setBatchName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider block mb-2">Token Type</label>
            <div className="flex gap-2">
              {(['SUI', 'USDC'] as const).map(t => (
                <button key={t} onClick={() => setTokenType(t)}
                  className={cn('flex-1 py-2.5 rounded-xl text-sm font-display font-semibold border transition-all',
                    tokenType === t ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200')}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <DatePicker value={payday} onChange={(date) => { setPayday(date); setErrors(p => { const n = { ...p }; delete n.payday; return n; }); }} error={errors.payday} min={new Date().toISOString().split('T')[0]} />
        </div>
      </Card>

      {/* Employees */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-slate-200">Employees</h3>
          <span className="text-xs text-slate-500">{employees.length} added</span>
        </div>
        <div className="space-y-4">
          {employees.map((emp, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xs font-mono text-slate-600 pt-0.5 w-5 shrink-0">#{idx + 1}</span>
                <Input placeholder="Label (optional)" value={emp.name} onChange={e => updateEmployee(idx, 'name', e.target.value)} className="flex-1 !text-xs !py-1.5" />
                {employees.length > 1 && (
                  <button onClick={() => removeEmployee(idx)} className="text-slate-600 hover:text-red-400 transition-colors mt-1"><X className="w-4 h-4" /></button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <WalletInput value={emp.wallet} onChange={val => updateEmployee(idx, 'wallet', val)} error={errors[`emp_${idx}_wallet`]} />
                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <input placeholder="0.0" type="number" min="0" step="0.001" value={emp.amount}
                      onChange={e => updateEmployee(idx, 'amount', e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50 pr-14" />
                    <button
                      onClick={() => {
                        if (tokenType === 'USDC' && usdcBalance) {
                          updateEmployee(idx, 'amount', (Number(usdcBalance) / 1_000_000).toFixed(2));
                        } else if (balance) {
                          updateEmployee(idx, 'amount', (Number(balance) / 1e9).toFixed(4));
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg px-2 py-1 hover:bg-sky-500/30 transition-all font-display">
                      Max
                    </button>
                  </div>
                  {errors[`emp_${idx}_amount`] && <p className="text-xs text-red-400 font-mono">{errors[`emp_${idx}_amount`]}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <button onClick={addEmployee} className="mt-4 w-full py-2.5 border border-dashed border-slate-700 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all font-display flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </Card>

      {/* Total + Balance */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 mb-3">
        <div>
          <p className="text-xs text-slate-500 font-display uppercase tracking-wider mb-1">Total Required</p>
          <p className="text-2xl font-display font-extrabold text-sky-400">{totalSui.toFixed(4)} {tokenType}</p>
        </div>
        <div className="text-right">
          <p className={cn('text-sm font-mono', hasEnoughBalance ? 'text-emerald-400' : 'text-red-400')}>
            Balance: {tokenType === 'USDC'
              ? `${(Number(usdcBalance ?? 0n) / 1_000_000).toFixed(2)} USDC`
              : `${mistToSui(balance ?? 0n)} SUI`
            } {hasEnoughBalance ? '✓' : '✗'}
          </p>
          {errors.balance && <p className="text-xs text-red-400 mt-1">{errors.balance}</p>}
        </div>
      </div>

      {/* Gas estimation */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 mb-6">
        <div className="flex items-center gap-3">
          <Fuel className="w-4 h-4 text-slate-500 shrink-0" />
          <p className="text-xs text-slate-500 font-display uppercase tracking-wider">Est. Gas</p>
          {gasEstimate && <p className="text-sm font-mono text-slate-300">{gasEstimate}</p>}
          {!gasEstimate && !estimating && <p className="text-xs text-slate-600">—</p>}
          {estimating && <span className="w-3 h-3 border border-sky-400 border-t-transparent rounded-full animate-spin block" />}
        </div>
        <button onClick={estimateGas} disabled={estimating || employees.every(e => !e.wallet || !e.amount) || !payday}
          className="text-xs text-sky-400 hover:text-sky-300 font-display disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0">
          {estimating ? 'Estimating...' : 'Estimate →'}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
        <button
          onClick={() => setShowSaveTemplate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save Template</span>
          <span className="sm:hidden">Save</span>
        </button>
        <Button className="flex-1" onClick={handleNext}>Review & Confirm →</Button>
      </div>
    </motion.div>
  );
}