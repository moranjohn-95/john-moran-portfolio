const videoPreview = document.querySelector("[data-video-preview]");

if (videoPreview) {
  const previewVideo = videoPreview.querySelector(".project-preview-video");
  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  const resetPlaybackTime = () => {
    try {
      previewVideo.currentTime = 0;
    } catch {
      return;
    }
  };

  const resetVideoPreview = () => {
    if (!previewVideo) {
      return;
    }

    previewVideo.pause();
    resetPlaybackTime();
    previewVideo.setAttribute("aria-hidden", "true");
    videoPreview.classList.remove("is-playing");
  };

  const playVideoPreview = () => {
    if (!previewVideo || reducedMotionQuery.matches) {
      return;
    }

    previewVideo.muted = true;
    previewVideo.controls = false;
    previewVideo.loop = false;
    resetPlaybackTime();
    previewVideo.setAttribute("aria-hidden", "false");
    videoPreview.classList.add("is-playing");

    const playback = previewVideo.play();

    if (playback && typeof playback.catch === "function") {
      playback.catch(resetVideoPreview);
    }
  };

  videoPreview.addEventListener("mouseenter", playVideoPreview);
  videoPreview.addEventListener("mouseleave", resetVideoPreview);

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", resetVideoPreview);
  }
}
