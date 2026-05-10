import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/60 bg-card mt-16">
      <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="font-bold">{t("brand")}</div>
        </div>
        <p className="text-sm text-muted-foreground">{t("footer.rights")}</p>
      </div>
    </footer>
  );
}
