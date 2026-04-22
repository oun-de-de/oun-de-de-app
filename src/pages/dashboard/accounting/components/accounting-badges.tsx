import { Badge } from '@/core/ui/badge';
import { cn } from '@/core/utils';

function normalizeAccountingBadgeKey(value: string) {
  return value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

function formatAccountingBadgeLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

const ACCOUNTING_REASON_BADGE_CLASSNAME: Record<string, string> = {
  CASH_IN: 'bg-gradient-to-r from-info to-info/80 text-white',
  REVENUE: 'bg-gradient-to-r from-success to-success/80 text-white',
  CASH_OUT: 'bg-gradient-to-r from-destructive to-destructive/80 text-white',
  GENERAL: 'bg-gradient-to-r from-slate-600 to-slate-500 text-white',
  DEBIT: 'bg-gradient-to-r from-info to-info/80 text-white',
  CREDIT: 'bg-gradient-to-r from-warning to-warning/80 text-white',
};

const ACCOUNTING_NATURE_BADGE_CLASSNAME: Record<string, string> = {
  ASSET: 'bg-gradient-to-r from-sky-500 to-sky-400 text-white',
  LIABILITY: 'bg-gradient-to-r from-amber-500 to-amber-400 text-white',
  EQUITY: 'bg-gradient-to-r from-violet-500 to-violet-400 text-white',
  REVENUE: 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white',
  EXPENSE: 'bg-gradient-to-r from-rose-500 to-rose-400 text-white',
};

export function AccountingReasonBadge({ value }: { value: string }) {
  const normalizedValue = normalizeAccountingBadgeKey(value || '-');

  return (
    <Badge
      shape="square"
      className={cn(
        'inline-flex h-6 items-center justify-center rounded-lg border-none px-3 py-0 text-xs font-medium shadow-sm',
        ACCOUNTING_REASON_BADGE_CLASSNAME[normalizedValue] ??
          'bg-slate-100 text-slate-700',
      )}
    >
      {formatAccountingBadgeLabel(value || '-')}
    </Badge>
  );
}

export function AccountingNatureBadge({ value }: { value: string }) {
  const normalizedValue = normalizeAccountingBadgeKey(value || '-');

  return (
    <Badge
      shape="square"
      className={cn(
        'inline-flex h-6 items-center justify-center rounded-lg border-none px-3 py-0 text-xs font-medium shadow-sm',
        ACCOUNTING_NATURE_BADGE_CLASSNAME[normalizedValue] ??
          'bg-slate-100 text-slate-700',
      )}
    >
      {formatAccountingBadgeLabel(value || '-')}
    </Badge>
  );
}
