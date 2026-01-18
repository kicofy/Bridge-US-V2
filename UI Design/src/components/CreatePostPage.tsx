import { useState } from 'react';
import { ArrowLeft, Eye, Send, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RichTextEditor } from './RichTextEditor';
import { RichTextDisplay } from './RichTextDisplay';
import { use3DHover } from '../hooks/use3DHover';

interface CreatePostPageProps {
  onBack: () => void;
  onPublish: (post: NewPost) => void;
}

export interface NewPost {
  title: string;
  category: string;
  content: string;
  tags: string[];
}

const CATEGORIES = [
  { id: 'visa', label: 'Visa & Immigration', color: 'bg-[var(--category-visa)]' },
  { id: 'housing', label: 'Housing', color: 'bg-[var(--category-housing)]' },
  { id: 'health', label: 'Health & Wellness', color: 'bg-[var(--category-health)]' },
  { id: 'campus', label: 'Campus Life', color: 'bg-[var(--category-campus)]' },
  { id: 'work', label: 'Work & Career', color: 'bg-[var(--category-work)]' },
];

const POPULAR_TAGS = [
  'F-1 Visa', 'OPT', 'Housing', 'Insurance', 'Campus Jobs', 
  'Study Tips', 'Transportation', 'Food', 'Culture', 'Banking'
];

export function CreatePostPage({ onBack, onPublish }: CreatePostPageProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.trim().length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onPublish({
      title: title.trim(),
      category,
      content: content.trim(),
      tags,
    });
  };

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 5) {
      setTags([...tags, normalizedTag]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(customTag);
    }
  };

  const selectedCategoryInfo = CATEGORIES.find(c => c.id === category);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="rounded-xl gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl">Create New Post</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Share your knowledge with the BridgeUS community
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a clear, descriptive title"
              className={`w-full rounded-xl border bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)] ${
                errors.title ? 'border-red-500' : ''
              }`}
              maxLength={200}
            />
            {errors.title && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.title}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/200 characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                    category === cat.id
                      ? 'border-[var(--bridge-blue)] bg-[var(--bridge-blue-light)] text-[var(--bridge-blue)]'
                      : 'border-border hover:border-[var(--bridge-blue)]/30 hover:bg-muted/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.category}</span>
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Content <span className="text-red-600">*</span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2 rounded-lg h-auto py-1.5 px-3 text-xs sm:text-sm"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>

            {showPreview ? (
              <div className="min-h-[250px] sm:min-h-[300px] rounded-xl border bg-muted/30 p-3 sm:p-4 overflow-x-auto">
                {content ? (
                  <RichTextDisplay content={content} />
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm">
                    No content to preview
                  </p>
                )}
              </div>
            ) : (
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Share your experience, tips, or ask questions. You can use Markdown formatting for better readability."
              />
            )}

            {errors.content && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.content}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {content.length} characters • Supports Markdown formatting
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Tags <span className="text-muted-foreground font-normal">(optional, max 5)</span>
            </label>

            {/* Selected tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1.5 pl-2.5 sm:pl-3 pr-1.5 sm:pr-2 py-1 sm:py-1.5 rounded-full text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-background rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Popular tags */}
            {tags.length < 5 && (
              <>
                <p className="text-xs text-muted-foreground">Popular tags:</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.filter(tag => !tags.includes(tag)).slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-full border border-border hover:border-[var(--bridge-blue)] hover:bg-[var(--bridge-blue-light)] text-xs transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Custom tag input */}
            {tags.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={handleCustomTagKeyPress}
                  placeholder="Add custom tag..."
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
                  maxLength={20}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag(customTag)}
                  className="rounded-lg shrink-0"
                  disabled={!customTag.trim()}
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="rounded-xl bg-[var(--bridge-blue-light)]/50 border border-[var(--bridge-blue)]/20 p-3 sm:p-4">
            <h4 className="text-sm font-semibold mb-2 text-[var(--bridge-blue)]">
              Community Guidelines
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 pl-4">
              <li className="list-disc">Be respectful and helpful to fellow international students</li>
              <li className="list-disc">Share accurate information based on your experience</li>
              <li className="list-disc">Avoid sharing personal sensitive information</li>
              <li className="list-disc">Use appropriate categories and tags for better discoverability</li>
            </ul>
          </div>
        </div>

        {/* Footer - Sticky on mobile */}
        <div className="sticky bottom-0 border-t bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="hidden sm:flex flex-1 items-center">
              {selectedCategoryInfo && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <Badge className={`${selectedCategoryInfo.color} text-white`}>
                    {selectedCategoryInfo.label}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="rounded-xl flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                className="rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90 text-white gap-2 flex-1 sm:flex-none"
              >
                <Send className="h-4 w-4" />
                Publish Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}