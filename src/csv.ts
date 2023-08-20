import { encodeArgument } from "postgres/query/encode.ts";
import { DataItem, stringify } from "std/csv/stringify.ts";
import { DUMP_PATH } from "./utils.ts";

export function stringifyCsv(data: DataItem[]): string {
  return stringify(
    data.map((d) => {
      const entries = Object.entries(d);
      for (const entry of entries) {
        entry[1] = encodeArgument(entry[1]);
      }
      return Object.fromEntries(entries);
    }),
    { columns: Object.keys(data[0]) },
  );
}

export async function saveCsv(name: string, data: DataItem[]) {
  await Deno.mkdir(DUMP_PATH).catch(() => {});
  const csv = stringifyCsv(data);

  console.debug(`csv: saving ${name}.csv...`);
  await Deno.writeTextFile(`${DUMP_PATH}/${name}.csv`, csv);
}
