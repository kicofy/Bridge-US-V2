import { useState } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle2, XCircle, Eye, Clock } from 'lucide-react';
import { Button } from '../ui/button';

interface Report {
  id: string;
  reportedContent: {
    id: string;
    type: 'post' | 'reply' | 'user';
    title?: string;
    content: string;
    author: string;
  };
  reporter: {
    name: string;
    id: string;
  };
  reason: string;
  category: 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'other';
  description: string;
  createdAt: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  assignedTo?: string;
  resolution?: {
    action: string;
    note: string;
    resolvedBy: string;
    resolvedAt: string;
  };
}

const mockReports: Report[] = [
  {
    id: '1',
    reportedContent: {
      id: 'post-123',
      type: 'post',
      title: 'Suspicious Visa Services Advertisement',
      content: 'Get your visa approved 100% guaranteed! Contact us at...',
      author: 'Unknown User',
    },
    reporter: {
      name: 'John Chen',
      id: 'user-1',
    },
    reason: 'Spam / Scam',
    category: 'spam',
    description: 'This looks like a scam service trying to exploit international students.',
    createdAt: '2024-06-15 10:30',
    status: 'pending',
  },
  {
    id: '2',
    reportedContent: {
      id: 'reply-456',
      type: 'reply',
      content: 'You are so stupid for asking this question. Learn to Google!',
      author: 'Rude User',
    },
    reporter: {
      name: 'Maria Garcia',
      id: 'user-2',
    },
    reason: 'Harassment',
    category: 'harassment',
    description: 'This reply is hostile and violates community guidelines.',
    createdAt: '2024-06-15 09:15',
    status: 'reviewing',
    assignedTo: 'Admin Team',
  },
  {
    id: '3',
    reportedContent: {
      id: 'post-789',
      type: 'post',
      title: 'F-1 Visa Process Information',
      content: 'You can work full-time on F-1 visa without any restrictions...',
      author: 'Ahmed Hassan',
    },
    reporter: {
      name: 'Sarah Kim',
      id: 'user-5',
    },
    reason: 'Misinformation',
    category: 'misinformation',
    description: 'This post contains incorrect information about F-1 visa work restrictions.',
    createdAt: '2024-06-14 16:45',
    status: 'resolved',
    assignedTo: 'Admin Team',
    resolution: {
      action: 'Content hidden and author warned',
      note: 'Post contained misleading information about F-1 visa regulations. Author was notified and post was hidden.',
      resolvedBy: 'Admin',
      resolvedAt: '2024-06-14 18:20',
    },
  },
  {
    id: '4',
    reportedContent: {
      id: 'user-999',
      type: 'user',
      content: 'User profile contains offensive content',
      author: 'Problematic User',
    },
    reporter: {
      name: 'Yuki Tanaka',
      id: 'user-4',
    },
    reason: 'Inappropriate Content',
    category: 'inappropriate',
    description: 'User profile bio contains inappropriate language.',
    createdAt: '2024-06-13 14:20',
    status: 'rejected',
    assignedTo: 'Moderator',
    resolution: {
      action: 'No action required',
      note: 'After review, the content does not violate community guidelines.',
      resolvedBy: 'Moderator',
      resolvedAt: '2024-06-13 15:00',
    },
  },
  {
    id: '5',
    reportedContent: {
      id: 'post-555',
      type: 'post',
      title: 'Click here for free money!!!',
      content: 'Amazing opportunity! Click this link now!!!',
      author: 'Spammer',
    },
    reporter: {
      name: 'Multiple Users',
      id: 'system',
    },
    reason: 'Spam',
    category: 'spam',
    description: 'Obvious spam post reported by multiple users.',
    createdAt: '2024-06-15 11:00',
    status: 'reviewing',
    assignedTo: 'Admin Team',
  },
];

