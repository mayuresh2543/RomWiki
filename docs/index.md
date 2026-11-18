<div class="rom-hero">
  <span class="rom-hero__tag">$ ls /devices/*</span>
  <h1 class="rom-hero__title">Custom Android Builds</h1>
  <p class="rom-hero__desc">High-performance, debloated, and actively maintained custom ROM builds for Xiaomi & POCO devices.</p>
</div>

<div class="rom-device-grid">
  <div class="rom-device-card">
    <div class="rom-device-card__header">
      <span class="rom-device-card__codename">stone</span>
      <span class="rom-badge">Maintained</span>
    </div>
    <div class="rom-device-card__name">Redmi Note 12 5G / POCO X5 5G</div>
    <div class="rom-device-card__roms">
      <span class="rom-device-card__rom-pill">LineageOS 24.0 (A17)</span>
      <span class="rom-device-card__rom-pill">LineageOS 22.2 (A15)</span>
      <span class="rom-device-card__rom-pill">YAAP (A17)</span>
    </div>
    <div class="rom-device-card__links">
      <a href="stone/" class="rom-btn">Info</a>
      <a href="stone/install/" class="rom-btn">Guide</a>
      <a href="stone_downloads/" class="rom-btn rom-btn--primary">Downloads</a>
    </div>
  </div>

  <div class="rom-device-card">
    <div class="rom-device-card__header">
      <span class="rom-device-card__codename">spes</span>
      <span class="rom-badge">Maintained</span>
    </div>
    <div class="rom-device-card__name">Redmi Note 11</div>
    <div class="rom-device-card__roms">
      <span class="rom-device-card__rom-pill">LineageOS 20 (A13)</span>
    </div>
    <div class="rom-device-card__links">
      <a href="spes/" class="rom-btn">Info</a>
      <a href="spes/install/" class="rom-btn">Guide</a>
      <a href="spes_downloads/" class="rom-btn rom-btn--primary">Downloads</a>
    </div>
  </div>
</div>

## Flashing Prerequisites

Before flashing any build, make sure the following requirements are met:

- **Platform Tools** — Install the latest [Android SDK Platform-Tools](https://developer.android.com/studio/releases/platform-tools).
- **Unlocked Bootloader** — Your device bootloader must be unlocked.
- **Official Firmware** — Ensure you are on the latest official MIUI/HyperOS firmware for your device and region.
- **External Backup** — Formatting data (`Factory Reset > Format Data`) is mandatory for clean installations.
- **Recovery** — Use only the recommended recovery specified in your device's installation guide.

!!! warning "Custom Kernels Not Supported"
    Do not flash third-party custom kernels. Reports of issues encountered with custom kernels will be closed without investigation.

## Community & Support

Support discussion and release announcements are posted on [Telegram](https://t.me/Mayuresh_Releases). When asking for assistance or reporting bugs, include exact reproduction steps and a full `logcat`.
