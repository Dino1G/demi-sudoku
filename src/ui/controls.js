export function createControls(container, handlers) {
    const pad = document.createElement('div');
    pad.className = 'pad';
    const keys = [];
    for (let v = 1; v <= 9; v++) {
        const b = document.createElement('button');
        b.className = 'key';
        const num = document.createElement('span');
        num.className = 'key-num';
        num.textContent = String(v);
        const left = document.createElement('span');
        left.className = 'key-left';
        left.textContent = '9';
        b.append(num, left);
        b.addEventListener('click', () => handlers.onNumber(v));
        pad.appendChild(b);
        keys.push({ button: b, left });
    }

    const tools = document.createElement('div');
    tools.className = 'tools';
    const noteBtn = toolButton('註記', () => handlers.onNote());
    tools.append(
        noteBtn,
        toolButton('復原', () => handlers.onUndo()),
        toolButton('提示', () => handlers.onHint()),
        toolButton('擦除', () => handlers.onErase())
    );

    container.append(pad, tools);

    function toolButton(label, onClick) {
        const b = document.createElement('button');
        b.className = 'tool';
        b.textContent = label;
        b.addEventListener('click', onClick);
        return b;
    }

    return {
        setNotesActive(active) {
            noteBtn.classList.toggle('active', active);
        },
        // counts: array where counts[v] is how many of digit v are on the board.
        setCounts(counts) {
            for (let v = 1; v <= 9; v++) {
                const remaining = Math.max(0, 9 - (counts[v] || 0));
                const key = keys[v - 1];
                key.left.textContent = String(remaining);
                key.button.classList.toggle('done', remaining === 0);
            }
        },
    };
}
