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
│   │   │   ├── layout.tsx  # Nested layout: centered card container for auth screens
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
│   │   ├── layout.tsx      # Root layout: Header + <main> + Footer
│   │   └── page.tsx        # Homepage route: /
│   ├── components/         # Reusable React components
│   │   └── layout/         # Persistent structural components
│   │       ├── Header.tsx  # Dark navbar with logo badge & auth navigation
│   │       └── Footer.tsx  # Global footer with dynamic year & links
│   └── lib/                # Shared utilities & validators
│       └── validator.ts    # Centralized regex patterns (Email, Password, Phone)
├── guideline.md            # Living architecture & implementation documentation
├── package.json
└── tsconfig.json           # Path alias (@/* -> ./src/*)
```

---

## 3. Core Architectural & React Concepts

### A. What is `useState` and How Does It Work?

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

#### Real Examples Used in This Project:
1. **Toggling a Boolean (Show/Hide Password)**:
   ```tsx
   const [showPassword, setShowPassword] = useState(false);

   // Toggles false -> true -> false on each click:
   <button onClick={() => setShowPassword(!showPassword)}>
     {showPassword ? <EyeOff /> : <Eye />}
   </button>
   ```
2. **Tab Selection (Wholesaler vs. Retailer)**:
   ```tsx
   type UserRole = "WHOLESALER" | "RETAILER";
   const [selectedRole, setSelectedRole] = useState<UserRole>("WHOLESALER");

   <button onClick={() => setSelectedRole("RETAILER")}>Retailer</button>
   ```
3. **Form Feedback State**:
   ```tsx
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [isSuccess, setIsSuccess] = useState(false);
   ```

---

### B. Client-Side Form Validation Pattern

Instead of relying on heavy third-party libraries, forms implement client-side validation using standard JavaScript and Regular Expressions (Regex).

#### 1. Why `noValidate` on the `<form>`?
Adding `noValidate` to `<form onSubmit={handleSubmit} noValidate>` disables the browser's default HTML tooltip validation popups. This ensures:
- Consistent cross-browser error styling.
- Full control over error display via custom React `<AlertCircle>` alerts.

#### 2. Centralized Regex Helpers (`src/lib/validator.ts`)
- **`EMAIL_REGEX`**: Enforces valid email structure (`user@domain.tld`).
- **`PASSWORD_REGEX`**: Requires strong security (minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character).
- **`PHONE_REGEX`**: Validates telephone formats (allowing an optional `+` prefix, parenthesis, spaces, and dashes with 7–15 digits).

#### 3. Sequential Validation in `handleSubmit`
The submission handler inspects each field sequentially and stops at the first invalid entry, setting the error message and aborting before triggering `isLoading`:
```tsx
const businessName = (formData.get("business_name") as string).trim();
const email = (formData.get("email") as string).trim();

