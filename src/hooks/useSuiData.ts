import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { OBJECT_TYPES } from '../utils/contract';
import { parseBatch, parsePayslip } from '../utils/helpers';
import { PayrollBatch, PayslipNFT } from '../types';
import { isValidSuiAddress } from '../utils/helpers';

/** Fetch all PayrollBatch objects owned by the connected wallet */
export function useEmployerBatches() {
  const account = useCurrentAccount();
  const client = useSuiClient();

  return useQuery({
    queryKey: ['employer-batches', account?.address],
    enabled: !!account?.address,
    refetchInterval: 15_000,
    queryFn: async (): Promise<PayrollBatch[]> => {
      if (!account?.address) return [];

      const response = await client.getOwnedObjects({
        owner: account.address,
        filter: { StructType: OBJECT_TYPES.PAYROLL_BATCH },
        options: { showContent: true, showType: true },
      });

      const batches: PayrollBatch[] = [];
      for (const obj of response.data) {
        const parsed = parseBatch(obj);
        if (parsed) batches.push(parsed);
      }

      return batches.sort((a, b) => b.created_at - a.created_at);
    },
  });
}
/** Fetch USDC balance for the connected wallet */
export function useUSDCBalance() {
  const account = useCurrentAccount();
  const client = useSuiClient();

  return useQuery({
    queryKey: ['usdc-balance', account?.address],
    enabled: !!account?.address,
    refetchInterval: 10_000,
    queryFn: async (): Promise<bigint> => {
      if (!account?.address) return 0n;
      const balance = await client.getBalance({
        owner: account.address,
        coinType: '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
      });
      return BigInt(balance.totalBalance);
    },
  });
}

/** Fetch all PayslipNFT objects owned by the connected wallet */
export function useEmployeePayslips() {
  const account = useCurrentAccount();
  const client = useSuiClient();

  return useQuery({
    queryKey: ['employee-payslips', account?.address],
    enabled: !!account?.address,
    refetchInterval: 15_000,
    queryFn: async (): Promise<PayslipNFT[]> => {
      if (!account?.address) return [];

      const response = await client.getOwnedObjects({
        owner: account.address,
        filter: { StructType: OBJECT_TYPES.PAYSLIP_NFT },
        options: { showContent: true, showType: true },
      });

      const payslips: PayslipNFT[] = [];
      for (const obj of response.data) {
        const parsed = parsePayslip(obj);
        if (parsed) payslips.push(parsed);
      }

      return payslips.sort((a, b) => b.paid_at - a.paid_at);
    },
  });
}

/** Fetch SUI balance for the connected wallet */
export function useSuiBalance() {
  const account = useCurrentAccount();
  const client = useSuiClient();

  return useQuery({
    queryKey: ['sui-balance', account?.address],
    enabled: !!account?.address,
    refetchInterval: 10_000,
    queryFn: async (): Promise<bigint> => {
      if (!account?.address) return 0n;
      const balance = await client.getBalance({
        owner: account.address,
        coinType: '0x2::sui::SUI',
      });
      return BigInt(balance.totalBalance);
    },
  });
}

/** Fetch a single batch by object ID */
export function useBatch(batchId: string | undefined) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['batch', batchId],
    enabled: !!batchId,
    queryFn: async (): Promise<PayrollBatch | null> => {
      if (!batchId) return null;
      const obj = await client.getObject({
        id: batchId,
        options: { showContent: true },
      });
      return parseBatch(obj);
    },
  });
}
/** Check if a Sui address has any on-chain activity */
export function useValidateAddress(address: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['validate-address', address],
    enabled: isValidSuiAddress(address),
    staleTime: 30_000,
    queryFn: async () => {
      const balance = await client.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI',
      });
      return Number(balance.totalBalance) > 0;
    },
  });
}