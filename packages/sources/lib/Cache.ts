import type { Game } from '@owenii/types';
import sources from './sources';

export async function saveAndFetchItems<
    S extends keyof typeof sources = keyof typeof sources
>(
    gameSlug: string,
    sourceSlug: S,
    sourceOptions: Record<keyof typeof sources[S]['props'], unknown>
) {
    const { existsSync, mkdirSync, writeFileSync } = require('node:fs');
    const { dirname, resolve } = require('node:path');

    const path = resolve('data', `${gameSlug}.json`);
    mkdirSync(dirname(path), { recursive: true });
    if (existsSync(path)) return loadItems(gameSlug);

    const source = sources[sourceSlug];
    if (!source) throw new Error(`Source "${sourceSlug}" not found.`);

    const options = source.prepareOptions(sourceOptions);
    const fetcher = Reflect.get(source, 'fetchItems') as Function;
    const items = await fetcher.bind(source)(options);

    const data = JSON.stringify(items, null, 4);
    writeFileSync(path, data, 'utf8');
    return loadItems(gameSlug);
}

export function loadItems<T extends Game.Mode = Game.Mode>(gameSlug: string) {
    const { existsSync, readFileSync } = require('node:fs');
    const { resolve } = require('node:path');

    const path = resolve('data', `${gameSlug}.json`);
    if (!existsSync(path)) return [];

    const data = readFileSync(path, 'utf8');
    const items = JSON.parse(data);
    return items as Game.Item<T>[];
}
