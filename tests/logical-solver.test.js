import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, CELLS, idx } from '../src/engine/grid.js';
import { logicalSolve, TECHNIQUES, xWing } from '../src/engine/logical-solver.js';

// An easy puzzle solvable with singles only.
const EASY = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';

test('TECHNIQUES ordered easy to hard', () => {
    assert.deepEqual(TECHNIQUES, ['naked_single', 'hidden_single', 'locked_candidates', 'naked_pair_triple', 'x_wing']);
});

test('solves easy puzzle with singles', () => {
    const r = logicalSolve(parse(EASY));
    assert.equal(r.solved, true);
    assert.ok(['naked_single', 'hidden_single'].includes(r.hardest));
});

// Requires pointing/claiming (locked candidates) beyond singles.
// NOTE: the brief's original fixture for this puzzle
// ('..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3..')
// was mislabeled: logicalSolve reports it solves via naked_single alone, so it does
// not exercise locked_candidates. Replaced with a puzzle derived from the same
// classic solution grid (as EASY), verified via solver.js's hasUniqueSolution to have
// a unique solution and confirmed via logicalSolve to need exactly locked_candidates.
const NEEDS_LOCKED = '5...7.9..672....4....3..5..8...61.2......3..17....4..6.....7..4...4..6.53.5.8....';

test('locked candidates puzzle needs at least locked_candidates', () => {
    const r = logicalSolve(parse(NEEDS_LOCKED));
    assert.equal(r.solved, true);
    assert.ok(RANK_AT_LEAST(r.hardest, 'locked_candidates'));
});

function RANK_AT_LEAST(actual, min) {
    return TECHNIQUES.indexOf(actual) >= TECHNIQUES.indexOf(min);
}

// A puzzle that stalls on singles + locked, needing subset (pair/triple) elimination.
// NOTE: the brief's original fixture for this puzzle
// ('4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......')
// is a valid 17-clue puzzle but is mislabeled: it solves fully via locked_candidates
// alone, never invoking naked_pair_triple. Replaced with a puzzle derived from the
// same classic solution grid, verified via solver.js's hasUniqueSolution and
// confirmed via logicalSolve to reach exactly naked_pair_triple (and, matching the
// brief's own note, does not fully solve with these techniques alone).
const NEEDS_SUBSET = '......9...721...48.....2....5..6..234..8.37.1.1.9.......1..728...7.1...53........';

test('naked subset puzzle progresses past locked_candidates', () => {
    const r = logicalSolve(parse(NEEDS_SUBSET));
    // Not asserting solved (this classic is hard); assert the technique fired.
    assert.ok(RANK_AT_LEAST(r.hardest, 'naked_pair_triple'));
});

// A puzzle requiring the X-Wing technique.
// NOTE: the brief's original fixture for this puzzle
// ('.......123......4.5..1.6...7...58...9...7...8...4...5...6...4.9..2.7......891......')
// does not parse: it is 83 characters, not 81 (it does not divide evenly into nine
// 9-character rows). Replaced with a puzzle derived from the same classic solution
// grid, verified via solver.js's hasUniqueSolution to have a unique solution and
// confirmed via logicalSolve to reach exactly x_wing as its hardest technique.
const NEEDS_XWING = '...6.8.........34..9..42.67...76...342.8..79......4....615..2...8.4.9.3...5......';

test('x-wing puzzle reaches x_wing technique', () => {
    const r = logicalSolve(parse(NEEDS_XWING));
    assert.ok(RANK_AT_LEAST(r.hardest, 'naked_pair_triple')); // fires subset or beyond
    assert.equal(r.hardest, 'x_wing'); // this fixture's hardest is verified to be exactly x_wing
});

// The dedicated, isolated X-Wing behavior is asserted directly in the next test via
// a hand-built candidate state, independent of any full-puzzle fixture.

test('x_wing eliminates a candidate that subsets cannot', () => {
    // Construct a candidate state directly (bypassing logicalSolve/buildCandidates)
    // where value 4 forms an X-Wing across rows 0 and 8, confined to columns 2 and 5.
    // No cell is filled in, and no other technique runs here - this isolates xWing.
    const values = new Array(CELLS).fill(0);
    const cand = Array.from({ length: CELLS }, () => new Set());

    const r0c2 = idx(0, 2);
    const r0c5 = idx(0, 5);
    const r8c2 = idx(8, 2);
    const r8c5 = idx(8, 5);
    cand[r0c2].add(4);
    cand[r0c5].add(4);
    cand[r8c2].add(4);
    cand[r8c5].add(4);

    // Extra candidate-4 cells elsewhere in columns 2 and 5 that the X-Wing must clear.
    const victimCol2 = idx(4, 2);
    const victimCol5 = idx(3, 5);
    cand[victimCol2].add(4);
    cand[victimCol5].add(4);

    const changed = xWing(values, cand);

    assert.equal(changed, true);
    assert.equal(cand[victimCol2].has(4), false);
    assert.equal(cand[victimCol5].has(4), false);
    // The four X-Wing corner cells themselves must be untouched.
    assert.equal(cand[r0c2].has(4), true);
    assert.equal(cand[r0c5].has(4), true);
    assert.equal(cand[r8c2].has(4), true);
    assert.equal(cand[r8c5].has(4), true);
});
