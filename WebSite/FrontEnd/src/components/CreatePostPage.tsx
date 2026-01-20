import { useState } from 'react';
import { ArrowLeft, Send, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RichTextEditor } from './RichTextEditor';
import { RichTextDisplay } from './RichTextDisplay';
import { use3DHover } from '../hooks/use3DHover';
import { createPost } from '../api/posts';
import { ApiError } from '../api/client';
import { useTranslation } from 'react-i18next';
import { stripRichText } from '../utils/text';

interface CreatePostPageProps {
  onBack: () => void;
  onPublish: (post: NewPost) => void;
  language: string;
}

export interface NewPost {
  title: string;
  category: string;
  content: string;
  tags: string[];
}

const POPULAR_TAGS = [
  'F-1 Visa', 'OPT', 'Housing', 'Insurance', 'Campus Jobs', 
  'Study Tips', 'Transportation', 'Food', 'Culture', 'Banking'
];

export function CreatePostPage({ onBack, onPublish, language }: CreatePostPageProps) {
  const { t } = useTranslation();
  const categories = [
    { id: 'visa', label: t('categories.visa'), color: 'bg-[var(--category-visa)]' },
    { id: 'housing', label: t('categories.housing'), color: 'bg-[var(--category-housing)]' },
    { id: 'health', label: t('categories.health'), color: 'bg-[var(--category-health)]' },
    { id: 'campus', label: t('categories.campus'), color: 'bg-[var(--category-campus)]' },
    { id: 'work', label: t('categories.work'), color: 'bg-[var(--category-work)]' },
  ];
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = t('createPost.titleRequired');
    } else if (title.trim().length < 10) {
      newErrors.title = t('createPost.titleMin');
    }

    if (!category) {
      newErrors.category = t('createPost.categoryRequired');
    }

    const plainContent = stripRichText(content);
    if (!plainContent) {
      newErrors.content = t('createPost.contentRequired');
    } else if (plainContent.length < 50) {
      newErrors.content = t('createPost.contentMin');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    const normalizedTags = [
      category,
      ...tags.map((tag) => tag.trim()).filter(Boolean),
    ].filter(Boolean);

    try {
      await createPost({
        title: normalizedTitle,
        content: normalizedContent,
        tags: normalizedTags,
        language,
        status: 'pending',
        category_id: null,
      });
      onPublish({
        title: normalizedTitle,
        category,
        content: normalizedContent,
        tags,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to publish post';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
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

  const selectedCategoryInfo = categories.find(c => c.id === category);

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
          <span className="hidden sm:inline">{t('actions.back')}</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl">{t('createPost.title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            {t('createPost.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('createPost.titleLabel')} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('createPost.titlePlaceholder')}
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
        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {submitError}
          </div>
        )}
            <p className="text-xs text-muted-foreground text-right">
              {t('createPost.characters', { count: title.length })}
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('createPost.categoryLabel')} <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
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

          {/* Content Editor + Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {t('createPost.contentLabel')} <span className="text-red-600">*</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showPreview}
                  onChange={(e) => setShowPreview(e.target.checked)}
                  className="h-4 w-4 rounded border border-border"
                />
                {t('createPost.preview')}
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder={t('createPost.contentPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('createPost.contentCount', { count: content.length })}
                </p>
                {errors.content && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.content}</span>
                  </div>
                )}
              </div>

              {showPreview && (
                <div className="rounded-xl border bg-muted/30 p-3 sm:p-4">
                  <p className="text-xs text-muted-foreground mb-2">{t('createPost.preview')}</p>
                  <div className="min-h-[200px]">
                    <RichTextDisplay content={content || t('createPost.noContent')} className="text-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {t('createPost.tagsLabel')} <span className="text-muted-foreground font-normal">({t('createPost.tagsHint')})</span>
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
                <p className="text-xs text-muted-foreground">{t('createPost.popularTags')}</p>
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
                  placeholder={t('createPost.customTagPlaceholder')}
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
                  {t('createPost.addTag')}
                </Button>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="rounded-xl bg-[var(--bridge-blue-light)]/50 border border-[var(--bridge-blue)]/20 p-3 sm:p-4">
            <h4 className="text-sm font-semibold mb-2 text-[var(--bridge-blue)]">
              {t('createPost.guidelinesTitle')}
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 pl-4">
              <li className="list-disc">{t('createPost.guideline1')}</li>
              <li className="list-disc">{t('createPost.guideline2')}</li>
              <li className="list-disc">{t('createPost.guideline3')}</li>
              <li className="list-disc">{t('createPost.guideline4')}</li>
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
                {t('actions.cancel')}
              </Button>
              <Button
                onClick={handlePublish}
                className="rounded-xl bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90 text-white gap-2 flex-1 sm:flex-none"
                disabled={submitting}
              >
                <Send className="h-4 w-4" />
                {submitting ? t('actions.publishing') : t('actions.publish')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}