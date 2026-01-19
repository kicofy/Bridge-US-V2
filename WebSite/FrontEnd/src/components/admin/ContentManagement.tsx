import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { listPosts, PostResponse } from '../../api/posts';
import { listAllReplies, ReplyResponse } from '../../api/replies';
import { adminHidePost, adminRestorePost, adminHideReply, adminRestoreReply } from '../../api/admin';

interface Content {
  id: string;
  type: 'post' | 'reply';
  title?: string;
  content: string;
  author: {
    name: string;
    verified: boolean;
  };
  category?: string;
  tags?: string[];
  createdAt: string;
  replies?: number;
  helpful: number;
  notHelpful: number;
  status: 'published' | 'hidden';
  parentPost?: string;
}

export function ContentManagement() {
  const [content, setContent] = useState<Content[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'post' | 'reply'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'hidden'>('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showContentDetail, setShowContentDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      listPosts({ language: 'en', limit: 50, offset: 0, includeHidden: true, auth: true }),
      listAllReplies({ limit: 50, offset: 0 }),
    ])
      .then(([posts, replies]) => {
        const mappedPosts = posts.map(mapPost);
        const mappedReplies = replies.map(mapReply);
        setContent([...mappedPosts, ...mappedReplies]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load content'))
      .finally(() => setLoading(false));
  }, []);

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesSearch =
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [content, searchQuery, filterType, filterStatus]);

  const handleToggleVisibility = async (item: Content) => {
    if (item.type === 'post') {
      if (item.status === 'hidden') {
        await adminRestorePost(item.id);
        setContent((prev) =>
          prev.map((entry) => (entry.id === item.id ? { ...entry, status: 'published' } : entry))
        );
      } else {
        await adminHidePost(item.id);
        setContent((prev) =>
          prev.map((entry) => (entry.id === item.id ? { ...entry, status: 'hidden' } : entry))
        );
      }
    } else {
      if (item.status === 'hidden') {
        await adminRestoreReply(item.id);
        setContent((prev) =>
          prev.map((entry) => (entry.id === item.id ? { ...entry, status: 'published' } : entry))
        );
      } else {
        await adminHideReply(item.id);
        setContent((prev) =>
          prev.map((entry) => (entry.id === item.id ? { ...entry, status: 'hidden' } : entry))
        );
      }
    }
  };

  const handleViewDetails = (item: Content) => {
    setSelectedContent(item);
    setShowContentDetail(true);
  };

  const mapPost = (item: PostResponse): Content => {
    const timestamp = item.published_at || item.created_at || '';
    return {
      id: item.id,
      type: 'post',
      title: item.title,
      content: item.content,
      author: {
        name: item.author_name || `User ${item.author_id.slice(0, 6)}`,
        verified: false,
      },
      category: item.category_id ?? undefined,
      tags: item.tags,
      createdAt: timestamp ? new Date(timestamp).toLocaleString() : '',
      replies: 0,
      helpful: item.helpful_count,
      notHelpful: 0,
      status: item.status === 'hidden' ? 'hidden' : 'published',
    };
  };

  const mapReply = (item: ReplyResponse): Content => {
    const timestamp = item.created_at || '';
    return {
      id: item.id,
      type: 'reply',
      content: item.content,
      author: {
        name: `User ${item.author_id.slice(0, 6)}`,
        verified: false,
      },
      createdAt: timestamp ? new Date(timestamp).toLocaleString() : '',
      helpful: item.helpful_count,
      notHelpful: 0,
      status: item.status === 'hidden' ? 'hidden' : 'published',
      parentPost: item.post_id,
    };
  };

  const getStatusColor = (status: Content['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'hidden':
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Content Management</h2>
        <p className="text-muted-foreground">Manage posts, replies, and content visibility</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, content, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
            >
              <option value="all">All Types</option>
              <option value="post">Posts Only</option>
              <option value="reply">Replies Only</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Engagement
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
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      {item.type === 'post' && (
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium line-clamp-1">{item.title}</p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                      {item.category && (
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 text-xs rounded-lg bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)]">
                            {item.category}
                          </span>
                          {item.tags?.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-xs rounded-lg bg-muted text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        item.type === 'post' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium">{item.author.name}</p>
                      <p className="text-xs text-muted-foreground">{item.createdAt}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {item.type === 'post' && (
                        <p className="text-muted-foreground mb-1">
                          <MessageSquare className="inline h-3 w-3 mr-1" />
                          {item.replies} replies
                        </p>
                      )}
                      <p className="text-green-600">👍 {item.helpful}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                        className="h-8 w-8 p-0 rounded-lg"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(item)}
                        className="h-8 w-8 p-0 rounded-lg"
                        title={item.status === 'hidden' ? 'Show' : 'Hide'}
                      >
                        {item.status === 'hidden' ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-yellow-600" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredContent.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No content found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading content...' : `Showing ${filteredContent.length} of ${content.length} items`}
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

      {/* Content Detail Modal */}
      {showContentDetail && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Content Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContentDetail(false)}
                className="rounded-lg"
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Content Header */}
              {selectedContent.type === 'post' && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-2xl font-semibold">{selectedContent.title}</h4>
                  </div>
                  {selectedContent.category && (
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 text-sm rounded-lg bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)]">
                        {selectedContent.category}
                      </span>
                      {selectedContent.tags?.map((tag) => (
                        <span key={tag} className="px-3 py-1 text-sm rounded-lg bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium">{selectedContent.author.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedContent.createdAt}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedContent.status)}`}>
                  {selectedContent.status}
                </span>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <p>{selectedContent.content}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedContent.type === 'post' && (
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Replies</p>
                    <p className="text-2xl font-bold">{selectedContent.replies}</p>
                  </div>
                )}
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Helpful</p>
                  <p className="text-2xl font-bold text-green-600">{selectedContent.helpful}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    handleToggleVisibility(selectedContent);
                    setShowContentDetail(false);
                  }}
                >
                  {selectedContent.status === 'hidden' ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Restore
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

