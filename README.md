# Ahmed El Baz — Portfolio Site (v2)

A fully offline, responsive one-page portfolio. No build step, no
frameworks, no internet connection required — just open it in a browser.

## How to view it

Double-click `index.html`, or open it from your browser with
`File → Open File…`. Everything (styles, scripts, images) loads from the
local `assets/` folder, so it also works straight off a USB stick or a
zipped folder once unzipped.

To put it online later, upload the whole `portfolio` folder as-is to any
static host (Netlify, GitHub Pages, Vercel, your own hosting) — nothing
needs to change.

## How the site is organised

One scrolling page, navigated with anchors — simple and fast, no page
reloads:

- **Home** (`#home`) — full‑screen cinematic banner with a typing‑in name
- **About** (`#about`) — intro, info cards (social / location / time /
  availability), Experience timeline, Services
- **Portfolio** (`#portfolio`) — five category cards
- Five case‑study sections, one per category — `#cat-logo-design`,
  `#cat-social-media`, `#cat-visual-identity`, `#cat-banners-print`,
  `#cat-art`
- **Contact** (`#contact`)

## What's real vs. placeholder right now

**Real, already in:**
- Your headshot in the hero (`assets/hero/hero-banner.jpg`)
- **Logo Design** — your 8 real marks (Plan, Goserve, Nature Pure, Ebdea,
  Rozan, Amira, the Arabic wordmark study, and the Plan construction grid)
  in `assets/logo-design/`
- **Social Media** — all 5 brands are your real Instagram campaigns:
  Plan Marketing Company, LUVIA, Palm Hills Resorts, Ebdea Digital
  Marketing, and Salla Plus. Each brand's wide "hero banner" is a
  filmstrip built from a few of that brand's own posts — every image in
  `assets/social-media/` came from your uploaded case studies.
- Your real CV details throughout — name, both phone numbers, email, the
  six real Experience roles with real companies and dates.

**Still placeholder (clearly labelled, ready to swap):**
- **Visual Identity**, **Banners & Print**, and **Art** — each case study
  uses generated placeholder imagery in `assets/visual-identity/`,
  `assets/banners-print/`, and `assets/art/`. Every placeholder file is
  labelled with its own filename so it's easy to find and replace.

## Replacing a placeholder image

Keep the same filename and a similar aspect ratio and it drops straight
in — no code changes needed:
- `vi-00-direction.jpg`, `bp-00-direction.jpg`, `art-00-direction.jpg` —
  wide "Visual Direction" images (16:9‑ish)
- `vi-01…06`, `bp-01…06`, `art-01…06` — gallery images (4:3‑ish)

## Replacing links and contact info

Search the HTML for `REPLACE:` comments. A few placeholder `#` links for
Behance, LinkedIn, and Instagram appear in the About cards, the Contact
section, and the footer — drop your real profile URLs in. The contact
email button uses `thebazist@gmail.com` from your CV; update the
`data-email` attribute on `#copyEmail` in `index.html` if you'd like a
different address.

## A few notes on how it's built

- **Hero**: the name types itself in on load, then the role and buttons
  fade up. On phones, the text drops to a dark band at the bottom of the
  banner so it never sits across your face.
- **Scroll reveals**: every section animates in as you scroll — section
  titles "wipe" up into view, cards and gallery images stagger in one
  after another. Turning on "reduce motion" in your OS shows everything
  instantly instead, no animation.
- **Category cards & gallery tiles** gently tilt toward your cursor on
  desktop; on touch devices they give a soft tap‑scale instead.
- **Social Media** brands are separated by wide cinematic banners built
  from your own campaign posts, so each brand reads as its own chapter.
- The Experience rail is a horizontal strip — click‑drag it, or use the
  arrow buttons.
- The email button copies your address to the clipboard on click.

Everything is plain HTML/CSS/vanilla JS. The CSS custom properties at the
top of `style.css` control the whole palette and type system in one
place, so colour or font tweaks only need to happen once.
