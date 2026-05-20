import { EmployeeFormRow } from '../types';

export interface PayrollTemplate {
  id: string;
  name: string;
  employees: EmployeeFormRow[];
  token_type: 'SUI' | 'USDC';
  created_at: number;
}

const KEY = 'suipayroll_templates';

export function getTemplates(): PayrollTemplate[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTemplate(template: Omit<PayrollTemplate, 'id' | 'created_at'>): PayrollTemplate {
  const templates = getTemplates();
  const newTemplate: PayrollTemplate = {
    ...template,
    id: Date.now().toString(),
    created_at: Date.now(),
  };
  templates.push(newTemplate);
  localStorage.setItem(KEY, JSON.stringify(templates));
  return newTemplate;
}

export function deleteTemplate(id: string) {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(templates));
}