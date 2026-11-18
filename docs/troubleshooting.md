# Troubleshooting

Common solutions and recovery procedures for issues encountered during installation or daily use.

## Common Issues

### Bootloop After Flashing

This usually occurs if formatting data was skipped or an incompatible kernel or GApps package was flashed.

**Procedure:**

1. Boot into Recovery (hold `Volume Up` + `Power`).
2. Navigate to **Factory Reset** > **Format data / factory reset** and confirm.
3. Select **Reboot system now**.

### Error 1 During Sideload

This indicates recovery failed to verify or execute the installation script within the zip file. This typically stems from an incompatible recovery build or a corrupted download.

**Procedure:**

1. Verify that your recovery build matches the exact recovery recommended in your device guide.
2. Re-download the ROM zip and verify its checksum.
3. Ensure platform-tools is up to date (`adb version`).

## Support Resources

If the above steps do not resolve your issue, join our community on [Telegram](https://t.me/Mayuresh_Releases). When asking for assistance, always provide:

- Device model and codename (`stone` / `spes`)
- ROM name and version
- Exact error output or a full `logcat`
