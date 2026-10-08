# jackoripo.uk — CV

Personal CV website for Stephen James Jackson, Web Developer.

Live at [jackoripo.uk](https://jackoripo.uk)

## Stack

- Plain HTML, CSS, and JavaScript — no framework
- Content driven by `cv.json`, pre-rendered into `index.html` by `build.mjs` (crawlers/ATS see real HTML, no JS needed)
- [GSAP 3](https://greensock.com/gsap/) for animations
- Hosted on GitHub Pages with a custom domain via Cloudflare

## Features

- Dark / light mode toggle with `localStorage` persistence and `prefers-color-scheme` support
- Mobile hamburger menu with slide-in sidebar overlay
- Scroll progress bar and active nav highlighting via `IntersectionObserver`
- GSAP animations: clip-path sidebar reveal, word-split name entrance, 3D card tilt on portfolio items
- Print stylesheet for clean PDF export
- Email obfuscation (stored reversed in `cv.json`)
- SEO: meta description, Open Graph, Twitter card, JSON-LD Person schema, sitemap, robots.txt
- WCAG AA compliant colour contrast in both light and dark modes

## Development

Open `index.html` directly or serve locally:

```bash
npx serve .
```

### Updating content

Edit `cv.json`, then run `node build.mjs` and commit the regenerated `index.html`. The rendered sections live between the `<!--b:id-->` markers in `index.html` — do not edit inside them by hand.

### Minifying JS

The watcher in PhpStorm handles this automatically on save via Terser.
To run manually:

```bash
npx terser js/main.js -o js/main.min.js --compress --mangle
```

## Deployment

Push to `main` — GitHub Pages deploys automatically.
