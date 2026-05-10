import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Heart, Bell, Plus, Globe, ChevronDown, LogOut, User } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { setLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { CartDrawer } from "@/components/cart-drawer";
import { autoDetectAndApplyLanguage } from "@/lib/geo-language";
import type { User as SupaUser } from "@supabase/supabase-js";

const langs = [
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
] as const;

export function SiteHeader() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<SupaUser | null>(null);

  useEffect(() => {
    // Sync dir on mount
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";

    // Auto-detect visitor's country and switch language on first visit
    autoDetectAndApplyLanguage();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [i18n.language]);

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/search", label: t("nav.posts") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo className="h-11 w-11" />
            <div className="hidden sm:block leading-tight">
              <div className="text-lg font-extrabold text-foreground">{t("brand")}</div>
              <div className="text-[10px] text-muted-foreground">{t("tagline")}</div>
            </div>
          </Link>
          <Link to="/feed">
            <Button variant="outline" size="sm" className="ms-2">مدونة</Button>
          </Link>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground transition"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-xs uppercase">{i18n.language}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {langs.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLanguage(l.code)}>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Bell className="h-5 w-5" />
          </Button>
          <Link to="/favorites">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <CartDrawer />

          {/* Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/favorites">{t("nav.favorites")}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin">{t("nav.admin")}</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                  <LogOut className="h-4 w-4 me-2" />{t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth"><Button variant="ghost" size="sm">{t("nav.login")}</Button></Link>
          )}

          {/* CTA */}
          <Link to="/add-place">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shadow-soft">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav.addPlace")}</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
