const CACHE_NAME = 'biodata-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // আপনার CSS বা JS ফাইল থাকলে এখানে পাথ যুক্ত করতে পারেন
];

// ইনস্টল করার সময় ফাইলগুলো ক্যাশ করা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// অফলাইনে থাকার সময় ক্যাশ থেকে ডাটা লোড করা
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
