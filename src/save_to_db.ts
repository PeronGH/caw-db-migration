import { DUMP_PATH } from "./utils.ts";
import $ from "dax";

const DATABASE_URL = Deno.env.get("DATABASE_URL") ??
  await $.prompt("DATABASE_URL:");

interface ImportCommandParams {
  filename: string;
  table: string;
}

function importCsvCommandFor(
  { filename, table }: { filename: string; table: string },
) {
  const csvPath = `${DUMP_PATH}/${filename}.csv`;

  return `\\copy "${table}" FROM '${csvPath}' DELIMITER ',' CSV HEADER;`;
}

const params: ImportCommandParams[] = [
  { filename: "models", table: "Model" },
  { filename: "categories", table: "Category" },
  { filename: "products", table: "Product" },
  { filename: "modelInProducts", table: "ModelInProduct" },
  { filename: "users", table: "User" },
  { filename: "orders", table: "Order" },
];

const commands = params.map(importCsvCommandFor);

const commandText = commands.join("\n");

await $`psql ${DATABASE_URL}`.stdin(new TextEncoder().encode(commandText));
