(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function textValue(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
            });
        }

        var slider = document.querySelector('[data-hero-slider]');

        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }

            function play() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-slide-dot') || 0));
                    play();
                });
            });

            show(0);
            play();
        }

        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var genreButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-genre]'));
            var grid = scope.parentElement.querySelector('.catalog-grid');
            var activeGenre = '';

            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

            function apply() {
                var query = textValue(input ? input.value : '');
                var type = textValue(typeSelect ? typeSelect.value : '');
                var year = textValue(yearSelect ? yearSelect.value : '');
                var genre = textValue(activeGenre);

                cards.forEach(function (card) {
                    var title = textValue(card.getAttribute('data-title'));
                    var cardType = textValue(card.getAttribute('data-type'));
                    var cardGenre = textValue(card.getAttribute('data-genre'));
                    var cardYear = textValue(card.getAttribute('data-year'));
                    var region = textValue(card.getAttribute('data-region'));
                    var haystack = [title, cardType, cardGenre, cardYear, region].join(' ');
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }

                    if (type && cardType !== type) {
                        matched = false;
                    }

                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    if (genre && cardGenre.indexOf(genre) === -1) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            if (typeSelect) {
                typeSelect.addEventListener('change', apply);
            }

            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }

            genreButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeGenre = button.getAttribute('data-filter-genre') || '';
                    genreButtons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            });
        });
    });
})();
