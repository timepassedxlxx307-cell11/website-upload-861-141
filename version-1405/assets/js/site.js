(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var controls = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-control]"));
            var active = 0;
            var timer = null;

            function showSlide(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === active);
                });
                controls.forEach(function (control, controlIndex) {
                    control.classList.toggle("is-active", controlIndex === active);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    showSlide(active + 1);
                }, 5600);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            controls.forEach(function (control, index) {
                control.addEventListener("click", function () {
                    showSlide(index);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            start();
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var filterRows = Array.prototype.slice.call(document.querySelectorAll("[data-filter-row]"));

        function applyFilter(scope) {
            var input = scope.querySelector("[data-search-input]");
            var list = scope.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
            var emptyState = scope.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
            var activeFilter = "all";
            var activeButton = scope.querySelector("[data-filter].is-active");

            if (activeButton) {
                activeFilter = activeButton.getAttribute("data-filter") || "all";
            }

            if (!list) {
                return;
            }

            var query = input ? input.value.trim().toLowerCase() : "";
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var category = card.getAttribute("data-category") || "";
                var matchesText = !query || text.indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || category === activeFilter;
                var shouldShow = matchesText && matchesFilter;

                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        searchInputs.forEach(function (input) {
            var scope = input.closest("main") || document;
            input.addEventListener("input", function () {
                applyFilter(scope);
            });
        });

        filterRows.forEach(function (row) {
            var scope = row.closest("main") || document;
            var buttons = Array.prototype.slice.call(row.querySelectorAll("[data-filter]"));

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    applyFilter(scope);
                });
            });
        });

        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-video-url]");
            var hlsInstance = null;
            var loaded = false;

            if (!video || !button) {
                return;
            }

            function loadVideo() {
                var url = button.getAttribute("data-video-url");

                if (!url || loaded) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }

                loaded = true;
            }

            function beginPlayback() {
                loadVideo();
                var playRequest = video.play();

                if (playRequest && typeof playRequest.catch === "function") {
                    playRequest.catch(function () {});
                }
            }

            button.addEventListener("click", beginPlayback);
            video.addEventListener("click", function () {
                if (video.paused) {
                    beginPlayback();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    player.classList.remove("is-playing");
                }
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    });
})();
