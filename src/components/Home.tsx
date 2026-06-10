import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu, X, ArrowRight, Search, Send, Mail, Facebook, Instagram, MessageCircle,
  Star, Trophy, Users, Sparkles, ChevronDown, Palette, Type, Layers, Shirt,
  Crown, Flame, CheckCircle2, Play, Quote
} from "lucide-react";
import { projects as staticProjects, categories, type Category, type Project } from "@/data/projects";
import wgLogo from "@/assets/wgdesigns_logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

let _cache: Project[] | null = null;
function useLiveProjects(): Project[] {
  const [list, setList] = useState<Project[]>(_cache ?? staticProjects);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,title,category,client,image_url,description,palette,typography,featured,sort_order")
        .order("sort_order", { ascending: true });
      if (cancelled || error || !data) return;
      const mapped: Project[] = data.map((r: any) => ({
        id: r.id, title: r.title, category: r.category as Category, client: r.client,
        image: r.image_url, description: r.description, palette: r.palette || [],
        typography: r.typography || undefined, featured: r.featured,
      }));
      _cache = mapped;
      setList(mapped);
    })();
    return () => { cancelled = true; };
  }, []);
  return list;
}

/* ------------ small primitives ------------ */
const Section = ({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`relative scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 ${className}`}>
    <div className="mx-auto max-w-7xl">{children}</div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[color:var(--gold)]">
    <span className="size-1.5 rounded-full bg-[color:var(--gold)]" />
    {children}
  </span>
);

const SectionHeading = ({ eyebrow, title, accent, subtitle, center = false }:
  { eyebrow?: string; title: string; accent?: string; subtitle?: string; center?: boolean }) => (
  <div className={`mb-14 ${center ? "text-center" : ""}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="mt-4 font-display text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
      {title} {accent && <span className="text-gradient-gold">{accent}</span>}
    </h2>
    {subtitle && <p className={`mt-4 max-w-2xl text-[15px] text-muted-foreground ${center ? "mx-auto" : ""}`}>{subtitle}</p>}
  </div>
);

/* ------------ Nav ------------ */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll(); window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["About", "#about"], ["Portfolio", "#portfolio"], ["Process", "#process"],
    ["Services", "#services"], ["Testimonials", "#testimonials"], ["Contact", "#contact"],
  ] as const;
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/60" : ""}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" className="group flex items-center gap-3">
          <img src={wgLogo.url} alt="WG Designs logo" className="size-10 rounded-md object-contain" />
          <span className="hidden font-display text-lg leading-none sm:block">
            ​william gutang designs - wg designs
          </span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="text-[13px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground">
              {l}
            </a>
          ))}
          <a href="#contact" className="group inline-flex items-center gap-2 rounded-md bg-[color:var(--gold)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-black transition-all hover:shadow-glow-gold">
            Hire me <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <button className="md:hidden" onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-border/60 bg-background/95 md:hidden">
          <div className="flex flex-col gap-1 px-5 py-3">
            {links.map(([l, h]) => (
              <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm uppercase tracking-widest hover:bg-secondary">{l}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------ Hero (Full-screen Carousel) ------------ */
function Hero() {
  const projects = useLiveProjects();
  const slides = useMemo(() => {
    const wanted = ["amis", "islandbonitas", "apex", "mobilelegends", "onelove", "dentols", "cyclingyellow", "bolaboc"];
    const picks = wanted.map(id => projects.find(p => p.id === id)).filter(Boolean) as Project[];
    return picks.length ? picks : projects.slice(0, 6);
  }, [projects]);
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = (d: number) => setI(v => (v + d + n) % n);
  const to = (idx: number) => setI(((idx % n) + n) % n);

  // autoplay
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n]);

  // touch swipe
  const [tx, setTx] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTx(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    setTx(null);
  };

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* slides */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${idx === i ? "opacity-100" : "opacity-0"}`}
          aria-hidden={idx !== i}
        >
          <img
            src={s.image}
            alt={s.title}
            className={`size-full object-cover ${idx === i ? "animate-hero-zoom" : ""}`}
            loading={idx === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        </div>
      ))}

      {/* centered content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center sm:px-8">
        <div className="animate-fade-up">
          <Eyebrow>William Gutang Design Studio · Available for Projects</Eyebrow>
          <h1 className="mt-6 font-display text-[44px] leading-[0.95] sm:text-6xl lg:text-[88px]">
            Transforming Ideas Into <br />
            <span className="text-gradient-gold">Winning</span>{" "}
            <span className="text-gradient-royal">Apparel</span> Designs
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:text-base">
            Professional Designer Specializing in Custom Jerseys, Sportswear,
            Team Uniforms, T-Shirts, and Merchandise Branding.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#portfolio" className="group inline-flex items-center gap-2 rounded-md bg-[color:var(--royal)] px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition-all hover:shadow-glow-royal">
              View Portfolio <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-md border border-[color:var(--gold)]/60 bg-black/30 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold)] backdrop-blur transition-all hover:bg-[color:var(--gold)]/15">
              Start a Project
            </a>
          </div>
        </div>
      </div>

      {/* arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] sm:left-6"
      >
        <ArrowRight className="size-5 rotate-180" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] sm:right-6"
      >
        <ArrowRight className="size-5" />
      </button>

      {/* dots */}
      <div className="absolute inset-x-0 bottom-20 z-20 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => to(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-[color:var(--gold)]" : "w-3 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>

      {/* scroll cue */}
      <a href="#about" className="absolute inset-x-0 bottom-6 z-20 mx-auto flex w-fit items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-[color:var(--gold)]">
        Scroll <ChevronDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}

