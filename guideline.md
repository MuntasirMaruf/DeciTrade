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
│   │   ├── retailer/       # Retailer portal routes
│   │   │   ├── layout.tsx      # Nested layout: renders Header + portal shell
│   │   │   ├── page.tsx        # Route: /retailer (Server redirect to /retailer/dashboard)
│   │   │   └── dashboard/
│   │   │       └── page.tsx    # Route: /retailer/dashboard (RSC Retailer metrics)
│   │   ├── wholesaler/     # Wholesaler portal routes
│   │   │   ├── layout.tsx      # Nested layout: renders Header + WholesalerSidebar + portal shell
│   │   │   ├── page.tsx        # Route: /wholesaler (Server redirect to /wholesaler/dashboard)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx    # Route: /wholesaler/dashboard (RSC Wholesaler metrics)
│   │   │   ├── orders/
│   │   │   │   └── page.tsx    # Route: /wholesaler/orders (Incoming retailer orders)
│   │   │   └── inventory/
│   │   │       └── page.tsx    # Route: /wholesaler/inventory (Warehouse catalog & stock)
│   │   ├── favicon.ico
│   │   ├── globals.css     # Global styles & Tailwind configuration
│   │   ├── layout.tsx      # Root layout: <main> + Footer
│   │   └── page.tsx        # Homepage route: / (renders SiteHeader + Hero)
│   ├── components/         # Reusable React components
│   │   ├── dashboard/      # Portal & analytics components
│   │   │   ├── StateCard.tsx       # Reusable metric card with TypeScript props
│   │   │   ├── OrderSearch.tsx     # Leaf Client Component search input with URL synchronization
│   │   │   └── OrderDateFilter.tsx # Leaf Client Component date filter with single chevron trigger
│   │   ├── layout/         # Persistent structural components
│   │   │   ├── SiteHeader.tsx  # Public navbar with logo badge & auth CTAs
│   │   │   ├── AuthHeader.tsx  # Dedicated auth navbar with logo & "Back to website"
│   │   │   ├── Header.tsx      # Authenticated portal navbar with profile, role pill & sign out
│   │   │   ├── WholesalerSidebar.tsx # Pinned navigation sidebar with route-aware active state
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

### D. Navigation: Declarative `<Link>`, Client `useRouter()`, and Server-Side `redirect()`

Next.js provides three distinct ways to navigate:
1. **Declarative Navigation (`<Link href="...">`)**:
   - Used when the **user clicks** a link or button.
   - Example: Navigating from the Header to `/login`, or from Login to `/registration`.
2. **Programmatic Navigation (`useRouter().push(...)`)**:
   - Used inside **Client Components** when JavaScript decides to navigate after an action (e.g. form submission):
     ```tsx
     import { useRouter } from "next/navigation";

     const router = useRouter();
     router.push("/wholesaler/dashboard");
     ```
3. **Server-Side Redirection (`redirect(...)`)**:
   - Used inside **React Server Components** to issue an HTTP 307 (Temporary) or 308 (Permanent) redirect before rendering any HTML.
   - Example: Redirecting `/wholesaler` directly to the dashboard:
     ```tsx
     import { redirect } from "next/navigation";

     export default function WholesalerPage() {
       redirect("/wholesaler/dashboard");
     }
     ```
   - Operates on the server, halts rendering immediately, and sends the redirect header before the client begins parsing the page. Ideal for auth guards, role gates, and URL aliases.

---

### E. React Server Components (RSC) vs. Client Components

The Next.js App Router uses a dual-component model: **Server Components** and **Client Components**. By default, every component inside the `app` directory is a Server Component.

#### 1. What are Server Components (RSC)?
- **Execution Environment**: Execute **strictly on the server** during build time or request time. Their code is never sent to the client's browser.
- **Output**: Render into an intermediate format (React Server Component Payload) and stream pure HTML to the browser.
- **Zero Client Bundle Size**: Dependencies imported inside a Server Component (e.g. database SDKs, Markdown parsers, heavy date libraries) add **0 KB** to the client JavaScript bundle.
- **Direct Backend Access**: Can directly query databases, read server files (`fs`), and access private environment variables (API secrets) without creating dedicated API routes.
- **Async by Nature**: Can be declared as `async function MyComponent()` and use native `await` directly in the component body.

#### 2. What are Client Components?
- **Execution Environment**: Pre-rendered into HTML on the server, then **hydrated** in the browser with interactive JavaScript.
- **Opt-In Directive**: Declared by placing `"use client";` at the very top of the file (before any imports).
- **Client Capabilities**: Have access to browser-only APIs (`window`, `localStorage`, `document`), React state hooks (`useState`, `useReducer`), lifecycle hooks (`useEffect`), and event listeners (`onClick`, `onChange`, `onSubmit`).

#### 3. When to Use Which: Architectural Decision Matrix

| Capability / Requirement | Server Component (Default) | Client Component (`"use client"`) |
| :--- | :---: | :---: |
| Fetch data directly from DB / backend | ✅ Yes (`async/await`) | ❌ No |
| Access secret API keys & credentials | ✅ Yes (Safe from browser) | ❌ No (Leaked in client bundle) |
| Reduce JavaScript sent to browser | ✅ Yes (0 KB bundle) | ❌ No (Adds to bundle) |
| Read URL query params on `page.tsx` | ✅ Yes (`searchParams` prop) | ⚠️ Requires `useSearchParams()` + `<Suspense>` |
| State hooks (`useState`, `useReducer`) | ❌ No | ✅ Yes |
| Lifecycle hooks (`useEffect`) | ❌ No | ✅ Yes |
| DOM Event listeners (`onClick`, `onSubmit`) | ❌ No | ✅ Yes |
| Browser APIs (`window`, `localStorage`) | ❌ No | ✅ Yes |
| Custom hooks dependent on browser state | ❌ No | ✅ Yes |

#### 4. How to Use Them: Component Boundary Patterns

