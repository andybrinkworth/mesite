/* ============================================================
   ANDY PRODUCT PAGE v2
   app.js

   Architecture:
   - Single source of truth: window.pageContent (stories.js)
   - Single state object
   - applyStoryMode() is the orchestrator for all Story Mode updates
   - IntersectionObserver drives all scroll-reveal animations
   - All DOM references cached up front in `elements`
   ============================================================ */

const content = window.pageContent;

/* ── State ──────────────────────────────────────────────────── */
const state = {
  currentStoryIndex: 0,
  paletteOpen: false,
  activePaletteIndex: 0,
  presentationMode: false,
  filteredPaletteItems: [],
  revealObserver: null
};

/* ── DOM cache ──────────────────────────────────────────────── */
const elements = {
  heroCategory:          document.getElementById("heroCategory"),
  heroTitle:             document.getElementById("heroTitle"),
  secondaryCta:          document.getElementById("secondaryCta"),
  heroImage:             document.getElementById("heroImage"),
  storyTitle:            document.getElementById("storyTitle"),
  storySubtitle:         document.getElementById("storySubtitle"),
  storyCopy:             document.getElementById("storyCopy"),
  storyQuoteText:        document.getElementById("storyQuoteText"),
  storyQuoteAttribution: document.getElementById("storyQuoteAttribution"),
  galleryThumbs:         document.getElementById("galleryThumbs"),
  productDescription:    document.getElementById("productDescription"),
  heroFeatures:          document.getElementById("heroFeatures"),
  specTableBody:         document.getElementById("specTableBody"),
  togetherGrid:          document.getElementById("togetherGrid"),
  manualAccordion:       document.getElementById("manualAccordion"),
  faqAccordion:          document.getElementById("faqAccordion"),
  commandPalette:        document.getElementById("commandPalette"),
  commandPaletteOverlay: document.getElementById("commandPaletteOverlay"),
  commandPaletteClose:   document.getElementById("commandPaletteClose"),
  commandSearch:         document.getElementById("commandSearch"),
  commandResults:        document.getElementById("commandResults"),
  progressBar:           document.getElementById("progressBar"),
  themeToggle:           document.getElementById("themeToggle"),
  presentationToggle:    document.getElementById("presentationToggle")
};

/* Panels that briefly fade/slip during a story transition */
const transitionPanels = [
  document.querySelector(".story-preview"),
  document.querySelector(".story-quote")
].filter(Boolean);

/* ── Boot ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  renderHero();
  renderGallery();
  renderFeatures();
  renderSpecifications();
  renderBoughtTogether();
  renderAccordion(elements.manualAccordion, content.manual, "manual");
  renderAccordion(elements.faqAccordion, content.faq, "faq");
  renderCommandPaletteResults(content.commandPalette);
  setupTabs();
  setupEventListeners();
  setupScrollReveal();
  updateProgressBar();
  initTheme();

  // Apply first story without animation; image loads immediately
  applyStoryMode(0, false, false);

  // Stagger-reveal the hero cluster after a short breath
  window.setTimeout(revealHeroCluster, 120);
});

/* ================================================================
   HERO
   ================================================================ */
function renderHero() {
  const { hero } = content;
  elements.heroCategory.textContent         = hero.category;
  elements.heroTitle.textContent            = hero.title;
  elements.secondaryCta.textContent         = hero.secondaryButton;
  elements.productDescription.textContent   = content.productDescription;
}

/* Animate hero actions row and story cluster in on first load */
function revealHeroCluster() {
  const cluster = document.getElementById("story-panel");
  if (cluster) {
    cluster.style.opacity = "0";
    cluster.style.transform = "translateY(12px)";
    cluster.style.transition = "opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1)";
    // Trigger reflow then animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cluster.style.opacity = "1";
        cluster.style.transform = "translateY(0)";
      });
    });
  }
}

/* ================================================================
   GALLERY
   ================================================================ */
function renderGallery() {
  elements.galleryThumbs.innerHTML = "";

  content.stories.forEach((story, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumb-button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", index === 0 ? "true" : "false");
    button.setAttribute("aria-label", `Show story: ${story.title}`);
    button.setAttribute("id", `story-thumb-${story.id}`);
    button.setAttribute("tabindex", index === 0 ? "0" : "-1");
    button.dataset.index = String(index);

    const image = document.createElement("img");
    image.src = story.image;
    image.alt = "";
    image.loading = index === 0 ? "eager" : "lazy";

    button.appendChild(image);
    button.addEventListener("click", () => applyStoryMode(index, true, true));
    button.addEventListener("keydown", (e) => handleGalleryKeydown(e, index));

    elements.galleryThumbs.appendChild(button);
  });
}

