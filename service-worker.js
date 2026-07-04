const CACHE = 'demi-sudoku-v2';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './manifest.json',
    './src/ui/app.js',
    './src/ui/menu.js',
    './src/ui/board-view.js',
    './src/ui/controls.js',
    './src/ui/encyclopedia-view.js',
    './src/game/storage.js',
    './src/game/game.js',
    './src/game/animals.js',
    './src/engine/grid.js',
    './src/engine/solver.js',
    './src/engine/logical-solver.js',
    './src/engine/generator.js',
    './src/engine/grader.js',
    './src/engine/worker.js',
    './src/data/animals.json',
    './src/data/world-map.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((hit) => hit || fetch(e.request))
    );
});