##### A. The Leaf Component Pattern (Pushing `"use client"` Down)
**The Golden Rule of Next.js Architecture**: Keep all route pages (`page.tsx`) and layouts (`layout.tsx`) as React Server Components (omitting `"use client"`). Whenever client-side interactivity is required (such as an `<input onChange>`, stateful modal, or dropdown), extract *only that interactive widget* into a dedicated Client Component leaf (`"use client"`).

In DeciTrade, this is demonstrated in the Wholesaler Orders Page:
```text
┌─────────────────────────────────────────────────────────────┐
│ WholesalerOrdersPage (Server Component - 0 KB client JS)    │
│  ├─ Page Header (Pure Server HTML)                          │
│  ├─ Filter Tabs (<Link> - Declarative Server Navigation)    │
│  ├─ Orders Data Table (Server-rendered HTML)                │
│  └─ <Suspense>                                              │
│       └─ OrderSearch ("use client" - Leaf Component)        │
│            └─ onChange captures typing -> writes to URL     │
└─────────────────────────────────────────────────────────────┘
```
- **Why Not Make the Whole Page a Client Component?** Marking `page.tsx` with `"use client"` forces the *entire* page, its imports, data tables, and icons into the client JavaScript bundle. Keeping the page on the server guarantees 0 KB client JS overhead for the table and preserves direct async database querying capabilities.
- **The Auth Form Tradeoff**: In dedicated single-form routes like `src/app/(auth)/login/page.tsx`, the entire page is an interactive form (`useState`, `onSubmit`), making a top-level `"use client"` acceptable for prototyping. However, enterprise architecture separates the route (`page.tsx` as a Server Component exporting static `metadata`) from the form (`LoginForm.tsx` as a Client Component leaf).

##### B. Passing Server Components as Children to Client Wrappers
A Client Component **cannot directly import a Server Component** (because importing pulls code into the client bundle). However, a Client Component can receive Server Components via the `children` prop:
```tsx
// Client Component wrapper:
"use client";
export function CollapsibleSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return <div>{open && children}</div>;
}

// Server Component page passes server-rendered child:
export default function Page() {
  return (
    <CollapsibleSection>
      <ServerRenderedHeavyDataFeed />
    </CollapsibleSection>
  );
}
```

##### C. Serialization Rule Across Boundaries
When passing props from a Server Component to a Client Component, values must be **serializable to JSON** (strings, numbers, booleans, plain objects, arrays). Functions, class instances, or database connections cannot cross the network boundary.

