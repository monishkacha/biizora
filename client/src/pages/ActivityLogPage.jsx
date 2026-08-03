import React, { useEffect, useState } from 'react';
import { activityApi } from '../api/client';
import { useBusiness } from '../context/BusinessContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, EmptyState, Skeleton, Badge } from '../components/ui/Badge';
import { ScrollText } from 'lucide-react';

export default function ActivityLogPage() {
  const { showToast } = useBusiness();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await activityApi.list(page);
        setActivity(data.activity || []);
        setPages(data.pagination?.pages || 1);
      } catch (err) {
        showToast(err.message || 'Failed to load activity', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div>
      <PageHeader
        title="Activity log"
        description="Complete audit trail of logins, invoices, payments, and settings changes."
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : activity.length === 0 ? (
          <EmptyState icon={ScrollText} title="No activity yet" description="Actions across this business will appear here." />
        ) : (
          <ul className="divide-y divide-line">
            {activity.map((item) => (
              <li key={item.id} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-ink">{item.details || item.action}</p>
                    <Badge tone="neutral">{item.action}</Badge>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    {item.userName || 'System'}
                    {item.entityType ? ` · ${item.entityType}` : ''}
                  </p>
                </div>
                <time className="text-[11px] text-ink-faint whitespace-nowrap">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : ''}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {pages > 1 ? (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-xs px-3 py-1.5 border border-line rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="text-xs px-3 py-1.5 border border-line rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
