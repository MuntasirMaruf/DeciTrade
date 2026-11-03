# DeciTrade — Step-by-Step Architecture & Implementation Guide

This document is the definitive guide to the architecture, directory structure, and implementation of **DeciTrade**, built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 1. Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, v16+)
- **Library**: [React](https://react.dev/) (v19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Bundler**: Turbopack

---

## 2. Directory Structure

```text
deci-trade/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── app/                # App Router: file-system based routing
│   │   ├── (auth)/         # Route Group: omitted from URL
│   │   │   ├── layout.tsx  # Nested layout: vertically & horizontally centered auth card
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Route: /login
│   │   │   └── registration/
│   │   │       └── page.tsx        # Route: /registration
│   │   ├── favicon.ico
│   │   ├── globals.css     # Global styles & Tailwind CSS configuration
│   │   ├── layout.tsx      # Root layout: Header + <main> + Footer
│   │   └── page.tsx        # Homepage route: /
│   └── components/         # Reusable React components
│       └── layout/         # Persistent structural components
│           ├── Header.tsx  # Dark navbar with logo badge & auth navigation
│           └── Footer.tsx  # Global footer with dynamic year & links
├── guideline.md            # Architecture & implementation documentation
├── package.json
└── tsconfig.json           # Path alias configuration (@/* -> ./src/*)
```

---

## 3. Core Principles & Conventions

### A. React Components & TSX
- Components are TypeScript functions returning JSX/TSX.
- Files and functions use **PascalCase** naming (e.g., `Header`, `LoginPage`).
- Components are modular, self-contained, and reusable.

### B. Server Components vs. Client Components
- By default in the App Router, all components are **React Server Components (RSC)**. They render on the server, generating static HTML with zero client JavaScript bundle overhead.
- When a component requires browser-side state or event listeners (`useState`, `onSubmit`, `onChange`), it is declared as a **Client Component** by adding `"use client";` at the very top of the file.

### C. File-System Routing & Route Groups
- Folders inside `src/app/` map directly to URLs (`registration/` &rarr; `/registration`).
- **Route Groups `(groupName)`**: Wrapping a folder name in parentheses tells Next.js to exclude the folder name from the route URL.
  - `src/app/(auth)/login/page.tsx` &rarr; accessible at `/login`.
  - `src/app/(auth)/registration/page.tsx` &rarr; accessible at `/registration`.
- Route groups allow isolating layouts without altering URL hierarchy.

### D. Nested Layouts & Semantic Landmarks
- Next.js layouts nest automatically:
  $$\text{RootLayout} \longrightarrow \text{AuthLayout} \longrightarrow \text{Page}$$
- An HTML document must only contain **one visible `<main>` landmark**.
- The Root Layout wraps `{children}` inside `<main className="flex flex-1 flex-col">`, ensuring:
  1. Accessibility compliance without repeating `<main>` in child pages.
  2. The Sticky Footer pattern, where `<main>` stretches to fill all available vertical space.
  3. Proper flex context for nested child layouts (such as `(auth)/layout.tsx`) to vertically center their contents.

### E. React 19 Event Typing
- React 19 deprecates `FormEvent` to strictly adhere to native browser DOM specifications.
- Form submissions use `React.SubmitEvent<HTMLFormElement>`, ensuring complete type safety for `e.currentTarget`.

---

## 4. Implementation Details

### Step 1: Reusable Layout Components

#### Header (`src/components/layout/Header.tsx`)
A sticky, high-contrast dark navbar featuring:
- A rounded white brand badge (`DT`) and typography linking back to `/`.
- Client-side navigation links to `/login` and `/registration` using `Link` from `next/link` to avoid browser reloads.

```tsx
import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Brand / Logo with Badge */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black tracking-wider text-black">
                        DT
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        DeciTrade
                    </span>
                </Link>

                {/* Right Actions: Sign In & Register */}
                <div className="flex items-center gap-5">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/registration"
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </header>
    );
}
```

#### Footer (`src/components/layout/Footer.tsx`)
A minimal footer pinned to the bottom of the viewport with a dynamic year.

```tsx
export default function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black py-8">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <p>© {new Date().getFullYear()} DeciTrade. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">Support</a>
                </div>
            </div>
        </footer>
    );
}
```

---

### Step 2: Root Layout (`src/app/layout.tsx`)

The root layout defines the global HTML structure, fonts, and the primary flex column shell.

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeciTrade",
  description: "Algorithmic Decisions for Smarter Trading",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

---

### Step 3: Homepage (`src/app/page.tsx`)

The landing page renders within the root `<main>` element, providing the hero headline and call-to-action buttons.

```tsx
export default function Home() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
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
  );
}
```

---

### Step 4: Authentication Nested Layout (`src/app/(auth)/layout.tsx`)

This layout acts as a dedicated wrapper for authentication pages, positioning the card centered both horizontally and vertically inside the root `<main>` container.

```tsx
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {children}
            </div>
        </div>
    );
}
```

---

### Step 5: Login Page (`src/app/(auth)/login/page.tsx`)

A Client Component providing controlled input state and React 19 form submission handling.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Login submitted:", { email, password });
        alert(`Logging in with: ${email}`);
    };

    return (
        <div>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Enter your credentials to access your account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-zinc-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-zinc-700"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                    Sign In
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link href="/registration" className="font-semibold text-blue-600 hover:underline">
                    Create one
                </Link>
            </p>
        </div>
    );
}
```

---

### Step 6: Registration Page (`src/app/(auth)/registration/page.tsx`)

A Client Component providing full registration inputs with client-side state management.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistrationPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Registration submitted:", { name, email, password });
        alert(`Account created for: ${name}`);
    };

    return (
        <div>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Start trading smarter with DeciTrade
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-zinc-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-zinc-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-zinc-700"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                    Sign Up
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
}
```
