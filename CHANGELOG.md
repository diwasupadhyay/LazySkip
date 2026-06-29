# Changelog

All notable changes to LazySkip are documented here.
This project follows [semantic versioning](https://semver.org).

## [1.1.0]

### Added
- **Auto-play next episode** on Netflix and Prime Video.
- **Prime ad skipping** — seeks past ads using Prime's own ad timer, and clicks
  the skip button on self-promo ads.
- **Tabbed popup** — pick Netflix or Prime to reveal that service's controls.
- **Usage stats** — intros/recaps skipped, ads handled, and estimated minutes
  saved, with a reset button.
- Redesigned popup UI: logo, brand colours, grouped controls, and an on-screen toast.

### Changed
- Netflix ads are fast-forwarded (sped up) at your chosen rate.

### Fixed
- Toast now shows while a video is in fullscreen.
- Prime stability — no more buffering/stuck loading on ads; the player loop is
  throttled to stay off the hot path.

## [1.0.0]

### Added
- Skip intro and recap on Netflix and Amazon Prime Video.
- Speed up ads.
