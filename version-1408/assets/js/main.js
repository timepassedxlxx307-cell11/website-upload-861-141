(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var currentSlide = 0;
  var slideTimer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === currentSlide);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === currentSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var target = Number(dot.getAttribute("data-slide-target") || "0");
      setSlide(target);

      if (slideTimer) {
        window.clearInterval(slideTimer);
        startSlides();
      }
    });
  });

  startSlides();

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  var filterInput = document.querySelector(".movie-filter-input");
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-select"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var emptyResult = document.querySelector(".empty-result");

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : "");
    var activeFilters = {};

    filterSelects.forEach(function (select) {
      var key = select.getAttribute("data-filter");
      activeFilters[key] = normalize(select.value);
    });

    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year"));
      var matched = !keyword || haystack.indexOf(keyword) !== -1;

      Object.keys(activeFilters).forEach(function (key) {
        var value = activeFilters[key];
        if (!value) {
          return;
        }

        var dataValue = normalize(card.getAttribute("data-" + key));
        if (dataValue.indexOf(value) === -1) {
          matched = false;
        }
      });

      card.style.display = matched ? "" : "none";
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  if (filterInput) {
    var query = getQueryValue("q");
    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener("input", applyFilters);
  }

  filterSelects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });

  applyFilters();
})();

function initVideoPlayer(containerId, sourceUrl) {
  var root = document.getElementById(containerId);

  if (!root) {
    return;
  }

  var video = root.querySelector("video");
  var overlay = root.querySelector(".video-overlay");
  var attached = false;
  var hlsInstance = null;

  function attachSource() {
    if (!video || attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      attached = true;
      return;
    }

    if (globalThis.Hls && globalThis.Hls.isSupported()) {
      hlsInstance = new globalThis.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = sourceUrl;
    attached = true;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function showOverlay() {
    if (overlay) {
      overlay.classList.remove("is-hidden");
    }
  }

  function playVideo() {
    attachSource();
    hideOverlay();

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        showOverlay();
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  if (video) {
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showOverlay();
      }
    });
    video.addEventListener("ended", showOverlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
