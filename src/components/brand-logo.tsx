import logoAr from "@/assets/logo-ar.webp";

export function BrandLogo({
  className = "h-10 w-10",
}: {
  className?: string;
  forceLang?: "ar" | "en" | "fr";
}) {
  // Use single logo for SSR/client consistency to avoid hydration mismatch.
  return (
    <img
      src={logoAr}
      alt="Dalilik — دليلك"
      width={88}
      height={88}
      className={`${className} object-contain select-none`}
      draggable={false}
      fetchPriority="high"
    />
  );
}
