# Troubleshooting

If you encounter issues while flashing or using the ROMs, check the common solutions below.

## Common Issues

### Bootloop after flashing
This usually happens if you forgot to format data or if you flashed an incompatible kernel or GApps package.
**Solution:** 
1. Boot into Recovery.
2. Select **Factory Reset** -> **Format data / factory reset**.
3. Reboot to System.

### Error 1 during sideload
This means the recovery failed to install the zip. It could be a corrupted download or an incompatible recovery.
**Solution:**
1. Verify the SHA256 checksum of the downloaded file.
2. Ensure you are using the exact Recovery recommended in the device's installation instructions.

## Need more help?

If you are still stuck, feel free to reach out to the community on Telegram. Make sure to provide a logcat if you are experiencing crashes!
