import { Sparkles, Lightbulb, FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface AIAssistantProps {
  context?: 'search' | 'post';
  searchQuery?: string;
}

export function AIAssistant({ context = 'search', searchQuery }: AIAssistantProps) {
  const suggestedPosts = [
    {
      title: 'F-1 Visa Extension Timeline',
      reason: 'Highly rated and verified',
    },
    {
      title: 'Common OPT Application Mistakes',
      reason: 'Related to your search',
    },
    {
      title: 'STEM OPT Extension Guide',
      reason: 'Trending in Visa category',
    },
  ];

  return (
    <Card className="sticky top-20 rounded-2xl border bg-gradient-to-br from-white to-[var(--bridge-blue-light)]/30 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bridge-blue)] text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h4>AI Assistant</h4>
          <Badge variant="secondary" className="mt-1 rounded-md text-xs">
            Experimental
          </Badge>
        </div>
      </div>

      {/* Summary section */}
      {searchQuery && (
        <div className="mb-4 rounded-xl border bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Quick Summary</span>
          </div>
          <p className="text-sm">
            Based on trusted community posts, visa-related questions typically require:
            maintaining F-1 status, timely applications (90 days before expiry), and proper
            documentation. Always verify with official sources.
          </p>
        </div>
      )}

      {/* Suggested posts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          <span>Suggested Trusted Posts</span>
        </div>
        
        {suggestedPosts.map((post, index) => (
          <button
            key={index}
            className="w-full rounded-lg border bg-white p-3 text-left transition-all hover:border-[var(--bridge-blue)] hover:shadow-sm"
          >
            <p className="mb-1 text-sm">{post.title}</p>
            <p className="text-xs text-muted-foreground">{post.reason}</p>
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 rounded-lg bg-yellow-50 p-3">
        <p className="text-xs text-yellow-800">
          ⚠️ AI-generated summaries may contain errors. Always verify critical information
          with official sources or verified contributors.
        </p>
      </div>
    </Card>
  );
}
