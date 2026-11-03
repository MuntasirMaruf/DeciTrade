# DeciTrade — Architecture & Implementation Guideline

This document tracks the architecture, component locations, responsibilities, state management concepts, and implementation details for the project, built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

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
│   │   │   │   └── page.tsx        # Route: /login (Sign In form)
│   │   │   ├── registration/
│   │   │   │   └── page.tsx        # Route: /registration (Business type selection & signup)
│   │   │   └── onboarding/
│   │   │       └── page.tsx        # Route: /onboarding (Step 2 business setup funnel)
│   │   ├── favicon.ico
│   │   ├── globals.css     # Global styles & Tailwind configuration
│   │   ├── layout.tsx      # Root layout: Header + <main> + Footer
│   │   └── page.tsx        # Homepage route: /
│   └── components/         # Reusable React components
│       └── layout/         # Persistent structural components
│           ├── Header.tsx  # Dark navbar with logo badge & auth navigation
│           └── Footer.tsx  # Global footer with dynamic year & links
├── guideline.md            # Living architecture & implementation documentation
├── package.json
└── tsconfig.json           # Path alias (@/* -> ./src/*)
```

---

## 3. Core Architectural & React Concepts

### A. What is `useState` and How Does It Work?

In standard JavaScript, changing a normal variable does **not** tell the browser to update what is on the screen:
```js
let count = 0;
count = 1; // The variable changed in memory, but the webpage doesn't re-render!
```

In React, **`useState`** is a built-in function (called a "Hook") that allows a component to:
1. **Remember data** between screen renders.
2. **Trigger a re-render** whenever that data changes so the UI reflects the new state immediately.

#### Syntax Breakdown:
```tsx
const [state, setState] = useState(initialValue);
```
- **`state`**: The current value stored in memory.
- **`setState`**: The updater function used to assign a new value. Calling this function tells React: *"The data changed, re-draw this component with the new value."*
- **`initialValue`**: The starting value when the page first loads.

#### Real Examples Used in This Project:
1. **Toggling a Boolean (Show/Hide Password)**:
   ```tsx
   const [showPassword, setShowPassword] = useState(false);

   // Toggles false -> true -> false on every click:
   <button onClick={() => setShowPassword(!showPassword)}>
     {showPassword ? <EyeOff /> : <Eye />}
   </button>
   ```
2. **Storing a Selected Tab / Role**:
   ```tsx
   type UserRole = "WHOLESALER" | "RETAILER";
   const [selectedRole, setSelectedRole] = useState<UserRole>("WHOLESALER");

   // Switches the role on tab click:
   <button onClick={() => setSelectedRole("RETAILER")}>Retailer</button>
   ```
3. **Handling Form Submission Flow**:
   ```tsx
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [isSuccess, setIsSuccess] = useState(false);
   ```

---

### B. React Server Components (RSC) vs. Client Components
- By default in the Next.js App Router, all components are **Server Components**. They execute on the server and send static HTML to the browser with zero client JavaScript bundle overhead.
- Because `useState` and event listeners (`onClick`, `onSubmit`) must run inside the user's browser, any file using them must place the directive **`"use client";`** at line 1.

---

### C. Route Groups `(auth)` & Nested Layouts
- Folders enclosed in parentheses, like `(auth)`, are **ignored in the route URL**.
  - `src/app/(auth)/login/page.tsx` is reached at `/login` (not `/auth/login`).
- Layouts nest hierarchically:
  $$\text{RootLayout (Header + <main> + Footer)} \longrightarrow \text{AuthLayout (Centered Card)} \longrightarrow \text{Page}$$

---

### D. Single `<main>` Landmark & The Sticky Footer
- HTML accessibility standards allow only **one visible `<main>` landmark** per document.
- In `src/app/layout.tsx`, `<main className="flex flex-1 flex-col">` wraps `{children}` between `<Header />` and `<Footer />`.
  - `flex-1` expands `<main>` to push the footer to the bottom of the viewport even if the page content is short.
  - `flex flex-col` establishes a flex container so child layouts (`(auth)/layout.tsx`) can center their cards vertically using `items-center`.

---

### E. Declarative Navigation with `next/link`
- Standard HTML `<a>` tags cause the entire browser window to refresh.
- Next.js's `<Link href="...">` performs **client-side soft navigation**: it swaps only the page content without refreshing the browser or re-downloading stylesheets.

---

### F. React 19 Form Submission (`SubmitEvent`)
- React 19 deprecated `FormEvent` to strictly follow native browser DOM standards.
- Form submissions use `React.SubmitEvent<HTMLFormElement>`. Specifying `<HTMLFormElement>` ensures `e.currentTarget` is fully typed for extracting values with `new FormData(e.currentTarget)`.

---

## 4. How Each Page Works (Component Walkthrough)

### 1. Root Layout
- **Location**: `src/app/layout.tsx`
- **What it does**: Defines global HTML, imports Google fonts (`Geist`), loads Tailwind CSS (`globals.css`), and surrounds all pages with the persistent Header and Footer.
- **Key Code**:
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

---

### 3. Footer
- **Location**: `src/components/layout/Footer.tsx`
- **What it does**: Global footer pinned to the bottom of the viewport displaying the copyright year using `{new Date().getFullYear()}` and policy links.

---

### 4. Homepage
- **Location**: `src/app/page.tsx`
- **What it does**: The landing page hero section with product headlines and call-to-action buttons.

---

### 5. Authentication Nested Layout
- **Location**: `src/app/(auth)/layout.tsx`
- **What it does**: A layout wrapper dedicated to authentication screens. It stretches to fill the vertical space of `<main>` and centers the white/dark card horizontally and vertically.
- **Key Code**:
  ```tsx
  <div className="flex flex-1 items-center justify-center px-4 py-12">
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  </div>
  ```

---

### 6. Login Page
- **Location**: `src/app/(auth)/login/page.tsx`
- **How it works step-by-step**:
  1. **Password Visibility Toggle**: The password `<input>` has dynamic type `type={showPassword ? "text" : "password"}`. Clicking the eye button flips `showPassword` using `setShowPassword(!showPassword)`.
  2. **Form Submission**:
     - `e.preventDefault()` stops the browser from doing a full-page reload.
     - `setIsLoading(true)` disables the button and renders a spinning `<Loader2 />` icon.
     - `new FormData(e.currentTarget)` extracts the entered password.
     - If the password is shorter than 6 characters, `setError(...)` displays the red `<AlertCircle>` banner.
     - If valid, `setIsSuccess(true)` displays a green success confirmation with a link to the homepage.

---

### 7. Registration Page
- **Location**: `src/app/(auth)/registration/page.tsx`
- **How it works step-by-step**:
  1. **Business Type Tabs**:
     - `selectedRole` stores either `"WHOLESALER"` or `"RETAILER"`.
     - Clicking a tab calls `setSelectedRole("WHOLESALER")` or `setSelectedRole("RETAILER")`.
     - The active tab receives a highlighted border and ring (`ring-1 ring-neutral-900`).
     - The "Business Name" input placeholder dynamically updates: Wholesaler shows `"e.g. Acme Wholesale Ltd"`, while Retailer shows `"e.g. Metro Supermarket"`.
  2. **Hidden Input**:
     - `<input type="hidden" name="role" value={selectedRole} />` automatically includes the active tab in the form data.
  3. **Submission & Next Step Transition**:
     - `handleSubmit` validates password length.
     - On success, `setIsSuccess(true)` reveals an account creation banner with a `<Link href="/onboarding">` taking the user to Step 2 (Business Setup).

---

### 8. Onboarding Page (2-Step Funnel)
- **Location**: `src/app/(auth)/onboarding/page.tsx`
- **How it works step-by-step**:
  1. **Visual Funnel Progress**: Displays the 2-step stepper (`✓ 1. Account Created` &rarr; `2. Business Setup`).
  2. **Confirmation Banner**: Displays an account confirmation box reassuring the user that their login credentials from Step 1 are saved.
  3. **Conditional Role Fields**:
     - Uses `{isWholesaler ? (...) : (...)}` to render role-specific inputs:
       - **Wholesaler**: Warehouse / Dispatch Address textarea, Business Description & Categories input, Trade License ID input.
       - **Retailer**: Store Delivery Address textarea, Store Category dropdown, Trade License ID input.
  4. **Finish Later Option**: Includes a declarative link `<Link href="/login">` allowing users to pause setup without losing their credentials.
