import { Users, FileText, Flag, TrendingUp, MessageSquare, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for charts
const userGrowthData = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1850 },
  { month: 'Mar', users: 2400 },
  { month: 'Apr', users: 3200 },
  { month: 'May', users: 4100 },
  { month: 'Jun', users: 5200 },
];

const contentActivityData = [
  { day: 'Mon', posts: 45, replies: 120 },
  { day: 'Tue', posts: 52, replies: 145 },
  { day: 'Wed', posts: 38, replies: 98 },
  { day: 'Thu', posts: 61, replies: 167 },
  { day: 'Fri', posts: 48, replies: 132 },
  { day: 'Sat', posts: 35, replies: 89 },
  { day: 'Sun', posts: 28, replies: 72 },
];

const categoryDistributionData = [
  { name: 'Visa', value: 320, color: 'var(--bridge-blue)' },
  { name: 'Housing', value: 280, color: 'var(--bridge-green)' },
  { name: 'Health', value: 180, color: 'var(--trust-gold)' },
  { name: 'Campus Life', value: 240, color: '#8B5CF6' },
  { name: 'Work', value: 150, color: '#F59E0B' },
];

export function StatisticsPanel() {
  const stats = [
    {
      title: 'Total Users',
      value: '5,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Posts',
      value: '1,847',
      change: '+8.3%',
      trend: 'up',
      icon: FileText,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Pending Reports',
      value: '23',
      change: '-15.2%',
      trend: 'down',
      icon: Flag,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Active Today',
      value: '892',
      change: '+5.7%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Replies',
      value: '8,421',
      change: '+18.9%',
      trend: 'up',
      icon: MessageSquare,
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Resolved Reports',
      value: '156',
      change: '+22.1%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Statistics Dashboard</h2>
        <p className="text-muted-foreground">Overview of platform performance and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
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
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-lg ${
                    stat.trend === 'up'
                      ? 'text-green-700 bg-green-50'
                      : 'text-red-700 bg-red-50'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold">{stat.value}</p>
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Average Response Time</span>
                <span className="font-semibold">2.3 hours</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-gradient-to-r from-[var(--bridge-blue)] to-[var(--bridge-green)] h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Report Resolution Rate</span>
                <span className="font-semibold">94.2%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">User Satisfaction</span>
                <span className="font-semibold">4.7/5.0</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Active Moderators</span>
                <span className="font-semibold">12/15</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[var(--bridge-blue)]">87%</p>
                  <p className="text-xs text-muted-foreground">Verified Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--bridge-green)]">92%</p>
                  <p className="text-xs text-muted-foreground">Quality Posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
