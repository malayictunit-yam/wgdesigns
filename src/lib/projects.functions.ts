import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const FIFTY_YEARS = 60 * 60 * 24 * 365 * 50;

export const uploadProjectImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fileBase64: string; filename: string; contentType: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!role) throw new Error("Forbidden: admin only");
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${Date.now()}_${safeName}`;
    const bytes = Buffer.from(data.fileBase64, "base64");
    const up = await supabaseAdmin.storage.from("portfolio").upload(key, bytes, { contentType: data.contentType, upsert: false });
    if (up.error) throw new Error(up.error.message);
    const signed = await supabaseAdmin.storage.from("portfolio").createSignedUrl(key, FIFTY_YEARS);
    if (signed.error || !signed.data?.signedUrl) throw new Error(signed.error?.message || "Sign URL failed");
    return { url: signed.data.signedUrl };
  });
