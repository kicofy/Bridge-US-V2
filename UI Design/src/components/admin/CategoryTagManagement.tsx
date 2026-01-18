import { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Folder, Save, X } from 'lucide-react';
import { Button } from '../ui/button';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  order: number;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  category?: string;
  usageCount: number;
  createdAt: string;
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Visa & Immigration',
    slug: 'visa',
    description: 'F-1, J-1, OPT, CPT, and all visa-related topics',
    icon: '🛂',
    color: 'var(--bridge-blue)',
    postCount: 342,
    order: 1,
  },
  {
    id: '2',
    name: 'Housing',
    slug: 'housing',
    description: 'Finding accommodation, roommates, and housing advice',
    icon: '🏠',
    color: 'var(--bridge-green)',
    postCount: 289,
    order: 2,
  },
  {
    id: '3',
    name: 'Health & Insurance',
    slug: 'health',
    description: 'Health insurance, medical services, and wellness',
    icon: '🏥',
    color: 'var(--trust-gold)',
    postCount: 178,
    order: 3,
  },
  {
    id: '4',
    name: 'Campus Life',
    slug: 'campus',
    description: 'Student life, clubs, activities, and campus resources',
    icon: '🎓',
    color: '#8B5CF6',
    postCount: 256,
    order: 4,
  },
  {
    id: '5',
    name: 'Work & Internships',
    slug: 'work',
    description: 'Jobs, internships, CPT, OPT, and career advice',
    icon: '💼',
    color: '#F59E0B',
    postCount: 198,
    order: 5,
  },
];

const mockTags: TagItem[] = [
  { id: '1', name: 'F-1 Visa', slug: 'f1-visa', category: 'Visa & Immigration', usageCount: 156, createdAt: '2024-01-15' },
  { id: '2', name: 'OPT', slug: 'opt', category: 'Work & Internships', usageCount: 142, createdAt: '2024-01-20' },
  { id: '3', name: 'Off-Campus Housing', slug: 'off-campus-housing', category: 'Housing', usageCount: 98, createdAt: '2024-02-01' },
  { id: '4', name: 'Health Insurance', slug: 'health-insurance', category: 'Health & Insurance', usageCount: 87, createdAt: '2024-02-10' },
  { id: '5', name: 'Student Clubs', slug: 'student-clubs', category: 'Campus Life', usageCount: 76, createdAt: '2024-02-15' },
  { id: '6', name: 'CPT', slug: 'cpt', category: 'Work & Internships', usageCount: 65, createdAt: '2024-03-01' },
  { id: '7', name: 'Roommate Search', slug: 'roommate-search', category: 'Housing', usageCount: 54, createdAt: '2024-03-05' },
  { id: '8', name: 'I-20', slug: 'i20', category: 'Visa & Immigration', usageCount: 123, createdAt: '2024-01-25' },
];

export function CategoryTagManagement() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [tags, setTags] = useState<TagItem[]>(mockTags);
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  
  // Category editing states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    icon: '📁',
    color: 'var(--bridge-blue)',
    order: categories.length + 1,
  });

  // Tag editing states
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagFormData, setTagFormData] = useState<Partial<TagItem>>({
    name: '',
    slug: '',
    category: '',
  });

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      icon: '📁',
      color: 'var(--bridge-blue)',
      order: categories.length + 1,
    });
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData(category);
    setShowCategoryForm(true);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      // Update existing
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, ...categoryFormData } as Category : cat
      ));
    } else {
      // Add new
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryFormData.name!,
        slug: categoryFormData.slug!,
        description: categoryFormData.description!,
        icon: categoryFormData.icon!,
        color: categoryFormData.color!,
        order: categoryFormData.order!,
        postCount: 0,
      };
      setCategories([...categories, newCategory]);
    }
    setShowCategoryForm(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  // Tag handlers
  const handleAddTag = () => {
    setEditingTag(null);
    setTagFormData({
      name: '',
      slug: '',
      category: '',
    });
    setShowTagForm(true);
  };

  const handleEditTag = (tag: TagItem) => {
    setEditingTag(tag);
    setTagFormData(tag);
    setShowTagForm(true);
  };

  const handleSaveTag = () => {
    if (editingTag) {
      // Update existing
      setTags(tags.map(tag =>
        tag.id === editingTag.id ? { ...tag, ...tagFormData } as TagItem : tag
      ));
    } else {
      // Add new
      const newTag: TagItem = {
        id: Date.now().toString(),
        name: tagFormData.name!,
        slug: tagFormData.slug!,
        category: tagFormData.category,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTags([...tags, newTag]);
    }
    setShowTagForm(false);
  };

  const handleDeleteTag = (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setTags(tags.filter(tag => tag.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Category & Tag Management</h2>
        <p className="text-muted-foreground">Organize content with categories and tags</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-[var(--bridge-blue)] text-[var(--bridge-blue)]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Folder className="inline h-4 w-4 mr-2" />
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tags'
                  ? 'border-[var(--bridge-blue)] text-[var(--bridge-blue)]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tag className="inline h-4 w-4 mr-2" />
              Tags ({tags.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Manage content categories and their properties
                </p>
                <Button
                  onClick={handleAddCategory}
                  className="rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="space-y-3">
                {categories.sort((a, b) => a.order - b.order).map((category) => (
                  <div
                    key={category.id}
                    className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{category.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Slug: <code className="bg-muted px-2 py-0.5 rounded">{category.slug}</code></span>
                            <span>Posts: {category.postCount}</span>
                            <span>Order: {category.order}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="h-8 w-8 p-0 rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-8 w-8 p-0 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Manage tags for better content organization
                </p>
                <Button
                  onClick={handleAddTag}
                  className="rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tags.sort((a, b) => b.usageCount - a.usageCount).map((tag) => (
                  <div
                    key={tag.id}
                    className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{tag.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Slug: <code className="bg-muted px-2 py-0.5 rounded">{tag.slug}</code>
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTag(tag)}
                          className="h-7 w-7 p-0 rounded-lg"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id)}
                          className="h-7 w-7 p-0 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      {tag.category && (
                        <span className="px-2 py-1 rounded-lg bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)]">
                          {tag.category}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        Used {tag.usageCount} times
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategoryForm(false)}
                className="rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="e.g., Visa & Immigration"
                  className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  placeholder="e.g., visa"
                  className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={categoryFormData.icon}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                    placeholder="🛂"
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={categoryFormData.order}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveCategory}
                  className="flex-1 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
                  disabled={!categoryFormData.name || !categoryFormData.slug}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Category
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Form Modal */}
      {showTagForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTagForm(false)}
                className="rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tag Name *</label>
                <input
                  type="text"
                  value={tagFormData.name}
                  onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                  placeholder="e.g., F-1 Visa"
                  className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  value={tagFormData.slug}
                  onChange={(e) => setTagFormData({ ...tagFormData, slug: e.target.value })}
                  placeholder="e.g., f1-visa"
                  className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category (Optional)</label>
                <select
                  value={tagFormData.category}
                  onChange={(e) => setTagFormData({ ...tagFormData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                >
                  <option value="">No category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveTag}
                  className="flex-1 rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
                  disabled={!tagFormData.name || !tagFormData.slug}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Tag
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTagForm(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
