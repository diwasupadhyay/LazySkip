// LazySkip — Netflix. Uses Netflix's stable data-uia hooks for precision.

LazySkip.accent = '#E50914'; // Netflix red

function nfAdPlaying() {
  // Strictly ad-only markers (ad-supported tier). Precise selectors only —
  // never scan page text, so the recap can't be mistaken for an ad.
  return !!document.querySelector(
    '[data-uia="ad-feedback-url-content"], [data-uia^="ad-timer"], ' +
    '[data-uia*="adChoices"], [class*="AdBreakAheadOfTime"], [class*="adsInfo"]'
  );
}

LazySkip.run((s) => {
  if (s.nfIntro) {
    const b = document.querySelector(
      '[data-uia="player-skip-intro"], [data-uia*="skip-intro"]'
    );
    if (b && LazySkip.click(b, 'nf-intro', 'Skipped intro')) LazySkip.bump('skip', 75);
  }

  if (s.nfRecap) {
    const b = document.querySelector(
      '[data-uia="player-skip-recap"], [data-uia*="skip-recap"], [data-uia*="skip-preplay"]'
    );
    if (b && LazySkip.click(b, 'nf-recap', 'Skipped recap')) LazySkip.bump('skip', 75);
  }

  if (s.nfNext) {
    // Covers both "...seamless-button" and "...seamless-button-draining".
    const b = document.querySelector('[data-uia*="next-episode-seamless-button"]');
    if (b) LazySkip.click(b, 'nf-next', 'Next episode', 9000);
  }

  LazySkip.handleAds(nfAdPlaying());
});