/* ------------ About ------------ */
function About() {
  const stats = [
    { icon: Trophy, v: "100+", k: "Projects Completed" },
    { icon: Users, v: "20+", k: "Clients Served" },
    { icon: Sparkles, v: "3+", k: "Years Experience" },
    { icon: Shirt, v: "12+", k: "Apparel Categories" },
  ];
  return (
    <Section id="about">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Eyebrow>About the Studio</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
            Designs Built to <span className="text-gradient-royal">Win</span>, <br />
            Crafted to <span className="text-gradient-gold">Last</span>.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
            William Gutang is a graphic designer specializing in custom apparel design.
            With expertise in sports jerseys, team uniforms, event shirts, and merchandise
            branding, he creates visually impactful designs that help teams and
            organizations stand out — from local barangay leagues to esports tournaments.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Sublimation-Ready","Print-Ready Files","Vector Source","Mockup Presentation","Brand Systems"].map(s => (
              <span key={s} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">{s}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map(s => (
            <div key={s.k} className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-[color:var(--gold)]/40">
              <div className="absolute -right-6 -top-6 size-24 rounded-full bg-[color:var(--royal)]/20 blur-2xl transition-all group-hover:bg-[color:var(--gold)]/20" />
              <s.icon className="size-6 text-[color:var(--gold)]" />
              <div className="mt-6 font-display text-5xl text-gradient-gold">{s.v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{s.k}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------ Services ------------ */
function Services() {
  const items = [
    { icon: Shirt, t: "Custom Jersey Design", d: "Sublimation-ready basketball, volleyball, and football kits." },
    { icon: Type, t: "T-Shirt Design", d: "Editorial graphics, mascots, and typographic statements." },
    { icon: Users, t: "Team Uniform Design", d: "Full uniform systems with consistent identity across roles." },
    { icon: Flame, t: "Esports Apparel", d: "Tech-driven jerseys for competitive gaming teams." },
    { icon: Crown, t: "Sports Branding", d: "Logos, crests, and visual systems for clubs and leagues." },
    { icon: Sparkles, t: "Event Shirt Design", d: "Anniversaries, fun-runs, alumni homecomings, festivals." },
    { icon: Layers, t: "Merchandise Design", d: "Retail-ready streetwear, polos, hoodies, and accessories." },
    { icon: CheckCircle2, t: "Print-Ready Artwork", d: "Properly separated, color-corrected, production files." },
  ];
  return (
    <Section id="services" className="bg-surface/40">
      <SectionHeading eyebrow="What I Do" title="Services" accent="On the Bench" subtitle="From single tees to full team systems, every project is delivered production-ready." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(i => (
          <div key={i.t} className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-[color:var(--royal)]/60 hover:shadow-glow-royal">
            <div className="mb-5 inline-grid size-12 place-items-center rounded-lg bg-[color:var(--royal)]/15 text-[color:var(--royal)] transition-colors group-hover:bg-[color:var(--gold)]/20 group-hover:text-[color:var(--gold)]">
              <i.icon className="size-5" />
            </div>
            <h3 className="font-display text-xl">{i.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------ Portfolio ------------ */
function Portfolio({ onOpen }: { onOpen: (p: Project) => void }) {
  const projects = useLiveProjects();
  const [active, setActive] = useState<"All" | Category>("All");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => projects.filter(p =>
    (active === "All" || p.category === active) &&
    (q === "" || (p.title + p.client + p.category).toLowerCase().includes(q.toLowerCase()))
  ), [active, q, projects]);

  return (
    <Section id="portfolio">
      <SectionHeading eyebrow="Selected Work" title="The Locker" accent="Room" subtitle="Real production designs delivered for teams, brands and events." />

      <div className="mb-8 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["All", ...categories] as const).map(c => (
            <button key={c} onClick={() => setActive(c)}
              className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all ${
                active === c
                  ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-black"
                  : "border-border bg-secondary text-muted-foreground hover:border-[color:var(--gold)]/60 hover:text-foreground"
              }`}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects…"
            className="w-full rounded-full border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-[color:var(--gold)] focus:outline-none" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <button key={p.id} onClick={() => onOpen(p)}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface text-left transition-all hover:-translate-y-1 hover:border-[color:var(--gold)]/50 hover:shadow-glow-gold">
            <div className="relative aspect-[4/5] overflow-hidden bg-black">
              <img src={p.image} alt={p.title} loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[color:var(--gold)] backdrop-blur">{p.category}</span>
                <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-mono text-white/70 backdrop-blur">#{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[color:var(--gold)]">
                  View Project <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
            <div className="space-y-1 p-5">
              <h3 className="font-display text-xl leading-tight">{p.title}</h3>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.client}</p>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No projects match your filters yet.</div>
      )}
    </Section>
  );
}

/* ------------ Project Lightbox ------------ */
function Lightbox({ p, onClose }: { p: Project | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = p ? "hidden" : "";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [p, onClose]);
  if (!p) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-xl animate-fade-up" onClick={onClose}>
      <div className="relative grid w-full max-w-6xl gap-0 overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-[1.1fr_0.9fr]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-black/70 text-white hover:bg-[color:var(--gold)] hover:text-black">
          <X className="size-5" />
        </button>
        <img src={p.image} alt={p.title} className="size-full max-h-[80vh] object-contain bg-black" />
        <div className="space-y-5 p-8">
          <span className="rounded-full border border-[color:var(--gold)]/40 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">{p.category}</span>
          <h3 className="font-display text-3xl leading-tight sm:text-4xl">{p.title}</h3>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">{p.client}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>

          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Color Palette</div>
            <div className="flex flex-wrap gap-2">
              {p.palette.map(c => (
                <div key={c} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                  <span className="size-4 rounded-full border border-white/10" style={{ background: c }} />
                  <code className="font-mono">{c}</code>
                </div>
              ))}
            </div>
          </div>
          {p.typography && (
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Typography</div>
              <p className="font-display text-xl">{p.typography}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="#contact" onClick={onClose} className="rounded-md bg-[color:var(--gold)] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-black">Commission Similar</a>
            <button onClick={onClose} className="rounded-md border border-border px-5 py-2.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------ Featured Case Study ------------ */
function Featured() {
  const projects = useLiveProjects();
  const p = projects.find(x => x.id === "mobilelegends") || projects.find(x => x.featured) || projects[0];
  if (!p) return null;
  return (
    <Section id="featured" className="bg-surface/40">
      <SectionHeading eyebrow="Featured Case Study" title="Malay Mobile Legends" accent="Tournament" subtitle="A complete esports identity system: jersey, tournament marks, social assets and event collateral." />
      <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-black">
          <img src={p.image} alt={p.title} className="size-full object-cover" />
        </div>
        <div className="grid gap-4">
          {[
            { icon: Palette, t: "Color System", d: "Royal blue base · Gold accents · Charcoal supporting." },
            { icon: Type, t: "Typography", d: "Compressed display titles paired with monospaced data type." },
            { icon: Layers, t: "Process", d: "Brief → moodboard → sketch → vector → mockup → revisions → release files." },
            { icon: Trophy, t: "Deliverables", d: "Print-ready jersey artwork, tournament logo lockups, social kit, banners, IDs." },
          ].map(s => (
            <div key={s.t} className="flex gap-4 rounded-xl border border-border bg-background p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-[color:var(--gold)]/15 text-[color:var(--gold)]">
                <s.icon className="size-5" />
              </div>
              <div>
                <h4 className="font-display text-xl">{s.t}</h4>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------ Process ------------ */
function Process() {
  const steps = [
    { n: "01", t: "Consultation", d: "We talk goals, audience, sport, budget and timelines." },
    { n: "02", t: "Concept Development", d: "Moodboards, sketches and color directions." },
    { n: "03", t: "Design Creation", d: "Full vector artwork and mockup presentation." },
    { n: "04", t: "Revision Process", d: "Up to 3 free revision rounds per concept." },
    { n: "05", t: "Final Delivery", d: "Send-ready files, color separations and source." },
  ];
  return (
    <Section id="process">
      <SectionHeading eyebrow="Workflow" title="The Design" accent="Playbook" subtitle="A repeatable 5-step process that turns ideas into production-ready apparel." />
      <div className="relative">
        <div className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-[color:var(--gold)]/60 via-[color:var(--royal)]/40 to-transparent md:left-1/2 md:block" />
        <div className="grid gap-6 md:gap-10">
          {steps.map((s, i) => (
            <div key={s.n} className={`grid items-center gap-6 md:grid-cols-2 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="relative rounded-2xl border border-border bg-surface p-7 transition-all hover:border-[color:var(--gold)]/50">
                <div className="font-display text-7xl text-gradient-gold leading-none">{s.n}</div>
                <h3 className="mt-3 font-display text-2xl">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
              <div className="hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------ Testimonials ------------ */
function Testimonials() {
  const items = [
    { n: "Coach Rey Malicse", r: "Malay Basketball Club", q: "Our players felt like pros the moment they put the jersey on. The detail is championship-grade." },
    { n: "Anna Cahilig", r: "Island Bonitas VC", q: "William captured our team's personality and gave it a uniform that travels well — both on court and on socials." },
    { n: "Dentol", r: "Dentol's Lechon", q: "He turned our mascot into a brand. Every kit doubles as marketing for the business." },
    { n: "LYDO Malay", r: "Youthlympics 2026", q: "Reliable, fast, and detail-obsessed. Print files were flawless on first delivery." },
  ];
  return (
    <Section id="testimonials" className="bg-surface/40">
      <SectionHeading eyebrow="Client Voices" title="From the" accent="Sideline" />
      <div className="grid gap-5 md:grid-cols-2">
        {items.map(t => (
          <figure key={t.n} className="relative overflow-hidden rounded-2xl border border-border bg-background p-7">
            <Quote className="absolute right-5 top-5 size-10 text-[color:var(--gold)]/15" />
            <div className="mb-4 flex gap-0.5 text-[color:var(--gold)]">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
            </div>
            <blockquote className="text-[15px] leading-relaxed text-foreground/90">"{t.q}"</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[color:var(--royal)] to-[color:var(--gold)] font-display text-sm text-black">
                {t.n.split(" ").map(s => s[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div className="text-sm font-semibold">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ------------ Contact ------------ */
function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", type: "", budget: "", brief: "" });
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const to = "william.gutang05@gmail.com";
    const subject = `New Brief from ${form.name || "Website"}${form.type ? ` — ${form.type}` : ""}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Project Type: ${form.type}`,
      `Budget: ${form.budget}`,
      ``,
      `Brief:`,
      form.brief,
    ].join("\n");
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const w = window.open(gmail, "_blank");
    if (!w) window.location.href = mailto;
    setSent(true);
  };
  const socials = [
    { icon: Mail, label: "Email", v: "william.gutang05@gmail.com", href: "mailto:william.gutang05@gmail.com" },
    { icon: Facebook, label: "Facebook", v: "​william gutang designs - wg designs", href: "https://www.facebook.com/william.d.gutang/" },
    { icon: Instagram, label: "Instagram", v: "@williamgutang.design", href: "#" },
    { icon: MessageCircle, label: "Contact number", v: "+639686322661", href: "tel:+639686322661" },
    { icon: Send, label: "Messenger", v: "@william.d.gutang", href: "https://m.me/william.d.gutang" },
  ];
  return (
    <Section id="contact">
      <SectionHeading eyebrow="Let's Talk" title="Let's Create Your Next" accent="Winning Design" subtitle="Tell me about your team, brand or event. I'll come back with directions within 24 hours." />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your Name" name="name" placeholder="Coach / Team / Brand" value={form.name} onChange={update("name")} />
            <Field label="Email" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={update("email")} />
            <Field label="Project Type" name="type" placeholder="Basketball jersey, esports kit, event tee…" value={form.type} onChange={update("type")} />
            <Field label="Budget Range" name="budget" placeholder="Optional" value={form.budget} onChange={update("budget")} />
          </div>
          <div className="mt-5">
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Brief</label>
            <textarea required rows={5} value={form.brief} onChange={update("brief")} placeholder="Tell me about the team, colors you love, deadlines…" className="w-full rounded-lg border border-border bg-background p-4 text-sm placeholder:text-muted-foreground focus:border-[color:var(--gold)] focus:outline-none" />
          </div>
          <button type="submit" className="mt-6 inline-flex items-center gap-2 rounded-md bg-[color:var(--royal)] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-all hover:shadow-glow-royal">
            {sent ? "Sent · I'll reply soon" : <>Send Brief <Send className="size-4" /></>}
          </button>
        </form>

        <div className="space-y-3">
          {socials.map(s => (
            <a key={s.label} href={s.href} className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--gold)]/50">
              <div className="grid size-12 place-items-center rounded-lg bg-[color:var(--gold)]/15 text-[color:var(--gold)] transition-colors group-hover:bg-[color:var(--gold)] group-hover:text-black">
                <s.icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{s.label}</div>
                <div className="text-sm font-semibold">{s.v}</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</label>
      <input {...p} required className="w-full rounded-lg border border-border bg-background p-3.5 text-sm placeholder:text-muted-foreground focus:border-[color:var(--gold)] focus:outline-none" />
    </div>
  );
}

/* ------------ Footer ------------ */
function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8 lg:px-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-gradient-to-br from-[color:var(--royal)] to-[#001a55] font-display text-xl ring-gold">
              W<span className="text-[color:var(--gold)]">G</span>
            </span>
            <span className="font-display text-lg leading-none">​william gutang designs - wg designs</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Bold visual identities for teams, brands, and organizations.</p>
        </div>
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">Navigate</div>
          <ul className="space-y-2 text-sm">
            {[["About","#about"],["Portfolio","#portfolio"],["Process","#process"],["Contact","#contact"]].map(([l,h]) => (
              <li key={h}><a className="text-muted-foreground hover:text-foreground" href={h}>{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">Connect</div>
          <div className="flex gap-3">
            {[Facebook, Instagram, MessageCircle, Mail].map((I, i) => (
              <a key={i} href="#" className="grid size-10 place-items-center rounded-full border border-border bg-surface text-muted-foreground hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]">
                <I className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 px-5 py-5 text-center text-xs text-muted-foreground sm:px-8 lg:px-12">
        © {new Date().getFullYear()} ​william gutang designs - wg designs. All rights reserved.
      </div>
    </footer>
  );
}

/* ------------ Page ------------ */
export default function Home() {
  const [active, setActive] = useState<Project | null>(null);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <About />
        <Portfolio onOpen={setActive} />
        <Featured />
        <Services />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Lightbox p={active} onClose={() => setActive(null)} />
    </div>
  );
}
