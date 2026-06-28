// LazySkip — Amazon Prime Video. Prime's web player prefixes its controls with
// `atvwebplayersdk-`. Amazon swaps these between <div> and <button> and shifts
// the label between text / aria-label, so we match on class, text AND aria.

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
  // ONLY the end-of-episode "Next up" card — never the persistent next-episode
  // button that always sits in the control bar. Require it to be on-screen so
  // we click it when the card actually appears, not while it's hidden.
  const card = document.querySelector(
    '.atvwebplayersdk-nextupcard-button, [class*="nextupcard-button"]'
  );
  return LazySkip.isVisible(card) ? card : null;
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

  if (s.pvNext) {
    const next = pvFindNext();
    if (next) LazySkip.click(next, 'pv-next', 'Next episode', 9000);
  }

  LazySkip.handleAds(pvAdPlaying());
});
