// firebase-messaging-sw.js
// Handles push notifications when the PWA is closed / in the background.
// This file MUST sit at the repo root (same level as index.html) — Firebase
// looks for it at exactly this path.

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// This config is safe to expose publicly — it identifies the project, it is
// not a secret. Real access control happens via Firebase security rules /
// your GAS backend, not by hiding this object.
firebase.initializeApp({
  apiKey: "AIzaSyDZW1b3to3ojC6LUexZfzsmspdF98y6nvM",
  authDomain: "safety-kavach-notifications.firebaseapp.com",
  projectId: "safety-kavach-notifications",
  storageBucket: "safety-kavach-notifications.firebasestorage.app",
  messagingSenderId: "1026372115744",
  appId: "1:1026372115744:web:8a84e4dc63bc945cdccb45"
});

const messaging = firebase.messaging();

// Fired when a push arrives while the app/browser is in the background.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Safety Kavach Alert';
  const options = {
    body: payload.notification?.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: payload.data?.url || './' },
    tag: payload.data?.tag || 'sk-alert'
  };
  self.registration.showNotification(title, options);
});

// Tapping the notification opens (or focuses) the companion app.
// From there the user can jump into the real portal via its own link/QR.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// Empty passthrough fetch handler — some browsers require at least one
// registered 'fetch' listener for a service worker to count as installable.
self.addEventListener('fetch', () => {});
