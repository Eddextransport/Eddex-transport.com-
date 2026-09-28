import type { TripStatus } from '@/types';

const config: Record<TripStatus, { label: string; color: string; dot: string }> = {
  pending: { label: 'Waiting', color: 'bg-warning-500/15 text-warning-500', dot: 'bg-warning-500' },
  accepted: { label: 'Accepted', color: 'bg-brand-500/15 text-brand-400', dot: 'bg-brand-500' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/15 text-blue-400', dot: 'bg-blue-500' },
  finished: { label: 'Finished', color: 'bg-success-500/15 text-success-500', dot: 'bg-success-500' },
};

export function StatusBadge({ status }: { status: TripStatus }) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
