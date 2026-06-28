// LazySkip — Amazon Prime Video. The skip/ad overlay still uses stable
// `atvwebplayersdk-` classes, but newer player chrome (e.g. the "Next up" card)
// ships obfuscated, build-specific classes — so for those we match on the
// stable English label/aria text instead of the class name.

LazySkip.accent = '#00A8E1'; // Prime blue

function pvLabel(el) {
  return ((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || ''))
    .trim().toLowerCase();
}

function pvFindSkip() {
  // Primary: the dedicated skip element (covers intro + recap).
  const direct = document.querySelector(
    '.atvwebplayersdk-skipelement-button, [class*="skipelement"]'
  );
  if (direct) return direct;
  // Fallback: any clickable whose label reads like a skip control.
  const nodes = document.querySelectorAll('button, [role="button"], a');
  for (const el of nodes) {
    const t = pvLabel(el);
    if (t === 'skip' || t.includes('skip intro') || t.includes('skip recap') ||
        t.includes('skip flashback')) {
      return el;
    }
  }
  return null;
}

function pvFindNext() {
  // Prime's player uses obfuscated, build-specific class names, so we match the
  // card's STABLE English label instead. The auto-advance card renders a button
  // reading "Next up in N" (a countdown) near the end of an episode. We must
  // NOT match the always-present control-bar button (aria-label "next title").
  // Older builds expose .atvwebplayersdk-nextupcard-button — try that first.
  const legacy = document.querySelector(
    '.atvwebplayersdk-nextupcard-button, [class*="nextupcard-button"]'
  );
  if (LazySkip.isVisible(legacy)) return legacy;

  for (const el of document.querySelectorAll('button, [role="button"], a')) {
    const aria = (el.getAttribute('aria-label') || '').toLowerCase();
    if (aria.includes('next title')) continue; // persistent control button
    const t = (el.textContent || '').trim().toLowerCase();
    if (/next up\s*in\b/.test(t) || aria.includes('next up')) {
      if (LazySkip.isVisible(el)) return el;
    }
  }
  return null;
}

function pvAdPlaying() {
  // Ad timer / indicator elements only — no body-text scanning.
  return !!document.querySelector(
    '[class*="atvwebplayersdk-ad"], [class*="ad-timer-remaining"], ' +
    '[class*="adTimeRemaining"], [class*="adCountdown"], [class*="adBadge"]'
  );
}

LazySkip.run((s) => {
  const skip = pvFindSkip();
  if (skip) {
    const t = pvLabel(skip);
    const isRecap = t.includes('recap') || t.includes('flashback');
    const isIntro = t.includes('intro');
    if (isRecap && s.pvRecap) {
      LazySkip.click(skip, 'pv-skip', 'Skipped recap');
    } else if (isIntro && s.pvIntro) {
      LazySkip.click(skip, 'pv-skip', 'Skipped intro');
    } else if (!isRecap && !isIntro && (s.pvIntro || s.pvRecap)) {
      // Generic "Skip" with no label hint — honor it if either skip is on.
      LazySkip.click(skip, 'pv-skip', 'Skipped');
    }
  }

  const adPlaying = pvAdPlaying();

  // Auto-advance only when the "Next up" card is actually shown (and not on an
  // ad). Card visibility is Prime's own "episode ending" signal.
  if (s.pvNext && !adPlaying) {
    const next = pvFindNext();
    if (next) LazySkip.click(next, 'pv-next', 'Next episode', 9000);
  }

  LazySkip.handleAds(adPlaying);
});