#### 5. Server Component `searchParams` vs. Client `useSearchParams()`
In Next.js App Router, reading query parameters differs by component type:
- **Server Component (`page.tsx`)**: Receives `searchParams` directly as a prop (`Promise<{ status?: string }>` in Next.js 15+). Allows filtering or querying before HTML is sent.
- **Client Component (`"use client"`)**: Uses the `useSearchParams()` hook, which reads the browser URL reactively and requires a `<Suspense>` boundary when prerendered.

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

  /* Header & Navigation */
  --header-background: #ffffff;
  --header-foreground: #09090b;

  /* Footer */
  --footer-background: #fafafa;
  --footer-foreground: #71717a;
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

  /* Header & Navigation */
  --header-background: #000000;
  --header-foreground: #fafafa;

  /* Footer */
  --footer-background: #000000;
  --footer-foreground: #a1a1aa;
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
  --color-header: var(--header-background);
  --color-header-foreground: var(--header-foreground);
  --color-footer: var(--footer-background);
  --color-footer-foreground: var(--footer-foreground);
  --font-sans: var(--font-sans);
}
```
- **Result**: Generates utility classes (`bg-background`, `text-foreground`, `bg-header`, `text-header-foreground`, `bg-footer`, `text-footer-foreground`) that automatically swap colors when the `.dark` class toggles without requiring React re-renders.

#### 4. Zero-Blink Theme Synchronization Architecture
- **Eliminating Hydration Pop-In**: Traditional client-only mounting patterns (e.g. `if (!mounted) return <Button className="opacity-0">`) cause a visible flicker on browser refresh while React hydrates.
- **Synchronous `<head>` Script (`src/app/layout.tsx`)**: Placing an inline `<script>` directly in `<head>` executes synchronously before the browser paints the document, attaching the `.dark` class to `<html>` prior to the first pixel render.
- **Default Theme Resolution (First-Time Visitors)**: When a visitor has never clicked the toggle, `localStorage.theme` is empty (`!('theme' in localStorage)`). The system resolves the default dynamically from the visitor's operating system setting via `window.matchMedia('(prefers-color-scheme: dark)').matches`. If no `.dark` class is attached, `:root` in `globals.css` provides the baseline light tokens.
- **Storage Persistence**: Theme state is written to storage only upon explicit user action inside `ThemeToggle.tsx` (`localStorage.setItem('theme', isDark ? 'dark' : 'light')`). Subsequent reloads read this key to override OS settings.
- **`suppressHydrationWarning` on `<html>`**: Prevents Next.js console warnings when the inline script modifies `<html class="dark">` before React completes hydration.
- **Pure CSS Icon Toggling (`ThemeToggle.tsx`)**: Both `<Moon />` (`dark:hidden`) and `<Sun />` (`hidden dark:block`) are rendered inside the button from millisecond zero. CSS toggles visibility instantly based on the presence of `.dark` without React state delays.

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

### K. URL State & Educational Prototyping vs. Production Cookie Sessions

In web applications, managing state across pages can be accomplished through URL parameters or secure session storage.

#### 1. Prototyping Dynamic State via Query Parameters
During early development and educational prototyping, passing user identity through query parameters (e.g., `router.push(`/${targetPortal}/dashboard?email=${encodeURIComponent(email)}`)`):
- Eliminates dependencies on external authentication services, databases, or local storage.
- Enables instant data-flow verification between distinct pages and layouts.
- Preserves a pure client-side mental model before introducing asynchronous auth lifecycles.

#### 2. Production Security & PII Rules (Why Query Parameters Are Unsafe in Production)
Passing Personally Identifiable Information (PII) such as email addresses in the URL is strictly prohibited in production systems due to four primary security vulnerabilities:
1. **Browser History & Bookmarking**: URLs containing email addresses are permanently stored in browser history, visible to shared machine users, and exposed in bookmarks.
2. **Server Access Logs**: Reverse proxies (Nginx, Cloudflare), load balancers, and web servers log full request URIs by default. PII enters plain-text access logs, creating compliance violations under privacy regulations (e.g., GDPR, CCPA).
3. **HTTP Referer Header Leaks**: If the dashboard loads third-party external resources (analytics, fonts, scripts, CDNs) or the user clicks an external link, the browser transmits the current URL containing the user's email in the `Referer` request header.
4. **Tampering & Identity Spoofing**: Query parameters are unauthenticated and unencrypted. Any user can modify `?email=admin@decitrade.com` in their address bar to spoof another user unless cryptographic session tokens are verified server-side.

#### 3. Production Standard: Secure Cookie-Based Sessions
In production, authentication and authorization are managed through secure session cookies:
- **`HttpOnly` Flag**: Prevents client-side JavaScript (`document.cookie`) from reading the session token, protecting against Cross-Site Scripting (XSS) token theft.
- **`Secure` Flag**: Ensures cookies are transmitted exclusively over encrypted HTTPS connections.
- **`SameSite=Lax` or `Strict`**: Protects against Cross-Site Request Forgery (CSRF) attacks.
- **Server-Side Verification**: Authentication providers (e.g. Supabase Auth SSR) issue signed cryptographic tokens (JWTs) stored in cookies and validated on each request via Next.js Middleware or React Server Components before rendering protected views.

---

### L. React `<Suspense>` Architecture & Next.js Streaming Boundaries

React `<Suspense>` is a first-class component primitive (`import { Suspense } from "react"`) that lets components express declarative loading states while waiting for asynchronous operations.

#### 1. What is `<Suspense>`?
`<Suspense>` is a declarative boundary in the component tree that orchestrates asynchronous tasks—such as data fetching, code-splitting, dynamic imports, and client-side hooks like `useSearchParams()`. Rather than handling loading spinners inside individual components with manual boolean flags (`isLoading`), `<Suspense>` coordinates UI states at the boundary level.

#### 2. What Does It Do?
- **Catches Suspensions**: When a child component triggers an asynchronous operation (or signals that it depends on client-only parameters during SSR), it "suspends" execution.
- **Renders Fallback UI**: React catches the suspension and displays the declared `fallback` prop (such as a skeleton placeholder) without crashing or freezing the UI.
- **Resumes Rendering**: As soon as the asynchronous dependency resolves (data is fetched or hydration completes), React seamlessly replaces the fallback with the fully rendered child component.

#### 3. Why Use `<Suspense>`?
1. **Streaming Server-Side Rendering (SSR)**: In Next.js App Router, `<Suspense>` enables progressive HTML streaming. The server immediately sends the fast static shell (headers, sidebars) to the browser, while slower components stream in chunks as their data resolves.
2. **Prevents Full-Page De-Optimization**: Hooks like `useSearchParams()` read dynamic client-side query strings. Without a `<Suspense>` boundary, Next.js cannot statically prerender the page and is forced to de-opt the *entire route* to client-only rendering. `<Suspense>` confines dynamic behavior to that isolated slot.
3. **Eliminates Manual Loading State Boilerplate**: Replaces repetitive `const [isLoading, setIsLoading] = useState(true)` and ternary checks (`isLoading ? <Spinner /> : <Content />`) with a centralized architectural boundary.
4. **Prevents Layout Shift (CLS)**: Pairing `<Suspense>` with dimension-matched skeleton fallbacks reserves exact screen real estate, preventing page jumping when data arrives.

#### 4. When to Use `<Suspense>`?
- **Client Components with `useSearchParams()`**: Any Client Component accessing URL search parameters inside pages or persistent layouts that are statically generated or server-rendered.
- **Async React Server Components (RSC Data Fetching)**: When Server Components fetch data directly from a database or external API (`async function OrderFeed() { const orders = await db... }`).
- **Code-Splitting & Dynamic Imports**: When loading heavy client libraries or components on demand via `React.lazy` or `next/dynamic` (e.g. complex charting libraries, rich text editors).
- **Parallel Asynchronous Slots**: When independent dashboard widgets have varying latency (e.g. instant user profile vs. slow analytics table).

#### 5. How to Use `<Suspense>`

##### A. Component Separation Rule (Boundary Placement)
A component **cannot catch its own suspension**. The `<Suspense>` wrapper must always be placed in a **parent component** above the suspending child:

```tsx
// ❌ WRONG: Component cannot suspend itself and catch its own fallback
export default function OrdersFilter() {
  const searchParams = useSearchParams(); // Suspends here!
  return (
    <Suspense fallback={<Skeleton />}>
      <div>Filter: {searchParams.get("status")}</div>
    </Suspense>
  );
}

// ✅ CORRECT: Parent declares boundary; child performs the suspending read
function StatusFilterNav() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";
  return <span>Active filter: {currentStatus}</span>;
}

