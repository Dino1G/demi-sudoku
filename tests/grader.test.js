import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/engine/grid.js';
import { hasUniqueSolution } from '../src/engine/solver.js';
import { grade, generatePuzzle, DIFFICULTIES } from '../src/engine/grader.js';

function seededRng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (1664525 * s + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

const EASY = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';

test('grades a singles-only puzzle as easy', () => {
    assert.equal(grade(parse(EASY)), 'easy');
});

test('generatePuzzle returns a unique puzzle of the requested difficulty', () => {
    for (const d of DIFFICULTIES) {
        const { puzzle, solution, difficulty } = generatePuzzle(d, seededRng(240 + DIFFICULTIES.indexOf(d)));
        assert.equal(difficulty, d);
        assert.equal(hasUniqueSolution(puzzle), true);
        assert.equal(solution.length, 81);
        assert.equal(grade(puzzle), d);
    }
});

test('generatePuzzle never mislabels its difficulty and never returns unsolvable', () => {
    for (const d of DIFFICULTIES) {
        const { puzzle, difficulty } = generatePuzzle(d, seededRng(500 + DIFFICULTIES.indexOf(d)), 20);
        assert.notEqual(difficulty, 'unsolvable');
        assert.equal(grade(puzzle), difficulty);
        if (difficulty === d) {
            assert.equal(grade(puzzle), d);
        }
    }
});
