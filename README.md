# QR Code Generator

A modern, fast, client-side QR code generator with a frosted glassmorphism interface, ambient gradients, and high-quality exports.

**Live Deployment:** [https://qrcode-generator.pages.dev](https://qrcode-generator.pages.dev)

---

## Features

- **Pristine 1:1 Aspect Ratio**: Distortion-free QR rendering optimized for high-DPI displays.
- **High-Quality Exports**:
  - **PNG**: Ultra-sharp $1024\times 1024\text{ px}$ image with standard quiet-zone margins.
  - **PDF**: Clean, print-ready A4 specification sheet.
- **Smart Input Guard**: Accepts plain text, URLs, and numbers while automatically blocking raw programming code snippets.
- **Premium Glassmorphism UI**: Ambient slate background that is gentle on the eyes with smooth micro-animations.
- **Pro Typography Stack**: Built with [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono).
- **Mobile Optimized**: Fluid responsive scaling, custom 6px thin scrollbar, and transparent tap highlights for touch devices.
- **SEO Ready**: Schema.org structured data (`WebApplication`, `HowTo`, `FAQPage`), Open Graph tags, `robots.txt`, and `sitemap.xml`.
- **Private & Client-Side**: All generation runs directly in the browser—no data is sent to external servers.

---

## File Structure

```
qrcode-generator/
├── index.html        # Main generation studio & SEO content
├── result.html       # QR code display & download suite
├── styles.css        # Responsive glassmorphism design system
├── script.js         # QR generation, code detection & export engines
├── sitemap.xml       # Search engine sitemap
├── robots.txt        # Web crawler directives
└── README.md         # Documentation
```

---

## Tech Stack

- **HTML5 & CSS3** (Vanilla CSS with CSS Variables, Flexbox, Grid, and Glassmorphism)
- **JavaScript** (ES6+, client-side storage, Canvas API)
- **Libraries**:
  - [qrcode.js](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) — QR code generation
  - [jsPDF](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js) — Client-side PDF compilation

---

## Getting Started

Open `index.html` in any modern web browser or serve via any static web server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve .
```
