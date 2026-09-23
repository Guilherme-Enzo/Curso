"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { withBasePath } from "@/lib/publicPath";

type ChatMsg = { id?: string; role: "user" | "assistant"; content: string };

type ModalProps = {
  module: { id: string; name: string } | null;
  onClose: () => void;
};

function katexNode(src: string, display: boolean): React.ReactNode {
  const html = katex.renderToString(src, {
    displayMode: display,
    throwOnError: false,
    strict: false,
  });
  if (display) {
    return (
      <span
        className="my-1 block w-full overflow-x-auto py-0.5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <span className="mx-0.5 inline-block" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function nodesWithMath(
  txt: string,
  math: React.ReactNode[]
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\uE000K(\d+)\uE000/g;
  let i = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(txt))) {
    if (m.index > i) out.push(<span key={key++}>{txt.slice(i, m.index)}</span>);
    out.push(<span key={key++}>{math[Number(m[1])]}</span>);
    i = m.index + m[0].length;
  }
  if (i < txt.length) out.push(<span key={key++}>{txt.slice(i)}</span>);
  return out;
}

function inlineNodes(text: string): React.ReactNode[] {
  // 1) Isola a matemática com placeholders ANTES do negrito/itálico/código,
  //    para que "**...$...$...**" não engula a fórmula como texto preto.
  const math: React.ReactNode[] = [];
  const masked = text.replace(/\$\$[^$]+\$\$|\$[^$\n]+\$/g, (tok) => {
    const inner = tok.startsWith("$$") ? tok.slice(2, -2).trim() : tok.slice(1, -1).trim();
    const idx = math.length;
    math.push(katexNode(inner, tok.startsWith("$$")));
    return `\uE000K${idx}\uE000`;
  });

  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked))) {
    if (m.index > last) out.push(...nodesWithMath(masked.slice(last, m.index), math));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(
        <strong key={key++} className="font-semibold text-white">
          {nodesWithMath(tok.slice(2, -2), math)}
        </strong>
      );
    } else if (tok.startsWith("`")) {
      out.push(
        <code key={key++} className="rounded bg-zinc-950/70 px-1 py-0.5 font-mono text-xs text-cyan-200">
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      out.push(
        <em key={key++} className="italic text-zinc-200">
          {nodesWithMath(tok.slice(1, -1), math)}
        </em>
      );
    }
    last = m.index + tok.length;
  }
  if (last < masked.length) out.push(...nodesWithMath(masked.slice(last), math));
  return out;
}

function isTableSep(line: string): boolean {
  return /^[\s|:|-]+$/.test(line) && line.includes("-");
}

