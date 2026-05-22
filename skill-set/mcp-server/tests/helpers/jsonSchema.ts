import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const packageRoot = path.resolve(".");
const schemasDir = path.join(packageRoot, "schemas");

function getAjv(): Ajv {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateSchema: false,
  });
  addFormats(ajv);

  for (const name of fs.readdirSync(schemasDir)) {
    if (!name.endsWith(".schema.json")) continue;
    const filePath = path.join(schemasDir, name);
    const schema = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
      string,
      unknown
    >;
    const id =
      (schema.$id as string | undefined) ??
      `https://skill-lab.local/schemas/${name.replace(/\.schema\.json$/, ".json")}`;
    ajv.addSchema(schema, id);
    ajv.addSchema(schema, name);
    const base = id.replace(/\/[^/]+$/, "/");
    ajv.addSchema(schema, `${base}${name}`);
  }
  return ajv;
}

export function validateAgainstJsonSchema(
  schemaFileName: string,
  payload: unknown,
): void {
  const ajv = getAjv();
  const filePath = path.join(schemasDir, schemaFileName);
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;
  const id =
    (schema.$id as string | undefined) ??
    `https://skill-lab.local/schemas/${schemaFileName.replace(/\.schema\.json$/, ".json")}`;
  const validate = ajv.getSchema(id) ?? ajv.compile(schema);
  const ok = validate(payload);
  if (!ok) {
    throw new Error(
      `${schemaFileName}: ${ajv.errorsText(validate.errors, { separator: "; " })}`,
    );
  }
}

export function readJsonSchema(schemaFileName: string): Record<string, unknown> {
  return JSON.parse(
    fs.readFileSync(path.join(schemasDir, schemaFileName), "utf8"),
  ) as Record<string, unknown>;
}