if (!businessName) {
  setError("Business name is required.");
  return;
}
if (!EMAIL_REGEX.test(email)) {
  setError("Please enter a valid email address.");
  return;
}
```

---

### C. Declarative Navigation with `next/link`
- All navigation across pages is handled declaratively with `<Link href="...">` tags.
- `<Link>` executes client-side soft transitions with prefetching and zero browser reloads.

---

### D. React Server Components (RSC) vs. Client Components
- By default in the App Router, components are **Server Components**. They run on the server and send static HTML to the browser with zero client JavaScript bundle overhead.
- Screens that merely display data without event listeners (like `wholesaler/dashboard/page.tsx`) remain Server Components.
- Interactive screens requiring browser state (`useState`) or event listeners (`onSubmit`, `onClick`) specify `"use client";` at line 1.

---

### E. Route Groups `(auth)` & Nested Layouts
- Folders enclosed in parentheses, like `(auth)`, are **omitted from the URL**:
  - `src/app/(auth)/login/page.tsx` &rarr; accessible at `/login`.
  - `src/app/(auth)/registration/page.tsx` &rarr; accessible at `/registration`.
  - `src/app/(auth)/onboarding/page.tsx` &rarr; accessible at `/onboarding`.
- Layouts nest hierarchically:
  $$\text{RootLayout (Header + <main> + Footer)} \longrightarrow \text{AuthLayout (Centered Card)} \longrightarrow \text{Page}$$

---

### F. Single `<main>` Landmark & Sticky Footer
- HTML accessibility standards allow only **one visible `<main>` landmark** per document.
- In `src/app/layout.tsx`, `<main className="flex flex-1 flex-col">` wraps `{children}` between `<Header />` and `<Footer />`.
  - `flex-1` expands `<main>` to keep the footer pinned to the bottom of the viewport.
  - `flex flex-col` provides a flex container so child layouts (`(auth)/layout.tsx`) can center cards vertically using `items-center`.

---

### G. React 19 Form Submission (`SubmitEvent`)
- React 19 deprecated `FormEvent` in favor of standard DOM event types.
- Form submissions use `React.SubmitEvent<HTMLFormElement>`. Specifying `<HTMLFormElement>` ensures `e.currentTarget` is fully typed for extracting values with `new FormData(e.currentTarget)`.

---

## 4. File Locations, Responsibilities & Snippets

### 1. Root Layout
- **Location**: `src/app/layout.tsx`
- **What it does**: Defines global HTML, imports Google fonts (`Geist`), loads Tailwind CSS (`globals.css`), and surrounds all pages with the persistent Header and Footer.
- **Key Snippet**:
  ```tsx
  <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
    <Header />
    <main className="flex flex-1 flex-col">{children}</main>
    <Footer />
  </body>
  ```

---

### 2. Header
- **Location**: `src/components/layout/Header.tsx`
- **What it does**: Persistent dark top bar containing the `DT` brand logo linking to `/`, a "Sign In" link to `/login`, and a "Register" button to `/registration`.
- **Key Snippet**:
  ```tsx
  <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black text-black">
          DT
        </div>
        <span className="text-lg font-bold text-white">DeciTrade</span>
      </Link>
      <div className="flex items-center gap-5">
        <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white">
          Sign In
        </Link>
        <Link href="/registration" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200">
          Register
        </Link>
      </div>
    </div>
  </header>
  ```

---

### 3. Footer
- **Location**: `src/components/layout/Footer.tsx`
- **What it does**: Global footer pinned to the bottom of the viewport displaying the dynamic copyright year and policy links.
- **Key Snippet**:
  ```tsx
  <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
    <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
      <p>© {new Date().getFullYear()} DeciTrade. All rights reserved.</p>
    </div>
  </footer>
  ```

---

### 4. Homepage
- **Location**: `src/app/page.tsx`
- **What it does**: The landing page hero section with platform headlines and call-to-action buttons.
- **Key Snippet**:
  ```tsx
  <section className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
      Algorithmic Decisions for Smarter Trading
    </h1>
  </section>
  ```

---

### 5. Authentication Nested Layout
- **Location**: `src/app/(auth)/layout.tsx`
- **What it does**: A layout wrapper dedicated to authentication screens. It stretches to fill the vertical space of `<main>` and centers form cards horizontally and vertically.
- **Key Snippet**:
  ```tsx
  <div className="flex flex-1 items-center justify-center px-4 py-12">
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  </div>
  ```

---

### 6. Validation Utilities
- **Location**: `src/lib/validator.ts`
- **What it does**: Exports reusable regular expressions for client-side form validation.
- **Key Snippet**:
  ```ts
  export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  export const PHONE_REGEX = /^\+?(?:[\s\-()]*\d){7,15}[\s\-()]*$/;
  ```

---

### 7. Login Page
- **Location**: `src/app/(auth)/login/page.tsx`
- **What it does**:
  - Sign-in form with client-side email and password validation.
  - Password visibility toggle (`Eye` / `EyeOff`) driven by local `useState`.
  - Disables default browser popups using `noValidate`.
- **Key Snippet**:
  ```tsx
  <form onSubmit={handleSubmit} noValidate className="space-y-4">
    <input id="email" name="email" type="email" required />
    <input id="password" name="password" type={showPassword ? "text" : "password"} required />
    <button type="button" onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <EyeOff /> : <Eye />}
    </button>
  </form>
  ```

---

### 8. Registration Page
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

### 9. Onboarding Page (2-Step Funnel)
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

### 10. Wholesaler Dashboard Page
- **Location**: `src/app/wholesaler/dashboard/page.tsx`
- **What it does**: A React Server Component portal for wholesalers displaying business performance metrics (Total Orders, Active Retailers, Gross Revenue) and warehouse dispatch status.
- **Key Snippet**:
  ```tsx
  export default function WholesalerDashboardPage() {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Business Dashboard</h1>
        {/* Metric cards grid */}
      </div>
    );
  }
  ```
