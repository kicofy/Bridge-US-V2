import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { listReports, ReportResponse, resolveReport } from '../../api/reports';
import { approveAppeal, listAppeals, AppealResponse, rejectAppeal } from '../../api/moderation';

type TabKey = 'reports' | 'appeals';

export function ReportManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>('reports');
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [appeals, setAppeals] = useState<AppealResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([listReports(50, 0), listAppeals(50, 0)])
      .then(([reportItems, appealItems]) => {
        setReports(reportItems);
        setAppeals(appealItems);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const pendingReports = useMemo(() => reports.filter((item) => item.status === 'pending'), [reports]);

  const handleResolve = async (reportId: string, action: 'hide' | 'restore' | 'reject') => {
    const updated = await resolveReport(reportId, { action });
    setReports((prev) => prev.map((item) => (item.id === reportId ? updated : item)));
  };

  const handleAppeal = async (appealId: string, action: 'approve' | 'reject') => {
    const updated = action === 'approve' ? await approveAppeal(appealId) : await rejectAppeal(appealId);
    setAppeals((prev) => prev.map((item) => (item.id === appealId ? updated : item)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Report & Appeal Management</h2>
        <p className="text-muted-foreground">Review user reports and moderation appeals</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl border">
        <div className="border-b">
          <div className="flex">
            {(['reports', 'appeals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-[var(--bridge-blue)] text-[var(--bridge-blue)]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'reports' ? 'Reports' : 'Appeals'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'reports' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Pending reports: {pendingReports.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `Total ${reports.length}`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{report.reason}</div>
                        <div className="text-xs text-muted-foreground">{report.created_at}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {report.target_type} • {report.target_id.slice(0, 6)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-muted">
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 rounded-lg"
                            onClick={() => handleResolve(report.id, 'hide')}
                            disabled={report.status !== 'pending'}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Hide
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 rounded-lg"
                            onClick={() => handleResolve(report.id, 'reject')}
                            disabled={report.status !== 'pending'}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        No reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appeals' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `Total ${appeals.length}`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Appeal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {appeals.map((appeal) => (
                    <tr key={appeal.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{appeal.reason}</div>
                        <div className="text-xs text-muted-foreground">{appeal.created_at}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {appeal.target_type} • {appeal.target_id.slice(0, 6)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-muted">
                          {appeal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 rounded-lg"
                            onClick={() => handleAppeal(appeal.id, 'approve')}
                            disabled={appeal.status !== 'pending'}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 rounded-lg"
                            onClick={() => handleAppeal(appeal.id, 'reject')}
                            disabled={appeal.status !== 'pending'}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {appeals.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        No appeals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

