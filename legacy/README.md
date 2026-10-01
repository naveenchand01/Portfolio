# Naveen Chand: Portfolio

A multi-page, liquid motion-graphics portfolio. Plain HTML/CSS/JS with no framework or build tooling.

## Pages
| Page | File | Liquid palette |
|---|---|---|
| Home | `index.html` | violet / teal / coral |
| About | `about.html` | rose / amber / violet |
| Work | `work.html` | mint / blue / lime |
| Stack | `stack.html` | blue / purple / cyan |
| Contact | `contact.html` | red / pink / gold |

## Motion
- WebGL liquid background (`js/liquid.js`): a domain-warped flow field that follows the cursor; the palette flows from the previous page's colours into the next page's.
- Liquid page transitions: a wave rises, shows the page name, then drips away (`js/main.js`).
- First-visit preloader, split-text reveals, scroll-scrubbed text, counters, magnetic buttons, custom cursor, a pinned horizontal project scroller and animated canvas visuals for each project (`js/visuals.js`).
- Respects `prefers-reduced-motion`.

## Edit content
Page content lives in `src/pages/*.html`; nav, footer and scripts live in `src/layout.html`.
After editing, rebuild the five root pages:

```
python build.py
```

## Preview locally
Double-click `index.html`, or run `python -m http.server 5500` and open http://127.0.0.1:5500

## Deploy (free)
- **Vercel**: `npx vercel` in this folder (or drag the folder into vercel.com/new).
- **Netlify**: drag the folder onto app.netlify.com/drop.
- **GitHub Pages**: push to a repo named `naveenchand01.github.io`.

Libraries load from CDNs: GSAP + ScrollTrigger (cdnjs) and Lenis (jsDelivr). Fonts: Syne, Manrope and JetBrains Mono (Google Fonts).
