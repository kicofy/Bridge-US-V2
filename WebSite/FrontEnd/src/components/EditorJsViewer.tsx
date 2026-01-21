import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import ImageTool from '@editorjs/image';

interface EditorJsViewerProps {
  data: unknown;
  className?: string;
}

export function EditorJsViewer({ data, className = '' }: EditorJsViewerProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderId = useRef(`editorjs-viewer-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: holderId.current,
      readOnly: true,
      data: data as any,
      tools: {
        header: Header,
        list: List,
        quote: Quote,
        delimiter: Delimiter,
        image: ImageTool,
      },
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [data]);

  return <div id={holderId.current} className={className} />;
}
