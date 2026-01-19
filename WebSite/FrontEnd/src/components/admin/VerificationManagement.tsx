import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { approveVerification, listVerificationQueue, rejectVerification } from '../../api/verification';

type VerificationItem = {
  id: string;
  user_id: string;
  status: string;
};

export function VerificationManagement() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listVerificationQueue()
      .then((data) => setItems(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load verification queue'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (requestId: string) => {
    await approveVerification(requestId);
    setItems((prev) => prev.filter((item) => item.id !== requestId));
  };

  const handleReject = async (requestId: string) => {
    await rejectVerification(requestId);
    setItems((prev) => prev.filter((item) => item.id !== requestId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Verification Queue</h2>
        <p className="text-muted-foreground">Review verification requests</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm">{item.id}</td>
                  <td className="px-6 py-4 text-sm">{item.user_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs rounded-full bg-muted">{item.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className="h-8 px-3 rounded-lg text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(item.id)}
                        className="h-8 px-3 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No verification requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading queue...' : `Showing ${items.length} items`}
          </p>
          <Button variant="outline" size="sm" className="rounded-lg" disabled>
            Load more
          </Button>
        </div>
      </div>
    </div>
  );
}

