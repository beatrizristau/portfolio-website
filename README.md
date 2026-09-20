# Beatriz Ristau’s Portfolio

This is my personal portfolio website. I’m a software engineer specialized in backend development with Java and Spring Boot. Here, I showcase my skills, highlight my projects and experience, and provide a contact form so you can reach out for collaboration and/or job opportunities.

![Screenshot 2026-09-19 at 11.48.48 PM.png](../../Downloads/Screenshot%202026-09-19%20at%2011.48.48%E2%80%AFPM.png)

## Local preview

No build step or package installation is required. Open `index.html` directly, or start a local server:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8000.

## Features

- Responsive layouts and accessible mobile navigation
- Sticky navigation with a terracotta scroll progress bar and active section links
- Muted video loop with pause/play, reduced-motion support, and a poster fallback
- Categorized skills, project repository links, and work experience
- Existing Formspree contact integration with inline status and error feedback
- Labeled form fields, keyboard focus indicators, and a skip link

## Design

The palette uses warm off-white (`#F5F4F0`), soft black (`#171715`), and restrained terracotta accents (`#A16F4C`). Inter loads through Google Fonts with a system sans-serif fallback; metadata uses system monospace fonts. Shared design tokens live at the top of `styles.css`.

## Files

- `index.html` — page content and semantic structure
- `styles.css` — design tokens and responsive styling
- `script.js` — navigation, scroll progress, video, and contact behavior
- `assets/` — hero video, poster, and favicon
- `imgs/` — existing portrait and TechOS screenshot

## Contact

The form posts to the existing Formspree endpoint. Local layout checks do not require sending a real message. The email, GitHub, and LinkedIn links are also available directly on the page.

## License

[MIT](LICENSE)
