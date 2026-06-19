import amis from "@/assets/portfolio/amis_ballers.webp.asset.json";
import amisThumb from "@/assets/portfolio/amis_ballers.thumb.webp.asset.json";
import malicse from "@/assets/portfolio/malicse_22.webp.asset.json";
import malicseThumb from "@/assets/portfolio/malicse_22.thumb.webp.asset.json";
import bolaboc from "@/assets/portfolio/bolaboc.webp.asset.json";
import bolabocThumb from "@/assets/portfolio/bolaboc.thumb.webp.asset.json";
import cheyn from "@/assets/portfolio/cheyn.webp.asset.json";
import cheynThumb from "@/assets/portfolio/cheyn.thumb.webp.asset.json";
import blackRed from "@/assets/portfolio/black_red_basketball.webp.asset.json";
import blackRedThumb from "@/assets/portfolio/black_red_basketball.thumb.webp.asset.json";
import minimart from "@/assets/portfolio/minimart.webp.asset.json";
import minimartThumb from "@/assets/portfolio/minimart.thumb.webp.asset.json";
import dosmil9 from "@/assets/portfolio/dosmil9.webp.asset.json";
import dosmil9Thumb from "@/assets/portfolio/dosmil9.thumb.webp.asset.json";
import islandBonitas from "@/assets/portfolio/island_bonitas.webp.asset.json";
import islandBonitasThumb from "@/assets/portfolio/island_bonitas.thumb.webp.asset.json";
import apex from "@/assets/portfolio/apex_striders.webp.asset.json";
import apexThumb from "@/assets/portfolio/apex_striders.thumb.webp.asset.json";
import cyclingRed from "@/assets/portfolio/cycling_red.webp.asset.json";
import cyclingRedThumb from "@/assets/portfolio/cycling_red.thumb.webp.asset.json";
import cyclingYellow from "@/assets/portfolio/cycling_yellow.webp.asset.json";
import cyclingYellowThumb from "@/assets/portfolio/cycling_yellow.thumb.webp.asset.json";
import mobileLegends from "@/assets/portfolio/mobile_legends.webp.asset.json";
import mobileLegendsThumb from "@/assets/portfolio/mobile_legends.thumb.webp.asset.json";
import youthlympics from "@/assets/portfolio/youthlympics.webp.asset.json";
import youthlympicsThumb from "@/assets/portfolio/youthlympics.thumb.webp.asset.json";
import oneLove from "@/assets/portfolio/one_love_malay.webp.asset.json";
import oneLoveThumb from "@/assets/portfolio/one_love_malay.thumb.webp.asset.json";
import dentols from "@/assets/portfolio/dentols_lechon.webp.asset.json";
import dentolsThumb from "@/assets/portfolio/dentols_lechon.thumb.webp.asset.json";
import barangayPolice from "@/assets/portfolio/barangay_police.webp.asset.json";
import barangayPoliceThumb from "@/assets/portfolio/barangay_police.thumb.webp.asset.json";
import aalga from "@/assets/portfolio/aalga_polo.webp.asset.json";
import aalgaThumb from "@/assets/portfolio/aalga_polo.thumb.webp.asset.json";
import jomy from "@/assets/portfolio/jomy_fishing.webp.asset.json";
import jomyThumb from "@/assets/portfolio/jomy_fishing.thumb.webp.asset.json";
import dloyals from "@/assets/portfolio/dloyals.webp.asset.json";
import dloyalsThumb from "@/assets/portfolio/dloyals.thumb.webp.asset.json";
import nabaoy from "@/assets/portfolio/nabaoy_hagad.webp.asset.json";
import nabaoyThumb from "@/assets/portfolio/nabaoy_hagad.thumb.webp.asset.json";

export type Category =
  | "Basketball"
  | "Volleyball"
  | "Running"
  | "Cycling"
  | "Esports"
  | "Corporate"
  | "Event"
  | "T-Shirt";