export function ReportManagement() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Report['status']>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | Report['category']>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reportedContent.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedContent.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleResolve = (reportId: string) => {
    setReports(reports.map(report =>
      report.id === reportId
        ? {
            ...report,
            status: 'resolved' as const,
            resolution: {
              action: 'Content removed and user warned',
              note: 'Report reviewed and appropriate action taken.',
              resolvedBy: 'Current Admin',
              resolvedAt: new Date().toISOString(),
            },
          }
        : report
    ));
  };

  const handleReject = (reportId: string) => {
    setReports(reports.map(report =>
      report.id === reportId
        ? {
            ...report,
            status: 'rejected' as const,
            resolution: {
              action: 'No action required',
              note: 'Report reviewed, no violation found.',
              resolvedBy: 'Current Admin',
              resolvedAt: new Date().toISOString(),
            },
          }
        : report
    ));
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setShowReportDetail(true);
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'reviewing':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: Report['category']) => {
    switch (category) {
      case 'spam':
        return 'bg-red-100 text-red-700';
      case 'harassment':
        return 'bg-orange-100 text-orange-700';
      case 'misinformation':
        return 'bg-purple-100 text-purple-700';
      case 'inappropriate':
        return 'bg-pink-100 text-pink-700';
      case 'other':
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewing':
        return <Eye className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewingCount = reports.filter(r => r.status === 'reviewing').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Report Management</h2>
        <p className="text-muted-foreground">Review and handle user reports and moderation actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Reports</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Under Review</p>
              <p className="text-3xl font-bold text-blue-600">{reviewingCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Resolved (30d)</p>
              <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
            >
              <option value="all">All Categories</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="misinformation">Misinformation</option>
              <option value="inappropriate">Inappropriate</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Report Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Reported Content
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium mb-1">{report.reason}</p>
                      <p className="text-muted-foreground text-xs">
                        Reported by: {report.reporter.name}
                      </p>
                      <p className="text-muted-foreground text-xs">{report.createdAt}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      {report.reportedContent.title && (
                        <p className="font-medium text-sm mb-1 line-clamp-1">
                          {report.reportedContent.title}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.reportedContent.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By: {report.reportedContent.author}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
                      {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(report)}
                        className="h-8 px-3 rounded-lg"
                      >
                        View
                      </Button>
                      {report.status === 'pending' || report.status === 'reviewing' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolve(report.id)}
                            className="h-8 px-3 rounded-lg text-green-600 hover:bg-green-50"
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(report.id)}
                            className="h-8 px-3 rounded-lg text-gray-600 hover:bg-gray-50"
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredReports.length} of {reports.length} reports
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {showReportDetail && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Report Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReportDetail(false)}
                className="rounded-lg"
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Report ID</p>
                  <p className="font-medium">{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reported</p>
                  <p className="font-medium">{selectedReport.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reporter</p>
                  <p className="font-medium">{selectedReport.reporter.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Report Reason */}
              <div>
                <h4 className="font-semibold mb-2">Reason</h4>
                <p className="text-lg text-[var(--bridge-blue)]">{selectedReport.reason}</p>
                <span className={`inline-flex mt-2 px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedReport.category)}`}>
                  {selectedReport.category}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedReport.description}</p>
              </div>

              {/* Reported Content */}
              <div className="border rounded-xl p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">Reported Content</h4>
                {selectedReport.reportedContent.title && (
                  <p className="font-medium mb-2">{selectedReport.reportedContent.title}</p>
                )}
                <p className="text-sm mb-2">{selectedReport.reportedContent.content}</p>
                <p className="text-xs text-muted-foreground">
                  By: {selectedReport.reportedContent.author} • Type: {selectedReport.reportedContent.type}
                </p>
              </div>

              {/* Resolution (if exists) */}
              {selectedReport.resolution && (
                <div className="border rounded-xl p-4 bg-green-50">
                  <h4 className="font-semibold mb-3 text-green-900">Resolution</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Action Taken:</p>
                      <p className="text-sm text-green-900">{selectedReport.resolution.action}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Note:</p>
                      <p className="text-sm text-green-900">{selectedReport.resolution.note}</p>
                    </div>
                    <div className="text-xs text-green-700">
                      Resolved by {selectedReport.resolution.resolvedBy} on {selectedReport.resolution.resolvedAt}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {(selectedReport.status === 'pending' || selectedReport.status === 'reviewing') && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 rounded-xl bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleResolve(selectedReport.id);
                      setShowReportDetail(false);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve Report
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      handleReject(selectedReport.id);
                      setShowReportDetail(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Report
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
