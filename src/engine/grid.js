export const SIZE = 9;
export const CELLS = 81;

export function idx(r, c) {
    return r * SIZE + c;
}

export function rc(i) {
    return [Math.floor(i / SIZE), i % SIZE];
}

function boxStart(r, c) {
    return [Math.floor(r / 3) * 3, Math.floor(c / 3) * 3];
}

export const PEERS = (() => {
    const peers = [];
    for (let i = 0; i < CELLS; i++) {
        const [r, c] = rc(i);
        const set = new Set();
        for (let k = 0; k < SIZE; k++) {
            set.add(idx(r, k));
            set.add(idx(k, c));
        }
        const [br, bc] = boxStart(r, c);
        for (let dr = 0; dr < 3; dr++) {
            for (let dc = 0; dc < 3; dc++) {
                set.add(idx(br + dr, bc + dc));
            }
        }
        set.delete(i);
        peers.push([...set]);
    }
    return peers;
})();

export const UNITS = (() => {
    const units = [];
    for (let r = 0; r < SIZE; r++) {
        units.push(Array.from({ length: SIZE }, (_, c) => idx(r, c)));
    }
    for (let c = 0; c < SIZE; c++) {
        units.push(Array.from({ length: SIZE }, (_, r) => idx(r, c)));
    }
    for (let br = 0; br < SIZE; br += 3) {
        for (let bc = 0; bc < SIZE; bc += 3) {
            const u = [];
            for (let dr = 0; dr < 3; dr++) {
                for (let dc = 0; dc < 3; dc++) {
                    u.push(idx(br + dr, bc + dc));
                }
            }
            units.push(u);
        }
    }
    return units;
})();

export function parse(str) {
    return Array.from(str, (ch) =>
        ch === '.' || ch === '0' || ch === '_' ? 0 : Number(ch)
    );
}

export function serialize(grid) {
    return grid.map((v) => (v === 0 ? '.' : String(v))).join('');
}

export function isValidPlacement(grid, index, value) {
    return PEERS[index].every((p) => grid[p] !== value);
}
