/* DOM elements used by the navigation and scroll progress bar */
const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const scrollProgress = document.getElementById('scrollProgress');
const sectionLinks = [...navLinks.querySelectorAll('a')];
const sections = sectionLinks.map(link => document.querySelector(link.hash));
const mobileViewport = window.matchMedia('(max-width: 760px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

/* Hero video controls and reduced-motion support */
const video = document.getElementById('heroVideo');
const videoToggle = document.getElementById('videoToggle');
let motionRequested = !reducedMotion.matches;
let videoVisible = true;
videoToggle.hidden = false;

/* Keep the video button label and icon in sync with the playback state */
function updateVideoButton() {
  const paused = video.paused;
  document.getElementById('videoToggleText').textContent = paused ? 'Play motion' : 'Pause motion';
  document.getElementById('videoToggleIcon').textContent = paused ? '▷' : 'Ⅱ';
  videoToggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
}

/* Play motion only when requested, visible, and allowed by the active tab */
function syncVideo() {
  if (motionRequested && videoVisible && !document.hidden) {
    video.play().catch(updateVideoButton);
  } else video.pause();
}
video.addEventListener('play', updateVideoButton);
video.addEventListener('pause', updateVideoButton);

/* Let the visitor manually play or pause the hero video */
videoToggle.addEventListener('click', () => {
  motionRequested = video.paused;
  syncVideo();
});

/* Respond when the visitor changes their reduced-motion preference */
reducedMotion.addEventListener('change', () => {
  motionRequested = !reducedMotion.matches;
  syncVideo();
});

/* Pause the video when the tab or video leaves view, then resume when appropriate */
document.addEventListener('visibilitychange', syncVideo);
new IntersectionObserver(entries => {
  videoVisible = entries[0].isIntersecting;
  syncVideo();
}, { threshold: 0 }).observe(video);

/* Hide the playback control if the video file cannot be loaded */
video.addEventListener('error', () => { videoToggle.hidden = true; });
video.querySelector('source').addEventListener('error', () => { videoToggle.hidden = true; });

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
