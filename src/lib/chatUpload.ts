import { supabase } from "@/integrations/supabase/client";

const FIFTY_YEARS = 60 * 60 * 24 * 365 * 50;
const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export type UploadedAttachment = {
  url: string;
  name: string;
  type: string;
};

export async function uploadChatFile(file: File, sessionId: string): Promise<UploadedAttachment> {
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 15MB)");
  }
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${sessionId}/${Date.now()}_${safe}`;
  const up = await supabase.storage.from("chat-uploads").upload(key, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from("chat-uploads").createSignedUrl(key, FIFTY_YEARS);
  if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error("Failed to sign URL");
  return { url: signed.data.signedUrl, name: file.name, type: file.type || "application/octet-stream" };
}

export function isImageType(type?: string | null) {
  return !!type && type.startsWith("image/");
}