export default function OrdersPage() {
  return (
    <section>
      <h1>Orders</h1>
      <Suspense fallback={<div className="h-8 w-48 bg-muted/40 rounded animate-pulse" />}>
        <StatusFilterNav />
      </Suspense>
    </section>
  );
}
```

---

### M. Client-Side URL Query Inspection (`useSearchParams()`)

`useSearchParams` is a Next.js App Router Client Component hook (`import { useSearchParams } from "next/navigation"`) that reads the current URL's query string parameters.

#### 1. What is `useSearchParams()`?
- Returns a **read-only** Web API `URLSearchParams` interface representing the query string of the current URL (e.g. `?status=pending&search=grain`).
- It is reactive: when the query string changes via `router.push()` or `<Link>`, the component automatically re-renders with the latest values.

#### 2. Key Methods of `URLSearchParams`:
- `searchParams.get(name)`: Returns the first string value associated with the given key, or `null` if the parameter does not exist.
- `searchParams.has(name)`: Returns a boolean indicating whether the specified parameter key exists in the URL.
- `searchParams.getAll(name)`: Returns an array of all values associated with the given parameter (for multi-value keys like `?filter=a&filter=b`).

#### 3. Canonical Production Role: Table Filters, Search & Pagination
In B2B trading platforms, `useSearchParams()` powers shareable, bookmarkable UI state across data tables and catalog grids:
```tsx
function OrdersTableFilter() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";

  // Filter orders based on URL query parameter
  const filteredOrders = orders.filter((order) =>
    currentStatus === "all" ? true : order.status === currentStatus
  );

  return (
    <div className="flex gap-2">
      <Link href="/wholesaler/orders?status=all">All</Link>
      <Link href="/wholesaler/orders?status=pending">Pending</Link>
      <Link href="/wholesaler/orders?status=shipped">Shipped</Link>
    </div>
  );
}
```
- **Architectural Constraint**: Any component calling `useSearchParams()` must be wrapped inside a `<Suspense>` boundary to preserve static prerendering across the outer layout shell.

---

### N. Active Route Detection in Sidebars (`usePathname()`)

`usePathname` is a Next.js App Router Client Component hook (`import { usePathname } from "next/navigation"`) that returns the path portion of the current URL.

#### 1. What is `usePathname()`?
- Returns a plain string containing the current URL's pathname (e.g., `"/wholesaler/dashboard"` or `"/wholesaler/orders"`).
- **Does not include**: Protocol (`https://`), host domain (`localhost:3000`), port, query strings (`?status=...`), or hash fragments (`#top`).
- Unlike the raw browser API `window.location.pathname`, `usePathname()` is React-aware, updates synchronously on client-side route transitions, and avoids SSR hydration mismatches.

#### 2. Comparison: `usePathname()` vs. `useSearchParams()`

| Feature | `usePathname()` | `useSearchParams()` |
| :--- | :--- | :--- |
| **URL Target** | Path only (`/wholesaler/orders`) | Query string only (`?status=pending`) |
| **Return Type** | Plain `string` | Read-only `URLSearchParams` object |
| **Access Method** | Direct string comparisons (`pathname === item.href`) | Getter methods (`.get("status")`) |
| **Suspense Requirement** | No `<Suspense>` required | `<Suspense>` boundary required |
| **Primary DeciTrade Role** | Active navigation link highlighting in Sidebars | Table filtering, search, and pagination |

#### 3. Canonical Production Role: Sidebar Active Link Highlighting
In [`src/components/layout/WholesalerSidebar.tsx`](src/components/layout/WholesalerSidebar.tsx), `usePathname()` determines which sidebar navigation link is currently active:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function WholesalerSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Compare current pathname to the link's target href
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```
- **How It Works**: When the user clicks from "Dashboard" (`/wholesaler/dashboard`) to "Orders" (`/wholesaler/orders`), Next.js performs a client-side navigation. `usePathname()` instantly updates from `"/wholesaler/dashboard"` to `"/wholesaler/orders"`, causing the sidebar to re-render and move the active background pill seamlessly.

---

### O. Dashboard App Shell Architecture (Viewport-Locked Layout vs. Window Scroll)

In production SaaS and B2B platforms (e.g., Stripe, Linear, Shopify, DeciTrade), dashboard navigation follows the **Viewport-Locked App Shell** architecture.

#### 1. The Industry Standard: Viewport-Locked App Shell (`h-screen overflow-hidden`)
In modern web applications, the browser window itself (`window.scrollY`) **never scrolls**. Instead, the entire dashboard is constrained to the exact viewport height (`h-screen` or `100dvh`), and scrolling is confined to the content area.

```text
┌─────────────────────────────────────────────────────────────┐
│ Header (h-16 shrink-0 border-b border-border)              │
├───────────────────┬─────────────────────────────────────────┤
│ Sidebar           │ Main Content Area                       │
│ (w-64 shrink-0    │ (flex-1 h-full                          │
│  h-full           │  overflow-y-auto                        │
│  overflow-y-auto) │  min-w-0)                               │
│                   │                                         │
│ [Dashboard]       │  ┌────────────────────────────────────┐ │
│ [Orders]          │  │ Metric Cards (StatCards)           │ │
│ [Inventory]       │  └────────────────────────────────────┘ │
│                   │  ┌────────────────────────────────────┐ │
│                   │  │ Orders Data Table (500 rows)       │ │
│                   │  │ ...                                │ │
│                   │  │ ... (Only this column scrolls!)    │ │
│                   │  └────────────────────────────────────┘ │
└───────────────────┴─────────────────────────────────────────┘
```

##### Why This Architecture Is the Industry Standard:
1. **Zero Window-Scroll**: The browser window has no global scrollbar. Rolling the mouse wheel over the dashboard scrolls only the content panel.
2. **Fixed Sidebar Without Sticky Fragility**: CSS `position: sticky` can fail when parent flex containers stretch or when body margins shift. In a viewport-locked shell, the sidebar does not rely on `sticky`—it simply occupies `h-full` within a fixed flex container. It **physically cannot move**.
3. **Independent Sidebar Scroll**: If a sidebar contains 20+ navigation links or is viewed on a small laptop display (13-inch), the sidebar scrolls within its own column (`overflow-y-auto`) without moving the page.
4. **Isolated Scrollbars**: Scrollbars appear directly along the right edge of the content panel, mimicking native desktop applications.

##### Implementation Pattern:
```tsx
// Portal Layout (src/app/wholesaler/layout.tsx)
export default function WholesalerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* 1. Header locked at top */}
      <Header />

      {/* 2. Portal Body Shell locked to remaining height */}
      <div className="flex flex-1 overflow-hidden bg-neutral-50 dark:bg-black">
        {/* 3. Left Sidebar: fills height, cannot scroll with page */}
        <WholesalerSidebar />

        {/* 4. Content Panel: the SOLE scrolling container */}
        <div className="flex-1 h-full overflow-y-auto min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

