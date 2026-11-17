import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  BarChart3,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { generateFeedbackAnswer } from '../../utils/askFeedbackIQEngine';

const PORTFOLIO_SUGGESTIONS = [
  'What are customers most unhappy about?',
  'Which product has the highest average rating?',
  'What should we improve first?',
  'Compare customer sentiment across products.',
  'How to maintain the quality of laptop sales?',
  'Which feedback category has the most responses?',
  'What do customers appreciate most?',
];

export default function AskFeedbackIQ({
  products = [],
  allRecords = [],
  scopedRecords = [],
  selectedProduct = 'ALL',
  dateRange = '30d',
  dateRangeLabel = 'Last 30 Days',
  datasetFingerprint = '',
}) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeContextProduct, setActiveContextProduct] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Reset conversation context when product scope, date range, or underlying dataset changes
  useEffect(() => {
    setMessages([]);
    setActiveContextProduct(null);
    setQuery('');
  }, [selectedProduct, dateRange, datasetFingerprint]);

  // Tailor suggested inquiries based on currently selected scope
  const isIndividualScope = selectedProduct !== 'ALL' && Boolean(selectedProduct);
  const currentProdObj = isIndividualScope
    ? products.find((p) => p.Product_ID === selectedProduct)
    : null;
  const currentProdName = currentProdObj?.Product_Name || 'this product';

  const suggestedQuestions = isIndividualScope
    ? [
        `What are customers most unhappy about?`,
        `What do customers appreciate most about ${currentProdName}?`,
        `What should we improve first?`,
        `How is product quality and reliability rated?`,
        `Are there any recurring quality problems?`,
        `What is the average rating?`,
      ]
    : PORTFOLIO_SUGGESTIONS;

  // Handle question submission
  const handleSubmit = (questionText) => {
    const textToSend = (questionText || query).trim();
    if (!textToSend || isProcessing) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsProcessing(true);

    // Simulate realistic asynchronous turnaround (150ms) to ensure clean UX feel
    setTimeout(() => {
      try {
        const response = generateFeedbackAnswer(
          textToSend,
          {
            products,
            allRecords,
            scopedRecords,
            selectedProduct,
            dateRange,
            dateRangeLabel,
          },
          messages
        );

        if (response.targetProductId) {
          setActiveContextProduct(response.targetProductId);
        }

        const botMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          type: response.type,
          targetProductId: response.targetProductId,
          groundedRecordsCount: response.groundedRecords?.length || 0,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            role: 'assistant',
            content:
              'An error occurred while evaluating your question against the dataset. Please try a different query or reset the conversation.',
            type: 'error',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setActiveContextProduct(null);
    setQuery('');
    textareaRef.current?.focus();
  };

  // Helper to render formatted markdown-like text safely
  const renderMessageContent = (content) => {
    // Split into paragraphs / lines
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-primary">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Heading 3
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-primary pt-1 pb-0.5 border-b border-border/40">
                {line.replace('### ', '')}
              </h4>
            );
          }

          // Bold tags formatting
          const formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-muted">$1</em>')
            .replace(/\[(Calculated Metric)\]/g, '<span class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-mono text-[10px] font-bold border border-blue-500/20">Calculated Metric</span>')
            .replace(/\[(Stored AI Analysis)\]/g, '<span class="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-mono text-[10px] font-bold border border-purple-500/20">Stored AI Analysis</span>')
            .replace(/\[(Evidence & Stored AI Analysis)\]/g, '<span class="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono text-[10px] font-bold border border-amber-500/20">Evidence & Stored AI</span>')
            .replace(/\[(Evidence & Traceability)\]/g, '<span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold border border-emerald-500/20">Evidence</span>')
            .replace(/\[(FB-[\w-]+)\]/g, '<span class="px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-muted font-mono text-[10px] font-semibold border border-border/60">$1</span>');

          // Bullet list items
          if (line.startsWith('• ') || line.startsWith('  - ')) {
            return (
              <div
                key={idx}
                className="pl-2 sm:pl-3 border-l-2 border-border/80 text-muted hover:text-primary transition-colors"
                dangerouslySetInnerHTML={{ __html: formattedLine }}
              />
            );
          }

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section className="surface-card rounded-2xl border border-border p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
              Ask FeedbackIQ
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                Feedback Intelligence Analyst
              </span>
            </h3>
          </div>
          <p className="text-xs text-muted leading-relaxed max-w-2xl">
            Ask domain-specific questions regarding customer complaints, praise drivers, ratings, sentiment trends, or cross-product comparisons. Answers are grounded in your live Google Sheets database.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleResetConversation}
            >
              New Conversation
            </Button>
          )}
        </div>
      </div>

      {/* Suggested Questions Carousel / Pill Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-bold block">
          Suggested Inquiries
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              disabled={isProcessing}
              onClick={() => handleSubmit(sq)}
              className="text-xs px-3 py-1.5 rounded-xl bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border hover:border-accent/40 text-muted hover:text-primary transition-all duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Q&A History Display */}
      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-border/80 p-4 sm:p-5 min-h-[220px] max-h-[460px] overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full py-8 text-center space-y-2 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-muted">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <h4 className="text-sm font-semibold text-primary">No Active Inquiries</h4>
            <p className="text-xs text-muted max-w-md">
              Select one of the suggested inquiries above or type a customer feedback question below to inspect ratings, friction points, or product benchmarks.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-muted/70">
              <ShieldAlert className="w-3.5 h-3.5 text-accent" />
              <span>Strictly restricted to feedback intelligence & stored AI analysis</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              } space-y-1.5`}
            >
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-muted px-1">
                {msg.role === 'user' ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    <User className="w-3 h-3 text-muted" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-accent" />
                    <span>FeedbackIQ Analyst</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.type === 'refusal' && (
                      <span className="text-amber-500 font-semibold">[Out-of-Domain Refusal]</span>
                    )}
                    {msg.type === 'scope_refusal' && (
                      <span className="text-amber-500 font-semibold">[Scope Restriction]</span>
                    )}
                  </>
                )}
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-2xl max-w-2xl border ${
                  msg.role === 'user'
                    ? 'bg-accent/10 border-accent/30 text-primary'
                    : msg.type === 'refusal' || msg.type === 'scope_refusal'
                    ? 'bg-amber-500/10 border-amber-500/30 text-primary'
                    : msg.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-primary'
                    : 'bg-card border-border text-primary shadow-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-xs sm:text-sm font-medium">{msg.content}</p>
                ) : (
                  renderMessageContent(msg.content)
                )}
              </div>
            </div>
          ))
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-muted py-2 pl-2 animate-pulse">
            <Bot className="w-4 h-4 text-accent" />
            <span>Analyzing Google Sheets records & stored Groq insights...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-2"
      >
        <div className="relative rounded-2xl border border-border bg-card focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder="Ask a question about customer feedback, complaints, ratings, or product comparisons (Press Enter to submit)..."
            aria-label="Ask FeedbackIQ question input"
            className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm text-primary placeholder-muted/60 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-border/40 text-[11px] text-muted">
            <span className="hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-border font-mono text-[10px]">Enter</kbd> to ask, <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-border font-mono text-[10px]">Shift+Enter</kbd> for line break
            </span>
            <div className="ml-auto">
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!query.trim() || isProcessing}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Ask Assistant
              </Button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