/* ================================================================
   STORY MODE – the orchestrator
   All Story Mode changes flow through here.
   ================================================================ */
function applyStoryMode(index, shouldFocusStory = false, animate = true) {
  const story = content.stories[index];
  state.currentStoryIndex = index;

  if (animate) {
    // 1. Fade out image and panels simultaneously
    elements.heroImage.classList.add("is-transitioning");
    transitionPanels.forEach((panel) => panel.classList.add("is-updating"));

    // 2. After the fade-out (160 ms), swap content and fade back in
    window.setTimeout(() => {
      swapStoryContent(story);
      elements.heroImage.classList.remove("is-transitioning");

      // Panels get a staggered fade-in
      transitionPanels.forEach((panel, i) => {
        window.setTimeout(() => {
          panel.classList.remove("is-updating");
        }, i * 60);
      });

      if (shouldFocusStory) {
        document.getElementById("story-panel").focus();
      }
    }, 160);
  } else {
    swapStoryContent(story);
  }
}

/* All the actual DOM writes happen here, keeping applyStoryMode clean */
function swapStoryContent(story) {
  updateHeroMedia(story);
  updateStoryContent(story);
  updateStoryQuote(story);
  updateTheme(story);
  updateFeatureHighlight(story.linkedFeatureId);
  updateThumbState();
}

function updateHeroMedia(story) {
  elements.heroImage.src = story.image;
  elements.heroImage.alt = story.alt;
}

function updateStoryContent(story) {
  elements.storyTitle.textContent    = story.title;
  elements.storySubtitle.textContent = story.subtitle;
  elements.storyCopy.innerHTML = story.story
    .split("\n\n")
    .map((para) => `<p>${para.trim()}</p>`)
    .join("");
}

function updateStoryQuote(story) {
  elements.storyQuoteText.textContent        = `\u201c${story.quote.text}\u201d`;
  elements.storyQuoteAttribution.textContent = story.quote.attribution;
}


/* Update CSS custom properties – drives background glow, progress bar,
   feature highlight, nav underline, stars and all accent surfaces */
function updateTheme(story) {
  const root = document.documentElement;
  root.style.setProperty("--story-accent", story.theme.accent);
  root.style.setProperty("--story-tint",   story.theme.tint);
  root.style.setProperty("--story-glow",   story.theme.glow);
}

/* Highlight the relevant feature tile when story changes */
function updateFeatureHighlight(featureId) {
  document.querySelectorAll(".feature-tile").forEach((tile) => {
    const isActive = tile.dataset.featureId === featureId;
    tile.classList.toggle("is-active", isActive);
  });
}

function updateThumbState() {
  const buttons = [...elements.galleryThumbs.querySelectorAll(".thumb-button")];
  buttons.forEach((button, index) => {
    const isActive = index === state.currentStoryIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });
}

function handleGalleryKeydown(event, index) {
  const total = content.stories.length;
  let next = index;

  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    next = (index + 1) % total;
  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    next = (index - 1 + total) % total;
  } else {
    return;
  }

  event.preventDefault();
  applyStoryMode(next, false, true);
  elements.galleryThumbs.querySelectorAll(".thumb-button")[next].focus();
}

/* ================================================================
   FEATURES (compact tiles inside hero panel)
   ================================================================ */
function renderFeatures() {
  elements.heroFeatures.innerHTML = "";
  content.features.forEach((feature) => {
    const tile = document.createElement("div");
    tile.className = "feature-tile";
    tile.dataset.featureId = feature.id;
    tile.setAttribute("aria-label", feature.title);
    tile.innerHTML = `
      <span class="feature-tile__icon" aria-hidden="true">${feature.icon}</span>
      <span class="feature-tile__label">${feature.title}</span>
    `;
    elements.heroFeatures.appendChild(tile);
  });
}

/* ================================================================
   SPECIFICATIONS
   ================================================================ */
