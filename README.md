# Vessel of Honour Attendance (PWA)

This is a Progressive Web App starter project built with HTML, CSS, and JavaScript for VS Code.

## Files
- `index.html` — app structure
- `style.css` — design and mobile layout
- `app.js` — learner registration, attendance, reports, and local storage
- `manifest.json` — installable app settings
- `service-worker.js` — offline app shell caching
- `icon.svg` — home-screen/app icon

## Run it in VS Code
1. Extract this folder.
2. Open the folder in VS Code.
3. Install the **Live Server** extension if needed.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Test the app in your browser.

## Install on Android
A PWA service worker and installation require a secure origin (HTTPS), or localhost during development. To install it on your phone:
1. Publish the folder to an HTTPS host, such as GitHub Pages.
2. Open the published URL in Chrome on Android.
3. Open Chrome's menu and choose **Install app** or **Add to Home screen**.

## Important data note
Attendance data is saved in the browser's local storage on each device. It does not sync between different phones/computers yet. For shared attendance across multiple teachers, connect a secure online database and authentication before using it school-wide. Local browser data can be lost if browser storage is cleared, so use the app's backup/export features.

## Make it your own
Edit the HTML, CSS, and JavaScript files in VS Code. Start with the school name, colors, layout, and features. After changing cached files, update `CACHE_NAME` in `service-worker.js` (for example to `voh-attendance-v2`) to refresh the offline cache.
