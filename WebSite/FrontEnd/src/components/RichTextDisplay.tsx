import { useEffect, useMemo, useState } from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  const isHtml = useMemo(() => /<\/?[a-z][\s\S]*>/i.test(content), [content]);
  const [formattedContent, setFormattedContent] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (isHtml) {
      return;
    }
    const parseMarkdown = (text: string): JSX.Element[] => {
      const lines = text.split('\n');
      const elements: JSX.Element[] = [];
      let listItems: string[] = [];
      let orderedListItems: string[] = [];
      let currentListType: 'bullet' | 'ordered' | null = null;

      const flushList = () => {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-3 pl-4">
              {listItems.map((item, idx) => (
                <li key={idx}>{parseInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
          listItems = [];
        }
        if (orderedListItems.length > 0) {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-3 pl-4">
              {orderedListItems.map((item, idx) => (
                <li key={idx}>{parseInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
          orderedListItems = [];
        }
        currentListType = null;
      };

      lines.forEach((line, lineIdx) => {
        // Check for images: ![alt text](url)
        const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imageMatch) {
          flushList();
          elements.push(
            <div key={`img-${lineIdx}`} className="my-4">
              <img
                src={imageMatch[2]}
                alt={imageMatch[1] || 'Image'}
                className="max-w-full h-auto rounded-xl border shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="p-4 border border-dashed rounded-xl bg-muted text-muted-foreground text-sm text-center">
                        Unable to load image: ${imageMatch[2]}
                      </div>
                    `;
                  }
                }}
              />
            </div>
          );
          return;
        }

        // Check for headings: ## Heading
        const headingMatch = line.match(/^##\s+(.+)$/);
        if (headingMatch) {
          flushList();
          elements.push(
            <h2 key={`h2-${lineIdx}`} className="text-lg sm:text-xl font-semibold mt-6 mb-3">
              {parseInlineMarkdown(headingMatch[1])}
            </h2>
          );
          return;
        }

        // Check for bullet list: - item
        const bulletMatch = line.match(/^-\s+(.+)$/);
        if (bulletMatch) {
          if (currentListType !== 'bullet') {
            flushList();
            currentListType = 'bullet';
          }
          listItems.push(bulletMatch[1]);
          return;
        }

        // Check for ordered list: 1. item
        const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
        if (orderedMatch) {
          if (currentListType !== 'ordered') {
            flushList();
            currentListType = 'ordered';
          }
          orderedListItems.push(orderedMatch[1]);
          return;
        }

        // Empty line
        if (line.trim() === '') {
          flushList();
          elements.push(<div key={`space-${lineIdx}`} className="h-3" />);
          return;
        }

        // Regular paragraph
        flushList();
        elements.push(
          <p key={`p-${lineIdx}`} className="leading-relaxed my-2">
            {parseInlineMarkdown(line)}
          </p>
        );
      });

      // Flush any remaining list
      flushList();

      return elements;
    };

    const parseInlineMarkdown = (text: string): (string | JSX.Element)[] => {
      const parts: (string | JSX.Element)[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // Check for links: [text](url)
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch && linkMatch.index !== undefined) {
          // Add text before the link
          if (linkMatch.index > 0) {
            const beforeText = remaining.substring(0, linkMatch.index);
            parts.push(...parseInlineFormatting(beforeText, key++));
          }
          // Add the link
          parts.push(
            <a
              key={`link-${key++}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--bridge-blue)] hover:underline font-medium"
            >
              {linkMatch[1]}
            </a>
          );
          remaining = remaining.substring(linkMatch.index + linkMatch[0].length);
          continue;
        }

        // No more special syntax, parse remaining text for bold/italic
        parts.push(...parseInlineFormatting(remaining, key++));
        break;
      }

      return parts;
    };

    const parseInlineFormatting = (text: string, keyPrefix: number): (string | JSX.Element)[] => {
      const parts: (string | JSX.Element)[] = [];
      let remaining = text;
      let key = keyPrefix;

      while (remaining.length > 0) {
        // Check for bold: **text**
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(remaining.substring(0, boldMatch.index));
          }
          parts.push(
            <strong key={`bold-${key++}`} className="font-semibold">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
          continue;
        }

        // Check for italic: *text*
        const italicMatch = remaining.match(/\*([^*]+)\*/);
        if (italicMatch && italicMatch.index !== undefined) {
          if (italicMatch.index > 0) {
            parts.push(remaining.substring(0, italicMatch.index));
          }
          parts.push(
            <em key={`italic-${key++}`} className="italic">
              {italicMatch[1]}
            </em>
          );
          remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
          continue;
        }

        // No more formatting
        parts.push(remaining);
        break;
      }

      return parts;
    };

    setFormattedContent(parseMarkdown(content));
  }, [content, isHtml]);

  const sanitizedHtml = useMemo(() => {
    if (!isHtml) {
      return '';
    }
    try {
      const doc = new DOMParser().parseFromString(content, 'text/html');
      const disallowed = doc.querySelectorAll('script, style');
      disallowed.forEach((node) => node.remove());
      doc.querySelectorAll('*').forEach((node) => {
        [...node.attributes].forEach((attr) => {
          const name = attr.name.toLowerCase();
          const value = attr.value;
          if (name.startsWith('on')) {
            node.removeAttribute(attr.name);
            return;
          }
          if ((name === 'href' || name === 'src') && /^javascript:/i.test(value)) {
            node.removeAttribute(attr.name);
          }
        });
      });
      return doc.body.innerHTML;
    } catch {
      return content;
    }
  }, [content, isHtml]);

  if (isHtml) {
    return (
      <div
        className={`prose prose-sm sm:prose max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return <div className={`prose prose-sm sm:prose max-w-none ${className}`}>{formattedContent}</div>;
}
