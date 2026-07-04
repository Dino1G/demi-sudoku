// Fetches a photo and a rich description per animal from Wikipedia's REST
// summary API. Chinese Wikipedia (zh-tw variant) supplies a Traditional-Chinese
// intro paragraph and image; English Wikipedia (by scientific name) is the
// image fallback. Results are cached in localStorage so each animal is looked
// up once. The game never needs this — only the encyclopedia and mascot show
// photos/descriptions, and they degrade to the curated text when offline.

const CACHE_KEY = 'demi.wikiCache2';
const ZH_ENDPOINT = 'https://zh.wikipedia.org/api/rest_v1/page/summary/';
const EN_ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

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

async function summary(endpoint, title, acceptLanguage) {
    const headers = { accept: 'application/json' };
    if (acceptLanguage) headers['accept-language'] = acceptLanguage;
    const res = await fetch(endpoint + encodeURIComponent(title), { headers });
    if (!res.ok) return null;
    return res.json();
}

/**
 * Create a loader backed by a localStorage-like object.
 *
 * Returns { getInfo(animal) } resolving to { image, extract } where either
 * field may be null (offline, or no article/image found).
 */
export function createImageLoader(backend) {
    const cache = loadCache(backend);
    const pending = new Map();

    async function getInfo(animal) {
        if (animal.id in cache) return cache[animal.id];
        if (pending.has(animal.id)) return pending.get(animal.id);

        const task = (async () => {
            let image = null;
            let extract = null;
            let extractEn = null;

            const [zh, en] = await Promise.all([
                summary(ZH_ENDPOINT, animal.name_zh, 'zh-tw').catch(() => null),
                summary(EN_ENDPOINT, animal.scientific || animal.name_en).catch(() => null),
            ]);
            if (zh) {
                if (zh.extract) extract = zh.extract;
                if (zh.thumbnail && zh.thumbnail.source) image = zh.thumbnail.source;
            }
            if (en) {
                if (en.extract) extractEn = en.extract;
                if (!image && en.thumbnail && en.thumbnail.source) image = en.thumbnail.source;
            }
            // If the scientific-name article missed, try the common English name.
            if ((!extractEn || !image) && animal.name_en) {
                const en2 = await summary(EN_ENDPOINT, animal.name_en).catch(() => null);
                if (en2) {
                    if (!extractEn && en2.extract) extractEn = en2.extract;
                    if (!image && en2.thumbnail && en2.thumbnail.source) image = en2.thumbnail.source;
                }
            }

            const info = { image, extract, extractEn };
            cache[animal.id] = info;
            saveCache(backend, cache);
            pending.delete(animal.id);
            return info;
        })();

        pending.set(animal.id, task);
        return task;
    }

    return { getInfo };
}
