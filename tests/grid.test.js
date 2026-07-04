import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SIZE, CELLS, idx, rc, PEERS, UNITS, parse, serialize, isValidPlacement } from '../src/engine/grid.js';

test('constants', () => {
    assert.equal(SIZE, 9);
    assert.equal(CELLS, 81);
});

test('idx and rc are inverse', () => {
    assert.deepEqual(rc(0), [0, 0]);
    assert.deepEqual(rc(80), [8, 8]);
    assert.equal(idx(4, 5), 41);
    for (let i = 0; i < CELLS; i++) {
        const [r, c] = rc(i);
        assert.equal(idx(r, c), i);
    }
});

test('every cell has exactly 20 peers, self excluded', () => {
    assert.equal(PEERS.length, CELLS);
    for (let i = 0; i < CELLS; i++) {
        assert.equal(new Set(PEERS[i]).size, 20);
        assert.ok(!PEERS[i].includes(i));
    }
    // cell 0 shares row 0, col 0, top-left box
    assert.ok(PEERS[0].includes(1));   // same row
    assert.ok(PEERS[0].includes(9));   // same col
    assert.ok(PEERS[0].includes(10));  // same box
    assert.ok(!PEERS[0].includes(80)); // unrelated
});

test('27 units of 9', () => {
    assert.equal(UNITS.length, 27);
    for (const u of UNITS) assert.equal(u.length, 9);
});

test('parse and serialize round-trip', () => {
    const s = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
    assert.equal(serialize(parse(s)), s.replaceAll('0', '.'));
    assert.equal(parse('0')[0], 0);
    assert.equal(parse('_')[0], 0);
});

test('isValidPlacement respects peers', () => {
    const g = new Array(81).fill(0);
    g[1] = 5;                      // row 0 has a 5
    assert.equal(isValidPlacement(g, 0, 5), false);
    assert.equal(isValidPlacement(g, 0, 6), true);
});
