const DEFAULTS = {
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

const checks = ['nfIntro', 'nfRecap', 'nfNext', 'pvIntro', 'pvRecap', 'pvNext', 'speedAds', 'showToast'];

const adSpeed = document.getElementById('adSpeed');
const adSpeedVal = document.getElementById('adSpeedVal');

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

adSpeed.addEventListener('input', (e) => {
  adSpeedVal.textContent = e.target.value + '×';
});
adSpeed.addEventListener('change', (e) => {
  const v = Math.max(2, Math.min(16, Number(e.target.value) || 8));
  e.target.value = v;
  adSpeedVal.textContent = v + '×';
  chrome.storage.sync.set({ adSpeed: v });
});
