/**
 * Mahfas Investment Limited — site behavior
 *
 * EMAILJS — replace these three values after creating your EmailJS account:
 * -------------------------------------------------------------------------
 * 1. PUBLIC KEY:  EmailJS Dashboard → Account → API Keys → Public Key
 * 2. SERVICE ID:  Email Services → your service → Service ID
 * 3. TEMPLATE ID: Email Templates → your template → Template ID
 *
 * Your EmailJS template should use these variable names (or update send() below):
 *   {{from_name}}, {{from_email}}, {{message}}
 */

const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector("#site-nav");
  const navLinks = siteNav ? siteNav.querySelectorAll("a[href^='#']") : [];
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Sticky header shadow */
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* Mobile navigation */
  function setNavOpen(open) {
    if (!header || !navToggle) return;
    header.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      setNavOpen(!header.classList.contains("nav-open"));
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setNavOpen(false);
      }
    });
  }

  /* Smooth scroll: native CSS handles behavior; offset for fixed header on programmatic jump optional */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    });
  });

  /* Fade-in on scroll */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* EmailJS contact form */
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn && submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn && submitBtn.querySelector(".btn-loading");
  const nameInput = document.getElementById("from_name");
  const emailInput = document.getElementById("from_email");
  const messageInput = document.getElementById("message");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFormStatus(message, type) {
    if (!statusEl) return;
    statusEl.classList.remove(
      "form-alert--success",
      "form-alert--warning",
      "form-alert--error"
    );
    if (!message) {
      statusEl.textContent = "";
      statusEl.hidden = true;
      statusEl.removeAttribute("role");
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = message;
    if (type === "success") {
      statusEl.classList.add("form-alert--success");
      statusEl.setAttribute("role", "status");
    } else if (type === "warning") {
      statusEl.classList.add("form-alert--warning");
      statusEl.setAttribute("role", "status");
    } else {
      statusEl.classList.add("form-alert--error");
      statusEl.setAttribute("role", "alert");
    }
  }

  function clearFieldValidity() {
    if (nameInput) nameInput.setCustomValidity("");
    if (emailInput) emailInput.setCustomValidity("");
    if (messageInput) messageInput.setCustomValidity("");
  }

  function validateTrimmedFields() {
    clearFieldValidity();
    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const msg = messageInput ? messageInput.value.trim() : "";

    if (!name) {
      nameInput.setCustomValidity("Please enter your name.");
      return false;
    }
    if (!email) {
      emailInput.setCustomValidity("Please enter your email address.");
      return false;
    }
    if (!EMAIL_RE.test(email)) {
      emailInput.setCustomValidity("Please enter a valid email address.");
      return false;
    }
    if (!msg) {
      messageInput.setCustomValidity("Please enter your message.");
      return false;
    }
    if (msg.length < 5) {
      messageInput.setCustomValidity(
        "Please enter at least 5 characters in your message."
      );
      return false;
    }
    return true;
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
    if (btnText) btnText.classList.toggle("is-hidden", loading);
    if (btnLoading) btnLoading.hidden = !loading;
  }

  if (nameInput && emailInput && messageInput) {
    [nameInput, emailInput, messageInput].forEach(function (el) {
      el.addEventListener("input", clearFieldValidity);
    });
  }

  if (form && typeof emailjs !== "undefined") {
    const pk = EMAILJS_PUBLIC_KEY.trim();
    const sid = EMAILJS_SERVICE_ID.trim();
    const tid = EMAILJS_TEMPLATE_ID.trim();
    const configured =
      pk &&
      sid &&
      tid &&
      pk !== "YOUR_PUBLIC_KEY" &&
      sid !== "YOUR_SERVICE_ID" &&
      tid !== "YOUR_TEMPLATE_ID";

    if (configured) {
      emailjs.init({ publicKey: pk });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setFormStatus("", null);

      if (!validateTrimmedFields()) {
        form.reportValidity();
        return;
      }

      if (!configured) {
        console.warn(
          "EmailJS: set EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, and EMAILJS_TEMPLATE_ID in script.js."
        );
        setFormStatus(
          "We couldn’t send your message from this form. Please call or email us directly—we’re happy to help.",
          "warning"
        );
        return;
      }

      const templateParams = {
        from_name: nameInput.value.trim(),
        from_email: emailInput.value.trim(),
        message: messageInput.value.trim(),
      };

      setLoading(true);

      emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {
          setFormStatus(
            "Thank you — your message was sent. We will get back to you soon.",
            "success"
          );
          form.reset();
          clearFieldValidity();
        })
        .catch(function (err) {
          console.error("EmailJS error:", err);
          setFormStatus(
            "Something went wrong. Please try again or email us directly.",
            "error"
          );
        })
        .finally(function () {
          setLoading(false);
        });
    });
  } else if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setFormStatus("", null);
      if (!validateTrimmedFields()) {
        form.reportValidity();
        return;
      }
      console.error("EmailJS: script failed to load from CDN.");
      setFormStatus(
        "We couldn’t send your message from this form. Please call or email us directly—we’re happy to help.",
        "warning"
      );
    });
  }
})();
