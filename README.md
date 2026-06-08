# KONSTANT UPRISE — Shopify Theme

A fully custom, production-ready Shopify theme for **Konstant Uprise** — a premium
independent digital music brand selling sample packs, beat licenses, and the
**Pressure Pass** membership.

> **Built for pressure. Engineered for hitmakers.**

Dark, cinematic, minimal. Pure black (`#000000`) backgrounds, white text, electric
blue (`#00AAFF`) and crimson red (`#CC0000`) as accents. Wide-tracked uppercase
display type (Oswald) over a clean sans-serif body (Inter). No generic templates —
every section is hand-built.

---

## What's inside

| Page | Template | Section(s) |
|------|----------|------------|
| Homepage | `templates/index.json` | `hero`, `logo-strip`, `featured-collection`, `brand-statement`, `cta-band`, `testimonials` |
| Shop / Collection | `templates/collection.json` | `main-collection` (category filters + sort) |
| Product | `templates/product.json` | `main-product` (gallery, variants, audio preview), `product-included`, `related-products` |
| Pressure Pass | `templates/page.pressure-pass.json` | `pressure-pass`, `cta-band` |
| Custom Beats | `templates/page.custom-beats.json` | `custom-beats` (inquiry form) |
| Contact | `templates/page.contact.json` | `contact-form` |
| Cart | `templates/cart.json` | `main-cart` |
| Collections list | `templates/list-collections.json` | `main-list-collections` |
| Blog (The Pressure Lab) | `templates/blog.json` / `article.json` | `main-blog`, `main-article` |
| Search | `templates/search.json` | `main-search` |
| 404 | `templates/404.json` | `main-404` |
| Coming soon | `templates/password.json` | `main-password` |
| Gift card | `templates/gift_card.liquid` | — |

Header (logo, nav, cart icon, mobile menu) and footer (links, newsletter, payment
icons, copyright) live in `sections/header.liquid` / `sections/footer.liquid` and
are mounted via the `header-group` / `footer-group` section groups.

### Folder structure

```
.
├── assets/
│   ├── theme.css          # Full dark theme, mobile-first responsive
│   └── theme.js           # Cart AJAX, drawer, mobile nav, audio, scroll reveal, Klaviyo
├── config/
│   ├── settings_schema.json
│   └── settings_data.json
├── layout/
│   ├── theme.liquid       # <head> (Klaviyo + Meta Pixel + fonts), header/footer groups, cart drawer
│   └── password.liquid
├── locales/
│   └── en.default.json
├── sections/              # All section + section-group files
├── snippets/
│   ├── icon.liquid        # Inline SVG icon set
│   ├── product-card.liquid
│   ├── cart-drawer.liquid
│   ├── klaviyo-newsletter.liquid
│   ├── payment-icons.liquid   # Visa, Mastercard, Amex, Apple Pay, Shop Pay
│   └── meta-tags.liquid       # Open Graph / Twitter
└── templates/             # JSON templates (Online Store 2.0)
```

---

## Setup

### Option A — Shopify CLI (recommended)

1. Install the CLI: <https://shopify.dev/docs/themes/tools/cli/install>
2. From this folder, log in and push:
   ```bash
   shopify theme push --unpublished
   ```
   This uploads the theme as a draft. Use `shopify theme dev` to preview locally
   with hot reload, or `shopify theme push --live` to publish.

### Option B — Manual ZIP upload

1. Zip the **contents** of this repository (the `assets`, `config`, `layout`,
   `locales`, `sections`, `snippets`, `templates` folders must be at the root of
   the zip — not nested inside an extra folder).
   ```bash
   zip -r konstant-uprise-theme.zip assets config layout locales sections snippets templates
   ```
2. In Shopify admin go to **Online Store → Themes → Add theme → Upload zip file**.
3. Select the zip, then **Customize** to configure, or **Publish** to go live.

---

## Post-install configuration

Everything below is editable in **Online Store → Themes → Customize** (no code).

