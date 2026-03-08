// =============================================
// BOOKTOK STUDIO — FIREBASE MESSAGING SERVICE WORKER
// =============================================
// This file MUST be at the root of your site (same level as index.html)
// Upload to your GitHub repo alongside index.html
// =============================================

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDMsL5kyKDSVakihwvgrgtOqFlVObDehpw",
  authDomain: "booktok-46e7a.firebaseapp.com",
  databaseURL: "https://booktok-46e7a-default-rtdb.firebaseio.com",
  projectId: "booktok-46e7a",
  storageBucket: "booktok-46e7a.firebasestorage.app",
  messagingSenderId: "749806717436",
  appId: "1:749806717436:web:672e38f0bc13532fb74a79"
});

const messaging = firebase.messaging();

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);

  const notification = payload.notification || {};
  const title = notification.title || 'BookTok Studio';
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.tag || 'booktok-notification',
    data: payload.data || {},
    // Vibrate pattern for iPhone
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(title, options);
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open it
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
