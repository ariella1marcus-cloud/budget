import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "התקציב שלי",
    short_name: "תקציב",
    description: "ניהול הכנסות והוצאות אישי",
    start_url: "/",
    display: "standalone",
    background_color: "#ECEAE0",
    theme_color: "#4f46e5",
    dir: "rtl",
    lang: "he",
  };
}
