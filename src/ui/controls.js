export function createControls(container, handlers) {
    const pad = document.createElement('div');
    pad.className = 'pad';
    for (let v = 1; v <= 9; v++) {
        const b = document.createElement('button');
        b.textContent = String(v);
        b.addEventListener('click', () => handlers.onNumber(v));
        pad.appendChild(b);
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
        b.textContent = label;
        b.addEventListener('click', onClick);
        return b;
    }

    return {
        setNotesActive(active) {
            noteBtn.classList.toggle('active', active);
        },
    };
}
