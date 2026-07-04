import { DIFFICULTIES, TARGET_GIVENS } from './../engine/grader.js';
import { DEMI_CAMEL_SVG } from './brand.js';

const LABELS = { easy: '簡單', medium: '中等', hard: '困難', expert: '專家' };
const MOODS = { easy: '輕鬆入門', medium: '穩健推理', hard: '燒腦挑戰', expert: '大師級' };

export function createMenu(container, opts) {
    function render() {
        container.innerHTML = '';

        const hero = document.createElement('div');
        hero.className = 'demi-hero';
        hero.innerHTML = DEMI_CAMEL_SVG;

        const head = document.createElement('div');
        head.className = 'menu-head';
        const eyebrow = document.createElement('p');
        eyebrow.className = 'eyebrow';
        eyebrow.textContent = '沙漠動物 · 數獨';
        const brand = document.createElement('h1');
        brand.className = 'brand';
        brand.textContent = 'Demi 數獨';
        head.append(eyebrow, brand);

        const levels = document.createElement('div');
        levels.className = 'levels';
        for (const d of DIFFICULTIES) {
            const b = document.createElement('button');
            b.className = 'level';
            b.dataset.diff = d;

            const mainBox = document.createElement('span');
            mainBox.className = 'level-main';
            const name = document.createElement('span');
            name.className = 'level-name';
            name.textContent = LABELS[d];
            const sub = document.createElement('span');
            sub.className = 'level-sub';
            sub.textContent = `約 ${TARGET_GIVENS[d]} 提示 · ${MOODS[d]}`;
            mainBox.append(name, sub);
            b.appendChild(mainBox);

            const s = opts.stats[d];
            if (s && s.bestTimeMs != null) {
                const best = document.createElement('span');
                best.className = 'level-best';
                best.textContent = `最佳 ${formatTime(s.bestTimeMs)}`;
                b.appendChild(best);
            }

            b.addEventListener('click', () => opts.onStart(d));
            levels.appendChild(b);
        }

        const enc = document.createElement('button');
        enc.className = 'enc-card';
        const encTitle = document.createElement('span');
        encTitle.className = 'enc-title';
        encTitle.textContent = '動物圖鑑';
        const encCount = document.createElement('span');
        encCount.className = 'enc-count';
        encCount.textContent = `${opts.collectedCount} / ${opts.totalAnimals}`;
        enc.append(encTitle, encCount);
        enc.addEventListener('click', () => opts.onOpenEncyclopedia());

        const settings = document.createElement('div');
        settings.className = 'settings';
        settings.append(
            toggle('錯誤標示', 'errorHighlight'),
            toggle('顯示計時器', 'showTimer')
        );

        container.append(hero, head, levels, enc, settings);

        function toggle(label, key) {
            const wrap = document.createElement('label');
            wrap.className = 'switch';
            const text = document.createElement('span');
            text.className = 'switch-label';
            text.textContent = label;
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'switch-input';
            input.checked = opts.settings[key];
            input.addEventListener('change', () => opts.onToggleSetting(key));
            const track = document.createElement('span');
            track.className = 'switch-track';
            const thumb = document.createElement('span');
            thumb.className = 'switch-thumb';
            track.appendChild(thumb);
            wrap.append(text, input, track);
            return wrap;
        }
    }
    return { render };
}

export function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
