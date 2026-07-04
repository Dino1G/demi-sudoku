import { CELLS, rc, PEERS } from './../engine/grid.js';

export function createBoardView(container, onCellClick) {
    container.classList.add('board');
    const cells = [];
    for (let i = 0; i < CELLS; i++) {
        const el = document.createElement('div');
        el.className = 'cell';
        const [r, c] = rc(i);
        if ((Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1) el.classList.add('box-alt');
        el.addEventListener('click', () => onCellClick(i));
        container.appendChild(el);
        cells.push(el);
    }

    function render(state, settings) {
        const sel = state.selected;
        const selVal = sel >= 0 ? state.values[sel] : 0;
        const peers = sel >= 0 ? new Set(PEERS[sel]) : new Set();
        for (let i = 0; i < CELLS; i++) {
            const el = cells[i];
            const v = state.values[i];
            el.className = 'cell' + (isBoxAlt(i) ? ' box-alt' : '');
            if (state.given[i]) el.classList.add('given');
            else if (v !== 0) el.classList.add('filled');
            if (i === sel) el.classList.add('selected');
            else if (peers.has(i)) el.classList.add('peer');
            if (selVal !== 0 && v === selVal) el.classList.add('same');
            if (settings.errorHighlight && state.wrongCells && state.wrongCells.has(i)) {
                el.classList.add('error');
            }
            el.textContent = '';
            if (v !== 0) {
                el.textContent = String(v);
            } else if (state.notes[i] && state.notes[i].size > 0) {
                const notes = document.createElement('div');
                notes.className = 'notes';
                for (let n = 1; n <= 9; n++) {
                    const span = document.createElement('span');
                    span.textContent = state.notes[i].has(n) ? String(n) : '';
                    notes.appendChild(span);
                }
                el.appendChild(notes);
            }
        }
    }

    function isBoxAlt(i) {
        const [r, c] = rc(i);
        return (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1;
    }

    return { render };
}
