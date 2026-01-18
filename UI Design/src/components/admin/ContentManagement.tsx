import { useState } from 'react';
import { Search, Filter, Eye, EyeOff, Pin, Trash2, MoreVertical, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';

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
  status: 'published' | 'hidden' | 'deleted';
  pinned?: boolean;
  parentPost?: string;
}

const mockContent: Content[] = [
  {
    id: '1',
    type: 'post',
    title: 'F-1 Visa Application Process Guide',
    content: 'Here is a comprehensive guide on how to apply for an F-1 visa...',
    author: { name: 'John Chen', verified: true },
    category: 'Visa',
    tags: ['F1-Visa', 'Application'],
    createdAt: '2024-06-10',
    replies: 23,
    helpful: 45,
    notHelpful: 2,
    status: 'published',
    pinned: true,
  },
  {
    id: '2',
    type: 'post',
    title: 'Finding Affordable Housing Near Campus',
    content: 'I wanted to share some tips about finding housing...',
    author: { name: 'Maria Garcia', verified: true },
    category: 'Housing',
    tags: ['Housing', 'Budget'],
    createdAt: '2024-06-12',
    replies: 18,
    helpful: 32,
    notHelpful: 1,
    status: 'published',
    pinned: false,
  },
  {
    id: '3',
    type: 'reply',
    content: 'Thanks for this guide! I just got my visa approved following these steps.',
    author: { name: 'Ahmed Hassan', verified: false },
    parentPost: 'F-1 Visa Application Process Guide',
    createdAt: '2024-06-11',
    helpful: 12,
    notHelpful: 0,
    status: 'published',
  },
  {
    id: '4',
    type: 'post',
    title: 'Inappropriate Content Example',
    content: 'This is spam content that should be hidden...',
    author: { name: 'Spam User', verified: false },
    category: 'Other',
    tags: [],
    createdAt: '2024-06-13',
    replies: 1,
    helpful: 0,
    notHelpful: 15,
    status: 'hidden',
    pinned: false,
  },
  {
    id: '5',
    type: 'post',
    title: 'Health Insurance Options for International Students',
    content: 'Detailed comparison of different health insurance plans...',
    author: { name: 'Sarah Kim', verified: true },
    category: 'Health',
    tags: ['Health', 'Insurance'],
    createdAt: '2024-06-09',
    replies: 34,
    helpful: 67,
    notHelpful: 3,
    status: 'published',
    pinned: true,
  },
];

export function ContentManagement() {
  const [content, setContent] = useState<Content[]>(mockContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'post' | 'reply'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'hidden' | 'deleted'>('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showContentDetail, setShowContentDetail] = useState(false);

  const filteredContent = content.filter(item => {
    const matchesSearch = (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleVisibility = (id: string) => {
    setContent(content.map(item =>
      item.id === id
        ? { ...item, status: item.status === 'hidden' ? 'published' : 'hidden' as const }
        : item
    ));
  };

  const handleTogglePin = (id: string) => {
    setContent(content.map(item =>
      item.id === id
        ? { ...item, pinned: !item.pinned }
        : item
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      setContent(content.map(item =>
        item.id === id
          ? { ...item, status: 'deleted' as const }
          : item
      ));
    }
  };

  const handleViewDetails = (item: Content) => {
    setSelectedContent(item);
    setShowContentDetail(true);
  };

  const getStatusColor = (status: Content['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'hidden':
        return 'bg-yellow-100 text-yellow-700';
      case 'deleted':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Content Management</h2>
        <p className="text-muted-foreground">Manage posts, replies, and content visibility</p>
      </div>

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
              <option value="deleted">Deleted</option>
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
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium line-clamp-1">{item.title}</p>
                            {item.pinned && (
                              <Pin className="h-4 w-4 text-[var(--bridge-blue)] fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                          {item.category && (
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-0.5 text-xs rounded-lg bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)]">
                                {item.category}
                              </span>
                              {item.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 text-xs rounded-lg bg-muted text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      {item.type === 'reply' && (
                        <>
                          <p className="text-sm line-clamp-2 mb-1">{item.content}</p>
                          {item.parentPost && (
                            <p className="text-xs text-muted-foreground">
                              Reply to: {item.parentPost}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                      item.type === 'post' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
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
                      <p className="text-red-600">👎 {item.notHelpful}</p>
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
                      {item.type === 'post' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(item.id)}
                          className="h-8 w-8 p-0 rounded-lg"
                          title={item.pinned ? "Unpin" : "Pin"}
                        >
                          <Pin className={`h-4 w-4 ${item.pinned ? 'fill-current text-[var(--bridge-blue)]' : ''}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(item.id)}
                        className="h-8 w-8 p-0 rounded-lg"
                        title={item.status === 'hidden' ? "Show" : "Hide"}
                      >
                        {item.status === 'hidden' ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-yellow-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
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
            Showing {filteredContent.length} of {content.length} items
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
                    {selectedContent.pinned && (
                      <Pin className="h-5 w-5 text-[var(--bridge-blue)] fill-current" />
                    )}
                  </div>
                  {selectedContent.category && (
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 text-sm rounded-lg bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)]">
                        {selectedContent.category}
                      </span>
                      {selectedContent.tags?.map(tag => (
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
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Not Helpful</p>
                  <p className="text-2xl font-bold text-red-600">{selectedContent.notHelpful}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Score</p>
                  <p className="text-2xl font-bold text-[var(--bridge-blue)]">
                    {((selectedContent.helpful / (selectedContent.helpful + selectedContent.notHelpful)) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedContent.type === 'post' && (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      handleTogglePin(selectedContent.id);
                      setShowContentDetail(false);
                    }}
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    {selectedContent.pinned ? 'Unpin' : 'Pin'} Post
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    handleToggleVisibility(selectedContent.id);
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
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleDelete(selectedContent.id);
                    setShowContentDetail(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
