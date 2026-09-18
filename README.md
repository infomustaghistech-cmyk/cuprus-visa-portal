# Cyprus Visa Portal — demo project

A front-end visa application portal built with **React 18, Vite and Tailwind CSS 3**.

> **This is a practice/portfolio project.** It is not affiliated with the Republic of Cyprus or any
> government body, it issues no real visas, and it has no backend — every application, status and
> contact detail in it is mock data generated in the browser. For a real Cyprus visa, use the Republic
> of Cyprus Ministry of Interior or your nearest Cypriot embassy.

## Run it

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Build for production

```bash
npm run build     # output goes to dist/
npm run preview   # serve the built files locally
```

Deploys as a static site on Vercel, Netlify, GitHub Pages or Cloudflare Pages.
Build command `npm run build`, output directory `dist`.

## What's in it

| Page | What it does |
|---|---|
| Home | Hero, animated statistics, visa types with document lists, 3-step process, destinations, about, status check, FAQ, contact, CTA |
| Apply for a visa | 3-step form with per-step validation, review screen, mock reference number on submit |
| Check status | Validated lookup returning Processing / Approved / Rejected with colour-coded badges |
| Contact | Info cards, validated message form, safety notice |

Sample references for the status page: **CY-10001**, **CY-10002**, **CY-10003** — each returns a
different status. The lookup is deterministic, so the same reference always gives the same result.

## Structure

```
src/
├── components/   Header, Hero, Statistics, VisaTypes, ApplicationProcess,
│                 DiscoverCyprus, About, CheckStatus, FAQ, Contact, CTA,
│                 Footer, Modal, SignIn, StatusBadge, PageHeader, Reveal, Logo
├── pages/        Home, ApplyVisa, CheckStatusPage, ContactPage
├── data/         content.js — all copy, visa types, FAQs, stats in one place
├── hooks/        useReveal (scroll reveal), useCountUp (animated counters)
├── App.jsx       hash-based router + sign-in modal state
└── index.css     Tailwind layers and component classes
```

Routing uses the URL hash (`#apply`, `#status`, `#contact`) instead of a router library, so there
are only three runtime dependencies: react, react-dom and lucide-react.

## Design notes

- Palette: orange `#FF9500`, dark blue `#1F2937`, teal `#0EA5E9`, light grey `#F9FAFB`, green `#10B981`, red `#EF4444` — all defined in `tailwind.config.js` as `brand`, `ink`, `sea`, `canvas`, `ok`, `warn`.
- Type: Poppins for headings, Inter for body, loaded from Google Fonts with a system fallback stack.
- Imagery is drawn as inline SVG and CSS gradients rather than photographs, so the app loads instantly and works offline with no image licensing to worry about.
- Accessibility: semantic landmarks, skip link, visible focus rings, `aria-expanded` / `aria-live` on interactive areas, `prefers-reduced-motion` respected.

## Editing the content

Almost all copy lives in `src/data/content.js` — visa types, FAQs, statistics, destinations, nav and
contact details. Change it there and every page updates.
