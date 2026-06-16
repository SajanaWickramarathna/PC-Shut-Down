# PC Remote Control

A full-stack monorepo application that allows you to remotely control your Windows PC (Shutdown, Restart, Lock, Sleep) from a mobile Android app.

## Project Structure
- `apps/desktop`: The Node.js Windows service that runs in the system tray and executes commands.
- `apps/mobile`: The React Native (Expo) mobile app used as the remote control.

---

## 🖥️ Desktop Service (PC Setup)

### 1. Build and Prepare
Open a terminal (Command Prompt or PowerShell) and run:
```cmd
cd apps/desktop
npm install
npm run build
```

### 2. Configure Your API Key
1. In the `apps/desktop` folder, duplicate the `.env.example` file and rename it to `.env`.
2. Open `.env` in a text editor and change `API_KEY` to a secret password of your choice (e.g., `API_KEY=my_secure_password_123`). 
*Note: You will need to enter this exact key into the mobile app later to authenticate.*

### 3. Run on Startup (System Tray)
To make the app run silently in the background every time you log into your PC:
1. Open File Explorer and navigate to `apps/desktop`.
2. Double-click the **`setup-startup.bat`** file.
3. The app will now automatically run silently via `start-hidden.vbs` every time you log into Windows, placing a small icon in your taskbar tray.

**To run it right now:**
Just double-click **`start-hidden.vbs`** in the `apps/desktop` folder. Look at your Windows taskbar tray to see the PC Remote icon.

---

## 📱 Mobile App (Android Setup)

### 1. Locate the APK File
The standalone Android app has already been built. You can find the installable `.apk` file at this path on your PC:
`apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

### 2. Transfer and Install
1. Transfer the `app-release.apk` file to your Android phone (via USB cable, Google Drive, or Email).
2. Open the file on your phone to install it. *(You may need to allow "Install from unknown sources" in your Android settings if prompted).*

### 3. Configure the Connection
1. Find your PC's local IP Address by opening a Windows Command Prompt and running `ipconfig` (Look for the `IPv4 Address` under your active Wi-Fi/Ethernet adapter, e.g., `192.168.1.5`).
2. Open the **PC Remote** app on your phone.
3. Tap the **Settings (gear)** icon in the top right.
4. Enter your PC's IP address.
5. Enter the `API_KEY` exactly as you saved it in your desktop's `.env` file.
6. Tap **Save Settings**.
7. Return to the Home screen. The status indicator should turn green and say "PC is Online".

You are now ready to remotely control your PC!