export interface Project {
  id: string;
  title: string;
  category: Category;
  client: string;
  image: string;
  thumb?: string;
  description: string;
  palette: string[];
  typography?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  { id: "amis", title: "AMIS Ballers Uniform", category: "Basketball", client: "AMIS Basketball Club", image: amis.url, thumb: amisThumb.url,
    description: "Aggressive black & crimson basketball kit with diagonal speed striping and bold negative-space typography.",
    palette: ["#0A0A0A", "#C8102E", "#FFFFFF"], typography: "Compressed Gothic + Block Numerals", featured: true },
  { id: "malicse", title: "Malay Basketball Club — Malicse 22", category: "Basketball", client: "Malay Basketball Club", image: malicse.url, thumb: malicseThumb.url,
    description: "Heritage club identity reimagined with sponsor-ready zones and a custom split numerical system.", palette: ["#0A0A0A", "#0057FF", "#D4AF37"] },
  { id: "bolaboc", title: "Bolaboc Sunrise Basketball", category: "Basketball", client: "Bolaboc Sunrise BC", image: bolaboc.url, thumb: bolabocThumb.url,
    description: "Sunrise gradient mesh over performance jersey base with embroidered chest typography.", palette: ["#FF8A3D", "#FFD166", "#0A0A0A"], featured: true },
  { id: "cheyn", title: "Cheyn 22 — Pink Series", category: "Basketball", client: "CHEYN Athletics", image: cheyn.url, thumb: cheynThumb.url,
    description: "Statement pink-on-white kit with a hand-drawn monogram crest and gradient side panels.", palette: ["#F5C7DB", "#E91E63", "#0A0A0A"] },
  { id: "blackred", title: "Code Red Basketball Set", category: "Basketball", client: "Private Commission", image: blackRed.url, thumb: blackRedThumb.url,
    description: "Geometric red lightning over matte black with sublimated tonal pattern.", palette: ["#0A0A0A", "#E10600", "#FFFFFF"] },
  { id: "minimart", title: "Minimart Centro #44", category: "Basketball", client: "Minimart Centro", image: minimart.url, thumb: minimartThumb.url,
    description: "High-visibility orange community league kit with retail-brand integration.", palette: ["#FF6A00", "#FFFFFF", "#0A0A0A"] },
  { id: "dosmil9", title: "DOSMIL9 Alumni Jersey", category: "Basketball", client: "Malay NHS Batch 2009", image: dosmil9.url, thumb: dosmil9Thumb.url,
    description: "Throwback alumni jersey blending school seal heritage with modern star motifs.", palette: ["#0057FF", "#FFFFFF", "#D4AF37"] },
  { id: "dentols", title: "Dentol's Lechon — Roast Squad", category: "Basketball", client: "Dentol's Lechon", image: dentols.url, thumb: dentolsThumb.url,
    description: "Mascot-led brand-sport hybrid kit with gold accents and crossed-skewer crest.", palette: ["#0A0A0A", "#D4AF37", "#C8102E"], featured: true },
  { id: "dloyals", title: "D'Loyals Whiskey Squad", category: "Basketball", client: "D'Loyals", image: dloyals.url, thumb: dloyalsThumb.url,
    description: "Premium black & gold whiskey-themed kit with vintage label typography.", palette: ["#0A0A0A", "#D4AF37", "#FFFFFF"] },
  { id: "islandbonitas", title: "Island Bonitas Volleyball", category: "Volleyball", client: "Island Bonitas VC", image: islandBonitas.url, thumb: islandBonitasThumb.url,
    description: "Coastal blue volleyball kit with wave-pattern sublimation and tonal back panel.", palette: ["#0057FF", "#FFFFFF", "#0A0A0A"], featured: true },
  { id: "apex", title: "Apex Striders Running Singlets", category: "Running", client: "Malay Apex Striders", image: apex.url, thumb: apexThumb.url,
    description: "Lightweight singlet system with reflective wordmark and dual front/back layouts.", palette: ["#0A0A0A", "#0057FF", "#FFFFFF"] },
  { id: "cyclingred", title: "Circuit Cycling Kit — Crimson", category: "Cycling", client: "Circuit Riders", image: cyclingRed.url, thumb: cyclingRedThumb.url,
    description: "Tech-themed cycling jersey with PCB-pattern background and high-contrast race numerals.", palette: ["#7A7A7A", "#E10600", "#0A0A0A"] },
  { id: "cyclingyellow", title: "Circuit Cycling Kit — Volt", category: "Cycling", client: "Circuit Riders", image: cyclingYellow.url, thumb: cyclingYellowThumb.url,
    description: "Voltage gradient cycling jersey: yellow → green → blue with tonal circuit pattern.", palette: ["#F5E14A", "#2BB673", "#0057FF"] },
  { id: "mobilelegends", title: "Malay Mobile Legends Tournament", category: "Esports", client: "Malay Food System Innovation Program", image: mobileLegends.url, thumb: mobileLegendsThumb.url,
    description: "Esports tournament identity & apparel system with metallic chrome typography.", palette: ["#0A0A0A", "#0057FF", "#D4AF37"], featured: true },
  { id: "youthlympics", title: "Youthlympics Malay 2026 — Facilitator", category: "Event", client: "Local Youth Development Office", image: youthlympics.url, thumb: youthlympicsThumb.url,
    description: "Multi-sport event jersey with crest-led front and role/number back panel.", palette: ["#9B1B1B", "#D4AF37", "#FFFFFF"] },
  { id: "onelove", title: "One Love Malay — Boracay Tee", category: "T-Shirt", client: "One Love Malay Campaign", image: oneLove.url, thumb: oneLoveThumb.url,
    description: "Tourism campaign t-shirt with bold island wordmark and unisex retail fit.", palette: ["#E10600", "#FFFFFF", "#0A0A0A"] },
  { id: "barangaypolice", title: "Barangay Police Spartan Tee", category: "Event", client: "Barangay Peace & Order", image: barangayPolice.url, thumb: barangayPoliceThumb.url,
    description: "Tactical-inspired camo tee with Spartan helmet illustration over the Philippine flag.", palette: ["#3A3A3A", "#D4AF37", "#0A0A0A"] },
  { id: "aalga", title: "AALGA Inc. Corporate Polo", category: "Corporate", client: "AALGA Inc.", image: aalga.url, thumb: aalgaThumb.url,
    description: "Executive navy polo with embroidered crest and ornamental gold panel detailing.", palette: ["#0B1B3F", "#D4AF37", "#FFFFFF"] },
  { id: "jomy", title: "JOMY Operation Team Hoodie", category: "Corporate", client: "Norway Såmbarlid Federation", image: jomy.url, thumb: jomyThumb.url,
    description: "Long-sleeve hooded performance shirt with full back graphic and embroidered chest mark.", palette: ["#0A0A0A", "#C8102E", "#FFFFFF"] },
  { id: "nabaoy", title: "Nabaoy ‘Hagad Ari’ Streetwear", category: "T-Shirt", client: "Nabaoy Community", image: nabaoy.url, thumb: nabaoyThumb.url,
    description: "Graffiti-driven streetwear tee, oversized back wordmark and chest patch.", palette: ["#0A0A0A", "#FFFFFF", "#D4AF37"] },
];

export const categories: Category[] = [
  "Basketball","Volleyball","Running","Cycling","Esports","Corporate","Event","T-Shirt",
];
