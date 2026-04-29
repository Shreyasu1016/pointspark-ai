import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, ShieldCheck, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Best way to redeem HDFC Regalia points?",
  "Compare Axis Magnus vs Amex Platinum Travel",
  "Which card for ₹1L monthly Amazon spend?",
  "Are SBI Cashback points worth more as cashback or vouchers?",
  "How do I transfer points to Air India Maharaja Club?",
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsStreaming(true);

    try {
      const resp = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        const msg =
          (errBody as { error?: string }).error ||
          (resp.status === 429
            ? "Rate limit reached. Try again in a moment."
            : resp.status === 402
              ? "AI credits exhausted. Please add credits to your workspace."
              : "Something went wrong. Please try again.");
        setError(msg);
        setIsStreaming(false);
        return;
      }
      if (!resp.body) {
        setError("No response stream.");
        setIsStreaming(false);
        return;
      }

      // Push empty assistant message we'll fill
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistantSoFar = "";
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta: string | undefined =
              parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "assistant") {
                  copy[copy.length - 1] = { ...last, content: snapshot };
                }
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setIsStreaming(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="glass mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-elevated">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-purple">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight">
              PointsIQ Advisor
            </p>
            <p className="text-[11px] text-muted-foreground">
              AI-powered · Anonymous
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-1/60 px-2.5 py-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-teal" />
          Privacy-first
        </div>
      </div>

      {/* Scroll area */}
      <div
        ref={scrollRef}
        className="h-[460px] overflow-y-auto px-5 py-5 sm:h-[520px]"
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-purple">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold">
              Ask me anything about your card rewards
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              I know Indian and global card programs, transfer partners, and the
              real rupee value of every point.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border/60 bg-surface-1/60 px-3.5 py-1.5 text-xs text-foreground/85 transition-smooth hover:border-brand-purple/50 hover:bg-surface-2 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {isStreaming &&
              messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="typing-dot inline-block h-2 w-2 rounded-full bg-brand-purple" />
                  <span
                    className="typing-dot inline-block h-2 w-2 rounded-full bg-brand-teal"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="typing-dot inline-block h-2 w-2 rounded-full bg-brand-coral"
                    style={{ animationDelay: "0.4s" }}
                  />
                  <span className="ml-1">thinking…</span>
                </div>
              )}
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-surface-1/70 p-2 transition-smooth focus-within:border-brand-purple/60 focus-within:shadow-glow-purple">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about a card, redemption, or transfer partner…"
            rows={1}
            className="max-h-[180px] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            disabled={isStreaming}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isStreaming}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow-purple transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            aria-label="Send"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 px-1 text-center text-[10.5px] text-muted-foreground/80">
          Never share card numbers, CVV, PIN, OTP, or personal details.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-md bg-gradient-brand px-4 py-2.5 text-sm text-primary-foreground shadow-glow-purple"
            : "max-w-[90%] rounded-2xl rounded-bl-md border border-border/60 bg-surface-1/80 px-4 py-3 text-foreground"
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : msg.content ? (
          <div className="prose-chat">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Composing…
          </span>
        )}
      </div>
    </div>
  );
}
