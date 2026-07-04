// demi-sudoku/src/ui/menu.js
import { DIFFICULTIES } from './../engine/grader.js';

const LABELS = { easy: '簡單', medium: '中等', hard: '困難', expert: '專家' };

export function createMenu(container, opts) {
    function render() {
        container.innerHTML = '';
        const title = document.createElement('h1');
        title.textContent = 'Demi 數獨';

        const list = document.createElement('div');
        list.className = 'difficulty-list';
        for (const d of DIFFICULTIES) {
            const b = document.createElement('button');
            const s = opts.stats[d];
            const best = s && s.bestTimeMs != null ? ` · 最佳 ${formatTime(s.bestTimeMs)}` : '';
            b.textContent = LABELS[d] + best;
            b.addEventListener('click', () => opts.onStart(d));
            list.appendChild(b);
        }

        const encWrap = document.createElement('div');
        encWrap.className = 'difficulty-list';
        const enc = document.createElement('button');
        enc.textContent = '動物圖鑑';
        enc.addEventListener('click', () => opts.onOpenEncyclopedia());
        encWrap.appendChild(enc);

        const toggles = document.createElement('div');
        toggles.append(
            toggle('錯誤標示', 'errorHighlight'),
            toggle('顯示計時器', 'showTimer')
        );

        container.append(title, list, encWrap, toggles);

        function toggle(label, key) {
            const wrap = document.createElement('label');
            wrap.style.display = 'block';
            wrap.style.margin = '8px 0';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = opts.settings[key];
            cb.addEventListener('change', () => opts.onToggleSetting(key));
            wrap.append(cb, ' ' + label);
            return wrap;
        }
    }
    return { render };
}

export function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
