"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-5xl flex-col items-center py-20 px-6 sm:px-12">
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <Image
            src="/logo.png" // replace with your plane logo file
            alt="StockPilot Logo"
            width={48}
            height={48}
          />
          <span className="text-3xl font-semibold text-black dark:text-zinc-50">
            StockPilot
          </span>
        </div>

        {/* Hero Section */}
        <section className="text-center max-w-2xl mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-zinc-50 leading-tight">
            Never run out of supplies again.
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            StockPilot tracks your business’s recurring supply needs and alerts you 
            exactly when it’s time to restock — saving you money, time, and stress.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="rounded-full bg-black text-white px-8 py-3 text-lg font-medium hover:bg-neutral-800 transition"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="rounded-full border border-black/[.15] dark:border-white/[.2] px-8 py-3 text-lg font-medium text-black dark:text-white hover:bg-black/[.05] dark:hover:bg-white/[.05] transition"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="grid sm:grid-cols-3 gap-10 max-w-4xl mb-24">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
              Smart Restock Alerts
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              StockPilot learns your purchase patterns and notifies you before 
              you run out — never miss a restock again.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
              Track All Supplies
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Pens, paper, cleaning supplies, printer ink — if your business uses it, 
              StockPilot tracks it.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
              Simple & Reliable
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Designed to be straightforward. No clutter, no confusing dashboards — just
              the info you need.
            </p>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="max-w-lg text-center mb-24">
          <h2 className="text-3xl font-bold text-black dark:text-zinc-50 mb-4">
            Simple Pricing
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            One flat monthly rate. No tiers. No confusing add-ons.
          </p>

          <div className="p-8 rounded-xl bg-white dark:bg-zinc-900 shadow-lg">
            <p className="text-5xl font-bold text-black dark:text-white mb-2">$9</p>
            <p className="text-zinc-600 dark:text-zinc-400">per month</p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-full bg-black text-white px-8 py-3 text-lg font-medium hover:bg-neutral-800 transition"
            >
              Start Subscription
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-10">
          © {new Date().getFullYear()} StockPilot. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
