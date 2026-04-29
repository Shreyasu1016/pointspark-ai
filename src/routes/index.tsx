import { createFileRoute } from "@tanstack/react-router";
import {
  Plane,
  Wallet,
  ShoppingBag,
  GitCompare,
  Clock,
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  Lock,
} from "lucide-react";
import heroMesh from "@/assets/hero-mesh.jpg";
import { ChatPanel } from "@/components/ChatPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PointsIQ — AI Advisor for Credit Card Rewards" },
      {
        name: "description",
        content:
          "Chat with an AI that knows every Indian and global card reward program. Maximize points, decode redemptions, no signup.",
      },
      {
        property: "og:title",
        content: "PointsIQ — AI Advisor for Credit Card Rewards",
      },
      {
        property: "og:description",
        content:
          "Privacy-first AI that helps you squeeze every paisa from your reward points across HDFC, ICICI, SBI, Axis, Amex and more.",
      },
    ],
  }),
  component: Index,
});

const CATEGORIES = [
  {
    icon: Plane,
    title: "Travel & Miles",
    desc: "Best transfer partners, sweet spots, and award-chart hacks across Air India, KrisFlyer, Avios.",
    accent: "from-brand-purple to-brand-teal",
  },
  {
    icon: Wallet,
    title: "Cashback Strategy",
    desc: "When statement credit beats vouchers, and how to stack with bank offers.",
    accent: "from-brand-teal to-brand-coral",
  },
  {
    icon: ShoppingBag,
    title: "Shopping & Dining",
    desc: "Pick the right card per merchant — Amazon, Flipkart, Swiggy, BigBasket.",
    accent: "from-brand-coral to-brand-purple",
  },
  {
    icon: GitCompare,
    title: "Card Comparison",
    desc: "Side-by-side compare Magnus vs Atlas, Infinia vs Diners Black, in plain rupees.",
    accent: "from-brand-purple to-brand-coral",
  },
  {
    icon: Clock,
    title: "Expiry Strategy",
    desc: "Save expiring points with the highest paise-per-point redemption right now.",
    accent: "from-brand-teal to-brand-purple",
  },
  {
    icon: ArrowRightLeft,
    title: "Transfer Partners",
    desc: "Bonus transfer windows, partner ratios, and which programs to pool into.",
    accent: "from-brand-coral to-brand-teal",
  },
];

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Hero background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <img
          src={heroMesh}
          alt=""
          width={1920}
          height={1280}
          className="h-full w-full object-cover opacity-60"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, transparent 0%, var(--background) 80%)",
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-purple">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Points<span className="text-gradient">IQ</span>
          </span>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-surface-1/60 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-teal" />
          No signup · No data stored
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-8 sm:pt-14">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-1/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-teal" />
            </span>
            AI advisor · Live now
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Every reward point,{" "}
            <span className="text-gradient">finally worth what it should</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Chat with an AI that knows HDFC, ICICI, SBI, Axis, Amex, airline
            miles and hotel programs in detail. Compare cards, decode
            redemptions, and find the highest paise-per-point — anonymously.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <Pill icon={Lock}>Never asks for card numbers</Pill>
            <Pill icon={ShieldCheck}>No login required</Pill>
            <Pill icon={Sparkles}>Real reward math</Pill>
          </div>
        </section>

        {/* Chat */}
        <section className="mt-10 sm:mt-14" id="chat">
          <ChatPanel />
        </section>

        {/* Categories */}
        <section className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              What you can ask
            </h2>
            <p className="mt-3 text-muted-foreground">
              From everyday cashback to rare award-chart sweet spots — PointsIQ
              has an answer.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div
                key={c.title}
                className="group glass relative overflow-hidden rounded-2xl p-5 transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent} shadow-glow-purple`}
                >
                  <c.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy section */}
        <section className="mt-20">
          <div className="glass mx-auto max-w-3xl rounded-3xl p-8 text-center sm:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-coral shadow-glow-teal">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Built privacy-first, by design
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              PointsIQ never asks for — and is instructed to refuse — card
              numbers, CVV, PIN, OTP, Aadhaar, PAN, or any personal info. No
              accounts, no tracking pixels, no profile.
            </p>
          </div>
        </section>

        <footer className="mt-20 text-center text-xs text-muted-foreground">
          <p>
            PointsIQ is an independent advisor. Always verify current rates on
            the issuer's website before big redemptions.
          </p>
        </footer>
      </main>
    </div>
  );
}

function Pill({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-1/60 px-3 py-1 backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-brand-teal" />
      {children}
    </span>
  );
}
