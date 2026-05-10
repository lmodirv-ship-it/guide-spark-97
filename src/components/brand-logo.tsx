import { useTranslation } from "react-i18next";
import logoAr from "@/assets/logo-ar.png";
import logoEn from "@/assets/logo-en.png";

export function BrandLogo({
  className = "h-10 w-10",
  forceLang,
}: {
  className?: string;
  forceLang?: "ar" | "en" | "fr";
}) {
  const { i18n } = useTranslation();
  const lang = forceLang ?? i18n.language;
  const src = lang === "ar" ? logoAr : logoEn;
  return (
    <img
      src={src}
      alt="Dalilik — دليلك"
      className={`${className} object-contain select-none`}
      draggable={false}
    />
  );
}
