import { logicalSolve, TECHNIQUES } from './logical-solver.js';
import { generateFull, dig } from './generator.js';
import { solve } from './solver.js';

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

// Approximate number of clues (givens) shown at each difficulty. More clues =
// easier. These drive the felt difficulty; the technique ceiling below only
// guarantees the puzzle stays humanly solvable at that level.
export const TARGET_GIVENS = { easy: 46, medium: 38, hard: 32, expert: 26 };

// Cells to remove per difficulty (81 - target givens).
const REMOVED_TARGET = {
    easy: 81 - TARGET_GIVENS.easy,
    medium: 81 - TARGET_GIVENS.medium,
    hard: 81 - TARGET_GIVENS.hard,
    expert: 81 - TARGET_GIVENS.expert,
};

// Hardest solving technique permitted at each difficulty (index into
// TECHNIQUES). A candidate qualifies when it is logically solvable using
// techniques no harder than this ceiling, so easier levels never demand
// advanced tactics.
const CEILING_RANK = { easy: 1, medium: 2, hard: 3, expert: 4 };

const TECH_TO_DIFF = {
    naked_single: 'easy',
    hidden_single: 'easy',
    locked_candidates: 'medium',
    naked_pair_triple: 'hard',
    x_wing: 'expert',
};

/**
 * Classify a puzzle by the hardest human technique its logical solution needs.
 *
 * Args:
 *     puzzle: 81-element grid (0 = empty).
 *
 * Returns:
 *     'easy' | 'medium' | 'hard' | 'expert' | 'unsolvable'.
 */
export function grade(puzzle) {
    const { solved, hardest } = logicalSolve(puzzle);
    if (!solved) return 'unsolvable';
    if (hardest === null) return 'easy';
    return TECH_TO_DIFF[hardest];
}

function techniqueRank(hardest) {
    return hardest === null ? 0 : TECHNIQUES.indexOf(hardest);
}

/**
 * Generate a puzzle whose clue count and required tactics match a difficulty.
 *
 * The clue count comes from TARGET_GIVENS; the puzzle is accepted only when it
 * is logically solvable within the difficulty's technique ceiling, so lower
 * levels stay gentle. The returned difficulty is always the requested one.
 *
 * Args:
 *     difficulty: one of DIFFICULTIES.
 *     rng: a function returning a float in [0, 1).
 *     attempts: maximum generation tries before falling back.
 *
 * Returns:
 *     {puzzle, solution, difficulty} with a unique-solution puzzle.
 */
export function generatePuzzle(difficulty, rng, attempts = 200) {
    const target = REMOVED_TARGET[difficulty];
    const ceiling = CEILING_RANK[difficulty];
    let fallback = null;
    for (let a = 0; a < attempts; a++) {
        const full = generateFull(rng);
        const puzzle = dig(full, rng, target);
        const { solved, hardest } = logicalSolve(puzzle);
        if (!solved) continue;
        if (techniqueRank(hardest) <= ceiling) {
            return { puzzle, solution: solve(puzzle), difficulty };
        }
        if (fallback === null) fallback = puzzle;
    }
    // Fallback: a uniquely-solvable puzzle at the target clue count, even if it
    // needed a technique above the ceiling. Never returns an unsolvable board.
    const puzzle = fallback || dig(generateFull(rng), rng, target);
    return { puzzle, solution: solve(puzzle), difficulty };
}
