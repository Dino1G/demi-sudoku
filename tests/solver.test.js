import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/engine/grid.js';
import { countSolutions, solve, hasUniqueSolution } from '../src/engine/solver.js';

const UNIQUE = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
const SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

test('solves a known unique puzzle', () => {
    assert.equal(solve(parse(UNIQUE)).join(''), SOLUTION);
});

test('reports a single solution', () => {
    assert.equal(hasUniqueSolution(parse(UNIQUE)), true);
    assert.equal(countSolutions(parse(UNIQUE)).count, 1);
});

test('detects multiple solutions', () => {
    const empty = new Array(81).fill(0);
    assert.equal(countSolutions(empty, 2).count, 2); // stops at limit
    assert.equal(hasUniqueSolution(empty), false);
});

test('returns null for contradictory grid', () => {
    const bad = new Array(81).fill(0);
    bad[0] = 5;
    bad[1] = 5; // two 5s in row 0
    assert.equal(solve(bad), null);
});