#### 2. Footer Placement: Pure Server Component on Public Pages
In Next.js App Router, placing a marketing footer inside root `src/app/layout.tsx` forces an 80px footer onto every route in the application—including dashboards. When a dashboard is locked to `h-screen`, this causes the browser window to gain an unwanted vertical scrollbar.

##### The Industry Standard Solution (Pure RSC):
Do **not** add `"use client"` or path-checking hooks to `Footer.tsx`. Instead, keep `Footer.tsx` as a pure React Server Component:
1. **Omit `<Footer />` from root `src/app/layout.tsx`**.
2. **Render `<Footer />` directly on public marketing pages** (such as `src/app/page.tsx`) and auth pages (`src/app/(auth)/layout.tsx`) where marketing navigation belongs.
3. **Portal layouts (`src/app/wholesaler/layout.tsx`) render only the dashboard app shell** without any marketing footer.

##### Result:
- `Footer.tsx` remains a 100% React Server Component with zero client JavaScript overhead.
- Portals have zero window scrollbar.
- The sidebar stays completely stationary.

---

#### Summary Comparison:

| Feature | Viewport-Locked App Shell (Industry Standard) | Window-Level Sticky Scroll |
| :--- | :--- | :--- |
| **Outer Shell** | `h-screen flex flex-col overflow-hidden` | `min-h-screen flex flex-col` |
| **Window Scrollbar** | None (window never scrolls) | Yes (browser window scrolls) |
| **Sidebar Behavior** | Fixed `h-full`, completely stationary | `sticky top-16`, subject to parent height constraints |
| **Content Area** | `flex-1 h-full overflow-y-auto` (sole scroll container) | `flex-1 min-w-0` (scrolls with window) |
| **Marketing Footer** | Placed only on public routes (`page.tsx`), pure RSC | Rendered globally in root layout |
| **Best For** | Professional SaaS, B2B dashboards, data portals | Marketing pages, blogs, documentation sites |

---

### P. Server-Driven URL State & Data Filtering (The Orders Page Pattern)

In modern Next.js App Router applications, managing table filters, search terms, and pagination can be handled entirely on the server using URL query parameters, avoiding the complexity and bundle weight of client-side state.

#### 1. Architectural Concept: URL as the Single Source of Truth
In this pattern, the application separates **triggering a state change** from **rendering the data**:
- **The Filter Buttons Only Change the URL**: The filter tabs are plain declarative `<Link>` components (e.g. `<Link href="/wholesaler/orders?status=PENDING">`). They contain zero filtering logic, zero `onClick` handlers, and zero state setters. Their sole responsibility is updating the browser address bar.
- **The Server Derives State from the URL**: The page component (`WholesalerOrdersPage`) derives its entire view strictly by reading the URL via the `searchParams` prop.
- **Soft Client Navigation**: Unlike traditional HTML `<a>` tags that trigger a full, flashing page reload, Next.js `<Link>` intercepts the click, updates the URL bar immediately via the HTML5 History API (`history.pushState`), and fetches only the updated React Server Component (RSC) Payload in the background. React reconciles the DOM in place, giving the user an instant, smooth transition without a page reload.

#### 2. How the Orders Page Reads the URL (`searchParams` Prop Breakdown)

In Next.js App Router, Server Component pages do **not** use client hooks (`useSearchParams`) or browser APIs (`window.location`). Instead, Next.js automatically parses the incoming HTTP request URL and injects the query string parameters directly into the `page.tsx` component as a **prop**.

##### A. TypeScript Interface Contract
In Next.js 15+, dynamic request properties (`searchParams`, `params`) are asynchronous `Promise` objects. The component defines its expected URL query shape using an explicit TypeScript interface:

```tsx
// src/app/wholesaler/orders/page.tsx

// 1. Define the URL query shape as a Promise
interface PageProps {
  searchParams: Promise<{
    status?: string;
    query?: string;
  }>;
}

// 2. Declare the component as async to await URL parameters
export default async function WholesalerOrdersPage({ searchParams }: PageProps) {
  // 3. Await the Promise to unwrap the URL parameters
  const { status, query } = await searchParams;

  // 4. Normalize and establish safe default fallbacks
  const currentStatus = (status || "ALL").toUpperCase();
  const searchQuery = (query || "").toLowerCase();

  // ... execute filtering or backend data fetching ...
}
```

##### B. How Browser URLs Map to Server Variables

| Browser URL | `await searchParams` Payload | `currentStatus` | `searchQuery` | Resulting Table View |
| :--- | :--- | :--- | :--- | :--- |
| `/wholesaler/orders` | `{ status: undefined, query: undefined }` | `"ALL"` | `""` | All orders displayed |
| `/wholesaler/orders?status=PENDING` | `{ status: "PENDING", query: undefined }` | `"PENDING"` | `""` | Pending orders only |
| `/wholesaler/orders?query=metro` | `{ status: undefined, query: "metro" }` | `"ALL"` | `"metro"` | All orders matching "metro" |
| `/wholesaler/orders?status=DELIVERED&query=apex` | `{ status: "DELIVERED", query: "apex" }` | `"DELIVERED"` | `"apex"` | Delivered orders matching "apex" |

##### C. Why `searchParams` is an Asynchronous Promise in Next.js 15+
- **Asynchronous Decoupling**: Making `searchParams` a `Promise` allows the App Router runtime to begin streaming the static layout shell (Header, Sidebar) immediately, awaiting dynamic query values only at the exact point in the page code where `await searchParams` is invoked.
- **Server-Only Execution**: This operation executes strictly on the Node.js server before any HTML or RSC payload is transmitted over the wire. Zero client JavaScript is required to read or parse these URL parameters.

