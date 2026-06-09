# Passive Affiliate Microsite Starter

A zero-backend, static affiliate microsite you can deploy to any static host. It gives you a polished landing page, configurable offer cards, email capture placeholders, outbound click tracking hooks, and a validation script so the site is easy to customize without introducing broken data.

> Important: this project cannot guarantee income. To monetize it, replace the demo offer URLs in `data/offers.json` with your own compliant affiliate links, disclose affiliate relationships, and drive traffic through SEO, social, email, or paid channels.

## What is included

- A responsive landing page in `index.html`.
- Config-driven offers in `data/offers.json`.
- Client-side rendering, click tracking events, and a local demo lead capture flow in `scripts/app.js`.
- Styling in `styles.css`.
- A validator in `scripts/validate_config.py` for offer data and required static assets.

## Quick start

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Customize before launch

1. Edit `data/offers.json`.
2. Replace every `affiliateUrl` with your own approved affiliate tracking link.
3. Update `disclosure` text to match your jurisdiction and affiliate program requirements.
4. Replace the email form demo behavior with your ESP endpoint (ConvertKit, Beehiiv, Mailchimp, etc.).
5. Deploy to a static host such as Netlify, Cloudflare Pages, GitHub Pages, or Vercel.

## Validate the site

```bash
python3 scripts/validate_config.py
```
