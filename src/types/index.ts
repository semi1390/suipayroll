// ===== Core Domain Types =====

export interface EmployeeRecord {
  wallet: string;
  amount: string; // in MIST (1 SUI = 1e9 MIST)
  paid: boolean;
}

export interface PayrollBatch {
  id: string;
  employer: string;
  employees: EmployeeRecord[];
  total_amount: string;
  token_type: string;
  payday: number; // timestamp ms
  executed: boolean;
  created_at: number;
  treasury_balance: string;
}

export interface PayslipNFT {
  id: string;
  employee: string;
  employer: string;
  amount: string;
  token_type: string;
  batch_id: string;
  paid_at: number;
}

// ===== Form Types =====

export interface EmployeeFormRow {
  wallet: string;
  amount: string; // human-readable SUI
  name?: string; // optional label
}

export interface CreateBatchForm {
  name?: string;
  employees: EmployeeFormRow[];
  token_type: 'SUI' | 'USDC';
  payday: string; // ISO date string
}

// ===== Transaction States =====

export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export interface TxState {
  status: TxStatus;
  digest?: string;
  error?: string;
}

// ===== Sui Object Types =====

export interface SuiObjectField {
  type: string;
  fields: Record<string, unknown>;
}
