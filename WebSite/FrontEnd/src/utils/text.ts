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
          parts.push(data.text);
        } else if (Array.isArray(data.items)) {
          parts.push(data.items.join(' '));
        }
      }
      return parts.join(' ').replace(/\s+/g, ' ').trim();
    }
  } catch {
    // ignore JSON parsing failures
  }

  // If HTML-like content, strip tags using DOMParser (browser-safe).
  if (trimmed.includes('<') && trimmed.includes('>')) {
    try {
      const doc = new DOMParser().parseFromString(trimmed, 'text/html');
      return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    } catch {
      // fall through to markdown stripping
    }
  }

  // Basic markdown stripping
  return trimmed
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[`*_>#-]/g, '') // markdown chars
    .replace(/\s+/g, ' ')
    .trim();
}

export function previewText(input: string, maxLength: number = 160): string {
  const plain = stripRichText(input);
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}...` : plain;
}

