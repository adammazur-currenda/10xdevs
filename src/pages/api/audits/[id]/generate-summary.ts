import type { APIRoute } from "astro";
import { OpenRouterService, type Message } from "@/lib/openrouter.service";

interface OpenRouterResponseContent {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { protocol } = await request.json();

    if (!protocol || typeof protocol !== "string") {
      return new Response(JSON.stringify({ error: "Invalid protocol input" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not found in environment variables");
    }

    const openRouter = new OpenRouterService({
      apiKey,
      endpointUrl: "https://openrouter.ai/api/v1/chat/completions",
      defaultModel: "gpt-4o-mini",
      defaultParameters: {
        temperature: 0.7,
        max_tokens: 4000,
      },
    });

    const messages: Message[] = [
      {
        role: "system",
        content: `Jesteś ekspertem ds. audytu bezpieczeństwa. Przeanalizuj dostarczony protokół z audytu i wygeneruj odpowiedź w następującym formacie JSON:
{
  "summary": "Zwięzłe podsumowanie protokołu",
  "keyFindings": ["ustalenie 1", "ustalenie 2", ...],
  "recommendations": ["rekomendacja 1", "rekomendacja 2", ...]
}

Upewnij się, że odpowiedź jest poprawnym obiektem JSON, bez żadnego dodatkowego tekstu przed lub po nim.`,
      },
      {
        role: "user",
        content: protocol,
      },
    ];

    const response = await openRouter.sendRequest(messages);
    const responseData = await response.json();

    if (!responseData.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from OpenRouter API");
    }

    const messageContent = responseData.choices[0].message.content;

    try {
      const content: OpenRouterResponseContent = JSON.parse(messageContent);

      if (!content.summary || !Array.isArray(content.keyFindings) || !Array.isArray(content.recommendations)) {
        throw new Error("Invalid content structure in response");
      }

      return new Response(JSON.stringify(content), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      throw new Error("Failed to parse response as JSON");
    }
  } catch (error) {
    console.error("Error details:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error?.constructor?.name,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
