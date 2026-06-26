/* ==========================================================================
   AHMED EL BAZ — PORTFOLIO SCRIPT (v2)
   Vanilla JS only. No dependencies.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointerFine = window.matchMedia("(pointer: fine)").matches;
  var isMobile = window.innerWidth < 768;
  window.addEventListener("resize", function () { isMobile = window.innerWidth < 768; });
  var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };

  /* ---------------------------------------------------------------------
     1. LOADER
     ------------------------------------------------------------------- */
  function initLoader() {
    var loader = document.getElementById("loader");
    if (!loader) return;
    var done = false;
    function hide() {
      if (done) return;
      done = true;
      loader.classList.add("is-done");
    }
    window.addEventListener("load", function () { setTimeout(hide, 650); });
    setTimeout(hide, 2400); // safety net
  }

  /* ---------------------------------------------------------------------
     2. HEADER — border on scroll + light/dark mode over the hero
     ------------------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById("header");
    var hero = document.getElementById("home");
    if (!header) return;
    function update() {
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 12);
      if (hero) {
        var heroH = hero.offsetHeight;
        header.classList.toggle("is-on-dark", y < heroH - 70);
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------------------------------------------------------------------
     3. MOBILE MENU
     ------------------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function open() {
      toggle.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? close() : open();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* ---------------------------------------------------------------------
     4. SCROLL PROGRESS (single top bar across the whole document)
     ------------------------------------------------------------------- */
  function initProgress() {
    var fill = document.getElementById("progressTopFill");
    if (!fill) return;
    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.width = (pct * 100).toFixed(2) + "%";
    }
    function onScroll() { if (!ticking) { ticking = true; raf(update); } }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* ---------------------------------------------------------------------
     5. SCROLL REVEALS (staggered by parent, cinematic "one after another")
     ------------------------------------------------------------------- */
  function initReveals() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    function revealServiceCards(panel, immediate) {
      if (!panel.classList.contains("services-panel")) return;
      panel.querySelectorAll(".service").forEach(function (card, index) {
        setTimeout(function () {
          card.classList.add("is-content-visible");
          if (!immediate && !reduceMotion && card.animate) {
            card.querySelectorAll(".service__meta, .service__content").forEach(function (part) {
              part.animate([
                { opacity: .72, transform: "translateY(14px)" },
                { opacity: 1, transform: "translateY(0)" }
              ], {
                duration: 650,
                easing: "cubic-bezier(.16,1,.3,1)",
                fill: "none"
              });
            });
          }
        }, immediate ? 0 : index * 75);
      });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
        revealServiceCards(el, true);
      });
      return;
    }

    var groups = {};
    items.forEach(function (el) {
      var key = el.parentElement;
      if (!groups[key]) groups[key] = [];
      groups[key].push(el);
    });
    Object.keys(groups).forEach(function (k) {
      groups[k].forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 90, 480) + "ms";
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealServiceCards(entry.target, false);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     6. PARALLAX (brand hero banners) — scroll-scrubbed, desktop/tablet only
     ------------------------------------------------------------------- */
  function initParallax() {
    if (reduceMotion || isMobile) return;
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!items.length) return;

    function update() {
      if (isMobile) { raf(update); return; }
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var factor = parseFloat(el.getAttribute("data-parallax")) || 0.05;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var dist = center - vh / 2;
        var shift = Math.max(-40, Math.min(40, -dist * factor));
        var img = el.querySelector("img");
        if (img) img.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0) scale(1.08)";
      });
      raf(update);
    }
    raf(update);
  }

  /* ---------------------------------------------------------------------
     7. CURSOR FOLLOWER (pointer devices only)
     ------------------------------------------------------------------- */
  function initCursor() {
    if (reduceMotion || !pointerFine) return;
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var active = false;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!active) { active = true; document.body.classList.add("cursor-active"); }
    });

    document.querySelectorAll("[data-cursor-hover]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });

    function tick() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      raf(tick);
    }
    raf(tick);
  }

  /* ---------------------------------------------------------------------
     8. IDENTITY PANEL GLOW
     ------------------------------------------------------------------- */
  function initIdentityPanelGlow() {
    if (reduceMotion || !pointerFine) return;
    var cards = document.querySelectorAll("[data-identity-card], [data-panel-glow]");
    cards.forEach(function (card) {
      var glowFrame = null;
      var glowX = 50;
      var glowY = 50;

      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        glowX = ((e.clientX - rect.left) / rect.width) * 100;
        glowY = ((e.clientY - rect.top) / rect.height) * 100;
        if (glowFrame) return;
        glowFrame = raf(function () {
          card.style.setProperty("--glow-x", glowX.toFixed(2) + "%");
          card.style.setProperty("--glow-y", glowY.toFixed(2) + "%");
          glowFrame = null;
        });
      });

      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--glow-x", "50%");
        card.style.setProperty("--glow-y", "50%");
      });
    });
  }

  /* ---------------------------------------------------------------------
     9. LIVE CLOCK
     ------------------------------------------------------------------- */
  function initClock() {
    var el = document.getElementById("liveClock");
    if (!el) return;
    var formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      hourCycle: "h23"
    });
    function update() {
      var d = new Date();
      el.textContent = formatter.format(d);
      el.setAttribute("datetime", d.toISOString());
    }
    update();
    setInterval(update, 1000);
  }

  /* ---------------------------------------------------------------------
     9. COPY EMAIL
     ------------------------------------------------------------------- */
  function initCopyEmail() {
    var btn = document.getElementById("copyEmail");
    var label = document.getElementById("copyEmailText");
    if (!btn || !label) return;
    var email = btn.getAttribute("data-email");
    var original = label.textContent;

    btn.addEventListener("click", function () {
      function done() {
        label.textContent = "Copied — " + email;
        btn.classList.add("is-copied");
        setTimeout(function () {
          label.textContent = original;
          btn.classList.remove("is-copied");
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  /* ---------------------------------------------------------------------
     10. EXPERIENCE RAIL — drag to scroll + prev/next buttons
     ------------------------------------------------------------------- */
  function setupHorizontalSlider(options) {
    var track = options.track;
    var cards = Array.prototype.slice.call(options.cards || []);
    var prev = options.prev;
    var next = options.next;
    var position = options.position;
    var enabled = options.enabled || function () { return true; };
    if (!track || !cards.length) return;

    var activeIndex = 0;
    var scrollFrame = null;
    var scrollAnimation = null;
    var snapTimer = null;
    var isDragging = false;
    var dragMoved = false;
    var startX = 0;
    var startScroll = 0;

    function paddingLeft() {
      return parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
    }

    function targetFor(index) {
      var rawTarget = Math.max(0, cards[index].offsetLeft - paddingLeft());
      return Math.min(rawTarget, Math.max(0, track.scrollWidth - track.clientWidth));
    }

    function nearestIndex() {
      var closest = 0;
      var distance = Infinity;
      cards.forEach(function (card, index) {
        var delta = Math.abs(track.scrollLeft - targetFor(index));
        if (delta < distance) {
          distance = delta;
          closest = index;
        }
      });
      return closest;
    }

    function animateScrollTo(target) {
      if (scrollAnimation) window.clearInterval(scrollAnimation);
      if (reduceMotion) {
        track.scrollLeft = target;
        updateCards();
        return;
      }

      var start = track.scrollLeft;
      var distance = target - start;
      var startedAt = Date.now();
      var duration = Math.min(560, Math.max(320, Math.abs(distance) * .9));

      scrollAnimation = window.setInterval(function () {
        var progress = Math.min(1, (Date.now() - startedAt) / duration);
        var eased = 1 - Math.pow(1 - progress, 4);
        track.scrollLeft = start + distance * eased;
        updateCards();

        if (progress >= 1) {
          window.clearInterval(scrollAnimation);
          track.scrollLeft = target;
          scrollAnimation = null;
          updateCards();
        }
      }, 16);
    }

    function scrollToIndex(index, smooth) {
      var clamped = Math.max(0, Math.min(cards.length - 1, index));
      var target = targetFor(clamped);
      if (smooth) animateScrollTo(target);
      else {
        track.scrollLeft = target;
        updateCards();
      }
    }

    function snapToNearest() {
      if (enabled()) scrollToIndex(nearestIndex(), true);
    }

    function updateCards() {
      scrollFrame = null;
      if (!enabled()) {
        cards.forEach(function (card) {
          card.classList.remove("is-active");
          card.removeAttribute("aria-current");
          card.style.removeProperty("--slide-depth");
          card.style.removeProperty("--slide-scale");
          card.style.removeProperty("--slide-opacity");
          card.style.removeProperty("--slide-content-x");
          card.style.removeProperty("--service-depth");
          card.style.removeProperty("--service-scale");
          card.style.removeProperty("--service-opacity");
        });
        if (prev) prev.disabled = true;
        if (next) next.disabled = true;
        return;
      }

      activeIndex = nearestIndex();
      var trackRect = track.getBoundingClientRect();
      var focusX = trackRect.left + cards[activeIndex].getBoundingClientRect().width / 2;

      cards.forEach(function (card, index) {
        var rect = card.getBoundingClientRect();
        var normalized = Math.max(-1, Math.min(1, ((rect.left + rect.width / 2) - focusX) / Math.max(trackRect.width * .65, 1)));
        var distance = Math.abs(normalized);
        var active = index === activeIndex;

        card.classList.toggle("is-active", active);
        if (active) card.setAttribute("aria-current", options.currentValue || "true");
        else card.removeAttribute("aria-current");

        if (options.depth === "career" && !reduceMotion) {
          card.style.setProperty("--slide-depth", (distance * 10 - (active ? 4 : 0)).toFixed(2) + "px");
          card.style.setProperty("--slide-scale", (1 - distance * .032).toFixed(4));
          card.style.setProperty("--slide-opacity", (1 - distance * .17).toFixed(3));
          card.style.setProperty("--slide-content-x", (-normalized * 6).toFixed(2) + "px");
        } else if (options.depth === "services" && !reduceMotion) {
          card.style.setProperty("--service-depth", (distance * 9 - (active ? 4 : 0)).toFixed(2) + "px");
          card.style.setProperty("--service-scale", (1 - distance * .03).toFixed(4));
          card.style.setProperty("--service-opacity", (1 - distance * .17).toFixed(3));
        }
      });

      if (position) {
        position.textContent = options.label + " " + String(activeIndex + 1).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0");
      }
      if (prev) prev.disabled = activeIndex === 0;
      if (next) next.disabled = activeIndex === cards.length - 1;
    }

    function requestUpdate() {
      if (scrollFrame) return;
      scrollFrame = raf(updateCards);
    }

    track.addEventListener("pointerdown", function (e) {
      if (!enabled()) return;
      if (scrollAnimation) window.clearInterval(scrollAnimation);
      scrollAnimation = null;
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      var delta = e.clientX - startX;
      if (Math.abs(delta) > 3) dragMoved = true;
      track.scrollLeft = startScroll - delta;
      e.preventDefault();
    });

    function finishDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove("is-dragging");
      if (e && track.hasPointerCapture && track.hasPointerCapture(e.pointerId)) {
        track.releasePointerCapture(e.pointerId);
      }
      if (dragMoved) snapToNearest();
    }
    track.addEventListener("pointerup", finishDrag);
    track.addEventListener("pointercancel", finishDrag);

    track.addEventListener("click", function (e) {
      if (!dragMoved) return;
      e.preventDefault();
      e.stopPropagation();
      dragMoved = false;
    }, true);

    track.addEventListener("wheel", function (e) {
      if (!enabled()) return;
      var amount = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      var maxScroll = track.scrollWidth - track.clientWidth;
      var canMove = (amount > 0 && track.scrollLeft < maxScroll - 2) || (amount < 0 && track.scrollLeft > 2);
      if (!canMove) return;

      e.preventDefault();
      if (scrollAnimation) window.clearInterval(scrollAnimation);
      scrollAnimation = null;
      track.scrollLeft += amount;
      updateCards();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToNearest, 140);
    }, { passive: false });

    if (prev) prev.addEventListener("click", function () {
      scrollToIndex(activeIndex - 1, true);
    });
    if (next) next.addEventListener("click", function () {
      scrollToIndex(activeIndex + 1, true);
    });

    track.setAttribute("tabindex", "0");
    track.addEventListener("keydown", function (e) {
      if (!enabled() || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      e.preventDefault();
      scrollToIndex(activeIndex + (e.key === "ArrowRight" ? 1 : -1), true);
    });

    track.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateCards();
  }

  function initRail() {
    setupHorizontalSlider({
      track: document.getElementById("experienceTrack"),
      cards: document.querySelectorAll("#experienceTrack .rail__card"),
      prev: document.getElementById("railPrev"),
      next: document.getElementById("railNext"),
      position: document.getElementById("railPosition"),
      label: "Role",
      currentValue: "step",
      depth: "career"
    });
  }

  function initServicesSlider() {
    var mobileServices = window.matchMedia("(max-width: 640px)");
    setupHorizontalSlider({
      track: document.getElementById("servicesTrack"),
      cards: document.querySelectorAll("#servicesTrack .service"),
      prev: document.getElementById("servicesPrev"),
      next: document.getElementById("servicesNext"),
      position: document.getElementById("servicesPosition"),
      label: "Service",
      depth: "services",
      enabled: function () { return mobileServices.matches; }
    });
  }

  function initPortfolioCarousel() {
    var carousel = document.getElementById("portfolioCarousel");
    var track = document.getElementById("portfolioTrack");
    var prev = document.getElementById("portfolioPrev");
    var next = document.getElementById("portfolioNext");
    var counter = document.getElementById("portfolioCounter");
    var dotsRoot = document.getElementById("portfolioDots");
    if (!carousel || !track) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll("[data-portfolio-card]"));
    if (!cards.length) return;

    var activeIndex = 0;
    var autoplayTimer = null;
    var resumeTimer = null;
    var isHovering = false;
    var isFocused = false;
    var isInteracting = false;
    var isDragging = false;
    var suppressClick = false;
    var startX = 0;
    var startY = 0;
    var dragX = 0;
    var dots = [];

    function modulo(value) {
      return (value + cards.length) % cards.length;
    }

    function classFor(index) {
      var relative = modulo(index - activeIndex);
      if (relative === 0) return "is-active";
      if (relative === 1) return "is-next";
      if (relative === cards.length - 1) return "is-prev";
      if (relative === 2) return "is-far-next";
      if (relative === cards.length - 2) return "is-far-prev";
      return "is-hidden";
    }

    function render() {
      cards.forEach(function (card, index) {
        card.classList.remove("is-active", "is-prev", "is-next", "is-far-prev", "is-far-next", "is-hidden");
        var state = classFor(index);
        var active = state === "is-active";
        card.classList.add(state);
        card.setAttribute("aria-hidden", state === "is-hidden" ? "true" : "false");
        if (active) card.setAttribute("aria-current", "true");
        else card.removeAttribute("aria-current");
        card.tabIndex = active ? 0 : -1;
      });

      dots.forEach(function (dot, index) {
        var active = index === activeIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });

      if (counter) {
        counter.textContent = String(activeIndex + 1).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0");
      }
    }

    function clearAutoplay() {
      if (autoplayTimer) window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    function canAutoplay() {
      return !reduceMotion && !isHovering && !isFocused && !isInteracting && !document.hidden;
    }

    function scheduleAutoplay(delay) {
      clearAutoplay();
      if (!canAutoplay()) return;
      autoplayTimer = window.setTimeout(function () {
        goTo(activeIndex + 1, false);
      }, delay || 4000);
    }

    function pauseForInteraction() {
      isInteracting = true;
      clearAutoplay();
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () {
        isInteracting = false;
        scheduleAutoplay(4000);
      }, 1800);
    }

    function goTo(index, userInitiated) {
      activeIndex = modulo(index);
      render();
      if (userInitiated) pauseForInteraction();
      else scheduleAutoplay(4000);
    }

    cards.forEach(function (card, index) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "portfolio-carousel__dot";
      dot.setAttribute("aria-label", "Show category " + String(index + 1).padStart(2, "0"));
      dot.setAttribute("data-cursor-hover", "");
      dot.addEventListener("click", function () { goTo(index, true); });
      if (dotsRoot) dotsRoot.appendChild(dot);
      dots.push(dot);
    });

    if (prev) prev.addEventListener("click", function () { goTo(activeIndex - 1, true); });
    if (next) next.addEventListener("click", function () { goTo(activeIndex + 1, true); });

    carousel.addEventListener("mouseenter", function () {
      isHovering = true;
      clearAutoplay();
    });
    carousel.addEventListener("mouseleave", function () {
      isHovering = false;
      if (!isDragging) scheduleAutoplay(4000);
    });
    carousel.addEventListener("focusin", function () {
      isFocused = true;
      clearAutoplay();
    });
    carousel.addEventListener("focusout", function () {
      window.setTimeout(function () {
        isFocused = carousel.contains(document.activeElement);
        if (!isFocused) scheduleAutoplay(4000);
      }, 0);
    });
    carousel.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      goTo(activeIndex + (e.key === "ArrowRight" ? 1 : -1), true);
    });

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isDragging = true;
      suppressClick = false;
      startX = e.clientX;
      startY = e.clientY;
      dragX = 0;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
      pauseForInteraction();
    });

    track.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      var deltaX = e.clientX - startX;
      var deltaY = e.clientY - startY;
      if (Math.abs(deltaX) < Math.abs(deltaY) && Math.abs(deltaX) < 12) return;
      dragX = Math.max(-130, Math.min(130, deltaX));
      if (Math.abs(dragX) > 5) suppressClick = true;
      carousel.style.setProperty("--deck-drag", dragX.toFixed(1) + "px");
      e.preventDefault();
    });

    function finishDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove("is-dragging");
      if (e && track.hasPointerCapture && track.hasPointerCapture(e.pointerId)) {
        track.releasePointerCapture(e.pointerId);
      }
      carousel.style.setProperty("--deck-drag", "0px");
      if (Math.abs(dragX) > 42) {
        goTo(activeIndex + (dragX < 0 ? 1 : -1), true);
      } else {
        render();
      }
      dragX = 0;
    }

    track.addEventListener("pointerup", finishDrag);
    track.addEventListener("pointercancel", finishDrag);
    track.addEventListener("click", function (e) {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    }, true);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearAutoplay();
      else scheduleAutoplay(4000);
    });

    render();
    scheduleAutoplay(4000);
  }

  /* ---------------------------------------------------------------------
     11. HERO MOTION — intro scale-settle + scroll-scrubbed parallax/fade
     ------------------------------------------------------------------- */
  function initHeroMotion() {
    var img = document.getElementById("heroImg");
    var content = document.getElementById("heroContent");
    var hero = document.getElementById("home");
    var role = document.getElementById("heroRole");
    var cta = document.getElementById("heroCta");
    if (!img || !hero) return;

    // sequence the subtitle/CTA in shortly after the title's mask-reveal starts
    setTimeout(function () {
      if (role) role.classList.add("is-visible");
    }, 450);
    setTimeout(function () {
      if (cta) cta.classList.add("is-visible");
    }, 560);

    if (reduceMotion) {
      img.style.transform = "scale(1)";
      return;
    }

    var introStart = null;
    var introDur = 1300;
    function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }

    function frame(now) {
      if (introStart === null) introStart = now;
      var t = Math.min(1, (now - introStart) / introDur);
      var scale = 1.08 - 0.08 * easeOutQuint(t);

      var scrollShift = 0, contentOpacity = 1, contentY = 0;
      if (!isMobile) {
        var heroH = hero.offsetHeight;
        var y = window.scrollY;
        scrollShift = Math.min(heroH * 0.18, y * 0.18);
        var fadeRatio = Math.min(1, y / (heroH * 0.62));
        contentOpacity = 1 - fadeRatio;
        contentY = -fadeRatio * 36;
      }

      img.style.transform = "scale(" + scale.toFixed(4) + ") translateY(" + (-scrollShift).toFixed(1) + "px)";
      if (content) {
        content.style.opacity = contentOpacity.toFixed(3);
        content.style.transform = "translateY(" + contentY.toFixed(1) + "px)";
      }

      // keeps running for the page's lifetime to drive the scroll-scrubbed
      // parallax/fade above — cost is negligible (a few arithmetic ops/frame)
      raf(frame);
    }
    raf(frame);
  }

  /* ---------------------------------------------------------------------
     12. MAGNETIC CURSOR PULL (desktop only, subtle) — nav links + hero CTAs
     ------------------------------------------------------------------- */
  function initMagnetic() {
    if (reduceMotion || !pointerFine || isMobile) return;
    var items = document.querySelectorAll("[data-magnetic]");
    items.forEach(function (el) {
      var isButton = el.classList.contains("btn");
      var raf_id = null;
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var px = e.clientX - (rect.left + rect.width / 2);
        var py = e.clientY - (rect.top + rect.height / 2);
        var pull = 0.22, maxOff = 7;
        var tx = Math.max(-maxOff, Math.min(maxOff, px * pull));
        var ty = Math.max(-maxOff, Math.min(maxOff, py * pull)) - (isButton ? 2 : 0);
        if (raf_id) return;
        raf_id = raf(function () {
          el.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px)";
          raf_id = null;
        });
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------------------------------------------------------------
     12. MOUSE TILT (desktop) — cards & gallery tiles
     ------------------------------------------------------------------- */
  function initTilt() {
    if (reduceMotion || !pointerFine) return;
    var items = document.querySelectorAll("[data-tilt]");
    items.forEach(function (el) {
      var raf_id = null;
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf_id) return;
        raf_id = raf(function () {
          var rx = (-py * 6).toFixed(2);
          var ry = (px * 7).toFixed(2);
          el.style.transform = "perspective(700px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateZ(0)";
          raf_id = null;
        });
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  /* ---------------------------------------------------------------------
     13. INIT
     ------------------------------------------------------------------- */

  /* =====================================================================
     14. BILINGUAL i18n — Arabic / English toggle
     ===================================================================== */
  function initI18n() {

    var translations = {
      en: {
        /* Nav */
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.portfolio': 'Portfolio',
        'nav.contact': 'Contact',
        'mobile.location': 'Mansoura, Egypt \u2014 open to new projects',
        /* Hero */
        'hero.eyebrow': 'Portfolio \u2014 2026',
        'hero.role': 'Graphic Designer & Art Director',
        'hero.cta.primary': 'View Portfolio',
        'hero.cta.secondary': 'About Me',
        /* About */
        'about.eyebrow': 'About \u2014 01',
        'about.headline': 'Seven years turning briefs into visual systems that hold together.',
        'about.role': 'Graphic Designer & Art Director',
        'about.intro.p1': 'Ahmed El Baz is a graphic designer and art director based in Egypt, working across branding, social media design, campaign visuals, e\u2011commerce design, print, and illustration. His process starts with the market and the audience, not the canvas \u2014 understanding who a brand is speaking to before a single shape gets drawn.',
        'about.intro.p2': 'Over the past seven years he has led creative teams and shaped visual direction for clients across Saudi Arabia, Egypt, and Europe, balancing aesthetics, function, and the kind of attention to detail that keeps a brand consistent at scale.',
        /* Identity panel */
        'identity.panel.heading': 'Art Director Identity Panel',
        'identity.social.eyebrow': 'Selected channels',
        'identity.social.label': 'Social / Contact',
        'identity.social.heading': 'Start a creative conversation.',
        'identity.social.desc': 'For commissions, collaborations, and art direction enquiries.',
        'social.behance': 'Behance',
        'social.linkedin': 'LinkedIn',
        'social.whatsapp': 'WhatsApp',
        'identity.location.label': 'Location',
        'identity.location.value': 'Mansoura, Egypt',
        'identity.location.note': 'Working across local and international markets',
        'identity.time.label': 'Local Time',
        'identity.time.note': 'Cairo time / Africa',
        'identity.availability.label': 'Availability',
        'identity.availability.value': 'Open for new projects',
        'identity.availability.note': 'Brand identity, campaigns, and art direction',
        'identity.panel.footer.left': 'Mansoura \u2014 Cairo Time',
        'identity.panel.footer.right': 'Graphic Design / Art Direction',
        /* Tools */
        'about.tools.label': 'Tools',
        /* Career */
        'career.headline': 'Six roles, one throughline.',
        'career.hint': 'Drag, scroll, or use the arrows',
        'career.panel.heading': 'Career Archive',
        'career.label': 'Role',
        'role01.title': 'Graphic Designer',
        'role01.org': 'Prestige Advertising & Publicity Office, Mansoura',
        'role01.desc': 'Designed advertising and promotional material for local businesses, working across print and early brand campaigns.',
        'role02.title': 'Graphic Designer \u00b7 Remote',
        'role02.org': 'Community Service & Environmental Development Office, Mansoura University',
        'role02.desc': 'Produced educational and awareness campaign visuals, plus promotional material for university events.',
        'role03.title': 'Graphic Designer',
        'role03.org': 'Methaq Company, Mansoura',
        'role03.desc': 'Designed social media campaigns and branding material across multiple client accounts.',
        'role04.title': 'Graphic Designer \u00b7 Remote',
        'role04.org': 'Frenzy Ice Cream Company',
        'role04.desc': 'Developed social and promotional visuals aligned with a single, consistent brand identity.',
        'role05.title': 'Graphic Designer',
        'role05.org': 'PLAN Marketing Company, Mansoura',
        'role05.desc': 'Built social and advertising visuals for clients across several industries, each tailored to its own audience.',
        'role06.title': 'Graphic Designer & Team Leader',
        'role06.org': 'GOSERVE Digital Marketing, Talkha',
        'role06.desc': 'Leading the design team \u2014 e\u2011commerce banners and social campaigns for Saudi, Egyptian, and European markets, with a focus on brand consistency at scale.',
        /* Services */
        'services.headline': 'Where I can help.',
        'services.panel.heading': 'Creative Practice',
        'services.panel.subheading': 'Selected Capabilities / 01\u201406',
        'service01.label': 'Identity Systems',
        'service01.title': 'Brand Identity',
        'service01.desc': 'Wordmarks, systems, and guidelines built to stay consistent as a brand grows.',
        'service02.label': 'Content Systems',
        'service02.title': 'Social Media Systems',
        'service02.desc': 'Templated, on\u2011brand visual systems that keep a content calendar moving without losing polish.',
        'service03.label': 'Visual Direction',
        'service03.title': 'Campaign Art Direction',
        'service03.desc': 'Concept\u2011to\u2011execution direction for campaigns that need a clear visual point of view.',
        'service04.label': 'Commerce',
        'service04.title': 'E\u2011commerce Visual Design',
        'service04.desc': 'Banners, product layouts, and storefront visuals tuned for conversion and consistency.',
        'service05.label': 'Physical Design',
        'service05.title': 'Print & Packaging',
        'service05.desc': 'Material\u2011aware design for packaging and collateral \u2014 work that has to hold up in the hand.',
        'service06.label': 'Image Making',
        'service06.title': 'Illustration',
        'service06.desc': 'Custom illustration and visual storytelling for brands that need a distinct, drawn voice.',
        'services.panel.footer.left': 'Graphic Design / Art Direction',
        'services.panel.footer.right': 'Systems built to hold together',
        'services.label': 'Service',
        /* Portfolio */
        'portfolio.eyebrow': 'Portfolio \u2014 02',
        'portfolio.headline': 'Five ways to work together.',
        'portfolio.intro': 'Browse by category \u2014 each one opens into full case studies.',
        'portfolio.carousel.heading': 'Category Index',
        'portfolio.carousel.subheading': 'Curated Work / 01\u201405',
        'portfolio.cat.label': 'Category',
        'portfolio.cat.logo': 'Logo Design',
        'portfolio.cat.logo.desc': 'Marks built to work small, large, and in one colour.',
        'portfolio.cat.social': 'Social Media',
        'portfolio.cat.social.desc': 'Content systems that keep a calendar moving without losing polish.',
        'portfolio.cat.vi': 'Visual Identity',
        'portfolio.cat.vi.desc': 'Full identity systems that hold together across every surface.',
        'portfolio.cat.banners': 'Banners & Print',
        'portfolio.cat.banners.desc': 'Material\u2011aware design for packaging, signage, and print.',
        'portfolio.cat.art': 'Art',
        'portfolio.cat.art.desc': 'Illustration and visual studies, made for their own sake.',
        /* Logo case */
        'case.back': '\u2190 All Categories',
        'logo.eyebrow': 'Portfolio - Logo Design',
        'logo.headline': 'Logo Design Case Studies',
        'logo.overview': 'A focused collection of logo and brand mark projects across digital marketing, fashion, and food branding.',
        'logo.group.digital': 'Digital Marketing',
        'logo.group.abaya': 'Abaya Stores',
        'logo.group.dairy': 'Dairy Store',
        'logo.plan.category': 'Digital Marketing Company',
        'logo.plan.desc': 'A strategic mark built around focus, planning, and measured progress.',
        'logo.trend.category': 'Digital Marketing Company',
        'logo.trend.desc': 'Custom Arabic lettering shaped for speed, visibility, and social movement.',
        'logo.goserv.category': 'Digital Marketing Company',
        'logo.goserv.desc': 'A direct wordmark for fast, simple, and reliable service delivery.',
        'logo.ebdea.category': 'Digital Marketing Company',
        'logo.ebdea.desc': 'A friendly creative-agency identity built around ideas and expression.',
        'logo.amira.category': 'Abaya Store',
        'logo.amira.desc': 'A refined fashion mark with royal cues and modest luxury.',
        'logo.rozan.category': 'Abaya Store',
        'logo.rozan.desc': 'A bilingual fashion identity with floral softness and cultural elegance.',
        'logo.natural.category': 'Dairy Store',
        'logo.natural.desc': 'A fresh dairy mark that communicates purity, trust, and farm quality.',
        'logo.case.factlabel1': 'Brand category',
        'logo.case.factlabel2': 'Project type',
        'logo.case.h4.overview': 'Project overview',
        'logo.case.h4.challenge': 'Design challenge',
        'logo.case.h4.concept': 'Creative concept',
        'logo.case.h4.execution': 'Visual execution',
        'logo.case.h4.applications': 'Suggested applications',
        'logo.case.h4.caption': 'Portfolio caption',
        'logo.case.plan.type': 'Logo Design / Brand Identity',
        'logo.case.plan.p1': 'Plan needed a clear, strategic identity that could feel organized and confident across digital touchpoints.',
        'logo.case.plan.p2': 'The mark had to communicate strategy and focus without becoming too corporate or complex at small sizes.',
        'logo.case.plan.p3': 'The letter P becomes a bold circular mark suggesting focus and targeting, while the lower horizontal elements suggest steps, planning, and progress.',
        'logo.case.plan.p4': 'Clean geometry, strong contrast, and a balanced construction give the identity a disciplined digital-first presence.',
        'logo.case.plan.p5': 'Social media avatars, strategy decks, campaign proposals, digital ads, presentation covers, and brand stationery.',
        'logo.case.plan.p6': 'A focused identity system for a marketing brand built around clarity, planning, and forward motion.',
        'logo.case.plan.mockup1': 'Social avatar',
        'logo.case.plan.mockup2': 'Strategy deck',
        'logo.case.plan.mockup3': 'Stationery',
        'logo.case.trend.type': 'Arabic Logo Design / Digital Identity',
        'logo.case.trend.p1': 'Trend is positioned for social media and digital visibility, with an identity that needs to feel active, current, and culturally relevant.',
        'logo.case.trend.p2': 'The Arabic lettering needed to carry personality and movement while staying readable across fast-scrolling digital placements.',
        'logo.case.trend.p3': 'The custom Arabic lettering creates movement and reflects the fast-changing nature of trends, giving the logo a sense of speed and visibility.',
        'logo.case.trend.p4': 'Dynamic letterforms, compact rhythm, and confident spacing create a flexible wordmark with a strong social-media personality.',
        'logo.case.trend.p5': 'Social profile images, reels covers, campaign openers, motion graphics, digital banners, and content templates.',
        'logo.case.trend.p6': 'An Arabic digital identity shaped to move quickly, read clearly, and stay relevant in trend-led communication.',
        'logo.case.trend.mockup1': 'Reels cover',
        'logo.case.trend.mockup2': 'Motion intro',
        'logo.case.trend.mockup3': 'Profile mark',
        'logo.case.goserv.type': 'Wordmark Logo Design',
        'logo.case.goserv.p1': 'GoServ needed a simple, recognizable wordmark for a service-driven brand with a practical digital presence.',
        'logo.case.goserv.p2': 'The identity had to look quick and dependable without relying on decorative symbols or complicated brand elements.',
        'logo.case.goserv.p3': 'The bold uppercase wordmark gives the brand strong visibility and a direct digital-first personality built around speed, simplicity, and reliability.',
        'logo.case.goserv.p4': 'Heavy letter weight, compact proportions, and clear spacing keep the wordmark readable across web, app, and advertising formats.',
        'logo.case.goserv.p5': 'App headers, service dashboards, social ads, delivery graphics, proposal templates, and signage.',
        'logo.case.goserv.p6': 'A straightforward service wordmark designed for quick recognition and confident digital use.',
        'logo.case.goserv.mockup1': 'App header',
        'logo.case.goserv.mockup2': 'Service ad',
        'logo.case.goserv.mockup3': 'Signage',
        'logo.case.ebdea.type': 'Creative Agency Logo Design',
        'logo.case.ebdea.p1': 'Ebdea needed an approachable creative-agency identity that could communicate imagination, conversation, and visual production.',
        'logo.case.ebdea.p2': 'The logo had to feel expressive and creative while remaining professional enough for client-facing agency work.',
        'logo.case.ebdea.p3': 'The stylized lowercase e and flowing typography create a friendly creative-agency feeling connected to ideas, communication, and creative energy.',
        'logo.case.ebdea.p4': 'Rounded forms, fluid curves, and a compact symbol-to-wordmark relationship give the identity warmth and visual confidence.',
        'logo.case.ebdea.p5': 'Agency profiles, creative proposals, social media templates, campaign presentations, merch, and motion stings.',
        'logo.case.ebdea.p6': 'A warm agency logo that turns creative energy into a clear and memorable visual voice.',
        'logo.case.ebdea.mockup1': 'Proposal cover',
        'logo.case.ebdea.mockup2': 'Social kit',
        'logo.case.ebdea.mockup3': 'Motion sting',
        'logo.case.amira.type': 'Fashion Logo Design',
        'logo.case.amira.p1': 'Amira required a boutique fashion identity that could express elegance, femininity, and a premium modestwear tone.',
        'logo.case.amira.p2': 'The brand needed to feel luxurious without becoming overly ornate, and refined without losing softness.',
        'logo.case.amira.p3': 'The royal-inspired symbol supports the meaning of the name Amira and creates a premium fashion identity rooted in modest luxury.',
        'logo.case.amira.p4': 'Elegant line work, balanced symmetry, and refined typography create a mark that feels polished for boutique retail.',
        'logo.case.amira.p5': 'Garment tags, boutique signage, shopping bags, packaging seals, social posts, and embroidery details.',
        'logo.case.amira.p6': 'A premium abaya-store identity shaped around feminine refinement and royal elegance.',
        'logo.case.amira.mockup1': 'Garment tag',
        'logo.case.amira.mockup2': 'Shopping bag',
        'logo.case.amira.mockup3': 'Packaging seal',
        'logo.case.rozan.type': 'Arabic / English Fashion Identity',
        'logo.case.rozan.p1': 'Rozan needed a bilingual fashion identity that could connect Arabic elegance with a modern boutique voice.',
        'logo.case.rozan.p2': 'The logo had to balance emotion and readability across Arabic and English, while still feeling soft and fashion-focused.',
        'logo.case.rozan.p3': 'The floral symbol adds softness and beauty, while the bilingual Arabic/English structure gives the logo both emotion and readability.',
        'logo.case.rozan.p4': 'Graceful floral geometry, delicate line balance, and a clear bilingual lockup create cultural refinement without sacrificing clarity.',
        'logo.case.rozan.p5': 'Storefront signage, garment labels, packaging cards, Instagram highlights, boutique tags, and seasonal lookbooks.',
        'logo.case.rozan.p6': 'A bilingual abaya identity that combines softness, Arabic elegance, and modern boutique clarity.',
        'logo.case.rozan.mockup1': 'Storefront',
        'logo.case.rozan.mockup2': 'Garment label',
        'logo.case.rozan.mockup3': 'Lookbook',
        'logo.case.natural.type': 'Food / Dairy Logo Design',
        'logo.case.natural.p1': 'Natural Pure needed a food identity that could quickly communicate freshness, purity, farm-based quality, and trust.',
        'logo.case.natural.p2': 'The logo had to feel natural and approachable while making the dairy category instantly clear to customers.',
        'logo.case.natural.p3': 'The cow-inspired symbol connects instantly to dairy products, while the rounded form creates a friendly and natural impression.',
        'logo.case.natural.p4': 'Soft rounded geometry, fresh color contrast, and a clear symbol-wordmark relationship make the identity easy to recognize on shelves and screens.',
        'logo.case.natural.p5': 'Milk bottles, yogurt cups, shop signage, delivery bags, menu boards, labels, and social product posts.',
        'logo.case.natural.p6': 'A friendly dairy logo built to communicate freshness, purity, and everyday trust.',
        'logo.case.natural.mockup1': 'Milk bottle',
        'logo.case.natural.mockup2': 'Shop sign',
        'logo.case.natural.mockup3': 'Product label',
        'logo.nav.prev': '\u2190 Art',
        'logo.nav.next': 'Social Media \u2192',
        /* Social Media */
        'social.eyebrow': 'Portfolio \u2014 Social Media',
        'social.headline': 'Social Media Systems',
        'social.overview': 'Five brands, five different rhythms \u2014 each with its own Instagram system built to stay consistent at scale.',
        'social.plan.tag': 'Marketing & Strategy',
        'social.plan.overview': 'A coordinated Instagram campaign built on a bold blue identity and oversized Arabic typography \u2014 translating strategy, growth, and conversion into a connected social grid.',
        'social.luvia.tag': 'Skincare \u00b7 Haircare \u00b7 Sun\u2011care',
        'social.luvia.overview': 'A premium, flexible social system for a skincare and haircare label \u2014 botanical greens, clean whites, and warm sunscreen\u2011orange accents built around hero product compositions.',
        'social.palmhills.tag': 'Hospitality & Real Estate',
        'social.palmhills.overview': 'A hospitality campaign built around a private villa experience \u2014 architectural photography, sea and pool visuals, and warm gold accents positioning the resort as luxurious yet approachable.',
        'social.ebdea.tag': 'Digital Marketing Agency',
        'social.ebdea.overview': 'A golden\u2011toned campaign for a digital marketing agency \u2014 bold Arabic typography, Saudi cultural cues, and seasonal Ramadan & Eid content built around attention, visibility, and growth.',
        'social.salla.tag': 'E\u2011commerce Platform',
        'social.salla.overview': 'A sky\u2011blue and orange campaign for an e\u2011commerce platform \u2014 seasonal Saudi content paired with growth and conversion messaging built for store owners.',
        'social.nav.prev': '\u2190 Logo Design',
        'social.nav.next': 'Visual Identity \u2192',
        /* Visual Identity */
        'vi.eyebrow': 'Portfolio \u2014 Visual Identity',
        'vi.meta.brand': 'Brand',
        'vi.meta.industry': 'Industry',
        'vi.meta.scope': 'Scope',
        'vi.meta.scopeval': 'Logo, packaging, product labels, mockups, social media, campaign visuals',
        'vi.meta.role': 'Role',
        'vi.meta.roleval': 'Graphic Design / Art Direction / Brand Applications',
        'vi.overview': 'A complete skincare visual system built around natural ingredients, freshness, product clarity, and premium green beauty aesthetics.',
        'vi.kicker1': 'Brand Overview',
        'vi.h3.1': 'LUVIA as a natural care system',
        'vi.p1': 'LUVIA is presented as a natural skincare and haircare brand with a clean botanical direction. The identity uses deep green tones, leaf-inspired visuals, white space, product-focused layouts, and fresh organic imagery to communicate purity, care, and trust.',
        'vi.kicker2': 'Logo System',
        'vi.h3.2': 'A refined serif wordmark with a botanical mark',
        'vi.p2': 'The logo combines a premium wordmark with a leaf symbol, giving the brand a natural, elegant, and skincare-focused identity across light and dark applications.',
        'vi.logo.caption1': 'Primary green logo',
        'vi.logo.caption2': 'White logo for dark green applications',
        'vi.kicker3': 'Visual Language',
        'vi.h3.3': 'Botanical, fresh, commercial',
        'vi.token1': 'Deep botanical green palette',
        'vi.token2': 'Clean white space',
        'vi.token3': 'Leaf patterns and natural ingredient cues',
        'vi.token4': 'Water, freshness, and glow textures',
        'vi.token5': 'Soft product lighting',
        'vi.token6': 'Arabic and English campaign flexibility',
        'vi.atm1': 'Macro leaves', 'vi.atm2': 'Water droplets', 'vi.atm3': 'Natural herbs',
        'vi.atm4': 'Hair texture', 'vi.atm5': 'Clean shelf', 'vi.atm6': 'Soft green background',
        'vi.kicker4': 'Product Label Design',
        'vi.h3.4': 'From identity to product information',
        'vi.p4': 'This stage shows how the identity becomes a functional product label, balancing logo visibility, product name, ingredient information, usage instructions, and packaging hierarchy.',
        'vi.kicker5': 'Packaging Development',
        'vi.h3.5': 'Blank mockup system to branded product family',
        'vi.p5': 'The blank mockup establishes the product family structure, while the branded version applies the green LUVIA identity consistently across bottles, jars, serum containers, and skincare packaging.',
        'vi.caption.blank': 'Blank mockup system',
        'vi.caption.branded': 'LUVIA branded packaging mockup',
        'vi.kicker6': 'Finished Packaging',
        'vi.h3.6': 'Polished commercial product presentation',
        'vi.p6': 'The finished packaging presentation shows the brand in a polished commercial context, using green light, white packaging, and product arrangement to create a premium skincare look.',
        'vi.kicker7': 'Digital Presence',
        'vi.h3.7': 'Social media identity',
        'vi.p7': 'The social media direction keeps the logo visible and clean, translating the brand identity into Instagram and Facebook-style touchpoints.',
        'vi.kicker8': 'Campaign Visuals',
        'vi.h3.8': 'Product benefit, shine, freshness, and beauty care',
        'vi.p8': 'These visuals combine product photography, botanical elements, Arabic copy, and strong green brand consistency to keep the campaign world recognizable.',
        'vi.kicker9': 'Seasonal Campaigns',
        'vi.h3.9': 'Promotional energy without losing the brand',
        'vi.p9': 'The seasonal campaign visuals show how the brand can adapt to special promotional moments while the green LUVIA system stays recognizable.',
        'vi.kicker10': 'Freshness & Product Benefits',
        'vi.h3.10': 'Natural skincare storytelling',
        'vi.p10': 'These visuals focus on freshness, cleansing, glow, water, and natural skincare benefits, extending the identity beyond packaging into emotional product storytelling.',
        'vi.nav.prev': '\u2190 Social Media',
        'vi.nav.next': 'Banners & Print \u2192',
        /* Banners */
        'banners.eyebrow': 'Portfolio \u2014 Banners & Print',
        'banners.headline': 'Print & Packaging Collection',
        'banners.meta.category': 'Category',
        'banners.meta.value': 'Banners & Print',
        'banners.overview': 'Print and packaging work where material, type, and colour have to carry the brand without saying a word.',
        'banners.block1.title': 'Brief',
        'banners.block1.desc': 'Each piece needed to hold up in the hand \u2014 not just look good as a flat file.',
        'banners.caption1': 'Print Banner',
        'banners.block2.title': 'Direction',
        'banners.block2.desc': 'Material\u2011aware design: choices driven by how something would actually be printed, folded, or held.',
        'banners.caption2': 'Material Studies',
        'banners.block3.title': 'System',
        'banners.block3.desc': 'Banner, flyer, and brochure share one structure, so a customer recognises the brand before they read a word.',
        'banners.caption3': 'Packaging Box',
        'banners.caption4': 'Flyer Layout',
        'banners.block4.title': 'Output',
        'banners.block4.desc': 'A cohesive set of print and packaging pieces, each tuned to its own format and use case.',
        'banners.caption5': 'Brochure Spread',
        'banners.caption6': 'Outdoor Signage',
        'banners.caption7': 'Label Design',
        'banners.nav.prev': '\u2190 Visual Identity',
        'banners.nav.next': 'Art \u2192',
        /* Art */
        'art.eyebrow': 'Portfolio \u2014 Art',
        'art.headline': 'Character Design & Visual Development',
        'art.meta.category': 'Category',
        'art.meta.value': 'Art / Illustration',
        'art.overview': 'A collection of stylized character studies exploring silhouette, proportion, attitude, and visual storytelling.',
        'art.intro': 'This series explores how strong silhouettes can define character personality before details, color, or rendering are added. Each design begins with a readable black shape, then develops into a finished stylized character with costume, expression, pose, and visual attitude.',
        'art.silhouette.caption': 'Silhouette lineup \u2014 testing the readability, scale, and personality of each character before final rendering.',
        'art.block1.title': 'The Elder Strategist',
        'art.block1.desc': 'A crouching elder character built around tension, suspicion, and tactical presence. The silhouette focuses on the hunched posture, turban shape, clenched fist, and angular body language before the final version adds costume, facial expression, and cultural styling.',
        'art.block2.title': 'The Hooked Creature',
        'art.block2.desc': "A creature design focused on exaggerated anatomy, aggressive posture, and weapon-driven identity. The silhouette establishes the monster's curved spine, sharp head shape, long limbs, and oversized hooked weapon before the final render adds texture, armor, skin markings, and color contrast.",
        'art.block3.title': 'The Giant Fighter',
        'art.block3.desc': 'A powerful stylized character built on extreme proportion contrast: massive torso and arms against thin legs. The silhouette makes the character instantly recognizable, while the final render adds clothing details, wooden mechanical arms, warm colors, and a humorous heroic personality.',
        'art.block4.title': 'The Young Duo',
        'art.block4.desc': 'A character-pair study based on contrast: one tall, calm, protective figure and one short, angry, energetic figure. The silhouette stage tests the relationship between their sizes and attitudes, while the final render adds expression, costume, and story tension.',
        'art.silhouette.label': 'Silhouette Study',
        'art.final.label': 'Final Render',
        'art.closing.caption': 'Final character lineup \u2014 combining the individual studies into one cohesive visual system.',
        'art.nav.prev': '\u2190 Banners & Print',
        'art.nav.next': 'Logo Design \u2192',
        /* Contact */
        'contact.eyebrow': 'Contact \u2014 03',
        'contact.headline': "Let\u2019s build a visual system that feels sharp, clear, and impossible to ignore.",
        'contact.email.label': 'Email',
        'contact.phone.label': 'Phone',
        'contact.location.label': 'Location',
        'contact.location.value': 'Mansoura, Egypt',
        'contact.social.label': 'Social',
        'contact.behance': 'Behance',
        'contact.linkedin': 'LinkedIn',
        'contact.whatsapp': 'WhatsApp',
        /* Footer */
        'footer.social.label': 'Social',
        'footer.behance': 'Behance',
        'footer.linkedin': 'LinkedIn',
        'footer.whatsapp': 'WhatsApp',
        'footer.location.label': 'Location',
        'footer.location.value': 'Mansoura, Egypt',
        'footer.availability.label': 'Availability',
        'footer.availability.value': 'Open to new projects',
        'footer.expertise.label': 'Expertise',
        'footer.expertise.value': 'Branding \u00b7 Social Media \u00b7 Art Direction',
        'footer.copyright': '\u00a9 2026 Ahmed El Baz. All rights reserved.',
        'footer.backtotop': 'Back to top \u2191'
      },

      ar: {
        /* Nav */
        'nav.home': '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
        'nav.about': '\u0639\u0646\u064a',
        'nav.portfolio': '\u0627\u0644\u0623\u0639\u0645\u0627\u0644',
        'nav.contact': '\u062a\u0648\u0627\u0635\u0644',
        'mobile.location': '\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629\u060c \u0645\u0635\u0631 \u2014 \u0645\u062a\u0627\u062d \u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u062c\u062f\u064a\u062f\u0629',
        /* Hero */
        'hero.eyebrow': '\u0623\u0639\u0645\u0627\u0644\u064a \u2014 2026',
        'hero.role': '\u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 \u0648\u0645\u062f\u064a\u0631 \u0641\u0646\u064a',
        'hero.cta.primary': '\u0639\u0631\u0636 \u0627\u0644\u0623\u0639\u0645\u0627\u0644',
        'hero.cta.secondary': '\u0639\u0646\u064a',
        /* About */
        'about.eyebrow': '\u0639\u0646\u064a \u2014 01',
        'about.headline': '\u0633\u0628\u0639 \u0633\u0646\u0648\u0627\u062a \u0623\u062d\u0648\u0651\u0644 \u0641\u064a\u0647\u0627 \u0623\u0641\u0643\u0627\u0631\u064b\u0627 \u0625\u0644\u0649 \u0623\u0646\u0638\u0645\u0629 \u0628\u0635\u0631\u064a\u0629 \u0645\u062a\u0645\u0627\u0633\u0643\u0629.',
        'about.role': '\u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 \u0648\u0645\u062f\u064a\u0631 \u0641\u0646\u064a',
        'about.intro.p1': '\u0623\u062d\u0645\u062f \u0627\u0644\u0628\u0627\u0632 \u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 \u0648\u0645\u062f\u064a\u0631 \u0641\u0646\u064a \u0645\u0642\u064a\u0645 \u0641\u064a \u0645\u0635\u0631\u060c \u064a\u0639\u0645\u0644 \u0641\u064a \u0645\u062c\u0627\u0644\u0627\u062a \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u0648\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u0648\u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064a\u0629 \u0648\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0648\u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062a\u0648\u0636\u064a\u062d\u064a\u0629. \u062a\u0628\u062f\u0623 \u0639\u0645\u0644\u064a\u062a\u0647 \u0645\u0646 \u0627\u0644\u0633\u0648\u0642 \u0648\u0627\u0644\u062c\u0645\u0647\u0648\u0631 \u0644\u0627 \u0645\u0646 \u0627\u0644\u0644\u0648\u062d\u0629 \u0627\u0644\u0628\u064a\u0636\u0627\u0621 \u2014 \u0641\u0647\u0645 \u0645\u0646 \u062a\u062e\u0627\u0637\u0628 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0642\u0628\u0644 \u0631\u0633\u0645 \u0623\u064a \u0634\u0643\u0644.',
        'about.intro.p2': '\u0639\u0644\u0649 \u0645\u062f\u0649 \u0633\u0628\u0639 \u0633\u0646\u0648\u0627\u062a \u0642\u0627\u062f \u0641\u0631\u0642\u064b\u0627 \u0625\u0628\u062f\u0627\u0639\u064a\u0629 \u0648\u0634\u0643\u0651\u0644 \u0627\u0644\u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0628\u0635\u0631\u064a \u0644\u0639\u0645\u0644\u0627\u0621 \u0641\u064a \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629 \u0648\u0645\u0635\u0631 \u0648\u0623\u0648\u0631\u0648\u0628\u0627\u060c \u0645\u0648\u0627\u0632\u0646\u064b\u0627 \u0628\u064a\u0646 \u0627\u0644\u062c\u0645\u0627\u0644\u064a\u0627\u062a \u0648\u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0648\u0630\u0644\u0643 \u0627\u0644\u0627\u0647\u062a\u0645\u0627\u0645 \u0627\u0644\u062f\u0642\u064a\u0642 \u0628\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0630\u064a \u064a\u062c\u0639\u0644 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0645\u062a\u0633\u0642\u0629 \u0639\u0644\u0649 \u0646\u0637\u0627\u0642 \u0648\u0627\u0633\u0639.',
        /* Identity panel */
        'identity.panel.heading': '\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062f\u064a\u0631 \u0627\u0644\u0641\u0646\u064a',
        'identity.social.eyebrow': '\u0642\u0646\u0648\u0627\u062a \u0645\u062e\u062a\u0627\u0631\u0629',
        'identity.social.label': '\u0627\u0644\u0631\u0648\u0627\u0628\u0637 / \u062a\u0648\u0627\u0635\u0644',
        'identity.social.heading': '\u0627\u0628\u062f\u0623 \u0645\u062d\u0627\u062f\u062b\u0629 \u0625\u0628\u062f\u0627\u0639\u064a\u0629.',
        'identity.social.desc': '\u0644\u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u0648\u0627\u0644\u062a\u0639\u0627\u0648\u0646\u0627\u062a \u0648\u0627\u0633\u062a\u0641\u0633\u0627\u0631\u0627\u062a \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0641\u0646\u064a\u0629.',
        'social.behance': '\u0628\u064a\u0647\u0627\u0646\u0633',
        'social.linkedin': '\u0644\u064a\u0646\u0643\u062f\u0625\u0646',
        'social.whatsapp': '\u0648\u0627\u062a\u0633\u0627\u0628',
        'identity.location.label': '\u0627\u0644\u0645\u0648\u0642\u0639',
        'identity.location.value': '\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629\u060c \u0645\u0635\u0631',
        'identity.location.note': '\u0623\u0639\u0645\u0644 \u0641\u064a \u0627\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0645\u062d\u0644\u064a\u0629 \u0648\u0627\u0644\u062f\u0648\u0644\u064a\u0629',
        'identity.time.label': '\u0627\u0644\u062a\u0648\u0642\u064a\u062a \u0627\u0644\u0645\u062d\u0644\u064a',
        'identity.time.note': '\u062a\u0648\u0642\u064a\u062a \u0627\u0644\u0642\u0627\u0647\u0631\u0629 / \u0623\u0641\u0631\u064a\u0642\u064a\u0627',
        'identity.availability.label': '\u0627\u0644\u062a\u0648\u0641\u0631',
        'identity.availability.value': '\u0645\u062a\u0627\u062d \u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u062c\u062f\u064a\u062f\u0629',
        'identity.availability.note': '\u0647\u0648\u064a\u0629 \u0628\u0635\u0631\u064a\u0629\u060c \u062d\u0645\u0644\u0627\u062a\u060c \u0648\u0625\u062f\u0627\u0631\u0629 \u0641\u0646\u064a\u0629',
        'identity.panel.footer.left': '\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629 \u2014 \u062a\u0648\u0642\u064a\u062a \u0627\u0644\u0642\u0627\u0647\u0631\u0629',
        'identity.panel.footer.right': '\u062a\u0635\u0645\u064a\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 / \u0625\u062f\u0627\u0631\u0629 \u0641\u0646\u064a\u0629',
        /* Tools */
        'about.tools.label': '\u0627\u0644\u0623\u062f\u0648\u0627\u062a',
        /* Career */
        'career.headline': '\u0633\u062a\u0629 \u0623\u062f\u0648\u0627\u0631\u060c \u062e\u0637 \u0648\u0627\u062d\u062f.',
        'career.hint': '\u0627\u0633\u062d\u0628 \u0623\u0648 \u0645\u0631\u0651\u0631 \u0623\u0648 \u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0623\u0633\u0647\u0645',
        'career.panel.heading': '\u0623\u0631\u0634\u064a\u0641 \u0627\u0644\u0645\u0633\u064a\u0631\u0629',
        'career.label': '\u062f\u0648\u0631',
        'role01.title': '\u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643',
        'role01.org': '\u0645\u0643\u062a\u0628 \u0628\u0631\u0633\u062a\u064a\u062c \u0644\u0644\u0625\u0639\u0644\u0627\u0646 \u0648\u0627\u0644\u0646\u0634\u0631\u060c \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629',
        'role01.desc': '\u0635\u0645\u0651\u0645 \u0645\u0648\u0627\u062f \u0625\u0639\u0644\u0627\u0646\u064a\u0629 \u0648\u062a\u0631\u0648\u064a\u062c\u064a\u0629 \u0644\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u062d\u0644\u064a\u0629\u060c \u0634\u0645\u0644\u062a \u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a \u0648\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0627\u0644\u0645\u0628\u0643\u0631\u0629.',
        'role02.title': '\u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 \u00b7 \u0639\u0646 \u0628\u064f\u0639\u062f',
        'role02.org': '\u0645\u0643\u062a\u0628 \u062e\u062f\u0645\u0629 \u0627\u0644\u0645\u062c\u062a\u0645\u0639 \u0648\u0627\u0644\u062a\u0646\u0645\u064a\u0629 \u0627\u0644\u0628\u064a\u0626\u064a\u0629\u060c \u062c\u0627\u0645\u0639\u0629 \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629',
        'role02.desc': '\u0623\u0646\u062a\u062c \u0645\u0648\u0627\u062f \u0628\u0635\u0631\u064a\u0629 \u0644\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u062a\u0639\u0644\u064a\u0645\u064a\u0629 \u0648\u0627\u0644\u062a\u0648\u0639\u0648\u064a\u0629\u060c \u0648\u0645\u0648\u0627\u062f\u064b\u0627 \u062a\u0631\u0648\u064a\u062c\u064a\u0629 \u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a \u0627\u0644\u062c\u0627\u0645\u0639\u0629.',
        'role03.title': '\u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643',
        'role03.org': '\u0634\u0631\u0643\u0629 \u0645\u064a\u062b\u0627\u0642\u060c \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629',
        'role03.desc': '\u0635\u0645\u0651\u0645 \u062d\u0645\u0644\u0627\u062a \u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u0648\u0645\u0648\u0627\u062f \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0644\u062d\u0633\u0627\u0628\u0627\u062a \u0639\u0645\u0644\u0627\u0621 \u0645\u062a\u0639\u062f\u062f\u0629.',
        'role04.title': '\u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 \u00b7 \u0639\u0646 \u0628\u064f\u0639\u062f',
        'role04.org': '\u0634\u0631\u0643\u0629 \u0641\u0631\u064a\u0646\u0632\u064a \u0644\u0628\u0648\u0638\u0629',
        'role04.desc': '\u0637\u0648\u0651\u0631 \u0645\u0648\u0627\u062f \u0628\u0635\u0631\u064a\u0629 \u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0648\u062a\u0631\u0648\u064a\u062c\u064a\u0629 \u0645\u062a\u0648\u0627\u0626\u0645\u0629 \u0645\u0639 \u0647\u0648\u064a\u0629 \u0628\u0635\u0631\u064a\u0629 \u0645\u0648\u062d\u062f\u0629 \u0648\u0645\u062a\u0633\u0642\u0629.',
        'role05.title': '\u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643',
        'role05.org': '\u0634\u0631\u0643\u0629 PLAN \u0644\u0644\u062a\u0633\u0648\u064a\u0642\u060c \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629',
        'role05.desc': '\u0628\u0646\u0649 \u0645\u0648\u0627\u062f \u0628\u0635\u0631\u064a\u0629 \u0625\u0639\u0644\u0627\u0646\u064a\u0629 \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0641\u064a \u0635\u0646\u0627\u0639\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629\u060c \u0645\u0635\u0645\u0651\u0645\u0629 \u0644\u0643\u0644 \u062c\u0645\u0647\u0648\u0631 \u0628\u0645\u0627 \u064a\u0646\u0627\u0633\u0628\u0647.',
        'role06.title': '\u0645\u0635\u0645\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 \u0648\u0645\u062f\u064a\u0631 \u0641\u0631\u064a\u0642',
        'role06.org': 'GOSERVE \u0644\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u0631\u0642\u0645\u064a\u060c \u0637\u0644\u062e\u0627',
        'role06.desc': '\u064a\u0642\u0648\u062f \u0641\u0631\u064a\u0642 \u0627\u0644\u062a\u0635\u0645\u064a\u0645 \u2014 \u0628\u0646\u0631\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0648\u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0644\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629 \u0648\u0627\u0644\u0645\u0635\u0631\u064a\u0629 \u0648\u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064a\u0629\u060c \u0645\u0639 \u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0639\u0644\u0649 \u0627\u062a\u0633\u0627\u0642 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0639\u0644\u0649 \u0646\u0637\u0627\u0642 \u0648\u0627\u0633\u0639.',
        /* Services */
        'services.headline': '\u0623\u064a\u0646 \u0623\u0633\u062a\u0637\u064a\u0639 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629.',
        'services.panel.heading': '\u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629 \u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a\u0629',
        'services.panel.subheading': '\u0642\u062f\u0631\u0627\u062a \u0645\u062e\u062a\u0627\u0631\u0629 / 01\u201406',
        'service01.label': '\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0647\u0648\u064a\u0629',
        'service01.title': '\u0647\u0648\u064a\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629',
        'service01.desc': '\u0634\u0639\u0627\u0631\u0627\u062a \u0648\u0623\u0646\u0638\u0645\u0629 \u0648\u0625\u0631\u0634\u0627\u062f\u0627\u062a \u0645\u0628\u0646\u064a\u0629 \u0644\u0644\u0628\u0642\u0627\u0621 \u0645\u062a\u0633\u0642\u0629 \u0645\u0639 \u0646\u0645\u0648 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629.',
        'service02.label': '\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u062d\u062a\u0648\u0649',
        'service02.title': '\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627',
        'service02.desc': '\u0623\u0646\u0638\u0645\u0629 \u0628\u0635\u0631\u064a\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062a\u0648\u0644\u064a\u062f \u062a\u064f\u0628\u0642\u064a \u0627\u0644\u062a\u0642\u0648\u064a\u0645 \u0627\u0644\u0625\u0639\u0644\u0627\u0645\u064a \u0645\u062a\u062d\u0631\u0643\u064b\u0627 \u062f\u0648\u0646 \u0641\u0642\u062f\u0627\u0646 \u0627\u0644\u062c\u0648\u062f\u0629.',
        'service03.label': '\u0627\u0644\u062a\u0648\u062c\u064a\u0647 \u0627\u0644\u0628\u0635\u0631\u064a',
        'service03.title': '\u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0641\u0646\u064a\u0629 \u0644\u0644\u062d\u0645\u0644\u0627\u062a',
        'service03.desc': '\u062a\u0648\u062c\u064a\u0647 \u0645\u0646 \u0627\u0644\u0641\u0643\u0631\u0629 \u0644\u0644\u062a\u0646\u0641\u064a\u0630 \u0644\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0648\u062c\u0647\u0629 \u0646\u0638\u0631 \u0628\u0635\u0631\u064a\u0629 \u0648\u0627\u0636\u062d\u0629.',
        'service04.label': '\u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629',
        'service04.title': '\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629',
        'service04.desc': '\u0628\u0646\u0631\u0627\u062a \u0648\u062a\u062e\u0637\u064a\u0637\u0627\u062a \u0645\u0646\u062a\u062c\u0627\u062a \u0648\u0645\u0648\u0627\u062f \u0628\u0635\u0631\u064a\u0629 \u0644\u0644\u0645\u062a\u0627\u062c\u0631 \u0645\u0636\u0628\u0648\u0637\u0629 \u0644\u0644\u062a\u062d\u0648\u064a\u0644 \u0648\u0627\u0644\u0627\u062a\u0633\u0627\u0642.',
        'service05.label': '\u0627\u0644\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0645\u0627\u062f\u064a',
        'service05.title': '\u0627\u0644\u0637\u0628\u0627\u0639\u0629 \u0648\u0627\u0644\u062a\u0639\u0628\u0626\u0629',
        'service05.desc': '\u062a\u0635\u0645\u064a\u0645 \u064a\u0623\u062e\u0630 \u0627\u0644\u0645\u0627\u062f\u0629 \u0641\u064a \u0627\u0644\u0627\u0639\u062a\u0628\u0627\u0631 \u0644\u0644\u062a\u063a\u0644\u064a\u0641 \u0648\u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u062a\u0633\u0648\u064a\u0642\u064a\u0629 \u2014 \u0639\u0645\u0644 \u064a\u062c\u0628 \u0623\u0646 \u064a\u0635\u0645\u062f \u0641\u064a \u0627\u0644\u064a\u062f.',
        'service06.label': '\u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u0635\u0648\u0631\u0629',
        'service06.title': '\u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u062a\u0648\u0636\u064a\u062d\u064a',
        'service06.desc': '\u0631\u0633\u0645 \u062a\u0648\u0636\u064a\u062d\u064a \u0645\u062e\u0635\u0635 \u0648\u0633\u0631\u062f \u0628\u0635\u0631\u064a \u0644\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u062d\u062a\u0627\u062c \u0635\u0648\u062a\u064b\u0627 \u0645\u0631\u0633\u0648\u0645\u064b\u0627 \u0645\u0645\u064a\u0632\u064b\u0627.',
        'services.panel.footer.left': '\u062a\u0635\u0645\u064a\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 / \u0625\u062f\u0627\u0631\u0629 \u0641\u0646\u064a\u0629',
        'services.panel.footer.right': '\u0623\u0646\u0638\u0645\u0629 \u0645\u0628\u0646\u064a\u0629 \u0644\u062a\u062a\u0645\u0627\u0633\u0643',
        'services.label': '\u062e\u062f\u0645\u0629',
        /* Portfolio */
        'portfolio.eyebrow': '\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u2014 02',
        'portfolio.headline': '\u062e\u0645\u0633 \u0637\u0631\u0642 \u0644\u0644\u0639\u0645\u0644 \u0645\u0639\u064b\u0627.',
        'portfolio.intro': '\u062a\u0635\u0641\u062d \u062d\u0633\u0628 \u0627\u0644\u0642\u0633\u0645 \u2014 \u0643\u0644 \u0648\u0627\u062d\u062f \u064a\u0641\u062a\u062d \u062f\u0631\u0627\u0633\u0627\u062a \u062d\u0627\u0644\u0629 \u0643\u0627\u0645\u0644\u0629.',
        'portfolio.carousel.heading': '\u0641\u0647\u0631\u0633 \u0627\u0644\u0623\u0642\u0633\u0627\u0645',
        'portfolio.carousel.subheading': '\u0623\u0639\u0645\u0627\u0644 \u0645\u062e\u062a\u0627\u0631\u0629 / 01\u201405',
        'portfolio.cat.label': '\u0642\u0633\u0645',
        'portfolio.cat.logo': '\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0634\u0639\u0627\u0631\u0627\u062a',
        'portfolio.cat.logo.desc': '\u0634\u0639\u0627\u0631\u0627\u062a \u0645\u0635\u0645\u0651\u0645\u0629 \u0644\u062a\u0639\u0645\u0644 \u0628\u0643\u0644 \u0627\u0644\u0623\u062d\u062c\u0627\u0645 \u0648\u0627\u0644\u0623\u0644\u0648\u0627\u0646.',
        'portfolio.cat.social': '\u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627',
        'portfolio.cat.social.desc': '\u0623\u0646\u0638\u0645\u0629 \u0645\u062d\u062a\u0648\u0649 \u062a\u064f\u0628\u0642\u064a \u0627\u0644\u062a\u0642\u0648\u064a\u0645 \u0645\u062a\u062d\u0631\u0643\u064b\u0627 \u062f\u0648\u0646 \u0641\u0642\u062f\u0627\u0646 \u0627\u0644\u062c\u0648\u062f\u0629.',
        'portfolio.cat.vi': '\u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0628\u0635\u0631\u064a\u0629',
        'portfolio.cat.vi.desc': '\u0623\u0646\u0638\u0645\u0629 \u0647\u0648\u064a\u0629 \u0643\u0627\u0645\u0644\u0629 \u062a\u062a\u0645\u0627\u0633\u0643 \u0639\u0644\u0649 \u0643\u0644 \u0633\u0637\u062d.',
        'portfolio.cat.banners': '\u0627\u0644\u0628\u0646\u0631\u0627\u062a \u0648\u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a',
        'portfolio.cat.banners.desc': '\u062a\u0635\u0645\u064a\u0645 \u064a\u0623\u062e\u0630 \u0627\u0644\u0645\u0627\u062f\u0629 \u0641\u064a \u0627\u0644\u0627\u0639\u062a\u0628\u0627\u0631 \u0644\u0644\u062a\u063a\u0644\u064a\u0641 \u0648\u0627\u0644\u0625\u0631\u0634\u0627\u062f\u0627\u062a \u0648\u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a.',
        'portfolio.cat.art': '\u0627\u0644\u0631\u0633\u0645 \u0648\u0627\u0644\u062f\u0631\u0627\u0633\u0627\u062a \u0627\u0644\u0641\u0646\u064a\u0629',
        'portfolio.cat.art.desc': '\u0631\u0633\u0648\u0645 \u062a\u0648\u0636\u064a\u062d\u064a\u0629 \u0648\u062f\u0631\u0627\u0633\u0627\u062a \u0628\u0635\u0631\u064a\u0629 \u0644\u0630\u0627\u062a\u0647\u0627.',
        /* Logo case */
        'case.back': '\u2190 \u0643\u0644 \u0627\u0644\u0623\u0642\u0633\u0627\u0645',
        'logo.eyebrow': '\u0627\u0644\u0623\u0639\u0645\u0627\u0644 - \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0634\u0639\u0627\u0631\u0627\u062a',
        'logo.headline': '\u062f\u0631\u0627\u0633\u0627\u062a \u062d\u0627\u0644\u0629 \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0634\u0639\u0627\u0631\u0627\u062a',
        'logo.overview': '\u0645\u062c\u0645\u0648\u0639\u0629 \u0645\u0631\u0643\u0651\u0632\u0629 \u0645\u0646 \u0645\u0634\u0627\u0631\u064a\u0639 \u0627\u0644\u0634\u0639\u0627\u0631\u0627\u062a \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0639\u0628\u0631 \u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u0631\u0642\u0645\u064a \u0648\u0627\u0644\u0623\u0632\u064a\u0627\u0621 \u0648\u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u063a\u0630\u0627\u0621.',
        'logo.group.digital': '\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u0631\u0642\u0645\u064a',
        'logo.group.abaya': '\u0645\u062a\u0627\u062c\u0631 \u0627\u0644\u0639\u0628\u0627\u0621\u0627\u062a',
        'logo.group.dairy': '\u0645\u062a\u062c\u0631 \u0623\u0644\u0628\u0627\u0646',
        'logo.plan.category': '\u0634\u0631\u0643\u0629 \u062a\u0633\u0648\u064a\u0642 \u0631\u0642\u0645\u064a',
        'logo.plan.desc': '\u0639\u0644\u0627\u0645\u0629 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0645\u0628\u0646\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0648\u0627\u0644\u062a\u062e\u0637\u064a\u0637 \u0648\u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0645\u062d\u0633\u0648\u0628.',
        'logo.trend.category': '\u0634\u0631\u0643\u0629 \u062a\u0633\u0648\u064a\u0642 \u0631\u0642\u0645\u064a',
        'logo.trend.desc': '\u062e\u0637 \u0639\u0631\u0628\u064a \u0645\u062e\u0635\u0635 \u0645\u0634\u0643\u0651\u0644 \u0644\u0644\u0633\u0631\u0639\u0629 \u0648\u0627\u0644\u0648\u0636\u0648\u062d \u0648\u0627\u0644\u062d\u0631\u0643\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629.',
        'logo.goserv.category': '\u0634\u0631\u0643\u0629 \u062a\u0633\u0648\u064a\u0642 \u0631\u0642\u0645\u064a',
        'logo.goserv.desc': '\u0634\u0639\u0627\u0631 \u0643\u0644\u0645\u064a \u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u0633\u0631\u064a\u0639\u0629 \u0648\u0627\u0644\u0628\u0633\u064a\u0637\u0629 \u0648\u0627\u0644\u0645\u0648\u062b\u0648\u0642\u0629.',
        'logo.ebdea.category': '\u0634\u0631\u0643\u0629 \u062a\u0633\u0648\u064a\u0642 \u0631\u0642\u0645\u064a',
        'logo.ebdea.desc': '\u0647\u0648\u064a\u0629 \u0648\u0643\u0627\u0644\u0629 \u0625\u0628\u062f\u0627\u0639\u064a\u0629 \u0648\u062f\u064a\u0629 \u0645\u0628\u0646\u064a\u0629 \u062d\u0648\u0644 \u0627\u0644\u0623\u0641\u0643\u0627\u0631 \u0648\u0627\u0644\u062a\u0639\u0628\u064a\u0631.',
        'logo.amira.category': '\u0645\u062a\u062c\u0631 \u0639\u0628\u0627\u0621\u0627\u062a',
        'logo.amira.desc': '\u0639\u0644\u0627\u0645\u0629 \u0623\u0632\u064a\u0627\u0621 \u0631\u0627\u0642\u064a\u0629 \u0628\u0625\u064a\u062d\u0627\u0621\u0627\u062a \u0645\u0644\u0643\u064a\u0629 \u0648\u0641\u062e\u0627\u0645\u0629 \u0645\u062d\u062a\u0634\u0645\u0629.',
        'logo.rozan.category': '\u0645\u062a\u062c\u0631 \u0639\u0628\u0627\u0621\u0627\u062a',
        'logo.rozan.desc': '\u0647\u0648\u064a\u0629 \u0623\u0632\u064a\u0627\u0621 \u062b\u0646\u0627\u0626\u064a\u0629 \u0627\u0644\u0644\u063a\u0629 \u0628\u0646\u0639\u0648\u0645\u0629 \u0632\u0647\u0631\u064a\u0629 \u0648\u0623\u0646\u0627\u0642\u0629 \u062b\u0642\u0627\u0641\u064a\u0629.',
        'logo.natural.category': '\u0645\u062a\u062c\u0631 \u0623\u0644\u0628\u0627\u0646',
        'logo.natural.desc': '\u0639\u0644\u0627\u0645\u0629 \u0623\u0644\u0628\u0627\u0646 \u0637\u0627\u0632\u062c\u0629 \u062a\u0639\u0628\u0651\u0631 \u0639\u0646 \u0627\u0644\u0646\u0642\u0627\u0621 \u0648\u0627\u0644\u062b\u0642\u0629 \u0648\u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u0632\u0631\u0639\u0629.',
        'logo.case.factlabel1': '\u0641\u0626\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629',
        'logo.case.factlabel2': '\u0646\u0648\u0639 \u0627\u0644\u0645\u0634\u0631\u0648\u0639',
        'logo.case.h4.overview': '\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0634\u0631\u0648\u0639',
        'logo.case.h4.challenge': '\u062a\u062d\u062f\u064a \u0627\u0644\u062a\u0635\u0645\u064a\u0645',
        'logo.case.h4.concept': '\u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a',
        'logo.case.h4.execution': '\u0627\u0644\u062a\u0646\u0641\u064a\u0630 \u0627\u0644\u0628\u0635\u0631\u064a',
        'logo.case.h4.applications': '\u0627\u0644\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0627\u0644\u0645\u0642\u062a\u0631\u062d\u0629',
        'logo.case.h4.caption': '\u0645\u0644\u0627\u062d\u0638\u0629 \u0627\u0644\u0645\u0639\u0631\u0636',
        'logo.case.plan.type': '\u062a\u0635\u0645\u064a\u0645 \u0634\u0639\u0627\u0631 / \u0647\u0648\u064a\u0629 \u0639\u0644\u0627\u0645\u0629 \u062a\u062c\u0627\u0631\u064a\u0629',
        'logo.case.plan.p1': '\u0627\u062d\u062a\u0627\u062c\u062a Plan \u0625\u0644\u0649 \u0647\u0648\u064a\u0629 \u0648\u0627\u0636\u062d\u0629 \u0648\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u062a\u0628\u062f\u0648 \u0645\u0646\u0638\u0645\u0629 \u0648\u0648\u0627\u062b\u0642\u0629 \u0639\u0628\u0631 \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0642\u0645\u064a\u0629.',
        'logo.case.plan.p2': '\u0643\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0623\u0646 \u062a\u0639\u0628\u0651\u0631 \u0639\u0646 \u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0648\u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u062f\u0648\u0646 \u0623\u0646 \u062a\u0635\u0628\u062d \u0634\u062f\u064a\u062f\u0629 \u0627\u0644\u0631\u0633\u0645\u064a\u0629 \u0623\u0648 \u0645\u0639\u0642\u062f\u0629 \u0641\u064a \u0627\u0644\u0623\u062d\u062c\u0627\u0645 \u0627\u0644\u0635\u063a\u064a\u0631\u0629.',
        'logo.case.plan.p3': '\u062a\u0635\u0628\u062d \u062d\u0631\u0641 P \u0639\u0644\u0627\u0645\u0629 \u062f\u0627\u0626\u0631\u064a\u0629 \u062c\u0631\u064a\u0626\u0629 \u062a\u0642\u062a\u0631\u062d \u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0648\u0627\u0644\u0627\u0633\u062a\u0647\u062f\u0627\u0641\u060c \u0628\u064a\u0646\u0645\u0627 \u062a\u0642\u062a\u0631\u062d \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0623\u0641\u0642\u064a\u0629 \u0627\u0644\u0633\u0641\u0644\u064a\u0629 \u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0648\u0627\u0644\u062a\u062e\u0637\u064a\u0637 \u0648\u0627\u0644\u062a\u0642\u062f\u0645.',
        'logo.case.plan.p4': '\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0646\u0638\u064a\u0641\u0629 \u0648\u0627\u0644\u062a\u0628\u0627\u064a\u0646 \u0627\u0644\u0642\u0648\u064a \u0648\u0627\u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u0645\u062a\u0648\u0627\u0632\u0646 \u062a\u0645\u0646\u062d \u0627\u0644\u0647\u0648\u064a\u0629 \u062d\u0636\u0648\u0631\u064b\u0627 \u0631\u0642\u0645\u064a\u064b\u0627 \u0645\u0646\u0636\u0628\u0637\u064b\u0627.',
        'logo.case.plan.p5': '\u0623\u064a\u0642\u0648\u0646\u0627\u062a \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u0648\u0639\u0631\u0648\u0636 \u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0648\u0645\u0642\u062a\u0631\u062d\u0627\u062a \u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0631\u0642\u0645\u064a\u0629 \u0648\u0623\u063a\u0644\u0641\u0629 \u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u062a\u0642\u062f\u064a\u0645\u064a\u0629 \u0648\u0627\u0644\u0642\u0631\u0637\u0627\u0633\u064a\u0629.',
        'logo.case.plan.p6': '\u0646\u0638\u0627\u0645 \u0647\u0648\u064a\u0629 \u0645\u0631\u0643\u0651\u0632 \u0644\u0639\u0644\u0627\u0645\u0629 \u062a\u0633\u0648\u064a\u0642\u064a\u0629 \u0645\u0628\u0646\u064a\u0629 \u062d\u0648\u0644 \u0627\u0644\u0648\u0636\u0648\u062d \u0648\u0627\u0644\u062a\u062e\u0637\u064a\u0637 \u0648\u0627\u0644\u062a\u0642\u062f\u0645.',
        'logo.case.plan.mockup1': '\u0635\u0648\u0631\u0629 \u0631\u0645\u0632\u064a\u0629',
        'logo.case.plan.mockup2': '\u0639\u0631\u0636 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a',
        'logo.case.plan.mockup3': '\u0642\u0631\u0637\u0627\u0633\u064a\u0629',
        'logo.case.trend.type': '\u062a\u0635\u0645\u064a\u0645 \u0634\u0639\u0627\u0631 \u0639\u0631\u0628\u064a / \u0647\u0648\u064a\u0629 \u0631\u0642\u0645\u064a\u0629',
        'logo.case.trend.p1': '\u062a\u0631\u064a\u0646\u062f \u0645\u064f\u0648\u0636\u064e\u0651\u0639\u0629 \u0644\u0644\u0648\u0636\u0648\u062d \u0627\u0644\u0631\u0642\u0645\u064a \u0648\u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627\u060c \u0628\u0647\u0648\u064a\u0629 \u062a\u062d\u062a\u0627\u062c \u0623\u0646 \u062a\u0628\u062f\u0648 \u0646\u0634\u0637\u0629 \u0648\u062d\u062f\u064a\u062b\u0629 \u0648\u0630\u0627\u062a \u0635\u0644\u0629 \u062b\u0642\u0627\u0641\u064a\u0629.',
        'logo.case.trend.p2': '\u0643\u0627\u0646\u062a \u0627\u0644\u062e\u0637\u0648\u0637 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u062d\u0645\u0644 \u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0648\u0627\u0644\u062d\u0631\u0643\u0629 \u0645\u0639 \u0627\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0627\u0636\u0639 \u0627\u0644\u0631\u0642\u0645\u064a\u0629 \u0633\u0631\u064a\u0639\u0629 \u0627\u0644\u062a\u0645\u0631\u064a\u0631.',
        'logo.case.trend.p3': '\u062a\u062e\u0644\u0642 \u0627\u0644\u062e\u0637\u0648\u0637 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0645\u062e\u0635\u0635\u0629 \u062d\u0631\u0643\u0629 \u0648\u062a\u0639\u0643\u0633 \u0627\u0644\u0637\u0628\u064a\u0639\u0629 \u0627\u0644\u0645\u062a\u063a\u064a\u0631\u0629 \u0644\u0644\u062a\u0631\u0646\u062f\u0627\u062a\u060c \u0645\u0627\u0646\u062d\u064b\u0627 \u0627\u0644\u0634\u0639\u0627\u0631 \u0625\u062d\u0633\u0627\u0633\u064b\u0627 \u0628\u0627\u0644\u0633\u0631\u0639\u0629 \u0648\u0627\u0644\u0648\u0636\u0648\u062d.',
        'logo.case.trend.p4': '\u0623\u0634\u0643\u0627\u0644 \u0627\u0644\u062d\u0631\u0648\u0641 \u0627\u0644\u062f\u064a\u0646\u0627\u0645\u064a\u0643\u064a\u0629 \u0648\u0627\u0644\u0625\u064a\u0642\u0627\u0639 \u0627\u0644\u0645\u0636\u063a\u0648\u0637 \u0648\u0627\u0644\u0645\u0633\u0627\u0641\u0627\u062a \u0627\u0644\u0648\u0627\u062b\u0642\u0629 \u062a\u062e\u0644\u0642 \u0634\u0639\u0627\u0631\u064b\u0627 \u0643\u0644\u0645\u064a\u064b\u0627 \u0645\u0631\u0646\u064b\u0627 \u0628\u0634\u062e\u0635\u064a\u0629 \u0642\u0648\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627.',
        'logo.case.trend.p5': '\u0635\u0648\u0631 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a \u0648\u0623\u063a\u0644\u0641\u0629 \u0627\u0644\u0631\u064a\u0644\u0632 \u0648\u0627\u0641\u062a\u062a\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0648\u0631\u0633\u0648\u0645 \u0627\u0644\u062d\u0631\u0643\u0629 \u0648\u0627\u0644\u0628\u0646\u0631\u0627\u062a \u0627\u0644\u0631\u0642\u0645\u064a\u0629 \u0648\u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0645\u062d\u062a\u0648\u0649.',
        'logo.case.trend.p6': '\u0647\u0648\u064a\u0629 \u0631\u0642\u0645\u064a\u0629 \u0639\u0631\u0628\u064a\u0629 \u0645\u0634\u0643\u0651\u0644\u0629 \u0644\u0644\u062d\u0631\u0643\u0629 \u0627\u0644\u0633\u0631\u064a\u0639\u0629 \u0648\u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0648\u0627\u0636\u062d\u0629 \u0648\u0627\u0644\u0628\u0642\u0627\u0621 \u0641\u064a \u0635\u062f\u0627\u0631\u0629 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0642\u0627\u0626\u0645 \u0639\u0644\u0649 \u0627\u0644\u062a\u0631\u0646\u062f.',
        'logo.case.trend.mockup1': '\u063a\u0644\u0627\u0641 \u0631\u064a\u0644\u0632',
        'logo.case.trend.mockup2': '\u0645\u0642\u062f\u0645\u0629 \u062d\u0631\u0643\u064a\u0629',
        'logo.case.trend.mockup3': '\u0639\u0644\u0627\u0645\u0629 \u0645\u0644\u0641',
        'logo.case.goserv.type': '\u062a\u0635\u0645\u064a\u0645 \u0634\u0639\u0627\u0631 \u0643\u0644\u0645\u064a',
        'logo.case.goserv.p1': '\u0627\u062d\u062a\u0627\u062c\u062a GoServ \u0625\u0644\u0649 \u0634\u0639\u0627\u0631 \u0643\u0644\u0645\u064a \u0628\u0633\u064a\u0637 \u0648\u0642\u0627\u0628\u0644 \u0644\u0644\u062a\u0645\u064a\u064a\u0632 \u0644\u0639\u0644\u0627\u0645\u0629 \u062e\u062f\u0645\u0627\u062a\u064a\u0629 \u0630\u0627\u062a \u062d\u0636\u0648\u0631 \u0631\u0642\u0645\u064a \u0639\u0645\u0644\u064a.',
        'logo.case.goserv.p2': '\u0643\u0627\u0646\u062a \u0627\u0644\u0647\u0648\u064a\u0629 \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u0623\u0646 \u062a\u0628\u062f\u0648 \u0633\u0631\u064a\u0639\u0629 \u0648\u0645\u0648\u062b\u0648\u0642\u0629 \u062f\u0648\u0646 \u0627\u0644\u0627\u0639\u062a\u0645\u0627\u062f \u0639\u0644\u0649 \u0631\u0645\u0648\u0632 \u0632\u062e\u0631\u0641\u064a\u0629 \u0623\u0648 \u0639\u0646\u0627\u0635\u0631 \u0639\u0644\u0627\u0645\u0629 \u062a\u062c\u0627\u0631\u064a\u0629 \u0645\u0639\u0642\u062f\u0629.',
        'logo.case.goserv.p3': '\u0627\u0644\u0634\u0639\u0627\u0631 \u0627\u0644\u0643\u0644\u0645\u064a \u0628\u0627\u0644\u062d\u0631\u0648\u0641 \u0627\u0644\u0643\u0628\u064a\u0631\u0629 \u0627\u0644\u062c\u0631\u064a\u0626\u0629 \u064a\u0645\u0646\u062d \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0648\u0636\u0648\u062d\u064b\u0627 \u0642\u0648\u064a\u064b\u0627 \u0648\u0634\u062e\u0635\u064a\u0629 \u0631\u0642\u0645\u064a\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0628\u0646\u064a\u0629 \u062d\u0648\u0644 \u0627\u0644\u0633\u0631\u0639\u0629 \u0648\u0627\u0644\u0628\u0633\u0627\u0637\u0629 \u0648\u0627\u0644\u0645\u0648\u062b\u0648\u0642\u064a\u0629.',
        'logo.case.goserv.p4': '\u0648\u0632\u0646 \u0627\u0644\u062d\u0631\u0648\u0641 \u0627\u0644\u062b\u0642\u064a\u0644 \u0648\u0627\u0644\u0646\u0633\u0628 \u0627\u0644\u0645\u0636\u063a\u0648\u0637\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0641\u0627\u062a \u0627\u0644\u0648\u0627\u0636\u062d\u0629 \u062a\u062c\u0639\u0644 \u0627\u0644\u0634\u0639\u0627\u0631 \u0642\u0627\u0628\u0644\u0627\u064b \u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0639\u0628\u0631 \u062a\u0646\u0633\u064a\u0642\u0627\u062a \u0627\u0644\u0648\u064a\u0628 \u0648\u0627\u0644\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a.',
        'logo.case.goserv.p5': '\u0631\u0624\u0648\u0633 \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0648\u0644\u0648\u062d\u0627\u062a \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0648\u0631\u0633\u0648\u0645 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0648\u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0645\u0642\u062a\u0631\u062d\u0627\u062a \u0648\u0627\u0644\u0644\u0627\u0641\u062a\u0627\u062a.',
        'logo.case.goserv.p6': '\u0634\u0639\u0627\u0631 \u0643\u0644\u0645\u064a \u062e\u062f\u0645\u0627\u062a\u064a \u0645\u0628\u0627\u0634\u0631 \u0645\u0635\u0645\u0651\u0645 \u0644\u0644\u062a\u0639\u0631\u0641 \u0627\u0644\u0633\u0631\u064a\u0639 \u0648\u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0631\u0642\u0645\u064a \u0627\u0644\u0648\u0627\u062b\u0642.',
        'logo.case.goserv.mockup1': '\u0631\u0623\u0633 \u062a\u0637\u0628\u064a\u0642',
        'logo.case.goserv.mockup2': '\u0625\u0639\u0644\u0627\u0646 \u062e\u062f\u0645\u0629',
        'logo.case.goserv.mockup3': '\u0644\u0627\u0641\u062a\u0629',
        'logo.case.ebdea.type': '\u062a\u0635\u0645\u064a\u0645 \u0634\u0639\u0627\u0631 \u0648\u0643\u0627\u0644\u0629 \u0625\u0628\u062f\u0627\u0639\u064a\u0629',
        'logo.case.ebdea.p1': '\u0627\u062d\u062a\u0627\u062c\u062a Ebdea \u0625\u0644\u0649 \u0647\u0648\u064a\u0629 \u0648\u0643\u0627\u0644\u0629 \u0625\u0628\u062f\u0627\u0639\u064a\u0629 \u0645\u0631\u062d\u0651\u0628\u0629 \u062a\u0639\u0628\u0651\u0631 \u0639\u0646 \u0627\u0644\u062e\u064a\u0627\u0644 \u0648\u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u0625\u0646\u062a\u0627\u062c \u0627\u0644\u0628\u0635\u0631\u064a.',
        'logo.case.ebdea.p2': '\u0643\u0627\u0646 \u0627\u0644\u0634\u0639\u0627\u0631 \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u0623\u0646 \u064a\u0628\u062f\u0648 \u062a\u0639\u0628\u064a\u0631\u064a\u064b\u0627 \u0648\u0625\u0628\u062f\u0627\u0639\u064a\u064b\u0627 \u0645\u0639 \u0627\u0644\u0628\u0642\u0627\u0621 \u0645\u062d\u062a\u0631\u0641\u064b\u0627 \u0628\u0645\u0627 \u064a\u0643\u0641\u064a \u0644\u0644\u0639\u0645\u0644 \u0645\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.',
        'logo.case.ebdea.p3': '\u062d\u0631\u0641 e \u0627\u0644\u0645\u0646\u0645\u0646\u0645 \u0648\u0627\u0644\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0645\u062a\u062f\u0641\u0642\u0629 \u064a\u062e\u0644\u0642\u0627\u0646 \u0625\u062d\u0633\u0627\u0633\u064b\u0627 \u0628\u0648\u0643\u0627\u0644\u0629 \u0625\u0628\u062f\u0627\u0639\u064a\u0629 \u0648\u062f\u064a\u0629 \u0645\u062a\u0635\u0644\u0629 \u0628\u0627\u0644\u0623\u0641\u0643\u0627\u0631 \u0648\u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a\u0629.',
        'logo.case.ebdea.p4': '\u0627\u0644\u0623\u0634\u0643\u0627\u0644 \u0627\u0644\u0645\u0633\u062a\u062f\u064a\u0631\u0629 \u0648\u0627\u0644\u0645\u0646\u062d\u0646\u064a\u0627\u062a \u0627\u0644\u0637\u0644\u0642\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0642\u0629 \u0627\u0644\u0645\u0636\u063a\u0648\u0637\u0629 \u0628\u064a\u0646 \u0627\u0644\u0631\u0645\u0632 \u0648\u0627\u0644\u0643\u0644\u0645\u0629 \u062a\u0645\u0646\u062d \u0627\u0644\u0647\u0648\u064a\u0629 \u062f\u0641\u0621\u064b\u0627 \u0648\u062b\u0642\u0629\u064b \u0628\u0635\u0631\u064a\u0629.',
        'logo.case.ebdea.p5': '\u0645\u0644\u0641\u0627\u062a \u0627\u0644\u0648\u0643\u0627\u0644\u0629 \u0648\u0627\u0644\u0645\u0642\u062a\u0631\u062d\u0627\u062a \u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a\u0629 \u0648\u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u0648\u0639\u0631\u0648\u0636 \u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u0645\u0642\u062f\u0645\u0627\u062a \u0627\u0644\u062d\u0631\u0643\u064a\u0629.',
        'logo.case.ebdea.p6': '\u0634\u0639\u0627\u0631 \u0648\u0643\u0627\u0644\u0629 \u062f\u0627\u0641\u0626 \u064a\u062d\u0648\u0651\u0644 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a\u0629 \u0625\u0644\u0649 \u0635\u0648\u062a \u0628\u0635\u0631\u064a \u0648\u0627\u0636\u062d \u0648\u0644\u0627 \u064a\u064f\u0646\u0633\u0649.',
        'logo.case.ebdea.mockup1': '\u063a\u0644\u0627\u0641 \u0645\u0642\u062a\u0631\u062d',
        'logo.case.ebdea.mockup2': '\u0645\u062c\u0645\u0648\u0639\u0629 \u0633\u0648\u0634\u064a\u0627\u0644',
        'logo.case.ebdea.mockup3': '\u0645\u0642\u062f\u0645\u0629 \u062d\u0631\u0643\u064a\u0629',
        'logo.case.amira.type': '\u062a\u0635\u0645\u064a\u0645 \u0634\u0639\u0627\u0631 \u0623\u0632\u064a\u0627\u0621',
        'logo.case.amira.p1': '\u062a\u0637\u0644\u0628\u062a Amira \u0647\u0648\u064a\u0629 \u0623\u0632\u064a\u0627\u0621 \u0631\u0627\u0642\u064a\u0629 \u062a\u0639\u0628\u0651\u0631 \u0639\u0646 \u0627\u0644\u0623\u0646\u0627\u0642\u0629 \u0648\u0627\u0644\u0623\u0646\u0648\u062b\u0629 \u0648\u0646\u0628\u0631\u0629 \u0627\u0644\u0641\u062e\u0627\u0645\u0629 \u0627\u0644\u0645\u062d\u062a\u0634\u0645\u0629.',
        'logo.case.amira.p2': '\u0643\u0627\u0646\u062a \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u0623\u0646 \u062a\u0628\u062f\u0648 \u0641\u0627\u062e\u0631\u0629 \u062f\u0648\u0646 \u0625\u0641\u0631\u0627\u0637 \u0641\u064a \u0627\u0644\u0632\u062e\u0631\u0641\u0629\u060c \u0648\u0631\u0627\u0642\u064a\u0629 \u062f\u0648\u0646 \u0641\u0642\u062f\u0627\u0646 \u0627\u0644\u0646\u0639\u0648\u0645\u0629.',
        'logo.case.amira.p3': '\u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0633\u062a\u0648\u062d\u0649 \u0645\u0646 \u0627\u0644\u0645\u0644\u0643\u064a\u0629 \u064a\u062f\u0639\u0645 \u0645\u0639\u0646\u0649 \u0627\u0633\u0645 \u0623\u0645\u064a\u0631\u0629 \u0648\u064a\u062e\u0644\u0642 \u0647\u0648\u064a\u0629 \u0623\u0632\u064a\u0627\u0621 \u0641\u0627\u062e\u0631\u0629 \u0645\u062a\u062c\u0630\u0631\u0629 \u0641\u064a \u0627\u0644\u0641\u062e\u0627\u0645\u0629 \u0627\u0644\u0645\u062d\u062a\u0634\u0645\u0629.',
        'logo.case.amira.p4': '\u062e\u0637\u0648\u0637 \u0623\u0646\u064a\u0642\u0629 \u0648\u062a\u0646\u0627\u0638\u0631 \u0645\u062a\u0648\u0627\u0632\u0646 \u0648\u0637\u0628\u0627\u0639\u0629 \u0631\u0627\u0642\u064a\u0629 \u062a\u062e\u0644\u0642 \u0639\u0644\u0627\u0645\u0629 \u062a\u0628\u062f\u0648 \u0645\u0635\u0642\u0648\u0644\u0629 \u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u062a\u062c\u0632\u0626\u0629 \u0627\u0644\u0631\u0627\u0642\u064a\u0629.',
        'logo.case.amira.p5': '\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0648\u0644\u0627\u0641\u062a\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0631 \u0648\u062d\u0642\u0627\u0626\u0628 \u0627\u0644\u062a\u0633\u0648\u0642 \u0648\u0623\u062e\u062a\u0627\u0645 \u0627\u0644\u062a\u0639\u0628\u0626\u0629 \u0648\u0645\u0646\u0634\u0648\u0631\u0627\u062a \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0648\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062a\u0637\u0631\u064a\u0632.',
        'logo.case.amira.p6': '\u0647\u0648\u064a\u0629 \u0645\u062a\u062c\u0631 \u0639\u0628\u0627\u0621\u0627\u062a \u0641\u0627\u062e\u0631 \u0645\u0634\u0643\u0651\u0644\u0629 \u062d\u0648\u0644 \u0627\u0644\u0631\u0642\u064a \u0627\u0644\u0623\u0646\u062b\u0648\u064a \u0648\u0627\u0644\u0623\u0646\u0627\u0642\u0629 \u0627\u0644\u0645\u0644\u0643\u064a\u0629.',
        'logo.case.amira.mockup1': '\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0644\u0627\u0628\u0633',
        'logo.case.amira.mockup2': '\u062d\u0642\u064a\u0628\u0629 \u062a\u0633\u0648\u0642',
        'logo.case.amira.mockup3': '\u062e\u062a\u0645 \u0627\u0644\u062a\u0639\u0628\u0626\u0629',
        'logo.case.rozan.type': '\u0647\u0648\u064a\u0629 \u0623\u0632\u064a\u0627\u0621 \u0639\u0631\u0628\u064a\u0629 / \u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629',
        'logo.case.rozan.p1': '\u0627\u062d\u062a\u0627\u062c\u062a Rozan \u0625\u0644\u0649 \u0647\u0648\u064a\u0629 \u0623\u0632\u064a\u0627\u0621 \u062b\u0646\u0627\u0626\u064a\u0629 \u0627\u0644\u0644\u063a\u0629 \u062a\u062c\u0645\u0639 \u0627\u0644\u0623\u0646\u0627\u0642\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0628\u0635\u0648\u062a \u0645\u062a\u062c\u0631 \u0639\u0635\u0631\u064a.',
        'logo.case.rozan.p2': '\u0643\u0627\u0646 \u0627\u0644\u0634\u0639\u0627\u0631 \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u062a\u062d\u0642\u064a\u0642 \u062a\u0648\u0627\u0632\u0646 \u0628\u064a\u0646 \u0627\u0644\u0639\u0627\u0637\u0641\u0629 \u0648\u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0648\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 \u0645\u0639 \u0627\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u0646\u0639\u0648\u0645\u0629 \u0648\u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0639\u0644\u0649 \u0627\u0644\u0623\u0632\u064a\u0627\u0621.',
        'logo.case.rozan.p3': '\u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0632\u0647\u0631\u064a \u064a\u0636\u064a\u0641 \u0646\u0639\u0648\u0645\u0629 \u0648\u062c\u0645\u0627\u0644\u0627\u064b\u060c \u0628\u064a\u0646\u0645\u0627 \u0627\u0644\u0647\u064a\u0643\u0644 \u0627\u0644\u062b\u0646\u0627\u0626\u064a \u0627\u0644\u0644\u063a\u0629 \u064a\u0645\u0646\u062d \u0627\u0644\u0634\u0639\u0627\u0631 \u0627\u0644\u0639\u0627\u0637\u0641\u0629 \u0648\u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0645\u0639\u064b\u0627.',
        'logo.case.rozan.p4': '\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0632\u0647\u0631\u064a\u0629 \u0627\u0644\u0631\u0634\u064a\u0642\u0629 \u0648\u062a\u0648\u0627\u0632\u0646 \u0627\u0644\u062e\u0637\u0648\u0637 \u0627\u0644\u062f\u0642\u064a\u0642 \u0648\u0627\u0644\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u062b\u0646\u0627\u0626\u064a \u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0648\u0627\u0636\u062d \u064a\u062e\u0644\u0642\u0648\u0646 \u0631\u0642\u064a\u064b\u0627 \u062b\u0642\u0627\u0641\u064a\u064b\u0627 \u062f\u0648\u0646 \u0627\u0644\u062a\u0636\u062d\u064a\u0629 \u0628\u0627\u0644\u0648\u0636\u0648\u062d.',
        'logo.case.rozan.p5': '\u0644\u0627\u0641\u062a\u0627\u062a \u0627\u0644\u0645\u062d\u0644\u0627\u062a \u0648\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0648\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u062a\u0639\u0628\u0626\u0629 \u0648\u0647\u0627\u064a\u0644\u0627\u064a\u062a \u0625\u0646\u0633\u062a\u063a\u0631\u0627\u0645 \u0648\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0631 \u0648\u0643\u062a\u0627\u0644\u0648\u062c\u0627\u062a \u0627\u0644\u0645\u0648\u0633\u0645.',
        'logo.case.rozan.p6': '\u0647\u0648\u064a\u0629 \u0639\u0628\u0627\u0621\u0627\u062a \u062b\u0646\u0627\u0626\u064a\u0629 \u0627\u0644\u0644\u063a\u0629 \u062a\u062c\u0645\u0639 \u0627\u0644\u0646\u0639\u0648\u0645\u0629 \u0648\u0627\u0644\u0623\u0646\u0627\u0642\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0648\u0648\u0636\u0648\u062d \u0627\u0644\u0645\u062a\u062c\u0631 \u0627\u0644\u0639\u0635\u0631\u064a.',
        'logo.case.rozan.mockup1': '\u0648\u0627\u062c\u0647\u0629 \u0645\u062a\u062c\u0631',
        'logo.case.rozan.mockup2': '\u0628\u0637\u0627\u0642\u0629 \u0645\u0644\u0627\u0628\u0633',
        'logo.case.rozan.mockup3': '\u0643\u062a\u0627\u0644\u0648\u062c',
        'logo.case.natural.type': '\u062a\u0635\u0645\u064a\u0645 \u0634\u0639\u0627\u0631 \u063a\u0630\u0627\u0621 / \u0623\u0644\u0628\u0627\u0646',
        'logo.case.natural.p1': '\u0627\u062d\u062a\u0627\u062c\u062a Natural Pure \u0625\u0644\u0649 \u0647\u0648\u064a\u0629 \u063a\u0630\u0627\u0626\u064a\u0629 \u062a\u0639\u0628\u0651\u0631 \u0628\u0633\u0631\u0639\u0629 \u0639\u0646 \u0627\u0644\u0637\u0627\u0632\u062c\u064a\u0629 \u0648\u0627\u0644\u0646\u0642\u0627\u0621 \u0648\u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u0632\u0631\u0639\u0629 \u0648\u0627\u0644\u062b\u0642\u0629.',
        'logo.case.natural.p2': '\u0643\u0627\u0646 \u0627\u0644\u0634\u0639\u0627\u0631 \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u0623\u0646 \u064a\u0628\u062f\u0648 \u0637\u0628\u064a\u0639\u064a\u064b\u0627 \u0648\u0633\u0647\u0644 \u0627\u0644\u062a\u0639\u0627\u0645\u0644 \u0645\u0639 \u062c\u0639\u0644 \u0641\u0626\u0629 \u0627\u0644\u0623\u0644\u0628\u0627\u0646 \u0648\u0627\u0636\u062d\u0629 \u0641\u0648\u0631\u064a\u064b\u0627 \u0644\u0644\u0639\u0645\u0644\u0627\u0621.',
        'logo.case.natural.p3': '\u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0633\u062a\u0648\u062d\u0649 \u0645\u0646 \u0627\u0644\u0628\u0642\u0631\u0629 \u064a\u062a\u0635\u0644 \u0641\u0648\u0631\u064a\u064b\u0627 \u0628\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0623\u0644\u0628\u0627\u0646\u060c \u0628\u064a\u0646\u0645\u0627 \u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u062f\u0627\u0626\u0631\u064a \u064a\u062e\u0644\u0642 \u0627\u0646\u0637\u0628\u0627\u0639\u064b\u0627 \u0648\u062f\u064a\u064b\u0627 \u0648\u0637\u0628\u064a\u0639\u064a\u064b\u0627.',
        'logo.case.natural.p4': '\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u062f\u0627\u0626\u0631\u064a\u0629 \u0627\u0644\u0646\u0627\u0639\u0645\u0629 \u0648\u062a\u0628\u0627\u064a\u0646 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0637\u0627\u0632\u062c\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0642\u0629 \u0627\u0644\u0648\u0627\u0636\u062d\u0629 \u0628\u064a\u0646 \u0627\u0644\u0631\u0645\u0632 \u0648\u0627\u0644\u0643\u0644\u0645\u0629 \u062a\u062c\u0639\u0644 \u0627\u0644\u0647\u0648\u064a\u0629 \u0633\u0647\u0644\u0629 \u0627\u0644\u062a\u0645\u064a\u064a\u0632 \u0639\u0644\u0649 \u0627\u0644\u0623\u0631\u0641\u0641 \u0648\u0627\u0644\u0634\u0627\u0634\u0627\u062a.',
        'logo.case.natural.p5': '\u0632\u062c\u0627\u062c\u0627\u062a \u0627\u0644\u062d\u0644\u064a\u0628 \u0648\u0623\u0643\u0648\u0627\u0628 \u0627\u0644\u0632\u0628\u0627\u062f\u064a \u0648\u0644\u0627\u0641\u062a\u0627\u062a \u0627\u0644\u0645\u062d\u0644 \u0648\u062d\u0642\u0627\u0626\u0628 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0648\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0637\u0639\u0627\u0645 \u0648\u0627\u0644\u0645\u0644\u0635\u0642\u0627\u062a \u0648\u0645\u0646\u0634\u0648\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629.',
        'logo.case.natural.p6': '\u0634\u0639\u0627\u0631 \u0623\u0644\u0628\u0627\u0646 \u0648\u062f\u064a \u0645\u0628\u0646\u064a \u0644\u0644\u062a\u0639\u0628\u064a\u0631 \u0639\u0646 \u0627\u0644\u0637\u0627\u0632\u062c\u064a\u0629 \u0648\u0627\u0644\u0646\u0642\u0627\u0621 \u0648\u0627\u0644\u062b\u0642\u0629 \u0627\u0644\u064a\u0648\u0645\u064a\u0629.',
        'logo.case.natural.mockup1': '\u0632\u062c\u0627\u062c\u0629 \u062d\u0644\u064a\u0628',
        'logo.case.natural.mockup2': '\u0644\u0627\u0641\u062a\u0629 \u0645\u062a\u062c\u0631',
        'logo.case.natural.mockup3': '\u0645\u0644\u0635\u0642 \u0645\u0646\u062a\u062c',
        'logo.nav.prev': '\u2190 \u0627\u0644\u0631\u0633\u0645 \u0648\u0627\u0644\u0641\u0646',
        'logo.nav.next': '\u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u2192',
        /* Social Media */
        'social.eyebrow': '\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u2014 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627',
        'social.headline': '\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627',
        'social.overview': '\u062e\u0645\u0633 \u0639\u0644\u0627\u0645\u0627\u062a\u060c \u062e\u0645\u0633\u0629 \u0625\u064a\u0642\u0627\u0639\u0627\u062a \u0645\u062e\u062a\u0644\u0641\u0629 \u2014 \u0643\u0644 \u0648\u0627\u062d\u062f\u0629 \u0628\u0646\u0638\u0627\u0645 \u0625\u0646\u0633\u062a\u063a\u0631\u0627\u0645 \u062e\u0627\u0635 \u0628\u0647\u0627 \u0645\u0628\u0646\u064a \u0644\u0644\u0627\u062a\u0633\u0627\u0642 \u0639\u0644\u0649 \u0646\u0637\u0627\u0642 \u0648\u0627\u0633\u0639.',
        'social.plan.tag': '\u062a\u0633\u0648\u064a\u0642 \u0648\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629',
        'social.plan.overview': '\u062d\u0645\u0644\u0629 \u0625\u0646\u0633\u062a\u063a\u0631\u0627\u0645 \u0645\u0646\u0633\u0651\u0642\u0629 \u0645\u0628\u0646\u064a\u0629 \u0639\u0644\u0649 \u0647\u0648\u064a\u0629 \u0632\u0631\u0642\u0627\u0621 \u062c\u0631\u064a\u0626\u0629 \u0648\u0637\u0628\u0627\u0639\u0629 \u0639\u0631\u0628\u064a\u0629 \u0636\u062e\u0645\u0629 \u2014 \u062a\u062a\u0631\u062c\u0645 \u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0648\u0627\u0644\u0646\u0645\u0648 \u0648\u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0625\u0644\u0649 \u0634\u0628\u0643\u0629 \u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0645\u062a\u0635\u0644\u0629.',
        'social.luvia.tag': '\u0639\u0646\u0627\u064a\u0629 \u0628\u0627\u0644\u0628\u0634\u0631\u0629 \u00b7 \u0639\u0646\u0627\u064a\u0629 \u0628\u0627\u0644\u0634\u0639\u0631 \u00b7 \u0648\u0642\u0627\u064a\u0629 \u0645\u0646 \u0627\u0644\u0634\u0645\u0633',
        'social.luvia.overview': '\u0646\u0638\u0627\u0645 \u0627\u062c\u062a\u0645\u0627\u0639\u064a \u0641\u0627\u062e\u0631 \u0648\u0645\u0631\u0646 \u0644\u0639\u0644\u0627\u0645\u0629 \u0639\u0646\u0627\u064a\u0629 \u0628\u0627\u0644\u0628\u0634\u0631\u0629 \u0648\u0627\u0644\u0634\u0639\u0631 \u2014 \u0627\u0644\u062e\u0636\u0631\u0627\u0648\u0627\u062a \u0627\u0644\u0646\u0628\u0627\u062a\u064a\u0629 \u0648\u0627\u0644\u0623\u0628\u064a\u0636 \u0627\u0644\u0646\u0638\u064a\u0641 \u0648\u0644\u0645\u0633\u0627\u062a \u0628\u0631\u062a\u0642\u0627\u0644\u064a \u0648\u0627\u0642\u064d \u062f\u0627\u0641\u0626\u0629 \u0645\u0628\u0646\u064a\u0629 \u062d\u0648\u0644 \u062a\u0631\u0643\u064a\u0628\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c \u0627\u0644\u0628\u0637\u0644.',
        'social.palmhills.tag': '\u0636\u064a\u0627\u0641\u0629 \u0648\u0639\u0642\u0627\u0631\u0627\u062a',
        'social.palmhills.overview': '\u062d\u0645\u0644\u0629 \u0636\u064a\u0627\u0641\u0629 \u0645\u0628\u0646\u064a\u0629 \u062d\u0648\u0644 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0641\u064a\u0644\u0627 \u0627\u0644\u062e\u0627\u0635\u0629 \u2014 \u062a\u0635\u0648\u064a\u0631 \u0645\u0639\u0645\u0627\u0631\u064a \u0648\u0645\u0634\u0627\u0647\u062f \u0628\u062d\u0631\u064a\u0629 \u0648\u062d\u0645\u0627\u0645 \u0633\u0628\u0627\u062d\u0629 \u0648\u0644\u0645\u0633\u0627\u062a \u0630\u0647\u0628\u064a\u0629 \u062f\u0627\u0641\u0626\u0629 \u062a\u0636\u0639 \u0627\u0644\u0645\u0646\u062a\u062c\u0639 \u0641\u064a \u0645\u0643\u0627\u0646\u0629 \u0641\u0627\u062e\u0631\u0629 \u0648\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062a\u0639\u0627\u0645\u0644.',
        'social.ebdea.tag': '\u0648\u0643\u0627\u0644\u0629 \u062a\u0633\u0648\u064a\u0642 \u0631\u0642\u0645\u064a',
        'social.ebdea.overview': '\u062d\u0645\u0644\u0629 \u0630\u0647\u0628\u064a\u0629 \u0627\u0644\u0644\u0648\u0646 \u0644\u0648\u0643\u0627\u0644\u0629 \u062a\u0633\u0648\u064a\u0642 \u0631\u0642\u0645\u064a \u2014 \u0637\u0628\u0627\u0639\u0629 \u0639\u0631\u0628\u064a\u0629 \u062c\u0631\u064a\u0626\u0629 \u0648\u0625\u064a\u062d\u0627\u0621\u0627\u062a \u062b\u0642\u0627\u0641\u064a\u0629 \u0633\u0639\u0648\u062f\u064a\u0629 \u0648\u0645\u062d\u062a\u0648\u0649 \u0631\u0645\u0636\u0627\u0646 \u0648\u0627\u0644\u0639\u064a\u062f \u0627\u0644\u0645\u0648\u0633\u0645\u064a \u0645\u0628\u0646\u064a \u062d\u0648\u0644 \u0627\u0644\u0627\u0646\u062a\u0628\u0627\u0647 \u0648\u0627\u0644\u0648\u0636\u0648\u062d \u0648\u0627\u0644\u0646\u0645\u0648.',
        'social.salla.tag': '\u0645\u0646\u0635\u0629 \u062a\u062c\u0627\u0631\u0629 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629',
        'social.salla.overview': '\u062d\u0645\u0644\u0629 \u0632\u0631\u0642\u0627\u0621 \u0633\u0645\u0627\u0648\u064a\u0629 \u0648\u0628\u0631\u062a\u0642\u0627\u0644\u064a\u0629 \u0644\u0645\u0646\u0635\u0629 \u062a\u062c\u0627\u0631\u0629 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u2014 \u0645\u062d\u062a\u0648\u0649 \u0633\u0639\u0648\u062f\u064a \u0645\u0648\u0633\u0645\u064a \u0645\u0642\u062a\u0631\u0646 \u0628\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0645\u0648 \u0648\u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0645\u0628\u0646\u064a \u0644\u0623\u0635\u062d\u0627\u0628 \u0627\u0644\u0645\u062a\u0627\u062c\u0631.',
        'social.nav.prev': '\u2190 \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0634\u0639\u0627\u0631\u0627\u062a',
        'social.nav.next': '\u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u2192',
        /* Visual Identity */
        'vi.eyebrow': '\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u2014 \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0628\u0635\u0631\u064a\u0629',
        'vi.meta.brand': '\u0627\u0644\u0639\u0644\u0627\u0645\u0629',
        'vi.meta.industry': '\u0627\u0644\u0635\u0646\u0627\u0639\u0629',
        'vi.meta.scope': '\u0627\u0644\u0646\u0637\u0627\u0642',
        'vi.meta.scopeval': '\u0627\u0644\u0634\u0639\u0627\u0631\u060c \u0627\u0644\u062a\u063a\u0644\u064a\u0641\u060c \u0645\u0644\u0635\u0642\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0627\u0644\u0645\u0627\u0643\u064a\u062a\u0627\u062a\u060c \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627\u060c \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u0644\u0644\u062d\u0645\u0644\u0627\u062a',
        'vi.meta.role': '\u0627\u0644\u062f\u0648\u0631',
        'vi.meta.roleval': '\u062a\u0635\u0645\u064a\u0645 \u062c\u0631\u0627\u0641\u064a\u0643 / \u0625\u062f\u0627\u0631\u0629 \u0641\u0646\u064a\u0629 / \u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629',
        'vi.overview': '\u0646\u0638\u0627\u0645 \u0628\u0635\u0631\u064a \u0645\u062a\u0643\u0627\u0645\u0644 \u0644\u0639\u0646\u0627\u064a\u0629 \u0627\u0644\u0628\u0634\u0631\u0629 \u0645\u0628\u0646\u064a \u062d\u0648\u0644 \u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062a \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0629 \u0648\u0627\u0644\u0637\u0627\u0632\u062c\u064a\u0629 \u0648\u0648\u0636\u0648\u062d \u0627\u0644\u0645\u0646\u062a\u062c \u0648\u062c\u0645\u0627\u0644\u064a\u0627\u062a \u0627\u0644\u062c\u0645\u0627\u0644 \u0627\u0644\u0623\u062e\u0636\u0631 \u0627\u0644\u0631\u0627\u0642\u064a.',
        'vi.kicker1': '\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0639\u0644\u0627\u0645\u0629',
        'vi.h3.1': 'LUVIA \u0643\u0646\u0638\u0627\u0645 \u0639\u0646\u0627\u064a\u0629 \u0637\u0628\u064a\u0639\u064a',
        'vi.p1': '\u062a\u064f\u0642\u062f\u0651\u0645 LUVIA \u0643\u0639\u0644\u0627\u0645\u0629 \u0639\u0646\u0627\u064a\u0629 \u0637\u0628\u064a\u0639\u064a\u0629 \u0628\u0627\u0644\u0628\u0634\u0631\u0629 \u0648\u0627\u0644\u0634\u0639\u0631 \u0630\u0627\u062a \u062a\u0648\u062c\u0647 \u0646\u0628\u0627\u062a\u064a \u0646\u0638\u064a\u0641. \u062a\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0647\u0648\u064a\u0629 \u062f\u0631\u062c\u0627\u062a \u0627\u0644\u0623\u062e\u0636\u0631 \u0627\u0644\u0639\u0645\u064a\u0642 \u0648\u0627\u0644\u0645\u0631\u0626\u064a\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0648\u062d\u0627\u0629 \u0645\u0646 \u0627\u0644\u0623\u0648\u0631\u0627\u0642 \u0648\u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0628\u064a\u0636\u0627\u0621 \u0648\u0627\u0644\u062a\u062e\u0637\u064a\u0637\u0627\u062a \u0627\u0644\u0645\u0631\u0643\u0651\u0632\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062a\u062c \u0648\u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0639\u0636\u0648\u064a\u0629 \u0627\u0644\u0637\u0627\u0632\u062c\u0629 \u0644\u0644\u062a\u0639\u0628\u064a\u0631 \u0639\u0646 \u0627\u0644\u0646\u0642\u0627\u0621 \u0648\u0627\u0644\u0631\u0639\u0627\u064a\u0629 \u0648\u0627\u0644\u062b\u0642\u0629.',
        'vi.kicker2': '\u0646\u0638\u0627\u0645 \u0627\u0644\u0634\u0639\u0627\u0631',
        'vi.h3.2': '\u0634\u0639\u0627\u0631 \u0643\u0644\u0645\u064a \u0631\u0627\u0642\u064a \u0628\u0639\u0644\u0627\u0645\u0629 \u0646\u0628\u0627\u062a\u064a\u0629',
        'vi.p2': '\u064a\u062c\u0645\u0639 \u0627\u0644\u0634\u0639\u0627\u0631 \u0628\u064a\u0646 \u0627\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u0631\u0627\u0642\u064a\u0629 \u0648\u0631\u0645\u0632 \u0627\u0644\u0648\u0631\u0642\u0629\u060c \u0645\u0627\u0646\u062d\u064b\u0627 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0647\u0648\u064a\u0629 \u0637\u0628\u064a\u0639\u064a\u0629 \u0648\u0623\u0646\u064a\u0642\u0629 \u0648\u0645\u0631\u0643\u0651\u0632\u0629 \u0639\u0644\u0649 \u0627\u0644\u0639\u0646\u0627\u064a\u0629 \u0639\u0628\u0631 \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0627\u0644\u0641\u0627\u062a\u062d\u0629 \u0648\u0627\u0644\u062f\u0627\u0643\u0646\u0629.',
        'vi.logo.caption1': '\u0627\u0644\u0634\u0639\u0627\u0631 \u0627\u0644\u0623\u062e\u0636\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064a',
        'vi.logo.caption2': '\u0627\u0644\u0634\u0639\u0627\u0631 \u0627\u0644\u0623\u0628\u064a\u0636 \u0644\u0644\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0627\u0644\u062e\u0636\u0631\u0627\u0621 \u0627\u0644\u062f\u0627\u0643\u0646\u0629',
        'vi.kicker3': '\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0628\u0635\u0631\u064a\u0629',
        'vi.h3.3': '\u0646\u0628\u0627\u062a\u064a\u060c \u0637\u0627\u0632\u062c\u060c \u062a\u062c\u0627\u0631\u064a',
        'vi.token1': '\u0644\u0648\u062d\u0629 \u0627\u0644\u0623\u062e\u0636\u0631 \u0627\u0644\u0646\u0628\u0627\u062a\u064a \u0627\u0644\u0639\u0645\u064a\u0642',
        'vi.token2': '\u0645\u0633\u0627\u062d\u0629 \u0628\u064a\u0636\u0627\u0621 \u0646\u0638\u064a\u0641\u0629',
        'vi.token3': '\u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0623\u0648\u0631\u0627\u0642 \u0648\u0625\u064a\u062d\u0627\u0621\u0627\u062a \u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062a \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0629',
        'vi.token4': '\u0645\u0644\u0645\u0633 \u0627\u0644\u0645\u0627\u0621 \u0648\u0627\u0644\u0637\u0627\u0632\u062c\u064a\u0629 \u0648\u0627\u0644\u062a\u0648\u0647\u062c',
        'vi.token5': '\u0625\u0636\u0627\u0621\u0629 \u0646\u0627\u0639\u0645\u0629 \u0644\u0644\u0645\u0646\u062a\u062c',
        'vi.token6': '\u0645\u0631\u0648\u0646\u0629 \u0627\u0644\u062d\u0645\u0644\u0629 \u0639\u0631\u0628\u064a\u064b\u0627 \u0648\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u064b\u0627',
        'vi.atm1': '\u0623\u0648\u0631\u0627\u0642 \u0645\u0627\u0643\u0631\u0648', 'vi.atm2': '\u0642\u0637\u0631\u0627\u062a \u0645\u0627\u0621', 'vi.atm3': '\u0623\u0639\u0634\u0627\u0628 \u0637\u0628\u064a\u0639\u064a\u0629',
        'vi.atm4': '\u0645\u0644\u0645\u0633 \u0627\u0644\u0634\u0639\u0631', 'vi.atm5': '\u0631\u0641 \u0646\u0638\u064a\u0641', 'vi.atm6': '\u062e\u0644\u0641\u064a\u0629 \u062e\u0636\u0631\u0627\u0621 \u0646\u0627\u0639\u0645\u0629',
        'vi.kicker4': '\u062a\u0635\u0645\u064a\u0645 \u0645\u0644\u0635\u0642 \u0627\u0644\u0645\u0646\u062a\u062c',
        'vi.h3.4': '\u0645\u0646 \u0627\u0644\u0647\u0648\u064a\u0629 \u0625\u0644\u0649 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c',
        'vi.p4': '\u062a\u064f\u0638\u0647\u0631 \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062d\u0644\u0629 \u0643\u064a\u0641 \u062a\u0635\u0628\u062d \u0627\u0644\u0647\u0648\u064a\u0629 \u0645\u0644\u0635\u0642\u064b\u0627 \u0648\u0638\u064a\u0641\u064a\u064b\u0627 \u0644\u0644\u0645\u0646\u062a\u062c\u060c \u0645\u0648\u0627\u0632\u0646\u0629\u064b \u0628\u064a\u0646 \u0648\u0636\u0648\u062d \u0627\u0644\u0634\u0639\u0627\u0631 \u0648\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062a\u062c \u0648\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062a \u0648\u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0648\u062a\u0633\u0644\u0633\u0644 \u0627\u0644\u062a\u0639\u0628\u0626\u0629.',
        'vi.kicker5': '\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u062a\u0639\u0628\u0626\u0629',
        'vi.h3.5': '\u0645\u0646 \u0646\u0638\u0627\u0645 \u0645\u0627\u0643\u064a\u062a \u0641\u0627\u0631\u063a \u0625\u0644\u0649 \u0639\u0627\u0626\u0644\u0629 \u0645\u0646\u062a\u062c\u0627\u062a \u0645\u064f\u0639\u0644\u064e\u0651\u0645\u0629',
        'vi.p5': '\u064a\u064f\u0631\u0633\u064a \u0627\u0644\u0645\u0627\u0643\u064a\u062a \u0627\u0644\u0641\u0627\u0631\u063a \u0628\u0646\u064a\u0629 \u0639\u0627\u0626\u0644\u0629 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0628\u064a\u0646\u0645\u0627 \u064a\u064f\u0637\u0628\u0651\u0642 \u0627\u0644\u0625\u0635\u062f\u0627\u0631 \u0627\u0644\u0645\u064f\u0639\u0644\u064e\u0651\u0645 \u0647\u0648\u064a\u0629 LUVIA \u0627\u0644\u062e\u0636\u0631\u0627\u0621 \u0628\u0627\u062a\u0633\u0627\u0642 \u0639\u0628\u0631 \u0627\u0644\u0632\u062c\u0627\u062c\u0627\u062a \u0648\u0627\u0644\u0623\u0648\u0627\u0646\u064a \u0648\u062d\u0627\u0648\u064a\u0627\u062a \u0627\u0644\u0633\u064a\u0631\u0648\u0645 \u0648\u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0639\u0646\u0627\u064a\u0629 \u0628\u0627\u0644\u0628\u0634\u0631\u0629.',
        'vi.caption.blank': '\u0646\u0638\u0627\u0645 \u0627\u0644\u0645\u0627\u0643\u064a\u062a \u0627\u0644\u0641\u0627\u0631\u063a',
        'vi.caption.branded': '\u0645\u0627\u0643\u064a\u062a \u0627\u0644\u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0645\u064f\u0639\u0644\u064e\u0651\u0645\u0629 \u0628\u0640 LUVIA',
        'vi.kicker6': '\u0627\u0644\u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0645\u0646\u062a\u0647\u064a\u0629',
        'vi.h3.6': '\u0639\u0631\u0636 \u062a\u062c\u0627\u0631\u064a \u0645\u0635\u0642\u0648\u0644 \u0644\u0644\u0645\u0646\u062a\u062c',
        'vi.p6': '\u064a\u064f\u0638\u0647\u0631 \u0639\u0631\u0636 \u0627\u0644\u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0645\u0646\u062a\u0647\u064a\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0641\u064a \u0633\u064a\u0627\u0642 \u062a\u062c\u0627\u0631\u064a \u0645\u0635\u0642\u0648\u0644\u060c \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0636\u0648\u0621 \u0627\u0644\u0623\u062e\u0636\u0631 \u0648\u0627\u0644\u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0628\u064a\u0636\u0627\u0621 \u0648\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0644\u062e\u0644\u0642 \u0645\u0638\u0647\u0631 \u0639\u0646\u0627\u064a\u0629 \u0628\u0634\u0631\u0629 \u0631\u0627\u0642\u064d.',
        'vi.kicker7': '\u0627\u0644\u062d\u0636\u0648\u0631 \u0627\u0644\u0631\u0642\u0645\u064a',
        'vi.h3.7': '\u0647\u0648\u064a\u0629 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627',
        'vi.p7': '\u064a\u062d\u0627\u0641\u0638 \u062a\u0648\u062c\u0647 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u0639\u0644\u0649 \u0648\u0636\u0648\u062d \u0627\u0644\u0634\u0639\u0627\u0631 \u0648\u0646\u0638\u0627\u0641\u062a\u0647\u060c \u0645\u062a\u0631\u062c\u0645\u064b\u0627 \u0647\u0648\u064a\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0625\u0644\u0649 \u0646\u0642\u0627\u0637 \u062a\u0648\u0627\u0635\u0644 \u0628\u0623\u0633\u0644\u0648\u0628 \u0625\u0646\u0633\u062a\u063a\u0631\u0627\u0645 \u0648\u0641\u064a\u0633\u0628\u0648\u0643.',
        'vi.kicker8': '\u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u0644\u0644\u062d\u0645\u0644\u0627\u062a',
        'vi.h3.8': '\u0641\u0648\u0627\u0626\u062f \u0627\u0644\u0645\u0646\u062a\u062c \u0648\u0627\u0644\u062a\u0648\u0647\u062c \u0648\u0627\u0644\u0637\u0627\u0632\u062c\u064a\u0629 \u0648\u0627\u0644\u0639\u0646\u0627\u064a\u0629 \u0627\u0644\u062c\u0645\u0627\u0644\u064a\u0629',
        'vi.p8': '\u062a\u062c\u0645\u0639 \u0647\u0630\u0647 \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u062a\u0635\u0648\u064a\u0631 \u0627\u0644\u0645\u0646\u062a\u062c \u0648\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0646\u0628\u0627\u062a\u064a\u0629 \u0648\u0627\u0644\u0646\u0635\u0648\u0635 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0648\u0627\u062a\u0633\u0627\u0642 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062e\u0636\u0631\u0627\u0621 \u0627\u0644\u0642\u0648\u064a \u0644\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0639\u0627\u0644\u0645 \u0627\u0644\u062d\u0645\u0644\u0629 \u0645\u0639\u0631\u0648\u0641\u064b\u0627.',
        'vi.kicker9': '\u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u0645\u0648\u0633\u0645\u064a\u0629',
        'vi.h3.9': '\u0637\u0627\u0642\u0629 \u062a\u0631\u0648\u064a\u062c\u064a\u0629 \u062f\u0648\u0646 \u0641\u0642\u062f\u0627\u0646 \u0627\u0644\u0639\u0644\u0627\u0645\u0629',
        'vi.p9': '\u062a\u064f\u0638\u0647\u0631 \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u0644\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u0645\u0648\u0633\u0645\u064a\u0629 \u0643\u064a\u0641 \u064a\u0645\u0643\u0646 \u0644\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u0643\u064a\u0651\u0641 \u0645\u0639 \u0644\u062d\u0638\u0627\u062a \u062a\u0631\u0648\u064a\u062c\u064a\u0629 \u062e\u0627\u0635\u0629 \u0628\u064a\u0646\u0645\u0627 \u064a\u0628\u0642\u0649 \u0646\u0638\u0627\u0645 LUVIA \u0627\u0644\u0623\u062e\u0636\u0631 \u0645\u0639\u0631\u0648\u0641\u064b\u0627.',
        'vi.kicker10': '\u0627\u0644\u0637\u0627\u0632\u062c\u064a\u0629 \u0648\u0641\u0648\u0627\u0626\u062f \u0627\u0644\u0645\u0646\u062a\u062c',
        'vi.h3.10': '\u0633\u0631\u062f \u0627\u0644\u0639\u0646\u0627\u064a\u0629 \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0629 \u0628\u0627\u0644\u0628\u0634\u0631\u0629',
        'vi.p10': '\u062a\u0631\u0643\u0651\u0632 \u0647\u0630\u0647 \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0632\u062c\u064a\u0629 \u0648\u0627\u0644\u062a\u0646\u0638\u064a\u0641 \u0648\u0627\u0644\u062a\u0648\u0647\u062c \u0648\u0627\u0644\u0645\u0627\u0621 \u0648\u0641\u0648\u0627\u0626\u062f \u0627\u0644\u0639\u0646\u0627\u064a\u0629 \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0629 \u0628\u0627\u0644\u0628\u0634\u0631\u0629\u060c \u0645\u0648\u0633\u0651\u0639\u0629\u064b \u0627\u0644\u0647\u0648\u064a\u0629 \u0645\u0627 \u0648\u0631\u0627\u0621 \u0627\u0644\u062a\u0639\u0628\u0626\u0629 \u0625\u0644\u0649 \u0633\u0631\u062f \u0639\u0627\u0637\u0641\u064a \u0644\u0644\u0645\u0646\u062a\u062c.',
        'vi.nav.prev': '\u2190 \u0627\u0644\u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627',
        'vi.nav.next': '\u0627\u0644\u0628\u0646\u0631\u0627\u062a \u0648\u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a \u2192',
        /* Banners */
        'banners.eyebrow': '\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u2014 \u0627\u0644\u0628\u0646\u0631\u0627\u062a \u0648\u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a',
        'banners.headline': '\u0645\u062c\u0645\u0648\u0639\u0629 \u0627\u0644\u0637\u0628\u0627\u0639\u0629 \u0648\u0627\u0644\u062a\u0639\u0628\u0626\u0629',
        'banners.meta.category': '\u0627\u0644\u0642\u0633\u0645',
        'banners.meta.value': '\u0627\u0644\u0628\u0646\u0631\u0627\u062a \u0648\u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a',
        'banners.overview': '\u0623\u0639\u0645\u0627\u0644 \u0637\u0628\u0627\u0639\u0629 \u0648\u062a\u0639\u0628\u0626\u0629 \u062d\u064a\u062b \u064a\u062c\u0628 \u0639\u0644\u0649 \u0627\u0644\u0645\u0627\u062f\u0629 \u0648\u0627\u0644\u0637\u0628\u0627\u0639\u0629 \u0648\u0627\u0644\u0644\u0648\u0646 \u062d\u0645\u0644 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u062f\u0648\u0646 \u0642\u0648\u0644 \u0643\u0644\u0645\u0629.',
        'banners.block1.title': '\u0627\u0644\u0645\u0648\u062c\u0632',
        'banners.block1.desc': '\u0643\u0644 \u0642\u0637\u0639\u0629 \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u0627\u0644\u0635\u0645\u0648\u062f \u0641\u064a \u0627\u0644\u064a\u062f \u2014 \u0644\u0627 \u0623\u0646 \u062a\u0628\u062f\u0648 \u062c\u064a\u062f\u0629 \u0643\u0645\u0644\u0641 \u0645\u0633\u0637\u062d \u0641\u0642\u0637.',
        'banners.caption1': '\u0628\u0646\u0631 \u0645\u0637\u0628\u0648\u0639',
        'banners.block2.title': '\u0627\u0644\u0627\u062a\u062c\u0627\u0647',
        'banners.block2.desc': '\u062a\u0635\u0645\u064a\u0645 \u064a\u0623\u062e\u0630 \u0627\u0644\u0645\u0627\u062f\u0629 \u0641\u064a \u0627\u0644\u0627\u0639\u062a\u0628\u0627\u0631: \u062e\u064a\u0627\u0631\u0627\u062a \u0645\u062f\u0641\u0648\u0639\u0629 \u0628\u0643\u064a\u0641\u064a\u0629 \u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0634\u064a\u0621 \u0623\u0648 \u0637\u064a\u0651\u0647 \u0623\u0648 \u0625\u0645\u0633\u0627\u0643\u0647 \u0641\u0639\u0644\u064a\u064b\u0627.',
        'banners.caption2': '\u062f\u0631\u0627\u0633\u0627\u062a \u0627\u0644\u0645\u0648\u0627\u062f',
        'banners.block3.title': '\u0627\u0644\u0646\u0638\u0627\u0645',
        'banners.block3.desc': '\u0627\u0644\u0628\u0646\u0631 \u0648\u0627\u0644\u0641\u0644\u0627\u064a\u0631 \u0648\u0627\u0644\u0628\u0631\u0648\u0634\u0648\u0631 \u064a\u062a\u0634\u0627\u0631\u0643\u0648\u0646 \u0628\u0646\u064a\u0629 \u0648\u0627\u062d\u062f\u0629\u060c \u062d\u062a\u0649 \u064a\u062a\u0639\u0631\u0641 \u0627\u0644\u0639\u0645\u064a\u0644 \u0639\u0644\u0649 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0642\u0628\u0644 \u0623\u0646 \u064a\u0642\u0631\u0623 \u0643\u0644\u0645\u0629.',
        'banners.caption3': '\u0635\u0646\u062f\u0648\u0642 \u062a\u0639\u0628\u0626\u0629',
        'banners.caption4': '\u062a\u062e\u0637\u064a\u0637 \u0641\u0644\u0627\u064a\u0631',
        'banners.block4.title': '\u0627\u0644\u0645\u062e\u0631\u062c',
        'banners.block4.desc': '\u0645\u062c\u0645\u0648\u0639\u0629 \u0645\u062a\u0646\u0627\u0633\u0642\u0629 \u0645\u0646 \u0642\u0637\u0639 \u0627\u0644\u0637\u0628\u0627\u0639\u0629 \u0648\u0627\u0644\u062a\u0639\u0628\u0626\u0629\u060c \u0643\u0644 \u0645\u0646\u0647\u0627 \u0645\u0636\u0628\u0648\u0637\u0629 \u0644\u062a\u0646\u0633\u064a\u0642\u0647\u0627 \u0648\u062d\u0627\u0644\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647\u0627.',
        'banners.caption5': '\u0646\u0634\u0631 \u0628\u0631\u0648\u0634\u0648\u0631',
        'banners.caption6': '\u0644\u0627\u0641\u062a\u0629 \u062e\u0627\u0631\u062c\u064a\u0629',
        'banners.caption7': '\u062a\u0635\u0645\u064a\u0645 \u0645\u0644\u0635\u0642',
        'banners.nav.prev': '\u2190 \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0628\u0635\u0631\u064a\u0629',
        'banners.nav.next': '\u0627\u0644\u0631\u0633\u0645 \u0648\u0627\u0644\u0641\u0646 \u2192',
        /* Art */
        'art.eyebrow': '\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u2014 \u0627\u0644\u0631\u0633\u0645 \u0648\u0627\u0644\u0641\u0646',
        'art.headline': '\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a \u0648\u0627\u0644\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0628\u0635\u0631\u064a',
        'art.meta.category': '\u0627\u0644\u0642\u0633\u0645',
        'art.meta.value': '\u0641\u0646 / \u0631\u0633\u0645 \u062a\u0648\u0636\u064a\u062d\u064a',
        'art.overview': '\u0645\u062c\u0645\u0648\u0639\u0629 \u0645\u0646 \u062f\u0631\u0627\u0633\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0645\u0651\u0637\u0629 \u062a\u0633\u062a\u0643\u0634\u0641 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0638\u0644\u064a\u0629 \u0648\u0627\u0644\u0646\u0633\u0628\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0641 \u0648\u0627\u0644\u0633\u0631\u062f \u0627\u0644\u0628\u0635\u0631\u064a.',
        'art.intro': '\u062a\u0633\u062a\u0643\u0634\u0641 \u0647\u0630\u0647 \u0627\u0644\u0633\u0644\u0633\u0644\u0629 \u0643\u064a\u0641 \u064a\u0645\u0643\u0646 \u0644\u0644\u0635\u0648\u0631 \u0627\u0644\u0638\u0644\u064a\u0629 \u0627\u0644\u0642\u0648\u064a\u0629 \u062a\u062d\u062f\u064a\u062f \u0634\u062e\u0635\u064a\u0629 \u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0642\u0628\u0644 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0623\u0648 \u0627\u0644\u0644\u0648\u0646 \u0623\u0648 \u0627\u0644\u062a\u0638\u0644\u064a\u0644. \u064a\u0628\u062f\u0623 \u0643\u0644 \u062a\u0635\u0645\u064a\u0645 \u0628\u0634\u0643\u0644 \u0623\u0633\u0648\u062f \u0642\u0627\u0628\u0644 \u0644\u0644\u0642\u0631\u0627\u0621\u0629\u060c \u062b\u0645 \u064a\u062a\u0637\u0648\u0631 \u0625\u0644\u0649 \u0634\u062e\u0635\u064a\u0629 \u0645\u0646\u0645\u0651\u0637\u0629 \u0645\u0646\u062a\u0647\u064a\u0629 \u0628\u0632\u064a \u0648\u062a\u0639\u0628\u064a\u0631 \u0648\u062d\u0631\u0643\u0629 \u0648\u0645\u0648\u0642\u0641 \u0628\u0635\u0631\u064a.',
        'art.silhouette.caption': '\u0635\u0641 \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0638\u0644\u064a\u0629 \u2014 \u0627\u062e\u062a\u0628\u0627\u0631 \u0642\u0631\u0627\u0621\u0629 \u0643\u0644 \u0634\u062e\u0635\u064a\u0629 \u0648\u062d\u062c\u0645\u0647\u0627 \u0648\u0634\u062e\u0635\u064a\u062a\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u062a\u0638\u0644\u064a\u0644 \u0627\u0644\u0646\u0647\u0627\u0626\u064a.',
        'art.block1.title': '\u0627\u0644\u0645\u062d\u0627\u0631\u0628 \u0627\u0644\u0645\u0633\u0646',
        'art.block1.desc': '\u0634\u062e\u0635\u064a\u0629 \u0645\u0633\u0646 \u062c\u0627\u062b\u064d \u0645\u0628\u0646\u064a\u0629 \u062d\u0648\u0644 \u0627\u0644\u062a\u0648\u062a\u0631 \u0648\u0627\u0644\u0631\u064a\u0628\u0629 \u0648\u0627\u0644\u062d\u0636\u0648\u0631 \u0627\u0644\u062a\u0643\u062a\u064a\u0643\u064a. \u062a\u0631\u0643\u0651\u0632 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0638\u0644\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0645\u0646\u062d\u0646\u064a \u0648\u0634\u0643\u0644 \u0627\u0644\u0639\u0645\u0627\u0645\u0629 \u0648\u0627\u0644\u0642\u0628\u0636\u0629 \u0627\u0644\u0645\u0637\u0648\u064a\u0629 \u0648\u0644\u063a\u0629 \u0627\u0644\u062c\u0633\u062f \u0627\u0644\u0632\u0627\u0648\u064a\u0629 \u0642\u0628\u0644 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0632\u064a \u0648\u062a\u0639\u0628\u064a\u0631 \u0627\u0644\u0648\u062c\u0647 \u0648\u0627\u0644\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u062b\u0642\u0627\u0641\u064a \u0641\u064a \u0627\u0644\u0646\u0633\u062e\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064a\u0629.',
        'art.block2.title': '\u0627\u0644\u0645\u062e\u0644\u0648\u0642 \u0627\u0644\u0645\u0639\u0642\u0648\u0641',
        'art.block2.desc': '\u062a\u0635\u0645\u064a\u0645 \u0645\u062e\u0644\u0648\u0642 \u0645\u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u0627\u0644\u062a\u0634\u0631\u064a\u062d \u0627\u0644\u0645\u0628\u0627\u0644\u063a \u0648\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0639\u062f\u0648\u0627\u0646\u064a \u0648\u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0633\u0644\u0627\u062d. \u062a\u064f\u0631\u0633\u064a \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0638\u0644\u064a\u0629 \u0627\u0644\u0639\u0645\u0648\u062f \u0627\u0644\u0641\u0642\u0631\u064a \u0627\u0644\u0645\u0646\u062d\u0646\u064a \u0644\u0644\u0648\u062d\u0634 \u0648\u0634\u0643\u0644 \u0627\u0644\u0631\u0623\u0633 \u0627\u0644\u062d\u0627\u062f \u0648\u0627\u0644\u0623\u0637\u0631\u0627\u0641 \u0627\u0644\u0637\u0648\u064a\u0644\u0629 \u0648\u0627\u0644\u0633\u0644\u0627\u062d \u0627\u0644\u0645\u0639\u0642\u0648\u0641 \u0627\u0644\u0636\u062e\u0645 \u0642\u0628\u0644 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0644\u0645\u0633 \u0648\u0627\u0644\u062f\u0631\u0639 \u0648\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062c\u0644\u062f \u0648\u062a\u0628\u0627\u064a\u0646 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0641\u064a \u0627\u0644\u062a\u0638\u0644\u064a\u0644 \u0627\u0644\u0646\u0647\u0627\u0626\u064a.',
        'art.block3.title': '\u0627\u0644\u0645\u0642\u0627\u062a\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0642',
        'art.block3.desc': '\u0634\u062e\u0635\u064a\u0629 \u0642\u0648\u064a\u0629 \u0645\u0646\u0645\u0651\u0637\u0629 \u0645\u0628\u0646\u064a\u0629 \u0639\u0644\u0649 \u062a\u0628\u0627\u064a\u0646 \u0646\u0633\u0628 \u0645\u062a\u0637\u0631\u0641: \u062c\u0630\u0639 \u0648\u0630\u0631\u0627\u0639\u0627\u0646 \u0636\u062e\u0645\u0627\u0646 \u0645\u0642\u0627\u0628\u0644 \u0633\u0627\u0642\u064a\u0646 \u0631\u0641\u064a\u0639\u062a\u064a\u0646. \u062a\u062c\u0639\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0638\u0644\u064a\u0629 \u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062a\u0645\u064a\u064a\u0632 \u0641\u0648\u0631\u064a\u064b\u0627\u060c \u0628\u064a\u0646\u0645\u0627 \u064a\u0636\u064a\u0641 \u0627\u0644\u062a\u0638\u0644\u064a\u0644 \u0627\u0644\u0646\u0647\u0627\u0626\u064a \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0648\u0627\u0644\u0630\u0631\u0627\u0639\u064a\u0646 \u0627\u0644\u062e\u0634\u0628\u064a\u062a\u064a\u0646 \u0627\u0644\u0645\u064a\u0643\u0627\u0646\u064a\u0643\u064a\u062a\u064a\u0646 \u0648\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u062f\u0627\u0641\u0626\u0629 \u0648\u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0627\u0644\u0628\u0637\u0648\u0644\u064a\u0629 \u0627\u0644\u0641\u0643\u0627\u0647\u064a\u0629.',
        'art.block4.title': '\u0627\u0644\u062b\u0646\u0627\u0626\u064a \u0627\u0644\u0634\u0627\u0628',
        'art.block4.desc': '\u062f\u0631\u0627\u0633\u0629 \u062b\u0646\u0627\u0626\u064a \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a \u0642\u0627\u0626\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u062a\u0646\u0627\u0642\u0636: \u0634\u062e\u0635\u064a\u0629 \u0637\u0648\u064a\u0644\u0629 \u0647\u0627\u062f\u0626\u0629 \u0648\u0627\u0642\u064a\u0629 \u0648\u0634\u062e\u0635\u064a\u0629 \u0642\u0635\u064a\u0631\u0629 \u063a\u0627\u0636\u0628\u0629 \u0646\u0634\u064a\u0637\u0629. \u062a\u062e\u062a\u0628\u0631 \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0638\u0644\u064a\u0629 \u0627\u0644\u0639\u0644\u0627\u0642\u0629 \u0628\u064a\u0646 \u0623\u062d\u062c\u0627\u0645\u0647\u0645\u0627 \u0648\u0645\u0648\u0627\u0642\u0641\u0647\u0645\u0627\u060c \u0628\u064a\u0646\u0645\u0627 \u064a\u0636\u064a\u0641 \u0627\u0644\u062a\u0638\u0644\u064a\u0644 \u0627\u0644\u0646\u0647\u0627\u0626\u064a \u0627\u0644\u062a\u0639\u0628\u064a\u0631 \u0648\u0627\u0644\u0632\u064a \u0648\u062a\u0648\u062a\u0631 \u0627\u0644\u0642\u0635\u0629.',
        'art.silhouette.label': '\u062f\u0631\u0627\u0633\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0638\u0644\u064a\u0629',
        'art.final.label': '\u0627\u0644\u062a\u0638\u0644\u064a\u0644 \u0627\u0644\u0646\u0647\u0627\u0626\u064a',
        'art.closing.caption': '\u0635\u0641 \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a \u0627\u0644\u0646\u0647\u0627\u0626\u064a \u2014 \u064a\u062c\u0645\u0639 \u0627\u0644\u062f\u0631\u0627\u0633\u0627\u062a \u0627\u0644\u0641\u0631\u062f\u064a\u0629 \u0641\u064a \u0646\u0638\u0627\u0645 \u0628\u0635\u0631\u064a \u0645\u062a\u0645\u0627\u0633\u0643 \u0648\u0627\u062d\u062f.',
        'art.nav.prev': '\u2190 \u0627\u0644\u0628\u0646\u0631\u0627\u062a \u0648\u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a',
        'art.nav.next': '\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0634\u0639\u0627\u0631\u0627\u062a \u2192',
        /* Contact */
        'contact.eyebrow': '\u062a\u0648\u0627\u0635\u0644 \u2014 03',
        'contact.headline': '\u0644\u0646\u0628\u0646\u0650 \u0645\u0639\u064b\u0627 \u0646\u0638\u0627\u0645\u064b\u0627 \u0628\u0635\u0631\u064a\u064b\u0627 \u062d\u0627\u062f\u064b\u0627 \u0648\u0648\u0627\u0636\u062d\u064b\u0627 \u0644\u0627 \u064a\u064f\u062a\u062c\u0627\u0647\u0644.',
        'contact.email.label': '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
        'contact.phone.label': '\u0627\u0644\u0647\u0627\u062a\u0641',
        'contact.location.label': '\u0627\u0644\u0645\u0648\u0642\u0639',
        'contact.location.value': '\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629\u060c \u0645\u0635\u0631',
        'contact.social.label': '\u0627\u0644\u0631\u0648\u0627\u0628\u0637',
        'contact.behance': '\u0628\u064a\u0647\u0627\u0646\u0633',
        'contact.linkedin': '\u0644\u064a\u0646\u0643\u062f\u0625\u0646',
        'contact.whatsapp': '\u0648\u0627\u062a\u0633\u0627\u0628',
        /* Footer */
        'footer.social.label': '\u0627\u0644\u0631\u0648\u0627\u0628\u0637',
        'footer.behance': '\u0628\u064a\u0647\u0627\u0646\u0633',
        'footer.linkedin': '\u0644\u064a\u0646\u0643\u062f\u0625\u0646',
        'footer.whatsapp': '\u0648\u0627\u062a\u0633\u0627\u0628',
        'footer.location.label': '\u0627\u0644\u0645\u0648\u0642\u0639',
        'footer.location.value': '\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629\u060c \u0645\u0635\u0631',
        'footer.availability.label': '\u0627\u0644\u062a\u0648\u0641\u0631',
        'footer.availability.value': '\u0645\u062a\u0627\u062d \u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u062c\u062f\u064a\u062f\u0629',
        'footer.expertise.label': '\u0627\u0644\u062a\u062e\u0635\u0635',
        'footer.expertise.value': '\u0647\u0648\u064a\u0629 \u0628\u0635\u0631\u064a\u0629 \u00b7 \u0633\u0648\u0634\u064a\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u00b7 \u0625\u062f\u0627\u0631\u0629 \u0641\u0646\u064a\u0629',
        'footer.copyright': '\u00a9 2026 \u0623\u062d\u0645\u062f \u0627\u0644\u0628\u0627\u0632. \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.',
        'footer.backtotop': '\u0627\u0644\u0631\u062c\u0648\u0639 \u0644\u0644\u0623\u0639\u0644\u0649 \u2191'
      }
    };

    var lang = localStorage.getItem('portfolio-lang') || 'en';

    function applyLang(l) {
      lang = l;
      localStorage.setItem('portfolio-lang', l);

      // Update html element
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.classList.toggle('lang-ar', l === 'ar');

      // Translate all data-i18n elements
      var t = translations[l];
      var els = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < els.length; i++) {
        var key = els[i].getAttribute('data-i18n');
        if (t[key] !== undefined) {
          els[i].textContent = t[key];
        }
      }

      // Update toggle button text + lang attr
      var btns = document.querySelectorAll('.lang-toggle');
      for (var b = 0; b < btns.length; b++) {
        btns[b].textContent = l === 'ar' ? 'English' : '\u0639\u0631\u0628\u064a';
        btns[b].setAttribute('lang', l === 'ar' ? 'en' : 'ar');
      }

      // Update slider position labels
      updateDynamicLabels(t);
    }

    function updateDynamicLabels(t) {
      // Rail
      var railPos = document.getElementById('railPosition');
      if (railPos) {
        var m = railPos.textContent.match(/\d+\s*\/\s*\d+/);
        if (m && t['career.label']) {
          railPos.textContent = t['career.label'] + ' ' + m[0];
        }
      }
      // Services
      var svcPos = document.getElementById('servicesPosition');
      if (svcPos) {
        var s = svcPos.textContent.match(/\d+\s*\/\s*\d+/);
        if (s && t['services.label']) {
          svcPos.textContent = t['services.label'] + ' ' + s[0];
        }
      }
    }

    // Wire click handlers
    var toggleBtns = document.querySelectorAll('.lang-toggle');
    for (var t = 0; t < toggleBtns.length; t++) {
      toggleBtns[t].addEventListener('click', (function() {
        applyLang(lang === 'ar' ? 'en' : 'ar');
      }));
    }

    // Apply on page load (respects localStorage)
    applyLang(lang);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoader();
    initHeader();
    initMobileMenu();
    initProgress();
    initReveals();
    initParallax();
    initPortfolioCarousel();
    initCursor();
    initIdentityPanelGlow();
    initClock();
    initRail();
    initServicesSlider();
    initHeroMotion();
    initMagnetic();
    initTilt();
    initI18n();
  });
})();
