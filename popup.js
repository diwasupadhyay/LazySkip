const DEFAULTS = {
  nfIntro: true, nfRecap: true, nfNext: true,
  pvIntro: true, pvRecap: true, pvNext: true,
  speedAds: true, adSpeed: 8, showToast: true
};

const checks = ['nfIntro', 'nfRecap', 'nfNext', 'pvIntro', 'pvRecap', 'pvNext', 'speedAds', 'showToast'];

const adSpeed = document.getElementById('adSpeed');
const adSpeedVal = document.getElementById('adSpeedVal');
const statSkips = document.getElementById('statSkips');
const statAds = document.getElementById('statAds');

chrome.storage.sync.get(DEFAULTS, (s) => {
  for (const k of checks) document.getElementById(k).checked = s[k];
  adSpeed.value = s.adSpeed;
  adSpeedVal.textContent = s.adSpeed + '×';
});

for (const k of checks) {
  document.getElementById(k).addEventListener('change', (e) => {
    chrome.storage.sync.set({ [k]: e.target.checked });
  });
}

adSpeed.addEventListener('input', (e) => { adSpeedVal.textContent = e.target.value + '×'; });
adSpeed.addEventListener('change', (e) => {
  const v = Math.max(2, Math.min(16, Number(e.target.value) || 8));
  e.target.value = v;
  adSpeedVal.textContent = v + '×';
  chrome.storage.sync.set({ adSpeed: v });
});

// tabs — no panel is shown until a service button is clicked
const tabs = document.querySelectorAll('.tab');
function showTab(tab) {
  tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  document.getElementById('panel-nf').hidden = tab !== 'nf';
  document.getElementById('panel-pv').hidden = tab !== 'pv';
  document.getElementById('hint').hidden = (tab === 'nf' || tab === 'pv');
}
tabs.forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

// stats
function renderStats(o) {
  statSkips.textContent = o.statsSkips || 0;
  statAds.textContent = o.statsAds || 0;
}
chrome.storage.local.get({ statsSkips: 0, statsAds: 0 }, renderStats);
chrome.storage.onChanged.addListener((ch, area) => {
  if (area === 'local' && (ch.statsSkips || ch.statsAds)) {
    chrome.storage.local.get({ statsSkips: 0, statsAds: 0 }, renderStats);
  }
});
document.getElementById('reset').addEventListener('click', () => {
  chrome.storage.local.set({ statsSkips: 0, statsAds: 0 });
});
