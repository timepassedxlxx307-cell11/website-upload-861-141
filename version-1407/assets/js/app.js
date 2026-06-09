(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var prev = slider.querySelector(".hero-prev");
      var next = slider.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function play() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function reset() {
        if (timer) {
          window.clearInterval(timer);
        }
        play();
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          reset();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          reset();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          reset();
        });
      }

      show(0);
      play();
    }

    var input = document.getElementById("search-input");
    var typeFilter = document.getElementById("type-filter");
    var regionFilter = document.getElementById("region-filter");
    var categoryFilter = document.getElementById("category-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    var empty = document.getElementById("empty-state");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var keyword = normalize(input ? input.value : "");
      var typeValue = normalize(typeFilter ? typeFilter.value : "");
      var regionValue = normalize(regionFilter ? regionFilter.value : "");
      var categoryValue = normalize(categoryFilter ? categoryFilter.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category
        ].join(" "));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var okRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
        var okCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
        var visible = okKeyword && okType && okRegion && okCategory;
        card.classList.toggle("is-filter-hidden", !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    [input, typeFilter, regionFilter, categoryFilter].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilters);
        node.addEventListener("change", applyFilters);
      }
    });

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
    }
    applyFilters();
  });

  window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var loaded = false;

    function loadAndPlay() {
      if (!video || !streamUrl) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        loaded = true;
      }

      if (button) {
        button.classList.add("is-hidden");
      }

      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", loadAndPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });

      video.addEventListener("ended", function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
          hlsInstance.stopLoad();
        }
      });
    }
  };
})();
