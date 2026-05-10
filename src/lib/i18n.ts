import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ar: {
    translation: {
      brand: "دليلك",
      tagline: "اكتشف الأفضل حولك",
      nav: {
        home: "الرئيسية",
        posts: "المنشورات",
        articles: "المقالات",
        offers: "العروض",
        contact: "اتصال بنا",
        addPlace: "أضف مكانك",
        login: "تسجيل الدخول",
        signup: "إنشاء حساب",
        favorites: "المفضلة",
        admin: "لوحة التحكم",
        logout: "خروج",
      },
      hero: {
        title: "اكتشف أفضل الأماكن",
        subtitle: "مطاعم، مقاهي، صيدليات، متاجر وأكثر في مدينتك",
        searchPlaceholder: "مطعم، مقهى، صيدلية...",
        searchLabel: "ما الذي تبحث عنه؟",
        cityLabel: "المدينة",
        categoryLabel: "التصنيف",
        sortLabel: "فرز حسب",
        all: "الكل",
        nearest: "الأقرب إليك",
        topRated: "الأعلى تقييماً",
        newest: "الأحدث",
        searchBtn: "بحث",
      },
      categories: { title: "التصنيفات", more: "المزيد", places: "أماكن" },
      nearby: { title: "أفضل الأماكن القريبة منك", viewAll: "عرض الكل" },
      filter: {
        title: "تصفية البحث",
        category: "التصنيف",
        rating: "التقييم",
        price: "نطاق السعر (درهم)",
        showResults: "عرض النتائج",
      },
      app: {
        title: "تطبيق دليلك",
        subtitle: "حمل التطبيق الآن واكتشف الأماكن من حولك",
        google: "Google Play",
        apple: "App Store",
      },
      features: {
        places: { t: "آلاف الأماكن", d: "اكتشف أفضل الأماكن حولك" },
        reviews: { t: "تقييمات حقيقية", d: "تقييمات من أشخاص حقيقيين" },
        info: { t: "معلومات موثوقة", d: "معلومات دقيقة ومحدثة دائماً" },
        support: { t: "دعم 24/7", d: "نحن هنا لمساعدتك دائماً" },
      },
      place: {
        openNow: "مفتوح الآن",
        closed: "مغلق",
        viewDetails: "عرض التفاصيل",
        call: "اتصل",
        directions: "الاتجاهات",
        share: "مشاركة",
        addReview: "أضف تقييم",
        reviews: "تقييمات",
      },
      auth: {
        emailPlaceholder: "البريد الإلكتروني",
        passwordPlaceholder: "كلمة المرور",
        namePlaceholder: "الاسم الكامل",
        loginTitle: "تسجيل الدخول إلى دليلك",
        signupTitle: "إنشاء حساب جديد",
        loginBtn: "دخول",
        signupBtn: "تسجيل",
        switchToSignup: "ليس لديك حساب؟ سجّل الآن",
        switchToLogin: "لديك حساب؟ تسجيل الدخول",
        google: "المتابعة بحساب Google",
        or: "أو",
      },
      footer: { rights: "© 2026 دليلك. جميع الحقوق محفوظة." },
    },
  },
  fr: {
    translation: {
      brand: "Dalilik",
      tagline: "Découvrez le meilleur autour de vous",
      nav: {
        home: "Accueil",
        posts: "Publications",
        articles: "Articles",
        offers: "Offres",
        contact: "Contact",
        addPlace: "Ajouter un lieu",
        login: "Connexion",
        signup: "Inscription",
        favorites: "Favoris",
        admin: "Tableau de bord",
        logout: "Déconnexion",
      },
      hero: {
        title: "Découvrez les meilleurs endroits",
        subtitle: "Restaurants, cafés, pharmacies et plus dans votre ville",
        searchPlaceholder: "Restaurant, café, pharmacie...",
        searchLabel: "Que cherchez-vous?",
        cityLabel: "Ville",
        categoryLabel: "Catégorie",
        sortLabel: "Trier par",
        all: "Tous",
        nearest: "Plus proche",
        topRated: "Mieux notés",
        newest: "Récents",
        searchBtn: "Rechercher",
      },
      categories: { title: "Catégories", more: "Plus", places: "lieux" },
      nearby: { title: "Meilleurs endroits près de vous", viewAll: "Voir tout" },
      filter: { title: "Filtres", category: "Catégorie", rating: "Note", price: "Prix (MAD)", showResults: "Afficher" },
      app: { title: "Application Dalilik", subtitle: "Téléchargez l'app maintenant", google: "Google Play", apple: "App Store" },
      features: {
        places: { t: "Milliers de lieux", d: "Découvrez le meilleur autour de vous" },
        reviews: { t: "Avis authentiques", d: "De vrais utilisateurs" },
        info: { t: "Infos fiables", d: "Données précises et à jour" },
        support: { t: "Support 24/7", d: "Toujours là pour vous" },
      },
      place: { openNow: "Ouvert", closed: "Fermé", viewDetails: "Détails", call: "Appeler", directions: "Itinéraire", share: "Partager", addReview: "Avis", reviews: "avis" },
      auth: {
        emailPlaceholder: "Email", passwordPlaceholder: "Mot de passe", namePlaceholder: "Nom complet",
        loginTitle: "Connexion à Dalilik", signupTitle: "Créer un compte",
        loginBtn: "Se connecter", signupBtn: "S'inscrire",
        switchToSignup: "Pas de compte? Inscrivez-vous", switchToLogin: "Déjà un compte? Connexion",
        google: "Continuer avec Google", or: "ou",
      },
      footer: { rights: "© 2026 Dalilik. Tous droits réservés." },
    },
  },
  en: {
    translation: {
      brand: "Dalilik",
      tagline: "Discover the best around you",
      nav: {
        home: "Home", posts: "Posts", articles: "Articles", offers: "Offers", contact: "Contact",
        addPlace: "Add your place", login: "Sign in", signup: "Sign up",
        favorites: "Favorites", admin: "Dashboard", logout: "Logout",
      },
      hero: {
        title: "Discover the best places",
        subtitle: "Restaurants, cafes, pharmacies and more in your city",
        searchPlaceholder: "Restaurant, cafe, pharmacy...",
        searchLabel: "What are you looking for?",
        cityLabel: "City", categoryLabel: "Category", sortLabel: "Sort by",
        all: "All", nearest: "Nearest", topRated: "Top rated", newest: "Newest",
        searchBtn: "Search",
      },
      categories: { title: "Categories", more: "More", places: "places" },
      nearby: { title: "Top places near you", viewAll: "View all" },
      filter: { title: "Filter", category: "Category", rating: "Rating", price: "Price (MAD)", showResults: "Show results" },
      app: { title: "Dalilik App", subtitle: "Download the app and discover places", google: "Google Play", apple: "App Store" },
      features: {
        places: { t: "Thousands of places", d: "Discover the best around you" },
        reviews: { t: "Real reviews", d: "From real people" },
        info: { t: "Trusted info", d: "Accurate, always up-to-date" },
        support: { t: "24/7 support", d: "We're here to help" },
      },
      place: { openNow: "Open now", closed: "Closed", viewDetails: "View details", call: "Call", directions: "Directions", share: "Share", addReview: "Add review", reviews: "reviews" },
      auth: {
        emailPlaceholder: "Email", passwordPlaceholder: "Password", namePlaceholder: "Full name",
        loginTitle: "Sign in to Dalilik", signupTitle: "Create your account",
        loginBtn: "Sign in", signupBtn: "Sign up",
        switchToSignup: "No account? Sign up", switchToLogin: "Have an account? Sign in",
        google: "Continue with Google", or: "or",
      },
      footer: { rights: "© 2026 Dalilik. All rights reserved." },
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: typeof window !== "undefined" ? localStorage.getItem("lang") || "ar" : "ar",
    fallbackLng: "ar",
    interpolation: { escapeValue: false },
  });
}

export const setLanguage = (lng: "ar" | "fr" | "en") => {
  i18n.changeLanguage(lng);
  if (typeof window !== "undefined") {
    localStorage.setItem("lang", lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  }
};

export default i18n;
