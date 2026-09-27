/* DOM elements used by the navigation and scroll progress bar */
const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const scrollProgress = document.getElementById('scrollProgress');
const sectionLinks = [...navLinks.querySelectorAll('a')];
const sections = sectionLinks.map(link => document.querySelector(link.hash));
const mobileViewport = window.matchMedia('(max-width: 760px)');

/* Enable JavaScript-specific styles and set content that changes over time */
document.documentElement.classList.add('js');
navToggle.hidden = false;
document.getElementById('year').textContent = new Date().getFullYear();

/* Close the mobile navigation and optionally return keyboard focus to its button */
function closeMenu(returnFocus = false) {
  navLinks.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation');
  if (returnFocus) navToggle.focus();
}

/* Open or close the mobile navigation when its menu button is selected */
navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') !== 'true';
  navLinks.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

/* Close the mobile navigation after the visitor selects a page link */
sectionLinks.forEach(link => link.addEventListener('click', () => closeMenu()));
document.querySelector('.brand').addEventListener('click', () => closeMenu());

/* Allow keyboard users to close the mobile navigation with the Escape key */
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});

/* Close the mobile navigation after a click or focus change outside the header */
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
header.addEventListener('focusout', event => {
  if (!header.contains(event.relatedTarget)) closeMenu();
});

/* Reset the mobile menu when the page crosses the mobile breakpoint */
mobileViewport.addEventListener('change', () => closeMenu());

/* Update the progress bar, sticky header, and currently active navigation link */
let scrollScheduled = false;
function updateScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
  header.classList.toggle('is-scrolled', window.scrollY > 10);
  let activeSection = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 150) activeSection = section.id;
  }
  if (progress > .995) activeSection = sections.at(-1).id;
  for (const link of sectionLinks) {
    if (link.hash === `#${activeSection}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scrollScheduled = false;
}

/* Use one animation frame per update to keep scroll handling smooth */
function scheduleScroll() {
  if (!scrollScheduled) {
    scrollScheduled = true;
    window.requestAnimationFrame(updateScroll);
  }
}

/* Recalculate scroll-related UI when the page moves, resizes, or restores */
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);
window.addEventListener('pageshow', scheduleScroll);
new ResizeObserver(scheduleScroll).observe(document.body);
updateScroll();

/* Accessible skills tabs: all categories remain available without JavaScript. */
const skillTabs = document.getElementById('skillTabs');
const skillButtons = [...skillTabs.querySelectorAll('[role="tab"]')];
const skillPanel = document.getElementById('skills-panel');
const skillCategories = [...skillPanel.querySelectorAll('[data-skill-category]')];

function selectSkillTab(button) {
  const category = button.dataset.skillFilter;
  for (const tab of skillButtons) {
    const selected = tab === button;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const group of skillCategories) {
    group.hidden = category !== 'all' && group.dataset.skillCategory !== category;
  }
  skillPanel.setAttribute('aria-labelledby', button.id);
  scheduleScroll();
}

skillButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectSkillTab(button));
  button.addEventListener('keydown', event => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % skillButtons.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + skillButtons.length) % skillButtons.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = skillButtons.length - 1;
    else return;
    event.preventDefault();
    const nextTab = skillButtons[nextIndex];
    selectSkillTab(nextTab);
    nextTab.focus();
  });
});
skillPanel.setAttribute('role', 'tabpanel');
skillPanel.tabIndex = 0;
selectSkillTab(skillButtons[0]);
skillTabs.hidden = false;

/* Contact form elements used for submission feedback */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

/* Submit the contact form without leaving the page and show its current status */
contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  if (submitButton.disabled) return;
  submitButton.disabled = true;
  contactForm.setAttribute('aria-busy', 'true');
  formStatus.classList.remove('is-error');
  formStatus.textContent = 'Sending your message…';

  /* Send the form data to the configured Formspree endpoint */
  try {
    const response = await fetch(contactForm.action, {
      method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Submission failed');
    contactForm.reset();
    formStatus.textContent = 'Thank you! Your message was sent. I’ll reply soon.';
  } catch {
    /* Keep the visitor's form content and offer a direct email fallback on failure */
    formStatus.classList.add('is-error');
    formStatus.textContent = 'Your message couldn’t be sent. Please try again, or email me at beatrizristau.dev@gmail.com.';
  } finally {
    /* Re-enable the form after either a successful or failed submission */
    submitButton.disabled = false;
    contactForm.removeAttribute('aria-busy');
  }
});
