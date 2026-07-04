// demi-sudoku/src/ui/encyclopedia-view.js
export function createEncyclopediaView(container, animalsApi, mapSvg) {
    let backCb = () => {};

    function render(unlockedIds) {
        const unlocked = new Set(unlockedIds);
        container.innerHTML = '';

        const header = document.createElement('div');
        const back = document.createElement('button');
        back.textContent = '返回';
        back.addEventListener('click', () => backCb());
        const title = document.createElement('h2');
        title.textContent = `動物圖鑑 (${unlocked.size}/${animalsApi.list.length})`;
        header.append(back, title);

        const grid = document.createElement('div');
        grid.className = 'animal-grid';
        for (const a of animalsApi.list) {
            const cell = document.createElement('div');
            cell.className = 'cellx' + (unlocked.has(a.id) ? '' : ' locked');
            cell.textContent = unlocked.has(a.id) ? a.emoji : '?';
            if (unlocked.has(a.id)) {
                cell.addEventListener('click', () => showDetail(a));
            }
            grid.appendChild(cell);
        }

        container.append(header, grid);
    }

    function showDetail(a) {
        container.innerHTML = '';
        const back = document.createElement('button');
        back.textContent = '返回圖鑑';
        back.addEventListener('click', () => render(currentUnlocked()));
        const emoji = document.createElement('div');
        emoji.className = 'mascot';
        emoji.textContent = a.emoji;
        const names = document.createElement('h2');
        names.textContent = `${a.name_zh} · ${a.name_en}`;
        const sci = document.createElement('p');
        sci.style.fontStyle = 'italic';
        sci.textContent = a.scientific;
        const habitat = document.createElement('p');
        habitat.textContent = a.habitat_zh;

        const mapWrap = document.createElement('div');
        mapWrap.innerHTML = mapSvg;
        for (const region of a.regions) {
            const shape = mapWrap.querySelector(`#${CSS.escape(region)}`);
            if (shape) shape.classList.add('highlight');
        }

        container.append(back, emoji, names, sci, habitat, mapWrap);
    }

    let _unlocked = [];
    function currentUnlocked() { return _unlocked; }
    const wrappedRender = (ids) => { _unlocked = ids; render(ids); };

    return {
        render: wrappedRender,
        onBack(cb) { backCb = cb; },
    };
}
