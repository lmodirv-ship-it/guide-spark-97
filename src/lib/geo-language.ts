import { setLanguage } from "@/lib/i18n";

// Map ISO country codes to one of the supported UI languages: ar | fr | en
const AR_COUNTRIES = new Set([
  "MA", "DZ", "TN", "LY", "EG", "SD", "SA", "AE", "QA", "BH", "KW", "OM",
  "YE", "JO", "LB", "SY", "IQ", "PS", "MR", "SO", "DJ", "KM",
]);

const FR_COUNTRIES = new Set([
  "FR", "BE", "LU", "MC", "CH", "CA", "SN", "CI", "ML", "BF", "NE", "TG",
  "BJ", "GA", "CG", "CD", "CM", "MG", "RE", "GP", "MQ", "GF", "HT", "RW",
  "BI", "TD",
]);

export type SupportedLang = "ar" | "fr" | "en";

export function languageForCountry(code?: string | null): SupportedLang {
  if (!code) return "en";
  const c = code.toUpperCase();
  if (AR_COUNTRIES.has(c)) return "ar";
  if (FR_COUNTRIES.has(c)) return "fr";
  return "en";
}

const KEY_DETECTED = "lang_geo_detected";
const KEY_LANG = "lang";

export async function autoDetectAndApplyLanguage() {
  if (typeof window === "undefined") return;
  // Respect user's manual choice (set once via setLanguage) and don't redo detection
  if (localStorage.getItem(KEY_LANG) || localStorage.getItem(KEY_DETECTED)) return;
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { country_code?: string; languages?: string };
    const lang = languageForCountry(data.country_code);
    localStorage.setItem(KEY_DETECTED, "1");
    setLanguage(lang);
  } catch {
    // silent fail — keep default
  }
}
