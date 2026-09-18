import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";
import {
  getModuleContent,
  streamChatAnswer,
  geminiErrorMessage,
  HISTORY_MESSAGES,
  type ChatMessage,
} from "@/lib/aiChat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return new Response(sse({ error: "Não autenticado" }), {
      status: 401,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  let body: { moduleId?: string; question?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(sse({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const question = String(body.question ?? "").trim();
  const moduleId = String(body.moduleId ?? "");
  if (!moduleId || !question || question.length < 3) {
    return new Response(sse({ error: "Escreva a pergunta e escolha o módulo." }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const module = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module) {
    return new Response(sse({ error: "Módulo não encontrado." }), {
      status: 404,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }
  if (!module.pdfUrl) {
    return new Response(sse({ error: "Este módulo ainda não possui material em PDF." }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  await prisma.aiMessage.create({
    data: { userId: user.id, moduleId, role: "user", content: question },
  });

  const recent = await prisma.aiMessage.findMany({
    where: { userId: user.id, moduleId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });
  const history: ChatMessage[] = recent
    .slice(-HISTORY_MESSAGES)
    .map((m) => ({ role: m.role as ChatMessage["role"], content: m.content }));

  let pdfText: string;
  try {
    pdfText = await getModuleContent(module.pdfUrl);
  } catch (e) {
    return new Response(sse({ error: geminiErrorMessage(e) }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(sse(obj)));
      let full = "";
      try {
        for await (const chunk of streamChatAnswer(module.name, pdfText, history)) {
          full += chunk;
          send({ text: chunk });
        }
        if (!full.trim()) {
          throw new Error("A IA não retornou nenhum conteúdo.");
        }
        await prisma.aiMessage.create({
          data: { userId: user.id, moduleId, role: "assistant", content: full },
        });
        send({ done: true });
      } catch (e) {
        send({ error: geminiErrorMessage(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}