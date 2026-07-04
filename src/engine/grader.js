import { logicalSolve } from './logical-solver.js';
import { generateFull, dig } from './generator.js';
import { solve } from './solver.js';

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

const TECH_TO_DIFF = {
    naked_single: 'easy',
    hidden_single: 'easy',
    locked_candidates: 'medium',
    naked_pair_triple: 'hard',
    x_wing: 'expert',
};

export function grade(puzzle) {
    const { solved, hardest } = logicalSolve(puzzle);
    if (!solved) return 'unsolvable';
    if (hardest === null) return 'easy';
    return TECH_TO_DIFF[hardest];
}

export function generatePuzzle(difficulty, rng, attempts = 120) {
    const targetRank = DIFFICULTIES.indexOf(difficulty);
    let closest = null;
    let closestRankDistance = Infinity;
    for (let a = 0; a < attempts; a++) {
        const full = generateFull(rng);
        const puzzle = dig(full, rng);
        const g = grade(puzzle);
        if (g === difficulty) {
            return { puzzle, solution: solve(puzzle), difficulty };
        }
        const rank = DIFFICULTIES.indexOf(g);
        if (rank === -1) continue;
        const rankDistance = Math.abs(rank - targetRank);
        if (rankDistance < closestRankDistance) {
            closestRankDistance = rankDistance;
            closest = { puzzle, grade: g };
        }
    }
    if (closest === null) {
        throw new Error(
            `generatePuzzle: no logically-gradable puzzle found in ${attempts} attempts`
        );
    }
    // Fallback: no exact match found within `attempts` tries. Return the
    // candidate whose true grade is closest in rank to the requested
    // difficulty, labeled honestly with its own grade.
    return {
        puzzle: closest.puzzle,
        solution: solve(closest.puzzle),
        difficulty: closest.grade,
    };
}
