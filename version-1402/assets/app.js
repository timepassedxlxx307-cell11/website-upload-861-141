(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function initMenu() {
        var button = document.querySelector('.menu-button');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                button.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('.hero-carousel');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-target') || 0));
                play();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function getSearchFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function initFilters() {
        var panels = document.querySelectorAll('.listing-section');
        panels.forEach(function (panel) {
            var input = panel.querySelector('.movie-search');
            var chips = Array.prototype.slice.call(panel.querySelectorAll('.filter-chip'));
            var cards = Array.prototype.slice.call(panel.querySelectorAll('.movie-card'));
            var empty = panel.querySelector('.empty-state');
            var activeFilter = 'all';
            if (!input || !cards.length) {
                return;
            }
            var urlQuery = getSearchFromUrl();
            if (urlQuery && !input.value) {
                input.value = urlQuery;
            }

            function cardText(card) {
                return [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-tags') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
            }

            function apply() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
                    var show = matchesQuery && matchesFilter;
                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            input.addEventListener('input', apply);
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    activeFilter = chip.getAttribute('data-filter') || 'all';
                    chips.forEach(function (item) {
                        item.classList.toggle('active', item === chip);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll('.video-shell').forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            if (!video || !overlay) {
                return;
            }
            var stream = overlay.getAttribute('data-stream') || video.getAttribute('data-stream') || '';
            var loaded = false;
            var hls = null;

            function loadStream() {
                if (loaded || !stream) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function start() {
                loadStream();
                shell.classList.add('is-playing');
                overlay.hidden = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }

            overlay.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (!loaded) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
                overlay.hidden = true;
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
