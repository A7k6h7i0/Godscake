# Gods Cake Flutter Wrapper

This Flutter app opens the live Gods Cake website inside a WebView.

Live site URL:
`https://godscake-pied.vercel.app/`

## What it does

- Loads your live website URL
- Shows a branded splash/loading screen
- Shows a loading indicator while pages load
- Detects offline state and shows a no-connection screen
- Handles Android back navigation inside the WebView
- Enables JavaScript
- Opens external links in the browser

## Setup

1. Open the Flutter project folder you already created: `gods_cake_mobile`
2. Run:
   ```bash
   flutter pub get
   flutter run
   ```
3. If Android asks for permissions, allow them.

## Android permissions already added

- `android.permission.INTERNET`
- `android.permission.ACCESS_NETWORK_STATE`

## Build APK

```bash
flutter build apk --release
```

The APK will be here:
`build/app/outputs/flutter-apk/app-release.apk`

## Play Store

Use this command to make the Play Store file:

```bash
flutter build appbundle --release
```

Then upload the `.aab` file to Google Play Console.
