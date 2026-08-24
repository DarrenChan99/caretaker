import type { MetadataRoute } from "next";

/** Installable to a tablet home screen as the 家 tile — Popo's most likely device. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Caretaker",
    short_name: "Caretaker",
    description: "A screen that speaks Popo's language.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1ea",
    theme_color: "#4f7d5e",
    icons: [
      { src: "/logo-mark.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-1024.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
    ],
  };
}