#### 3. Execution Lifecycle on the Server
```text
User clicks Tab (<Link href="/wholesaler/orders?status=PENDING">)
   │
   ▼
Next.js Client Router (In-App Soft Navigation)
   ├─ Updates address bar to ?status=PENDING via history.pushState (no page reload)
   └─ Requests updated Server Component Payload from backend
   │
   ▼
Next.js App Router Server (Node.js)
   ├─ 1. Parses URL query string: { status: "PENDING", query: "metro" }
   ├─ 2. Injects Promise into WholesalerOrdersPage({ searchParams })
   ├─ 3. Component awaits Promise: const { status, query } = await searchParams;
   ├─ 4. Filters data set on server: status matching + case-insensitive text search
   └─ 5. Generates pre-rendered HTML table & React Server Component Payload
   │
   ▼
Browser receives pre-rendered HTML payload
   ├─ Zero client JavaScript execution for table filtering
   ├─ React reconciles DOM: table updates & active pill moves seamlessly
   └─ Browser history entry created (Back button works automatically)
```

#### 4. The Server-Page + Client-Leaf Bridge (`WholesalerOrdersPage` ⟷ `OrderSearch`)

This orders feature directly embodies the core architectural rule of Next.js: **Keep the page as a Server Component, and extract interactive widgets into separate Client Component leaves**.

```text
┌─────────────────────────────────────────────────────────────┐
│ WholesalerOrdersPage (src/app/wholesaler/orders/page.tsx)   │
│ [Server Component — 0 KB JS, reads searchParams]            │
│                                                             │
│   <Suspense fallback={<Skeleton />}>                        │
│     <OrderSearch /> ───────────────────────────┐            │
│   </Suspense>                                  │            │
│                                                │            │
│   <table> {/* Server-rendered filtered rows */} </table>    │
└────────────────────────────────────────────────┼────────────┘
                                                 │
                                                 │ 1. User types in input
                                                 │ 2. router.replace("?query=...")
                                                 ▼
                              Browser URL: /wholesaler/orders?query=metro
                                                 │
                                                 │ 3. Next.js passes updated
                                                 │    searchParams to page
                                                 ▼
                              WholesalerOrdersPage re-renders on Server
```

1. **Why `WholesalerOrdersPage` remains a Server Component**:
   The table contains hundreds of potential order records, SVG badge styling, and formatting functions. Keeping it as a Server Component guarantees that 100% of this markup is generated on the server, sending **0 KB of filtering JavaScript** to the browser.
2. **Why `OrderSearch` is extracted into a Client Component**:
   Capturing keystrokes requires an `onChange` event listener on an HTML `<input>` element. Because DOM event listeners cannot execute on the server, the search bar is extracted into a standalone leaf component (`src/components/dashboard/OrderSearch.tsx`) marked with `"use client";`.
3. **URL-Based Communication Across the Boundary**:
   Rather than passing complex callback functions or lifting state into a shared parent, the Client Component and Server Component communicate through the URL:
   - `OrderSearch` reads the current URL query (`useSearchParams()`), copies it into a mutable `URLSearchParams` object (preserving any active `status` tabs), sets `query`, and calls `router.replace(`${pathname}?${params.toString()}`)`.
   - The Server Component reads `{ status, query }` from `searchParams`, filters `MOCK_ORDERS` on the Node.js runtime, and streams back the updated table HTML.
4. **Suspense Isolation**:
   Because `OrderSearch` calls `useSearchParams()`, it is wrapped inside `<Suspense>` in `page.tsx`. This boundary isolates dynamic client-side query string access, allowing Next.js to stream the rest of the page shell without de-optimizing the entire route.

#### 5. URL State (`searchParams`) vs. Ephemeral Component State (`useState`)

| Scenario | Client State (`useState`) | Server URL State (`searchParams`) |
| :--- | :--- | :--- |
| **Page Refresh (F5)** | ❌ State wiped out; resets back to default "All" tab | ✅ **Preserved**: Reloads the exact filtered view from the URL |
| **Link Sharing** | ❌ Broken: Sharing `/orders` shows unfiltered data to coworker | ✅ **Shareable**: `/orders?status=PENDING&query=metro` displays identical view |
| **Browser History (← / →)** | ❌ Broken: Back button exits the page or does nothing | ✅ **Works**: Steps backward through previously viewed filter states |
| **Bookmarking** | ❌ Cannot bookmark a specific tab or filtered queue | ✅ **Works**: Direct bookmarking of any filtered view |
| **Client Bundle Size** | ❌ Ships filter functions, state logic, and arrays to browser | ✅ **0 KB**: All filtering and markup generated on the server |
| **Backend Integration** | ❌ Sends large datasets to browser for client filtering | ✅ **Scalable**: Queries only matching rows at the database level |

#### 6. Architectural Rule of Thumb
> If a user would ever want to refresh the page, share the link, or press the browser back button and see the same view, store that state in the URL (`searchParams`), not in `useState`.

---

## 4. File Locations, Responsibilities & Snippets

### 1. Root Layout
- **Location**: `src/app/layout.tsx`
- **What it does**: Defines global HTML, imports Google fonts (`Geist`), loads Tailwind CSS (`globals.css`), executes early synchronous theme determination in `<head>` to prevent FOUC, and establishes the application shell with `<main className="flex flex-1 flex-col">`.
- **Key Snippet**:
  ```tsx
  <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
    <head>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          `,
        }}
      />
    </head>
    <body className="min-h-full flex flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
    </body>
  </html>
  ```

---

### 2. Public Site Header
- **Location**: `src/components/layout/SiteHeader.tsx`
- **What it does**: Public navbar containing the `DT` brand logo linking to `/`, theme toggle (`<ThemeToggle />`), a "Sign In" link to `/login`, and a "Register" button to `/registration`. Uses dedicated header design tokens (`border-border`, `bg-header/80`, `text-header-foreground`).
- **Key Snippet**:
  ```tsx
  <header className="sticky top-0 z-50 border-b border-border bg-header/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-header-foreground text-xs font-black text-header">
          DT
        </div>
        <span className="text-lg font-bold text-header-foreground">DeciTrade</span>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-header-foreground">
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
- **What it does**: Dedicated auth navbar displaying the `DT` brand badge, theme toggle (`<ThemeToggle />`), and a "Back to Home" return link using dedicated header tokens (`bg-header/80`, `text-header-foreground`).
- **Key Snippet**:
  ```tsx
  <header className="sticky top-0 z-50 border-b border-border bg-header/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-header-foreground text-xs font-black text-header">
          DT
        </div>
        <span className="text-lg font-bold text-header-foreground">DeciTrade</span>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-header-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  </header>
  ```

