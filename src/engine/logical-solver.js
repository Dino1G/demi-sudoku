import { CELLS, UNITS, PEERS } from './grid.js';

export const TECHNIQUES = [
    'naked_single',
    'hidden_single',
    'locked_candidates',
    'naked_pair_triple',
    'x_wing',
];
const RANK = Object.fromEntries(TECHNIQUES.map((t, i) => [t, i]));

function buildCandidates(values) {
    const cand = new Array(CELLS);
    for (let i = 0; i < CELLS; i++) {
        if (values[i]) {
            cand[i] = new Set();
            continue;
        }
        const s = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const p of PEERS[i]) s.delete(values[p]);
        cand[i] = s;
    }
    return cand;
}

function assign(values, cand, i, v) {
    values[i] = v;
    cand[i] = new Set();
    for (const p of PEERS[i]) cand[p].delete(v);
}

function nakedSingle(values, cand) {
    for (let i = 0; i < CELLS; i++) {
        if (!values[i] && cand[i].size === 1) {
            assign(values, cand, i, [...cand[i]][0]);
            return true;
        }
    }
    return false;
}

function hiddenSingle(values, cand) {
    for (const unit of UNITS) {
        for (let v = 1; v <= 9; v++) {
            let spot = -1;
            let taken = false;
            for (const i of unit) {
                if (values[i] === v) { taken = true; break; }
                if (!values[i] && cand[i].has(v)) {
                    spot = spot === -1 ? i : -2;
                }
            }
            if (!taken && spot >= 0) {
                assign(values, cand, spot, v);
                return true;
            }
        }
    }
    return false;
}

const ROWS = UNITS.slice(0, 9);
const COLS = UNITS.slice(9, 18);
const BOXES = UNITS.slice(18, 27);

function eliminate(cand, cells, v, keep) {
    let changed = false;
    for (const i of cells) {
        if (keep.has(i)) continue;
        if (cand[i].delete(v)) changed = true;
    }
    return changed;
}

function lockedCandidates(values, cand) {
    // Pointing: value in a box confined to one row/col -> remove from rest of that line.
    for (const box of BOXES) {
        for (let v = 1; v <= 9; v++) {
            const spots = box.filter((i) => !values[i] && cand[i].has(v));
            if (spots.length < 2) continue;
            const rows = new Set(spots.map((i) => Math.floor(i / 9)));
            const cols = new Set(spots.map((i) => i % 9));
            if (rows.size === 1) {
                if (eliminate(cand, ROWS[[...rows][0]], v, new Set(box))) return true;
            }
            if (cols.size === 1) {
                if (eliminate(cand, COLS[[...cols][0]], v, new Set(box))) return true;
            }
        }
    }
    // Claiming: value in a line confined to one box -> remove from rest of that box.
    for (const line of [...ROWS, ...COLS]) {
        for (let v = 1; v <= 9; v++) {
            const spots = line.filter((i) => !values[i] && cand[i].has(v));
            if (spots.length < 2) continue;
            const boxesHit = new Set(spots.map((i) => {
                const r = Math.floor(i / 9), c = i % 9;
                return Math.floor(r / 3) * 3 + Math.floor(c / 3);
            }));
            if (boxesHit.size === 1) {
                if (eliminate(cand, BOXES[[...boxesHit][0]], v, new Set(line))) return true;
            }
        }
    }
    return false;
}

function combinations(arr, k) {
    const res = [];
    const combo = [];
    (function rec(start) {
        if (combo.length === k) { res.push(combo.slice()); return; }
        for (let i = start; i < arr.length; i++) {
            combo.push(arr[i]);
            rec(i + 1);
            combo.pop();
        }
    })(0);
    return res;
}

function nakedSubset(values, cand) {
    for (const unit of UNITS) {
        const empties = unit.filter((i) => !values[i]);
        for (const k of [2, 3]) {
            for (const group of combinations(empties, k)) {
                const union = new Set();
                for (const i of group) for (const v of cand[i]) union.add(v);
                if (union.size !== k) continue;
                const keep = new Set(group);
                for (const v of union) {
                    if (eliminate(cand, unit, v, keep)) return true;
                }
            }
        }
    }
    return false;
}

function xWingOnLines(values, cand, v, lines, rowBased) {
    const rowsWithTwo = [];
    for (let li = 0; li < lines.length; li++) {
        const spots = lines[li].filter((i) => !values[i] && cand[i].has(v));
        if (spots.length === 2) {
            const cross = spots.map((i) => (rowBased ? i % 9 : Math.floor(i / 9)));
            rowsWithTwo.push({ li, cross: cross.sort((a, b) => a - b) });
        }
    }
    for (const [a, b] of combinations(rowsWithTwo, 2)) {
        if (a.cross[0] === b.cross[0] && a.cross[1] === b.cross[1]) {
            const keep = new Set([...lines[a.li], ...lines[b.li]]);
            const crossLines = rowBased ? COLS : ROWS;
            let changed = false;
            for (const cIdx of a.cross) {
                if (eliminate(cand, crossLines[cIdx], v, keep)) changed = true;
            }
            if (changed) return true;
        }
    }
    return false;
}

export function xWing(values, cand) {
    for (let v = 1; v <= 9; v++) {
        // Row-based X-Wing.
        if (xWingOnLines(values, cand, v, ROWS, true)) return true;
        // Column-based X-Wing.
        if (xWingOnLines(values, cand, v, COLS, false)) return true;
    }
    return false;
}

export function logicalSolve(grid) {
    const values = grid.slice();
    const cand = buildCandidates(values);
    let hardestRank = -1;
    const techniques = techniqueList();

    let progress = true;
    while (progress) {
        progress = false;
        for (const [name, fn] of techniques) {
            if (fn(values, cand)) {
                hardestRank = Math.max(hardestRank, RANK[name]);
                progress = true;
                break; // restart from easiest technique
            }
        }
    }

    const solved = values.every((v) => v !== 0);
    return { solved, hardest: hardestRank === -1 ? null : TECHNIQUES[hardestRank] };
}

function techniqueList() {
    return [
        ['naked_single', nakedSingle],
        ['hidden_single', hiddenSingle],
        ['locked_candidates', lockedCandidates],
        ['naked_pair_triple', nakedSubset],
        ['x_wing', xWing],
    ];
}
