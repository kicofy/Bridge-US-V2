import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedPosts?: { title: string; category: string }[];
}

interface AIQAPageProps {
  language?: string;
}

export function AIQAPage({ language = 'en' }: AIQAPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: language === 'en' 
        ? 'Hello! I\'m BridgeUS AI Assistant. I can help you with questions about visas, housing, health insurance, campus life, and work opportunities for international students. How can I help you today?'
        : '你好！我是BridgeUS AI助手。我可以帮助你解答关于签证、住房、医疗保险、校园生活和工作机会等国际学生相关问题。今天有什么可以帮到你的吗？',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (content?: string) => {
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageContent, language);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        relatedPosts: aiResponse.relatedPosts,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
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
              <h2 className="text-2xl">{language === 'en' ? 'AI Q&A Assistant' : 'AI问答助手'}</h2>
              <p className="text-sm text-white/80">
                {language === 'en' 
                  ? 'Get instant answers from trusted community knowledge'
                  : '从可信的社区知识库获取即时答案'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_300px]">
          {/* Chat area */}
          <div className="flex flex-col">
            {/* Messages */}
            <ScrollArea ref={scrollRef} className="h-[500px] pr-4">
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
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
                  placeholder={language === 'en' ? 'Ask a question...' : '提出你的问题...'}
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
                  {language === 'en'
                    ? 'AI responses are generated based on community posts and may contain errors. Always verify critical information with official sources or verified experts.'
                    : 'AI回复基于社区帖子生成，可能包含错误。请务必通过官方渠道或认证专家验证关键信息。'}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar with suggested questions */}
          <div className="space-y-4">
            <div>
              <h4 className="mb-3 text-sm">
                {language === 'en' ? 'Suggested Questions' : '推荐问题'}
              </h4>
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
              <h4 className="mb-3 text-sm">
                {language === 'en' ? 'AI Knowledge Base' : 'AI知识库'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Trusted Posts' : '可信帖子'}
                  </span>
                  <span>2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Verified Answers' : '认证答案'}
                  </span>
                  <span>1,523</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Expert Contributors' : '专家贡献者'}
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

// Mock AI response generator
function generateAIResponse(question: string, language: string) {
  const lowerQuestion = question.toLowerCase();
  
  // Visa-related
  if (lowerQuestion.includes('visa') || lowerQuestion.includes('签证') || lowerQuestion.includes('f-1') || lowerQuestion.includes('opt')) {
    return {
      content: language === 'en'
        ? `Based on trusted community knowledge:\n\nFor F-1 visa extensions, you typically need:\n1. Valid I-20 from your school\n2. Proof of financial support\n3. Current passport\n4. Application form (I-539)\n\nKey points:\n• Apply at least 45 days before your current visa expires\n• Maintain full-time student status\n• Keep all immigration documents up to date\n\nFor OPT applications:\n• File Form I-765 within 30 days of your DSO's recommendation\n• Include the $410 filing fee\n• You can apply up to 90 days before program completion\n\nAlways verify with your school's International Student Office and check USCIS official website for the most current requirements.`
        : `基于可信的社区知识：\n\n申请F-1签证延期，通常需要：\n1. 学校有效的I-20表格\n2. 财务支持证明\n3. 有效护照\n4. 申请表格（I-539）\n\n关键要点：\n• 在当前签证到期前至少45天申请\n• 保持全日制学生身份\n• 及时更新所有移民文件\n\nOPT申请：\n• 在DSO推荐后30天内提交I-765表格\n• 包含$410申请费\n• 可在项目完成前90天内申请\n\n请务必与学校国际学生办公室确认，并查看USCIS官方网站获取最新要求。`,
      relatedPosts: [
        { title: language === 'en' ? 'Complete F-1 Visa Extension Guide 2026' : 'F-1签证延期完整指南2026', category: 'Visa' },
        { title: language === 'en' ? 'OPT Application Timeline & Checklist' : 'OPT申请时间表和清单', category: 'Visa' },
        { title: language === 'en' ? 'Common Visa Extension Mistakes to Avoid' : '避免常见的签证延期错误', category: 'Visa' },
      ],
    };
  }
  
  // Housing-related
  if (lowerQuestion.includes('housing') || lowerQuestion.includes('住房') || lowerQuestion.includes('apartment') || lowerQuestion.includes('rent')) {
    return {
      content: language === 'en'
        ? `Based on trusted community posts:\n\nFinding affordable housing near campus:\n\n1. Start early: Begin searching 2-3 months before move-in\n2. Check multiple sources:\n   • University housing portal\n   • Facebook student housing groups\n   • Craigslist (be cautious of scams)\n   • Local real estate websites\n\n3. Budget considerations:\n   • Expect $600-1200/month depending on location\n   • Include utilities (usually $50-150/month)\n   • Consider roommates to split costs\n\n4. What to check:\n   • Distance to campus and public transport\n   • Lease terms (6-month vs 12-month)\n   • Included amenities\n   • Safety of neighborhood\n\n5. Red flags to avoid:\n   • Requests for payment before viewing\n   • No written lease agreement\n   • Landlord unwilling to meet in person\n\nMany students recommend joining your school's international student WeChat/WhatsApp groups for housing recommendations.`
        : `基于可信的社区帖子：\n\n在校园附近寻找经济适用房：\n\n1. 提前开始：在搬入前2-3个月开始寻找\n2. 查看多个来源：\n   • 大学住房门户网站\n   • Facebook学生住房群组\n   • Craigslist（小心诈骗）\n   • 当地房地产网站\n\n3. 预算考虑：\n   • 根据位置，预计每月$600-1200\n   • 包括水电费（通常每月$50-150）\n   • 考虑室友分担费用\n\n4. 需要检查的内容：\n   • 到校园和公共交通的距离\n   • 租约条款（6个月vs 12个月）\n   • 包含的设施\n   • 社区安全性\n\n5. 需要避免的危险信号：\n   • 看房前要求付款\n   • 没有书面租赁协议\n   • 房东不愿意当面见面\n\n许多学生推荐加入学校的国际学生微信/WhatsApp群组获取住房推荐。`,
      relatedPosts: [
        { title: language === 'en' ? 'Best Neighborhoods for Students [2026]' : '学生最佳社区[2026]', category: 'Housing' },
        { title: language === 'en' ? 'Housing Scams: How to Protect Yourself' : '住房诈骗：如何保护自己', category: 'Housing' },
        { title: language === 'en' ? 'Budget-Friendly Housing Options' : '经济实惠的住房选择', category: 'Housing' },
      ],
    };
  }
  
  // Health insurance
  if (lowerQuestion.includes('health') || lowerQuestion.includes('insurance') || lowerQuestion.includes('医疗') || lowerQuestion.includes('保险')) {
    return {
      content: language === 'en'
        ? `Based on verified community knowledge:\n\nHealth insurance options for international students:\n\n1. University-sponsored plans:\n   • Usually mandatory\n   • Comprehensive coverage\n   • Cost: $1,500-3,000/year\n   • Pros: Easy access to campus health services\n\n2. Waiver options:\n   • If you have comparable coverage\n   • Must meet school's minimum requirements\n   • Submit waiver by deadline\n\n3. What's typically covered:\n   • Doctor visits and preventive care\n   • Emergency room visits\n   • Prescription medications\n   • Mental health services\n   • Some dental/vision (check policy)\n\n4. Important notes:\n   • Keep insurance card with you always\n   • Understand deductibles and copays\n   • Know which hospitals/clinics are in-network\n   • Pre-existing conditions may have waiting periods\n\n5. Tips from students:\n   • Use campus health center for minor issues (often free)\n   • Generic medications cost less\n   • Ask about student discounts at pharmacies\n\nContact your school's health services for specific plan details.`
        : `基于经过验证的社区知识：\n\n国际学生的医疗保险选项：\n\n1. 大学赞助计划：\n   • 通常是强制性的\n   • 全面覆盖\n   • 费用：每年$1,500-3,000\n   • 优点：方便使用校园医疗服务\n\n2. 豁免选项：\n   • 如果你有同等保险\n   • 必须满足学校的最低要求\n   • 在截止日期前提交豁免申请\n\n3. 通常涵盖的内容：\n   • 医生诊疗和预防保健\n   • 急诊室就诊\n   • 处方药\n   • 心理健康服务\n   • 部分牙科/视力（查看保单）\n\n4. 重要注意事项：\n   • 始终随身携带保险卡\n   • 了解免赔额和共付额\n   • 了解哪些医院/诊所在网络内\n   • 既往症可能有等待期\n\n5. 学生建议：\n   • 小问题使用校园健康中心（通常免费）\n   • 仿制药价格更低\n   • 在药房询问学生折扣\n\n请联系学校的健康服务部门了解具体计划详情。`,
      relatedPosts: [
        { title: language === 'en' ? 'Understanding Your Student Health Insurance' : '了解你的学生医疗保险', category: 'Health' },
        { title: language === 'en' ? 'How to File Insurance Claims' : '如何提交保险索赔', category: 'Health' },
        { title: language === 'en' ? 'Mental Health Resources for International Students' : '国际学生心理健康资源', category: 'Health' },
      ],
    };
  }
  
  // Work/Jobs
  if (lowerQuestion.includes('work') || lowerQuestion.includes('job') || lowerQuestion.includes('工作') || lowerQuestion.includes('兼职')) {
    return {
      content: language === 'en'
        ? `Based on trusted community posts:\n\nPart-time job options for international students on F-1 visa:\n\n1. On-campus employment (most common):\n   • Library assistant\n   • Dining hall staff\n   • Student center positions\n   • Research assistant\n   • Teaching assistant\n   • No special authorization needed\n   • Up to 20 hours/week during semester\n   • Full-time during breaks\n\n2. CPT (Curricular Practical Training):\n   • Must be integral to your major\n   • Requires authorization from DSO\n   • Can be part-time or full-time\n   • Common for internships\n\n3. Typical hourly rates:\n   • On-campus: $12-18/hour\n   • Research positions: $15-25/hour\n   • TA/RA positions: $15-30/hour\n\n4. Tips for finding jobs:\n   • Check university career portal regularly\n   • Visit career services office\n   • Attend job fairs\n   • Network with professors and advisors\n   • Update resume to US format\n\n5. Important rules:\n   • Cannot work off-campus without authorization\n   • Must maintain F-1 status\n   • Get written offer before starting\n\nAlways consult with your International Student Office before accepting any position.`
        : `基于可信的社区帖子：\n\nF-1签证国际学生的兼职工作选择：\n\n1. 校内工作（最常见）：\n   • 图书馆助理\n   • 食堂员工\n   • 学生中心职位\n   • 研究助理\n   • 助教\n   • 无需特殊授权\n   • 学期内每周最多20小时\n   • 假期可全职\n\n2. CPT（课程实习训练）：\n   • 必须与专业相关\n   • 需要DSO授权\n   • 可兼职或全职\n   • 常用于实习\n\n3. 典型时薪：\n   • 校内工作：$12-18/小时\n   • 研究职位：$15-25/小时\n   • 助教/研究助理：$15-30/小时\n\n4. 找工作的建议：\n   • 定期查看大学就业门户\n   • 访问就业服务办公室\n   • 参加招聘会\n   • 与教授和导师建立联系\n   • 将简历更新为美国格式\n\n5. 重要规则：\n   • 未经授权不能校外工作\n   • 必须保持F-1身份\n   • 开始工作前获得书面录用通知\n\n接受任何职位前，请务必咨询国际学生办公室。`,
      relatedPosts: [
        { title: language === 'en' ? 'Best On-Campus Jobs for International Students' : '国际学生最佳校内工作', category: 'Work' },
        { title: language === 'en' ? 'How to Apply for CPT: Step-by-Step Guide' : '如何申请CPT：分步指南', category: 'Work' },
        { title: language === 'en' ? 'Resume Tips for International Students' : '国际学生简历技巧', category: 'Work' },
      ],
    };
  }
  
  // Default response
  return {
    content: language === 'en'
      ? `Thank you for your question! I can help you with information about:\n\n• Visa and immigration (F-1, OPT, CPT)\n• Housing and accommodation\n• Health insurance and healthcare\n• Campus life and student resources\n• Work opportunities and regulations\n\nCould you please provide more details about what you'd like to know? The more specific your question, the better I can help you with accurate information from our trusted community knowledge base.`
      : `感谢你的提问！我可以帮助你了解以下信息：\n\n• 签证和移民（F-1、OPT、CPT）\n• 住房和住宿\n• 医疗保险和医疗服务\n• 校园生活和学生资源\n• 工作机会和规定\n\n你能提供更多关于你想了解什么的细节吗？你的问题越具体，我就能从我们可信的社区知识库中为你提供更准确的信息。`,
    relatedPosts: [
      { title: language === 'en' ? 'New International Student Guide 2026' : '2026新国际学生指南', category: 'Campus Life' },
      { title: language === 'en' ? 'Essential Resources for F-1 Students' : 'F-1学生必备资源', category: 'Visa' },
    ],
  };
}
