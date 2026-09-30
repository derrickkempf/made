# MADE artes — Sanity-powered site

Static three-page site (home, collection, product) that runs standalone with fallback content, and pulls live content from Sanity once configured. No build step on the frontend.

```
├── index.html / collection.html / product.html
├── styles.css
├── js/sanity.js        ← Sanity client + page hydration (paste projectId here)
├── fonts/              ← MADE Remix, Optician Sans, DEWD faces
├── studio/             ← Sanity Studio (schemas: product, post, homepage)
└── seed/seed.ndjson    ← all current site content, ready to import
```

## Setup

**1. Create the Sanity project.** Log in at [sanity.io/manage](https://www.sanity.io/manage), create a project (dataset: `production`, public). Note the project ID.

**2. Configure.** Paste the project ID in two places:
- `js/sanity.js` → `SANITY.projectId`
- `studio/sanity.config.js` → `projectId`

**3. Run the Studio and import content.**
```sh
cd studio
npm install
npx sanity dataset import ../seed/seed.ndjson production
npm run dev        # Studio at http://localhost:3333
```

**4. Allow the site's origin.** In sanity.io/manage → API → CORS origins, add wherever the site is served from (e.g. `http://localhost:8080`). Serve the site with any static server:
```sh
npx http-server .   # from the project root
```
Don't open the pages via `file://` — browsers block those requests to Sanity's API.

## How it works

Each page renders its built-in content immediately. On `DOMContentLoaded`, `js/sanity.js` checks for a `projectId`; if set, it queries the Content Lake with GROQ over plain `fetch` (no SDK) and swaps in live content: hero copy, feature sections, and research posts on home; the full product grid on collection; title, price, description, sizes, accordions, and related products on the product page. Product images uploaded in the Studio replace the gray placeholders automatically. If Sanity is unreachable, the static content simply stays — the site never breaks.

Content model: `product` (price, badge, swatches, collection, description, sizes, care, origin, related), `post` (research cards), and a singleton `homepage` (hero, new releases references, feature sections).
