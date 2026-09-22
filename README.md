# QR Code Generator

A modern, fast, client-side QR code generator with a frosted glassmorphism interface, ambient gradients, and ultra high-resolution exports in standard PNG, transparent PNG (no background), and PDF.

**Live Deployment:** [https://free-qrcode.pages.dev](https://free-qrcode.pages.dev)

---

## Features

- **Pristine 1:1 Aspect Ratio**: Distortion-free, integer-scaled QR code rendering compliant with ISO/IEC 18004 standards and Level H (30%) error correction.
- **Ultra High-Quality Exports (2048×2048 px)**:
  - **PNG (White Background)**: Ultra-sharp $2048\times 2048\text{ px}$ raster image with standard quiet-zone margins.
  - **PNG (Transparent / No Background)**: Ultra-sharp $2048\times 2048\text{ px}$ image with an alpha channel (removed background)—ideal for dark mode, posters, merchandise, and graphic design mockups.
  - **PDF (Print-Ready)**: Clean, professional A4 specification sheet formatted for paper scanning at 300+ DPI.
- **100% Mobile Browser Compatibility**:
  - Full support across iOS Safari, modern Android (10–15+) Chrome, Samsung Internet, and in-app webviews.
  - Resolved legacy mobile user-agent regex constraints in QR libraries to guarantee synchronous on-screen rendering.
  - 3-tier storage architecture (`URL query parameter` + `localStorage` + `sessionStorage`) for flawless execution in private and incognito browsing sessions.
- **Zero-Scroll Mobile UI**:
  - Streamlined 3-action responsive grid layout (`PNG White`, `PNG No BG`, `PDF Print`) with compact footer navigation to fit perfectly within mobile viewports without vertical scrolling.
- **Smart Input Guard**: Accepts plain text, URLs, and phone numbers while automatically detecting and blocking raw programming code snippets.
- **Premium Glassmorphism Design**: Ambient slate base with Emerald Mint (`#10b981`), Warm Amber (`#f59e0b`), and Sky Blue (`#38bdf8`) accents with smooth micro-animations.
- **Pro Typography Stack**: Built with [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono).
- **SEO & Rich Snippet Ready**: Comprehensive Schema.org structured data (`WebApplication`, `HowTo`, `FAQPage`), Open Graph tags, Twitter Cards, `robots.txt`, and `sitemap.xml`.
- **Private & Client-Side**: All generation runs directly in the browser—zero data is sent to external servers.

---

## File Structure

```
qrcode-generator/
├── index.html        # Main generation studio, SEO content & Schema.org JSON-LD
├── result.html       # QR code showcase, zero-scroll suite & multi-format downloads
├── styles.css        # Responsive glassmorphism design system & responsive layout
├── script.js         # QR generation, code detection & 2048px export engines
├── sitemap.xml       # Search engine sitemap
├── robots.txt        # Web crawler directives
└── README.md         # Documentation
```

---

## Tech Stack

- **HTML5 & CSS3** (Vanilla CSS with CSS Variables, Flexbox, CSS Grid, Glassmorphism, and responsive breakpoints)
- **JavaScript** (ES6+, HTML5 Canvas API, multi-tier client storage)
- **Libraries**:
  - [qrcode.js](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) — QR code model generation
  - [jsPDF](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js) — Client-side vector PDF generation

---

## Getting Started

Open `index.html` in any modern web browser or serve via any static web server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve .
```
