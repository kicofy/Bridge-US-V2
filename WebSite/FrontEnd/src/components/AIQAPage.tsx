import { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, Send, Bot, User, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Card3D } from './Card3D';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { RichTextDisplay } from './RichTextDisplay';
import { askQuestion } from '../api/ai';
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
  const typingTimers = useRef<number[]>([]);

  const questionPool =
    language === 'en'
      ? [
          'What documents do I need for F-1 visa extension?',
          'How can I apply for OPT after graduation?',
          'What is the difference between CPT and OPT?',
          'How do I find affordable housing near campus?',
          'How can I build credit as an international student?',
          'What health insurance options are available?',
          'How do I open a US bank account?',
          'What are common on-campus job options?',
          'How do I file taxes as an F-1 student?',
          'What should I know before signing a lease?',
          'How can I handle a roommate conflict?',
          'What should I prepare for a visa interview?',
          'How can I renew my I-20 and keep status active?',
          'What should I do if my F-1 visa is expiring?',
          'How do I get a Social Security Number (SSN)?',
          'What is the difference between J-1 and F-1 status?',
          'How can I get a driver’s license as an international student?',
          'What are common scams targeting international students?',
          'How do I find a good academic advisor or DSO?',
          'What should I do if I lose my passport or I-94?',
        ]
      : language === 'zh'
      ? [
          '申请F-1签证延期需要哪些文件？',
          '毕业后如何申请OPT？',
          'CPT和OPT有什么区别？',
          '如何找到校园附近的经济适用房？',
          '国际学生如何建立信用记录？',
          '有哪些医疗保险选项？',
          '如何在美国开银行账户？',
          '校园内有哪些常见兼职？',
          'F-1学生如何报税？',
          '签租约前需要注意什么？',
          '如何处理室友矛盾？',
          '面签需要准备什么？',
          'I-20 到期如何续签并保持身份？',
          'F-1 签证快过期了怎么办？',
          '如何申请社会安全号（SSN）？',
          'J-1 与 F-1 有什么区别？',
          '国际学生如何考取美国驾照？',
          '国际学生常见骗局有哪些？',
          '如何联系或找到合适的 DSO/导师？',
          '护照或 I-94 丢了该怎么办？',
        ]
      : language === 'ko'
      ? [
          'F-1 비자 연장을 위해 어떤 서류가 필요한가요?',
          '졸업 후 OPT 신청은 어떻게 하나요?',
          'CPT와 OPT의 차이는 무엇인가요?',
          '캠퍼스 근처 저렴한 주거를 찾는 방법은?',
          '유학생이 신용점수를 쌓는 방법은?',
          '이용 가능한 건강보험 옵션은 무엇인가요?',
          '미국 은행 계좌는 어떻게 여나요?',
          '캠퍼스에서 할 수 있는 파트타임 일자리는?',
          'F-1 학생 세금 신고는 어떻게 하나요?',
          '임대 계약 전 확인해야 할 점은?',
          '룸메이트 갈등을 어떻게 해결하나요?',
          '비자 인터뷰 준비는 무엇이 필요한가요?',
          'I-20 갱신과 신분 유지 방법은?',
          'F-1 비자 만료가 다가오면 어떻게 하나요?',
          'SSN(사회보장번호) 신청 방법은?',
          'J-1과 F-1의 차이는 무엇인가요?',
          '유학생 운전면허는 어떻게 취득하나요?',
          '유학생 대상 사기는 어떤 게 있나요?',
          'DSO/지도교수와 상담하는 방법은?',
          '여권이나 I-94를 분실하면 어떻게 하나요?',
        ]
      : language === 'vi'
      ? [
          'Cần giấy tờ gì để gia hạn visa F-1?',
          'Cách nộp OPT sau khi tốt nghiệp?',
          'Khác nhau giữa CPT và OPT là gì?',
          'Làm sao tìm nhà ở giá phải chăng gần trường?',
          'Du học sinh xây dựng tín dụng như thế nào?',
          'Có những lựa chọn bảo hiểm sức khỏe nào?',
          'Mở tài khoản ngân hàng ở Mỹ ra sao?',
          'Việc làm bán thời gian trong campus là gì?',
          'Khai thuế cho sinh viên F-1 thế nào?',
          'Cần lưu ý gì trước khi ký hợp đồng thuê nhà?',
          'Giải quyết mâu thuẫn với bạn cùng phòng ra sao?',
          'Chuẩn bị gì cho phỏng vấn visa?',
          'Cách gia hạn I-20 và duy trì tình trạng?',
          'Visa F-1 sắp hết hạn thì làm gì?',
          'Cách xin số an sinh xã hội (SSN)?',
          'Khác nhau giữa J-1 và F-1 là gì?',
          'Sinh viên quốc tế lấy bằng lái xe thế nào?',
          'Những kiểu lừa đảo thường gặp với du học sinh?',
          'Làm sao liên hệ DSO/cố vấn học tập?',
          'Mất hộ chiếu hoặc I-94 phải làm gì?',
        ]
      : [
          'F-1 भिसा विस्तारका लागि के कागजात चाहिन्छ?',
          'स्नातकपछि OPT कसरी आवेदन गर्ने?',
          'CPT र OPT बीच के फरक छ?',
          'क्याम्पस नजिक सस्तो आवास कसरी खोज्ने?',
          'विद्यार्थीले क्रेडिट स्कोर कसरी बनाउने?',
          'कुन-कुन स्वास्थ्य बीमा विकल्प छन्?',
          'अमेरिकामा बैंक खाता कसरी खोल्ने?',
          'क्याम्पसमा सामान्य पार्ट-टाइम काम के के छन्?',
          'F-1 विद्यार्थीले कर कसरी तिर्ने?',
          'भाडा सम्झौता अघि के हेर्ने?',
          'रूममेट समस्या कसरी समाधान गर्ने?',
          'भिसा इन्टरभ्यूका लागि के तयारी गर्ने?',
          'I-20 कसरी नवीकरण गर्ने र स्थिति कसरी राख्ने?',
          'F-1 भिसा सकिन लाग्दा के गर्ने?',
          'SSN (सोसल सेक्युरिटी नम्बर) कसरी लिन्ने?',
          'J-1 र F-1 बीच के फरक छ?',
          'विदेशी विद्यार्थीले ड्राइभर लाइसेन्स कसरी लिने?',
          'विदेशी विद्यार्थी लक्षित ठगी के-के हुन्छ?',
          'DSO/सलाहकारसँग कसरी सम्पर्क गर्ने?',
          'पासपोर्ट वा I-94 हरायो भने के गर्ने?',
        ];

  const suggestedQuestions = useMemo(() => {
    const pool = [...questionPool];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 5);
  }, [language]);

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

  // 清理未完成的打字计时器，避免组件卸载后仍调用 setState
  useEffect(() => {
    return () => {
      typingTimers.current.forEach((t) => clearTimeout(t));
      typingTimers.current = [];
    };
  }, []);

  const startTypewriter = (messageId: string, fullText: string) => {
    const total = fullText.length;
    if (total === 0) return;

    // 动态步长：文本越长，每步前进字符越多，控制总耗时
    const step = Math.max(1, Math.floor(total / 80));

    const tick = (index: number) => {
      const nextIndex = Math.min(total, index + step);
      const slice = fullText.slice(0, nextIndex);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: slice } : m))
      );
      if (nextIndex < total) {
        const timer = window.setTimeout(() => tick(nextIndex), 16);
        typingTimers.current.push(timer);
      } else {
        // 确保最终文本完整
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, content: fullText } : m))
        );
      }
    };

    tick(0);
  };

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
      const response = await askQuestion(messageContent);
      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        fullContent: response.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      startTypewriter(assistantId, response.answer);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'AI request failed';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          language === 'en'
            ? `Sorry, I couldn't complete that request. ${message}`
            : language === 'zh'
            ? `抱歉，未能完成请求。${message}`
            : language === 'ko'
            ? `죄송합니다. 요청을 처리하지 못했습니다. ${message}`
            : language === 'vi'
            ? `Xin lỗi, tôi không thể xử lý yêu cầu. ${message}`
            : `माफ गर्नुहोस्, म अनुरोध पूरा गर्न सकिनँ। ${message}`,
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
                            <span>
                              {language === 'en'
                                ? 'Related Trusted Posts'
                                : language === 'zh'
                                ? '相关可信帖子'
                                : language === 'ko'
                                ? '관련 신뢰 글'
                                : language === 'vi'
                                ? 'Bài viết liên quan đáng tin cậy'
                                : 'सम्बन्धित विश्वसनीय पोस्ट'}
                            </span>
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
                        {message.timestamp.toLocaleTimeString(
                          language === 'en'
                            ? 'en-US'
                            : language === 'zh'
                            ? 'zh-CN'
                            : language === 'ko'
                            ? 'ko-KR'
                            : language === 'vi'
                            ? 'vi-VN'
                            : 'ne-NP',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
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
          </div>
        </div>
      </Card>
    </div>
  );
}