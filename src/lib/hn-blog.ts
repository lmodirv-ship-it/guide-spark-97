// Fetches blog articles from the external hn-chat backend so any article
// published on https://www.hn-chat.com/blog appears on this site too.
const HN_SUPABASE_URL = "https://mldhfeedpztfqrlotvkb.supabase.co";
const HN_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZGhmZWVkcHp0ZnFybG90dmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjM3NDQsImV4cCI6MjA5MjYzOTc0NH0.9Wu1FjG2oIjLFR6bnF9nKDCJUm_4YDK2B21FtJ92544";

export type HnArticle = {
  id: string;
  title: string;
  slug: string | null;
  language: string | null;
  featured_image: string | null;
  short_description: string | null;
  content: string | null;
  tags: string[] | null;
  reading_time: number | null;
  published_at: string | null;
  views_count: number | null;
  likes_count: number | null;
};

export function hnImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  return `https://www.hn-chat.com${src.startsWith("/") ? "" : "/"}${src}`;
}

export const hnArticleExternalUrl = (id: string) =>
  `https://www.hn-chat.com/blog/${id}`;

async function hnFetch(path: string) {
  const res = await fetch(`${HN_SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: HN_ANON_KEY,
      Authorization: `Bearer ${HN_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`hn-chat fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchHnArticles(): Promise<HnArticle[]> {
  const data = await hnFetch(
    "articles?select=id,title,slug,language,featured_image,short_description,tags,reading_time,published_at,views_count,likes_count&status=eq.published&order=published_at.desc",
  );
  return data as HnArticle[];
}

export async function fetchHnArticle(id: string): Promise<HnArticle | null> {
  const data = await hnFetch(
    `articles?select=*&id=eq.${encodeURIComponent(id)}&status=eq.published&limit=1`,
  );
  return (data as HnArticle[])[0] ?? null;
}
