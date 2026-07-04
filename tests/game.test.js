import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game/game.js';

function fixture() {
    const solution = Array.from({ length: 81 }, (_, i) => (i % 9) + 1);
    const puzzle = solution.slice();
    puzzle[0] = 0; // one blank at index 0 (solution value 1)
    return { puzzle, solution, difficulty: 'easy', animalId: 'camel' };
}

test('input correct value solves and marks no mistake', () => {
    const g = createGame(fixture());
    g.select(0);
    g.input(1);
    const st = g.state();
    assert.equal(st.values[0], 1);
    assert.equal(st.mistakes, 0);
    assert.equal(st.isSolved, true);
});

test('input wrong value records a mistake and is not solved', () => {
    const g = createGame(fixture());
    g.select(0);
    g.input(5);
    const st = g.state();
    assert.equal(st.mistakes, 1);
    assert.equal(st.isSolved, false);
});

test('given cells are immutable', () => {
    const g = createGame(fixture());
    g.select(1); // a given
    g.input(9);
    assert.equal(g.state().values[1], g.state().given[1]);
});

test('notes toggle and clear on value entry', () => {
    const g = createGame(fixture());
    g.select(0);
    g.toggleNote(3);
    g.toggleNote(4);
    assert.deepEqual([...g.state().notes[0]].sort(), [3, 4]);
    g.toggleNote(3);
    assert.deepEqual([...g.state().notes[0]], [4]);
    g.input(1);
    assert.equal(g.state().notes[0].size, 0);
});

test('undo reverts the last value entry', () => {
    const g = createGame(fixture());
    g.select(0);
    g.input(5);
    g.undo();
    assert.equal(g.state().values[0], 0);
});
