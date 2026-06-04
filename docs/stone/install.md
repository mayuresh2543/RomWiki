# 📲 Installation Instructions - Redmi Note 12 5G / POCO X5 (`stone`)

## ⚠️ Before You Begin

- Backup **all important data** to an external source. This process will erase your internal storage.
- A **clean flash** is mandatory if you're switching from another ROM.
- You **must be on the latest firmware** available for your device and region. Flash it manually if needed before proceeding.
- **Recommended Recovery:** Use **AOSP recovery**.

> **ℹ️ Note on Navigation:**
> Inside AOSP recovery, use the **Volume Up/Down** buttons to navigate through options and the **Power Button** to select/confirm.

---

## 🧹 Clean Flash (Recommended for First-Time Install)

1. **Boot into Fastboot mode**
   - Power off your device and use the hardware button combo (Volume Down + Power)
   **OR**
   - Run:
     ```bash
     adb reboot bootloader
     ```

2. **Flash the recovery image**
   ```bash
   fastboot flash boot recovery.img
   ```

3. **Reboot into Recovery**
   ```bash
   fastboot reboot recovery
   ```

4. **Format data**
   - In recovery:
     `Factory Reset > Format Data`

5. **Connect the phone to your PC**

6. **Sideload the ROM**
   - In recovery:
     `Apply update > Apply from ADB`
   - On your PC, run:
     ```bash
     adb sideload rom_file.zip
     ```

7. **Reboot**
   - After sideloading completes, go back to the main menu and select `Reboot system now`.
