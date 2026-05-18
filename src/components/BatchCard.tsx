import { useNavigate } from 'react-router-dom';
import { PayrollBatch } from '../types';
import { Card, Badge, CopyButton } from './ui';
import { formatSui, formatDate, countdownTo, shortAddress } from '../utils/helpers';

interface BatchCardProps {
  batch: PayrollBatch;
}

export function BatchCard({ batch }: BatchCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      hover
      onClick={() => navigate(`/batch/${batch.id}`)}
      className="flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500">{batch.id.slice(0, 10)}...</span>
            <Badge variant={batch.executed ? 'success' : 'pending'}>
              {batch.executed ? '✓ Executed' : '⏳ Pending'}
            </Badge>
            <Badge variant="sui">{batch.token_type}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-slate-400 text-sm">Employer:</span>
            <span className="font-mono text-slate-300 text-sm">{shortAddress(batch.employer)}</span>
            <div onClick={e => e.stopPropagation()}>
              <CopyButton text={batch.employer} />
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-sky-400 text-lg">{formatSui(batch.total_amount)}</p>
          <p className="text-xs text-slate-500">{batch.employees.length} employees</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Created {formatDate(batch.created_at)}</span>
          {!batch.executed && (
            <span className="text-amber-400 font-mono">
              ⏰ {countdownTo(batch.payday)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {batch.employees.filter(e => e.paid).length}/{batch.employees.length}
          <span className="text-xs text-slate-500">paid</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {batch.employees.slice(0, 3).map((emp, i) => (
          <span key={i} className="text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-slate-400">
            {shortAddress(emp.wallet, 4)}
          </span>
        ))}
        {batch.employees.length > 3 && (
          <span className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-slate-500">
            +{batch.employees.length - 3} more
          </span>
        )}
      </div>
    </Card>
  );
}