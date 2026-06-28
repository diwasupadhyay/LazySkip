// LazySkip core — shared engine for the Netflix & Prime content scripts.
// Runs in the extension's isolated world; the `LazySkip` global is shared
// with netflix.js / prime.js because they execute in the same context.
//
// Privacy: LazySkip reads nothing about you and sends nothing anywhere.
// The only storage used is your own on/off preferences (chrome.storage).

const LZ_DEFAULTS = {
  nfIntro: true,
  nfRecap: true,
  nfNext: true,
  pvIntro: true,
  pvRecap: true,
  pvNext: true,
  speedAds: true,
  adSpeed: 8,
  showToast: true
};

const LazySkip = {
  settings: { ...LZ_DEFAULTS },
  accent: '#ffffff',
  _cooldown: new Map(),
  _toastTimer: null,

  init() {
    chrome.storage.sync.get(LZ_DEFAULTS, (s) => { this.settings = s; });
    chrome.storage.onChanged.addListener((changes) => {
      for (const k in changes) this.settings[k] = changes[k].newValue;
    });
  },

  // Returns true at most once per `ms` for a key, so clicks are never spammed.
  ready(key, ms = 4000) {
    const now = Date.now();
    if (now - (this._cooldown.get(key) || 0) < ms) return false;
    this._cooldown.set(key, now);
    return true;
  },

  click(el, key, label, ms = 4000) {
    if (!el || !this.ready(key, ms)) return false;
    el.click();
    if (this.settings.showToast && label) this.toast(label);
    return true;
  },

  // Only ever touches playbackRate during a genuine ad (detected by precise
  // selectors), and restores 1x otherwise. No page-text scanning, so real
  // content is never sped up by mistake. Applies to every <video> on the page
  // because Prime plays ads in a separate element from the content video.
  handleAds(isAd) {
    const videos = document.querySelectorAll('video');
    if (!videos.length) return;
    const wantRate = (this.settings.speedAds && isAd)
      ? Math.max(1, Math.min(16, Number(this.settings.adSpeed) || 8))
      : 1;
    for (const v of videos) {
      if (v.playbackRate !== wantRate) {
        try { v.playbackRate = wantRate; } catch (_) { /* ignore locked rate */ }
      }
    }
  },

  isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const st = getComputedStyle(el);
    return st.visibility !== 'hidden' && st.display !== 'none' && Number(st.opacity) > 0;
  },

  toast(text) {
    this._ensureStyles();
    let el = document.getElementById('lazyskip-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'lazyskip-toast';
      el.innerHTML =
        '<span class="ls-dot"></span>' +
        '<span class="ls-msg"></span>' +
        '<span class="ls-sub">built with laziness</span>';
      (document.body || document.documentElement).appendChild(el);
    }
    el.querySelector('.ls-dot').style.background = this.accent;
    el.querySelector('.ls-msg').textContent = text;
    el.classList.add('ls-show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('ls-show'), 2200);
  },

  _ensureStyles() {
    if (document.getElementById('lazyskip-style')) return;
    const css = `
      #lazyskip-toast {
        position: fixed; z-index: 2147483647; left: 50%; bottom: 72px;
        transform: translate(-50%, 16px);
        display: flex; align-items: center; gap: 9px;
        padding: 10px 16px; border-radius: 999px;
        background: rgba(18,18,22,.92); color: #fff;
        font: 600 13px/1 system-ui, -apple-system, sans-serif;
        letter-spacing: .2px; white-space: nowrap;
        box-shadow: 0 10px 30px rgba(0,0,0,.5);
        -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
        opacity: 0; pointer-events: none;
        transition: opacity .25s ease, transform .25s ease;
      }
      #lazyskip-toast.ls-show { opacity: 1; transform: translate(-50%, 0); }
      #lazyskip-toast .ls-dot {
        width: 8px; height: 8px; border-radius: 50%; background: #fff;
      }
      #lazyskip-toast .ls-sub {
        font-weight: 400; font-size: 10px; opacity: .55;
        padding-left: 9px; margin-left: 3px;
        border-left: 1px solid rgba(255,255,255,.18);
      }`;
    const style = document.createElement('style');
    style.id = 'lazyskip-style';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  },

  // Runs `fn(settings)` on a steady interval plus a debounced DOM-mutation
  // trigger (one run per animation frame). The debounce keeps us off the hot
  // path on players that mutate constantly — this is what froze Prime before.
  run(fn) {
    const tick = () => { try { fn(this.settings); } catch (_) { /* keep going */ } };
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; tick(); });
    });
    const startObserving = () => {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    };
    if (document.documentElement) startObserving();
    else document.addEventListener('DOMContentLoaded', startObserving, { once: true });
    setInterval(tick, 500);
    tick();
  }
};

LazySkip.init();
