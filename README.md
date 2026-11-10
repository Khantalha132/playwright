# GeniCoder UI Test Suite (Playwright)

Automated UI/UX tests for [genicoder.corepulsetechnologies.com](http://genicoder.corepulsetechnologies.com), written in Playwright + TypeScript.  
Tests are mapped against the Figma design to validate content, layout, navigation, forms, accessibility, performance, and cross-browser behavior.

---

## 📁 Test File Structure

| File | Coverage |
|------|----------|
| `01-navigation.spec.ts` | Header nav links, logo, Book a Demo CTA, mobile hamburger |
| `02-homepage.spec.ts` | Hero, stats, problem section, how it works, covers, CPT search, signup, testimonials, demo, FAQ, newsletter |
| `03-footer.spec.ts` | Footer logo, module links, company links, newsletter, copyright |
| `04-about-us.spec.ts` | Hero, problem, focus, automation pillars, modules, regulated env, who we serve |
| `05-contact.spec.ts` | Contact form fields, Send button, email callout, form interaction & submission |
| `06-book-demo.spec.ts` | Demo page headings, PURE TRANSPARENCY, REAL UTILITY, CTA |
| `07-how-it-works.spec.ts` | Page load, headings, nav/footer presence |
| `08-modules.spec.ts` | Modules index page + all 6 individual module pages load |
| `09-solutions-resources.spec.ts` | Solutions and Resources pages basic load/heading checks |
| `10-visual-performance.spec.ts` | Image loading, broken links, responsive viewports, load time, console errors, scroll |
| `11-forms.spec.ts` | All signup form fields (Individual, Provider, Billing Company), newsletter |
| `12-accessibility.spec.ts` | h1 presence, alt tags, link text, nav/footer landmarks, skip link, keyboard tab |
| `13-e2e-journeys.spec.ts` | Full user journeys: nav → page, logo → home, footer nav, full-page scroll |

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install dependencies & browsers
```bash
npm install
npm run install:browsers
```

---

## ▶️ Running Tests

### All tests (all browsers)
```bash
npm test
```

### Single browser
```bash
npm run test:chrome
npm run test:firefox
npm run test:mobile
npm run test:tablet
```

### Specific test file
```bash
npm run test:homepage
npm run test:nav
npm run test:contact
npm run test:a11y
npm run test:e2e
```

### Interactive UI mode
```bash
npm run test:ui
```

### Headed mode (watch browser)
```bash
npm run test:headed
```

### View HTML report after a run
```bash
npm run test:report
```

---

## 🧪 What Is Tested

### ✅ Content & UI Fidelity (Figma → Live)
- Every section heading, subheading, and key copy block
- All CTAs (Book a Demo, Request a Walkthrough, Schedule a Walkthrough, Sign Up, Send)
- Stat metrics (40-45%, 25-30%, ⅓)
- Testimonials (Lena Rodriguez, James Holloway)
- FAQ items
- Module listings

### ✅ Navigation
- All 7 nav links navigate correctly
- Logo returns to homepage
- Book a Demo CTA present in header

### ✅ Forms
- Individual User, Provider, Billing Company signup forms
- Contact Us form (all 6 fields + Send)
- Newsletter subscription inputs
- Form field interaction (fill, assert value)
- Contact form full submission test

### ✅ Footer
- Module links (7 links)
- Company links (6 links)
- Newsletter
- Copyright text
- Privacy Policy navigation

### ✅ Responsive Design
- Desktop 1440px
- Mobile 375px (no horizontal scroll check)
- Tablet 768px

### ✅ Performance
- Page load under 10s
- Console error monitoring

### ✅ Accessibility
- h1/h2 presence
- Image alt attributes
- Link discernible text
- Form input labels/placeholders
- nav + footer landmarks
- Skip to content link
- HTML lang attribute
- Keyboard tab navigation

### ✅ E2E Journeys
- Home → Contact via nav
- Home → About → Home via logo
- Home → How It Works
- Home → Book a Demo
- Footer-based navigation
- Full homepage section scroll

---

## 🛠 Configuration

Edit `playwright.config.ts` to:
- Change `baseURL`
- Add/remove browser projects
- Adjust `actionTimeout` / `navigationTimeout`
- Enable/disable `video` or `trace`

---

## 📝 Notes

- Tests use **soft selectors** where content may shift (Elementor carousel duplicates sections — the first match is used).
- Form submission tests do **not** assert server-side success to avoid polluting real data.
- Console error tests **filter** known 3rd-party scripts (GA, pixel, etc.).
- Module page URLs match the live site slugs (`moduel-1`, `moduel-2-copy`, etc.) including the typos.
