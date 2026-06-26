# Andy Product Page v2

A premium single-page personal introduction website built with HTML, CSS and vanilla JavaScript.

This v2 release introduces **Story Mode**: selecting a story reconfigures the page so the experience feels coherent, editorial and presentation-ready.

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- No frameworks
- No dependencies
- No build process

Open `index.html` in a browser and it will run locally.

---

## What's new in v2

Story Mode adds coordinated, story-aware updates across the page.

When a thumbnail is selected, the page now updates:

- **Hero image**
- **Story title and copy**
- **Background accent tone**
- **Editorial quote**
- **Story-aligned spotlight review**
- **Relevant feature highlight**

The effect is subtle by design. The goal is not animation for its own sake, but a more polished and intentional narrative experience.

---

## Project structure

```text
andy-product-page/
├─ index.html
├─ styles.css
├─ app.js
├─ stories.js
└─ assets/
   ├─ images/
   └─ icons/
```

---

## How to customise content

All editable content lives in `stories.js`.

That includes:

- Hero content
- Product description
- Story gallery content
- Story Mode theme settings
- Quotes
- Spotlight reviews
- Features
- Specifications
- Reviews
- Frequently bought together
- User manual
- FAQ
- Final CTA
- Command palette items

### Main content object

The site uses a single global object:

```js
window.pageContent = { ... }
```

Update the values inside that object to personalise the page.

---

## Story Mode data model

Each story now carries its own Story Mode metadata.

Example:

```js
{
  id: "adventure",
  navLabel: "Adventure",
  title: "Adventure",
  subtitle: "Curiosity with momentum.",
  story: "...",
  image: "assets/images/story-4.jpg",
  alt: "Outdoor premium lifestyle image representing curiosity and adventure",
  searchTerms: ["adventure", "travel", "flying", "skiing"],
  linkedFeatureId: "adventure-mode",
  theme: {
    accent: "#3f4f46",
    tint: "rgba(63, 79, 70, 0.12)",
    glow: "rgba(63, 79, 70, 0.20)"
  },
  quote: {
    text: "The happiest job I've ever had wasn't the biggest - it was the one that reminded me to enjoy the journey.",
    attribution: "Andy"
  },
  spotlightReview: {
    quote: "He brings a sense of momentum that makes the work feel stretching and enjoyable at the same time.",
    author: "Former Colleague",
    role: "Team Partner"
  }
}
```

### Why this structure matters

It keeps the site maintainable because Story Mode behaviour is driven by content, not hard-coded conditions spread throughout the JavaScript.

---

## How to replace photos

Place new image files inside:

```text
assets/images/
```

Then update each story image path in `stories.js`:

```js
image: "assets/images/story-1.jpg"
```

Also update the `alt` text for accessibility.

### Image recommendations

For best results:

- Use high-quality editorial-style photography
- Keep colour grading consistent
- Prefer portrait or premium lifestyle imagery
- Aim for similar aspect ratios across all nine images
- Recommended width: 1600px or above
- Compress images before shipping to keep local load times fast

---

## Features included

- Premium hero layout
- Nine-image interactive gallery
- Story Mode orchestration
- Dynamic quote panel
- Dynamic spotlight review panel
- Feature highlighting by active story
- Smooth image and content transitions
- Product feature cards
- Specification table
- Animated review cards
- Frequently bought together section
- Accessible accordions
- Command palette with `/`
- Presentation mode with `P`
- Dark mode
- Reading progress indicator
- Print-friendly styling
- Keyboard navigation
- Visible focus states

---

## Keyboard shortcuts

- `/` opens the command palette
- `Esc` closes the command palette
- `P` toggles presentation mode
- Arrow keys navigate the gallery
- Arrow keys navigate sections in presentation mode

---

## Accessibility

The page includes:

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation
- Focus-visible styles
- Alt text support through content data
- High contrast visual hierarchy
- Accordion regions with accessible controls
- Reduced-motion friendly behaviour

You should still test with:

- Keyboard only
- Screen reader
- Contrast checker
- Reduced motion preferences
- Mobile viewport testing

---

## How to run locally

### Option 1: Open directly

Double-click `index.html`.

### Option 2: Use a local server

This is useful if you want a more realistic testing environment.

If you have Python installed:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## How to deploy

Because the project is static, deployment is simple.

## Deploy to GitHub Pages

### 1. Create a new repository

Create a new GitHub repository, for example:

```text
andy-product-page
```

### 2. Add your files

Upload these files and folders to the repository root:

- `index.html`
- `styles.css`
- `app.js`
- `stories.js`
- `README.md`
- `assets/`

### 3. Commit and push

Example terminal flow:

```bash
git init
git add .
git commit -m "Initial Andy Product Page v2"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/andy-product-page.git
git push -u origin main
```

### 4. Enable GitHub Pages

In GitHub:

1. Open the repository
2. Go to **Settings**
3. Go to **Pages**
4. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Save

### 5. Open the live site

GitHub will publish the site at a URL like:

```text
https://YOUR-USERNAME.github.io/andy-product-page/
```

---

## Deploy to Netlify

### Drag-and-drop method

1. Zip the project folder
2. Log in to Netlify
3. Drag the folder or zip file into the Netlify deploy area
4. Netlify will instantly publish a live URL

### Recommended publish directory

Use the project root because `index.html` is already at the top level.

---

## Deploy to Vercel

1. Create a new project in Vercel
2. Import the GitHub repository
3. Keep the default static settings
4. Deploy

No build command is needed.

---

## Deploy internally or by hand

Because the project is plain static files, you can also:

- upload it to any web server
- host it in an internal static bucket
- share the full folder as a zip
- present directly from your machine

---

## Recommended pre-launch checklist

Before sharing it with a leadership audience:

- Replace placeholder email address in `stories.js`
- Replace placeholder images with real photography
- Check all image paths
- Test presentation mode in your target browser
- Test the command palette
- Review dark mode contrast
- Check mobile layout
- Run a final spelling pass on story copy and quotes

---

## Future enhancements

Possible next improvements:

- Replace Unicode feature icons with bespoke SVG icons
- Add URL hash deep-linking to a selected story
- Add previous/next story controls for presentation mode
- Add image captions
- Add a lightbox mode for story imagery
- Add a downloadable one-page profile PDF
- Add subtle section-based nav highlighting
- Add richer print formatting for interview packs
- Add optional CMS-backed JSON if non-technical editing becomes important

---

## Notes on tone and design

This project aims for authenticity over novelty.

The site should feel memorable because it is well structured, visually calm and emotionally coherent - not because it uses loud effects.

Story Mode works best when the imagery, quotes and spotlight reviews feel genuinely specific. The more truthful the content, the more premium the experience feels.
