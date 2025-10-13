import tsj from "ts-json-schema-generator";
import fs from "fs";

const config = {
  path: "../data/schema.ts",
  tsconfig: "../../tsconfig.json",
  type: "ControlPanelContent"
};

const outputPath = "../data/schema.json";

const schema = tsj.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, null, 2);
fs.writeFile(outputPath, schemaString, (err) => {
  if (err) throw err;
});
console.log(`Wrote new schema to ${outputPath}`);