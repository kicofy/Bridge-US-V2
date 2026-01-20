import { useEffect, useId, useRef } from 'react';
import 'trix';
import 'trix/dist/trix.css';

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

    editor.addEventListener('trix-change', handleChange);
    return () => {
      editor.removeEventListener('trix-change', handleChange);
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
