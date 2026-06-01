import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { procedureRepository } from "../repositories/procedure.repository";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT =
  "You are the EPMS Assistant, an expert on ESPRIT university administrative and academic " +
  "procedures. Answer concisely and in plain language. When procedure context is provided, base " +
  "your answer strictly on it and say so if the answer isn't covered by the context. If no context " +
  "is provided, answer generally but mention the user should check the relevant procedure in EPMS.";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGroq(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.aiApiKey}`,
    },
    body: JSON.stringify({
      model: env.aiModel,
      messages,
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ApiError(502, `AI provider request failed (${response.status})`, detail);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new ApiError(502, "AI provider returned an empty response");
  return content.trim();
}

async function buildProcedureContext(procedureId: string): Promise<string> {
  const procedure = await procedureRepository.findById(procedureId, {
    populate: [
      { path: "department", select: "name" },
      { path: "category", select: "name group" },
    ],
  });
  if (!procedure) throw ApiError.notFound("Procedure not found");

  const department = (procedure.department as unknown as { name?: string })?.name ?? "";
  const category = (procedure.category as unknown as { name?: string })?.name ?? "";
  const steps = procedure.steps.map((s) => `${s.order}. ${s.description}`).join("\n") || "None listed";
  const requiredDocuments = procedure.requiredDocuments.join(", ") || "None listed";

  return [
    `Title: ${procedure.title}`,
    `Department: ${department}`,
    `Category: ${category}`,
    `Status: ${procedure.status}`,
    `Version: ${procedure.versionNumber}`,
    `Responsible person: ${procedure.responsiblePerson}`,
    `Description: ${procedure.description}`,
    `Required documents: ${requiredDocuments}`,
    `Steps:\n${steps}`,
  ].join("\n");
}

export const aiService = {
  isConfigured() {
    return Boolean(env.aiProvider && env.aiApiKey);
  },

  async ask(question: string, procedureId?: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new ApiError(501, "AI Assistant is not configured. Set AI_PROVIDER and AI_API_KEY.");
    }
    if (!question?.trim()) throw ApiError.badRequest("question is required");

    const messages: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }];
    if (procedureId) {
      const context = await buildProcedureContext(procedureId);
      messages.push({ role: "system", content: `Procedure context:\n${context}` });
    }
    messages.push({ role: "user", content: question });

    return callGroq(messages);
  },

  async summarize(procedureId: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new ApiError(501, "AI Assistant is not configured. Set AI_PROVIDER and AI_API_KEY.");
    }

    const context = await buildProcedureContext(procedureId);
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Summarize this procedure in 3-5 short bullet points covering what it's for, who's ` +
          `responsible, and the key steps. Procedure context:\n${context}`,
      },
    ];

    return callGroq(messages);
  },
};
