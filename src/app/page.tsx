import SiteHeader from "@/components/layout/SiteHeader";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="mx-auto flex flex-1 max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Algorithmic Decisions for Smarter Trading
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          DeciTrade gives you real-time financial metrics, automated signal tracking,
          and clean market visualizations.
        </p>
        <div className="mt-8 flex gap-4">
          <button className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Get Started
          </button>
          <button className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
            Explore Markets
          </button>
        </div>
      </section>
    </div>
  );
}