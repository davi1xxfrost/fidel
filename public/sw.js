// Enhanced Service Worker for Barbearia Fidelidade PWA
const CACHE_NAME = 'barbearia-cache-v2';
const CACHE_STATIC = 'barbearia-static-v2';
const CACHE_DYNAMIC = 'barbearia-dynamic-v2';
const CACHE_API = 'barbearia-api-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/barbearias/,
  /\/api\/clientes/,
  /\/api\/niveis/,
  /\/api\/recompensas/,
];

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  static: 30 * 24 * 60 * 60 * 1000,  // 30 days
  api: 5 * 60 * 1000,                // 5 minutes
  dynamic: 24 * 60 * 60 * 1000,      // 1 day
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Error caching static assets:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_STATIC && 
                cacheName !== CACHE_DYNAMIC && 
                cacheName !== CACHE_API) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const { url, method } = request;

  // Skip non-GET requests
  if (method !== 'GET') return;

  // Skip chrome-extension and other protocols
  if (!url.startsWith('http')) return;

  event.respondWith(handleRequest(request));
});

// Enhanced request handling with different strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request, CACHE_STATIC);
    }
    
    // Strategy 2: Network First for API calls
    if (isApiRequest(url)) {
      return await networkFirst(request, CACHE_API);
    }
    
    // Strategy 3: Stale While Revalidate for dynamic content
    return await staleWhileRevalidate(request, CACHE_DYNAMIC);
    
  } catch (error) {
    console.error('SW: Request failed:', error);
    return await handleOffline(request);
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Network First strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      
      // Add timestamp for expiration
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(cacheName);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null);
  
  return cachedResponse || await networkResponsePromise || new Response('Offline', { status: 503 });
}

// Utility functions
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf)$/) ||
         url.pathname === '/' ||
         url.pathname === '/manifest.json';
}

function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
         url.hostname.includes('supabase');
}

function isExpired(response) {
  const timestamp = response.headers.get('sw-cache-timestamp');
  if (!timestamp) return false;
  
  const cacheTime = parseInt(timestamp);
  const now = Date.now();
  const maxAge = CACHE_DURATIONS.api; // Use shortest duration as default
  
  return (now - cacheTime) > maxAge;
}

async function handleOffline(request) {
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
  
  // Return cached version if available
  const cachedResponse = await caches.match(request);
  return cachedResponse || new Response('Offline', { status: 503 });
}

// Handle messages from main thread
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case 'CLEAN_CACHE':
      cleanExpiredCache();
      break;
    default:
      console.log('SW: Unknown message type:', type);
  }
});

// Clean expired cache entries
async function cleanExpiredCache() {
  const cacheNames = [CACHE_STATIC, CACHE_DYNAMIC, CACHE_API];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response && isExpired(response)) {
        await cache.delete(request);
        console.log('SW: Deleted expired cache entry:', request.url);
      }
    }
  }
}

// Periodic cache cleanup (every 6 hours)
setInterval(cleanExpiredCache, 6 * 60 * 60 * 1000);