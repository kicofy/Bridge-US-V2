import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Ban, Eye, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { AdminUser, banUser, listAdminUsers, makeAdmin, unbanUser } from '../../api/admin';
import { useAuthStore } from '../../store/auth';

export function UserManagement() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listAdminUsers(50, 0)
      .then((items) => setUsers(items))
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
  };

  const canPromote = currentUser?.role === 'admin' && currentUser?.isRoot;

  const handleMakeAdmin = async (user: AdminUser) => {
    if (!canPromote || user.role === 'admin') {
      return;
    }
    await makeAdmin(user.id);
    setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, role: 'admin' } : item)));
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
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
                      {canPromote && user.role !== 'admin' && user.id !== currentUser?.userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMakeAdmin(user)}
                          className="h-8 w-8 p-0 rounded-lg"
                          title="Make admin"
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
                  {selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-2xl font-semibold">{selectedUser.email}</h4>
                  </div>
                  <div className="flex gap-2">
                    {getRoleBadge(selectedUser.role)}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    handleBanToggle(selectedUser);
                    setShowUserDetail(false);
                  }}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {selectedUser.status === 'banned' ? 'Unban' : 'Ban'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
