// demi-sudoku/src/ui/app.js
import { createStorage } from './../game/storage.js';
import { createGame } from './../game/game.js';
import { loadAnimals } from './../game/animals.js';
import { createBoardView } from './board-view.js';
import { createControls } from './controls.js';
import { createMenu, formatTime } from './menu.js';
import { createEncyclopediaView } from './encyclopedia-view.js';

const LABELS = { easy: '簡單', medium: '中等', hard: '困難', expert: '專家' };

const screens = {
    menu: document.getElementById('screen-menu'),
    game: document.getElementById('screen-game'),
    encyclopedia: document.getElementById('screen-encyclopedia'),
};
const overlay = document.getElementById('overlay');

function show(name) {
    for (const [k, el] of Object.entries(screens)) el.classList.toggle('hidden', k !== name);
}

function digitCounts(values) {
    const counts = new Array(10).fill(0);
    for (const v of values) if (v) counts[v] += 1;
    return counts;
}

async function main() {
    const storage = createStorage(window.localStorage);
    const [animalsJson, mapSvg] = await Promise.all([
        fetch('src/data/animals.json').then((r) => r.json()),
        fetch('src/data/world-map.svg').then((r) => r.text()),
    ]);
    const animalsApi = loadAnimals(animalsJson);
    const worker = new Worker('src/engine/worker.js', { type: 'module' });

    let game = null;
    let solution = null;
    let notesMode = false;
    let startedAt = 0;
    let timerId = null;
    let gameUi = null;

    const menuOpts = {
        stats: storage.loadStats(),
        settings: storage.loadSettings(),
        collectedCount: 0,
        totalAnimals: animalsApi.list.length,
        onStart: startGame,
        onOpenEncyclopedia: openEncyclopedia,
        onToggleSetting: (key) => {
            const s = storage.loadSettings();
            s[key] = !s[key];
            storage.saveSettings(s);
            renderMenu();
            if (game) renderGame();
        },
    };
    const menu = createMenu(screens.menu, menuOpts);

    const encyclopedia = createEncyclopediaView(screens.encyclopedia, animalsApi, mapSvg);
    encyclopedia.onBack(() => { renderMenu(); show('menu'); });

    function renderMenu() {
        menuOpts.stats = storage.loadStats();
        menuOpts.settings = storage.loadSettings();
        menuOpts.collectedCount = storage.loadCollection().unlocked.length;
        menu.render();
    }

    function buildGameUi(animalId, difficulty) {
        screens.game.innerHTML = '';
        notesMode = false;

        const top = document.createElement('div');
        top.className = 'game-top';
        const back = document.createElement('button');
        back.className = 'btn-ghost';
        back.textContent = '‹ 選單';
        back.addEventListener('click', () => { stopTimer(); renderMenu(); show('menu'); });
        const pill = document.createElement('span');
        pill.className = 'level-pill';
        pill.textContent = LABELS[difficulty] || difficulty;
        const timer = document.createElement('span');
        timer.className = 'timer';
        top.append(back, pill, timer);

        const badge = document.createElement('div');
        badge.className = 'mascot-badge';
        const mascot = document.createElement('div');
        mascot.className = 'mascot';
        mascot.textContent = animalsApi.byId(animalId).emoji;
        badge.appendChild(mascot);

        const boardHost = document.createElement('div');
        const controlsHost = document.createElement('div');
        screens.game.append(top, badge, boardHost, controlsHost);

        const bv = createBoardView(boardHost, (i) => { game.select(i); renderGame(); });
        gameUi = { bv, timer, mascot };

        const controls = createControls(controlsHost, {
            onNumber: (v) => { (notesMode ? game.toggleNote(v) : game.input(v)); afterMove(); },
            onNote: () => { notesMode = !notesMode; controls.setNotesActive(notesMode); },
            onUndo: () => { game.undo(); afterMove(); },
            onErase: () => { game.erase(); afterMove(); },
            onHint: () => {
                const st = game.state();
                if (st.selected >= 0 && !st.given[st.selected]) {
                    game.input(solution[st.selected]);
                    afterMove();
                }
            },
        });
        controls.setNotesActive(notesMode);
        gameUi.controls = controls;
    }

    function wrongCells(st) {
        const wrong = new Set();
        for (let i = 0; i < 81; i++) {
            if (!st.given[i] && st.values[i] !== 0 && st.values[i] !== solution[i]) wrong.add(i);
        }
        return wrong;
    }

    function renderGame() {
        const st = game.state();
        st.wrongCells = wrongCells(st);
        gameUi.bv.render(st, storage.loadSettings());
        gameUi.controls.setCounts(digitCounts(st.values));
    }

    function afterMove() {
        renderGame();
        persist();
        const st = game.state();
        if (st.isSolved) onWin(st);
    }

    function persist() {
        const st = game.state();
        storage.saveGame({
            difficulty: st.difficulty,
            animalId: st.animalId,
            given: st.given,
            values: st.values,
            notes: st.notes.map((s) => [...s]),
            solution,
            elapsed: Date.now() - startedAt,
        });
    }

    function onWin(st) {
        stopTimer();
        const timeMs = Date.now() - startedAt;
        storage.recordResult(st.difficulty, { completed: true, timeMs });
        const newly = storage.unlock(st.animalId);
        storage.clearSaved();
        showWin(st, timeMs, newly);
    }

    function showWin(st, timeMs, newly) {
        const a = animalsApi.byId(st.animalId);
        overlay.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'win-card';

        const emoji = document.createElement('div');
        emoji.className = 'win-emoji';
        emoji.textContent = a.emoji;

        const title = document.createElement('h2');
        title.className = 'win-title';
        title.textContent = newly ? '解鎖新動物！' : '完成！';
        card.append(emoji, title);

        if (newly) {
            const animal = document.createElement('p');
            animal.className = 'win-animal';
            animal.textContent = `${a.name_zh} · ${a.name_en}`;
            card.appendChild(animal);
        }

        const time = document.createElement('p');
        time.className = 'win-time';
        time.textContent = `用時 ${formatTime(timeMs)} · ${LABELS[st.difficulty]}`;
        card.appendChild(time);

        const actions = document.createElement('div');
        actions.className = 'win-actions';
        actions.append(
            actionButton('再一局', true, () => { hideOverlay(); startGame(st.difficulty); }),
            actionButton(newly ? '看看新動物' : '動物圖鑑', false, () => { hideOverlay(); openEncyclopedia(); }),
            actionButton('回選單', false, () => { hideOverlay(); renderMenu(); show('menu'); })
        );
        card.appendChild(actions);

        overlay.appendChild(card);
        overlay.classList.remove('hidden');
    }

    function actionButton(label, primary, onClick) {
        const b = document.createElement('button');
        b.className = 'btn' + (primary ? ' primary' : '');
        b.textContent = label;
        b.addEventListener('click', onClick);
        return b;
    }

    function hideOverlay() {
        overlay.classList.add('hidden');
        overlay.innerHTML = '';
    }

    function startTimer(elapsedMs = 0) {
        startedAt = Date.now() - elapsedMs;
        timerId = setInterval(() => {
            if (storage.loadSettings().showTimer) {
                gameUi.timer.textContent = formatTime(Date.now() - startedAt);
            } else {
                gameUi.timer.textContent = '';
            }
        }, 500);
    }
    function stopTimer() {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }

    function startGame(difficulty) {
        const id = Math.random().toString(36).slice(2);
        const mascotId = animalsApi.nextMascot(storage.loadCollection().unlocked, Math.random);
        const onMsg = (e) => {
            if (e.data.type !== 'puzzle' || e.data.id !== id) return;
            worker.removeEventListener('message', onMsg);
            worker.removeEventListener('error', onError);
            solution = e.data.solution;
            game = createGame({
                puzzle: e.data.puzzle,
                solution,
                difficulty: e.data.difficulty,
                animalId: mascotId,
            });
            buildGameUi(mascotId, e.data.difficulty);
            renderGame();
            startTimer();
            show('game');
        };
        const onError = () => {
            worker.removeEventListener('message', onMsg);
            worker.removeEventListener('error', onError);
            renderMenu();
            show('menu');
        };
        worker.addEventListener('message', onMsg);
        worker.addEventListener('error', onError);
        worker.postMessage({ type: 'generate', difficulty, id });
        show('game');
        screens.game.innerHTML = '<p class="loading">產生題目中…</p>';
    }

    function openEncyclopedia() {
        encyclopedia.render(storage.loadCollection().unlocked);
        show('encyclopedia');
    }

    // Resume an in-progress game if present.
    const saved = storage.loadSaved();
    renderMenu();
    show('menu');
    if (saved) {
        solution = saved.solution;
        // saved.given already holds only the original clue digits (0 elsewhere),
        // so it can be used directly as the puzzle mask. Using saved.values here
        // instead would bake every filled-in cell into the "given" mask and
        // permanently lock it against further edits after a reload.
        game = createGame({
            puzzle: saved.given.slice(),
            solution,
            difficulty: saved.difficulty,
            animalId: saved.animalId,
        });
        buildGameUi(saved.animalId, saved.difficulty);
        const st = game.state();
        for (let i = 0; i < 81; i++) {
            if (st.given[i]) continue;
            if (saved.values[i]) {
                game.select(i);
                game.input(saved.values[i]);
            } else if (saved.notes[i] && saved.notes[i].length > 0) {
                game.select(i);
                for (const n of saved.notes[i]) game.toggleNote(n);
            }
        }
        game.select(-1);
        renderGame();
        startTimer(saved.elapsed || 0);
        show('game');
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }
}

main();
