import { createFileRoute } from "@tanstack/react-router";
import Home from "@/components/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "https://www.facebook.com/william.d.gutang/ — Jersey & Apparel Design" },
      { name: "description", content: "Custom sports jerseys, esports apparel, team uniforms and streetwear by William Gutang." },
      { property: "og:title", content: "https://www.facebook.com/william.d.gutang/" },
      { property: "og:description", content: "Bold visual identities for teams, brands, and organizations." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});
