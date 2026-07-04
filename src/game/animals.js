/**
 * Load an animal encyclopedia dataset and expose lookup/query helpers.
 *
 * @param {Array<object>} json - Parsed animals.json array of animal records.
 * @returns {{
 *   list: Array<object>,
 *   byId: (id: string) => object | undefined,
 *   nextMascot: (unlockedIds: string[], rng: () => number) => string,
 * }} Query interface over the animal dataset.
 */
export function loadAnimals(json) {
    const list = json;
    const index = new Map(list.map((animal) => [animal.id, animal]));

    /**
     * Pick the next mascot to reveal, preferring animals not yet unlocked.
     *
     * @param {string[]} unlockedIds - Ids already unlocked by the player.
     * @param {() => number} rng - Random number generator returning [0, 1).
     * @returns {string} The chosen animal id.
     */
    function nextMascot(unlockedIds, rng) {
        const unlocked = new Set(unlockedIds);
        const unseen = list.filter((animal) => !unlocked.has(animal.id));
        const pool = unseen.length > 0 ? unseen : list;
        return pool[Math.floor(rng() * pool.length)].id;
    }

    return {
        list,
        byId: (id) => index.get(id),
        nextMascot,
    };
}
