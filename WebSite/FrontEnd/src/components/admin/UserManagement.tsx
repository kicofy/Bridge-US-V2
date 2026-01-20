import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Ban, Eye, Shield, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  AdminMe,
  AdminUser,
  AdminUserDetail,
  banUser,
  getAdminMe,
  getAdminUserDetail,
  listAdminUsers,
  makeAdmin,
  setUserRole,
  unbanUser,
} from '../../api/admin';
import { format } from 'date-fns';

export function UserManagement() {
  const [adminInfo, setAdminInfo] = useState<AdminMe | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AdminUserDetail | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([listAdminUsers(50, 0), getAdminMe()])
      .then(([items, me]) => {
        setUsers(items);
        setAdminInfo(me);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, filterStatus]);

  const handleBanToggle = async (user: AdminUser) => {
    if (user.status === 'banned') {
      await unbanUser(user.id);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, status: 'active' } : item)));
    } else {
      await banUser(user.id);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, status: 'banned' } : item)));
    }
    if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: user.status === 'banned' ? 'active' : 'banned' } : prev));
        setSelectedDetail((prev) => (prev ? { ...prev, status: user.status === 'banned' ? 'active' : 'banned' } : prev));
    }
  };

  const canPromote = adminInfo?.role === 'admin' && adminInfo?.is_root;

  const handleMakeAdmin = async (user: AdminUser) => {
    if (!canPromote || user.role === 'admin') {
      return;
    }
    await makeAdmin(user.id);
    setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, role: 'admin' } : item)));
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailLoading(true);
    setShowUserDetail(true);
    getAdminUserDetail(user.id)
      .then(setSelectedDetail)
      .catch(() => setSelectedDetail(null))
      .finally(() => setDetailLoading(false));
  };

  const getStatusColor = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'banned':
        return 'bg-red-100 text-red-700';
    }
  };

  const getRoleBadge = (role: AdminUser['role']) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-100 text-purple-700">Admin</span>;
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
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.email}</p>
                        </div>
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
                        onClick={() => handleBanToggle(user)}
                        className="h-8 w-8 p-0 rounded-lg"
                        title={user.status === 'banned' ? 'Unban' : 'Ban'}
                      >
                        <Ban className={`h-4 w-4 ${user.status === 'banned' ? 'text-red-600' : ''}`} />
                      </Button>
                      {canPromote && user.id !== adminInfo?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMakeAdmin(user)}
                          className="h-8 w-8 p-0 rounded-lg"
                          title={user.role === 'admin' ? 'Admin' : 'Make admin'}
                        >
                          <Shield className="h-4 w-4 text-purple-600" />
                        </Button>
                      )}
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
            {loading ? 'Loading users...' : `Showing ${filteredUsers.length} of ${users.length} users`}
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">User Detail</p>
                <h3 className="text-xl font-semibold">{selectedUser.email}</h3>
              </div>
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
                <div className="flex flex-col md:flex-row gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)] flex items-center justify-center text-white text-3xl font-semibold">
                  {selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-2xl font-semibold">{selectedUser.email}</h4>
                      {selectedDetail?.display_name && (
                        <span className="text-sm text-muted-foreground">({selectedDetail.display_name})</span>
                      )}
                    {getRoleBadge(selectedDetail?.role ?? selectedUser.role)}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDetail?.status ?? selectedUser.status)}`}>
                      {(selectedDetail?.status ?? selectedUser.status).charAt(0).toUpperCase() +
                        (selectedDetail?.status ?? selectedUser.status).slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created:{' '}
                    {selectedDetail?.created_at
                      ? format(new Date(selectedDetail.created_at), 'yyyy-MM-dd HH:mm')
                      : '—'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last login:{' '}
                    {selectedDetail?.last_login_at
                      ? format(new Date(selectedDetail.last_login_at), 'yyyy-MM-dd HH:mm')
                      : '—'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Language: {selectedDetail?.language_preference ?? '—'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => handleBanToggle(selectedUser)}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {(selectedDetail?.status ?? selectedUser.status) === 'banned' ? 'Unban' : 'Ban'}
                    </Button>
                    {adminInfo?.is_root && selectedUser.id !== adminInfo.id && (
                      <select
                        value={selectedDetail?.role ?? selectedUser.role}
                        onChange={async (e) => {
                          const next = e.target.value as 'user' | 'admin';
                          await setUserRole(selectedUser.id, next);
                          setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, role: next } : u)));
                          setSelectedUser((prev) => (prev ? { ...prev, role: next } : prev));
                          setSelectedDetail((prev) => (prev ? { ...prev, role: next } : prev));
                        }}
                        className="rounded-lg border px-3 py-2 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Posts" value={selectedDetail?.posts_count ?? '—'} />
                <StatCard label="Replies" value={selectedDetail?.replies_count ?? '—'} />
                <StatCard label="Reports filed" value={selectedDetail?.reports_filed ?? '—'} />
                <StatCard label="Reports received" value={selectedDetail?.reports_received ?? '—'} />
              </div>

              {detailLoading && <p className="text-sm text-muted-foreground">Loading details...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}
