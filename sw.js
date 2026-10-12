const CACHE_NAME = 'biodata-pwa-v1';
const urlsToCache = [
  '/biodata.com/',
  '/biodata.com/index.html'
  // আপনার যদি আলাদা কোনো CSS, JS বা লোগো ফাইল ক্যাশ করাতে চান, সেগুলোর পাথও এখানে যোগ করতে পারেন
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
