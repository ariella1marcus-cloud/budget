import localFont from "next/font/local";

export const yarden = localFont({
  src: [
    {
      path: "./yarden-regular-alefalefalef.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./yarden-bold-alefalefalef.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-yarden",
  fallback: ["Arial", "Helvetica", "sans-serif"],
  display: "swap",
});
