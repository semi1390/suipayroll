import React, { useState } from 'react';
import { cn } from '../utils/helpers';

// ===== Badge =====
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'pending' | 'error' | 'neutral' | 'sui';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/15 text-red-400 border-red-500/30',
    neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    sui: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

// ===== Card =====
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
       'bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm overflow-visible',
        hover && 'hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

// ===== Button =====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-sky-500 hover:bg-sky-400 text-white border-transparent shadow-lg shadow-sky-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/40',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100 border-transparent',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold border transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

// ===== Input =====
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-sm text-slate-100',
          'placeholder:text-slate-600 font-mono',
          'focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50',
          'transition-all duration-200',
          error ? 'border-red-500/50' : 'border-slate-700/60',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// ===== Stat Card =====
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}

export function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-3', accent && 'border-sky-500/30 bg-sky-950/20')}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-slate-600">{icon}</span>}
      </div>
      <div>
        <p className={cn('text-2xl font-display font-bold', accent ? 'text-sky-400' : 'text-slate-100')}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </Card>
  );
}

// ===== Spinner =====
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <span className={cn('block border-2 border-sky-500 border-t-transparent rounded-full animate-spin', sizes[size])} />
  );
}

// ===== Empty State =====
export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {icon && <div className="text-5xl mb-2">{icon}</div>}
      <h3 className="font-display font-semibold text-slate-300 text-lg">{title}</h3>
      {description && <p className="text-slate-500 text-sm max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ===== TxSuccess Banner =====
export function TxSuccessBanner({ digest, onClose }: { digest: string; onClose: () => void }) {
  const url = `https://suiscan.xyz/testnet/tx/${digest}`;
  return (
    <div className="flex items-start gap-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 animate-slide-up">
      <span className="text-emerald-400 text-xl mt-0.5">✓</span>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-emerald-400 text-sm">Transaction confirmed!</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-emerald-300/70 hover:text-emerald-300 truncate block mt-0.5"
        >
          {digest.slice(0, 20)}...{digest.slice(-8)} ↗
        </a>
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
    </div>
  );
}

// ===== TxError Banner =====
export function TxErrorBanner({ error, onClose }: { error: string; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 bg-red-950/40 border border-red-500/30 rounded-xl p-4 animate-slide-up">
      <span className="text-red-400 text-xl mt-0.5">✗</span>
      <div className="flex-1">
        <p className="font-display font-semibold text-red-400 text-sm">Transaction failed</p>
        <p className="text-xs text-red-300/70 mt-0.5 break-words">{error}</p>
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
    </div>
  );
}

// ===== Modal =====
export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-slide-up">
        {children}
      </div>
    </div>
  );
}

// ===== Section Header =====
export function SectionHeader({ title, description, action }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-100">{title}</h2>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ===== Copy Button =====
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy(e: React.MouseEvent){
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
  onClick={copy}
  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono"
>
  {copied ? '✓ Copied' : '⎘ Copy'}
</button>
  );
}
