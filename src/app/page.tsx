import Footer from "@/components/layout/Footer";
import SiteHeader from "@/components/layout/SiteHeader";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="mx-auto flex flex-1 max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Algorithmic Decisions for Smarter Trading
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          DeciTrade gives you real-time financial metrics, automated signal tracking,
          and clean market visualizations.
        </p>
        <div className="mt-8 flex gap-4">
          <button className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
            Get Started
          </button>
          <button className="rounded-lg border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer">
            Explore Markets
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}