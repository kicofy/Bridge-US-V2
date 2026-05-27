export function stripRichText(input: string): string {
  if (!input) {
    return '';
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && Array.isArray(parsed.blocks)) {
      const parts: string[] = [];
      for (const block of parsed.blocks) {
        const data = block?.data ?? {};
        if (typeof data.text === 'string') {
          parts.push(stripInlineFormatting(data.text));
        } else if (Array.isArray(data.items)) {
          parts.push(data.items.map(readEditorJsListItem).filter(Boolean).join(' '));
        } else if (typeof data.caption === 'string') {
          parts.push(stripInlineFormatting(data.caption));
        }
      }
      return normalizeText(parts.join(' '));
    }
  } catch {
    // ignore JSON parsing failures
  }

  // If HTML-like content, strip tags using DOMParser (browser-safe).
  if (hasHtmlMarkup(trimmed)) {
    return stripInlineFormatting(trimmed);
  }

  // Basic markdown stripping
  return normalizeText(trimmed
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[`*_>#-]/g, '')); // markdown chars
}

export function previewText(input: string, maxLength: number = 160): string {
  const plain = stripRichText(input);
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}...` : plain;
}

function readEditorJsListItem(item: unknown): string {
  if (typeof item === 'string') {
    return stripInlineFormatting(item);
  }
  if (!item || typeof item !== 'object') {
    return '';
  }

  const record = item as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of ['content', 'text']) {
    const value = record[key];
    if (typeof value === 'string') {
      parts.push(stripInlineFormatting(value));
    }
  }
  if (Array.isArray(record.items)) {
    parts.push(record.items.map(readEditorJsListItem).filter(Boolean).join(' '));
  }
  return normalizeText(parts.join(' '));
}

function stripInlineFormatting(input: string): string {
  if (!input) {
    return '';
  }

  const htmlWithSpacing = input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr|td|th)>/gi, ' ');

  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(htmlWithSpacing, 'text/html');
      return normalizeText(doc.body.textContent || '');
    } catch {
      // fall through to lightweight stripping
    }
  }

  return normalizeText(decodeHtmlEntities(htmlWithSpacing.replace(/<[^>]*>/g, ' ')));
}

function hasHtmlMarkup(input: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(input) || /&(?:[a-z]+|#\d+|#x[\da-f]+);/i.test(input);
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

function normalizeText(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}
