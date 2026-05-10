import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard, Store, PlusCircle, Globe2, FolderTree, Package,
  Inbox, Search, Star, Users, Megaphone, BarChart3, History, Settings, Bot, Hash, Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

const items = [
  { to: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { to: "/admin/places", label: "إدارة الأماكن", icon: Store },
  { to: "/admin/places/new", label: "إضافة مكان جديد", icon: PlusCircle },
  { to: "/admin/locations", label: "البلدان والمدن", icon: Globe2 },
  { to: "/admin/categories", label: "إدارة التصنيفات", icon: FolderTree },
  { to: "/admin/products", label: "المنتجات والقوائم", icon: Package },
  { to: "/admin/requests", label: "طلبات الإضافة", icon: Inbox },
  { to: "/admin/import", label: "البحث الأوتوماتيكي", icon: Search },
  { to: "/admin/reviews", label: "التقييمات والمراجعات", icon: Star },
  { to: "/admin/users", label: "المستخدمون", icon: Users },
  { to: "/admin/ads", label: "الإعلانات", icon: Megaphone },
  { to: "/admin/reports", label: "التقارير والإحصائيات", icon: BarChart3 },
  { to: "/admin/ids", label: "المعرّفات (IDs)", icon: Hash },
  { to: "/blog-editor", label: "محرر المدونة", icon: Newspaper },
  { to: "/admin/activity", label: "سجل النشاطات", icon: History },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-accent p-1">
          <BrandLogo forceLang="ar" className="h-10 w-10" />
        </div>
        <div className="leading-tight">
          <div className="text-xl font-extrabold">دليلك</div>
          <div className="text-[11px] opacity-70">دليل الأماكن والخدمات</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            activeOptions={{ exact: it.exact ?? false }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium opacity-80 hover:bg-sidebar-accent hover:opacity-100 transition"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground opacity-100 shadow-soft" }}
          >
            <it.icon className="h-4 w-4" />
            <span className="flex-1">{it.label}</span>
          </Link>
        ))}
      </nav>

      {/* AI auto-search promo */}
      <div className="m-3 rounded-2xl bg-sidebar-accent p-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="h-4 w-4 text-sidebar-primary" />
          <span className="text-sm font-bold">البحث التلقائي</span>
        </div>
        <p className="text-xs opacity-70 mb-3">استيراد أماكن جديدة بنقرة واحدة</p>
        <Link to="/admin/import">
          <Button size="sm" className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90">
            <Search className="h-3.5 w-3.5 me-1" />
            بدء البحث
          </Button>
        </Link>
      </div>
    </aside>
  );
}
