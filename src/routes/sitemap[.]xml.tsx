import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://hnguide.online";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data } = await supabase
          .from("posts")
          .select("id, updated_at, created_at")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(5000);

        const staticUrls = [
          { loc: SITE_URL, priority: "1.0", changefreq: "daily" },
          { loc: `${SITE_URL}/feed`, priority: "0.9", changefreq: "daily" },
        ];

        const postUrls = (data ?? []).map((p) => ({
          loc: `${SITE_URL}/blog/${p.id}`,
          lastmod: new Date(p.updated_at || p.created_at).toISOString(),
          priority: "0.8",
          changefreq: "weekly",
        }));

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          staticUrls
            .map(
              (u) =>
                `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
            )
            .join("\n") +
          "\n" +
          postUrls
            .map(
              (u) =>
                `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
            )
            .join("\n") +
          `\n</urlset>\n`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=600",
          },
        });
      },
    },
  },
});
