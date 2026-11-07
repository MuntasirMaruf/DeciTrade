# DeciTrade — Architecture & Implementation Guideline



This document tracks the architecture, component locations, responsibilities, state management concepts, validation logic, and key implementation snippets for the project, built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.



---



## 1. Tech Stack Overview



- **Framework**: [Next.js](https://nextjs.org/) (App Router, v16+)

- **Library**: [React](https://react.dev/) (v19)

- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)

- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)

- **Icons**: [Lucide React](https://lucide.dev/) (`lucide-react`)

- **Database & Auth**: [Supabase](https://supabase.com/) (Managed PostgreSQL, GoTrue Auth, Row Level Security)

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

│   │   │       ├── page.tsx        # Route: /onboarding (Server Component: Auth & DB guard with zero-flash redirect)

│   │   │       └── OnboardingForm.tsx # Colocated Client Component (Step 2 business setup form)

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

│   │   │   ├── OnboardingBanner.tsx # Pinned server-baked alert for incomplete business profile

│   │   │   ├── WholesalerSidebar.tsx # Pinned navigation sidebar with route-aware active state

│   │   │   └── Footer.tsx      # Global footer with dynamic year & links

│   │   └── ui/             # Reusable design system primitives

│   │       ├── Button.tsx      # Reusable button with variants and loading state

│   │       └── ThemeToggle.tsx # Client-side theme toggle with localStorage persistence

│   ├── lib/                # Shared utilities & validators

│   │   └── validator.ts    # Centralized regex patterns (Email, Password, Phone)

│   ├── utils/              # Third-party SDK & client initializations

│   │   └── supabase/

│   │       ├── client.ts   # Browser Client for Client Components (@supabase/ssr)

│   │       ├── proxy.ts    # Session refresh & cookie synchronization helper (@supabase/ssr)

│   │       └── server.ts   # Server Client for Server Components & Actions (@supabase/ssr)

│   └── proxy.ts            # Next.js 16 Proxy route guard & session updater (replaces deprecated middleware.ts)

├── b2b_wholesale_architecture_plan.md # Architectural blueprint & hybrid pattern specification

├── supabase_schema.sql     # Complete PostgreSQL DDL (10 ENUMs, 14 tables, triggers, RLS)

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

Tokens are declared as CSS variables under `:root` for light mode and overridden under `.dark` for dark mode, categorized into four functional groups:



- **Group A (Typography & Geometry)**: `--font-sans` (`var(--font-geist-sans)`), `--font-mono` (`var(--font-geist-mono)`), `--radius` (`0.5rem`).

- **Group B (Buttons & Clickable Controls)**:

  - **Primary CTA**: `--primary` (`#18181b` light / `#fafafa` dark), `--primary-foreground` (`#fafafa` light / `#18181b` dark).

  - **Secondary Actions**: `--secondary` (`#f4f4f5` light / `#27272a` dark), `--secondary-foreground` (`#18181b` light / `#fafafa` dark).

  - **Brand / Promo / Accent**: `--accent` (`#10b981` emerald), `--accent-foreground` (`#ffffff`).

  - **Danger / Destructive**: `--destructive` (`#ef4444` light / `#f87171` dark), `--destructive-foreground` (`#ffffff` light / `#09090b` dark).

- **Group C (Surfaces, Layout & Passive Text)**:

  - **Page Canvas**: `--background` (`#ffffff` light / `#09090b` dark), `--foreground` (`#09090b` light / `#fafafa` dark).

  - **Cards & Containers**: `--card` (`#ffffff` light / `#121215` dark), `--card-foreground` (`#09090b` light / `#fafafa` dark).

  - **Floating Overlays**: `--popover` (`#ffffff` light / `#121215` dark), `--popover-foreground`.

  - **Subtle Wells & Disabled States**: `--muted` (`#f4f4f5` light / `#27272a` dark), `--muted-foreground` (`#71717a` light / `#a1a1aa` dark).

  - **Header & Navigation**: `--header-background` (`#ffffff` light / `#000000` dark), `--header-foreground` (`#09090b` light / `#fafafa` dark).

  - **Footer**: `--footer-background` (`#fafafa` light / `#000000` dark), `--footer-foreground` (`#71717a` light / `#a1a1aa` dark).

- **Group D (Borders, Inputs & Focus Rings)**:

  - **Structural Borders**: `--border` (`#e4e4e7` light / `#27272a` dark) for cards and dividers (`border-border`).

  - **Interactive & Form Borders**: `--input` (`#e4e4e7` light / `#27272a` dark) for inputs and outline buttons (`border-input`).

  - **Focus Glow**: `--ring` (`#18181b` light / `#d4d4d8` dark) for keyboard accessibility rings (`focus-visible:ring-ring`).



#### 3. Mapping Tokens to Tailwind Utilities (`@theme inline`)

Registered directly in `src/app/globals.css`:

```css

@theme inline {

  --font-sans: var(--font-sans);

  --font-mono: var(--font-mono);

  --radius-base: var(--radius);



  /* Button & Interactive Utilities */

  --color-primary: var(--primary);

  --color-primary-foreground: var(--primary-foreground);

  --color-secondary: var(--secondary);

  --color-secondary-foreground: var(--secondary-foreground);

  --color-accent: var(--accent);

  --color-accent-foreground: var(--accent-foreground);

  --color-destructive: var(--destructive);

  --color-destructive-foreground: var(--destructive-foreground);



  /* Surfaces, Layout & Passive Text */

  --color-background: var(--background);

  --color-foreground: var(--foreground);

  --color-card: var(--card);

  --color-card-foreground: var(--card-foreground);

  --color-popover: var(--popover);

  --color-popover-foreground: var(--popover-foreground);

  --color-muted: var(--muted);

  --color-muted-foreground: var(--muted-foreground);

  --color-header: var(--header-background);

  --color-header-foreground: var(--header-foreground);

  --color-footer: var(--footer-background);

  --color-footer-foreground: var(--footer-foreground);



  /* Borders & Focus Rings */

  --color-border: var(--border);

  --color-input: var(--input);

  --color-ring: var(--ring);

}

```

- **Result**: Generates utility classes (`bg-background`, `text-foreground`, `bg-header`, `text-header-foreground`, `bg-footer`, `text-footer-foreground`) that automatically swap colors when the `.dark` class toggles without requiring React re-renders.



#### 4. Zero-Blink Theme Synchronization Architecture

- **Eliminating Hydration Pop-In**: Traditional client-only mounting patterns (e.g. `if (!mounted) return <Button className="opacity-0">`) cause a visible flicker on browser refresh while React hydrates.

- **Synchronous Script Injection (`src/app/layout.tsx`)**: Utilizes Next.js's `<Script id="theme-script" strategy="beforeInteractive">` to hoist the theme resolution script into the document `<head>` during server-side compilation, attaching the `.dark` class to `<html>` prior to the first pixel render without triggering React 19 component warnings.

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



### Q. Full-Stack Supabase Auth & PostgreSQL Schema Architecture



DeciTrade implements a hybrid full-stack architecture combining **Next.js App Router** with **Supabase (PostgreSQL & GoTrue Auth)**.



#### 1. The End-to-End Auth & Onboarding Lifecycle

The user access and onboarding workflow spans 7 coordinated phases across the browser, Next.js server, Supabase Auth, and the PostgreSQL database:



```text

1. Registration (/registration)

   └─ User submits: email, password, role ('WHOLESALER' | 'RETAILER'), business_name, phone_number

   └─ Next.js invokes: supabase.auth.signUp() with raw_user_meta_data

   └─ Fast, non-blocking redirect straight to role dashboard (/wholesaler/dashboard or /retailer/dashboard)

   │

   ▼

2. Automated Database Trigger (handle_new_user)

   └─ PostgreSQL trigger intercepts AFTER INSERT ON auth.users

   └─ Automatically inserts 1-to-1 profile into public.profiles

   └─ If 'WHOLESALER', initializes record in public.wholesalers

   └─ If 'RETAILER', initializes record in public.retailers

   │

   ▼

3. Progressive Onboarding & Zero-Lag Layout Banner (Server Component Layouts)

   └─ WholesalerLayout / RetailerLayout queries warehouse_address or delivery_address on server

   └─ If incomplete: bakes <OnboardingBanner /> directly into initial HTML (0ms delay, 0 pop-in)

   └─ User clicks "Complete Profile →" on the banner to visit /onboarding when ready

   │

   ▼

4. Invited Onboarding Route (/onboarding)

   └─ Server Component checks DB: if already completed -> zero-flash redirect to dashboard

   └─ If incomplete: renders OnboardingForm with confirmed role pill (no redundant toggle buttons)

   └─ On submit: writes address to DB and redirects to dashboard (banner vanishes automatically)

   │

   ▼

5. Login Flow (/login)

   └─ User enters credentials -> supabase.auth.signInWithPassword()

   └─ Instant entry to role dashboard (no blocking sequential address query on login)

   │

   ▼

6. Route Protection & Session Refresh (src/proxy.ts — Next.js 16 Proxy)

   └─ Intercepts requests to /wholesaler/* and /retailer/*

   └─ Automatically refreshes expired Supabase JWT session tokens

   └─ Blocks unauthenticated users -> redirects to /login

   └─ Enforces role segregation: prevents Retailers from accessing Wholesaler routes

   │

   ▼

7. Portal Identity & Sign-Out (src/components/layout/Header.tsx)

   └─ React Server Component reads active session via createClient() -> supabase.auth.getUser()

   └─ Displays verified business_name and role pill in portal navbar

   └─ Native <form action={handleSignOut}> executes inline Server Action ("use server")

   └─ Invokes supabase.auth.signOut() to clear session cookies on the server

   └─ Issues redirect("/login") -> Zero client-side JavaScript overhead

```



##### Local Development Auth Configuration

- **Email Confirmation Setting**: In Supabase Dashboard &rarr; **Authentication** &rarr; **Sign In / Providers** (under `CONFIGURATION`) &rarr; click **Email** &rarr; toggle **OFF** `"Confirm email"` and click **Save**.

- **Why**: By default, Supabase holds newly registered accounts in an unconfirmed state (`confirmed_at: null`) until an email verification link is clicked. Disabling this during development enables immediate login, role verification, and direct testing of the onboarding funnel without requiring custom SMTP infrastructure. (In production, this must remain enabled).



#### 2. Detailed Data Journey: How Registration Data Leaves Next.js and Flows into Supabase



The registration pipeline executes across 4 sequential stages spanning the browser client, network wire, Supabase GoTrue Auth service, PostgreSQL engine, and client session hydration:



```text

[ Browser (Next.js Client) ]

  1. User fills registration form (email, password, businessName, phone, selectedRole)

  2. handleSubmit executes client-side regex validations (validator.ts)

  3. createClient() initializes createBrowserClient with publishable key

  4. supabase.auth.signUp() packages payload with options.data (metadata)

         │

         │ HTTPS POST /auth/v1/signup (TLS encrypted)

         │ Headers: apikey, Content-Type: application/json

         ▼

[ Supabase GoTrue Service ]

  5. GoTrue validates email format & unique constraint

  6. Hashes password securely via bcrypt + salt

  7. Checks "Confirm email" status (immediately confirmed if disabled for dev)

  8. Executes internal INSERT INTO auth.users

         │

         │ Internal PostgreSQL Engine Event: AFTER INSERT ON auth.users

         ▼

[ PostgreSQL Database Engine (supabase_schema.sql) ]

  9. Trigger on_auth_user_created intercepts newly inserted row

 10. Executes handle_new_user() in SECURITY DEFINER mode (bypasses RLS)

 11. Reads NEW.raw_user_meta_data ('role', 'business_name', 'phone_number')

 12. Atomic INSERT INTO public.profiles (id, role, business_name, phone_number)

 13. Conditional domain initialization:

     ├─ IF role = 'WHOLESALER' ──> INSERT INTO public.wholesalers (id, warehouse_address)

     └─ ELSIF role = 'RETAILER' ──> INSERT INTO public.retailers (id, delivery_address)

         │

         │ Database Transaction Commits (All-or-Nothing)

         ▼

[ Return Trip & Client Session Hydration ]

 14. GoTrue returns HTTP 200 OK with User object, access_token (JWT), and refresh_token

 15. @supabase/ssr browser client writes session cookie (document.cookie)

 16. React 19 updates state: setIsLoading(false)

 17. Programmatically forwards to role dashboard via router.push(targetDashboard)

```



##### Stage 1: Browser Dispatch & Payload Construction

When the user clicks "Create account" in `src/app/(auth)/registration/page.tsx`:

1. `handleSubmit` prevents default form submission and executes client-side validation against `EMAIL_REGEX`, `PASSWORD_REGEX`, and `PHONE_REGEX` from `src/lib/validator.ts`.

2. The browser-side Supabase client (`createClient()` from `src/utils/supabase/client.ts`) is instantiated using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

3. `supabase.auth.signUp()` transforms the form data into a structured JSON payload:

   ```json

   {

     "email": "wholesaler@example.com",

     "password": "Password123!",

     "data": {

       "role": "WHOLESALER",

       "business_name": "Apex Wholesale Ltd",

       "phone_number": "+8801712345678"

     }

   }

   ```

4. Dispatches an HTTPS `POST` request to `https://<project-ref>.supabase.co/auth/v1/signup` over TLS.



##### Stage 2: Supabase GoTrue Auth Processing

1. Supabase's GoTrue authentication microservice receives the request and verifies the public API key.

2. It validates that the email address is unique across the project.

3. The password is cryptographically hashed with `bcrypt` (never stored in plaintext).

4. If `"Confirm email"` is disabled (local dev), the user's `email_confirmed_at` timestamp is immediately set to current UTC time.

5. GoTrue writes the new identity into the managed PostgreSQL table `auth.users`, storing `data` inside the `raw_user_meta_data` JSONB column.



##### Stage 3: Atomic PostgreSQL Trigger & Domain Entity Provisioning

1. PostgreSQL detects `AFTER INSERT ON auth.users` and fires the `on_auth_user_created` trigger.

2. The trigger executes `public.handle_new_user()` with `SECURITY DEFINER` privileges (elevated service privileges that bypass client-facing Row Level Security).

3. `handle_new_user()` performs two atomic operations within the same database transaction:

   - **Step A (`public.profiles`)**: Inserts a 1-to-1 record linking to `NEW.id`, populating `role`, `business_name`, and `phone_number`.

   - **Step B (Domain Table)**: Evaluates the parsed `user_role`:

     - If `'WHOLESALER'`, inserts an initial row into `public.wholesalers(id, warehouse_address)` with `id = NEW.id`.

     - If `'RETAILER'`, inserts an initial row into `public.retailers(id, delivery_address)` with `id = NEW.id`.

4. **Atomicity Guarantee**: If any constraint fails, the entire database transaction rolls back, preventing orphaned or desynchronized accounts.



##### Stage 4: Response, Session Storage & Next.js UI Transition

1. Supabase GoTrue returns an HTTP 200 OK response containing the newly created `User` record alongside an `access_token` (JWT) and a `refresh_token`.

2. `@supabase/ssr` (`createBrowserClient`) writes the session tokens into browser storage (`document.cookie`), ensuring future requests from Next.js Server Components and Server Actions receive the session via `cookies()`.

3. React 19 updates submission state: `setIsLoading(false)`.

4. Evaluates `selectedRole` and dynamically redirects via `router.push(targetDashboard)`.



##### Deep Dive: The Supabase Session Cookie Architecture (`sb-<project-ref>-auth-token`)



###### 1. Where and How the Cookie is Born (`src/app/(auth)/registration/page.tsx`)

When the user submits the registration form, the `@supabase/ssr` browser client issues the sign-up call and immediately writes the returned session to `document.cookie`:



```tsx

// Location: src/app/(auth)/registration/page.tsx (Inside handleSubmit)

const supabase = createClient();

const { data, error: signUpError } = await supabase.auth.signUp({

    email,

    password,

    options: {

        data: {

            role: selectedRole,

            business_name: businessName,

            phone_number: phone,

        },

    },

});



// Under the hood, @supabase/ssr intercepts the HTTP 200 response and executes:

// document.cookie = "sb-<project-ref>-auth-token=<base64-json>; path=/; max-age=31536000; SameSite=Lax";

```



###### 2. What is Stored in the Browser Cookie (`document.cookie`)

The resulting cookie payload stored under `sb-<project-ref>-auth-token` contains the session tokens and basic identity claims:



```json

{

  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  "refresh_token": "gAAAAABn...random_opaque_string",

  "expires_at": 1793895600,

  "user": {

    "id": "e4b2d1c0-789a-4bc1-9012-3456789abcde",

    "aud": "authenticated",

    "role": "authenticated",

    "email": "wholesaler@example.com",

    "user_metadata": {

      "role": "WHOLESALER",

      "business_name": "Apex Wholesale Ltd",

      "phone_number": "+8801712345678"

    },

    "app_metadata": {

      "provider": "email",

      "providers": ["email"]

    }

  }

}

```



- **`access_token`**: Short-lived signed JWT sent in the `Authorization: Bearer <token>` header to prove identity (`sub = user.id`) to PostgreSQL RLS policies (`auth.uid() = id`).

- **`refresh_token`**: Opaque string used by `@supabase/ssr` to automatically reissue access tokens upon expiration without forcing user re-authentication.

- **`user.email` vs. `user.user_metadata`**:

  - `user.email`: Primary auth credential, natively managed by GoTrue at the top level of `user`.

  - `user.user_metadata`: Custom application metadata passed via `options.data` during registration (`role`, `business_name`, `phone_number`), enabling downstream views to access these attributes without an immediate database query.



###### 3. Separation of Concerns: Cookies vs. Database Tables

- **Cookie Boundary (4KB Limit & Stale State Prevention)**: The cookie strictly stores the authentication session. It **never** stores domain tables (`warehouse_address`, product listings, orders, invoices). Storing relational entities in cookies causes header bloat, exceeds browser cookie limits (4KB per domain), and results in stale data when records update on the server.

- **PostgreSQL Tables (Relational Truth)**: Domain entities reside strictly in PostgreSQL (`public.profiles`, `public.wholesalers`, `public.retailers`).



###### 4. Server-Side Guard & Colocated Form Architecture (`src/app/(auth)/onboarding/`)

Rather than relying on client-side `useEffect` hooks that introduce a visible loading flicker and client-side auth fetch waterfalls, the onboarding flow utilizes the App Router Server Component Guard pattern:



1. **Server Guard (`src/app/(auth)/onboarding/page.tsx`)**:

   - Executes entirely on the server using `createClient()` from `src/utils/supabase/server.ts`.

   - Validates identity with `supabase.auth.getUser()`, redirecting unauthenticated visitors to `/login`.

   - Directly queries `public.wholesalers` or `public.retailers` in PostgreSQL on the server.

   - If business details already exist (`warehouse_address` or `delivery_address`), issues an immediate HTTP 307 `redirect()` before HTML or JavaScript streams to the browser, eliminating client redirects or loading flashes.

   - Passes validated `userId` and `initialRole` directly as props into the colocated form.



```tsx

// Location: src/app/(auth)/onboarding/page.tsx (Server Component)

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import OnboardingForm from "./OnboardingForm";



export default async function OnboardingPage() {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();



    if (!user) redirect("/login");



    const role = (user.user_metadata?.role as "WHOLESALER" | "RETAILER") || "WHOLESALER";

    const tableName = role === "WHOLESALER" ? "wholesalers" : "retailers";

    const addressField = role === "WHOLESALER" ? "warehouse_address" : "delivery_address";



    const { data: profile } = await supabase

        .from(tableName)

        .select(addressField)

        .eq("id", user.id)

        .single();



    const address = profile ? (profile as Record<string, string | null>)[addressField] : null;

    if (address && address.trim() !== "") {

        redirect(role === "WHOLESALER" ? "/wholesaler/dashboard" : "/retailer/dashboard");

    }



    return <OnboardingForm userId={user.id} initialRole={role} />;

}

```



2. **Colocated Client Form (`src/app/(auth)/onboarding/OnboardingForm.tsx`)**:

   - Manages interactive form state (`error`, `isLoading`) and submits business setup updates via the browser client (`src/utils/supabase/client.ts`).

   - Renders with the verified role from the very first frame without auth checks or spinners:



```tsx

// Location: src/app/(auth)/onboarding/OnboardingForm.tsx (Client Component)

"use client";



export default function OnboardingForm({ userId, initialRole }: OnboardingFormProps) {

    const [role, setRole] = useState<"WHOLESALER" | "RETAILER">(initialRole);

    const isWholesaler = role === "WHOLESALER";

    // ... handles form submit and routes dynamically to targetDashboard

}

```



###### 5. Verifying Session Cookies in Browser DevTools

Developers can inspect the active session token:

1. Open Browser DevTools (`F12` or `Ctrl + Shift + I`).

2. Navigate to **Application** &rarr; **Storage** &rarr; **Cookies** &rarr; `http://localhost:3000`.

3. Inspect the cookie prefixed with `sb-<project-ref>-auth-token`.



#### 3. Supabase Session Refresh & Route Protection Architecture (src/proxy.ts)



In Next.js 16 (`next@16.4.4`), the legacy `middleware.ts` file convention is **deprecated** and officially renamed to **`proxy.ts`** (`export function proxy(request: NextRequest)`), running in the Node.js runtime by default. This clarifies its role as a fast network boundary proxy in front of the application.



In applications using `@supabase/ssr`, Proxy performs two non-negotiable operational roles: **continuous session token renewal** and **global route isolation**.



##### 1. The React Server Component Read-Only Cookie Constraint

Next.js App Router enforces a strict unidirectional rendering lifecycle:

- React Server Components (`async function Page()`) can read cookies via `cookies()` from `next/headers`, but **cannot write, mutate, or set cookies** during component rendering.

- Supabase JSON Web Tokens (`access_token`) possess a standard 1-hour (3600 seconds) lifespan.

- When an authenticated user browses the platform after their initial access token expires, the server client can use the `refresh_token` to obtain a fresh `access_token`. However, because Server Components cannot write `Set-Cookie` response headers, the renewed token is discarded, causing the user to be abruptly logged out on subsequent requests.



##### 2. The Next.js 16 Proxy Solution (`updateSession`)

Next.js 16 Proxy executes on the network boundary *before* any request reaches a layout, page, Server Component, or Route Handler. Unlike Server Components, Proxy possesses read and write access to both request headers and response cookies.



```text

[ Browser Request ] (Incoming Cookie: sb-<project-ref>-auth-token)

        │

        ▼

[ Next.js 16 Proxy (src/proxy.ts) ]

  1. Intercepts request before route compilation

  2. Invokes updateSession(request) in src/utils/supabase/proxy.ts

  3. Initializes createServerClient with request.cookies and response.cookies

  4. Calls await supabase.auth.getUser() -> Contacts Supabase Auth server

     ├─ If access_token expired: GoTrue validates refresh_token -> issues new JWT

     └─ setAll() fires:

         ├─ Writes new token to request.cookies (hydrates downstream Server Components)

         └─ Writes Set-Cookie to supabaseResponse.cookies (persists to browser)

  5. Route Protection Check:

     ├─ Unauthenticated + /wholesaler/* or /retailer/* ──> Redirects to /login

     ├─ Authenticated + /login or /registration ──> Redirects to role dashboard

     ├─ Cross-role access (e.g. Retailer on /wholesaler/*) ──> Redirects to own dashboard

     └─ Valid authorized request ──> Returns modified supabaseResponse

        │

        ▼

[ React Server Components (Layouts & Pages) ]

  - Reads freshly renewed cookies via cookies() from next/headers

  - Executes database queries and renders HTML without auth drops

        │

        ▼

[ Browser Response ]

  - Receives HTTP response with Set-Cookie header

  - Storage is transparently updated without user disruption

```



##### 3. The Double-Writing Cookie Synchronization Pattern

To guarantee that both downstream Server Components (rendering the *current* request) and the client browser (for *future* requests) have access to the refreshed token, `setAll` writes to two targets:



```typescript

// Location: src/utils/supabase/proxy.ts

setAll(cookiesToSet) {

  // 1. Mutate request headers so Server Components rendering this request see new cookies

  cookiesToSet.forEach(({ name, value }) =>

    request.cookies.set(name, value)

  );

  supabaseResponse = NextResponse.next({

    request,

  });

  // 2. Mutate response headers so the browser persists the renewed token

  cookiesToSet.forEach(({ name, value, options }) =>

    supabaseResponse.cookies.set(name, value, options)

  );

}

```



##### 4. Cookie Forwarding on HTTP Redirects

When Next.js issues an HTTP redirect via `NextResponse.redirect(url)`, it instantiates a fresh response object with an empty cookie jar. If `supabase.auth.getUser()` renewed an expiring session token during that request, returning `NextResponse.redirect(url)` directly drops the newly staged `Set-Cookie` headers.



To guarantee that refreshed session cookies are preserved across redirects (e.g. unauthenticated redirects to `/login` or role boundary redirections), `src/utils/supabase/proxy.ts` implements a `redirectTo` helper that copies all staged cookies from `supabaseResponse`:



```typescript

function redirectTo(path: string) {

  const url = request.nextUrl.clone();

  url.pathname = path;

  const redirectResponse = NextResponse.redirect(url);

  supabaseResponse.cookies.getAll().forEach((cookie) => {

    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);

  });

  return redirectResponse;

}

```



##### 5. Why `supabase.auth.getUser()` is Mandatory (Never `getSession()`)

- **`getSession()`**: Reads the JWT payload directly from the raw cookie string without validating its signature or status against the Supabase Auth server. If an account is revoked, disabled, or the secret was rotated, `getSession()` returns stale credentials.

- **`getUser()`**: Sends an authenticated network verification to Supabase GoTrue Auth, rigorously validating token integrity, checking account status, and triggering the automatic token refresh lifecycle.



##### 6. Proxy Route Matcher Configuration

To prevent Proxy from running on static image assets, favicons, and bundled JavaScript chunks, `src/proxy.ts` applies a negative-lookahead route filter:



```typescript

// Location: src/proxy.ts

export const config = {

  matcher: [

    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",

  ],

};

```



#### 4. The PostgreSQL Automated User Trigger (`handle_new_user`)

Rather than relying on client-side JavaScript to execute multiple separate `INSERT` statements across network hops, a PostgreSQL `SECURITY DEFINER` trigger guarantees atomic profile creation inside the database engine:



```sql

CREATE OR REPLACE FUNCTION public.handle_new_user()

RETURNS TRIGGER AS $$

DECLARE

    user_role_val public.user_role;

BEGIN

    user_role_val := COALESCE(

        (NEW.raw_user_meta_data->>'role')::public.user_role,

        'WHOLESALER'::public.user_role

    );



    -- 1. Atomic profile creation

    INSERT INTO public.profiles (id, role, business_name, phone_number)

    VALUES (NEW.id, user_role_val, NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'phone_number');



    -- 2. Role-specific domain table initialization

    IF user_role_val = 'WHOLESALER' THEN

        INSERT INTO public.wholesalers (id, warehouse_address)

        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'warehouse_address', ''));

    ELSIF user_role_val = 'RETAILER' THEN

        INSERT INTO public.retailers (id, delivery_address)

        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'delivery_address', ''));

    ELSIF user_role_val = 'ADMIN' THEN

        INSERT INTO public.admins (id, admin_role, is_super_admin)

        VALUES (NEW.id, 'SUPPORT', FALSE);

    END IF;



    RETURN NEW;

END;

$$ LANGUAGE plpgsql SECURITY DEFINER;



CREATE TRIGGER on_auth_user_created

    AFTER INSERT ON auth.users

    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

```



#### 5. Database Domain Model & Schema Dictionary

The platform schema (`supabase_schema.sql`) organizes data into 6 relational domains:

1. **Identity & Profiles**: 

   - `profiles`: Base table for all personas (`WHOLESALER`, `RETAILER`, `CUSTOMER`, `ADMIN`) with `is_verified BOOLEAN NOT NULL DEFAULT FALSE`.

   - `wholesalers`: `warehouse_address` (`TEXT NOT NULL DEFAULT ''`), `trade_license_number` (`VARCHAR(100) NOT NULL DEFAULT ''`), `tax_id` (`VARCHAR(100) NOT NULL DEFAULT ''`), minimum order amounts, accepted payment terms, catalog public toggles.

   - `retailers`: `delivery_address` (`TEXT NOT NULL DEFAULT ''`), `trade_license_number` (`VARCHAR(100) NOT NULL DEFAULT ''`), `tax_id` (`VARCHAR(100)` optional/nullable), shop category.

   - `admins`: Role-Based Access Control (`admin_role`: `'SUPER_ADMIN'`, `'COMPLIANCE'`, `'SUPPORT'`, `'FINANCE'`), permissions array (`permissions TEXT[]`), department.

   - `CUSTOMER`: Pure consumers live directly in `profiles` with zero overhead.

2. **Networking & KYC**: `invitation_tokens` (cryptographic, rate-limited invite links), `connections` (wholesaler-retailer links with state machine: `PENDING_REVIEW` $\rightarrow$ `ACTIVE`), `kyc_documents`, `kyc_revision_history`.

3. **Catalog & Products**: `categories`, `products` (with `reserved_quantity` for concurrency stock locks, `cost_price` for private margin calculations, `compare_at_price` and discount scheduling for promotional sales, and `price_tiers` JSONB for bulk volume discounts).

4. **Orders & Negotiation**: `orders` (with permanent `shipping_address_snapshot`), `order_items` (supporting the line-item counter-offer model: `requested_quantity` vs. `confirmed_quantity`), `invoices`, `order_status_history`.

5. **Notifications**: `notifications` (system signals, connection status alerts, invoice updates).



#### 6. Hybrid CQRS Architecture (Reads via Supabase BFF, Mutations via NestJS)

DeciTrade follows the **CQRS + BFF Pattern** (Command Query Responsibility Segregation with a Backend-for-Frontend):

1. **The Read Path (Instant, Streaming UI)**:

   - Next.js Server Components query Supabase directly via `@supabase/ssr` using the authenticated user's session cookie.

   - Enables sub-10ms page loads for order queues, order details (`orders` joined with `order_items`), catalog filtering, and categories without intermediate API proxy latency.

   - **Margin Protection**: Server Components strictly use explicit column projection (omitting `cost_price`) when displaying product cards to retailers.

2. **The Write Path (Transactional Integrity & State Machines)**:

   - Complex business operations (submitting purchase orders, issuing counter-offers, accepting/declining orders with reason, inventory deduction, and KYC approval) are dispatched to **NestJS endpoints**.

   - NestJS wraps state changes in atomic PostgreSQL transactions (`SELECT FOR UPDATE`), coordinates background BullMQ workers (PDF invoice generation), and triggers external communications (WhatsApp Business API, Email).

3. **Child Table RLS Policies**:

   - To support nested joins (e.g. `.select('*, order_items(*)')`), PostgreSQL RLS is enabled on both parent and child tables (`orders`, `order_items`, `order_status_history`, `kyc_documents`, `categories`), enforcing participant checks (`wholesaler_id = auth.uid() OR retailer_id = auth.uid()`).



#### 7. Deep-Dive Reanalysis: The Dual-Client Architecture (`client.ts` vs. `server.ts`)



In Next.js App Router, code executes across two fundamentally isolated runtimes:

1. **The Browser Environment (Client Runtime)**: Client Components marked with `"use client"`, where React state, event handlers, and browser APIs (`document.cookie`, `window`) exist.

2. **The Server Environment (Node.js / Edge Runtime)**: React Server Components (RSC), Server Actions (`"use server"`), and Route Handlers, where browser DOM APIs do not exist and identity must be retrieved from incoming HTTP request headers.



To bridge this runtime divide without session desynchronization, `@supabase/ssr` replaces legacy auth wrappers with a cookie-first dual-client architecture:



##### A. The Browser Client (`src/utils/supabase/client.ts`)

- **Factory Method**: `createBrowserClient(url, key)` from `@supabase/ssr`.

- **Cookie Mechanism**: Interfaces natively with the browser's `document.cookie` storage. It automatically persists access and refresh tokens upon login and includes them in outgoing network calls.

- **Environment Scope**: Exclusively imported in Client Components (`"use client"`).

- **Security Posture**: Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`). Because this public key is bundled into client-side JavaScript, security is enforced strictly by PostgreSQL Row Level Security (RLS) policies.

- **DeciTrade Role**: Powers interactive client forms (e.g. `RegistrationPage`, `LoginPage`) and handles client-side Supabase Realtime WebSocket subscriptions (`supabase.channel(...)`).



##### B. The Server Client (`src/utils/supabase/server.ts`)

- **Factory Method**: `createServerClient(url, key, { cookies })` from `@supabase/ssr`.

- **Next.js 15+ Async Cookie Contract**: In modern Next.js (v15 and v16), `cookies()` from `next/headers` is an **asynchronous Promise**. The helper is structured as an `async function createClient()`:

  ```typescript

  export async function createClient() {

    const cookieStore = await cookies();

    return createServerClient(supabaseUrl!, supabaseKey!, { ... });

  }

  ```

  This architectural pattern allows callers in Server Components and Server Actions to cleanly write `const supabase = await createClient();` without needing to manually unwrap and pass `cookieStore` as a parameter.

- **The Cookie Adapter Pattern (`getAll` and `setAll`)**:

  - `getAll()`: Reads all incoming cookies from the incoming HTTP request headers, passing the user's session JWT to Supabase so PostgreSQL can evaluate `auth.uid()` in RLS policies.

  - `setAll()`: Emits `Set-Cookie` HTTP response headers when an access token refreshes.

  - **The Try/Catch Guard**: In Next.js App Router, **React Server Components (RSC) are prohibited from setting cookies** during rendering (they can only stream read-only HTML). If a token refresh occurs during a Server Component render, the `catch` block safely ignores the error; the actual cookie persistence is delegated to Next.js middleware or Server Actions.

- **Environment Scope**: Exclusively imported in Server Components, Server Actions (`"use server"`), and Route Handlers. Never import `server.ts` into a `"use client"` file.

- **DeciTrade Role**: Executes fast, server-side data fetching for orders (`/wholesaler/orders`), catalog browsing, and profile data in portal layouts.



##### C. Architecture Comparison Matrix



| Architectural Dimension | Browser Client (`client.ts`) | Server Client (`server.ts`) |

| :--- | :--- | :--- |

| **Location** | `src/utils/supabase/client.ts` | `src/utils/supabase/server.ts` |

| **Underlying SDK Method** | `createBrowserClient()` | `createServerClient()` |

| **Allowed Runtime** | Browser only (`"use client"`) | Server only (RSC, Server Actions, Route Handlers) |

| **Session Storage** | `document.cookie` (Client-side) | `cookies()` from `next/headers` (HTTP headers) |

| **Async Signature** | Synchronous: `const supabase = createClient()` | Asynchronous: `const supabase = await createClient()` |

| **Cookie Mutation** | Direct browser cookie write | Writes `Set-Cookie` response headers (guarded by try/catch in RSC) |

| **Security Mechanism** | RLS enforcement via Anon/Publishable Key | RLS enforcement via Session Cookie JWT |



#### 8. Server Action Sign-Out Architecture (Zero-Client-JS Authentication Teardown)



In DeciTrade, terminating an authenticated user session is architected as a pure React Server Component (RSC) operation paired with a Next.js Server Action (`"use server"`).



```text

[ Authenticated Portal Header (Header.tsx - RSC) ]

  │

  ├─ 1. Reads current user via createClient() -> supabase.auth.getUser()

  ├─ 2. Renders dynamic business name & role badge without client hydration

  │

  ▼

[ Native HTML Form (<form action={handleSignOut}>) ]

  │

  ├─ User clicks <button type="submit">

  ├─ Browser initiates native form POST request to Next.js server endpoint

  │

  ▼

[ Inline Server Action ("use server") ]

  │

  ├─ 1. Invokes createClient() from src/utils/supabase/server.ts

  ├─ 2. Calls await supabase.auth.signOut()

  │     └─ Supabase invalidates session and sets empty/expired Set-Cookie headers

  ├─ 3. Calls redirect("/login")

  │     └─ Throws Next.js NEXT_REDIRECT signal (HTTP 303)

  ▼

[ Browser Redirects to /login ]

  └─ Land on unauthenticated page with fresh cookie jar; 0 KB client bundle overhead

```



##### Why Server Action `<form action>` Instead of Client `onClick`?

1. **Zero Client-Side JavaScript Overhead**: The portal header remains an async Server Component. No `"use client"` directive is added, avoiding client bundle weight and React state hydration for the header.

2. **Direct Server-Side Cookie Invalidation**: Calling `supabase.auth.signOut()` inside the Server Action writes HTTP `Set-Cookie` deletion headers into the active HTTP response stream before navigation occurs.

3. **Elimination of Navigation Race Conditions**: In client-side logout (`await supabase.auth.signOut()` followed by `router.push('/login')`), component re-renders or concurrent layout transitions may fire before cookies have fully propagated across tabs, potentially causing flash-of-unauthorized content. The server action's `redirect()` halts execution immediately and delivers a canonical HTTP 303 redirect.



---

#### 9. Progressive Onboarding & Verification Architecture (RSC Layout Join vs. Client Context)



In DeciTrade, account onboarding and verification use the **3-State Progressive Onboarding model**: instead of forcibly locking users out of their dashboard, users enter their role portal immediately with features gated by business verification (`public.profiles.is_verified`).



```text

[ Incoming Request: /wholesaler/dashboard ]

       │

       ▼

[ 1. Network Edge: src/proxy.ts ]

   - Checks: Is user authenticated? (Yes)

   - Checks: Role authorization match? (Yes)

   - Passes request through with zero database queries at the edge

       │

       ▼

[ 2. Server Layout: src/app/wholesaler/layout.tsx (RSC) ]

   - Executes single PostgreSQL JOIN query via Supabase:

     SELECT warehouse_address, trade_license_number, tax_id, profiles(is_verified)

     FROM wholesalers JOIN profiles ON wholesalers.id = profiles.id WHERE id = auth.uid()

   - Evaluates:

     * isVerified = profiles.is_verified

     * hasSubmittedOnboarding (Wholesaler) = warehouse_address.trim() && trade_license_number.trim() && tax_id.trim()

     * hasSubmittedOnboarding (Retailer) = delivery_address.trim() && trade_license_number.trim()

   - 3-State Lifecycle Resolution:

     * If isVerified === true: bannerStatus = null (No banner, full features unlocked)

     * If !isVerified && hasSubmittedOnboarding: bannerStatus = 'PENDING_REVIEW' (Blue under review banner)

     * If !isVerified && !hasSubmittedOnboarding: bannerStatus = 'INCOMPLETE' (Amber setup banner)

       │

       ▼

[ 3. Initial HTML Arrives in Browser ]

   - 0ms pop-in lag: The banner is already baked into the initial HTML byte stream (CLS = 0)

   - 0 client-side useEffect network waterfalls

   - 1 single round-trip database query for the entire layout shell

```



##### Why Server Layout PostgreSQL JOIN Over Client Context?

1. **Single Round-Trip Database Operation**: Both domain onboarding credentials (address, trade license) and identity verification (`is_verified`) are resolved together in a single relational join query.

2. **Elimination of the Client Waterfall Lag**: Resolving the verification state directly on the server eliminates the 400ms–800ms banner pop-in caused by client-side hooks and multiple sequential network calls.

3. **Strict Separation of Concerns**: Feature-locking logic throughout the portal only needs to check the boolean flag `if (!isVerified)`, completely decoupled from form submission details.





## 4. File Locations, Responsibilities & Snippets



### 1. Root Layout

- **Location**: `src/app/layout.tsx`

- **What it does**: Defines global HTML, imports Google fonts (`Geist`), loads Tailwind CSS (`globals.css`), executes early theme determination via Next.js `<Script strategy="beforeInteractive">` to prevent FOUC, and establishes the application shell with `<main className="flex flex-1 flex-col">`.

- **Key Snippet**:

  ```tsx

  import Script from "next/script";



  export default function RootLayout({ children }: LayoutProps<"/">) {

    return (

      <html

        lang="en"

        suppressHydrationWarning

        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}

      >

        <body className="min-h-full flex flex-col">

          <Script

            id="theme-script"

            strategy="beforeInteractive"

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

          <main className="flex flex-1 flex-col">{children}</main>

        </body>

      </html>

    );

  }

  ```



---



### 2. Public Site Header

- **Location**: `src/components/layout/SiteHeader.tsx`

- **What it does**: Async React Server Component (RSC) public navbar containing the `DT` brand logo linking to `/`, theme toggle (`<ThemeToggle />`), and dynamic authentication actions. Checks Supabase user session via `createClient()`; if authenticated, renders a "Go to Dashboard" button pointing to the user's role-specific dashboard (`/wholesaler/dashboard` or `/retailer/dashboard`), otherwise renders the "Sign In" link and "Register" `<Button size="sm">`.

- **Key Snippet**:

  ```tsx

  export default async function SiteHeader() {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const role = user?.user_metadata?.role as "WHOLESALER" | "RETAILER" | undefined;

    const dashboardHref = role === "RETAILER" ? "/retailer/dashboard" : "/wholesaler/dashboard";



    return (

      <header className="sticky top-0 z-50 border-b border-border bg-header/80 backdrop-blur-md">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link href="/" className="flex items-center gap-3">...</Link>

          <div className="flex items-center gap-4">

            <ThemeToggle />

            {user ? (

              <Link href={dashboardHref}>

                <Button size="sm" variant="subtle">

                  <LayoutDashboard className="w-4 h-4" />

                  <span>Go to Dashboard</span>

                </Button>

              </Link>

            ) : (

              <>

                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</Link>

                <Link href="/registration"><Button size="sm">Register</Button></Link>

              </>

            )}

          </div>

        </div>

      </header>

    );

  }

  ```



---



### 3. Auth Header

- **Location**: `src/components/layout/AuthHeader.tsx`

- **What it does**: Client Component auth navbar displaying the `DT` brand badge, theme toggle (`<ThemeToggle />`), and a dynamic "Back" button that returns the user to whichever page they came from using Next.js `useRouter` (`router.back()`), with a safe fallback to `/` if no history exists in the current session.

- **Key Snippet**:

  ```tsx

  "use client";



  import { useRouter } from "next/navigation";



  export default function AuthHeader() {

    const router = useRouter();



    const handleBack = () => {

      if (typeof window !== "undefined" && window.history.length > 1) {

        router.back();

      } else {

        router.push("/");

      }

    };



    return (

      <header className="sticky top-0 z-50 border-b border-border bg-header/80 backdrop-blur-md">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link href="/" className="flex items-center gap-3">...</Link>

          <div className="flex items-center gap-4">

            <ThemeToggle />

            <button

              type="button"

              onClick={handleBack}

              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"

            >

              <ArrowLeft className="w-4 h-4" />

              <span>Back</span>

            </button>

          </div>

        </div>

      </header>

    );

  }

  ```



---



### 4. Authenticated Portal Header

- **Location**: `src/components/layout/Header.tsx`

- **What it does**: Persistent navbar for authenticated portal layouts (`/wholesaler/*`, `/retailer/*`). Renders brand logo linking to `/`, theme toggle (`<ThemeToggle />`), dynamic user greeting with registered business name or email fallback, role badge (`WHOLESALER` / `RETAILER`), and a zero-client-JS Sign Out form leveraging an inline Server Action (`"use server"`) that calls `supabase.auth.signOut()` and redirects to `/login`.

- **Key Snippet**:

  ```tsx

  import Link from "next/link";

  import { redirect } from "next/navigation";

  import { LogOut } from "lucide-react";

  import ThemeToggle from "../ui/ThemeToggle";

  import { createClient } from "@/utils/supabase/server";



  export default async function Header() {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();



    const businessName =

      (user?.user_metadata?.business_name as string) ||

      user?.email?.split("@")[0] ||

      "Partner";

    const role = user?.user_metadata?.role as "WHOLESALER" | "RETAILER" | undefined;



    async function handleSignOut() {

      "use server";

      const supabase = await createClient();

      await supabase.auth.signOut();

      redirect("/login");

    }



    return (

      <header className="sticky top-0 z-50 border-b border-border bg-header/80 backdrop-blur-md">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-header-foreground text-xs font-black text-header">DT</div>

            <span className="text-lg font-bold text-header-foreground">DeciTrade</span>

          </Link>

          <div className="flex items-center gap-4">

            <ThemeToggle />

            <div className="flex items-center gap-2 text-sm">

              <span className="font-semibold text-header-foreground">{businessName}</span>

              {role && (

                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">

                  {role}

                </span>

              )}

            </div>

            <form action={handleSignOut}>

              <button type="submit" title="Sign out" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer">

                <LogOut className="h-3.5 w-3.5" />

                <span className="hidden sm:inline">Sign Out</span>

              </button>

            </form>

          </div>

        </div>

      </header>

    );

  }

  ```



---



### 5. Onboarding Alert Banner

- **Location**: `src/components/layout/OnboardingBanner.tsx`

- **What it does**: Pinned notification banner rendered immediately below the authenticated portal header when an account is incomplete or pending review. Receives `status` prop (`"INCOMPLETE"` or `"PENDING_REVIEW"`). Renders an amber alert with a link to `/onboarding` if address or trade license is missing, or a blue informational badge if onboarding is submitted and pending admin review.

- **Key Snippet**:

  ```tsx

  export type VerificationBannerStatus = "INCOMPLETE" | "PENDING_REVIEW";



  interface OnboardingBannerProps {

    status: VerificationBannerStatus;

  }



  export default function OnboardingBanner({ status }: OnboardingBannerProps) {

    if (status === "PENDING_REVIEW") {

      return (

        <aside aria-label="Verification pending notice" className="border-b border-sky-500/20 bg-sky-500/10 px-6 py-2.5 text-xs text-sky-800 dark:text-sky-200">

          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">

            <div className="flex items-center gap-2 min-w-0">

              <Clock className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />

              <span className="truncate font-medium">Account verification pending. An admin will verify your account within 24 hours.</span>

            </div>

            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-200/60 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">Under Review</span>

          </div>

        </aside>

      );

    }



    return (

      <aside aria-label="Account setup notice" className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-2.5 text-xs text-amber-800 dark:text-amber-200">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">

          <div className="flex items-center gap-2 min-w-0">

            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

            <span className="truncate font-medium">Account setup incomplete: Add your business address to unlock full trading features.</span>

          </div>

          <Link href="/onboarding" className="inline-flex shrink-0 items-center gap-1 font-semibold underline hover:no-underline">

            <span>Complete Profile</span>

            <ArrowRight className="h-3.5 w-3.5" />

          </Link>

        </div>

      </aside>

    );

  }

  ```



---



### 6. Wholesaler Sidebar

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



### 7. Footer

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



### 8. Homepage

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



### 9. Authentication Nested Layout

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



### 10. Validation Utilities

- **Location**: `src/lib/validator.ts`

- **What it does**: Exports reusable regular expressions for client-side form validation.

- **Key Snippet**:

  ```ts

  export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

  export const PHONE_REGEX = /^\+?(?:[\s\-()]*\d){7,15}[\s\-()]*$/;

  ```



---



### 11. Login Page

- **Location**: `src/app/(auth)/login/page.tsx`

- **What it does**:

  - Sign-in form with client-side email and password validation.

  - Password visibility toggle (`Eye` / `EyeOff`) driven by local `useState`.

  - Disables default browser popups using `noValidate`.

  - Calls `supabase.auth.signInWithPassword()` and executes instant client-side forward to the user's role dashboard (`/wholesaler/dashboard` or `/retailer/dashboard`), deferring incomplete profile notifications to the non-blocking layout banner.

- **Key Snippet**:

  ```tsx

  const { data, error: signInError } = await supabase.auth.signInWithPassword({

    email,

    password,

  });

  if (signInError) {

    setError(signInError.message);

    setIsLoading(false);

    return;

  }

  const role = (data.user.user_metadata?.role as "WHOLESALER" | "RETAILER") || "WHOLESALER";

  setIsLoading(false);

  const targetDashboard = role === "WHOLESALER"

    ? "/wholesaler/dashboard"

    : "/retailer/dashboard";

  router.push(targetDashboard);

  ```



---



### 12. Registration Page

- **Location**: `src/app/(auth)/registration/page.tsx`

- **What it does**:

  - Account creation with business type selection tabs (Wholesaler vs. Retailer).

  - Validates `business_name`, `phone_number` (`PHONE_REGEX`), `email` (`EMAIL_REGEX`), and `password` (`PASSWORD_REGEX`).

  - Calls client-side `supabase.auth.signUp()` passing user metadata (`role`, `business_name`, `phone_number`), triggering the PostgreSQL `handle_new_user()` trigger for automated profile and domain entity provisioning.

  - Displays error banners on auth failure and executes instant client-side forward to the user's role dashboard, allowing immediate portal access with progressive onboarding notification.

  - **Dev Setup Requirement**: Supabase project setting must have "Confirm email" toggled **OFF** (`Authentication` &rarr; `Sign In / Providers` &rarr; `Email`) during local development so accounts are immediately active without an external SMTP server.

- **Key Snippet**:

  ```tsx

  const supabase = createClient();

  const { data, error: signUpError } = await supabase.auth.signUp({

    email,

    password,

    options: {

      data: {

        role: selectedRole,

        business_name: businessName,

        phone_number: phone,

      },

    },

  });

  if (signUpError) {

    setError(signUpError.message);

    setIsLoading(false);

    return;

  }

  setIsLoading(false);

  const targetDashboard = selectedRole === "WHOLESALER"

    ? "/wholesaler/dashboard"

    : "/retailer/dashboard";

  router.push(targetDashboard);

  ```



---



### 13. Onboarding Page (Server Component Route Guard)

- **Location**: `src/app/(auth)/onboarding/page.tsx`

- **What it does**: React Server Component route handler for `/onboarding`. Verifies user authentication and checks mandatory onboarding credentials via a single relational join query with `profiles(is_verified)` (`warehouse_address`, `trade_license_number`, and `tax_id` for Wholesalers; `delivery_address` and `trade_license_number` for Retailers). If the account is already verified or all mandatory onboarding fields are submitted, immediately redirects to the respective portal dashboard. Otherwise, renders `<OnboardingForm />`.

- **Key Snippet**:

  ```tsx

  export default async function OnboardingPage() {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");



    const role = (user.user_metadata?.role as "WHOLESALER" | "RETAILER") || "WHOLESALER";

    const tableName = role === "WHOLESALER" ? "wholesalers" : "retailers";

    const addressField = role === "WHOLESALER" ? "warehouse_address" : "delivery_address";

    const selectQuery = role === "WHOLESALER"

      ? "warehouse_address, trade_license_number, tax_id, profiles(is_verified)"

      : "delivery_address, trade_license_number, profiles(is_verified)";



    const { data: details } = await supabase

      .from(tableName)

      .select(selectQuery)

      .eq("id", user.id)

      .single();



    const record = details as Record<string, any> | null;

    const profile = Array.isArray(record?.profiles) ? record?.profiles[0] : record?.profiles;

    const isVerified = Boolean(profile?.is_verified);

    const hasAddress = Boolean(record?.[addressField]?.trim());

    const hasTradeLicense = Boolean(record?.trade_license_number?.trim());

    const hasTaxId = role === "WHOLESALER" ? Boolean(record?.tax_id?.trim()) : true;



    if (isVerified || (hasAddress && hasTradeLicense && hasTaxId)) {

      redirect(role === "WHOLESALER" ? "/wholesaler/dashboard" : "/retailer/dashboard");

    }



    return <OnboardingForm userId={user.id} initialRole={role} />;

  }

  ```



---



### 14. Colocated Onboarding Form (Client Component)

- **Location**: `src/app/(auth)/onboarding/OnboardingForm.tsx`

- **What it does**: Interactive Client Component colocated beside `page.tsx` for Step 2 of the business setup funnel. Receives `userId` and `initialRole` from the Server Component, rendering confirmed account type without redundant interactive role toggle buttons. Enforces required fields (`warehouse_address`, `trade_license_number`, and `tax_id` for Wholesalers; `delivery_address` and `trade_license_number` for Retailers with optional `tax_id`). Updates `public.wholesalers` or `public.retailers` via the browser client (`src/utils/supabase/client.ts`) without auto-verifying, navigating directly to the dashboard where the layout reflects verification state.

- **Key Snippet**:

  ```tsx

  "use client";



  export default function OnboardingForm({ userId, initialRole }: OnboardingFormProps) {

    const router = useRouter();

    const isWholesaler = initialRole === "WHOLESALER";

    const [error, setError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);



    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {

      e.preventDefault();

      // Validates address, trade license & tax_id (wholesaler mandatory, retailer optional)

      // Updates role table (wholesalers or retailers)

      const targetDashboard = isWholesaler ? "/wholesaler/dashboard" : "/retailer/dashboard";

      router.push(targetDashboard);

    }

  ```



---



### 15. Reusable StatCard Component

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



### 16. Wholesaler Portal Layout

- **Location**: `src/app/wholesaler/layout.tsx`

- **What it does**: Nested portal layout shell for all `/wholesaler/*` routes implementing the industry-standard viewport-locked app shell (`h-screen overflow-hidden`). Asynchronously executes a single PostgreSQL JOIN query on the server to retrieve `warehouse_address`, `trade_license_number`, `tax_id`, and `profiles(is_verified)`. Resolves the 3-state banner status (`null`, `"PENDING_REVIEW"`, or `"INCOMPLETE"`) with zero layout shift (CLS = 0) and zero client hydration delay.

- **Key Snippet**:

  ```tsx

  export default async function WholesalerLayout({ children }: { children: React.ReactNode }) {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();



    const { data: wholesaler } = await supabase

      .from("wholesalers")

      .select(`warehouse_address, trade_license_number, tax_id, profiles(is_verified)`)

      .eq("id", user?.id)

      .single();



    const profile = Array.isArray(wholesaler?.profiles) ? wholesaler?.profiles[0] : wholesaler?.profiles;

    const isVerified = Boolean(profile?.is_verified);

    const hasSubmittedOnboarding = Boolean(

      wholesaler?.warehouse_address?.trim() && 

      wholesaler?.trade_license_number?.trim() &&

      wholesaler?.tax_id?.trim()

    );



    const bannerStatus = isVerified ? null : hasSubmittedOnboarding ? "PENDING_REVIEW" : "INCOMPLETE";



    return (

      <div className="flex h-screen flex-col overflow-hidden">

        <Header />

        {bannerStatus && <OnboardingBanner status={bannerStatus} />}

        <div className="flex flex-1 overflow-hidden bg-neutral-50 dark:bg-black">

          <WholesalerSidebar />

          <div className="flex-1 h-full overflow-y-auto min-w-0">{children}</div>

        </div>

      </div>

    );

  }

  ```



---



### 17. Wholesaler Root Redirection Page

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



### 18. Wholesaler Dashboard Page

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



### 19. Wholesaler Orders Page

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



### 20. Wholesaler Inventory Page

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



### 21. Retailer Portal Layout

- **Location**: `src/app/retailer/layout.tsx`

- **What it does**: Nested portal layout shell for all `/retailer/*` routes. Asynchronously executes a single PostgreSQL JOIN query to retrieve `delivery_address`, `trade_license_number`, and `profiles(is_verified)`, determining whether to render `<OnboardingBanner status={bannerStatus} />` with zero layout shift.

- **Key Snippet**:

  ```tsx

  export default async function RetailerLayout({ children }: { children: React.ReactNode }) {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();



    const { data: retailer } = await supabase

      .from("retailers")

      .select(`delivery_address, trade_license_number, profiles(is_verified)`)

      .eq("id", user?.id)

      .single();



    const profile = Array.isArray(retailer?.profiles) ? retailer?.profiles[0] : retailer?.profiles;

    const isVerified = Boolean(profile?.is_verified);

    const hasSubmittedOnboarding = Boolean(retailer?.delivery_address?.trim() && retailer?.trade_license_number?.trim());



    const bannerStatus = isVerified ? null : hasSubmittedOnboarding ? "PENDING_REVIEW" : "INCOMPLETE";



    return (

      <div className="flex flex-1 flex-col">

        <Header />

        {bannerStatus && <OnboardingBanner status={bannerStatus} />}

        <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-black">

          <div className="flex-1">{children}</div>

        </div>

      </div>

    );

  }

  ```



---



### 22. Retailer Root Redirection Page

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



### 23. Retailer Dashboard Page

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



### 24. Reusable Button Component

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



### 25. Theme Toggle Component

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



### 26. Order Search Component

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



### 27. Order Date Filter Component

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

            className="pl-9 pr-8 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:scheme-dark [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"

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



---



### 28. Database DDL & RLS Blueprint

- **Location**: `supabase_schema.sql`

- **What it does**: Master PostgreSQL DDL script containing 11 ENUM types, 15 domain tables (`profiles`, `wholesalers`, `retailers`, `admins`, `invitation_tokens`, `connections`, `kyc_documents`, `kyc_revision_history`, `categories`, `products`, `orders`, `order_items`, `invoices`, `order_status_history`, `notifications`), automated user provisioning triggers on `auth.users`, and Row Level Security (RLS) policies for Supabase deployment.

- **Key Snippet**:

  ```sql

  -- Automated user provisioning trigger

  CREATE TRIGGER on_auth_user_created

      AFTER INSERT ON auth.users

      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



  -- Row Level Security: Wholesalers manage own products

  CREATE POLICY "Wholesalers have full control over own products" ON public.products

      FOR ALL TO authenticated USING (auth.uid() = wholesaler_id);



  -- Participants view orders and nested order items (for direct Next.js Server Component joins)

  CREATE POLICY "Participants view their orders" ON public.orders

      FOR SELECT TO authenticated USING (auth.uid() = wholesaler_id OR auth.uid() = retailer_id);



  CREATE POLICY "Participants view their order items" ON public.order_items

      FOR SELECT TO authenticated USING (

          EXISTS (

              SELECT 1 FROM public.orders o

              WHERE o.id = order_items.order_id

              AND (o.wholesaler_id = auth.uid() OR o.retailer_id = auth.uid())

          )

      );

  ```



---



### 29. Supabase Browser Client Helper

- **Location**: `src/utils/supabase/client.ts`

- **What it does**: Initializes the client-side Supabase client using `@supabase/ssr` `createBrowserClient`, reading `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for use inside Client Components (`"use client"`).

- **Key Snippet**:

  ```typescript

  import { createBrowserClient } from "@supabase/ssr";



  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;



  export const createClient = () =>

    createBrowserClient(

      supabaseUrl!,

      supabaseKey!,

    );

  ```



---



### 30. Supabase Server Client Helper

- **Location**: `src/utils/supabase/server.ts`

- **What it does**: Initializes the server-side Supabase client using `@supabase/ssr` `createServerClient` and Next.js 15+ asynchronous `cookies()` from `next/headers`, enabling secure reading and writing of HTTP-only session cookies in Server Components, Server Actions, and Route Handlers.

- **Key Snippet**:

  ```typescript

  import { createServerClient } from "@supabase/ssr";

  import { cookies } from "next/headers";



  export async function createClient() {

    const cookieStore = await cookies();



    return createServerClient(

      process.env.NEXT_PUBLIC_SUPABASE_URL!,

      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

      {

        cookies: {

          getAll() {

            return cookieStore.getAll();

          },

          setAll(cookiesToSet) {

            try {

              cookiesToSet.forEach(({ name, value, options }) =>

                cookieStore.set(name, value, options)

              );

            } catch {

              // Ignore when called from Server Component

            }

          },

        },

      }

    );

  }

  ```



---



### 31. Supabase Proxy Client Helper

- **Location**: `src/utils/supabase/proxy.ts`

- **What it does**: Creates a Proxy-compatible Supabase client configured with request and response cookie synchronization via `createServerClient`. Invokes `supabase.auth.getUser()` to trigger automatic token refresh when short-lived access tokens expire, writes updated session tokens to both request and response headers, redirects unauthenticated visitors attempting to access protected routes to `/login`, prevents authenticated users from viewing `/login` or `/registration` by redirecting to their role dashboard, and enforces role segregation between `WHOLESALER` and `RETAILER` portals.

- **Key Snippet**:

  ```typescript

  import { createServerClient } from "@supabase/ssr";

  import { type NextRequest, NextResponse } from "next/server";



  export async function updateSession(request: NextRequest) {

    let supabaseResponse = NextResponse.next({ request });



    const supabase = createServerClient(

      process.env.NEXT_PUBLIC_SUPABASE_URL!,

      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

      {

        cookies: {

          getAll() {

            return request.cookies.getAll();

          },

          setAll(cookiesToSet) {

            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

            supabaseResponse = NextResponse.next({ request });

            cookiesToSet.forEach(({ name, value, options }) =>

              supabaseResponse.cookies.set(name, value, options)

            );

          },

        },

      }

    );



    const { data: { user } } = await supabase.auth.getUser();



    // Helper to carry over refreshed cookies during redirects

    function redirectTo(path: string) {

      const url = request.nextUrl.clone();

      url.pathname = path;

      const redirectResponse = NextResponse.redirect(url);

      supabaseResponse.cookies.getAll().forEach((cookie) => {

        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);

      });

      return redirectResponse;

    }



    const isProtectedRoute =

      request.nextUrl.pathname.startsWith("/wholesaler") ||

      request.nextUrl.pathname.startsWith("/retailer");



    // 1. Unauthenticated redirect

    if (!user && isProtectedRoute) {

      return redirectTo("/login");

    }



    // 2. Prevent authenticated users from visiting /login & enforce role boundaries

    if (user) {

      const role = (user.user_metadata?.role as "WHOLESALER" | "RETAILER") || "WHOLESALER";

      const targetDashboard = role === "WHOLESALER"

        ? "/wholesaler/dashboard"

        : "/retailer/dashboard";



      // A. If already logged in, bounce away from /login and /registration

      const isAuthRoute =

        request.nextUrl.pathname === "/login" ||

        request.nextUrl.pathname === "/registration";



      if (isAuthRoute) {

        return redirectTo(targetDashboard);

      }

      if (role === "RETAILER" && request.nextUrl.pathname.startsWith("/wholesaler")) {

        return redirectTo("/retailer/dashboard");

      }

      if (role === "WHOLESALER" && request.nextUrl.pathname.startsWith("/retailer")) {

        return redirectTo("/wholesaler/dashboard");

      }

    }



    return supabaseResponse;

  }

  ```



---



### 32. Next.js 16 Proxy (Request Interceptor & Route Guard)

- **Location**: `src/proxy.ts`

- **What it does**: Entrypoint for Next.js 16 Proxy (the official successor to deprecated `middleware.ts`). Exports a named `proxy(request: NextRequest)` function that executes `updateSession(request)` on incoming HTTP requests. Filters static assets (`_next/static`, `_next/image`, `favicon.ico`, and image extensions) via the `matcher` config to keep page loads fast while maintaining live session tokens and guarding protected routes.

- **Key Snippet**:

  ```typescript

  import { type NextRequest } from "next/server";

  import { updateSession } from "@/utils/supabase/proxy";



  export async function proxy(request: NextRequest) {

    return await updateSession(request);

  }



  export const config = {

    matcher: [

      "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",

    ],

  };

  ```

