// demi-sudoku/src/ui/encyclopedia-view.js
import { REGION_COUNTRIES } from './../data/region-map.js';

const REGION_LABELS_ZH = {
    'north-america': '北美洲',
    'central-america': '中美洲',
    'south-america': '南美洲',
    'north-africa': '北非',
    'sub-saharan-africa': '撒哈拉以南非洲',
    'southern-africa': '非洲南部',
    'europe': '歐洲',
    'middle-east': '中東',
    'central-asia': '中亞',
    'south-asia': '南亞',
    'east-asia': '東亞',
    'southeast-asia': '東南亞',
    'siberia': '西伯利亞',
    'australia': '澳洲',
    'oceania': '大洋洲',
    'arctic': '北極',
    'antarctica': '南極',
    'oceans': '海洋',
};

const SPEAKER_ICON =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
    + '<path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/>'
    + '<path d="M16 8.5a4 4 0 010 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    + '</svg>';

function speak(text) {
    const synth = window.speechSynthesis;
    if (!synth) return null;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.98;
    synth.speak(utter);
    return utter;
}

export function createEncyclopediaView(container, animalsApi, mapSvg, imageLoader) {
    let backCb = () => {};
    let _unlocked = [];

    function thumb(animal) {
        const wrap = document.createElement('div');
        wrap.className = 'thumb';
        const fallback = document.createElement('span');
        fallback.className = 'thumb-name';
        fallback.textContent = animal.name_zh;
        wrap.appendChild(fallback);
        const img = document.createElement('img');
        img.className = 'thumb-img';
        img.alt = animal.name_zh;
        img.loading = 'lazy';
        img.addEventListener('load', () => wrap.classList.add('loaded'));
        img.addEventListener('error', () => { img.remove(); });
        imageLoader.getInfo(animal).then((info) => {
            if (info.image) img.src = info.image;
            else img.remove();
        });
        wrap.appendChild(img);
        return wrap;
    }

    function render(unlockedIds) {
        const unlocked = new Set(unlockedIds);
        container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'enc-head';
        const back = document.createElement('button');
        back.className = 'btn-ghost';
        back.textContent = '‹ 選單';
        back.addEventListener('click', () => backCb());
        const title = document.createElement('h2');
        title.textContent = '動物圖鑑';
        const progress = document.createElement('span');
        progress.className = 'enc-progress';
        progress.textContent = `${unlocked.size} / ${animalsApi.list.length}`;
        header.append(back, title, progress);

        const grid = document.createElement('div');
        grid.className = 'animal-grid';
        for (const a of animalsApi.list) {
            const cell = document.createElement('div');
            if (unlocked.has(a.id)) {
                cell.className = 'cellx';
                cell.appendChild(thumb(a));
                cell.addEventListener('click', () => showDetail(a));
            } else {
                cell.className = 'cellx locked';
                cell.textContent = '?';
            }
            grid.appendChild(cell);
        }

        const credit = document.createElement('p');
        credit.className = 'enc-credit';
        credit.textContent = '動物照片來源：Wikipedia / Wikimedia Commons';

        container.append(header, grid, credit);
    }

    function showDetail(a) {
        container.innerHTML = '';
        window.speechSynthesis && window.speechSynthesis.cancel();
        let englishExtract = null;

        const back = document.createElement('button');
        back.className = 'btn-ghost';
        back.textContent = '‹ 返回圖鑑';
        back.addEventListener('click', () => {
            window.speechSynthesis && window.speechSynthesis.cancel();
            render(_unlocked);
        });

        const photo = document.createElement('div');
        photo.className = 'detail-photo';
        const pFallback = document.createElement('span');
        pFallback.className = 'thumb-name';
        pFallback.textContent = a.name_zh;
        photo.appendChild(pFallback);
        const img = document.createElement('img');
        img.alt = a.name_zh;
        img.addEventListener('load', () => photo.classList.add('loaded'));
        img.addEventListener('error', () => img.remove());
        const info = imageLoader.getInfo(a);
        info.then((data) => {
            if (data.image) img.src = data.image; else img.remove();
            englishExtract = data.extractEn || null;
        });
        photo.appendChild(img);

        const names = document.createElement('h2');
        names.className = 'detail-name';
        names.textContent = `${a.name_zh} · ${a.name_en}`;

        const sci = document.createElement('p');
        sci.className = 'detail-sci';
        sci.textContent = a.scientific;

        const tts = document.createElement('button');
        tts.className = 'btn tts-btn';
        tts.innerHTML = SPEAKER_ICON + '<span>英文朗讀</span>';
        const setTtsLabel = (t) => { tts.querySelector('span').textContent = t; };
        tts.addEventListener('click', () => {
            const synth = window.speechSynthesis;
            if (!synth) { setTtsLabel('此裝置不支援朗讀'); return; }
            if (synth.speaking) { synth.cancel(); setTtsLabel('英文朗讀'); return; }
            const text = englishExtract ? `${a.name_en}. ${englishExtract}` : a.name_en;
            const utter = speak(text);
            if (!utter) { setTtsLabel('此裝置不支援朗讀'); return; }
            utter.onend = () => setTtsLabel('英文朗讀');
            utter.onerror = () => setTtsLabel('英文朗讀');
            setTtsLabel('停止朗讀');
        });

        const habitat = document.createElement('p');
        habitat.className = 'detail-habitat';
        habitat.textContent = a.habitat_zh;

        // Richer intro from Chinese Wikipedia, shown when it loads (online).
        const wiki = document.createElement('p');
        wiki.className = 'detail-wiki';
        wiki.hidden = true;
        info.then((data) => {
            if (data.extract) {
                wiki.textContent = data.extract;
                wiki.hidden = false;
            }
        });

        const regionCaption = document.createElement('p');
        regionCaption.className = 'detail-regions';
        regionCaption.textContent = '分佈：' + a.regions.map((r) => REGION_LABELS_ZH[r] || r).join('、');

        const mapWrap = document.createElement('div');
        mapWrap.className = 'map-wrap';
        mapWrap.innerHTML = mapSvg;
        for (const region of a.regions) {
            for (const countryId of REGION_COUNTRIES[region] || []) {
                const shape = mapWrap.querySelector(`#${CSS.escape(countryId)}`);
                if (shape) shape.classList.add('highlight');
            }
        }

        container.append(back, photo, names, sci, tts, habitat, wiki, regionCaption, mapWrap);
    }

    return {
        render: (ids) => { _unlocked = ids; render(ids); },
        onBack(cb) { backCb = cb; },
    };
}
