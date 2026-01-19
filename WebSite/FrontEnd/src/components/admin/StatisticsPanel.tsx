import { Users, FileText, Flag, TrendingUp, MessageSquare, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { getAdminStats } from '../../api/admin';

export function StatisticsPanel() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdminStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: 'Total Users',
        value: stats.summary.total_users,
        icon: Users,
        color: 'from-blue-500 to-blue-600',
      },
      {
        title: 'Total Posts',
        value: stats.summary.total_posts,
        icon: FileText,
        color: 'from-green-500 to-green-600',
      },
      {
        title: 'Pending Reports',
        value: stats.summary.pending_reports,
        icon: Flag,
        color: 'from-orange-500 to-orange-600',
      },
      {
        title: 'Active Today',
        value: stats.summary.active_today,
        icon: TrendingUp,
        color: 'from-purple-500 to-purple-600',
      },
      {
        title: 'Total Replies',
        value: stats.summary.total_replies,
        icon: MessageSquare,
        color: 'from-teal-500 to-teal-600',
      },
      {
        title: 'Resolved Reports',
        value: stats.summary.resolved_reports,
        icon: CheckCircle2,
        color: 'from-emerald-500 to-emerald-600',
      },
    ];
  }, [stats]);

  const userGrowthData = stats?.user_growth?.map((item: any) => ({
    month: item.label,
    users: item.value,
  })) ?? [];

  const contentActivityData = stats?.content_activity?.map((item: any) => ({
    day: item.label,
    posts: item.posts,
    replies: item.replies,
  })) ?? [];

  const categoryDistributionData = stats?.category_distribution?.map((item: any) => ({
    name: item.name,
    value: item.value,
  })) ?? [];
  const totalCategoryPosts = categoryDistributionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Statistics Dashboard</h2>
        <p className="text-muted-foreground">Overview of platform performance and metrics</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold">{loading ? '—' : stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '8px 12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="var(--bridge-blue)" 
                strokeWidth={3}
                dot={{ fill: 'var(--bridge-blue)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Content Activity Chart */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Content Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '8px 12px'
                }}
              />
              <Legend />
              <Bar dataKey="posts" fill="var(--bridge-blue)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="replies" fill="var(--bridge-green)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Posts by Category</h3>
          {totalCategoryPosts === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No categorized posts yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['var(--bridge-blue)', 'var(--bridge-green)', 'var(--trust-gold)', '#8B5CF6', '#F59E0B'][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '8px 12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
