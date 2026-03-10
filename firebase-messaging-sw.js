// =============================================
// BOOKTOK STUDIO — SERVICE WORKER
// Bump the version number to force cache refresh
// =============================================
const CACHE_NAME = 'booktok-v5';
const ASSETS = [
  './',
  './index.html',
];

// ═══════ CACHE MANAGEMENT ═══════

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  // Don't cache Firebase/Google API calls
  if (url.includes('firebaseio.com') || url.includes('googleapis.com') || url.includes('gstatic.com') || url.includes('google.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ═══════ FIREBASE MESSAGING ═══════

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
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: payload.data?.tag || 'booktok-notification',
    data: payload.data || {},
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(title, options);
});

// Open app when notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('./');
    })
  );
});
