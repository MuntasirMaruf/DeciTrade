# DeciTrade — Architecture & Implementation Guideline

This document tracks the architecture, component locations, responsibilities, state management concepts, validation logic, and key implementation snippets for the project, built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 1. Tech Stack Overview

- **Framework**: [Next.js](https://nextjs.org/) (App Router, v16+)
- **Library**: [React](https://react.dev/) (v19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/) (`lucide-react`)
- **Bundler**: Turbopack

---

## 2. Directory Structure

```text
deci-trade/
├── public/                 # Static public assets
├── src/
│   ├── app/                # App Router: file-system based routing
│   │   ├── (auth)/         # Route Group: omitted from URL
│   │   │   ├── layout.tsx  # Nested layout: renders AuthHeader + centered card
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Route: /login (Sign In form with regex validation)
│   │   │   ├── registration/
│   │   │   │   └── page.tsx        # Route: /registration (Business type selection & signup)
│   │   │   └── onboarding/
│   │   │       └── page.tsx        # Route: /onboarding (Step 2 business setup funnel)
│   │   ├── wholesaler/     # Wholesaler portal routes
│   │   │   └── dashboard/
│   │   │       └── page.tsx        # Route: /wholesaler/dashboard (RSC Wholesaler metrics)
│   │   ├── favicon.ico
│   │   ├── globals.css     # Global styles & Tailwind configuration
│   │   ├── layout.tsx      # Root layout: <main> + Footer
│   │   └── page.tsx        # Homepage route: / (renders SiteHeader + Hero)
│   ├── components/         # Reusable React components
│   │   ├── dashboard/      # Portal & analytics components
│   │   │   └── StateCard.tsx   # Reusable metric card with TypeScript props
│   │   ├── layout/         # Persistent structural components
│   │   │   ├── SiteHeader.tsx  # Public navbar with logo badge & auth CTAs
│   │   │   ├── AuthHeader.tsx  # Dedicated auth navbar with logo & "Back to website"
│   │   │   └── Footer.tsx      # Global footer with dynamic year & links
│   │   └── ui/             # Reusable design system primitives
│   │       ├── Button.tsx      # Reusable button with variants and loading state
│   │       └── ThemeToggle.tsx # Client-side theme toggle with localStorage persistence
│   └── lib/                # Shared utilities & validators
│       └── validator.ts    # Centralized regex patterns (Email, Password, Phone)
├── guideline.md            # Living architecture & implementation documentation
├── package.json
└── tsconfig.json           # Path alias (@/* -> ./src/*)
```

---

## 3. Core Architectural & React Concepts

### A. Component Props & TypeScript Typing

In React, **Props** (short for properties) represent data passed down from a parent component to a child component.

#### Syntax & Contract:
```tsx
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}

function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  return <div><h3>{title}</h3><p>{value}</p></div>;
}

// Parent usage:
<StatCard title="Revenue" value="$48,250" change="+8.4%" icon={DollarSign} />
```
- **Type Safety**: Defining an `interface` guarantees that the parent must pass the exact required types, preventing missing data bugs at compile time.
- **Unidirectional Flow**: Data only flows downwards from parent to child.

#### Prop Aliasing & JSX Capitalization (`icon: Icon`):
In [`src/components/dashboard/StateCard.tsx`](src/components/dashboard/StateCard.tsx), the icon prop is destructured with a rename:
```tsx
export default function StatCard({ title, value, change, icon: Icon }: StatCardProps)
```
1. **JSX Capitalization Rule**: In React/JSX, tags starting with a lowercase letter (e.g. `<icon />`, `<div>`, `<span>`) are treated by JSX compilers as built-in HTML/DOM elements. If written as `<icon className="w-4 h-4" />`, React attempts to render a literal DOM element `<icon></icon>`, which is invalid HTML. Tags starting with an uppercase letter (e.g. `<Icon />`, `<StatCard />`) tell React to treat the identifier as a custom React component and invoke it (`React.createElement(Icon, ...)`).
2. **Prop Naming Convention**: By convention, component prop names use lowercase camelCase (e.g. `icon: LucideIcon` passed as `<StatCard icon={Package} />`) to match standard JavaScript object naming.
3. **Destructuring Alias Syntax (`icon: Icon`)**: JavaScript object destructuring allows renaming a property during extraction: `{ originalPropName: NewAliasName }`. Destructuring `icon: Icon` unpacks the incoming lowercase `icon` prop and assigns it to a capitalized local identifier `Icon`. This allows it to be rendered directly in JSX as `<Icon className="w-4 h-4" />` without needing a manual reassignment statement (`const Icon = icon;`).

---

### B. What is `useState` and How Does It Work?

In standard JavaScript, modifying a variable does not notify the browser to update the display:
```js
let count = 0;
count = 1; // The variable changed, but the webpage doesn't re-render!
```

In React, **`useState`** is a Hook that:
1. **Stores data** across component renders.
2. **Triggers a re-render** whenever the setter function is called, updating the UI immediately.

#### Syntax Breakdown:
```tsx
const [state, setState] = useState(initialValue);
```
- **`state`**: The current value stored in memory.
- **`setState`**: The updater function used to set a new value and trigger a component re-render.
- **`initialValue`**: The starting value on the initial render.

---

### C. Client-Side Form Validation Pattern

Forms implement client-side validation using standard JavaScript and Regular Expressions (Regex).

#### 1. Why `noValidate` on the `<form>`?
Adding `noValidate` to `<form onSubmit={handleSubmit} noValidate>` disables default browser tooltip popups, granting full styling control via custom React `<AlertCircle>` alerts.

#### 2. Centralized Regex Helpers (`src/lib/validator.ts`)
- **`EMAIL_REGEX`**: Enforces valid email structure (`user@domain.tld`).
- **`PASSWORD_REGEX`**: Requires strong security (minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character).
- **`PHONE_REGEX`**: Validates telephone formats (allowing an optional `+` prefix, parenthesis, spaces, and dashes with 7–15 digits).

---

### D. Navigation: Declarative `<Link>` vs. Programmatic `useRouter()`

Next.js provides two ways to navigate:
1. **Declarative Navigation (`<Link href="...">`)**:
   - Used when the **user clicks** a link or button.
   - Example: Navigating from the Header to `/login`, or from Login to `/registration`.
2. **Programmatic Navigation (`useRouter().push(...)`)**:
   - Used when your **code decides to navigate automatically** after an action completes.
   - Example: After successful login verification, the code redirects the user to their portal:
     ```tsx
     import { useRouter } from "next/navigation";

     const router = useRouter();
     router.push("/wholesaler/dashboard");
     ```

---

### E. React Server Components (RSC) vs. Client Components
- By default in the App Router, components are **Server Components**. They run on the server and send static HTML to the browser with zero client JavaScript bundle overhead.
- Screens that merely display data without event listeners (like `wholesaler/dashboard/page.tsx`) remain Server Components.
- Interactive screens requiring browser state (`useState`), programmatic routing (`useRouter`), or event listeners (`onSubmit`, `onClick`) specify `"use client";` at line 1.

---

### F. Route Groups `(auth)` & Nested Layouts
- Folders enclosed in parentheses, like `(auth)`, are **omitted from the URL**:
  - `src/app/(auth)/login/page.tsx` &rarr; accessible at `/login`.
  - `src/app/(auth)/registration/page.tsx` &rarr; accessible at `/registration`.
  - `src/app/(auth)/onboarding/page.tsx` &rarr; accessible at `/onboarding`.
- Layouts nest hierarchically:
  $$\text{RootLayout (<main> + Footer)} \longrightarrow \text{AuthLayout (AuthHeader + Centered Card)} \longrightarrow \text{Page}$$

---

### G. Single `<main>` Landmark & Sticky Footer
- HTML accessibility standards allow only **one visible `<main>` landmark** per document.
- In `src/app/layout.tsx`, `<main className="flex flex-1 flex-col">` wraps `{children}`.
  - `flex-1` expands `<main>` to keep the footer pinned to the bottom of the viewport.
  - `flex flex-col` provides a flex container so child layouts (`(auth)/layout.tsx`) can center cards vertically using `items-center`.

---

### H. React 19 Form Submission (`SubmitEvent`)
- React 19 deprecated `FormEvent` in favor of standard DOM event types.
- Form submissions use `React.SubmitEvent<HTMLFormElement>`. Specifying `<HTMLFormElement>` ensures `e.currentTarget` is fully typed for extracting values with `new FormData(e.currentTarget)`.

---

### I. Design Tokens & Theme Architecture (Tailwind CSS v4)

Design tokens and class-based theme switching are configured directly in `src/app/globals.css` using CSS custom properties and Tailwind CSS v4 directives.

#### 1. Enabling Class-Based Dark Mode (`@custom-variant`)
By default, Tailwind v4 only responds to operating system preferences. To allow manual theme toggling via `<html class="dark">`, register the custom variant at the top of the file:
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```
- **How it works**: Instructs Tailwind's compiler to activate any `dark:...` utility class whenever an ancestor element carries the `.dark` class.

#### 2. Defining Light vs. Dark Design Tokens
Tokens are declared as CSS variables under `:root` for light mode and overridden under `:root.dark, .dark` for dark mode:
```css
/* Light Mode Default */
:root {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #ffffff;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --border: #e4e4e7;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --destructive: #ef4444;
}

/* Manual .dark Class (Toggled via ThemeToggle & persisted in localStorage) */
:root.dark,
.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #121215;
  --primary: #fafafa;
  --primary-foreground: #18181b;
  --border: #27272a;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --destructive: #f87171;
}
```
- **Dual-Trigger Logic**: If the user toggles manually (`<html class="dark">` or `<html class="light">`), the class takes precedence. If no class is set, it falls back to the visitor's OS dark/light setting.

#### 3. Mapping Tokens to Tailwind Utilities (`@theme inline`)
Register CSS variables into Tailwind's utility generation engine:
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
  --font-sans: var(--font-sans);
}
```
- **Result**: Generates utility classes (`bg-background`, `text-foreground`, `bg-primary`, `border-border`) that automatically swap colors when the `.dark` class toggles without requiring React re-renders.

---

### J. HTML Element Inheritance, Props Spreading & Button Architecture
When building reusable UI primitives (e.g. `src/components/ui/Button.tsx`):

#### 1. Interface Inheritance (`extends React.ButtonHTMLAttributes<HTMLButtonElement>`)
Instead of manually defining props for `type`, `disabled`, `onClick`, `aria-label`, etc., extending native attributes inherits all standard HTML attributes with strict compile-time typing and IDE autocomplete:
```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  isLoading?: boolean;
}
```

#### 2. Rest Parameters (`...props`) & Spread Operator (`{...props}`)
- **Rest Parameter**: `function Button({ children, variant, size, fullWidth, isLoading, ...props }: ButtonProps)` unpacks custom props into local variables and bundles all remaining attributes into a `props` object.
- **JSX Spread**: `<button {...props}>` forwards every attribute (`type="submit"`, `id`, `onClick`, `form`) directly onto the DOM `<button>` element.

#### 3. HTML Button Type Semantics
- **Inside `<form>` (Default Behavior)**: According to the HTML specification, any `<button>` inside a `<form>` without an explicit `type` defaults to `type="submit"`. Clicking it triggers form submission.
- **Form Cancellation / Steppers**: To create non-submitting action buttons inside a form (e.g., Cancel, Back, Toggle Password), you must explicitly specify `type="button"`.
- **Outside `<form>`**: `<Button onClick={handleClick}>` functions as a standard click action without form submission behavior.

#### 4. Width Modes (`inline-flex` vs. `fullWidth`) & Sizing
- By default, buttons use `inline-flex w-auto` to hug their content rather than forcing 100% width.
- Forms requiring edge-to-edge submission buttons specify `fullWidth={true}` (`w-full`).
- Sizing variants (`sm`, `md`, `lg`, `icon`) govern padding and dimensions.

#### 5. Unified Text & Icon Button Architecture
- A single `Button` component handles text buttons, text+icon combos, and square icon-only buttons (`size="icon"` with `h-9 w-9 p-0`). Consolidating these prevents duplicating theme tokens, focus rings, hover states, and disabled handling.
- **Accessibility Requirement**: Because SVGs have no inner text, icon-only buttons must provide an `aria-label` (e.g. `aria-label="Toggle theme"`) so assistive technologies announce the control's action.

#### 6. Dynamic Theme Icon Toggling
- **Pure CSS Class Toggling**: Renders both icons and utilizes Tailwind classes to switch visibility instantly without React re-renders or hydration flash:
  ```tsx
  <Button size="icon" variant="outline" aria-label="Toggle theme">
    <Moon className="w-4 h-4 dark:hidden" />
    <Sun className="w-4 h-4 hidden dark:block" />
  </Button>
  ```
- **State-Driven Toggling**: Conditionally renders the active icon via React state: `{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}`.

---

## 4. File Locations, Responsibilities & Snippets

### 1. Root Layout
- **Location**: `src/app/layout.tsx`
- **What it does**: Defines global HTML, imports Google fonts (`Geist`), loads Tailwind CSS (`globals.css`), and establishes the sticky-footer shell with `<main>` and `<Footer />`.
- **Key Snippet**:
  ```tsx
  <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
    <main className="flex flex-1 flex-col">{children}</main>
    <Footer />
  </body>
  ```

---

### 2. Public Site Header
- **Location**: `src/components/layout/SiteHeader.tsx`
- **What it does**: Public navbar containing the `DT` brand logo linking to `/`, theme toggle (`<ThemeToggle />`), a "Sign In" link to `/login`, and a "Register" button to `/registration`. Uses semantic design tokens (`border-border`, `bg-background/80`, `text-foreground`).
- **Key Snippet**:
  ```tsx
  <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-xs font-black text-background">
          DT
        </div>
        <span className="text-lg font-bold text-foreground">DeciTrade</span>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Sign In
        </Link>
        <Link href="/registration" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Register
        </Link>
      </div>
    </div>
  </header>
  ```

---

### 3. Auth Header
- **Location**: `src/components/layout/AuthHeader.tsx`
- **What it does**: Dedicated auth navbar displaying the `DT` brand badge, theme toggle (`<ThemeToggle />`), and a "Back to Home" return link using semantic tokens.
- **Key Snippet**:
  ```tsx
  <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-xs font-black text-background">
          DT
        </div>
        <span className="text-lg font-bold text-foreground">DeciTrade</span>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  </header>
  ```

---

### 4. Footer
- **Location**: `src/components/layout/Footer.tsx`
- **What it does**: Global footer pinned to the bottom of the viewport displaying the dynamic copyright year and policy links.
- **Key Snippet**:
  ```tsx
  <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
      <p>© {new Date().getFullYear()} DeciTrade. All rights reserved.</p>
    </div>
  </footer>
  ```

---

### 5. Homepage
- **Location**: `src/app/page.tsx`
- **What it does**: The public landing page displaying `SiteHeader` and the hero section with platform headlines and call-to-action buttons.
- **Key Snippet**:
  ```tsx
  export default function Home() {
    return (
      <>
        <SiteHeader />
        <section className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Algorithmic Decisions for Smarter Trading
          </h1>
        </section>
      </>
    );
  }
  ```

---

### 6. Authentication Nested Layout
- **Location**: `src/app/(auth)/layout.tsx`
- **What it does**: A layout wrapper dedicated to authentication screens. It renders the `AuthHeader` at the top and centers form cards horizontally and vertically.
- **Key Snippet**:
  ```tsx
  export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-1 flex-col">
        <AuthHeader />
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {children}
          </div>
        </div>
      </div>
    );
  }
  ```

---

### 7. Validation Utilities
- **Location**: `src/lib/validator.ts`
- **What it does**: Exports reusable regular expressions for client-side form validation.
- **Key Snippet**:
  ```ts
  export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  export const PHONE_REGEX = /^\+?(?:[\s\-()]*\d){7,15}[\s\-()]*$/;
  ```

---

### 8. Login Page
- **Location**: `src/app/(auth)/login/page.tsx`
- **What it does**:
  - Sign-in form with client-side email and password validation.
  - Password visibility toggle (`Eye` / `EyeOff`) driven by local `useState`.
  - Disables default browser popups using `noValidate`.
  - Automatically redirects to `/wholesaler/dashboard` via `useRouter().push()` upon successful submission.
- **Key Snippet**:
  ```tsx
  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    // Validate email & password...
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/wholesaler/dashboard");
  }
  ```

---

### 9. Registration Page
- **Location**: `src/app/(auth)/registration/page.tsx`
- **What it does**:
  - Account creation with business type selection tabs (Wholesaler vs. Retailer).
  - Validates `business_name`, `phone_number` (`PHONE_REGEX`), `email` (`EMAIL_REGEX`), and `password` (`PASSWORD_REGEX`).
  - Displays a success banner with a link to Step 2 (`/onboarding`).
- **Key Snippet**:
  ```tsx
  <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
    <input type="hidden" name="role" value={selectedRole} />
    {/* Validates inputs sequentially and displays <AlertCircle> banner */}
  </form>
  ```

---

### 10. Onboarding Page (2-Step Funnel)
- **Location**: `src/app/(auth)/onboarding/page.tsx`
- **What it does**:
  - Step 2 in funnel: "Business Setup" with 2-step progress stepper (`1. Account Created` &rarr; `2. Business Setup`).
  - Conditionally renders role-specific inputs (Wholesaler warehouse vs. Retailer store delivery).
  - Provides a declarative "Sign out and finish later" link to `/login`.
- **Key Snippet**:
  ```tsx
  {isWholesaler ? (
    <textarea id="warehouse_address" name="warehouse_address" required />
  ) : (
    <textarea id="delivery_address" name="delivery_address" required />
  )}
  <Link href="/login">Sign out and finish later</Link>
  ```

---

### 11. Reusable StatCard Component
- **Location**: `src/components/dashboard/StateCard.tsx`
- **What it does**: Reusable metrics card accepting TypeScript props (`title`, `value`, `change`, `icon`). Uses `{ icon: Icon }` destructuring aliasing to render dynamic Lucide icon components with capitalized JSX syntax (`<Icon className="w-4 h-4" />`).
- **Key Snippet**:
  ```tsx
  export interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
  }

  export default function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
    return (
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase">{title}</span>
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold">{value}</div>
        <span>{change}</span>
      </div>
    );
  }
  ```

---

### 12. Wholesaler Dashboard Page
- **Location**: `src/app/wholesaler/dashboard/page.tsx`
- **What it does**: A React Server Component portal for wholesalers that renders the metrics grid using the reusable `<StatCard />` component.
- **Key Snippet**:
  ```tsx
  import StatCard from "@/components/dashboard/StatCard";

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    {stats.map((stat) => (
      <StatCard
        key={stat.title}
        title={stat.title}
        value={stat.value}
        change={stat.change}
        icon={stat.icon}
      />
    ))}
  </div>
  ```

---

### 13. Reusable Button Component
- **Location**: `src/components/ui/Button.tsx`
- **What it does**: Reusable design system button extending native HTML button attributes (`React.ButtonHTMLAttributes<HTMLButtonElement>`). Uses semantic theme tokens (`primary`, `secondary`, `outline`), size presets (`sm`, `md`, `lg`, `icon`), width modes (`w-auto` vs. `fullWidth`), loading spinner state (`isLoading`), and prop spreading (`...props`).
- **Key Snippet**:
  ```tsx
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
    fullWidth?: boolean;
    isLoading?: boolean;
  }

  export default function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    disabled,
    className = "",
    ...props
  }: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-[var(--radius)] ...";
    const sizeStyles = {
      sm: "py-1.5 px-3 text-xs",
      md: "py-2.5 px-4 text-sm",
      lg: "py-3 px-5 text-base",
      icon: "h-9 w-9 p-0",
    };
    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:opacity-90",
      secondary: "bg-muted text-foreground hover:opacity-80",
      outline: "border border-border text-foreground hover:bg-muted",
    };

    return (
      <button
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? "w-full" : "w-auto"} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
      </button>
    );
  }
  ```
- **Usage Patterns**:
  - **Full-Width Form Submit**: `<Button type="submit" fullWidth isLoading={isLoading}>Sign In</Button>`
  - **Form Action (Non-submitting)**: `<Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>`
  - **Square Icon Button (Theme Toggle)**:
    ```tsx
    <Button size="icon" variant="outline" aria-label="Toggle theme">
      <Moon className="w-4 h-4 dark:hidden" />
      <Sun className="w-4 h-4 hidden dark:block" />
    </Button>
    ```
  - **General Action**: `<Button variant="secondary" onClick={handleRefresh}>Refresh</Button>`

---

### 14. Theme Toggle Component
- **Location**: `src/components/ui/ThemeToggle.tsx`
- **What it does**: Client Component that toggles dark/light theme on `document.documentElement` (`<html class="dark">`), persists choice in `localStorage`, and prevents hydration layout flash using a client `mounted` check.
- **Key Snippet**:
  ```tsx
  "use client";

  import { useEffect, useState } from "react";
  import { Sun, Moon } from "lucide-react";
  import Button from "@/components/ui/Button";

  export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const active = saved === "dark" || (!saved && prefersDark);
      setIsDark(active);
      document.documentElement.classList.toggle("dark", active);
    }, []);

    function toggleTheme() {
      const next = !isDark;
      setIsDark(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
    }

    if (!mounted) {
      return (
        <Button type="button" size="icon" variant="outline" aria-label="Toggle theme" className="opacity-0">
          <Moon className="w-4 h-4" />
        </Button>
      );
    }

    return (
      <Button type="button" size="icon" variant="outline" onClick={toggleTheme} aria-label="Toggle theme">
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-400" />}
      </Button>
    );
  }
  ```
