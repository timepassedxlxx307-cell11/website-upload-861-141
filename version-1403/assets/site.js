(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.getElementById("mobileNav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-filter-input]");
      var reset = form.querySelector("[data-filter-reset]");
      var list = document.querySelector("[data-filter-list]");
      if (!input || !list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);

      function apply() {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search") || card.textContent);
          card.classList.toggle("is-filtered-out", query && haystack.indexOf(query) === -1);
        });
      }

      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) {
        input.value = initial;
      }

      input.addEventListener("input", apply);
      if (reset) {
        reset.addEventListener("click", function () {
          window.setTimeout(function () {
            input.value = "";
            apply();
            input.focus();
          }, 0);
        });
      }
      apply();
    });
  }

  window.initializePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var attached = false;
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    }

    function start() {
      attach();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
}());
