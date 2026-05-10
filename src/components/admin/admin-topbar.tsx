import { useEffect, useState } from "react";
import { Bell, Globe, Moon, Sun, ChevronDown, Plus, Upload, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { setLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export function AdminTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [dark, setDark] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* Right (in RTL) actions cluster */}
      <div className="flex items-center gap-2 order-2 md:order-1">
        <Link to="/admin/places/new">
          <Button className="gap-1 shadow-soft">
            <Plus className="h-4 w-4" /> إضافة مكان جديد
          </Button>
        </Link>
        <Button variant="outline" className="gap-1">
          <Upload className="h-4 w-4" /> استيراد بيانات
        </Button>
      </div>

      {/* Left cluster: title + profile */}
      <div className="flex items-center gap-4 order-1 md:order-2 ms-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-12 rounded-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="text-end leading-tight hidden sm:block">
                <div className="text-sm font-bold">{email ? "مدير النظام" : "زائر"}</div>
                <div className="text-[11px] text-muted-foreground">{email ?? "غير مسجّل"}</div>
              </div>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link to="/admin/settings">الإعدادات</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4 me-2" /> خروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 end-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">5</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><Globe className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("ar")}>العربية</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("fr")}>Français</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={toggleDark}>
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="hidden md:block text-end">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
