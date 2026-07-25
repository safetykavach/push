# Safety Kavach — Companion Push Notification PWA

Standalone installable app (Android + iOS) that receives real-time push
notifications from the Safety Kavach EHS portal, without needing the portal
itself to be deployed outside its Google Apps Script iframe.

## Files
- `index.html` — Employee Code login + push-permission request + FCM token registration
- `firebase-messaging-sw.js` — service worker, shows notifications when the app is closed
- `manifest.json` — makes this an installable PWA
- `icon-192.png` / `icon-512.png` — app icons (replace with your own logo any time)

## One-time setup before going live

1. **Replace the GAS endpoint** in `index.html`:
   ```js
   const GAS_ENDPOINT = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec";
   ```
   Use the same deployed Web App URL your main portal already uses.

2. **Add a `Push_Tokens` sheet tab** to your backend spreadsheet with columns:
   `Employee Code | Token | Platform | Updated At`

3. **Add the `savePushToken` action** to your GAS `handleRequest` dispatcher (see backend
   snippet shared separately in chat).

4. **GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root. Your app will be
   live at `https://safetykavach.github.io/push/`.

## Security notes

- `firebaseConfig` (apiKey, projectId, etc.) in `index.html` and `firebase-messaging-sw.js`
  is **safe to publish** — it identifies your Firebase project but grants no privileged
  access on its own.
- The **Firebase Service Account JSON** (with `private_key`) is a completely different,
  highly privileged credential. It must **never** appear in this repo, in any commit, or
  in any file here. It lives only in your Google Apps Script **Script Properties**
  (server-side, private), where it's used to send pushes via the FCM HTTP v1 API.
- The VAPID key is a public key used only to identify this web app to FCM — also safe to
  publish.

## How it works

1. User opens the installed PWA and enters their Employee Code.
2. Browser asks for notification permission; on "Allow", Firebase gives the device a
   unique FCM token.
3. The token + Employee Code are sent to your existing GAS backend and saved in the
   `Push_Tokens` sheet.
4. Whenever your GAS backend needs to notify that employee (hazard assigned, SLT round,
   training reminder, etc.), it looks up their token and sends a push via the FCM HTTP v1
   API using the Service Account stored in Script Properties.
5. The `firebase-messaging-sw.js` service worker receives it and shows a native
   notification, even if the app/browser is closed.
