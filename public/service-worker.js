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

const onInstall = (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
};

const onFetch = (event) => {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(function (cache) {
          const cacheData = fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              return cache.match(event.request);
            });

          return cacheData;
        })
        .catch((err) => {
          console.log(err);
        })
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(function () {
        const cacheData = caches.match(event.request).then(function (response) {
          if (response) {
            return response;
          } else if (
            event.request.headers.get("accept").includes("text/html")
          ) {
            return caches.match("/");
          }
        });

        return cacheData;
      })
    );
  }
};

self.addEventListener("install", onInstall);
self.addEventListener("fetch", onFetch);
