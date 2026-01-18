import { useState } from 'react';
import { Search, Filter, MoreVertical, Shield, Ban, CheckCircle2, Mail, Edit, Eye } from 'lucide-react';
import { Button } from '../ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  verified: boolean;
  joinedDate: string;
  postsCount: number;
  repliesCount: number;
  helpfulScore: number;
  accuracyRate: number;
  lastActive: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Chen',
    email: 'john.chen@example.com',
    role: 'user',
    status: 'active',
    verified: true,
    joinedDate: '2024-01-15',
    postsCount: 42,
    repliesCount: 156,
    helpfulScore: 89,
    accuracyRate: 94.5,
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    role: 'moderator',
    status: 'active',
    verified: true,
    joinedDate: '2023-11-20',
    postsCount: 78,
    repliesCount: 342,
    helpfulScore: 156,
    accuracyRate: 96.8,
    lastActive: '1 hour ago',
  },
  {
    id: '3',
    name: 'Ahmed Hassan',
    email: 'ahmed.h@example.com',
    role: 'user',
    status: 'active',
    verified: true,
    joinedDate: '2024-02-10',
    postsCount: 23,
    repliesCount: 87,
    helpfulScore: 45,
    accuracyRate: 91.2,
    lastActive: '5 hours ago',
  },
  {
    id: '4',
    name: 'Yuki Tanaka',
    email: 'yuki.t@example.com',
    role: 'user',
    status: 'suspended',
    verified: false,
    joinedDate: '2024-03-05',
    postsCount: 8,
    repliesCount: 12,
    helpfulScore: 3,
    accuracyRate: 67.3,
    lastActive: '2 days ago',
  },
  {
    id: '5',
    name: 'Sarah Kim',
    email: 'sarah.kim@example.com',
    role: 'user',
    status: 'active',
    verified: true,
    joinedDate: '2024-01-28',
    postsCount: 56,
    repliesCount: 203,
    helpfulScore: 112,
    accuracyRate: 93.7,
    lastActive: '30 minutes ago',
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' as const }
        : user
    ));
  };

  const handleBanUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'banned' ? 'active' : 'banned' as const }
        : user
    ));
  };

  const handleVerifyUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, verified: !user.verified }
        : user
    ));
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-700';
      case 'banned':
        return 'bg-red-100 text-red-700';
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-100 text-purple-700">Admin</span>;
      case 'moderator':
        return <span className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700">Moderator</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700">User</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">User Management</h2>
        <p className="text-muted-foreground">Manage users, permissions, and account status</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">More Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contribution
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)] flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {user.verified && (
                            <CheckCircle2 className="h-4 w-4 text-[var(--trust-verified)]" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium">{user.postsCount} posts</p>
                      <p className="text-muted-foreground">{user.repliesCount} replies</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium">Score: {user.helpfulScore}</p>
                      <p className="text-muted-foreground">Accuracy: {user.accuracyRate}%</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                        className="h-8 w-8 p-0 rounded-lg"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerifyUser(user.id)}
                        className="h-8 w-8 p-0 rounded-lg"
                        title={user.verified ? "Remove verification" : "Verify user"}
                      >
                        <Shield className={`h-4 w-4 ${user.verified ? 'text-[var(--trust-verified)]' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuspendUser(user.id)}
                        className="h-8 w-8 p-0 rounded-lg"
                        title={user.status === 'suspended' ? "Unsuspend" : "Suspend"}
                      >
                        <Ban className={`h-4 w-4 ${user.status === 'suspended' ? 'text-yellow-600' : ''}`} />
                      </Button>
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
            Showing {filteredUsers.length} of {users.length} users
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

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">User Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserDetail(false)}
                className="rounded-lg"
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)] flex items-center justify-center text-white text-3xl font-semibold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-2xl font-semibold">{selectedUser.name}</h4>
                    {selectedUser.verified && (
                      <CheckCircle2 className="h-6 w-6 text-[var(--trust-verified)]" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">{selectedUser.email}</p>
                  <div className="flex gap-2">
                    {getRoleBadge(selectedUser.role)}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Posts</p>
                  <p className="text-2xl font-bold">{selectedUser.postsCount}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Replies</p>
                  <p className="text-2xl font-bold">{selectedUser.repliesCount}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Helpful Score</p>
                  <p className="text-2xl font-bold text-[var(--bridge-green)]">{selectedUser.helpfulScore}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                  <p className="text-2xl font-bold text-[var(--bridge-blue)]">{selectedUser.accuracyRate}%</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-muted-foreground">Joined Date</span>
                  <span className="font-medium">{selectedUser.joinedDate}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-muted-foreground">Last Active</span>
                  <span className="font-medium">{selectedUser.lastActive}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => handleVerifyUser(selectedUser.id)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {selectedUser.verified ? 'Remove Verification' : 'Verify User'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    handleSuspendUser(selectedUser.id);
                    setShowUserDetail(false);
                  }}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {selectedUser.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
