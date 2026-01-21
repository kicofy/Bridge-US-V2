import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import ImageTool from '@editorjs/image';
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

const resolveFileUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') {
        return `${API_ORIGIN}${parsed.pathname}`;
      }
    } catch {
      return url;
    }
    return url;
  }
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

interface EditorJsEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EditorJsEditor({ value, onChange, placeholder }: EditorJsEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderId = useRef(`editorjs-${Math.random().toString(36).slice(2)}`);
  const initializedRef = useRef(false);
  const initialDataRef = useRef<any | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed && Array.isArray(parsed.blocks)) {
          initialDataRef.current = parsed;
        } else {
          initialDataRef.current = null;
        }
      } catch {
        initialDataRef.current = null;
      }
    }

    const { accessToken } = useAuthStore.getState();

    const editor = new EditorJS({
      holder: holderId.current,
      placeholder,
      data: initialDataRef.current ?? undefined,
      tools: {
        header: Header,
        list: List,
        quote: Quote,
        delimiter: Delimiter,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                if (!file.type || !file.type.startsWith('image/')) {
                  return { success: 0 };
                }
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(`${API_BASE_URL}/files/upload`, {
                  method: 'POST',
                  headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                  body: formData,
                });
                if (!response.ok) {
                  return { success: 0 };
                }
                const data = await response.json();
                const url = resolveFileUrl(data.url);
                return { success: 1, file: { url } };
              },
            },
          },
        },
      },
      onChange: async () => {
        const output = await editor.save();
        onChange(JSON.stringify(output));
      },
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
      initializedRef.current = false;
    };
  }, [onChange, placeholder]);

  useEffect(() => {
    if (!editorRef.current || !value) return;
    // Editor.js uses JSON data; updates are handled on re-mount only.
  }, [value]);

  return (
    <div className="rounded-xl border bg-background p-3 sm:p-4">
      <div id={holderId.current} />
    </div>
  );
}
