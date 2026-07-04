import { CELLS } from './../engine/grid.js';

export function createGame({ puzzle, solution, difficulty, animalId }) {
    const given = puzzle.slice();
    const values = puzzle.slice();
    const notes = Array.from({ length: CELLS }, () => new Set());
    const history = [];
    let selected = -1;
    let mistakes = 0;

    function isSolved() {
        for (let i = 0; i < CELLS; i++) {
            if (values[i] !== solution[i]) return false;
        }
        return true;
    }

    return {
        select(i) {
            selected = i;
        },
        input(v) {
            if (selected < 0 || given[selected]) return;
            history.push({ i: selected, prev: values[selected], notes: new Set(notes[selected]) });
            values[selected] = v;
            notes[selected].clear();
            if (v !== solution[selected]) mistakes += 1;
        },
        toggleNote(v) {
            if (selected < 0 || given[selected] || values[selected] !== 0) return;
            if (notes[selected].has(v)) notes[selected].delete(v);
            else notes[selected].add(v);
        },
        erase() {
            if (selected < 0 || given[selected]) return;
            history.push({ i: selected, prev: values[selected], notes: new Set(notes[selected]) });
            values[selected] = 0;
            notes[selected].clear();
        },
        undo() {
            const last = history.pop();
            if (!last) return;
            values[last.i] = last.prev;
            notes[last.i] = new Set(last.notes);
        },
        state() {
            return {
                selected,
                values: values.slice(),
                notes: notes.map((s) => new Set(s)),
                given: given.slice(),
                mistakes,
                difficulty,
                animalId,
                isSolved: isSolved(),
            };
        },
    };
}
