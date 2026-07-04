import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Copy, Search, ShieldCheck, ListChecks, FileText } from "lucide-react";
import {
  listSites, getVerificationToken, verifySite, submitSitemap, inspectUrl, listImportantUrls,
} from "@/lib/gsc.functions";

export const Route = createFileRoute("/admin/seo")({ component: SeoPage });

const DEFAULT_SITE = "https://hnguide.online/";
const DEFAULT_SITEMAP = "https://hnguide.online/sitemap.xml";

function SeoPage() {
  const [siteUrl, setSiteUrl] = useState(DEFAULT_SITE);
  const [sitemapUrl, setSitemapUrl] = useState(DEFAULT_SITEMAP);
  const [sites, setSites] = useState<any[] | null>(null);
  const [token, setToken] = useState<string>("");
  const [verifying, setVerifying] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, { status: string; note?: string }>>({});
  const [inspecting, setInspecting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const fnListSites = useServerFn(listSites);
  const fnGetToken = useServerFn(getVerificationToken);
  const fnVerify = useServerFn(verifySite);
  const fnSubmitSitemap = useServerFn(submitSitemap);
  const fnInspect = useServerFn(inspectUrl);
  const fnListUrls = useServerFn(listImportantUrls);

  const loadSites = async () => {
    setLoadingSites(true);
    try {
      const r = await fnListSites();
      if (!r.ok) throw new Error(typeof r.body === "string" ? r.body : JSON.stringify(r.body));
      setSites(r.body?.siteEntry ?? []);
    } catch (e: any) {
      toast.error(e.message || "فشل جلب المواقع");
    } finally { setLoadingSites(false); }
  };

  const loadUrls = async () => {
    try { setUrls(await fnListUrls()); } catch (e: any) { toast.error(e.message); }
  };

  useEffect(() => { loadSites(); loadUrls(); }, []);

  const getToken = async () => {
    try {
      const r = await fnGetToken({ data: { siteUrl } });
      if (!r.ok) throw new Error(JSON.stringify(r.body));
      setToken(r.body?.token || "");
      toast.success("تم توليد رمز التحقق. أضِفه في <head> ثم اضغط تحقق.");
    } catch (e: any) { toast.error(e.message); }
  };

  const doVerify = async () => {
    setVerifying(true);
    try {
      const r = await fnVerify({ data: { siteUrl } });
      if (!r.ok) throw new Error(typeof r.body === "string" ? r.body : JSON.stringify(r.body));
      toast.success("تم التحقق وإضافة الموقع إلى Search Console");
      loadSites();
    } catch (e: any) { toast.error(e.message); }
    finally { setVerifying(false); }
  };

  const doSubmitSitemap = async () => {
    try {
      const r = await fnSubmitSitemap({ data: { siteUrl, sitemapUrl } });
      if (!r.ok) throw new Error(typeof r.body === "string" ? r.body : JSON.stringify(r.body));
      toast.success("تم إرسال خريطة الموقع");
    } catch (e: any) { toast.error(e.message); }
  };

  const inspectAll = async () => {
    if (!urls.length) return;
    setInspecting(true);
    setResults({});
    setProgress({ done: 0, total: urls.length });
    for (let i = 0; i < urls.length; i++) {
      const u = urls[i];
      try {
        const r = await fnInspect({ data: { inspectionUrl: u, siteUrl } });
        const verdict = r.body?.inspectionResult?.indexStatusResult?.verdict || (r.ok ? "OK" : "ERROR");
        const coverage = r.body?.inspectionResult?.indexStatusResult?.coverageState;
        setResults((prev) => ({ ...prev, [u]: { status: verdict, note: coverage } }));
      } catch (e: any) {
        setResults((prev) => ({ ...prev, [u]: { status: "ERROR", note: e.message } }));
      }
      setProgress({ done: i + 1, total: urls.length });
      await new Promise((r) => setTimeout(r, 250));
    }
    setInspecting(false);
    toast.success("انتهى فحص جميع الروابط");
  };

  const inspectOne = async (u: string) => {
    setResults((prev) => ({ ...prev, [u]: { status: "..." } }));
    try {
      const r = await fnInspect({ data: { inspectionUrl: u, siteUrl } });
      const verdict = r.body?.inspectionResult?.indexStatusResult?.verdict || (r.ok ? "OK" : "ERROR");
      const coverage = r.body?.inspectionResult?.indexStatusResult?.coverageState;
      setResults((prev) => ({ ...prev, [u]: { status: verdict, note: coverage } }));
    } catch (e: any) {
      setResults((prev) => ({ ...prev, [u]: { status: "ERROR", note: e.message } }));
    }
  };

  return (
    <>
      <AdminTopbar title="SEO & Google Search Console" subtitle="تسجيل الموقع، تأكيد الملكية وطلب الفهرسة" />

      <Tabs defaultValue="verify" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verify"><ShieldCheck className="h-4 w-4 me-1" /> تأكيد الملكية</TabsTrigger>
          <TabsTrigger value="sitemap"><FileText className="h-4 w-4 me-1" /> Sitemap</TabsTrigger>
          <TabsTrigger value="inspect"><Search className="h-4 w-4 me-1" /> فحص وفهرسة الروابط</TabsTrigger>
          <TabsTrigger value="sites"><ListChecks className="h-4 w-4 me-1" /> المواقع المُسجَّلة</TabsTrigger>
        </TabsList>

        <TabsContent value="verify">
          <Card>
            <Field label="عنوان الموقع (بشرطة مائلة في النهاية)">
              <Input dir="ltr" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button onClick={getToken} variant="outline">1) توليد رمز التحقق</Button>
              <Button onClick={doVerify} disabled={verifying}>
                {verifying && <Loader2 className="h-4 w-4 me-1 animate-spin" />} 2) تحقق وأضِف الموقع
              </Button>
            </div>
            {token && (
              <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                <div className="text-xs text-muted-foreground">أضِف الوسم التالي داخل <code>&lt;head&gt;</code> ثم أعد النشر قبل الضغط على «تحقق»:</div>
                <div className="flex items-start gap-2">
                  <pre dir="ltr" className="flex-1 text-xs bg-background p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
{`<meta name="google-site-verification" content="${token}" />`}
                  </pre>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(`<meta name="google-site-verification" content="${token}" />`); toast.success("نُسِخ"); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ملاحظة: هذا الموقع يحتوي مسبقًا على ملف تحقق (<code>public/googlec9a405c0fc07da80.html</code>). إن كان حسابك يملكه، اضغط «تحقق» مباشرة.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Card>
            <Field label="عنوان الموقع"><Input dir="ltr" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} /></Field>
            <Field label="رابط Sitemap"><Input dir="ltr" value={sitemapUrl} onChange={(e) => setSitemapUrl(e.target.value)} /></Field>
            <Button onClick={doSubmitSitemap}>إرسال Sitemap إلى Google</Button>
          </Card>
        </TabsContent>

        <TabsContent value="inspect">
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm">
                عدد الروابط: <b>{urls.length}</b>
                {inspecting && <span className="ms-3 text-muted-foreground">({progress.done}/{progress.total})</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadUrls}>تحديث القائمة</Button>
                <Button onClick={inspectAll} disabled={inspecting || !urls.length}>
                  {inspecting && <Loader2 className="h-4 w-4 me-1 animate-spin" />} فحص كل الروابط
                </Button>
              </div>
            </div>
            <div className="rounded-lg border divide-y max-h-[520px] overflow-y-auto">
              {urls.map((u) => {
                const r = results[u];
                const pass = r?.status === "PASS";
                const fail = r && r.status !== "PASS" && r.status !== "..." && r.status !== "OK";
                return (
                  <div key={u} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <div dir="ltr" className="truncate text-xs text-muted-foreground">{u}</div>
                      {r?.note && <div className="text-xs mt-1">{r.note}</div>}
                    </div>
                    {r && (
                      <Badge variant={pass ? "default" : fail ? "destructive" : "secondary"} className="gap-1">
                        {pass ? <CheckCircle2 className="h-3 w-3" /> : fail ? <XCircle className="h-3 w-3" /> : null}
                        {r.status}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => inspectOne(u)}>فحص</Button>
                  </div>
                );
              })}
              {!urls.length && <div className="p-6 text-center text-sm text-muted-foreground">لا توجد روابط.</div>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sites">
          <Card>
            <div className="flex justify-between items-center">
              <div className="text-sm">المواقع المرتبطة بحساب Search Console</div>
              <Button variant="outline" onClick={loadSites} disabled={loadingSites}>
                {loadingSites && <Loader2 className="h-4 w-4 me-1 animate-spin" />} تحديث
              </Button>
            </div>
            <div className="rounded-lg border divide-y">
              {(sites ?? []).map((s: any) => (
                <div key={s.siteUrl} className="flex items-center justify-between p-3 text-sm">
                  <span dir="ltr">{s.siteUrl}</span>
                  <Badge variant="secondary">{s.permissionLevel}</Badge>
                </div>
              ))}
              {sites && !sites.length && <div className="p-6 text-center text-sm text-muted-foreground">لا مواقع بعد.</div>}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
