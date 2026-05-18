// ===== Contract Configuration =====
// Update PACKAGE_ID after deploying with `sui client publish`

export const CONTRACT_CONFIG = {
  PACKAGE_ID: import.meta.env.VITE_PACKAGE_ID || '0x0',
  MODULE_NAME: import.meta.env.VITE_MODULE_NAME || 'suipayroll',
  NETWORK: (import.meta.env.VITE_SUI_NETWORK || 'testnet') as 'testnet' | 'mainnet' | 'devnet',
};

// SUI denomination: 1 SUI = 1,000,000,000 MIST
export const MIST_PER_SUI = 1_000_000_000n;

export const SUI_EXPLORER_BASE: Record<string, string> = {
  testnet: 'https://suiscan.xyz/testnet',
  mainnet: 'https://suiscan.xyz/mainnet',
  devnet: 'https://suiscan.xyz/devnet',
};

export function getExplorerTxUrl(digest: string): string {
  const base = SUI_EXPLORER_BASE[CONTRACT_CONFIG.NETWORK] ?? SUI_EXPLORER_BASE.testnet;
  return `${base}/tx/${digest}`;
}

export function getExplorerObjectUrl(objectId: string): string {
  const base = SUI_EXPLORER_BASE[CONTRACT_CONFIG.NETWORK] ?? SUI_EXPLORER_BASE.testnet;
  return `${base}/object/${objectId}`;
}

export function getExplorerAddressUrl(address: string): string {
  const base = SUI_EXPLORER_BASE[CONTRACT_CONFIG.NETWORK] ?? SUI_EXPLORER_BASE.testnet;
  return `${base}/account/${address}`;
}

// Function targets
export const FN = {
  CREATE_BATCH: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::create_batch`,
  EXECUTE_PAYROLL: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::execute_payroll`,
  CANCEL_BATCH: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::cancel_batch`,
};

// Sui object types for filtering
export const OBJECT_TYPES = {
  PAYROLL_BATCH: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::PayrollBatch`,
  PAYSLIP_NFT: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::PayslipNFT`,
};
