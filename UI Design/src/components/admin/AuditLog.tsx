import { useState, useMemo } from 'react';
import { 
  Shield, 
  Filter, 
  Download, 
  Eye, 
  X, 
  Calendar,
  User,
  Activity,
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  operatorRole: 'root' | 'admin' | 'moderator';
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'login' | 'access' | 'config';
  resource: string;
  resourceId: string;
  ipAddress: string;
  details: string;
  metadata?: {
    before?: any;
    after?: any;
    reason?: string;
  };
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: '2026-01-18T14:32:15Z',
    operator: 'admin@bridgeus.com',
    operatorRole: 'root',
    action: 'User Account Suspended',
    actionType: 'update',
    resource: 'User',
    resourceId: 'user_847',
    ipAddress: '192.168.1.100',
    details: 'Suspended user account for policy violation',
    metadata: {
      before: { status: 'active' },
      after: { status: 'suspended' },
      reason: 'Spam content posting'
    }
  },
  {
    id: '2',
    timestamp: '2026-01-18T13:45:22Z',
    operator: 'moderator.jane@bridgeus.com',
    operatorRole: 'admin',
    action: 'Post Deleted',
    actionType: 'delete',
    resource: 'Post',
    resourceId: 'post_1234',
    ipAddress: '192.168.1.101',
    details: 'Removed post containing inappropriate content',
    metadata: {
      reason: 'Violation of community guidelines'
    }
  },
  {
    id: '3',
    timestamp: '2026-01-18T12:18:45Z',
    operator: 'admin@bridgeus.com',
    operatorRole: 'root',
    action: 'Category Created',
    actionType: 'create',
    resource: 'Category',
    resourceId: 'cat_new_56',
    ipAddress: '192.168.1.100',
    details: 'Created new category "Finance & Banking"',
    metadata: {
      after: { name: 'Finance & Banking', slug: 'finance' }
    }
  },
  {
    id: '4',
    timestamp: '2026-01-18T11:05:33Z',
    operator: 'mod.alex@bridgeus.com',
    operatorRole: 'moderator',
    action: 'Report Reviewed',
    actionType: 'update',
    resource: 'Report',
    resourceId: 'report_789',
    ipAddress: '192.168.1.102',
    details: 'Marked report as resolved - no action needed',
    metadata: {
      before: { status: 'pending' },
      after: { status: 'resolved' }
    }
  },
  {
    id: '5',
    timestamp: '2026-01-18T10:22:11Z',
    operator: 'admin@bridgeus.com',
    operatorRole: 'root',
    action: 'Admin Panel Access',
    actionType: 'access',
    resource: 'AdminPanel',
    resourceId: 'session_xyz',
    ipAddress: '192.168.1.100',
    details: 'Logged into admin dashboard',
    metadata: {}
  },
  {
    id: '6',
    timestamp: '2026-01-18T09:15:44Z',
    operator: 'moderator.sarah@bridgeus.com',
    operatorRole: 'admin',
    action: 'User Role Updated',
    actionType: 'update',
    resource: 'User',
    resourceId: 'user_523',
    ipAddress: '192.168.1.103',
    details: 'Promoted user to verified status',
    metadata: {
      before: { verified: false },
      after: { verified: true }
    }
  },
  {
    id: '7',
    timestamp: '2026-01-17T18:42:28Z',
    operator: 'admin@bridgeus.com',
    operatorRole: 'root',
    action: 'System Configuration Updated',
    actionType: 'config',
    resource: 'SystemConfig',
    resourceId: 'config_general',
    ipAddress: '192.168.1.100',
    details: 'Updated content moderation settings',
    metadata: {
      before: { autoModeration: false },
      after: { autoModeration: true }
    }
  },
  {
    id: '8',
    timestamp: '2026-01-17T16:20:15Z',
    operator: 'mod.david@bridgeus.com',
    operatorRole: 'moderator',
    action: 'Comment Flagged',
    actionType: 'update',
    resource: 'Comment',
    resourceId: 'comment_9876',
    ipAddress: '192.168.1.104',
    details: 'Flagged comment for senior review',
    metadata: {
      reason: 'Potential harassment'
    }
  },
  {
    id: '9',
    timestamp: '2026-01-17T14:55:33Z',
    operator: 'admin@bridgeus.com',
    operatorRole: 'root',
    action: 'Tag Deleted',
    actionType: 'delete',
    resource: 'Tag',
    resourceId: 'tag_old_12',
    ipAddress: '192.168.1.100',
    details: 'Removed obsolete tag "deprecated-visa-type"',
    metadata: {}
  },
  {
    id: '10',
    timestamp: '2026-01-17T13:30:22Z',
    operator: 'moderator.jane@bridgeus.com',
    operatorRole: 'admin',
    action: 'Bulk Post Approval',
    actionType: 'update',
    resource: 'Posts',
    resourceId: 'batch_456',
    ipAddress: '192.168.1.101',
    details: 'Approved 15 posts in moderation queue',
    metadata: {
      count: 15
    }
  }
];

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  
  // Filters
  const [filterOperator, setFilterOperator] = useState<string>('all');
  const [filterActionType, setFilterActionType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique operators
  const operators = useMemo(() => {
    const unique = new Set(logs.map(log => log.operator));
    return Array.from(unique);
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          log.action.toLowerCase().includes(query) ||
          log.operator.toLowerCase().includes(query) ||
          log.resource.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Operator filter
      if (filterOperator !== 'all' && log.operator !== filterOperator) {
        return false;
      }

      // Action type filter
      if (filterActionType !== 'all' && log.actionType !== filterActionType) {
        return false;
      }

      // Date range filter
      if (filterDateRange !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filterDateRange === 'today' && daysDiff > 0) return false;
        if (filterDateRange === '7days' && daysDiff > 7) return false;
        if (filterDateRange === '30days' && daysDiff > 30) return false;
      }

      return true;
    });
  }, [logs, searchQuery, filterOperator, filterActionType, filterDateRange]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'create': return 'bg-green-100 text-green-700 border-green-200';
      case 'update': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delete': return 'bg-red-100 text-red-700 border-red-200';
      case 'access': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'config': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'login': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'root': return 'bg-red-100 text-red-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'moderator': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
            Complete history of all administrative actions and system events
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="rounded-xl"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border p-4 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by action, operator, resource, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-xl"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Operator
              </label>
              <select
                value={filterOperator}
                onChange={(e) => setFilterOperator(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
              >
                <option value="all">All Operators</option>
                {operators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Activity className="inline h-4 w-4 mr-1" />
                Action Type
              </label>
              <select
                value={filterActionType}
                onChange={(e) => setFilterActionType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
              >
                <option value="all">All Types</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="access">Access</option>
                <option value="config">Config</option>
                <option value="login">Login</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Time Range
              </label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{log.operator}</div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(log.operatorRole)}`}>
                          {log.operatorRole.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{log.action}</div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getActionTypeColor(log.actionType)}`}>
                          {log.actionType.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm">{log.resource}</div>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {log.resourceId}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="rounded-lg"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No audit logs found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Audit Log Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Action Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Action</label>
                    <div className="font-medium mt-1">{selectedLog.action}</div>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Type</label>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getActionTypeColor(selectedLog.actionType)}`}>
                        {selectedLog.actionType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Timestamp</label>
                    <div className="font-medium mt-1">{formatTimestamp(selectedLog.timestamp)}</div>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Resource</label>
                    <div className="font-medium mt-1">{selectedLog.resource}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-muted-foreground">Resource ID</label>
                    <code className="block mt-1 bg-muted px-3 py-2 rounded-lg text-xs">
                      {selectedLog.resourceId}
                    </code>
                  </div>
                </div>
              </div>

              {/* Operator Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Operator Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Email</label>
                    <div className="font-medium mt-1">{selectedLog.operator}</div>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Role</label>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(selectedLog.operatorRole)}`}>
                        {selectedLog.operatorRole.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-muted-foreground">IP Address</label>
                    <div className="font-medium mt-1">{selectedLog.ipAddress}</div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <h4 className="font-semibold mb-3">Details</h4>
                <div className="bg-muted/50 rounded-xl p-4 text-sm">
                  {selectedLog.details}
                </div>
              </div>

              {/* Metadata */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Metadata</h4>
                  <div className="space-y-3">
                    {selectedLog.metadata.before && (
                      <div>
                        <label className="text-sm text-muted-foreground">Before</label>
                        <pre className="mt-1 bg-red-50 border border-red-200 rounded-lg p-3 text-xs overflow-x-auto">
                          {JSON.stringify(selectedLog.metadata.before, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.metadata.after && (
                      <div>
                        <label className="text-sm text-muted-foreground">After</label>
                        <pre className="mt-1 bg-green-50 border border-green-200 rounded-lg p-3 text-xs overflow-x-auto">
                          {JSON.stringify(selectedLog.metadata.after, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.metadata.reason && (
                      <div>
                        <label className="text-sm text-muted-foreground">Reason</label>
                        <div className="mt-1 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                          {selectedLog.metadata.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
