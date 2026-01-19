import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag, Folder, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  CategoryResponse,
} from '../../api/categories';
import { createTag, deleteTag, listTags, TagResponse, updateTag } from '../../api/tags';

export function CategoryTagManagement() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    sort_order: 0,
    status: 'active',
  });

  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagFormData, setTagFormData] = useState({
    name: '',
    slug: '',
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([listCategories(), listTags()])
      .then(([categoryItems, tagItems]) => {
        setCategories(categoryItems);
        setTags(tagItems);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      sort_order: categories.length + 1,
      status: 'active',
    });
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: CategoryResponse) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      sort_order: category.sort_order,
      status: category.status,
    });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async () => {
    if (editingCategory) {
      const updated = await updateCategory(editingCategory.id, categoryFormData);
      setCategories((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const created = await createCategory(categoryFormData);
      setCategories((prev) => [...prev, created]);
    }
    setShowCategoryForm(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAddTag = () => {
    setEditingTag(null);
    setTagFormData({ name: '', slug: '' });
    setShowTagForm(true);
  };

  const handleEditTag = (tag: TagResponse) => {
    setEditingTag(tag);
    setTagFormData({ name: tag.name, slug: tag.slug });
    setShowTagForm(true);
  };

  const handleSaveTag = async () => {
    if (editingTag) {
      const updated = await updateTag(editingTag.id, tagFormData);
      setTags((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const created = await createTag(tagFormData);
      setTags((prev) => [...prev, created]);
    }
    setShowTagForm(false);
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      await deleteTag(id);
      setTags((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Category & Tag Management</h2>
        <p className="text-muted-foreground">Organize content with categories and tags</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

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
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : 'Manage content categories'}
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
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{category.name}</h4>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>
                            Slug: <code className="bg-muted px-2 py-0.5 rounded">{category.slug}</code>
                          </span>
                          <span>Order: {category.sort_order}</span>
                          <span>Status: {category.status}</span>
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
                {categories.length === 0 && !loading && (
                  <div className="text-sm text-muted-foreground">No categories found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Manage tags for better organization</p>
                <Button
                  onClick={handleAddTag}
                  className="rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
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
                  </div>
                ))}
                {tags.length === 0 && !loading && (
                  <div className="text-sm text-muted-foreground">No tags found</div>
                )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={categoryFormData.sort_order}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, sort_order: parseInt(e.target.value || '0') })
                    }
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={categoryFormData.status}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
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
              <h3 className="text-xl font-semibold">{editingTag ? 'Edit Tag' : 'Add New Tag'}</h3>
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

