# Golf Pro Practice

Your digital caddy and AI coach for tracking golf shots and improving your game.

## Android App Generation

You can convert this web application into a native Android application (.apk) using [Capacitor](https://capacitorjs.com/).

### Prerequisites
- Node.js installed
- Android Studio installed
- Java Development Kit (JDK) 17+ installed

### Minimal Android Version
The minimal version of Android required to run the app is **Android 7.0 (Nougat) - API Level 24**.

### Steps to Generate the `.apk`

1. **Build the Web App**
   First, build the production version of the web app:
   ```bash
   npm run build
   ```

2. **Install Capacitor**
   Install the Capacitor CLI and core packages:
   ```bash
   npm install @capacitor/core @capacitor/cli
   ```

3. **Initialize Capacitor**
   Initialize Capacitor in your project (you can accept the default prompts):
   ```bash
   npx cap init
   ```
   *Note: Ensure the `webDir` in `capacitor.config.ts` is set to `dist`.*

4. **Add the Android Platform**
   Install the Android package and add the platform:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

5. **Sync the Project**
   Copy the built web assets into the Android project:
   ```bash
   npx cap sync android
   ```

6. **Open in Android Studio**
   Open the generated Android project in Android Studio:
   ```bash
   npx cap open android
   ```

7. **Build the APK in Android Studio**
   - Wait for Gradle to finish syncing.
   - In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Once the build is complete, a notification will appear in the bottom right corner. Click **locate** to find your generated `app-debug.apk` file.

8. **Install on your Device**
   Transfer the `.apk` file to your Android device and install it, or run it directly from Android Studio to a connected device or emulator.

## Testing

To run the test suite:
```bash
npm run test
```
