import { writeFileSync } from "fs";
import { BOOKABLE_SERVICES } from "../src/lib/services";

writeFileSync("data/services.json", JSON.stringify(BOOKABLE_SERVICES, null, 2), "utf8");
console.log("Wrote data/services.json", BOOKABLE_SERVICES.length, "services");
