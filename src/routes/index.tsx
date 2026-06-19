import { createFileRoute } from "@tanstack/react-router";
import Home from "@/components/Home";
import amisHero from "@/assets/portfolio/amis_ballers.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "​william gutang designs - wg designs — Jersey & Apparel Design" },
      { name: "description", content: "Custom sports jerseys, esports apparel, team uniforms and streetwear by William Gutang." },
      { property: "og:title", content: "​william gutang designs - wg designs" },
      { property: "og:description", content: "Bold visual identities for teams, brands, and organizations." },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: amisHero.url, fetchpriority: "high" },
    ],
  }),
  component: Home,
});

