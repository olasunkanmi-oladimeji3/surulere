import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/field/upload-image
 * Accepts a single already-compressed image (sent as FormData with a `file`
 * field) and stores it in the `property-photos` Supabase Storage bucket.
 * Returns the public URL so the form can collect all URLs before the final
 * submit call.
 *
 * No auth required — field forms are filled by CDA members in the field
 * without accounts. The service role key bypasses Storage RLS for the write.
 * Images land in field-uploads/{timestamp}-{random}.jpg and are readable by
 * LG Staff via the existing storage policies.
 */
export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `field-uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("property-photos")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("property-photos").getPublicUrl(path);

  return NextResponse.json({ ok: true, url: publicUrl, path });
}