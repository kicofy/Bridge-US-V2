import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Card3D } from './Card3D';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { RichTextDisplay } from './RichTextDisplay';
import { askQuestionStream } from '../api/ai';
import { ApiError } from '../api/client';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedPosts?: { title: string; category: string }[];
  fullContent?: string; // 用于逐字展示的完整文本
}

interface AIQAPageProps {
  language?: string;
}

export function AIQAPage({ language = 'en' }: AIQAPageProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('ai.welcome'),
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = language === 'en' ? [
    'What documents do I need for F-1 visa extension?',
    'How to find affordable housing near campus?',
    'What health insurance options are available?',
    'How can I apply for OPT after graduation?',
    'What are the best part-time job options on campus?',
  ] : [
    '申请F-1签证延期需要哪些文件？',
    '如何找到校园附近的经济适用房？',
    '有哪些医疗保险选项？',
    '毕业后如何申请OPT？',
    '校园内有哪些好的兼职工作机会？',
  ];

  useEffect(() => {
    // Only auto-scroll when new内容溢出当前可视区域，避免滚动整个页面
    const viewport = viewportRef.current;
    if (!viewport) return;
    requestAnimationFrame(() => {
      const { scrollTop, clientHeight, scrollHeight } = viewport;
      const distanceToBottom = scrollHeight - clientHeight - scrollTop;
      // 若距离底部仍有内容（例如新增消息在可视外），才平滑滚动到底
      if (distanceToBottom > 8) {
        viewport.scrollTo({ top: scrollHeight, behavior: 'smooth' });
      }
    });
  }, [messages, isTyping]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      await askQuestionStream(messageContent, (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: (m.content || '') + chunk } : m
          )
        );
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'AI request failed';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'en'
          ? `Sorry, I couldn't complete that request. ${message}`
          : `抱歉，未能完成请求。${message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Card className="overflow-hidden rounded-2xl border shadow-sm">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-[var(--bridge-blue)] to-[var(--bridge-green)] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
          <h2 className="text-2xl">{t('ai.title')}</h2>
              <p className="text-sm text-white/80">
            {t('ai.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_300px]">
          {/* Chat area */}
          <div className="flex flex-col">
            {/* Messages */}
            <ScrollArea viewportRef={viewportRef} className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        message.role === 'user'
                          ? 'bg-gray-200'
                          : 'bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)]'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-gray-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Message content */}
                    <div
                      className={`max-w-[80%] space-y-2 ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-[var(--bridge-blue)] text-white'
                            : 'border bg-white'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <RichTextDisplay content={message.content} className="text-sm leading-relaxed" />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>

                      {/* Related posts */}
                      {message.relatedPosts && message.relatedPosts.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Lightbulb className="h-3 w-3" />
                            <span>{language === 'en' ? 'Related Trusted Posts' : '相关可信帖子'}</span>
                          </div>
                          {message.relatedPosts.map((post, idx) => (
                            <button
                              key={idx}
                              className="w-full rounded-lg border bg-white p-3 text-left text-sm transition-all hover:border-[var(--bridge-blue)] hover:shadow-sm"
                            >
                              <p className="mb-1">{post.title}</p>
                              <Badge variant="secondary" className="text-xs">
                                {post.category}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="px-2 text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString(language === 'en' ? 'en-US' : 'zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--bridge-blue)] to-[var(--bridge-green)]">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl border bg-white p-4">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--bridge-blue)] [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--bridge-blue)] [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--bridge-blue)]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
              <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                placeholder={t('ai.placeholder')}
                  className="min-h-[60px] resize-none rounded-xl"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="h-[60px] rounded-xl px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 rounded-xl bg-yellow-50 p-3 text-xs text-yellow-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {t('ai.disclaimer')}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar with suggested questions */}
          <div className="space-y-4">
            <div>
              <h4 className="mb-3 text-sm">{t('ai.suggested')}</h4>
              <div className="space-y-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(question)}
                    disabled={isTyping}
                    className="w-full rounded-xl border bg-white p-3 text-left text-sm transition-all hover:border-[var(--bridge-blue)] hover:shadow-sm disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <Card className="rounded-xl border bg-gradient-to-br from-[var(--bridge-blue-light)] to-white p-4">
              <h4 className="mb-3 text-sm">{t('ai.knowledgeBase')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('ai.trustedPosts')}
                  </span>
                  <span>2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('ai.verifiedAnswers')}
                  </span>
                  <span>1,523</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('ai.expertContributors')}
                  </span>
                  <span>412</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}