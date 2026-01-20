import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/button';
import {
  approvePendingPost,
  listPendingPosts,
  rejectPendingPost,
  PendingPost,
} from '../../api/moderation';

export function ModerationQueue() {
  const [items, setItems] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    setError(null);
    listPendingPosts(50, 0)
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load queue'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (postId: string) => {
    const reason = reasonById[postId]?.trim() || null;
    await approvePendingPost(postId, reason);
    setItems((prev) => prev.filter((item) => item.id !== postId));
  };

  const handleReject = async (postId: string) => {
    const reason = reasonById[postId]?.trim() || null;
    await rejectPendingPost(postId, reason);
    setItems((prev) => prev.filter((item) => item.id !== postId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Moderation Queue</h2>
          <p className="text-muted-foreground">Review posts flagged for manual approval</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-xl gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="font-medium line-clamp-2">{item.title || 'Untitled post'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium">{item.author_email || item.author_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700">
                      {item.original_language || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      value={reasonById[item.id] ?? ''}
                      onChange={(e) => setReasonById((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="Optional reason"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-lg gap-2 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(item.id)}
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg gap-2 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(item.id)}
                        disabled={loading}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No pending posts
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Loading queue...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
