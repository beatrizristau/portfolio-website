/* DOM Elements */
const floatingNav = document.getElementById("floatingNav")
const navToggle = document.getElementById("navToggle")
const mobileMenu = document.getElementById("mobileMenu")
const scrollProgress = document.getElementById("scrollProgress")
const heroCanvas = document.getElementById("heroCanvas")
const contactForm = document.getElementById("contactForm")

/* Track scroll position once */
let currentScrollY;

/* this creates an effect where the floating navigation only appears 
after the user has scrolled down a bit */
function handleFloatingNav() {
  if (currentScrollY > 100) {
    floatingNav.classList.add("visible");
  } else {
    floatingNav.classList.remove("visible");
  }
}

/* creates a progress bar on the top of the page that fills as you scroll down the page */
function handleScrollProgress() {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = (currentScrollY / scrollHeight) * 100;
  scrollProgress.style.width = scrolled + "%";
}

/* scroll event listener */
window.addEventListener("scroll", () => {
  currentScrollY = window.scrollY;
  handleFloatingNav();
  handleScrollProgress();
});

/* Scroll to contact section when Contact Me button is clicked */
document.addEventListener("DOMContentLoaded", () => {
  const contactMeBtn = document.getElementById("contactMeBtn");
  const contactSection = document.getElementById("contact");
  if (contactMeBtn && contactSection) {
    contactMeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      contactSection.scrollIntoView({ behavior: "smooth" });
    });
  }
});

/* mobile menu toggle event listener */
navToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("active")
  const icon = navToggle.querySelector("i")

  if (mobileMenu.classList.contains("active")) {
    icon.className = "fas fa-times"
  } else {
    icon.className = "fas fa-bars"
  }
})

/* When user click on the button to view projects, it will scroll to the projects section */
document.addEventListener("DOMContentLoaded", () => {
  const viewProjectsBtn = document.getElementById("viewProjectsBtn");
  const projectsSection = document.getElementById("projects");
  if (viewProjectsBtn && projectsSection) {
    /* only proceed if both elements exist */
    viewProjectsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      projectsSection.scrollIntoView({ behavior: "smooth" });
    });
  }
});

/* Close mobile menu when clicking on nav links */
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active")
    navToggle.querySelector("i").className = "fas fa-bars"
  })
})

/* Close mobile menu when clicking outside of the menu options */
mobileMenu.addEventListener("click", (e) => {
  if (e.target === mobileMenu) {
    mobileMenu.classList.remove("active")
    navToggle.querySelector("i").className = "fas fa-bars"
  }
})

/* Smooth scrolling for navigation links */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

/* Hero Canvas Animation */
function initHeroCanvas() {
  const canvas = heroCanvas
  const ctx = canvas.getContext("2d")

  // Set canvas size
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  }

  resizeCanvas()
  window.addEventListener("resize", resizeCanvas)

  // Particles
  const particles = []
  const particleCount = 50

  class Particle {
    constructor() {
      this.x = (Math.random() * canvas.width) / window.devicePixelRatio
      this.y = (Math.random() * canvas.height) / window.devicePixelRatio
      this.size = Math.random() * 3 + 1
      this.speedX = Math.random() * 2 - 1
      this.speedY = Math.random() * 2 - 1
      this.hue = Math.random() * 60 + 270 // Purple to pink range
    }

    update() {
      this.x += this.speedX
      this.y += this.speedY

      if (this.x > canvas.width / window.devicePixelRatio || this.x < 0) {
        this.speedX = -this.speedX
      }

      if (this.y > canvas.height / window.devicePixelRatio || this.y < 0) {
        this.speedY = -this.speedY
      }
    }

    draw() {
      ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections
    ctx.strokeStyle = "rgba(139, 92, 246, 0.1)"
    ctx.lineWidth = 1

    for (let i = 0; i < particles.length; i++) {
      for (let j = i; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }

    // Update and draw particles
    particles.forEach((particle) => {
      particle.update()
      particle.draw()
    })

    requestAnimationFrame(animate)
  }

  animate()
}

/* Initialize hero canvas when page loads */
window.addEventListener("load", initHeroCanvas)

/* Intersection Observer for animations */
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

/* skills percentage progress bar animation on load */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible")

      // Animate skill bars
      if (entry.target.classList.contains("skill-card")) {
        const progressBar = entry.target.querySelector(".skill-progress")
        const width = progressBar.getAttribute("data-width")
        setTimeout(() => {
          progressBar.style.width = width + "%"
        }, 200)
      }
    }
  })
}, observerOptions)

/* Observe elements for animation */
document.addEventListener("DOMContentLoaded", () => {
  // Add fade-in class to elements
  const animatedElements = document.querySelectorAll(".glass-card, .skill-card, .project-card, .section-header")
  animatedElements.forEach((el) => {
    el.classList.add("fade-in")
    observer.observe(el)
  })

  // Animate skill bars
  const skillCards = document.querySelectorAll(".skill-card")
  skillCards.forEach((card) => {
    observer.observe(card)
  })
})

/* allows users to close the mobile menu by pressing the escape key */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
    mobileMenu.classList.remove("active")
    navToggle.querySelector("i").className = "fas fa-bars"
  }
})

/* If user clicks on the brand, it redirects user to the top of the page again */
document.querySelector('.nav-brand-link').addEventListener('click', function(e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Display message after contact form is submitted */
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const contactSuccess = document.getElementById("contactSuccess");

  if (contactForm && contactSuccess) {
    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();

      // Check if reCAPTCHA is completed
      const recaptchaResponse = contactForm.querySelector('[name="g-recaptcha-response"]');
      if (!recaptchaResponse || !recaptchaResponse.value) {
        alert("Please complete the reCAPTCHA.");
        return;
      }

      const formData = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending...";

      fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          contactSuccess.style.display = "block";
          contactForm.reset();
          // Reset reCAPTCHA widget
          if (window.grecaptcha) grecaptcha.reset();
        } else {
          alert("Sorry, there was a problem sending your message. Please try again later.");
        }
      })
      .catch(() => {
        alert("Sorry, there was a problem sending your message. Please try again later.");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      });
    });
  }
});