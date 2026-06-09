(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var configNode = document.getElementById('play-config');
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var startButton = document.querySelector('[data-player-start]');

        if (!configNode || !video) {
            return;
        }

        var config = {};

        try {
            config = JSON.parse(configNode.textContent || '{}');
        } catch (error) {
            config = {};
        }

        var src = config.src || '';
        var loaded = false;
        var hls = null;
        var pendingPlay = false;

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function showOverlay() {
            if (overlay && video.paused) {
                overlay.classList.remove('is-hidden');
            }
        }

        function playVideo() {
            var attempt = video.play();

            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        function loadVideo() {
            if (loaded || !src) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (pendingPlay) {
                        playVideo();
                    }
                });
            } else {
                video.src = src;
            }
        }

        function start() {
            pendingPlay = true;
            loadVideo();
            hideOverlay();
            playVideo();
        }

        if (startButton) {
            startButton.addEventListener('click', start);
        }

        if (overlay && overlay !== startButton) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', hideOverlay);
        video.addEventListener('pause', showOverlay);
        video.addEventListener('ended', showOverlay);

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
