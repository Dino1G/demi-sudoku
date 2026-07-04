const KEYS = {
    saved: 'demi.savedGame',
    stats: 'demi.stats',
    collection: 'demi.collection',
    settings: 'demi.settings',
};

const DEFAULT_SETTINGS = { errorHighlight: true, showTimer: true };

export function createStorage(backend) {
    function read(key, fallback) {
        const raw = backend.getItem(key);
        if (raw === null) return fallback;
        try {
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }
    function write(key, value) {
        backend.setItem(key, JSON.stringify(value));
    }

    return {
        loadSaved: () => read(KEYS.saved, null),
        saveGame: (game) => write(KEYS.saved, game),
        clearSaved: () => backend.removeItem(KEYS.saved),

        loadStats: () => read(KEYS.stats, {}),
        recordResult(difficulty, { completed, timeMs }) {
            const stats = read(KEYS.stats, {});
            const s = stats[difficulty] || { played: 0, completed: 0, bestTimeMs: null };
            s.played += 1;
            if (completed) {
                s.completed += 1;
                if (s.bestTimeMs === null || timeMs < s.bestTimeMs) s.bestTimeMs = timeMs;
            }
            stats[difficulty] = s;
            write(KEYS.stats, stats);
        },

        loadCollection: () => read(KEYS.collection, { unlocked: [] }),
        unlock(animalId) {
            const col = read(KEYS.collection, { unlocked: [] });
            if (col.unlocked.includes(animalId)) return false;
            col.unlocked.push(animalId);
            write(KEYS.collection, col);
            return true;
        },

        loadSettings: () => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) }),
        saveSettings: (settings) => write(KEYS.settings, settings),
    };
}