### 1. Navigation
Create/confirm a menu in **Content → Menus** with:
`Shop` → `/collections/all`, `Pressure Pass` → `/pages/pressure-pass`,
`Custom Beats` → `/pages/custom-beats`, `The Pressure Lab` → `/blogs/the-pressure-lab`.
Then assign it in the **Header** section settings. (If no menu is assigned, the
header falls back to these exact links automatically.)

### 2. Pages
Create these pages in **Content → Pages** and assign the matching template:
| Page handle | Template to select |
|-------------|--------------------|
| `pressure-pass` | `page.pressure-pass` |
| `custom-beats` | `page.custom-beats` |
| `contact` | `page.contact` |
| `faq` | `page` (default) |

### 3. Products & collections
- Set each product's **Type** to `Sample Pack`, `Beat License`, or `Bundle` — this
  drives the category chips on the Shop page and the label on product cards.
- Tag products with `new` to show a "New" badge; set a **Compare-at price** to show
  a "Sale" badge and strikethrough pricing.
- Assign a collection to the homepage **Featured collection** section (defaults to
  "all products" if none is chosen).

### 4. Audio previews (product page)
Add a product metafield so the product page renders an audio player:
- **Namespace + key:** `custom.audio_preview`
- **Type:** `URL` (or `File reference` to an uploaded MP3/WAV)
Paste the preview track URL per product. A theme-level fallback URL is also
available in the **Product** section settings for testing.

### 5. Pressure Pass membership ($13.99/mo)
For real recurring billing, install a Shopify subscriptions app (e.g. Shopify
Subscriptions), create a `$13.99 / month` selling plan on a "Pressure Pass"
product, then select that product in the **Pressure Pass** section settings. The
CTA will add it to cart with the monthly selling plan. Without a subscription
product, the CTA falls back to the configured link.

---

## Integrations (already wired)

### Klaviyo (Email / SMS) — public key `WQY7yT`
`klaviyo.js` is loaded site-wide from `layout/theme.liquid`, so any **Klaviyo
onsite popup / signup form** you build in the Klaviyo dashboard will appear
automatically (email + SMS opt-in popup, etc.).

The theme also ships native newsletter forms (footer, CTA band, password page). To
submit directly to a specific Klaviyo list, paste that list's **List ID** into the
relevant section setting (Footer → Newsletter, or CTA band). Without a List ID the
forms still capture and confirm, and the Klaviyo popup handles the heavy lifting.

Change the company ID any time in **Customize → Theme settings → Integrations →
Klaviyo Company ID**.

### Meta Pixel — placeholder ready
Paste your numeric **Pixel ID** in **Customize → Theme settings → Integrations →
Meta Pixel ID**. The theme then fires `PageView` on every page and `AddToCart`
on every AJAX add. Leave blank to keep it disabled.

### Cart
Fully AJAX: add-to-cart, quantity changes, and removal hit the Shopify Cart API
and update a slide-in **cart drawer** with no page reload. A full `/cart` page is
also included. Dynamic checkout buttons (Shop Pay / Apple Pay / etc.) render on the
product page (toggle in the Product section).

---

## Design & tech notes

- **Mobile-first**, fully responsive (breakpoints at 1100 / 990 / 760 / 420px).
- **Fast & dependency-free** — vanilla JS, system-loaded Google Fonts, no jQuery,
  no framework. CSS and JS are single files served via Shopify's CDN.
- **Subtle motion** — `IntersectionObserver` scroll reveals, hover glows, marquee
  trust strip. Fully respects `prefers-reduced-motion`.
- **Accessible** — skip link, focus-visible outlines, ARIA on drawers/menus,
  semantic landmarks.
- **Brand colors** are theme settings; defaults are locked to the KU palette.

### Local validation
JSON templates and `{% schema %}` blocks are valid. For full theme linting:
```bash
shopify theme check
```

---

© 2026 Konstant Uprise. All rights reserved.
