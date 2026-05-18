import { EmployeeFormRow } from '../types';

/**
 * demo.ts — Pre-filled sample data for SuiPayroll demo/judging
 *
 * These are testnet addresses for demonstration purposes.
 * Replace with real testnet wallet addresses as needed.
 */

export const DEMO_EMPLOYEES: EmployeeFormRow[] = [
  {
    name: 'Alice Chen — Lead Engineer',
    wallet: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    amount: '5.0',
  },
  {
    name: 'Bob Martinez — Product Designer',
    wallet: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    amount: '3.5',
  },
  {
    name: 'Carol Johnson — Smart Contract Auditor',
    wallet: '0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    amount: '4.0',
  },
];

export const DEMO_PAYDAY = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 7); // one week from today
  return d.toISOString().split('T')[0];
})();

export const DEMO_TOKEN_TYPE = 'SUI' as const;

export const DEMO_TOTAL_SUI = DEMO_EMPLOYEES.reduce(
  (acc, e) => acc + parseFloat(e.amount),
  0
);
