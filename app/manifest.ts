import type { MetadataRoute } from "next";

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
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
