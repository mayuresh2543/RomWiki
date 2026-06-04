# Google Apps

## Recommended Packages

Most of the Custom ROMs provided here either come with GApps pre-installed (like Project Matrixx) or require you to flash them separately.

If you are downloading a "Vanilla" build (without GApps), we highly recommend using **MindTheGapps**.

### MindTheGapps

> **TIP:** This is the officially recommended GApps package for LineageOS.

- **Download:** [MindTheGapps Website](https://mindthegapps.com/)
- **Architecture:** Choose `arm64`
- **Android Version:** Choose the version that exactly matches the ROM you are installing (e.g., `13.0` or `14.0`).

### Installation

1. Sideload the ROM zip first: `adb sideload rom.zip`
2. Reboot to Recovery.
3. Sideload the GApps zip: `adb sideload gapps.zip`
4. Reboot to System.

> **WARNING:** Do **NOT** flash GApps if the ROM specifies it already includes them (e.g., "GApps Build"). Doing so will cause bootloops.
