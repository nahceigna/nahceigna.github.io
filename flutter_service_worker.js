'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "favicon-16x16.png": "d9b1963bdb799ebfd5b1e4cf11ed7bd8",
"version.json": "2074c95492145bdb6e31febc7ce7b86c",
"favicon.ico": "430416e821fe21510420ab24aef6cf24",
"index.html": "353eade8c079cb081a971b45b2d68a78",
"/": "353eade8c079cb081a971b45b2d68a78",
"apple-touch-icon.png": "ad4e0c1887fe5654ce16564d810d4e39",
"main.dart.js": "211ba02cbcb81d60f1f3fbf559deff9f",
"icons/android-chrome-192x192.png": "ed580dda8a4642563910985203305105",
"icons/apple-touch-icon.png": "ad4e0c1887fe5654ce16564d810d4e39",
"icons/android-chrome-512x512.png": "05c409ad4bddf1480773d44ca4c09479",
"manifest.json": "d107afa3a689e43ff4fcdd6534e44ce0",
"assets/images/icon.png": "e022f97bab3e2a2408d1e8a054d40308",
"assets/images/hkust_redbird.jpg": "e27209a4de5d5b954f05e4641ca6fd76",
"assets/images/map_lg4.jpg": "2c6d10444e1a9c088a7b0a1ab0eaa17f",
"assets/images/map_1f.jpg": "86a28849fe342a9852a3d4dc574d6891",
"assets/images/onboarding.png": "304ecd8bf7da0dab3d1fb7deeaf45022",
"assets/images/map_lg1.jpg": "98e44157aaadfa17e7c97d7e2fa58c3a",
"assets/images/map_gf.jpg": "75fa64d2a5a3b56002af0c0e160036c6",
"assets/images/map_lg3.jpg": "645605a6a97efc34b0f538747aaef69c",
"assets/AssetManifest.json": "40b442ad1bb59b0ea718a9dc0d188ca3",
"assets/NOTICES": "c9f84febaa4a1463972236ef61b96121",
"assets/FontManifest.json": "0ebdff02f845f02614c630028394b32e",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/NotoSans-Regular.ttf": "d5649a4a1b2eeb6b7add5a310414c48e",
"assets/fonts/NotoSans-Bold.ttf": "91fd88919f019f29caee6cfe0f5d88bc",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/fonts/Pacifico-Regular.ttf": "85bb2d0ec4a0da159de42e89089ccc0b",
"assets/fonts/NotoSans-ExtraBold.ttf": "6f2359e96e462a86c849427f6704e39f",
"assets/fonts/NotoSans-Italic.ttf": "27f0f38979ffb1932d719b6aee9918fb",
"assets/assets/http.md": "3c68a7c20b2296875f67e431093dd99e",
"assets/assets/flutter_web_frame.md": "a20298b16991dca4436e79de50de0e90",
"assets/assets/privacy_policy.md": "2f6a15ea4b18298f6d78183275629bfb",
"assets/assets/syncfusion.md": "8de65ea55dad7ad2a494a5d39eb7746e",
"assets/assets/loading_animation_widget.md": "e76551d2fcb002bcde6978068565cf14",
"assets/assets/flutter_markdown.md": "a60894397335535eb10b54e2fff9f265",
"assets/assets/intl.md": "87ee25bbef5b7cb7dcb056c3ec20f243",
"assets/assets/cupertino_icons.md": "aecb85480d32dec806ab28836e0bb68b",
"favicon-32x32.png": "4ebd4e365a4f0f8d033fef16c6510fc7",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
