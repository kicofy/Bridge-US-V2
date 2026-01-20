import { useEffect, useId, useRef } from 'react';
import 'trix';
import 'trix/dist/trix.css';
import { useAuthStore } from '../store/auth';

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.bridge-us.org/api';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');
const API_ORIGIN = (() => {
  try {
    const parsed = new URL(API_BASE_URL);
    if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') {
      return 'https://api.bridge-us.org';
    }
    return parsed.origin;
  } catch {
    const fallback = API_BASE_URL.replace(/\/api\/?$/, '');
    if (fallback.includes('127.0.0.1') || fallback.includes('localhost')) {
      return 'https://api.bridge-us.org';
    }
    return fallback;
  }
})();

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
  const composingRef = useRef(false);
  const pendingChangeRef = useRef(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleFileAccept = (event: Event) => {
      const file = (event as unknown as { file?: File }).file;
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
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
      if (composingRef.current) {
        pendingChangeRef.current = true;
        return;
      }
      const html = inputRef.current?.value ?? '';
      lastValueRef.current = html;
      onChange(html);
      pendingChangeRef.current = false;
    };

    const handleCompositionStart = () => {
      composingRef.current = true;
    };

    const handleCompositionEnd = () => {
      composingRef.current = false;
      if (pendingChangeRef.current) {
        requestAnimationFrame(() => handleChange());
      }
    };

    const handleDocumentCompositionStart = (event: Event) => {
      const target = event.target as Node | null;
      if (target && editor.contains(target)) {
        composingRef.current = true;
      }
    };

    const handleDocumentCompositionEnd = (event: Event) => {
      const target = event.target as Node | null;
      if (target && editor.contains(target)) {
        composingRef.current = false;
        if (pendingChangeRef.current) {
          requestAnimationFrame(() => handleChange());
        }
      }
    };

    const handleAttachmentAdd = async (event: Event) => {
      const attachment = (event as unknown as { attachment?: { file?: File } }).attachment;
      const file = attachment?.file;
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        if (typeof (attachment as any)?.remove === 'function') {
          (attachment as any).remove();
        }
        return;
      }

      let previewUrl: string | null = null;
      try {
        previewUrl = URL.createObjectURL(file);
        if (typeof (attachment as any)?.setAttribute === 'function') {
          (attachment as any).setAttribute('previewable', true);
        }
        if (typeof (attachment as any)?.setPreviewURL === 'function') {
          (attachment as any).setPreviewURL(previewUrl);
        }
        if (typeof attachment?.setUploadProgress === 'function') {
          attachment.setUploadProgress(0);
        }
        const { url } = await uploadImageWithProgress(file, (percent) => {
          if (typeof attachment?.setUploadProgress === 'function') {
            attachment.setUploadProgress(percent);
          }
        });
        let resolvedUrl = url;
        if (/^https?:\/\//i.test(resolvedUrl)) {
          try {
            const parsed = new URL(resolvedUrl);
            if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') {
              resolvedUrl = `${API_ORIGIN}${parsed.pathname}`;
            }
          } catch {
            // ignore parse errors
          }
        } else {
          resolvedUrl = `${API_ORIGIN}${resolvedUrl.startsWith('/') ? resolvedUrl : `/${resolvedUrl}`}`;
        }
        if (typeof attachment?.setAttributes === 'function') {
          attachment.setAttributes({
            url: resolvedUrl,
            href: resolvedUrl,
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
    editor.addEventListener('compositionstart', handleCompositionStart);
    editor.addEventListener('compositionend', handleCompositionEnd);
    document.addEventListener('compositionstart', handleDocumentCompositionStart, true);
    document.addEventListener('compositionend', handleDocumentCompositionEnd, true);
    return () => {
      editor.removeEventListener('trix-file-accept', handleFileAccept as EventListener);
      editor.removeEventListener('trix-change', handleChange);
      editor.removeEventListener('trix-attachment-add', handleAttachmentAdd as EventListener);
      editor.removeEventListener('compositionstart', handleCompositionStart);
      editor.removeEventListener('compositionend', handleCompositionEnd);
      document.removeEventListener('compositionstart', handleDocumentCompositionStart, true);
      document.removeEventListener('compositionend', handleDocumentCompositionEnd, true);
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
