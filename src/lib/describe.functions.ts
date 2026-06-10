import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const describeProjectImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { imageUrl: string; title?: string; category?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!role) throw new Error("Forbidden: admin only");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const system =
      "You write concise, vivid one-sentence portfolio descriptions for sportswear and apparel designs. " +
      "Focus on colors, materials, typography, motifs, and overall vibe. 18-30 words. No marketing fluff, no emojis, no quotes.";
    const userText =
      `Write a single-sentence portfolio description for this apparel design.` +
      (data.title ? ` Title: "${data.title}".` : "") +
      (data.category ? ` Category: ${data.category}.` : "");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: data.imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`AI describe failed: ${res.status} ${txt}`);
    }
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content?.toString().trim() || "";
    return { description: text.replace(/^["']|["']$/g, "") };
  });
