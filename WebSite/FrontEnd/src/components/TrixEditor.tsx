import { useEffect, useId, useRef } from 'react';
import 'trix';
import 'trix/dist/trix.css';
import { useAuthStore } from '../store/auth';

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.bridge-us.org/api';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

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

    const handleFileAccept = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const file = detail?.file as File | undefined;
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        event.preventDefault();
        console.warn('[Trix] Unsupported file type:', file.type);
        return;
      }
      const { accessToken } = useAuthStore.getState();
      if (!accessToken) {
        event.preventDefault();
        console.warn('[Trix] Upload requires login');
      }
    };

    const uploadImageWithProgress = (file: File, onProgress: (percent: number) => void) => {
      const { accessToken } = useAuthStore.getState();
      return new Promise<{ id: string; url: string }>((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/files/upload`);
        if (accessToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        }

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error('Invalid upload response'));
            }
            return;
          }
          let message = xhr.statusText || 'Upload failed';
          try {
            const payload = JSON.parse(xhr.responseText);
            message = payload.message || payload.detail || message;
          } catch {
            // ignore
          }
          reject(new Error(message));
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });
    };

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

      let previewUrl: string | null = null;
      try {
        previewUrl = URL.createObjectURL(file);
        if (typeof attachment?.setAttributes === 'function') {
          attachment.setAttributes({ previewURL: previewUrl });
        }
        if (typeof attachment?.setUploadProgress === 'function') {
          attachment.setUploadProgress(0);
        }
        const { url } = await uploadImageWithProgress(file, (percent) => {
          if (typeof attachment?.setUploadProgress === 'function') {
            attachment.setUploadProgress(percent);
          }
        });
        if (typeof attachment?.setAttributes === 'function') {
          attachment.setAttributes({
            url,
            href: url,
          });
        }
        if (typeof attachment?.setUploadProgress === 'function') {
          attachment.setUploadProgress(100);
        }
      } catch (error) {
        console.error('[Trix] Image upload failed', error);
        if (typeof attachment?.remove === 'function') {
          attachment.remove();
        }
      } finally {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      }
    };

    editor.addEventListener('trix-file-accept', handleFileAccept as EventListener);
    editor.addEventListener('trix-change', handleChange);
    editor.addEventListener('trix-attachment-add', handleAttachmentAdd as EventListener);
    return () => {
      editor.removeEventListener('trix-file-accept', handleFileAccept as EventListener);
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
