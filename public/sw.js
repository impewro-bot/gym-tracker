const CACHE_NAME = 'gym-tracker-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
```

**Create app icons:**
1. Go to [favicon.io/emoji-favicons](https://favicon.io/emoji-favicons/)
2. Search for "muscle" or "weight" emoji
3. Download the icons
4. Rename `android-chrome-192x192.png` to `icon-192.png`
5. Rename `android-chrome-512x512.png` to `icon-512.png`
6. Put both in the `public` folder

### 4.8: Create `.gitignore`
Create `.gitignore` in the root folder:
```
node_modules
dist
.env.local
.env
```

### 4.9: Create `.env.local`
Create `.env.local` in the root folder (we'll add the API key later):
```
VITE_ANTHROPIC_API_KEY=your-key-here