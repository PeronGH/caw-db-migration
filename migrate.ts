import $ from "dax";
import "std/dotenv/load.ts";

const initialStage = await $.select({
  message: "Initial Stage:",
  options: [
    "dump data from redis",
    "filter invalid data",
    "convert and save as csv",
    "import to database",
  ],
  initialIndex: 0,
});

switch (initialStage) {
  case 0:
    await import("./src/dump.ts");
    // fallthrough
  case 1:
    await import("./src/filter.ts");
    // fallthrough
  case 2:
    await import("./src/convert.ts");
    // fallthrough
  case 3:
    await import("./src/save_to_db.ts");
}
