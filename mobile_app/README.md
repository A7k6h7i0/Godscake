# Gods Cake Flutter Wrapper

This folder contains a Flutter Android app that loads the live Gods Cake website inside a WebView.

Live site URL:
`https://godscake-pied.vercel.app/`

## Folder Structure

```text
mobile_app/
  pubspec.yaml
  README.md
  assets/
    gods-cake-logo.svg
  lib/
    main.dart
```

## What the app does

- Loads your live website URL
- Shows a branded splash/loading screen
- Shows a loading indicator while pages load
- Detects offline state and shows a no-connection screen
- Handles Android back navigation inside the WebView
- Enables JavaScript
- Opens external links in the browser

## Setup

1. Install Flutter on your machine.
2. Create a new Flutter project:
   ```bash
   flutter create gods_cake_mobile
   ```
3. Copy the files from this folder into the new project.
4. Add the following permissions to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```
5. Run:
   ```bash
   flutter pub get
   flutter run
   ```

## Build APK

```bash
flutter build apk --release
```

The output will be in:
`build/app/outputs/flutter-apk/app-release.apk`

## Play Store Notes

- Use a unique application id in `android/app/build.gradle`
- Create a signed release keystore
- Build an App Bundle for Play Store:
  ```bash
  flutter build appbundle --release
  ```
- Upload the generated `.aab` file to Google Play Console

