const CACHE_NAME = "budget-tracker";
const DATA_CACHE_NAME = "budget-tracker-data";

const urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const onInstall = async (event) => {
  event.waitUntil(
    await caches.open(CACHE_NAME),

    function openCache(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    },

    openCache()
  );
};

self.addEventListener("install", onInstall);
