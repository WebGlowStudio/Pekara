(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var revealables = document.querySelectorAll(".reveal");
  var viewHeight = window.innerHeight || root.clientHeight;

  Array.prototype.forEach.call(revealables, function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < viewHeight * 0.94 && rect.bottom > 0) {
      el.classList.add("in");
    }
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    Array.prototype.forEach.call(revealables, function (el) {
      if (!el.classList.contains("in")) revealObserver.observe(el);
    });
  } else {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add("in");
    });
  }

  var header = document.querySelector(".header");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  var toggleLabel = toggle.querySelector(".sr-only");

  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Otvori meni";
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggleLabel.textContent = "Zatvori meni";
    document.body.classList.add("menu-open");
  }

  toggle.addEventListener("click", function () {
    if (menu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 980) closeMenu();
  });

  var navLinks = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  function spyNav() {
    var current = null;
    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= 130 && rect.bottom > 130) current = section;
    });
    navLinks.forEach(function (link) {
      var on = current && link.getAttribute("href") === "#" + current.id;
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  var scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      header.classList.toggle("scrolled", window.scrollY > 6);
      spyNav();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var chips = document.querySelectorAll(".chip");
  var groups = document.querySelectorAll(".group");
  var filterStatus = document.getElementById("filter-status");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var value = chip.getAttribute("data-filter");
      chips.forEach(function (other) {
        var on = other === chip;
        other.classList.toggle("is-active", on);
        other.setAttribute("aria-pressed", on ? "true" : "false");
      });
      groups.forEach(function (group) {
        var show = value === "sve" || group.getAttribute("data-cat") === value;
        group.hidden = !show;
      });
      filterStatus.textContent = value === "sve"
        ? "Prikazana je cela ponuda."
        : "Prikazana kategorija: " + chip.textContent.trim() + ".";
    });
  });

  var form = document.getElementById("porudzbina-forma");
  var formStatus = document.getElementById("form-status");
  var dateInput = document.getElementById("datum");

  if (dateInput) {
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");
    dateInput.min = today.getFullYear() + "-" + month + "-" + day;
  }

  form.addEventListener("invalid", function () {
    formStatus.hidden = true;
  }, true);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("ime") || "").trim().replace(/\s+/g, " ").slice(0, 48);
    var greeting = name ? "Hvala, " + name + ". " : "Hvala. ";
    formStatus.hidden = false;
    formStatus.textContent = greeting + "Ovo je demo sajt, porudžbina nije poslata i ništa nismo sačuvali. Na pravom sajtu pekare javili bismo vam se da potvrdimo količinu i vreme.";
    form.reset();
    formStatus.focus();
  });

  form.addEventListener("input", function () {
    if (!formStatus.hidden) formStatus.hidden = true;
  });

  var dialog = document.querySelector(".lightbox");
  var lightImg = dialog.querySelector("img");
  var caption = dialog.querySelector(".lightbox-caption");
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var shotIndex = 0;

  function showShot(next) {
    if (!shots.length || typeof dialog.showModal !== "function") return;
    shotIndex = (next + shots.length) % shots.length;
    var shot = shots[shotIndex];
    var img = shot.querySelector("img");
    lightImg.src = shot.getAttribute("data-full") || img.currentSrc || img.src;
    lightImg.alt = img.getAttribute("alt") || "";
    caption.textContent = shot.getAttribute("data-caption") || "";
    if (!dialog.open) dialog.showModal();
  }

  shots.forEach(function (shot, index) {
    shot.addEventListener("click", function () {
      showShot(index);
    });
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", function () {
    dialog.close();
  });

  dialog.querySelectorAll(".lightbox-nav").forEach(function (button) {
    button.addEventListener("click", function () {
      showShot(shotIndex + Number(button.getAttribute("data-dir")));
    });
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showShot(shotIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      showShot(shotIndex - 1);
    }
  });
})();
