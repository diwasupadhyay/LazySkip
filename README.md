<div align="center">

<img src="icons/icon128.png" width="96" alt="LazySkip logo" />

# LazySkip

**Sit back. It skips the boring parts for you.**

Auto-skips intros & recaps, auto-plays the next episode, and speeds up ads
(it doesn't skip them — it fast-forwards through them) on **Netflix** and
**Amazon Prime Video** — so you never touch the remote.

![License: MIT](https://img.shields.io/badge/License-MIT-green) ![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue) ![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-coming%20soon-lightgrey)

<img src="1-Final.png" width="640" alt="LazySkip popup" />

</div>

---

## ✨ Features

| | Netflix | Prime Video |
|---|:---:|:---:|
| Skip intro | ✅ | ✅ |
| Skip recap | ✅ | ✅ |
| Auto next episode | ✅ | ✅ |
| Speed up ads (up to 16×) | ✅ | ✅ |

- 🎛️ Toggle anything from the popup, tune the ad speed with a slider.
- 🔴🔵 Brand-coloured UI + a tiny on-screen toast when it acts.
- 🔒 **Zero data collection.** Only permission used is `storage`, for your own settings. Nothing leaves your browser.

## 🚀 Install

**Chrome Web Store** — *coming soon.* ⏳

**Meanwhile, load it unpacked:**

1. Download or clone this repo.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `LazySkip` folder.
4. Open Netflix or Prime Video and relax.

## 🛠️ How it works

A small content script watches the player and clicks the right buttons the moment
they appear — using each service's stable hooks, with text fallbacks for Prime's
obfuscated markup. No tracking, no network calls, no nonsense.

## 🤝 Contributing

Open source and PRs welcome! Streaming sites change their markup often — if a
button stops being caught, open an [issue](https://github.com/diwasupadhyay/LazySkip/issues)
with the element's HTML and it's usually a one-line selector fix.

## 📄 License

[MIT](LICENSE) © diwasupadhyay

---

<div align="center">
built with <b>laziness</b> 😴
</div>
