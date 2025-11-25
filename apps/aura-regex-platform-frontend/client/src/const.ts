// shared/const.ts أو client/src/const.ts

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Aura Regex Platform";

export const APP_LOGO = "https://placehold.co/128x128/2563EB/FFFFFF?text=★&font=roboto";

// هذا الرابط هو الوحيد اللي الـ OAuth Portal بيقبله حاليًا
export const getLoginUrl = () => {
  const origin = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
  const appId = import.meta.env.VITE_APP_ID || "aura-regex-platform-local";
  
  const redirectUri = `${origin}/api/oauth/callback`;
  const state = btoa(redirectUri + Date.now());

  // مهم جدًا: نستخدم /login لأن الـ OAuth Portal لسه متعرف عليه كده
  return `http://localhost:8000/api/auth/login?appId=${appId}&redirectUri=${encodeURIComponent(redirectUri)}&state=${state}`;
};