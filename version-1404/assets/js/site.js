(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function setupNavigation() {
    var button = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-index]'));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-index')) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var root = form.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
      var search = form.querySelector('[data-filter-search]');
      var type = form.querySelector('[data-filter-type]');
      var year = form.querySelector('[data-filter-year]');
      var category = form.querySelector('[data-filter-category]');
      function apply() {
        var q = search ? search.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var categoryValue = category ? category.value : '';
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var matched = true;
          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }
          if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
            matched = false;
          }
          if (yearValue && (card.getAttribute('data-year') || '') !== yearValue) {
            matched = false;
          }
          if (categoryValue && (card.getAttribute('data-category') || '') !== categoryValue) {
            matched = false;
          }
          card.hidden = !matched;
        });
      }
      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      var params = new URLSearchParams(window.location.search);
      if (search && params.get('q')) {
        search.value = params.get('q');
      }
      apply();
    });
  }

  window.setupMoviePlayer = function (streamUrl, videoId, playId, overlayId) {
    var video = document.getElementById(videoId);
    var play = document.getElementById(playId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var started = false;
    function attach() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function playVideo() {
      attach();
      overlay.classList.add('hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    overlay.addEventListener('click', playVideo);
    if (play) {
      play.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (!started) {
        playVideo();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
