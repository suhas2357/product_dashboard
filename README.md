# Product Admin Dashboard

A small admin dashboard built with **React + Vite + Tailwind CSS + Axios** using the free [DummyJSON API](https://dummyjson.com). Users can log in, browse, search, filter, sort, and manage products.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Login Credentials](#login-credentials)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Key Design Decisions](#key-design-decisions)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility](#accessibility)
- [Error Handling](#error-handling)
- [Testing the App](#testing-the-app)
- [Known Limitations](#known-limitations)
- [Problem I Faced & How I Fixed It](#problem-i-faced--how-i-fixed-it)
- [Where AI Helped](#where-ai-helped)
- [What I Would Add With More Time](#what-i-would-add-with-more-time)

---

## Features

### Authentication
- Login with a username and password via `POST /auth/login`.
- Displays validation errors for empty fields and API errors for wrong credentials.
- Only logged-in users can access product pages (`ProtectedRoute`).
- Token stored in `localStorage` and attached to every request via an Axios request interceptor.
- Global 401 handling — expired or invalid tokens log the user out automatically.
- Logout button in the navbar clears state and redirects to `/login`.
- Ref-based double-click guard on both login and logout.

### Product List
- Table view on desktop, card view on mobile (responsive breakpoint at `md`).
- Displays image, title, brand, category, price, rating, and stock.
- Stock badge color-coded: green (>10), yellow (1–10), red (0).

### Pagination
- Page-by-page loading using `limit` and `skip` query params.
- Numbered page buttons with ellipsis for large page counts.
- First / Previous / Next / Last navigation.
- Page size selector: 10, 20, 50 per page.
- "Showing X–Y of Z results" summary text.
- Active page highlighted with a blue background.

### Search
- Uses `GET /products/search?q=...`.
- Debounced by 500 ms — waits until the user stops typing.
- Resets to page 1 when the search term changes.
- Stale-response protection using `AbortController` and a request ID ref.

### Filter & Sort
- Category filter via `GET /products/categories`.
- Sort by price, rating, or title (ascending and descending).
- Client-side sorting since DummyJSON doesn't support a sort parameter on the products endpoint.

### Product Details
- Route: `/products/:id`.
- Image gallery with thumbnails.
- Title, brand, category, price, rating, stock, description.
- Customer reviews with star rating and date.
- "Product not found" state for invalid or missing IDs (both numeric and non-numeric).

### Add / Edit / Delete
- Add form at `/products/new`.
- Edit form at `/products/:id/edit`.
- Client-side validation with per-field error messages.
- Delete confirmation modal with a non-blocking overlay.

### Loading, Empty, and Error States
- Skeleton UI shown while products load (also improves LCP).
- Empty state shown when there are no results.
- Error state with a Retry button.

### URL-Synced State
The following are stored in the URL query string and survive refreshes and sharing:
- `page`
- `pageSize`
- `q` (search)
- `category`
- `sort`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| HTTP | Axios 1 |
| Icons | Inline SVG |
| State | React Context + hooks |

No React Query, SWR, or ready-made table/pagination libraries — all logic is hand-written.

---

## Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
git clone <your-repo-url>
cd product-admin-dashboard
npm install
```

### Run in development

```bash
npm run dev
```

Open http://localhost:3000.

### Build for production

```bash
npm run build
npm run preview
```

Run `preview` (not `dev`) when measuring performance — Vite's dev server serves unbundled modules and is not representative of production.

### Lint

```bash
npm run lint
```

---

## Environment Variables

Create a `.env` file at the project root:

```env
VITE_API_BASE_URL=https://dummyjson.com
```

The variable is read in `src/services/api/axiosInstance.js`. A fallback to `https://dummyjson.com` is provided, so the app works even without the `.env` file.

---

## Login Credentials

The DummyJSON API only accepts its own preset users. Use:

| Field | Value |
|-------|-------|
| Username | `emilys` |
| Password | `emilyspass` |

Other valid DummyJSON users (for testing the error path vs success path) are listed at https://dummyjson.com/users. Any other username/password combination returns `{ "message": "Invalid credentials" }`, which the app displays in the login error banner.

> Note: The field is **username**, not email. `emilys@gmail.com` will fail — use exactly `emilys`.

---

## Project Structure

```
product-admin-dashboard/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── ProtectedRoutes.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── products/
│   │   │   ├── ProductTable.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductRow.jsx
│   │   │   ├── ProductFilters.jsx
│   │   │   ├── ProductSearch.jsx
│   │   │   ├── ProductPagination.jsx
│   │   │   ├── ProductSkeleton.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── ProductReviews.jsx
│   │   └── auth/
│   │       └── LoginForm.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── AddProduct.jsx
│   │   ├── EditProduct.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── axiosInstance.js
│   │   │   └── apiErrorHandler.js
│   │   ├── authService.js
│   │   └── productService.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   └── useProducts.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── pagination.js
│   │   ├── validators.js
│   │   └── storage.js
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

### Folder Responsibilities

| Folder | Purpose |
|--------|---------|
| `components/common` | Reusable UI primitives — buttons, loaders, modals |
| `components/layout` | Shell components — navbar, sidebar, dashboard layout |
| `components/products` | Product-specific UI — table, card, form, filters |
| `components/auth` | Login form |
| `pages` | Route-level components, one per route |
| `services` | All API calls and the shared Axios instance |
| `context` | Global auth state |
| `hooks` | Reusable custom hooks |
| `utils` | Pure helpers — validation, pagination math, storage |
| `routes` | Route definitions with lazy loading |

---

## Architecture Overview

### Data Flow

1. **User action** → handler in a page component (e.g., `Products.jsx`).
2. **Handler updates URL** via `setSearchParams` (functional update).
3. **URL change** → React Router re-renders the page with new query params.
4. **Params extracted** into primitives (`page`, `pageSize`, `q`, `category`, `sort`).
5. **Hook `useProducts`** reads params, calls the appropriate service function.
6. **Service function** calls `axiosInstance` with interceptors applied.
7. **Response** flows back → hook sets state → page re-renders with data.

### Auth Flow

1. `LoginForm` submits credentials to `AuthContext.login()`.
2. `login()` calls `authService.loginUser()` → `POST /auth/login`.
3. Response contains `accessToken`. `login()` stores it via `storage.setToken()` and updates React state.
4. The Axios request interceptor reads `getToken()` on every request and injects `Authorization: Bearer <token>`.
5. `ProtectedRoute` reads `isAuthenticated` from `useAuth()` and either renders children or redirects to `/login`.
6. On logout, `clearAuth()` wipes localStorage and `ProtectedRoute` redirects.
7. If any request returns 401, the response interceptor clears auth and redirects to `/login`.

### Service Layer

- `axiosInstance.js` — one Axios instance for the whole app. Base URL, timeout, JSON headers, request interceptor (token), response interceptor (401 handling).
- `apiErrorHandler.js` — normalizes any error into a user-friendly message string.
- `authService.js` — login and current-user endpoints.
- `productService.js` — all product endpoints plus a small TTL cache.

No API call is made directly from a React component.

---

## Key Design Decisions

### 1. Search overrides category filter

DummyJSON's `/products/search` endpoint does not support filtering by category, and `/products/category/:slug` does not support a search query. When the user types a search term while a category filter is active, the app **clears the category filter** and shows a note explaining the API limitation.

**Reason:** Search is the more direct, more recent user intent. Silently ignoring one of the filters would confuse the user.

### 2. Add / Edit / Delete are local-only

DummyJSON's write endpoints return a response but do not persist changes. The app calls the real endpoints (matching what a real backend would require) and then reflects the change locally:

- **Add** → navigate to `/products` with a toast. The new product isn't shown in the list because the API didn't save it.
- **Edit** → navigate to `/products/:id` and pass the merged product via React Router's `location.state`. The details page prefers this over a fresh fetch, so the user sees their changes immediately. On refresh, the state is lost and the API returns the original data.
- **Delete** → track deleted IDs in a `Set` and filter them out of the current list. Refresh restores them.

**Reason:** Demonstrates the correct API interaction pattern while being honest about the API's limitations. In a real backend, the same code would work — the follow-up would simply be a refetch or optimistic update.

### 3. URL as single source of truth

Pagination, page size, search, filter, and sort all live in the URL query string. Nothing is duplicated in component state.

**Reason:** Refresh, back/forward, and link sharing work automatically. It also makes the app testable by simply navigating to a URL.

### 4. Custom hooks for data fetching

`useProducts` encapsulates fetching, loading, error, retry, cancellation, and stale-response protection. Pages stay focused on rendering.

**Reason:** Keeps components small, makes logic reusable, and gives a single place to reason about race conditions.

### 5. Context for auth only

Auth is the only truly global state. Everything else is page-local and lives in the page component or a hook.

**Reason:** Avoids the overhead and boilerplate of Redux or Zustand for a small app.

### 6. No React Query / SWR

The assignment forbids them. Instead, caching, cancellation, retries, and stale protection are implemented manually in `useProducts` and `productService.js`.

**Reason:** Demonstrates understanding of what those libraries do under the hood.

---

## Performance Optimizations

### Rendering
- `React.memo` on presentational components: `Button`, `Loader`, `ErrorMessage`, `EmptyState`, `ConfirmModal`, `Navbar`, `Sidebar`, `ProductTable`, `ProductRow`, `ProductCard`, `ProductSearch`, `ProductFilters`, `ProductPagination`, `ProductReviews`, `ProductSkeleton`, `DashboardCard`.
- `useCallback` on every handler passed to a memoized child.
- `useMemo` for derived arrays and objects (`visibleProducts`, `deletedSet`, `categoryOptions`, `images`, `paginationMeta`, `pages`, `greeting`).
- Static strings, class maps, and config arrays hoisted to module scope (`BASE_CLASS`, `VARIANT_CLASS`, `COLUMNS`, `LINKS`, `CARDS`, `EMPTY_PRODUCT`, `EMPTY_REVIEWS`).
- Functional `setSearchParams((prev) => ...)` so handlers don't depend on the URL object identity.
- `Set` instead of array for deleted ID lookups (O(1) vs O(n)).

### Network
- Debounced search (500 ms).
- `AbortController` cancels in-flight requests when dependencies change.
- Request ID ref ensures stale responses are discarded.
- 60-second TTL cache in `productService.js` for products, categories, and product details. Cache is cleared on any mutation.

### Bundle
- Route-level code splitting with `React.lazy` and `<Suspense>`.
- `ConfirmModal` lazy-loaded in `Products.jsx` — only downloaded when a delete is requested.
- `<Suspense>` inside `DashboardLayout` so navigating between pages doesn't unmount the navbar and sidebar.

### LCP (Largest Contentful Paint)
- Skeleton UI (`ProductSkeleton`) renders on the first paint — LCP is captured against the skeleton instead of waiting for the API.
- `<link rel="preconnect">` and `<link rel="dns-prefetch">` for `dummyjson.com` in `index.html`.
- `width` and `height` on product images to prevent layout shift (CLS).
- `loading="lazy"` and `decoding="async"` on non-critical images.
- `fetchPriority="high"` on the first product image.
- Route-level code splitting reduces the initial JS payload.

### CSS
- `transition-shadow` and `transition-colors` instead of the blanket `transition` (animates fewer properties).
- Standard Tailwind colors (`blue-*`) used instead of custom palette entries to guarantee compilation.

---

## Accessibility

- `<label htmlFor>` + `id` pairing on every form input.
- `aria-label` on icon-only buttons (hamburger, close, edit, delete, pagination).
- `aria-label="Page N"` on numbered pagination buttons.
- `aria-current="page"` on the active pagination button.
- `role="alert"` on error messages (assertive announcement).
- `role="status"` + `aria-live="polite"` on success toasts and loaders.
- `aria-hidden="true"` on decorative icons and emoji.
- `<nav aria-label="...">` for breadcrumbs and pagination.
- `scope="col"` on table headers.
- Visible focus rings on interactive elements.
- `type="search"` on the search input (mobile keyboard + native clear button).
- Semantic `<main>`, `<nav>`, `<header>`, `<aside>` elements.

---

## Error Handling

| Situation | Behavior |
|-----------|----------|
| Wrong login credentials | "Invalid credentials" shown in a red banner with `role="alert"` |
| Network failure | "Network error. Please check your connection." with Retry button |
| Request timeout | "Request timed out. Please try again." |
| 401 Unauthorized | Auth cleared, redirect to `/login` (from response interceptor) |
| 404 on product details | Dedicated "Product not found" screen |
| Non-numeric or negative product ID | Treated as not found without a network call |
| Out-of-range page in URL | Handled gracefully — API returns empty, EmptyState shown |
| Form validation errors | Per-field messages below each input |
| Any other API error | Normalized message from `apiErrorHandler.getErrorMessage()` |

---

## Testing the App

### Login
1. Go to `/login`.
2. Try `sahil@gmail.com` with any password → red "Invalid credentials" banner.
3. Try `emilys` / `emilyspass` → redirects to `/dashboard`.
4. Verify `auth_token` and `auth_user` are present in DevTools → Application → Local Storage.
5. Click Logout → keys are removed, redirected to `/login`.

### Search
1. Go to `/products`.
2. Type `phone` slowly — one API call fires after you stop typing.
3. Type quickly — only the last keystroke triggers a request.
4. Verify the URL shows `?q=phone&page=1`.
5. Add `&delay=2000` to the API call in `productService.js` temporarily. Type two different terms quickly. The first result must never replace the second.

### Pagination
1. Change the page size to 20 — URL updates to `?pageSize=20&page=1`.
2. Click page 3 — URL updates to `page=3`.
3. Refresh — you're still on page 3.
4. Share the URL — anyone opening it sees the same result.

### Filter and Sort
1. Choose a category — search is cleared, URL updates.
2. Apply a sort — URL updates with `sort=price-asc`.
3. Verify the "Search overrides category filter" note appears if both `q` and `category` are set.

### Product Details
1. Click any product — details page loads.
2. Try `/products/abc` — "Product not found".
3. Try `/products/99999` — "Product not found".

### Add / Edit / Delete
1. Click "Add Product" — form loads with an empty state.
2. Submit empty — per-field validation errors.
3. Fill valid data → click Add Product many times quickly → only one request fires.
4. Edit a product → change the title → Save Changes → redirected to the details page, title shows the new value.
5. Delete a product → confirm modal appears → confirm → row disappears.

### URL Robustness
1. `/?page=abc` — falls back to page 1.
2. `/?page=999` — empty state, no crash.
3. `/?pageSize=999` — falls back to 10.
4. `/?sort=garbage` — sorted as-is (no crash).

### Production build
1. Run `npm run build && npm run preview`.
2. Open DevTools → Lighthouse → Mobile + Slow 4G.
3. Confirm LCP is under ~3 seconds.

---

## Known Limitations

1. **Write operations are not persisted.** DummyJSON returns a response but doesn't save data. Explained in the Design Decisions section.
2. **Search and category cannot be combined.** DummyJSON limitation. Search takes priority.
3. **No token refresh.** The API returns a `refreshToken`, but the app doesn't implement an automatic refresh flow. 401s simply log the user out.
4. **Categories are fetched on every mount** of `Products`, `AddProduct`, or `EditProduct` — the TTL cache makes this instant after the first call.
5. **Client-side sorting only.** The sort applies to the currently loaded page, not the whole dataset.
6. **No offline support.** Requires a network connection.
7. **No tests.** Given the two-day scope, testing was manual. Adding unit tests for `validators`, `pagination`, and `storage` would be the next step.

---

## Problem I Faced & How I Fixed It

### The Bug: Login succeeded but the app bounced back to `/login`

**Symptoms:**
- `POST /auth/login` returned `200 OK`.
- Console showed `login user===> { accessToken: '...', ... }`.
- But `is authenticated === false` logged from `ProtectedRoute`.
- localStorage showed `auth_token = "undefined"` (the literal string).

**Root cause:**
The DummyJSON response field is `accessToken`. My `AuthContext.login()` was reading `data.token` — which is `undefined`. Calling `setToken(undefined)` stored the string `"undefined"` in localStorage (localStorage coerces values to strings). `Boolean("undefined")` is `true`, so `isAuthenticated` looked OK in the same session, but on refresh the token was garbage and the Axios interceptor sent `Authorization: Bearer undefined`.

**Fix:**
1. Changed `data.token` to `data.accessToken` in both `setToken` and `setTokenState`.
2. Added a guard that throws if the response doesn't contain an `accessToken` string.
3. Hardened `setToken` to remove the key instead of storing `"undefined"` if the value isn't a non-empty string.
4. Cleared localStorage once to remove the bad value from earlier sessions.

**Lesson:** Always verify the actual field names in an API response — don't assume. And use the returned data as proof of success rather than checking React state that may not have flushed.

### The Second Bug: Stale search results

**Symptom:**
When typing quickly with `&delay=2000` appended to the search URL, an older, slower response would resolve after a newer one and overwrite the correct results.

**Fix:**
Three layers of protection:
1. **`useDebounce`** — only one request per quiet period.
2. **`AbortController`** — cancels the previous in-flight request when a new one starts.
3. **Request ID ref** — increments on every request; only the latest ID's response is applied. Even if an old request somehow resolves (e.g., before abort takes effect), it's discarded.

### The Third Bug: Form reset on parent re-render

**Symptom:**
In `ProductForm`, the effect that synced `initialValues` into form state reset the form whenever the parent passed a new object — even for the same product. Mid-edit, the user's typing was wiped.

**Fix:**
Track the last applied `initialValues` in a `useRef` and only reset when the product `id` actually changes. This preserves user input across parent re-renders that pass an equivalent product object.

---

## Where AI Helped

AI (Claude) was used as a coding assistant for:

- **Scaffolding** — generating the initial folder and file structure, and boilerplate for the Axios instance, storage utilities, and pagination math.
- **Explaining concepts** — clarifying the difference between `useMemo`, `useCallback`, and `React.memo`, and when each is appropriate.
- **Debugging** — helping trace the `accessToken` vs `token` field mismatch, the stale-search race condition, and the `React.memo` ineffectiveness on `ProtectedRoute`.
- **Best-practice suggestions** — recommending `AbortController` for request cancellation, ref-based double-submit guards, and skeleton UI for LCP.
- **Interview preparation** — organizing the codebase and reasoning into a Q&A format.

Every line of code was read, tested, and understood. In the next-round live walkthrough, I can explain any file and make changes on the spot. AI was used as a pair-programmer, not as a black box.

---

## What I Would Add With More Time

1. **Token refresh flow** — intercept 401s, call `/auth/refresh`, dedupe concurrent refreshes, and retry the original request.
2. **Unit tests** — Jest or Vitest for `validators`, `pagination`, `storage`, and `useProducts`. React Testing Library for the login form and product list.
3. **Optimistic updates** — update local state immediately on add/edit/delete, then reconcile with the server.
4. **Toast system** — a single reusable toast provider instead of inline banners.
5. **Skeleton for the details page** — currently uses a spinner; a skeleton would keep LCP low on that route too.
6. **Search highlighting** — highlight the matched substring in product titles.
7. **Infinite scroll** — as an alternative to pagination for the mobile card view.
8. **Persistent filter state** — remember the user's last filter/sort choices across sessions.
9. **Error boundary** — catch render errors in a route and show a fallback UI.
10. **i18n** — extract all strings for future localization.

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## License

This project is for evaluation purposes. The DummyJSON API is provided by dummyjson.com and is free to use.