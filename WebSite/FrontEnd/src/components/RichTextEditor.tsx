import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Link, Image, List, ListOrdered, Heading2 } from 'lucide-react';
import { Button } from './ui/button';
import { uploadImage } from '../api/files';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isFocused) {
      return;
    }
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value, isFocused]);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(editor.innerHTML);
  };

  const execCommand = (command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    emitChange();
  };

  const handleImageInsert = () => {
    if (!imageUrl.trim()) return;
    execCommand('insertImage', imageUrl.trim());
    setImageUrl('');
    setShowImageInput(false);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setImageUploading(true);
    setImageError(null);
    try {
      const uploaded = await uploadImage(imageFile);
      execCommand('insertImage', uploaded.url);
      setImageFile(null);
      setShowImageInput(false);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleLinkInsert = () => {
    if (!linkUrl.trim()) return;
    if (linkText.trim()) {
      execCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
    } else {
      execCommand('createLink', linkUrl.trim());
    }
    setLinkUrl('');
    setLinkText('');
    setShowLinkInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 rounded-xl border bg-muted/30 p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('formatBlock', 'h2')}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageInput(!showImageInput)}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      {/* Image URL input */}
      {showImageInput && (
        <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleImageInsert();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleImageInsert}
              className="rounded-lg bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
              disabled={!imageUrl.trim()}
            >
              Insert
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
                setImageError(null);
              }}
              className="text-sm"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleImageUpload}
              className="rounded-lg bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
              disabled={!imageFile || imageUploading}
            >
              {imageUploading ? 'Uploading...' : 'Upload & Insert'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowImageInput(false);
                setImageUrl('');
                setImageFile(null);
                setImageError(null);
              }}
            >
              Cancel
            </Button>
          </div>
          {imageError && <p className="text-xs text-red-600">{imageError}</p>}
        </div>
      )}

      {/* Link input */}
      {showLinkInput && (
        <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Link text (optional)"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
          />
          <div className="flex gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL..."
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLinkInsert();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleLinkInsert}
              className="rounded-lg bg-[var(--bridge-blue)] hover:bg-[var(--bridge-blue)]/90"
            >
              Insert
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
                setLinkText('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Editable area */}
      <div className="relative">
        {!value && !isFocused && placeholder && (
          <div className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="min-h-[200px] sm:min-h-[300px] rounded-xl border bg-background p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            emitChange();
          }}
        />
      </div>
    </div>
  );
}

