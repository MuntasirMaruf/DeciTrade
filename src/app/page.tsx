import Footer from "@/components/layout/Footer";
import SiteHeader from "@/components/layout/SiteHeader";
import Button from "@/components/ui/Button";
import {
  ArrowRight,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Truck,
  Sparkles,
  Trash2,
  Clock,
  Download,
  Share2,
  ShieldAlert,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      {/* 1. Hero Section */}
      <section className="mx-auto flex flex-1 max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
          Algorithmic Decisions for Smarter Trading
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          DeciTrade gives you real-time financial metrics, automated signal tracking,
          and clean market visualizations.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button size="lg">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg">
            Explore Markets
          </Button>
        </div>
      </section>

      {/* 2. Interactive Button Showcase Section */}
      <section className="border-t border-border bg-card/40 py-16 px-6">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Design System
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
              Button Variants & Accent Combinations
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              5 core variants with infinite chameleon accents powered by Tailwind v4 design tokens.
            </p>
          </div>

          {/* Group 1: Core Semantic Variants */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground">1. Core Semantic Variants</h3>
              <p className="text-xs text-muted-foreground">Standardized hierarchy for CTAs and supporting actions.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary (solid)</Button>
              <Button variant="secondary">Secondary (surface)</Button>
              <Button variant="outline">Outline (bordered)</Button>
              <Button variant="ghost">Ghost (subdued)</Button>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4" />
                <span>Destructive (solid red)</span>
              </Button>
            </div>
          </div>

          {/* Group 2: The Chameleon "tinted" Variant with Infinite Accents */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground">
                2. Chameleon &ldquo;tinted&rdquo; Variant (Tinted Surface + Border)
              </h3>
              <p className="text-xs text-muted-foreground">
                Sets border &amp; background via <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">currentColor</code> with zero class collisions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Red / Sign Out */}
              <Button variant="tinted" size="sm" className="text-destructive">
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out (Destructive)</span>
              </Button>

              {/* Amber / Needs Attention */}
              <Button variant="tinted" size="sm" className="text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Pending Review (Amber)</span>
              </Button>

              {/* Emerald / Success */}
              <Button variant="tinted" size="sm" className="text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Order Delivered (Green)</span>
              </Button>

              {/* Sky / Transit */}
              <Button variant="tinted" size="sm" className="text-sky-600 dark:text-sky-400">
                <Truck className="w-3.5 h-3.5" />
                <span>In Transit (Blue)</span>
              </Button>

              {/* Purple / VIP Promo */}
              <Button variant="tinted" size="sm" className="text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VIP Wholesale (Purple)</span>
              </Button>
            </div>
          </div>

          {/* Group 3: The Chameleon "outline" Variant with Accents */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground">
                3. Chameleon &ldquo;outline&rdquo; Variant (Canvas Background + Colored Border)
              </h3>
              <p className="text-xs text-muted-foreground">
                Crisp border + canvas background at rest, with a tinted matching hover wash.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" className="text-destructive">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Revoke Access</span>
              </Button>

              <Button variant="outline" size="sm" className="text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Expedited Processing</span>
              </Button>

              <Button variant="outline" size="sm" className="text-sky-600 dark:text-sky-400">
                <Download className="w-3.5 h-3.5" />
                <span>Export Manifest (CSV)</span>
              </Button>
            </div>
          </div>

          {/* Group 4: Sizes & Shapes */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground">4. Size Presets</h3>
              <p className="text-xs text-muted-foreground">From compact tables to hero CTAs and square icon buttons.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Large (lg)</Button>
              <Button size="md">Medium (md - default)</Button>
              <Button size="sm">Small (sm)</Button>
              <Button size="icon" variant="outline" aria-label="Share">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Group 5: Interactive & Disabled States */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground">5. Async Loading &amp; Disabled States</h3>
              <p className="text-xs text-muted-foreground">Built-in animated spinner and disabled opacity.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button isLoading>Saving Order...</Button>
              <Button variant="destructive" isLoading>Deleting...</Button>
              <Button disabled>Disabled Button</Button>
              <Button variant="outline" disabled>Disabled Outline</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}