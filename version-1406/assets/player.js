(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (root) {
            var video = root.querySelector("video");
            var overlay = root.querySelector(".player-overlay");
            var stream = root.getAttribute("data-stream");
            var loaded = false;
            var hls = null;

            function attachStream() {
                if (loaded || !video || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    loaded = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    loaded = true;
                    return;
                }
                video.src = stream;
                loaded = true;
            }

            function startPlayback(event) {
                if (event) {
                    event.preventDefault();
                }
                attachStream();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.controls = true;
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", startPlayback);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded || video.paused) {
                        startPlayback();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });
                video.addEventListener("ended", function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
                window.addEventListener("pagehide", function () {
                    if (hls) {
                        hls.destroy();
                        hls = null;
                    }
                });
            }
        });
    });
})();
