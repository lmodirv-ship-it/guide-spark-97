import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  users: z
    .array(
      z.object({
        full_name: z.string().min(1).max(120),
        phone: z.string().max(40).optional().nullable(),
        preferred_language: z.string().max(5).optional().nullable(),
        avatar_url: z.string().max(500).optional().nullable(),
        email: z.string().email().optional().nullable(),
      })
    )
    .min(1)
    .max(50),
});

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "")
    .slice(0, 20) || "user";

export const adminCreateUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Schema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin");
    if (!roles?.length) throw new Response("Forbidden", { status: 403 });

    let created = 0;
    const errors: string[] = [];
    for (const u of data.users) {
      const email = u.email || `${slug(u.full_name)}.${Date.now()}.${Math.floor(Math.random() * 9999)}@auto.local`;
      const password = crypto.randomUUID();
      const { data: au, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name, avatar_url: u.avatar_url ?? null },
      });
      if (error || !au?.user) {
        errors.push(`${u.full_name}: ${error?.message ?? "unknown"}`);
        continue;
      }
      // profile is auto-created by handle_new_user trigger; update extras
      await supabaseAdmin
        .from("profiles")
        .update({
          phone: u.phone ?? null,
          preferred_language: u.preferred_language ?? "ar",
        })
        .eq("id", au.user.id);
      created++;
    }
    return { created, errors };
  });
