import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { cn } from '../utils/helpers';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  error?: string;
  min?: string;
}

export function DatePicker({ value, onChange, error, min }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = value ? new Date(value) : undefined;
  const minDate = min ? new Date(min) : new Date();

  function formatDisplay(dateStr: string) {
    if (!dateStr) return 'Select payday date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function handleOpen() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen(!open);
  }

  useEffect(() => {
    function handleScroll() { setOpen(false); }
    if (open) window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider">
        Payday Date
      </label>

      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          'w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-sm text-left transition-all',
          'focus:outline-none focus:ring-2 focus:ring-sky-500/50',
          error ? 'border-red-500/50' : open ? 'border-sky-500/50' : 'border-slate-700/60',
          value ? 'text-slate-100' : 'text-slate-600'
        )}
      >
        <div className="flex items-center justify-between">
          <span>{formatDisplay(value)}</span>
          <span className="text-slate-500">📅</span>
        </div>
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              minWidth: 320,
              zIndex: 999,
            }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl shadow-black/50"
          >
            <style>{`
              .rdp { --rdp-accent-color: #38bdf8; color: #f1f5f9; margin: 0; }
              .rdp-day_selected { background: #38bdf8 !important; color: #0a0f1e !important; font-weight: 700; }
              .rdp-day:hover:not(.rdp-day_selected) { background: #1e293b; border-radius: 8px; }
              .rdp-caption { color: #f1f5f9; margin-bottom: 8px; }
              .rdp-nav_button { color: #94a3b8; }
              .rdp-head_cell { color: #475569; font-size: 12px; padding: 4px; }
              .rdp-day { color: #f1f5f9; border-radius: 8px; width: 36px; height: 36px; }
              .rdp-day_disabled { color: #334155 !important; opacity: 0.4; }
              .rdp-day_outside { color: #334155; }
              .rdp-cell { padding: 2px; }
            `}</style>
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (date) {
                  const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
onChange(`${year}-${month}-${day}`);
                  setOpen(false);
                }
              }}
              disabled={{ before: minDate }}
              showOutsideDays
            />
          </div>
        </>,
        document.body
      )}

      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
}