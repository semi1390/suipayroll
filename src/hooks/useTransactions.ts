import { useState, useCallback } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { FN } from '../utils/contract';
import { suiToMist, dateToTimestampMs } from '../utils/helpers';
import { TxState, CreateBatchForm, PayrollBatch } from '../types';

export function useCreateBatch(client: SuiClient) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [txState, setTxState] = useState<TxState>({ status: 'idle' });

  const createBatch = useCallback(async (form: CreateBatchForm): Promise<string | null> => {
    if (!account?.address) return null;
    setTxState({ status: 'pending' });

    try {
      const tx = new Transaction();
      tx.setSender(account.address);

    const wallets = form.employees.map(e => e.wallet);
const isUSDC = form.token_type === 'USDC';
const amounts = form.employees.map(e => 
  isUSDC 
    ? BigInt(Math.round(parseFloat(e.amount) * 1_000_000))
    : suiToMist(e.amount)
);
const totalMist = amounts.reduce((a, b) => a + b, 0n);

      // Split coin from gas payment for treasury deposit
    const USDC_TYPE = '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC';

let coin;
if (form.token_type === 'USDC') {
  // Get USDC coins from wallet
  const usdcCoins = await client.getCoins({
    owner: account.address,
    coinType: USDC_TYPE,
  });
  if (!usdcCoins.data.length) throw new Error('No USDC coins found in wallet');
  
  const totalUSDC = totalMist;
  const primaryCoin = tx.object(usdcCoins.data[0].coinObjectId);
  
  // If multiple USDC coins, merge them first
  if (usdcCoins.data.length > 1) {
    tx.mergeCoins(primaryCoin, usdcCoins.data.slice(1).map(c => tx.object(c.coinObjectId)));
  }
  
  [coin] = tx.splitCoins(primaryCoin, [tx.pure.u64(totalUSDC)]);
} else {
  [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(totalMist)]);
}

      const paydayMs = dateToTimestampMs(form.payday);
const coinType = form.token_type === 'USDC'
 ? '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC'
  : '0x2::sui::SUI';

tx.moveCall({
  target: FN.CREATE_BATCH,
  typeArguments: [coinType],
  arguments: [
    tx.pure.vector('address', wallets),
    tx.pure.vector('u64', amounts.map(a => a)),
    tx.pure.vector('u8', Array.from(new TextEncoder().encode(form.token_type))),
    tx.pure.u64(paydayMs),
    coin,
    tx.object('0x6'),
  ],
});

      const result = await signAndExecute({ transaction: tx });
      const digest = result.digest;

      // Wait for confirmation
      await Promise.race([
  client.waitForTransaction({ digest }),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Transaction timed out. Check Sui Explorer for status.')), 30_000)
  ),
]);

      setTxState({ status: 'success', digest });
      return digest;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Transaction failed';
      setTxState({ status: 'error', error });
      return null;
    }
  }, [account, signAndExecute, client]);

  return { createBatch, txState, resetTx: () => setTxState({ status: 'idle' }) };
}

export function useExecutePayroll(client: SuiClient) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [txState, setTxState] = useState<TxState>({ status: 'idle' });

const executePayroll = useCallback(async (batch: PayrollBatch): Promise<string | null> => {
  if (!account?.address) return null;
  setTxState({ status: 'pending' });

  try {
    const tx = new Transaction();
    tx.setSender(account.address);

    const coinType = batch.token_type === 'USDC'
      ? '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC'
      : '0x2::sui::SUI';

    tx.moveCall({
      target: FN.EXECUTE_PAYROLL,
      typeArguments: [coinType],
      arguments: [
        tx.object(batch.id),
        tx.object('0x6'),
      ],
    });

      const result = await signAndExecute({ transaction: tx });
      const digest = result.digest;

      await client.waitForTransaction({ digest });

      setTxState({ status: 'success', digest });
      return digest;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Transaction failed';
      setTxState({ status: 'error', error });
      return null;
    }
  }, [account, signAndExecute, client]);

  return { executePayroll, txState, resetTx: () => setTxState({ status: 'idle' }) };
}

export function useCancelBatch(client: SuiClient) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [txState, setTxState] = useState<TxState>({ status: 'idle' });

 const cancelBatch = useCallback(async (batchId: string, tokenType: string = 'SUI'): Promise<string | null> => {
    if (!account?.address) return null;
    setTxState({ status: 'pending' });

    try {
      const tx = new Transaction();
      tx.setSender(account.address);
const coinType = '0x2::sui::SUI'; // or read from batch

tx.moveCall({
  target: FN.CANCEL_BATCH,
  typeArguments: [coinType],
  arguments: [tx.object(batchId)],
});

      const result = await signAndExecute({ transaction: tx });
      const digest = result.digest;

      await client.waitForTransaction({ digest });

      setTxState({ status: 'success', digest });
      return digest;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Transaction failed';
      setTxState({ status: 'error', error });
      return null;
    }
  }, [account, signAndExecute, client]);

  return { cancelBatch, txState, resetTx: () => setTxState({ status: 'idle' }) };
}
