import { useEffect, useId, useRef } from 'react';
import 'trix';
import 'trix/dist/trix.css';
import { uploadImage } from '../api/files';

interface TrixEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TrixEditor({ value, onChange, placeholder }: TrixEditorProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLElement | null>(null);
  const lastValueRef = useRef<string>('');

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleChange = () => {
      const html = inputRef.current?.value ?? '';
      lastValueRef.current = html;
      onChange(html);
    };

    const handleAttachmentAdd = async (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const attachment = detail?.attachment;
      const file = attachment?.file as File | undefined;
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        return;
      }

      try {
        const { url } = await uploadImage(file);
        if (typeof attachment?.setAttributes === 'function') {
          attachment.setAttributes({
            url,
            href: url,
          });
        }
      } catch {
        if (typeof attachment?.remove === 'function') {
          attachment.remove();
        }
      }
    };

    editor.addEventListener('trix-change', handleChange);
    editor.addEventListener('trix-attachment-add', handleAttachmentAdd as EventListener);
    return () => {
      editor.removeEventListener('trix-change', handleChange);
      editor.removeEventListener('trix-attachment-add', handleAttachmentAdd as EventListener);
    };
  }, [onChange]);

  useEffect(() => {
    const editor = editorRef.current as (HTMLElement & { editor?: { loadHTML: (html: string) => void } }) | null;
    const input = inputRef.current;
    if (!editor || !input) return;

    const nextValue = value || '';
    if (nextValue === lastValueRef.current) return;

    if (input.value !== nextValue) {
      input.value = nextValue;
    }

    const applyValue = () => {
      editor.editor?.loadHTML(nextValue);
      lastValueRef.current = nextValue;
    };

    if (editor.editor) {
      applyValue();
      return;
    }

    editor.addEventListener('trix-initialize', applyValue, { once: true });
  }, [value]);

  return (
    <div className="rounded-xl border bg-background">
      <input ref={inputRef} id={inputId} type="hidden" defaultValue={value} />
      <trix-editor
        ref={editorRef}
        input={inputId}
        placeholder={placeholder}
        className="trix-content min-h-[240px] rounded-xl border-0 bg-transparent p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
      />
    </div>
  );
}
