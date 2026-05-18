import { MIST_PER_SUI } from './contract';

// ===== SUI Denomination Helpers =====

/** Convert human-readable SUI to MIST (BigInt) */
export function suiToMist(sui: string | number): bigint {
  const n = typeof sui === 'string' ? parseFloat(sui) : sui;
  return BigInt(Math.round(n * Number(MIST_PER_SUI)));
}

/** Convert MIST to human-readable SUI string */
export function mistToSui(mist: bigint | string | number): string {
  const n = BigInt(mist);
  const sui = Number(n) / Number(MIST_PER_SUI);
  return sui.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

/** Format SUI with symbol */
export function formatSui(mist: bigint | string | number): string {
  return `${mistToSui(mist)} SUI`;
}

// ===== Address Helpers =====

/** Shorten a Sui address for display */
export function shortAddress(addr: string, chars = 6): string {
  if (!addr) return '';
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

/** Validate a Sui address (0x + 64 hex chars) */
export function isValidSuiAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(addr);
}

// ===== Date/Time Helpers =====

/** Convert Date to timestamp in milliseconds */
export function dateToTimestampMs(date: Date | string): number {
  return new Date(date).getTime();
}

/** Format timestamp for display */
export function formatDate(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format timestamp with time */
export function formatDateTime(timestampMs: number): string {
  return new Date(timestampMs).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Countdown to a future date */
export function countdownTo(timestampMs: number): string {
  const now = Date.now();
  const diff = timestampMs - now;
  if (diff <= 0) return 'Due now';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

// ===== Sui Object Parsing =====

/** Safely extract fields from a Sui object response */
export function extractFields(obj: unknown): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return {};
  const o = obj as Record<string, unknown>;
  if (o.data && typeof o.data === 'object') {
    const data = o.data as Record<string, unknown>;
    if (data.content && typeof data.content === 'object') {
      const content = data.content as Record<string, unknown>;
      if (content.fields && typeof content.fields === 'object') {
        return content.fields as Record<string, unknown>;
      }
    }
  }
  return {};
}

/** Parse a PayrollBatch from a Sui object */
export function parseBatch(obj: unknown): import('../types').PayrollBatch | null {
  try {
    const o = obj as Record<string, unknown>;
    const data = (o.data ?? o) as Record<string, unknown>;
    const content = data.content as Record<string, unknown> | undefined;
    const fields = (content?.fields ?? data.fields ?? {}) as Record<string, unknown>;
    const id = (data.objectId as string) ?? (fields.id as Record<string, unknown>)?.id as string;
    if (!id) return null;

    const employees = ((fields.employees as unknown[]) ?? []).map((e: unknown) => {
      const ef = ((e as Record<string, unknown>).fields ?? e) as Record<string, unknown>;
      return {
        wallet: ef.wallet as string,
        amount: String(ef.amount),
        paid: ef.paid as boolean,
      };
    });

    return {
      id,
      employer: fields.employer as string,
      employees,
      total_amount: String(fields.total_amount),
      token_type: fields.token_type as string,
      payday: Number(fields.payday),
      executed: fields.executed as boolean,
      created_at: Number(fields.created_at),
      treasury_balance: String((fields.treasury as Record<string, unknown>)?.fields?.balance ?? '0'),
    };
  } catch {
    return null;
  }
}

/** Parse a PayslipNFT from a Sui object */
export function parsePayslip(obj: unknown): import('../types').PayslipNFT | null {
  try {
    const o = obj as Record<string, unknown>;
    const data = (o.data ?? o) as Record<string, unknown>;
    const content = data.content as Record<string, unknown> | undefined;
    const fields = (content?.fields ?? data.fields ?? {}) as Record<string, unknown>;
    const id = (data.objectId as string) ?? (fields.id as Record<string, unknown>)?.id as string;
    if (!id) return null;

    return {
      id,
      employee: fields.employee as string,
      employer: fields.employer as string,
      amount: String(fields.amount),
      token_type: fields.token_type as string,
      batch_id: String(fields.batch_id),
      paid_at: Number(fields.paid_at),
    };
  } catch {
    return null;
  }
}

// ===== Class Helpers =====

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