function cellsOf(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function TableBlock({ rows }: { rows: string[] }) {
  const parsed = rows.map((r) => ({ sep: isTableSep(r), cells: cellsOf(r) }));
  const hasHeader = parsed.length > 1 && parsed[1].sep;
  const header = hasHeader ? parsed[0].cells : [];
  const body = parsed.filter((p) => !p.sep).map((p) => p.cells).filter((c) => c.length > 0);
  const bodyRows = hasHeader ? body.slice(1) : body;
  const max = Math.max(header.length, ...bodyRows.map((r) => r.length));
  const pad = (cells: string[]) => [...cells, ...Array(Math.max(0, max - cells.length)).fill("")];

  return (
    <div className="mt-1 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/60">
      <table className="w-full border-collapse text-xs">
        {hasHeader && header.length > 0 && (
          <thead>
            <tr>
              {pad(header).map((c, i) => (
                <th key={i} className="border-b border-zinc-700 px-2 py-1.5 text-left font-bold text-amber-300">
                  {inlineNodes(c)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((r, idx) => (
            <tr key={idx} className="odd:bg-zinc-900/40">
              {pad(r).map((c, j) => (
                <td key={j} className="break-words border-b border-zinc-800/60 px-2 py-1.5 align-top text-zinc-300">
                  {inlineNodes(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MathBlock({ source }: { source: string }) {
  const html = katex.renderToString(source, {
    displayMode: true,
    throwOnError: false,
    strict: false,
  });
  return (
    <div
      className="my-1 w-full overflow-x-auto rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CodeBlock({ code }: { code: string[] }) {
  return (
    <pre className="mt-1 overflow-x-auto whitespace-pre rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-xs leading-relaxed text-zinc-200">
      {code.join("\n")}
    </pre>
  );
}

function Content({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trimEnd());
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const push = (node: React.ReactNode) => out.push(<div key={key++} className="w-full">{node}</div>);

  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) {
      i++;
      continue;
    }
    if (/^```/.test(t)) {
      i++;
      const code: string[] = [];
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        code.push(lines[i]);
        i++;
      }
      i++;
      push(<CodeBlock code={code} />);
      continue;
    }
    if (/^\$\$/.test(t)) {
      let src = t.replace(/^\$\$/, "");
      if (src.includes("$$")) {
        src = src.replace(/\$\$$/, "").trim();
        i++;
      } else {
        const parts: string[] = [src];
        i++;
        while (i < lines.length && !lines[i].includes("$$")) {
          parts.push(lines[i].trim());
          i++;
        }
        if (i < lines.length) {
          parts.push(lines[i].split("$$")[0].trim());
          i++;
        }
        src = parts.join(" ").trim();
      }
      if (src) push(<MathBlock source={src} />);
      continue;
    }
    if (/^#{1,3}\s/.test(t)) {
      const level = t.match(/^#+/)![0].length;
      push(
        <p
          className={`break-words ${level >= 3 ? "mt-1 text-sm font-bold" : "mt-2 text-base font-bold"} text-white`}
        >
          {inlineNodes(t.replace(/^#+\s*/, ""))}
        </p>
      );
      i++;
      continue;
    }
    if (/^[-*_]{3,}$/.test(t)) {
      push(<hr className="my-2 border-zinc-700" />);
      i++;
      continue;
    }
    if (/^\|/.test(t)) {
      const rows: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        rows.push(lines[i]);
        i++;
      }
      push(<TableBlock rows={rows} />);
      continue;
    }
    if (/^[-*]\s+\S/.test(t) || /^\d+\.\s+\S/.test(t)) {
      const ordered = /^\d+\./.test(t);
      const items: string[] = [];
      while (
        i < lines.length &&
        (/^[-*]\s+\S/.test(lines[i].trim()) || /^\d+\.\s+\S/.test(lines[i].trim()))
      ) {
        items.push(lines[i].trim());
        i++;
      }
      push(
        ordered ? (
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-zinc-300">
            {items.map((it, k) => (
              <li key={k} className="break-words">
                {inlineNodes(it.replace(/^\d+\.\s*/, ""))}
              </li>
            ))}
          </ol>
        ) : (
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-300 [&>li]:pl-1">
            {items.map((it, k) => (
              <li key={k} className="break-words">
                {inlineNodes(it.replace(/^[-*]\s*/, ""))}
              </li>
            ))}
          </ul>
        )
      );
      continue;
    }
    push(
      <p className="mt-1 break-words text-sm leading-relaxed text-zinc-300">
        {inlineNodes(t)}
      </p>
    );
    i++;
  }
  return <>{out}</>;
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] min-w-0 rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950"
            : "border border-zinc-700 bg-zinc-800"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {msg.content}
          </p>
        ) : (
          <div className="min-w-0">
            <Content text={msg.content} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiChatModal({ module, onClose }: ModalProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadSuggestions = useCallback(async (moduleId: string) => {
    setSuggestionsLoading(true);
    try {
      const res = await fetch(withBasePath(`/api/ai/suggestions?moduleId=${moduleId}`));
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    if (!module) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(withBasePath(`/api/ai/messages?moduleId=${module.id}`));
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao carregar conversa");
      }
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão");
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    setMessages([]);
    setStreamingText("");
    setInput("");
    setError("");
    setSuggestions([]);
    if (module) {
      loadHistory();
      loadSuggestions(module.id);
    }
  }, [module, loadHistory, loadSuggestions]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamingText, loading]);

  useEffect(() => {
    if (!module) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [module, onClose]);

  if (!module) return null;

  const handleSend = async (raw?: string) => {
    const question = (raw ?? input).trim();
    if (!question || sending) return;
    setError("");
    setInput("");
    setSending(true);
    setStreamingText("");
    setMessages((m) => [...m, { role: "user", content: question }]);

    let acc = "";
    const commitAssistant = (content: string) => {
      if (content.trim()) {
        setMessages((m) => [...m, { role: "assistant", content }]);
      }
    };

    try {
      const res = await fetch(withBasePath("/api/ai/ask"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: module.id, question }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao perguntar à IA");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream indisponível");

      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const ev of events) {
          for (const line of ev.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = JSON.parse(line.slice(6));
            if (payload.text) {
              acc += payload.text;
              setStreamingText(acc);
            } else if (payload.error) {
              throw new Error(payload.error);
            }
          }
        }
      }
      commitAssistant(acc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão");
      commitAssistant(acc);
    } finally {
      setSending(false);
      setStreamingText("");
    }
  };

  const hasHistory = messages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="modal-chat flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-zinc-700 bg-zinc-900 sm:h-[min(720px,90vh)] sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Estude com a IA
            </p>
            <h3 className="truncate text-base font-bold text-white">
              {module.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-zinc-700 text-zinc-300 transition hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-center text-sm text-zinc-500">
              Carregando conversa...
            </p>
          ) : messages.length === 0 && !streamingText ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm font-semibold text-white">
                 Colaborador virtual do módulo
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                Estude com a IA e aproveite ao máximo este módulo: faça
                 perguntas, tire suas dúvidas, peça explicações e exemplos
                 visuais sobre qualquer tema relacionado. A cada resposta, ela
                 te convida a continuar estudando — é como ter um colaborador
                particular sempre por perto.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {suggestionsLoading ? (
                  <p className="text-xs text-zinc-500">
                    Gerando perguntas sugeridas para este módulo...
                  </p>
                ) : suggestions.length > 0 ? (
                  suggestions.map((s) => (
                    <button
                      key={s}
                      disabled={sending}
                      onClick={() => handleSend(s)}
                      className="rounded-xl border border-amber-600/30 bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))
                ) : null}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <MessageBubble key={m.id ?? `${m.role}-${m.content.slice(0, 20)}`} msg={m} />
              ))}
              {sending && !streamingText ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              ) : streamingText ? (
                <MessageBubble msg={{ role: "assistant", content: streamingText }} />
              ) : null}
            </>
          )}
          {error && (
            <p className="rounded-xl border border-red-800/60 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          {hasHistory && !sending && !streamingText && messages.length < 4 && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-zinc-800 bg-zinc-950 p-3"
        >
          {sending && (
            <p className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              Perguntando à IA...
            </p>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              placeholder="Pergunta sobre este módulo..."
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {sending ? "..." : "Perguntar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