---

### 4. Authenticated Portal Header
- **Location**: `src/components/layout/Header.tsx`
- **What it does**: Persistent navbar for authenticated portal layouts. Renders brand logo linking to `/`, theme toggle (`<ThemeToggle />`), and user greeting/profile indicators as a clean React Server Component.
- **Key Snippet**:
  ```tsx
  import Link from "next/link";
  import ThemeToggle from "@/components/ui/ThemeToggle";

  export default function Header() {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-header/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-header-foreground text-xs font-black text-header">
              DT
            </div>
            <span className="text-lg font-bold text-header-foreground">DeciTrade</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <p>Hi John!</p>
          </div>
        </div>
      </header>
    );
  }
  ```

---

### 5. Wholesaler Sidebar
- **Location**: `src/components/layout/WholesalerSidebar.tsx`
- **What it does**: Fixed navigation sidebar for the Wholesaler portal within the viewport-locked app shell. Uses `usePathname()` to detect active routes and highlight navigation links (`Dashboard`, `Orders`, `Inventory`). Occupies the full height of the body container (`w-64 shrink-0 h-full`) with internal scrolling (`overflow-y-auto`) so menu items remain reachable on short displays without moving the page.
- **Key Snippet**:
  ```tsx
  "use client";

  import Link from "next/link";
  import { usePathname } from "next/navigation";

  export default function WholesalerSidebar() {
    const pathname = usePathname();

    return (
      <aside className="w-64 shrink-0 h-full border-r border-border bg-card overflow-y-auto flex flex-col justify-between">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }
  ```

---

### 6. Footer
- **Location**: `src/components/layout/Footer.tsx`
- **What it does**: Pure React Server Component displaying copyright, terms, privacy, and support links. Rendered on public marketing pages (`src/app/page.tsx`), omitted from portal layouts to maintain the clean app shell.
- **Key Snippet**:
  ```tsx
  export default function Footer() {
    return (
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} DeciTrade. All rights reserved.</p>
        </div>
      </footer>
    );
  }
  ```

---

### 7. Homepage
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

### 8. Authentication Nested Layout
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

### 9. Validation Utilities
- **Location**: `src/lib/validator.ts`
- **What it does**: Exports reusable regular expressions for client-side form validation.
- **Key Snippet**:
  ```ts
  export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  export const PHONE_REGEX = /^\+?(?:[\s\-()]*\d){7,15}[\s\-()]*$/;
  ```

---

### 10. Login Page
- **Location**: `src/app/(auth)/login/page.tsx`
- **What it does**:
  - Sign-in form with client-side email and password validation.
  - Role selection tabs (`WHOLESALER` vs. `RETAILER`) driven by local `useState`.
  - Password visibility toggle (`Eye` / `EyeOff`) driven by local `useState`.
  - Disables default browser popups using `noValidate`.
  - Programmatically redirects to the selected portal (`/${targetPortal}/dashboard`) via `useRouter().push()`.
- **Key Snippet**:
  ```tsx
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"WHOLESALER" | "RETAILER">("WHOLESALER");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    // Validate credentials...
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const targetPortal = selectedRole.toLowerCase();
    router.push(`/${targetPortal}/dashboard`);
  }
  ```

---

### 11. Registration Page
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

### 12. Onboarding Page (2-Step Funnel)
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

### 13. Reusable StatCard Component
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

### 14. Wholesaler Portal Layout
- **Location**: `src/app/wholesaler/layout.tsx`
- **What it does**: Nested portal layout shell for all `/wholesaler/*` routes implementing the industry-standard viewport-locked app shell (`h-screen overflow-hidden`). Pins the `<Header />` at the top, fixes `<WholesalerSidebar />` on the left, and confines scrolling strictly to the right-hand content panel (`flex-1 h-full overflow-y-auto`).
- **Key Snippet**:
  ```tsx
  import Header from "@/components/layout/Header";
  import WholesalerSidebar from "@/components/layout/WholesalerSidebar";

  export default function WholesalerLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden bg-neutral-50 dark:bg-black">
          <WholesalerSidebar />
          <div className="flex-1 h-full overflow-y-auto min-w-0">{children}</div>
        </div>
      </div>
    );
  }
  ```

---

### 15. Wholesaler Root Redirection Page
- **Location**: `src/app/wholesaler/page.tsx`
- **What it does**: React Server Component route handler at `/wholesaler` that immediately forwards incoming traffic to `/wholesaler/dashboard` via Next.js server-side `redirect()`.
- **Key Snippet**:
  ```tsx
  import { redirect } from "next/navigation";

  export default function WholesalerPage() {
    redirect("/wholesaler/dashboard");
  }
  ```

---

