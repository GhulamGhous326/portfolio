# Ghulam Ghous — Portfolio

Personal portfolio of **Ghulam Ghous**, frontend developer (HTML/CSS/JS, learning MERN), targeting junior frontend roles.

**Live:** https://ghulamghousdev.netlify.app

## What's inside

- 5 pages: Home, About, Projects, Skills, Contact — dark teal/gold "Neuravis" brand
- 4 project case studies: Rook.pk (WooCommerce), Luxe Boutique (Supabase e-commerce), TaskBoard (React + TypeScript), College Website Clone
- "Ask Ghulam" AI chatbot: floating widget on every page, backed by a Netlify Function proxying Gemini (key in `GEMINI_API_KEY` env var, never in code). Grounded on `netlify/functions/ghulam.json`, rate-limited, refuses prompt injection
- Contact form via Netlify Forms, sitemap + robots + JSON-LD + OG tags, WebP imagery

## Run it

No build step. Open `index.html` directly or serve the folder:

```bash
npx serve .
```

Set `GEMINI_API_KEY` in your Netlify dashboard for the chatbot backend.

## Notes

- AI-assisted development is disclosed in the TaskBoard case study.
- No invented metrics anywhere on the site.
