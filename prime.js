// LazySkip — Amazon Prime Video. Prime's web player prefixes its controls
// with `atvwebplayersdk-`; we target those classes instead of page text.

function pvAdPlaying() {
  // Ad-timer / ad-indicator elements only — no body-text scanning (that was
  // the reflow that froze the player and caused false 8x speed-ups).
  return !!document.querySelector(
    '[class*="atvwebplayersdk-ad"], [class*="adTimeRemaining"], ' +
    '[class*="adCountdown"], [class*="adBadge"]'
  );
}

LazySkip.run((s) => {
  const video = document.querySelector('video');

  // One button handles both skip-intro and skip-recap on Prime; the label
  // tells them apart so each toggle is still respected.
  const skip = document.querySelector('.atvwebplayersdk-skipelement-button');
  if (skip) {
    const t = (skip.textContent || '').toLowerCase();
    const isRecap = t.includes('recap');
    const isIntro = t.includes('intro') || (!isRecap && t.includes('skip'));
    if (isRecap && s.pvRecap) {
      LazySkip.click(skip, 'pv-skip', 'Skipped recap');
    } else if (isIntro && s.pvIntro) {
      LazySkip.click(skip, 'pv-skip', 'Skipped intro');
    } else if (!isRecap && !isIntro && (s.pvIntro || s.pvRecap)) {
      LazySkip.click(skip, 'pv-skip', 'Skipped');
    }
  }

  if (s.pvNext) {
    const next = document.querySelector(
      '.atvwebplayersdk-nextupcard-button, [class*="nextupcard-button"]'
    );
    if (next) LazySkip.click(next, 'pv-next', 'Next episode', 9000);
  }

  LazySkip.handleAds(video, pvAdPlaying());
});
