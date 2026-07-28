(function () {
  "use strict";

  // ---------- Mobile nav toggle ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Scroll-cue button (hero) ----------
  document.querySelectorAll(".scroll-cue").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var section = btn.closest("section");
      var next = section ? section.nextElementSibling : null;
      if (next) next.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  // ---------- Scroll-triggered reveal ----------
  var revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length === 0) return;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  revealItems.forEach(function (el) { observer.observe(el); });
})();
