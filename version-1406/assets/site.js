(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    var index = Number(dot.getAttribute("data-hero-dot") || 0);
                    show(index);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var searchInput = document.querySelector("[data-card-search]");
        if (searchInput && query) {
            searchInput.value = query;
        }

        document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
            var keywordInput = scope.querySelector("[data-card-search]");
            var typeSelect = scope.querySelector("[data-card-type]");
            var regionSelect = scope.querySelector("[data-card-region]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

            function filterCards() {
                var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
                var typeValue = typeSelect ? typeSelect.value.trim() : "";
                var regionValue = regionSelect ? regionSelect.value.trim() : "";

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var type = card.getAttribute("data-type") || "";
                    var region = card.getAttribute("data-region") || "";
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesType = !typeValue || type.indexOf(typeValue) !== -1;
                    var matchesRegion = !regionValue || region.indexOf(regionValue) !== -1;
                    card.classList.toggle("is-hidden", !(matchesKeyword && matchesType && matchesRegion));
                });
            }

            [keywordInput, typeSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filterCards);
                    control.addEventListener("change", filterCards);
                }
            });

            filterCards();
        });
    });
})();
