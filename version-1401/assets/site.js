(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var button = document.querySelector(".nav-toggle");
        var menu = document.querySelector("#mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
        var previous = carousel.querySelector("[data-slide-prev]");
        var next = carousel.querySelector("[data-slide-next]");
        var index = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        }));
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide-dot")) || 0);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(index);
        start();
    }

    function uniqueSorted(values) {
        return Array.prototype.slice.call(new Set(values.filter(Boolean))).sort(function (a, b) {
            return String(a).localeCompare(String(b), "zh-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select || select.options.length > 1) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var input = scope.querySelector("[data-filter-input]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var empty = scope.querySelector("[data-filter-empty]");

            fillSelect(regionSelect, uniqueSorted(cards.map(function (card) {
                return card.getAttribute("data-region");
            })));
            fillSelect(typeSelect, uniqueSorted(cards.map(function (card) {
                return card.getAttribute("data-type");
            })));
            fillSelect(yearSelect, uniqueSorted(cards.map(function (card) {
                return card.getAttribute("data-year");
            })).reverse());

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var region = regionSelect ? regionSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-text") || card.textContent || "").toLowerCase();
                    var matched = true;
                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (region && card.getAttribute("data-region") !== region) {
                        matched = false;
                    }
                    if (type && card.getAttribute("data-type") !== type) {
                        matched = false;
                    }
                    if (year && card.getAttribute("data-year") !== year) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".player-overlay");
            if (!video || !button) {
                return;
            }
            var sourceElement = video.querySelector("source");
            var source = sourceElement ? sourceElement.getAttribute("src") : "";
            var hls = null;
            var loaded = false;

            function play() {
                if (!source) {
                    return;
                }
                if (loaded) {
                    video.play().catch(function () {});
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }
            }

            button.addEventListener("click", function () {
                play();
            });
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            video.addEventListener("ended", function () {
                button.classList.remove("is-hidden");
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
