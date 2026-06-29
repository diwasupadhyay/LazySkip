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

// --- Ad skipping ------------------------------------------------------------
// Prime ads ignore playbackRate (the ad plays in a separate element that just
// buffers when sped up — the "stuck loading" you saw). Instead we SEEK past the
// ad: Prime renders the remaining ad time in its own timer, so we jump
// video.currentTime forward by that amount. Self-promo ads expose a real skip
// button, so those we simply click.

const PV_VIDEO = '.dv-player-fullscreen video';
const PV_AD_TIMER = '.dv-player-fullscreen .atvwebplayersdk-ad-timer-remaining-time';
const PV_SELF_AD_BTN = '.fu4rd6c.f1cw2swo'; // Prime's own "skip self-ad" button
const PV_MAX_JUMP = 90; // a single seek larger than ~90s crashes the player
let pvAdLock = 0;       // 0 = free; >0 = recently seeked, wait it out

// Parse "1:23" / "0:08" / "45" style remaining-time text into seconds.
function pvParseAdTime(text) {
  if (!text) return 0;
  const sec = parseInt((/:(\d+)/.exec(text) || [])[1] || '', 10);
  const min = parseInt((/(\d+)/.exec(text) || [])[1] || '', 10);
  const total = (isNaN(sec) ? 0 : sec) + (isNaN(min) ? 0 : min * 60);
  return isNaN(total) ? 0 : total;
}

function pvSkipAds() {
  if (!LazySkip.settings.speedAds) return;
  const video = document.querySelector(PV_VIDEO);
  if (!video || video.paused || !(video.currentTime > 0)) return;

  // 1) Self-promo ad — a real skip button exists; click it (slight delay so we
  //    don't click before it's wired up, which causes infinite loading).
  const selfAd = document.querySelector(PV_SELF_AD_BTN);
  if (selfAd && LazySkip.isVisible(selfAd) && !pvAdLock) {
    pvAdLock = 1;
    setTimeout(() => {
      try { selfAd.click(); } catch (_) {}
      if (LazySkip.settings.showToast) LazySkip.toast('Skipped ad');
      pvAdLock = 0;
    }, 150);
    return;
  }

  // 2) Regular ad — read Prime's remaining-time readout and seek past it.
  const timer = document.querySelector(PV_AD_TIMER);
  if (!timer || !LazySkip.isVisible(timer) || pvAdLock) return;
  const adTime =
    pvParseAdTime(timer.childNodes[0] && timer.childNodes[0].textContent) ||
    pvParseAdTime(timer.childNodes[1] && timer.childNodes[1].textContent) ||
    pvParseAdTime(timer.textContent);
  if (adTime <= 1) return;

  // Jump in chunks of <=90s; lock briefly so we don't seek again mid-buffer.
  const jump = Math.min(adTime - 1, PV_MAX_JUMP);
  pvAdLock = 1;
  try { video.currentTime += jump; } catch (_) {}
  if (LazySkip.settings.showToast) LazySkip.toast('Skipped ad');
  setTimeout(() => { pvAdLock = 0; }, adTime > PV_MAX_JUMP ? 3000 : 1000);
}

// Tight 100ms loop — ad windows are short, so we need to catch them fast.
setInterval(pvSkipAds, 100);

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

  // Auto-advance only when the "Next up" card is actually shown (and not on an
  // ad). Card visibility is Prime's own "episode ending" signal.
  if (s.pvNext && !pvAdPlaying()) {
    const next = pvFindNext();
    if (next) LazySkip.click(next, 'pv-next', 'Next episode', 9000);
  }
  // Ads are handled by the seek-based pvSkipAds() loop above, not here.
});
