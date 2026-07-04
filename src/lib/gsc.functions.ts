import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin");
  if (!data?.length) throw new Response("Forbidden", { status: 403 });
}

function headers() {
  const lov = process.env.LOVABLE_API_KEY;
  const gsc = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lov || !gsc) throw new Error("Google Search Console غير مربوط. اربط الموصل أولًا.");
  return {
    Authorization: `Bearer ${lov}`,
    "X-Connection-Api-Key": gsc,
    "Content-Type": "application/json",
  };
}

async function gsc(path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY}${path}`, { ...init, headers: { ...headers(), ...(init?.headers as any) } });
  const text = await res.text();
  let body: any = text;
  try { body = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, ok: res.ok, body };
}

export const listSites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const r = await gsc("/webmasters/v3/sites");
    return r;
  });

export const getVerificationToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { siteUrl: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return gsc("/siteVerification/v1/token", {
      method: "POST",
      body: JSON.stringify({ site: { identifier: data.siteUrl, type: "SITE" }, verificationMethod: "META" }),
    });
  });

export const verifySite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { siteUrl: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const verify = await gsc("/siteVerification/v1/webResource?verificationMethod=META", {
      method: "POST",
      body: JSON.stringify({ site: { identifier: data.siteUrl, type: "SITE" } }),
    });
    if (!verify.ok) return verify;
    const encoded = encodeURIComponent(data.siteUrl);
    const add = await gsc(`/webmasters/v3/sites/${encoded}`, { method: "PUT" });
    return { status: verify.status, ok: true, body: { verify: verify.body, add: add.body } };
  });

export const submitSitemap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { siteUrl: string; sitemapUrl: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const site = encodeURIComponent(data.siteUrl);
    const sm = encodeURIComponent(data.sitemapUrl);
    return gsc(`/webmasters/v3/sites/${site}/sitemaps/${sm}`, { method: "PUT" });
  });

export const inspectUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { inspectionUrl: string; siteUrl: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return gsc("/v1/urlInspection/index:inspect", {
      method: "POST",
      body: JSON.stringify({ inspectionUrl: data.inspectionUrl, siteUrl: data.siteUrl }),
    });
  });

export const listImportantUrls = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const SITE = "https://hnguide.online";
    const staticUrls = [`${SITE}/`, `${SITE}/feed`, `${SITE}/search`];
    const { data } = await context.supabase
      .from("posts")
      .select("id, updated_at, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(500);
    const postUrls = (data ?? []).map((p: any) => `${SITE}/blog/${p.id}`);
    return [...staticUrls, ...postUrls];
  });