function renderSpecifications() {
  elements.specTableBody.innerHTML = "";

  content.specifications.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <th scope="row">${item.label}</th>
      <td>${item.value}</td>
    `;
    elements.specTableBody.appendChild(row);
  });
}


/* ================================================================
   FREQUENTLY BOUGHT TOGETHER
   ================================================================ */
function renderBoughtTogether() {
  elements.togetherGrid.innerHTML = "";

  content.boughtTogether.forEach((item) => {
    const card = document.createElement("div");
    card.className = "circle-card";
    card.setAttribute("tabindex", "0");
    card.innerHTML = `<span>${item}</span>`;
    elements.togetherGrid.appendChild(card);
  });
}

/* ================================================================
   ACCORDIONS (shared for manual + faq)
   ================================================================ */
function renderAccordion(container, items, namespace) {
  container.innerHTML = "";

  items.forEach((item, index) => {
    const section = document.createElement("section");
    section.className = "accordion-item";

    const buttonId = `${namespace}-trigger-${index}`;
    const panelId  = `${namespace}-panel-${index}`;

    section.innerHTML = `
      <h3>
        <button
          id="${buttonId}"
          class="accordion-trigger"
          type="button"
          aria-expanded="false"
          aria-controls="${panelId}"
        >
          <span class="accordion-title">${item.title}</span>
          <span class="accordion-icon" aria-hidden="true">+</span>
        </button>
      </h3>
      <div
        id="${panelId}"
        class="accordion-panel"
        role="region"
        aria-labelledby="${buttonId}"
      >
        <div class="accordion-panel__inner">
          <p>${item.content}</p>
        </div>
      </div>
    `;

    container.appendChild(section);
  });

  container.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => toggleAccordion(trigger));
  });
}

function toggleAccordion(trigger) {
  const isExpanded = trigger.getAttribute("aria-expanded") === "true";
  const panel = document.getElementById(trigger.getAttribute("aria-controls"));

  trigger.setAttribute("aria-expanded", String(!isExpanded));
  panel.style.maxHeight = !isExpanded ? `${panel.scrollHeight}px` : "0px";
}

/* ================================================================
   SCROLL-REVEAL ANIMATION SYSTEM
   Uses IntersectionObserver to drive .reveal and .reveal-stagger
   classes defined in styles.css.
   ================================================================ */
function setupScrollReveal() {
  // Assign reveal classes to sections and cards
  const revealTargets = [
    // Single-element reveals
    "#description .section-heading",
    "#description .lead-text",
    "#specifications .section-heading",
    "#specifications .table-wrap",
    "#guide .section-heading",
    "#together .section-heading",
  ];

  const staggerTargets = [
    // Containers whose direct children stagger in
    "#togetherGrid",
    "#manualAccordion",
    "#faqAccordion",
  ];

  revealTargets.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) el.classList.add("reveal");
  });

  staggerTargets.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) el.classList.add("reveal-stagger");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  // Observe all reveal elements
  document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => {
    observer.observe(el);
  });

  state.revealObserver = observer;
}


/* ================================================================
   PROGRESS BAR
   ================================================================ */
function updateProgressBar() {
  const scrollTop    = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress     = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  elements.progressBar.style.width = `${Math.min(progress, 100)}%`;
}

/* ================================================================
   THEME
   ================================================================ */
function initTheme() {
  const saved = localStorage.getItem("andy-theme");
  if (saved === "dark") document.body.classList.add("dark-mode");
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("andy-theme", isDark ? "dark" : "light");
}

/* ================================================================
   PRESENTATION MODE
   ================================================================ */
function togglePresentationMode() {
  state.presentationMode = !state.presentationMode;
  document.body.classList.toggle("presentation-mode", state.presentationMode);

  if (state.presentationMode) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }
}

function handlePresentationNavigation(event) {
  const sections = [...document.querySelectorAll("main .section")];
  const currentIndex = getNearestSectionIndex(sections);

  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    event.preventDefault();
    sections[Math.min(currentIndex + 1, sections.length - 1)]
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    event.preventDefault();
    sections[Math.max(currentIndex - 1, 0)]
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function getNearestSectionIndex(sections) {
  let nearestIndex = 0;
  let nearestDist  = Infinity;

  sections.forEach((section, index) => {
    const dist = Math.abs(section.getBoundingClientRect().top);
    if (dist < nearestDist) { nearestDist = dist; nearestIndex = index; }
  });

  return nearestIndex;
}

/* ================================================================
   COMMAND PALETTE
   ================================================================ */
function openCommandPalette() {
  state.paletteOpen = true;
  elements.commandPalette.hidden = false;
  elements.commandPalette.setAttribute("aria-hidden", "false");
  document.body.classList.add("palette-open");
  state.filteredPaletteItems = [...content.commandPalette];
  renderCommandPaletteResults(content.commandPalette);
  window.setTimeout(() => elements.commandSearch.focus(), 10);
}

function closeCommandPalette() {
  state.paletteOpen = false;
  elements.commandPalette.hidden = true;
  elements.commandPalette.setAttribute("aria-hidden", "true");
  document.body.classList.remove("palette-open");
  elements.commandSearch.value   = "";
  state.filteredPaletteItems     = [...content.commandPalette];
  state.activePaletteIndex       = 0;
}

function handleCommandSearchInput(event) {
  const query = event.target.value.trim().toLowerCase();
  const filtered = content.commandPalette.filter((item) => {
    const hay = [item.label, ...(item.keywords || [])].join(" ").toLowerCase();
    return hay.includes(query);
  });
  state.activePaletteIndex = 0;
  renderCommandPaletteResults(filtered);
}

function renderCommandPaletteResults(items) {
  state.filteredPaletteItems  = [...items];
  elements.commandResults.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.innerHTML = `
      <div class="command-palette__result">
        <strong>No results</strong>
        <span class="command-palette__meta">Try: Family, Skiing, DJ, Flying, Leadership…</span>
      </div>`;
    elements.commandResults.appendChild(empty);
    return;
  }

  items.forEach((item, index) => {
    const li     = document.createElement("li");
    const button = document.createElement("button");
    button.type  = "button";
    button.className = "command-palette__result";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(index === state.activePaletteIndex));
    if (index === state.activePaletteIndex) button.classList.add("is-active");

    // Show keyword hints
    const hint = item.keywords ? item.keywords.slice(0, 3).join(", ") : item.target;
    button.innerHTML = `
      <strong>${item.label}</strong>
      <span class="command-palette__meta">${hint}</span>
    `;
    button.addEventListener("click", () => navigateToPaletteItem(item));
    li.appendChild(button);
    elements.commandResults.appendChild(li);
  });
}

function handlePaletteKeyboard(event) {
  const buttons = [...elements.commandResults.querySelectorAll(".command-palette__result")];
  if (!buttons.length || !state.filteredPaletteItems.length) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.activePaletteIndex = (state.activePaletteIndex + 1) % buttons.length;
    syncPaletteActiveState(buttons);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    state.activePaletteIndex = (state.activePaletteIndex - 1 + buttons.length) % buttons.length;
    syncPaletteActiveState(buttons);
  } else if (event.key === "Enter") {
    event.preventDefault();
    const item = state.filteredPaletteItems[state.activePaletteIndex];
    if (item) navigateToPaletteItem(item);
  }
}

function syncPaletteActiveState(buttons) {
  buttons.forEach((btn, i) => {
    const active = i === state.activePaletteIndex;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  buttons[state.activePaletteIndex]?.scrollIntoView({ block: "nearest" });
}

function navigateToPaletteItem(item) {
  closeCommandPalette();

  if (item.storyId) {
    const idx = content.stories.findIndex((s) => s.id === item.storyId);
    if (idx >= 0) applyStoryMode(idx, false, true);
  }

  // Small delay so the story transition starts before the scroll
  window.setTimeout(() => {
    const target = document.querySelector(item.target);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, item.storyId ? 80 : 0);
}

/* ================================================================
   TABS
   ================================================================ */
function setupTabs() {
  const tabBtns = [...document.querySelectorAll(".tab-btn")];
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
        document.getElementById(b.getAttribute("aria-controls")).hidden = true;
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(btn.getAttribute("aria-controls")).hidden = false;
    });
  });
}

/* ================================================================
   GLOBAL EVENT LISTENERS
   ================================================================ */
function setupEventListeners() {
  document.addEventListener("keydown", handleGlobalKeydown);
  window.addEventListener("scroll", updateProgressBar, { passive: true });
  window.addEventListener("resize", handleResize);

  elements.commandPaletteOverlay.addEventListener("click", closeCommandPalette);
  elements.commandPaletteClose.addEventListener("click",   closeCommandPalette);
  elements.commandSearch.addEventListener("input",         handleCommandSearchInput);
  elements.themeToggle.addEventListener("click",           toggleTheme);
  elements.presentationToggle.addEventListener("click",    togglePresentationMode);
}

function handleResize() {
  // Keep open accordion panels at the correct height after resize
  document.querySelectorAll('.accordion-trigger[aria-expanded="true"]').forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (panel) panel.style.maxHeight = `${panel.scrollHeight}px`;
  });
}

function handleGlobalKeydown(event) {
  const tag = document.activeElement?.tagName?.toLowerCase();
  const isInput = tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable;

  if (event.key === "/" && !isInput) {
    event.preventDefault();
    openCommandPalette();
    return;
  }

  if (event.key.toLowerCase() === "p" && !isInput) {
    event.preventDefault();
    togglePresentationMode();
    return;
  }

  if (event.key === "Escape" && state.paletteOpen) {
    closeCommandPalette();
    return;
  }

  if (state.paletteOpen) {
    handlePaletteKeyboard(event);
    return;
  }

  if (state.presentationMode) {
    handlePresentationNavigation(event);
  }
}
