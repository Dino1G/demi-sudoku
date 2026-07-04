import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../src/game/storage.js';

function memoryBackend() {
    const map = new Map();
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, String(v)),
        removeItem: (k) => map.delete(k),
    };
}

test('saved game round-trips and clears', () => {
    const s = createStorage(memoryBackend());
    assert.equal(s.loadSaved(), null);
    const game = { difficulty: 'easy', puzzle: [1, 0], current: [1, 2] };
    s.saveGame(game);
    assert.deepEqual(s.loadSaved(), game);
    s.clearSaved();
    assert.equal(s.loadSaved(), null);
});

test('recordResult tracks played, completed, best time', () => {
    const s = createStorage(memoryBackend());
    s.recordResult('hard', { completed: true, timeMs: 5000 });
    s.recordResult('hard', { completed: true, timeMs: 3000 });
    s.recordResult('hard', { completed: false, timeMs: 0 });
    const stats = s.loadStats().hard;
    assert.equal(stats.played, 3);
    assert.equal(stats.completed, 2);
    assert.equal(stats.bestTimeMs, 3000);
});

test('unlock is idempotent and preserves order', () => {
    const s = createStorage(memoryBackend());
    assert.deepEqual(s.loadCollection().unlocked, []);
    assert.equal(s.unlock('camel'), true);   // newly unlocked
    assert.equal(s.unlock('camel'), false);  // already unlocked
    s.unlock('fennec');
    assert.deepEqual(s.loadCollection().unlocked, ['camel', 'fennec']);
});

test('settings default then persist', () => {
    const s = createStorage(memoryBackend());
    assert.deepEqual(s.loadSettings(), { errorHighlight: true, showTimer: true });
    s.saveSettings({ errorHighlight: false, showTimer: true });
    assert.deepEqual(s.loadSettings(), { errorHighlight: false, showTimer: true });
});
