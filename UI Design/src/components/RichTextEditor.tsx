import { useState, useRef } from 'react';
import { Bold, Italic, Link, Image, List, ListOrdered, Heading2 } from 'lucide-react';
import { Button } from './ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const insertMarkdown = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const text = selectedText || placeholder;
    
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newText = `${before}${prefix}${text}${suffix}${after}`;
    
    onChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      const newPos = start + prefix.length + text.length;
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleBold = () => {
    insertMarkdown('**', '**', 'bold text');
  };

  const handleItalic = () => {
    insertMarkdown('*', '*', 'italic text');
  };

  const handleHeading = () => {
    insertMarkdown('\n## ', '', 'Heading');
  };

  const handleBulletList = () => {
    insertMarkdown('\n- ', '', 'List item');
  };

  const handleNumberedList = () => {
    insertMarkdown('\n1. ', '', 'List item');
  };

  const handleImageInsert = () => {
    if (!imageUrl.trim()) return;
    insertMarkdown(`\n![Image](${imageUrl})\n`, '', '');
    setImageUrl('');
    setShowImageInput(false);
  };

  const handleLinkInsert = () => {
    if (!linkUrl.trim()) return;
    const text = linkText.trim() || linkUrl;
    insertMarkdown(`[${text}](${linkUrl})`, '', '');
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
          onClick={handleBold}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHeading}
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
          onClick={handleBulletList}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-background"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNumberedList}
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
        <div className="flex gap-2 rounded-xl border bg-muted/30 p-3">
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
          >
            Insert
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowImageInput(false);
              setImageUrl('');
            }}
          >
            Cancel
          </Button>
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

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[200px] sm:min-h-[300px] rounded-xl border bg-background p-3 sm:p-4 text-sm sm:text-base resize-y focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)] font-mono"
      />
    </div>
  );
}