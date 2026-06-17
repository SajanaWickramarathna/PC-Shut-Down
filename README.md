# PC Remote Control

A full-stack monorepo application that allows you to remotely control your Windows PC (Shutdown, Restart, Lock, Sleep) from a mobile Android app.

## Project Structure
- `apps/desktop`: The Node.js Windows service that runs in the system tray and executes commands.
- `apps/mobile`: The React Native (Expo) mobile app used as the remote control.

---

## 🖥️ Desktop Service (PC Setup)

The desktop service runs silently in your system tray and listens for commands from your mobile app. It is packaged as a single, standalone executable (`PowerTap.exe`) so you don't need Node.js installed to run it!

### 1. Locate and Run the Executable
The standalone Windows executable has already been built for you. You can find it at:
`apps/desktop/dist/PowerTap.exe`

You can move this `.exe` file anywhere on your computer (like your Desktop or Documents folder). 

To start the service, simply double-click `PowerTap.exe`. You will see a small PowerTap icon appear in your Windows system tray (near the clock in the bottom right corner of your screen).

### 2. Configure the App (No coding required!)
1. Left-click or Right-click the **PowerTap** icon in your system tray.
2. The menu will display your **API Key** (a randomly generated 6-digit PIN) and your **Local IP Address**.
3. *You will enter both of these into your mobile app to pair the devices.*
4. If you ever want to change your PIN, just click **Reset API Key** in the tray menu.

### 3. Run on Startup (Optional)
If you want the service to start automatically every time you turn on your PC:
1. Press `Win + R` on your keyboard, type `shell:startup`, and press Enter.
2. Copy `PowerTap.exe` (or create a shortcut to it) and paste it into that Startup folder.

### 4. Manually Building the .exe (When App Updates)
If you modify the source code of the desktop app and need to generate a new `.exe` yourself:
1. Ensure you have **Node.js** installed on your PC.
2. Open a terminal (Command Prompt or PowerShell) and run:
   ```cmd
   cd apps/desktop
   npm install
   npm run build:exe
   ```
3. Your fresh, updated `PowerTap.exe` will be generated inside the `apps/desktop/dist/` folder!

---

## 📱 Mobile App (Android Setup)

### 1. Locate the APK File
The standalone Android app has already been built. You can find the installable `.apk` file at this path on your PC:
`apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

### 2. Transfer and Install
1. Transfer the `app-release.apk` file to your Android phone (via USB cable, Google Drive, or Email).
2. Open the file on your phone to install it. *(You may need to allow "Install from unknown sources" in your Android settings if prompted).*

### 3. Manually Building the APK (Optional)
If you modify the mobile app code and need to generate a new APK yourself, you can build it locally without using cloud services:
1. Ensure you have the **Java JDK** and **Android SDK** installed on your system.
2. In the `apps/mobile/android` folder, ensure there is a `local.properties` file pointing to your Android SDK (e.g., `sdk.dir=C:/Users/YourName/AppData/Local/Android/Sdk`).
3. Open a terminal and temporarily hide the monorepo configuration so the mobile bundler doesn't get confused:
   ```cmd
   rename package.json package.json.bak
   cd apps/mobile
   ```
4. Regenerate the Android project:
   ```cmd
   npx expo prebuild
   ```
5. Build the Release APK:
   ```cmd
   cd android
   .\gradlew assembleRelease
   ```
6. Restore your project configuration when finished:
   ```cmd
   cd ../../../
   rename package.json.bak package.json
   ```

### 4. Configure the Connection
1. Find your PC's local IP Address by opening a Windows Command Prompt and running `ipconfig` (Look for the `IPv4 Address` under your active Wi-Fi/Ethernet adapter, e.g., `192.168.1.5`).
2. Open the **PC Remote** app on your phone.
3. Tap the **Settings (gear)** icon in the top right.
4. Enter your PC's IP address.
5. Enter the `API_KEY` exactly as you saved it in your desktop's `.env` file.
6. Tap **Save Settings**.
7. Return to the Home screen. The status indicator should turn green and say "PC is Online".

You are now ready to remotely control your PC!