### 16. Wholesaler Dashboard Page
- **Location**: `src/app/wholesaler/dashboard/page.tsx`
- **What it does**: A React Server Component portal for wholesalers that renders the metrics grid using the reusable `<StatCard />` component.
- **Key Snippet**:
  ```tsx
  import StatCard from "@/components/dashboard/StateCard";

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

### 17. Wholesaler Orders Page
- **Location**: `src/app/wholesaler/orders/page.tsx`
- **What it does**: Async React Server Component (zero client JavaScript bundle) that receives asynchronous `searchParams` (`Promise<{ status?: string; query?: string; date?: string }>`) directly from Next.js, combines server-side status tab filtering, text search matching, and calendar date filtering, renders the `<OrderSearch />` and `<OrderDateFilter />` leaf components inside `<Suspense>`, and displays the responsive order tracking table.
- **Key Snippet**:
  ```tsx
  interface PageProps {
    searchParams: Promise<{ status?: string; query?: string; date?: string }>;
  }

  export default async function WholesalerOrdersPage({ searchParams }: PageProps) {
    const { status, query, date } = await searchParams;
    const currentStatus = (status || "ALL").toUpperCase();
    const searchQuery = (query || "").toLowerCase();
    const filterDate = date || "";

    const filteredOrders = MOCK_ORDERS.filter((order) => {
      const matchesStatus =
        currentStatus === "ALL" || order.status === currentStatus;
      const matchesQuery =
        !searchQuery ||
        order.retailer.toLowerCase().includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery);
      const matchesDate =
        !filterDate || formatToISODate(order.date) === filterDate;

      return matchesStatus && matchesQuery && matchesDate;
    });

    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Suspense fallback={<div className="h-9 w-full max-w-sm rounded-lg bg-muted animate-pulse" />}>
            <OrderSearch />
          </Suspense>
          <Suspense fallback={<div className="h-9 w-44 rounded-lg bg-muted animate-pulse" />}>
            <OrderDateFilter />
          </Suspense>
        </div>
        {/* Render filteredOrders in server-rendered data table */}
      </div>
    );
  }
  ```

---

### 18. Wholesaler Inventory Page
- **Location**: `src/app/wholesaler/inventory/page.tsx`
- **What it does**: Warehouse inventory and catalog page for wholesalers to manage product listings and stock.
- **Key Snippet**:
  ```tsx
  export default function WholesalerInventoryPage() {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage warehouse stock and catalog items.</p>
      </div>
    );
  }
  ```

---

### 19. Retailer Portal Layout
- **Location**: `src/app/retailer/layout.tsx`
- **What it does**: Nested portal layout shell for all `/retailer/*` routes. Renders the shared logged-in `<Header />` at the top and wraps all child routes in a full-height container.
- **Key Snippet**:
  ```tsx
  import Header from "@/components/layout/Header";

  export default function RetailerLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-1 flex-col">
        <Header />
        <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-black">
          <div className="flex-1">{children}</div>
        </div>
      </div>
    );
  }
  ```

---

### 20. Retailer Root Redirection Page
- **Location**: `src/app/retailer/page.tsx`
- **What it does**: React Server Component route handler at `/retailer` that immediately forwards incoming traffic to `/retailer/dashboard` via Next.js server-side `redirect()`.
- **Key Snippet**:
  ```tsx
  import { redirect } from "next/navigation";

  export default function RetailerPage() {
    redirect("/retailer/dashboard");
  }
  ```

---

### 21. Retailer Dashboard Page
- **Location**: `src/app/retailer/dashboard/page.tsx`
- **What it does**: A React Server Component portal for retailers that renders retail-specific metrics (`Active Deliveries`, `Connected Wholesalers`, `Monthly Procurement`) using the reusable `<StatCard />` component.
- **Key Snippet**:
  ```tsx
  import StatCard from "@/components/dashboard/StateCard";

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
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

### 22. Reusable Button Component
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

### 23. Theme Toggle Component
- **Location**: `src/components/ui/ThemeToggle.tsx`
- **What it does**: Client Component that toggles the `.dark` class on `document.documentElement` (`<html>`), persists user choice in `localStorage`, and uses pure CSS toggling (`dark:hidden` / `hidden dark:block`) to eliminate hydration delays and icon pop-in.
- **Key Snippet**:
  ```tsx
  "use client";

  import { Sun, Moon } from "lucide-react";
  import Button from "@/components/ui/Button";

  export default function ThemeToggle() {
    function toggleTheme() {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    return (
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <Moon className="w-4 h-4 text-zinc-400 dark:hidden" />
        <Sun className="w-4 h-4 text-amber-400 hidden dark:block" />
      </Button>
    );
  }
  ```

---

### 24. Order Search Component
- **Location**: `src/components/dashboard/OrderSearch.tsx`
- **What it does**: Client Component search input using `useSearchParams()`, `usePathname()`, and `useRouter()` to update the URL query parameter (`?query=...`) in real time, preserving active status filters and using `router.replace()` to avoid cluttering browser navigation history.
- **Key Snippet**:
  ```tsx
  "use client";

  import { useSearchParams, usePathname, useRouter } from "next/navigation";
  import { Search } from "lucide-react";

  export default function OrderSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    function handleSearch(term: string) {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }
      replace(`${pathname}?${params.toString()}`);
    }

    return (
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by retailer or Order ID..."
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>
    );
  }
  ```

---

### 25. Order Date Filter Component
- **Location**: `src/components/dashboard/OrderDateFilter.tsx`
- **What it does**: Leaf Client Component date filter featuring a decorative left calendar icon matching the search bar, direct keyboard typing capability (`type="date"`), a single right-aligned chevron button to trigger the calendar popup, and native dark mode support (`color-scheme: dark`). Writes `?date=YYYY-MM-DD` to the URL while preserving existing `status` and `query` parameters.
- **Key Snippet**:
  ```tsx
  "use client";

  import { useSearchParams, usePathname, useRouter } from "next/navigation";
  import { Calendar, ChevronDown, X } from "lucide-react";

  export default function OrderDateFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const currentDate = searchParams.get("date") || "";

    function handleDateChange(date: string) {
      const params = new URLSearchParams(searchParams.toString());
      if (date) {
        params.set("date", date);
      } else {
        params.delete("date");
      }
      replace(`${pathname}?${params.toString()}`);
    }

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <Calendar className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={currentDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
        {currentDate && (
          <button type="button" onClick={() => handleDateChange("")}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
  ```
