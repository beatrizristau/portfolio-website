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

/* Sort the actual card elements so visual and reading order stay aligned. */
const projectGrid = document.getElementById('projects-grid');
const projectSort = document.getElementById('projectSort');
const projectSortStatus = document.getElementById('projectSortStatus');
let sortAscending = false;
const projectCards = [...projectGrid.querySelectorAll('.project-card')].map((card, index) => ({
  card,
  index,
  year: Number(card.querySelector('time')?.dateTime),
}));

function sortProjects(announce = false) {
  const direction = sortAscending ? 1 : -1;
  const sorted = [...projectCards].sort((a, b) => {
    // Undated projects stay at the end; equal years retain their original order.
    if (!Number.isFinite(a.year)) return Number.isFinite(b.year) ? 1 : a.index - b.index;
    if (!Number.isFinite(b.year)) return -1;
    return direction * (a.year - b.year) || a.index - b.index;
  });
  sorted.forEach(({ card }, index) => {
    card.querySelector('.project-index').textContent = String(index + 1).padStart(2, '0');
    projectGrid.append(card);
  });
  if (announce) {
    projectSortStatus.textContent = `Projects sorted by year, ${direction === 1 ? 'oldest' : 'newest'} first.`;
  }
  projectSort.textContent = `Sort by year: ${direction === 1 ? 'oldest' : 'newest'} first`;
  projectSort.setAttribute('aria-pressed', String(sortAscending));
  scheduleScroll();
}

projectSort.addEventListener('click', () => {
  sortAscending = !sortAscending;
  sortProjects(true);
});
sortProjects();
document.getElementById('projectSortControl').hidden = false;

/* Turn the secondary project icon into a share action instead of another repository link. */
document.querySelectorAll('.project-arrow').forEach(shareButton => {
  const projectLink = shareButton.closest('.project-link');
  projectLink.querySelector('.project-link-label')?.remove();
  projectLink.querySelector('.project-link-icons').removeAttribute('aria-hidden');
  const projectTitle = shareButton.closest('.project-card').querySelector('h3').textContent.trim();
  shareButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.3 11 7.4-4.5M8.3 13l7.4 4.5"/></svg>';
  shareButton.setAttribute('role', 'button');
  shareButton.setAttribute('tabindex', '0');
  shareButton.setAttribute('aria-label', `Share ${projectTitle}`);
  const shareProject = async event => {
    event.preventDefault();
    event.stopPropagation();
    const shareData = { title: projectTitle, url: projectLink.href };
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
    shareButton.setAttribute('aria-label', `${projectTitle} link copied`);
  };
  shareButton.addEventListener('click', shareProject);
  shareButton.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      shareProject(event);
    }
  });
});

/* Direct contact modal, with the contact section as a no-JavaScript fallback. */
const talkTrigger = document.getElementById('talkTrigger');
const emailContactTrigger = document.getElementById('emailContactTrigger');
const contactDialog = document.getElementById('contactDialog');
const copyContactEmail = document.getElementById('copyContactEmail');
const emailCopyStatus = document.getElementById('emailCopyStatus');

if (typeof contactDialog.showModal === 'function') {
  const openContactDialog = event => {
    event.preventDefault();
    emailCopyStatus.textContent = '';
    copyContactEmail.textContent = 'Copy';
    contactDialog.showModal();
    document.documentElement.classList.add('contact-dialog-open');
  };
  [talkTrigger, emailContactTrigger].forEach(trigger => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', contactDialog.id);
    trigger.addEventListener('click', openContactDialog);
  });
}

document.getElementById('closeContactDialog').addEventListener('click', () => contactDialog.close());
contactDialog.addEventListener('close', () => {
  document.documentElement.classList.remove('contact-dialog-open');
  talkTrigger.focus({ preventScroll: true });
});

// Close only when both ends of a pointer click are outside the card.
function outsideContactCard(event) {
  const bounds = contactDialog.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom;
}
let contactBackdropPressed = false;
contactDialog.addEventListener('pointerdown', event => {
  contactBackdropPressed = event.target === contactDialog && outsideContactCard(event);
});
contactDialog.addEventListener('click', event => {
  if (contactBackdropPressed && event.target === contactDialog && outsideContactCard(event)) contactDialog.close();
  contactBackdropPressed = false;
});

copyContactEmail.addEventListener('click', async () => {
  copyContactEmail.disabled = true;
  try {
    await navigator.clipboard.writeText(document.getElementById('dialogEmail').textContent.trim());
    if (contactDialog.open) {
      copyContactEmail.textContent = 'Copied!';
      emailCopyStatus.textContent = 'Email address copied.';
    }
  } catch {
    if (contactDialog.open) emailCopyStatus.textContent = 'Copy was unavailable. Select the email address above to copy it manually.';
  } finally {
    copyContactEmail.disabled = false;
  }
});

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
