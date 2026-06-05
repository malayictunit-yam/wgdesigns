import { createFileRoute } from "@tanstack/react-router";
import Home from "@/components/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "William Gutang Design Studio — Jersey & Apparel Design" },
      { name: "description", content: "Custom sports jerseys, esports apparel, team uniforms and streetwear by William Gutang." },
      { property: "og:title", content: "William Gutang Design Studio" },
      { property: "og:description", content: "Bold visual identities for teams, brands, and organizations." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});
