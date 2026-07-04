import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/engine/grid.js';
import { hasUniqueSolution } from '../src/engine/solver.js';
import { logicalSolve, TECHNIQUES } from '../src/engine/logical-solver.js';
import { grade, generatePuzzle, DIFFICULTIES, TARGET_GIVENS } from '../src/engine/grader.js';

function seededRng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (1664525 * s + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

const CEILING = { easy: 1, medium: 2, hard: 3, expert: 4 };

const EASY = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';

test('grades a singles-only puzzle as easy', () => {
    assert.equal(grade(parse(EASY)), 'easy');
});

test('generatePuzzle returns a unique puzzle labeled with the requested difficulty', () => {
    for (const d of DIFFICULTIES) {
        const { puzzle, solution, difficulty } = generatePuzzle(d, seededRng(100 + DIFFICULTIES.indexOf(d)));
        assert.equal(difficulty, d);
        assert.equal(hasUniqueSolution(puzzle), true);
        assert.equal(solution.length, 81);
    }
});

test('generatePuzzle clue count is near the difficulty target', () => {
    for (const d of DIFFICULTIES) {
        const { puzzle } = generatePuzzle(d, seededRng(300 + DIFFICULTIES.indexOf(d)));
        const givens = puzzle.filter((v) => v !== 0).length;
        assert.ok(
            Math.abs(givens - TARGET_GIVENS[d]) <= 6,
            `${d}: ${givens} givens, expected ~${TARGET_GIVENS[d]}`
        );
    }
});

test('easier levels stay within their technique ceiling', () => {
    for (const d of DIFFICULTIES) {
        const { puzzle } = generatePuzzle(d, seededRng(700 + DIFFICULTIES.indexOf(d)));
        const { solved, hardest } = logicalSolve(puzzle);
        assert.equal(solved, true, `${d} should be logically solvable`);
        const rank = hardest === null ? 0 : TECHNIQUES.indexOf(hardest);
        assert.ok(rank <= CEILING[d], `${d}: needed rank ${rank}, ceiling ${CEILING[d]}`);
    }
});

test('easy has clearly more clues than expert', () => {
    const easy = generatePuzzle('easy', seededRng(11)).puzzle.filter((v) => v !== 0).length;
    const expert = generatePuzzle('expert', seededRng(12)).puzzle.filter((v) => v !== 0).length;
    assert.ok(easy > expert, `easy ${easy} should exceed expert ${expert}`);
});
