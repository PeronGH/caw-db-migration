import { KvEntry } from "./types.ts";
import { DUMP_PATH } from "./utils.ts";

export async function saveJson(name: string, obj: unknown) {
  await Deno.mkdir(DUMP_PATH).catch(() => {});
  const json = JSON.stringify(obj, null, 2);

  console.debug(`json: saving ${name}.json...`);
  await Deno.writeTextFile(`${DUMP_PATH}/${name}.json`, json);
}

export async function loadJson<V = unknown>(
  name: string,
): Promise<KvEntry<V>[]> {
  console.debug(`json: loading ${name}.json...`);
  const json = await Deno.readTextFile(`${DUMP_PATH}/${name}.json`);
  return JSON.parse(json);
}
