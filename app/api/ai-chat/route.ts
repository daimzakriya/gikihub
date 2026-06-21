import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiChatLimiter, checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { z } from "zod";

const BodySchema = z.object({
  messages: z.array(
    z.object({
      role:    z.enum(["user", "model"]),
      content: z.string().max(2000),
    })
  ).max(20),
});

const SYSTEM_PROMPT = `You are GIKI Plus AI, a helpful assistant for students at Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI), located in Topi, Khyber Pakhtunkhwa, Pakistan.

You help students with:
- Information about GIKI campus, departments, facilities, and hostels
- Academic matters: grading (GIKI uses relative/curved grading — A is the highest grade), credit hours, GPA calculations, Dean's Honor List (CGPA ≥ 3.50)
- Admission merit formula: Matric 10% + FSc 40% + ECAT 50%
- Campus life, societies, sports, events
- Hostel rules, mess, facilities
- Lost & Found, room finder guidance
- General study tips and academic advice

Important facts:
- GIKI uses relative grading — there is no A+ grade. A is the highest. Grades: A, A-, B+, B, B-, C+, C, D, F
- Minimum CGPA to avoid academic probation: 2.00
- Dean's Honor List requires CGPA ≥ 3.50
- ECAT is required for GIKI admission

Always be helpful, concise, and accurate. If you don't know something specific about GIKI, say so clearly rather than guessing. Format responses with markdown when helpful.`;

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = await checkRateLimit(aiChatLimiter, `aiChat:${ip}`);
  if (limited) return limited;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid messages" }, { status: 422 });

  const { messages } = parsed.data;
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from user" }, { status: 422 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model:          "gemini-2.5-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature:     0.7,
    },
  });

  // Convert to Gemini history format
  const history = messages.slice(0, -1).map((m) => ({
    role:  m.role,
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1].content;

  try {
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive",
      },
    });
  } catch (err) {
    console.error("[ai-chat]", err);
    return NextResponse.json({ error: "AI service error. Try again." }, { status: 500 });
  }
}
