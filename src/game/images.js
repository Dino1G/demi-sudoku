// Fetches a representative photo per animal from Wikipedia's REST summary API
// (Wikimedia images are CC/public-domain). Results are cached in localStorage
// so each animal is looked up at most once. The game itself never needs this;
// only the encyclopedia and the in-game mascot show photos, and they degrade
// gracefully to a text placeholder when offline or when no image is found.

const CACHE_KEY = 'demi.imageCache';
const ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

function loadCache(backend) {
    try {
        return JSON.parse(backend.getItem(CACHE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveCache(backend, cache) {
    try {
        backend.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Storage full or unavailable; run without persistence this session.
    }
}

async function fetchTitle(title) {
    const res = await fetch(ENDPOINT + encodeURIComponent(title), {
        headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.thumbnail && data.thumbnail.source)
        || (data.originalimage && data.originalimage.source)
        || null;
}

/**
 * Create an image loader backed by a localStorage-like object.
 *
 * Returns an object with getImage(animal) -> Promise<string | null>, resolving
 * to a photo URL (cached), or null when none is available or the network fails.
 */
export function createImageLoader(backend) {
    const cache = loadCache(backend);
    const pending = new Map();

    async function getImage(animal) {
        if (animal.id in cache) return cache[animal.id];
        if (pending.has(animal.id)) return pending.get(animal.id);

        const task = (async () => {
            let url = null;
            for (const title of [animal.scientific, animal.name_en]) {
                if (!title) continue;
                try {
                    url = await fetchTitle(title);
                } catch {
                    url = null;
                }
                if (url) break;
            }
            cache[animal.id] = url;
            saveCache(backend, cache);
            pending.delete(animal.id);
            return url;
        })();

        pending.set(animal.id, task);
        return task;
    }

    return { getImage };
}
