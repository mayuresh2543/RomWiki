# Google Apps

## Recommended Packages

Most of the Custom ROMs provided here either come with GApps pre-installed or require you to flash them separately.

If you are downloading a "Vanilla" build (without GApps), we highly recommend using official **MindTheGapps** (`arm64`).

### MindTheGapps

> **TIP:** This is the officially recommended GApps package for LineageOS.

Choose the package that exactly matches the Android version of the ROM you are installing:

- **Android 17**: [MindTheGapps 17.0.0-arm64 (Latest Release)](https://github.com/MindTheGapps/17.0.0-arm64/releases/latest) (for LineageOS 24.0)
- **Android 15**: [MindTheGapps 15.0.0-arm64 (Latest Release)](https://github.com/MindTheGapps/15.0.0-arm64/releases/latest) (for LineageOS 22.2)
- **Android 13**: [MindTheGapps 13.0.0-arm64 (Latest Release)](https://github.com/MindTheGapps/13.0.0-arm64/releases/latest) (for LineageOS 20 on `spes`)

### Installation

1. Sideload the ROM zip first: `adb sideload rom.zip`
2. Reboot to Recovery.
3. Sideload the GApps zip: `adb sideload gapps.zip`
4. Reboot to System.

> **WARNING:** Do **NOT** flash GApps if the ROM specifies it already includes them (such as **YAAP** or any build with pre-included GApps). Doing so will cause bootloops.
