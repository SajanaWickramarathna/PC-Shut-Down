# PowerTap (Remote PC Management)

A cross-platform remote control system allowing you to securely monitor and manage your Windows PCs from anywhere. It uses a lightweight desktop service and a companion mobile application connected via real-time cloud infrastructure, enabling remote shutdown, restart, and status tracking across different networks.

## 📥 Download Apps

You can download the pre-built applications here:
* [Download Windows Installer (.exe)](https://drive.google.com/file/d/1dZ78VPlYPckjdyD4OkUB1roUxaPjIxj-/view?usp=sharing)
* [Download Android App (.apk)](https://drive.google.com/file/d/1WYxQzzQQQ1rzlnjP9iQR2VjDXXo_nCb3/view?usp=sharing)

---

## 🚀 Features
*   **Real-Time Cloud Control:** Execute near-instantaneous remote commands across different networks using Firebase Realtime Database.
*   **Live Status Monitoring:** Automated online/offline presence tracking utilizing heartbeat listeners.
*   **Multi-Device Management:** Save, edit, and switch between multiple remote PCs seamlessly in the mobile app.
*   **Secure Device Pairing:** API Key-based authentication flow ensuring unauthorized users cannot trigger local system commands.

---

## 🖥️ Desktop Setup (Windows)

1. Download and run the **PowerTap Setup Installer**.
2. Once installed, it will automatically launch and place a small icon in your Windows system tray (bottom right, near the clock).
3. Click the tray icon to view your **Connection API Key** (a 6-digit PIN).
4. *Keep this PIN handy! You will enter this into the mobile app to securely pair your devices.*

*Note: The desktop app runs silently in the background and will automatically start with Windows.*

---

## 📱 Mobile Setup (Android)

1. Download the **PowerTap.apk** file and transfer it to your Android device.
2. Open the file to install it. *(You may need to allow "Install from unknown sources" in your Android settings).*
3. Open the PowerTap app.
4. Tap **Add New PC**.
5. Give your PC a friendly name (e.g., "Gaming Desktop").
6. Enter the **API Key** shown on your Desktop app.
7. Tap **Save**. 

Your PC will instantly show as "Online" and you can now shut it down, restart it, sleep it, or lock it from anywhere in the world!

---

## 🛠️ Developer Information

### Project Structure
*   `apps/desktop`: The Node.js/Electron Windows service.
*   `apps/mobile`: The React Native (Expo) mobile app.

### Technologies
*   **Mobile App:** React Native, Expo, TypeScript
*   **Desktop Service:** Electron, Node.js, TypeScript
*   **Backend & Cloud:** Firebase Realtime Database
