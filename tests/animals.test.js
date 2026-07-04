import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadAnimals } from '../src/game/animals.js';

const REGIONS = new Set([
    'north-america', 'central-america', 'south-america', 'north-africa',
    'sub-saharan-africa', 'southern-africa', 'europe', 'middle-east',
    'central-asia', 'south-asia', 'east-asia', 'southeast-asia', 'siberia',
    'australia', 'oceania', 'arctic', 'antarctica', 'oceans',
]);

const json = JSON.parse(
    readFileSync(fileURLToPath(new URL('../src/data/animals.json', import.meta.url)), 'utf8')
);

test('at least 60 animals, all fields present, unique ids, valid regions', () => {
    assert.ok(json.length >= 60, `expected >=60, got ${json.length}`);
    const ids = new Set();
    for (const a of json) {
        for (const f of ['id', 'name_zh', 'name_en', 'scientific', 'emoji', 'habitat_zh', 'biome']) {
            assert.ok(a[f], `${a.id} missing ${f}`);
        }
        assert.ok(!ids.has(a.id), `duplicate id ${a.id}`);
        ids.add(a.id);
        assert.ok(Array.isArray(a.regions) && a.regions.length > 0, `${a.id} has no regions`);
        for (const r of a.regions) assert.ok(REGIONS.has(r), `${a.id} bad region ${r}`);
    }
});

test('nextMascot prefers unseen animals then falls back to random', () => {
    const { list, byId, nextMascot } = loadAnimals(json);
    assert.ok(list.length >= 60);
    assert.equal(byId(list[0].id).id, list[0].id);
    const unlocked = list.slice(0, list.length - 1).map((a) => a.id);
    const rng = () => 0;
    assert.equal(nextMascot(unlocked, rng), list[list.length - 1].id); // the only unseen one
    const all = list.map((a) => a.id);
    assert.ok(all.includes(nextMascot(all, rng))); // all seen -> still returns a valid id
});
