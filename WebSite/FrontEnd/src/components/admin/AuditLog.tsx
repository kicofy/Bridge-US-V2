import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { listAuditLogs, AuditLogResponse } from '../../api/admin';
import { listAuditLogs, AuditLogResponse } from '../../api/admin';

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listAuditLogs(100, 0)
      .then((items) => setLogs(items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  };

  const renderTarget = (log: AuditLogResponse) => {
    if (log.target_type === 'user') {
      return log.target_email ?? log.target_id;
    }
    return `${log.target_type} • ${log.target_id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-semibold">Audit Log</h2>
            <span className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium">
              ROOT ACCESS ONLY
            </span>
          </div>
          <p className="text-muted-foreground">
            Administrative actions recorded by the system
          </p>
        </div>
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
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm">{formatDate(log.created_at)}</td>
                  <td className="px-6 py-4 text-sm">{log.moderator_email ?? log.moderator_id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-sm">
                    {renderTarget(log)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{log.reason ?? '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading logs...' : `Showing ${logs.length} entries`}
          </p>
          <Button variant="outline" size="sm" className="rounded-lg" disabled>
            Load more
          </Button>
        </div>
      </div>
    </div>
  );
}

