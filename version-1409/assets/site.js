(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            toggle.textContent = menu.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var action = form.getAttribute("action") || "search.html";
                var value = input ? input.value.trim() : "";
                window.location.href = value ? action + "?q=" + encodeURIComponent(value) : action;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function schedule() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                schedule();
            });
        }

        show(0);
        schedule();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var yearSelect = document.querySelector("[data-filter-select='year']");
        var typeSelect = document.querySelector("[data-filter-select='type']");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function apply() {
            var q = normalize(input ? input.value : "");
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute("data-search") || card.getAttribute("data-title"));
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matched = (!q || search.indexOf(q) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        [input, yearSelect, typeSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });

        apply();
    }

    function setupPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        if (!video) {
            return;
        }
        var src = video.getAttribute("data-src");
        var attached = false;

        function attachSource() {
            if (!src || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                shell.hlsInstance = hls;
            } else {
                video.src = src;
            }
        }

        function startPlayback() {
            attachSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        attachSource();

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("playing", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
